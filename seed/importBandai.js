// ============================================
// IMPORTAR cartas descargadas de Bandai
// Combina los datos del navegador con los datos de GitHub/apitcg
//
// Uso: node seed/importBandai.js
// Requisito: haber descargado bandai_all_cards.json
//            (ejecutando el script del navegador)
// ============================================
const fs = require('fs');
const path = require('path');

const BANDAI_FILE = path.join(__dirname, 'bandai_all_cards.json');
const EXISTING_FILE = path.join(__dirname, 'cards_data.json');
const OUTPUT_FILE = path.join(__dirname, 'cards_data.json');

const BASE_IMG = 'https://www.dbs-cardgame.com/fw/images/cards/card/en';

// Mapa de set_code → set_id
const SET_MAP = {
  'FB01': { id: 'fb01', name: 'Awakened Pulse', type: 'booster', release_date: '2024-02-09' },
  'FB02': { id: 'fb02', name: 'Blazing Aura', type: 'booster', release_date: '2024-05-10' },
  'FB03': { id: 'fb03', name: 'Raging Roar', type: 'booster', release_date: '2024-08-09' },
  'FB04': { id: 'fb04', name: 'Ultra Limit', type: 'booster', release_date: '2024-11-08' },
  'FB05': { id: 'fb05', name: 'New Adventure', type: 'booster', release_date: '2025-02-07' },
  'FB06': { id: 'fb06', name: 'Rivals Clash', type: 'booster', release_date: '2025-05-09' },
  'FB07': { id: 'fb07', name: 'Wish for Shenron', type: 'booster', release_date: '2025-08-08' },
  'FB08': { id: 'fb08', name: "Saiyan's Pride", type: 'booster', release_date: '2025-11-07' },
  'FB09': { id: 'fb09', name: 'Dual Evolution', type: 'booster', release_date: '2026-02-06' },
  'SB01': { id: 'sb01', name: 'Manga Booster 01', type: 'booster', release_date: '2025-06-13' },
  'SB02': { id: 'sb02', name: 'Manga Booster 02', type: 'booster', release_date: '2025-09-12' },
  'FS01': { id: 'fs01', name: 'Son Goku', type: 'starter', release_date: '2024-02-09' },
  'FS02': { id: 'fs02', name: 'Vegeta', type: 'starter', release_date: '2024-02-09' },
  'FS03': { id: 'fs03', name: 'Broly', type: 'starter', release_date: '2024-02-09' },
  'FS04': { id: 'fs04', name: 'Frieza', type: 'starter', release_date: '2024-02-09' },
  'FS05': { id: 'fs05', name: 'Bardock', type: 'starter', release_date: '2024-05-10' },
  'FS06': { id: 'fs06', name: 'Son Goku (Mini)', type: 'starter', release_date: '2024-08-09' },
  'FS07': { id: 'fs07', name: 'Vegeta (Mini)', type: 'starter', release_date: '2024-08-09' },
  'FS08': { id: 'fs08', name: 'Vegeta Super Saiyan 3', type: 'starter', release_date: '2025-02-07' },
  'FS09': { id: 'fs09', name: 'Shallot', type: 'starter', release_date: '2025-05-09' },
  'FS10': { id: 'fs10', name: 'Giblet', type: 'starter', release_date: '2025-05-09' },
  'FS11': { id: 'fs11', name: 'The Phase of Evolution', type: 'starter', release_date: '2025-11-07' },
  'FS12': { id: 'fs12', name: 'The Beat of Ki', type: 'starter', release_date: '2025-11-07' },
  'PR': { id: 'promo', name: 'Promotion Cards', type: 'promo', release_date: null },
  'RE': { id: 'release-event', name: 'Release Event Pack', type: 'promo', release_date: null },
};

function getSetId(code) {
  if (!code) return 'unknown';

  // Extraer prefijo del código de carta (ej: FB01 de FB01-001)
  const match = code.match(/^([A-Z]{2,3}\d{2})/);
  if (match) {
    const prefix = match[1];
    const setInfo = SET_MAP[prefix];
    if (setInfo) return setInfo.id;
    return prefix.toLowerCase();
  }

  // Para promos con formato P-001
  if (code.startsWith('P-')) return 'promo';

  return 'unknown';
}

