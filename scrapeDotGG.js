// ============================================
// SCRAPER DEFINITIVO - DotGG API (dragonball.gg)
// Descarga TODAS las cartas con datos COMPLETOS
//
// Uso: node seed/scrapeDotGG.js
// Después: npm run seed:local && npm run dev
// ============================================
const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.dotgg.gg/cgfw/getcards?game=dragonball&mode=indexed&cache=8011';

const SET_MAP = {
  '583001': { id: 'fb01', name: 'Awakened Pulse', code: 'FB01', type: 'booster', release_date: '2024-02-09' },
  '583002': { id: 'fb02', name: 'Blazing Aura', code: 'FB02', type: 'booster', release_date: '2024-05-10' },
  '583003': { id: 'fb03', name: 'Raging Roar', code: 'FB03', type: 'booster', release_date: '2024-08-09' },
  '583004': { id: 'fb04', name: 'Ultra Limit', code: 'FB04', type: 'booster', release_date: '2024-11-08' },
  '583005': { id: 'fb05', name: 'New Adventure', code: 'FB05', type: 'booster', release_date: '2025-02-07' },
  '583006': { id: 'fb06', name: 'Rivals Clash', code: 'FB06', type: 'booster', release_date: '2025-05-09' },
  '583007': { id: 'fb07', name: 'Wish for Shenron', code: 'FB07', type: 'booster', release_date: '2025-08-08' },
  '583008': { id: 'fb08', name: "Saiyan's Pride", code: 'FB08', type: 'booster', release_date: '2025-11-07' },
  '583009': { id: 'fb09', name: 'Dual Evolution', code: 'FB09', type: 'booster', release_date: '2026-02-06' },
  '583201': { id: 'sb01', name: 'Manga Booster 01', code: 'SB01', type: 'booster', release_date: '2025-06-13' },
  '583202': { id: 'sb02', name: 'Manga Booster 02', code: 'SB02', type: 'booster', release_date: '2025-09-12' },
  '583101': { id: 'fs01', name: 'Son Goku', code: 'FS01', type: 'starter', release_date: '2024-02-09' },
  '583102': { id: 'fs02', name: 'Vegeta', code: 'FS02', type: 'starter', release_date: '2024-02-09' },
  '583103': { id: 'fs03', name: 'Broly', code: 'FS03', type: 'starter', release_date: '2024-02-09' },
  '583104': { id: 'fs04', name: 'Frieza', code: 'FS04', type: 'starter', release_date: '2024-02-09' },
  '583105': { id: 'fs05', name: 'Bardock', code: 'FS05', type: 'starter', release_date: '2024-05-10' },
  '583106': { id: 'fs06', name: 'Son Goku (Mini)', code: 'FS06', type: 'starter', release_date: '2024-08-09' },
  '583107': { id: 'fs07', name: 'Vegeta (Mini)', code: 'FS07', type: 'starter', release_date: '2024-08-09' },
  '583108': { id: 'fs08', name: 'Vegeta Super Saiyan 3', code: 'FS08', type: 'starter', release_date: '2025-02-07' },
  '583109': { id: 'fs09', name: 'Shallot', code: 'FS09', type: 'starter', release_date: '2025-05-09' },
  '583110': { id: 'fs10', name: 'Giblet', code: 'FS10', type: 'starter', release_date: '2025-05-09' },
  '583111': { id: 'fs11', name: 'The Phase of Evolution', code: 'FS11', type: 'starter', release_date: '2025-11-07' },
  '583112': { id: 'fs12', name: 'The Beat of Ki', code: 'FS12', type: 'starter', release_date: '2025-11-07' },
  '583901': { id: 'championship', name: 'Championship Pack', code: 'CP', type: 'promo', release_date: null },
  '583902': { id: 'release-event', name: 'Release Event Pack', code: 'RE', type: 'promo', release_date: null },
  '583903': { id: 'promo', name: 'Promotion Card', code: 'PR', type: 'promo', release_date: null },
};

function resolveSetId(dotggSetId, whereToGet) {
  if (SET_MAP[dotggSetId]) return SET_MAP[dotggSetId].id;
  if (whereToGet) {
    const m = whereToGet.match(/\[(F[BS]\d{2})\]/);
    if (m) return m[1].toLowerCase();
    if (whereToGet.includes('Championship')) return 'championship';
    if (whereToGet.includes('Release Event')) return 'release-event';
    if (whereToGet.includes('Promotion') || whereToGet.includes('Promo')) return 'promo';
  }
  return dotggSetId || 'unknown';
}

