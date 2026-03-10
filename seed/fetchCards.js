// ============================================
// Script de seed: descarga cartas de apitcg.com
// y las inserta en la base de datos MySQL
//
// Uso: node seed/fetchCards.js
// Requisito: haber ejecutado antes npm run seed:db
// ============================================
const mysql = require('mysql2/promise');
require('dotenv').config();

// Datos de los sets oficiales (hasta FB09)
const SETS = [
  { id: 'fb01', name: 'Awakened Pulse', code: 'FB01', type: 'booster', release_date: '2024-02-09' },
  { id: 'fb02', name: 'Blazing Aura', code: 'FB02', type: 'booster', release_date: '2024-05-10' },
  { id: 'fb03', name: 'Raging Roar', code: 'FB03', type: 'booster', release_date: '2024-08-09' },
  { id: 'fb04', name: 'Ultra Limit', code: 'FB04', type: 'booster', release_date: '2024-11-08' },
  { id: 'fb05', name: 'New Adventure', code: 'FB05', type: 'booster', release_date: '2025-02-07' },
  { id: 'fb06', name: 'Rivals Clash', code: 'FB06', type: 'booster', release_date: '2025-05-09' },
  { id: 'fb07', name: 'Wish for Shenron', code: 'FB07', type: 'booster', release_date: '2025-08-08' },
  { id: 'fb08', name: "Saiyan's Pride", code: 'FB08', type: 'booster', release_date: '2025-11-07' },
  { id: 'fb09', name: 'Dual Evolution', code: 'FB09', type: 'booster', release_date: '2026-02-06' },
  { id: 'sb01', name: 'Manga Booster 01', code: 'SB01', type: 'booster', release_date: '2025-06-13' },
  { id: 'sb02', name: 'Manga Booster 02', code: 'SB02', type: 'booster', release_date: '2025-09-12' },
  { id: 'fs01', name: 'Son Goku', code: 'FS01', type: 'starter', release_date: '2024-02-09' },
  { id: 'fs02', name: 'Vegeta', code: 'FS02', type: 'starter', release_date: '2024-02-09' },
  { id: 'fs03', name: 'Broly', code: 'FS03', type: 'starter', release_date: '2024-02-09' },
  { id: 'fs04', name: 'Frieza', code: 'FS04', type: 'starter', release_date: '2024-02-09' },
  { id: 'fs05', name: 'Bardock', code: 'FS05', type: 'starter', release_date: '2024-05-10' },
  { id: 'fs06', name: 'Son Goku (Mini)', code: 'FS06', type: 'starter', release_date: '2024-08-09' },
  { id: 'fs07', name: 'Vegeta (Mini)', code: 'FS07', type: 'starter', release_date: '2024-08-09' },
  { id: 'fs08', name: 'Vegeta Super Saiyan 3', code: 'FS08', type: 'starter', release_date: '2025-02-07' },
  { id: 'fs09', name: 'Shallot', code: 'FS09', type: 'starter', release_date: '2025-05-09' },
  { id: 'fs10', name: 'Giblet', code: 'FS10', type: 'starter', release_date: '2025-05-09' },
  { id: 'fs11', name: 'The Phase of Evolution', code: 'FS11', type: 'starter', release_date: '2025-11-07' },
  { id: 'fs12', name: 'The Beat of Ki', code: 'FS12', type: 'starter', release_date: '2025-11-07' },
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbfw_api'
  });

  try {
    // 1. Insertar sets
    console.log('⏳ Insertando sets...');
    for (const set of SETS) {
      await connection.query(
        `INSERT IGNORE INTO sets (id, name, code, type, release_date)
         VALUES (?, ?, ?, ?, ?)`,
        [set.id, set.name, set.code, set.type, set.release_date]
      );
    }
    console.log(`✅ ${SETS.length} sets insertados`);

    // 2. Fetch cartas desde apitcg.com (con reintentos)
    console.log('\n⏳ Descargando cartas de apitcg.com...');

    const MAX_RETRIES = 3;
    const DELAY_MS = 2000; // 2 segundos entre páginas para no saturar

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (err) {
          console.log(`   ⚠️  Intento ${i + 1}/${retries} fallido: ${err.message}`);
          if (i < retries - 1) {
            console.log(`   ⏳ Esperando ${DELAY_MS * (i + 1)}ms antes de reintentar...`);
            await sleep(DELAY_MS * (i + 1));
          } else {
            throw err;
          }
        }
      }
    };

    let page = 1;
    let totalInserted = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://apitcg.com/api/dragon-ball-fusion/cards?page=${page}&limit=50`;
      console.log(`   Página ${page}...`);

      let json;
      try {
        json = await fetchWithRetry(url);
      } catch (err) {
        console.log(`\n❌ No se pudo conectar a apitcg.com después de ${MAX_RETRIES} intentos.`);
        console.log('💡 Usa "npm run seed:local" para cargar cartas desde el JSON local.');
        break;
      }

      // Pausa entre páginas para no saturar la API
      await sleep(DELAY_MS);

      if (!json.data || json.data.length === 0) {
        hasMore = false;
        break;
      }

      for (const card of json.data) {
        // Determinar el set_id
        let setId = null;
        if (card.set && card.set.id) {
          setId = card.set.id.toLowerCase();
        } else {
          // Intentar extraer del code (ej: FB01-001 -> fb01)
          const match = card.code.match(/^([A-Z]{2}\d{2})/);
          if (match) setId = match[1].toLowerCase();
        }

        // Si el set no existe en nuestra lista, crearlo como 'promo'
        if (setId) {
          await connection.query(
            `INSERT IGNORE INTO sets (id, name, code, type)
             VALUES (?, ?, ?, 'promo')`,
            [setId, card.set?.name || setId.toUpperCase(), setId.toUpperCase()]
          );
        }

        // Mapear cardType
        let cardType = card.cardType || 'BATTLE';
        if (!['LEADER', 'BATTLE', 'EXTRA', 'ENERGY MARKER'].includes(cardType)) {
          cardType = 'BATTLE';
        }

        // Mapear color
        let color = card.color || 'Red';
        if (!['Red', 'Blue', 'Green', 'Yellow', 'Black'].includes(color)) {
          color = 'Red';
        }

        // Mapear rarity
        let rarity = card.rarity || 'C';
        if (!['L', 'C', 'UC', 'R', 'SR', 'SCR', 'PR'].includes(rarity)) {
          rarity = 'C';
        }

        const imageUrl = card.images?.large || card.images?.small || null;

        try {
          await connection.query(
            `INSERT IGNORE INTO cards (id, code, name, card_type, color, rarity, cost,
             specified_cost, power, combo_power, features, effect, image_url, set_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              card.id, card.code, card.name, cardType, color, rarity,
              card.cost || '-', card.specifiedCost || '-',
              card.power || '-', card.comboPower || '-',
              card.features || null, card.effect || null,
              imageUrl, setId || 'fb01'
            ]
          );
          totalInserted++;
        } catch (err) {
          console.log(`   ⚠️  Error insertando ${card.id}: ${err.message}`);
        }
      }

      // Verificar si hay más páginas
      if (json.totalPages && page >= json.totalPages) {
        hasMore = false;
      } else if (json.data.length < 50) {
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log(`\n✅ ${totalInserted} cartas insertadas en total`);

    // 3. Actualizar contadores de sets
    await connection.query(
      `UPDATE sets s SET total_cards = (
        SELECT COUNT(*) FROM cards c WHERE c.set_id = s.id
      )`
    );
    console.log('✅ Contadores de sets actualizados');

    console.log('\n🎉 Seed completado con éxito!');

  } catch (error) {
    console.error('❌ Error en seed:', error.message);
  } finally {
    await connection.end();
  }
}

seed();
