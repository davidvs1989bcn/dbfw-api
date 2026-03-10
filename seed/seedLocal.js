// ============================================
// Script de seed LOCAL: lee cartas desde cards_data.json
// No necesita conexión a internet
//
// Uso: node seed/seedLocal.js
// Requisito: haber ejecutado antes npm run seed:db
// ============================================
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedLocal() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbfw_api'
  });

  try {
    // Leer JSON local
    const dataPath = path.join(__dirname, 'cards_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    // 1. Insertar sets
    console.log('⏳ Insertando sets...');
    let setsInserted = 0;
    for (const set of data.sets) {
      const [result] = await connection.query(
        `INSERT IGNORE INTO sets (id, name, code, type, release_date)
         VALUES (?, ?, ?, ?, ?)`,
        [set.id, set.name, set.code, set.type, set.release_date]
      );
      if (result.affectedRows > 0) setsInserted++;
    }
    console.log(`✅ ${setsInserted} sets nuevos insertados (${data.sets.length} total)`);

    // 2. Descubrir sets adicionales de las cartas y crearlos
    const knownSetIds = new Set(data.sets.map(s => s.id));
    const cardSetIds = new Set(data.cards.map(c => c.set_id).filter(Boolean));
    for (const sid of cardSetIds) {
      if (!knownSetIds.has(sid)) {
        await connection.query(
          `INSERT IGNORE INTO sets (id, name, code, type) VALUES (?, ?, ?, 'promo')`,
          [sid, sid.toUpperCase(), sid.toUpperCase()]
        );
      }
    }

    // 3. Insertar cartas
    console.log('\n⏳ Insertando cartas...');
    let cardsInserted = 0;
    let cardsSkipped = 0;

    for (const card of data.cards) {
      try {
        const [result] = await connection.query(
          `INSERT IGNORE INTO cards (id, code, name, card_type, color, rarity, cost,
           specified_cost, power, combo_power, features, effect, image_url, set_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            card.id, card.code, card.name, card.card_type, card.color, card.rarity,
            card.cost || '-', card.specified_cost || '-', card.power || '-',
            card.combo_power || '-', card.features || null, card.effect || null,
            card.image_url || null, card.set_id
          ]
        );
        if (result.affectedRows > 0) {
          cardsInserted++;
        } else {
          cardsSkipped++;
        }
      } catch (err) {
        console.log(`   ⚠️  Error con ${card.id}: ${err.message}`);
      }
    }

    console.log(`✅ ${cardsInserted} cartas nuevas insertadas`);
    if (cardsSkipped > 0) {
      console.log(`ℹ️  ${cardsSkipped} cartas ya existían (saltadas)`);
    }

    // 4. Actualizar contadores de sets
    await connection.query(
      `UPDATE sets s SET total_cards = (
        SELECT COUNT(*) FROM cards c WHERE c.set_id = s.id
      )`
    );
    console.log('✅ Contadores de sets actualizados');

    // 5. Resumen
    const [totalCards] = await connection.query('SELECT COUNT(*) as total FROM cards');
    const [totalSets] = await connection.query('SELECT COUNT(*) as total FROM sets');
    console.log(`\n🎉 Seed completado!`);
    console.log(`   📦 ${totalSets[0].total} sets en la BD`);
    console.log(`   🃏 ${totalCards[0].total} cartas en la BD`);

  } catch (error) {
    console.error('❌ Error en seed:', error.message);
  } finally {
    await connection.end();
  }
}

seedLocal();