async function main() {
  console.log('🐉 ============================================');
  console.log('   DRAGON BALL FUSION WORLD - SCRAPER DOTGG');
  console.log('   Base de datos COMPLETA de dragonball.gg');
  console.log('   ============================================\n');

  console.log('⏳ Descargando de DotGG API...');
  var response;
  try {
    response = await fetch(API_URL);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }

  if (!response.ok) {
    console.error('❌ HTTP Error: ' + response.status);
    process.exit(1);
  }

  var rawData = await response.json();
  console.log('✅ Recibido: ' + rawData.names.length + ' campos, ' + rawData.data.length + ' entradas');

  console.log('\n⏳ Procesando cartas...');
  var fieldNames = rawData.names;
  var allRaw = rawData.data.map(function(row) {
    var obj = {};
    fieldNames.forEach(function(key, i) { obj[key] = row[i]; });
    return obj;
  });

  // Deduplicar por id_normal (carta base sin alt-art)
  var cardMap = new Map();
  var allVariants = [];

  for (var i = 0; i < allRaw.length; i++) {
    var raw = allRaw[i];
    var baseId = raw.id_normal || raw.id;
    var variantId = raw.id;

    var card = {
      id: variantId,
      code: baseId,
      name: raw.name || 'Unknown',
      card_type: (raw.cardtype || 'BATTLE').toUpperCase(),
      color: raw.color || 'Red',
      rarity: (raw.rarity || 'C').toUpperCase(),
      cost: raw.cost || '-',
      specified_cost: raw.specifiedcost || '-',
      power: raw.power || '-',
      combo_power: raw.combopower || '-',
      features: raw.features || null,
      effect: raw.effect ? raw.effect.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '') : null,
      image_url: raw.image || null,
      set_id: resolveSetId(raw.set, raw.wheretoget),
      where_to_get: raw.wheretoget || null,
      has_back: raw.hasback === '1' || raw.hasback === 1,
      image_back: raw.image_back || null,
      name_back: raw.name_back || null,
      power_back: raw.power_back || null,
      price: raw.price || null,
    };

    allVariants.push(card);

    if (!cardMap.has(baseId)) {
      cardMap.set(baseId, Object.assign({}, card, { id: baseId, code: baseId }));
    }
  }

  var uniqueCards = Array.from(cardMap.values());

  // Construir sets
  var allSets = [];
  var addedSetIds = new Set();

  Object.values(SET_MAP).forEach(function(meta) {
    if (!addedSetIds.has(meta.id)) {
      allSets.push({ id: meta.id, name: meta.name, code: meta.code, type: meta.type, release_date: meta.release_date });
      addedSetIds.add(meta.id);
    }
  });

  uniqueCards.forEach(function(card) {
    if (card.set_id && !addedSetIds.has(card.set_id)) {
      allSets.push({ id: card.set_id, name: card.set_id.toUpperCase(), code: card.set_id.toUpperCase(), type: 'promo', release_date: null });
      addedSetIds.add(card.set_id);
    }
  });

  // Guardar
  var output = {
    sets: allSets,
    cards: uniqueCards.sort(function(a, b) { return a.id.localeCompare(b.id); })
  };

  var outputPath = path.join(__dirname, 'cards_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  var variantsPath = path.join(__dirname, 'cards_all_variants.json');
  fs.writeFileSync(variantsPath, JSON.stringify(allVariants, null, 2), 'utf8');

  // Stats
  var setCount = {};
  uniqueCards.forEach(function(c) { setCount[c.set_id] = (setCount[c.set_id] || 0) + 1; });

  console.log('\n🎉 ============================================');
  console.log('   SCRAPE COMPLETADO');
  console.log('   ============================================\n');
  console.log('   📁 Catálogo base: seed/cards_data.json');
  console.log('   📁 Todas variantes: seed/cards_all_variants.json');
  console.log('   🃏 Cartas únicas (base): ' + uniqueCards.length);
  console.log('   🎴 Total variantes (incl alt-art): ' + allVariants.length);
  console.log('   📦 Total sets: ' + allSets.length);
  console.log('\n   Cartas por set:');
  Object.entries(setCount).sort().forEach(function(e) {
    console.log('      ' + e[0].padEnd(18) + ' → ' + e[1] + ' cartas');
  });

  var typeCount = {};
  uniqueCards.forEach(function(c) { typeCount[c.card_type] = (typeCount[c.card_type] || 0) + 1; });
  console.log('\n   Por tipo:');
  Object.entries(typeCount).sort(function(a, b) { return b[1] - a[1]; }).forEach(function(e) {
    console.log('      ' + e[0].padEnd(18) + ' → ' + e[1]);
  });

  var colorCount = {};
  uniqueCards.forEach(function(c) { colorCount[c.color] = (colorCount[c.color] || 0) + 1; });
  console.log('\n   Por color:');
  Object.entries(colorCount).sort(function(a, b) { return b[1] - a[1]; }).forEach(function(e) {
    console.log('      ' + e[0].padEnd(18) + ' → ' + e[1]);
  });

  console.log('\n   ✅ Ahora ejecuta:');
  console.log('      npm run seed:local');
  console.log('      npm run dev\n');
}

main().catch(function(err) {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