function main() {
  console.log('🐉 Importando cartas de Bandai...\n');

  // 1. Cargar datos existentes (de GitHub/apitcg)
  let existingData = { sets: [], cards: [] };
  if (fs.existsSync(EXISTING_FILE)) {
    existingData = JSON.parse(fs.readFileSync(EXISTING_FILE, 'utf8'));
    console.log(`📂 Datos existentes: ${existingData.cards.length} cartas, ${existingData.sets.length} sets`);
  }

  // 2. Cargar datos de Bandai (del navegador)
  if (!fs.existsSync(BANDAI_FILE)) {
    console.error('❌ No se encontró bandai_all_cards.json');
    console.error('   Ejecuta primero el script del navegador en la web de Bandai.');
    console.error('   Ver instrucciones en: seed/scrapeFromBrowser.js');
    process.exit(1);
  }

  const bandaiCards = JSON.parse(fs.readFileSync(BANDAI_FILE, 'utf8'));
  console.log(`📂 Datos de Bandai: ${bandaiCards.length} cartas\n`);

  // 3. Crear mapa de cartas existentes (para enriquecer con datos completos)
  const existingMap = new Map();
  for (const card of existingData.cards) {
    existingMap.set(card.id, card);
  }

  // 4. Procesar cartas de Bandai
  const allCardsMap = new Map();

  // Primero añadir todas las existentes (tienen datos completos)
  for (const card of existingData.cards) {
    allCardsMap.set(card.id, card);
  }

  // Luego añadir/actualizar con datos de Bandai
  let newCards = 0;
  let updatedCards = 0;

  for (const bCard of bandaiCards) {
    const cardId = bCard.id || bCard.code;
    if (!cardId) continue;

    const setId = bCard.set_code ? (SET_MAP[bCard.set_code]?.id || getSetId(cardId)) : getSetId(cardId);

    if (allCardsMap.has(cardId)) {
      // Ya existe - actualizar solo lo que falta
      const existing = allCardsMap.get(cardId);

      // Actualizar imagen si la existente no tiene o tiene noimage
      if (bCard.image_url && (!existing.image_url || existing.image_url.includes('noimage'))) {
        existing.image_url = bCard.image_url;
        updatedCards++;
      }

      // Actualizar datos que vengan del scraping del navegador
      if (bCard.card_type && !existing.card_type) existing.card_type = bCard.card_type;
      if (bCard.color && !existing.color) existing.color = bCard.color;
      if (bCard.rarity && !existing.rarity) existing.rarity = bCard.rarity;
      if (bCard.power && !existing.power) existing.power = bCard.power;
      if (bCard.cost && !existing.cost) existing.cost = bCard.cost;

    } else {
      // Carta nueva de Bandai que no teníamos
      const newCard = {
        id: cardId,
        code: cardId,
        name: bCard.name || 'Unknown',
        card_type: bCard.card_type || 'BATTLE',
        color: bCard.color || 'Red',
        rarity: bCard.rarity || 'C',
        cost: bCard.cost || '-',
        specified_cost: bCard.specified_cost || '-',
        power: bCard.power || '-',
        combo_power: bCard.combo_power || '-',
        features: bCard.features || null,
        effect: bCard.effect || null,
        image_url: bCard.image_url || `${BASE_IMG}/${cardId}.webp`,
        set_id: setId
      };

      allCardsMap.set(cardId, newCard);
      newCards++;
    }
  }

  // 5. Construir sets completos
  const allSets = [...Object.values(SET_MAP).map(s => ({
    id: s.id, name: s.name, code: Object.keys(SET_MAP).find(k => SET_MAP[k].id === s.id),
    type: s.type, release_date: s.release_date
  }))];

  // Añadir sets descubiertos en las cartas
  const knownSetIds = new Set(allSets.map(s => s.id));
  for (const card of allCardsMap.values()) {
    if (card.set_id && !knownSetIds.has(card.set_id)) {
      allSets.push({
        id: card.set_id, name: card.set_id.toUpperCase(),
        code: card.set_id.toUpperCase(), type: 'promo', release_date: null
      });
      knownSetIds.add(card.set_id);
    }
  }

  // 6. Guardar
  const allCards = Array.from(allCardsMap.values()).sort((a, b) => a.id.localeCompare(b.id));
  const output = { sets: allSets, cards: allCards };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  // 7. Stats
  const setCount = {};
  for (const c of allCards) {
    setCount[c.set_id] = (setCount[c.set_id] || 0) + 1;
  }

  console.log('\n🎉 ============================================');
  console.log('   IMPORTACIÓN COMPLETADA');
  console.log('   ============================================');
  console.log(`\n   🃏 Total cartas: ${allCards.length}`);
  console.log(`   🆕 Cartas nuevas de Bandai: ${newCards}`);
  console.log(`   🔄 Cartas actualizadas: ${updatedCards}`);
  console.log(`   📦 Total sets: ${allSets.length}`);
  console.log('\n   Cartas por set:');
  Object.entries(setCount).sort((a, b) => a[0].localeCompare(b[0])).forEach(([set, count]) => {
    console.log(`      ${set.padEnd(15)} → ${count} cartas`);
  });
  console.log('\n   ✅ Ahora ejecuta: npm run seed:local');
  console.log('   ✅ Y luego: npm run dev\n');
}

main();
