// ============================================
// SCRAPER COMPLETO - Descarga TODAS las cartas
// Fuente 1: GitHub apitcg/dragon-ball-fusion-tcg-data (JSON estáticos)
// Fuente 2: apitcg.com API (fallback)
//
// Uso: node seed/scrapeAll.js
// Resultado: actualiza seed/cards_data.json con TODAS las cartas
// Después ejecutar: npm run seed:local
// ============================================
const fs = require('fs');
const path = require('path');

const DELAY_MS = 1500;
const MAX_RETRIES = 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Todos los sets conocidos (IDs para GitHub raw files)
const SET_FILES = [
  'fb01', 'fb02', 'fb03', 'fb04', 'fb05', 'fb06', 'fb07', 'fb08', 'fb09',
  'fs01', 'fs02', 'fs03', 'fs04', 'fs05', 'fs06', 'fs07', 'fs08', 'fs09', 'fs10', 'fs11', 'fs12',
  'sb01', 'sb02',
  'promo', 'release-event'
];

const SETS_META = [
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

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null; // No existe, skip
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (i < retries - 1) {
        const wait = DELAY_MS * (i + 1);
        console.log(`      ⚠️  Retry ${i + 1}/${retries}: ${err.message} (esperando ${wait}ms)`);
        await sleep(wait);
      } else {
        return null;
      }
    }
  }
  return null;
}

// Mapear carta de formato apitcg/GitHub a nuestro formato
function mapCard(raw, fallbackSetId) {
  // Determinar set_id
  let setId = fallbackSetId;
  if (raw.set && raw.set.id) {
    setId = raw.set.id.toLowerCase();
  } else if (raw.code) {
    const m = raw.code.match(/^([A-Za-z]{2}\d{2})/);
    if (m) setId = m[1].toLowerCase();
  }

  // Card type
  let cardType = raw.cardType || raw.card_type || 'BATTLE';
  if (!['LEADER', 'BATTLE', 'EXTRA', 'ENERGY MARKER'].includes(cardType)) {
    if (cardType === 'ENERGY') cardType = 'ENERGY MARKER';
    else cardType = 'BATTLE';
  }

  // Color
  let color = raw.color || 'Red';
  if (!['Red', 'Blue', 'Green', 'Yellow', 'Black'].includes(color)) {
    color = 'Red';
  }

  // Rarity
  let rarity = raw.rarity || 'C';
  if (!['L', 'C', 'UC', 'R', 'SR', 'SCR', 'PR'].includes(rarity)) {
    rarity = 'C';
  }

  // Image
  let imageUrl = null;
  if (raw.images) {
    imageUrl = raw.images.large || raw.images.small || null;
  } else if (raw.image_url) {
    imageUrl = raw.image_url;
  }

  return {
    id: raw.id || raw.code,
    code: raw.code || raw.id,
    name: raw.name || 'Unknown',
    card_type: cardType,
    color: color,
    rarity: rarity,
    cost: raw.cost || '-',
    specified_cost: raw.specifiedCost || raw.specified_cost || '-',
    power: raw.power || '-',
    combo_power: raw.comboPower || raw.combo_power || '-',
    features: raw.features || null,
    effect: (raw.effect || '').replace(/<br\s*\/?>/gi, '\n') || null,
    image_url: imageUrl,
    set_id: setId
  };
}

async function scrapeFromGitHub() {
  console.log('\n📦 FUENTE 1: GitHub apitcg/dragon-ball-fusion-tcg-data');
  console.log('   Descargando JSONs por set...\n');

  const BASE = 'https://raw.githubusercontent.com/apitcg/dragon-ball-fusion-tcg-data/main/cards/en';
  const allCards = [];

  for (const setFile of SET_FILES) {
    const url = `${BASE}/${setFile}.json`;
    process.stdout.write(`   [${setFile.toUpperCase()}] descargando... `);

    const data = await fetchWithRetry(url);
    await sleep(DELAY_MS);

    if (data && Array.isArray(data)) {
      const cards = data.map(c => mapCard(c, setFile));
      allCards.push(...cards);
      console.log(`✅ ${cards.length} cartas`);
    } else if (data && data.data && Array.isArray(data.data)) {
      const cards = data.data.map(c => mapCard(c, setFile));
      allCards.push(...cards);
      console.log(`✅ ${cards.length} cartas`);
    } else {
      console.log(`⏭️  no encontrado o vacío`);
    }
  }

  return allCards;
}

async function scrapeFromAPI() {
  console.log('\n📦 FUENTE 2: apitcg.com API');
  console.log('   Descargando página a página...\n');

  const allCards = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://apitcg.com/api/dragon-ball-fusion/cards?page=${page}&limit=50`;
    process.stdout.write(`   Página ${page}... `);

    const data = await fetchWithRetry(url);
    await sleep(DELAY_MS);

    if (!data) {
      console.log('❌ fallo');
      break;
    }

    if (data.data && data.data.length > 0) {
      const cards = data.data.map(c => mapCard(c, null));
      allCards.push(...cards);
      console.log(`✅ ${data.data.length} cartas (total: ${allCards.length})`);

      if (data.totalPages && page >= data.totalPages) {
        hasMore = false;
      } else if (data.data.length < 50) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
      console.log('fin');
    }
  }

  return allCards;
}

async function main() {
  console.log('🐉 ============================================');
  console.log('   DRAGON BALL FUSION WORLD - SCRAPER COMPLETO');
  console.log('   ============================================\n');

  let allCards = [];

  // Intentar GitHub primero (más estable)
  const ghCards = await scrapeFromGitHub();

  if (ghCards.length > 100) {
    console.log(`\n✅ GitHub: ${ghCards.length} cartas obtenidas`);
    allCards = ghCards;
  } else {
    console.log(`\n⚠️  GitHub solo devolvió ${ghCards.length} cartas, probando API...`);
    const apiCards = await scrapeFromAPI();

    if (apiCards.length > ghCards.length) {
      allCards = apiCards;
      console.log(`\n✅ API: ${apiCards.length} cartas obtenidas`);
    } else {
      allCards = ghCards;
    }
  }

  // Si API devolvió más cartas adicionales, fusionar
  if (ghCards.length > 100) {
    console.log('\n🔄 Intentando complementar con API para cartas extra...');
    const apiCards = await scrapeFromAPI();
    if (apiCards.length > 0) {
      const existingIds = new Set(allCards.map(c => c.id));
      const extras = apiCards.filter(c => !existingIds.has(c.id));
      if (extras.length > 0) {
        allCards.push(...extras);
        console.log(`   +${extras.length} cartas extra de la API`);
      } else {
        console.log('   No hay cartas extra (GitHub ya tenía todas)');
      }
    }
  }

  // Deduplicar por ID
  const cardMap = new Map();
  for (const card of allCards) {
    if (!cardMap.has(card.id)) {
      cardMap.set(card.id, card);
    }
  }
  const uniqueCards = Array.from(cardMap.values());

  // Crear/descubrir sets que no teníamos
  const discoveredSetIds = new Set(uniqueCards.map(c => c.set_id));
  const knownSetIds = new Set(SETS_META.map(s => s.id));
  const extraSets = [];
  for (const sid of discoveredSetIds) {
    if (!knownSetIds.has(sid) && sid) {
      extraSets.push({
        id: sid,
        name: sid.toUpperCase(),
        code: sid.toUpperCase(),
        type: 'promo',
        release_date: null
      });
    }
  }

  // Guardar
  const output = {
    sets: [...SETS_META, ...extraSets],
    cards: uniqueCards.sort((a, b) => a.id.localeCompare(b.id))
  };

  const outputPath = path.join(__dirname, 'cards_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  // Stats
  const setCount = {};
  for (const c of uniqueCards) {
    setCount[c.set_id] = (setCount[c.set_id] || 0) + 1;
  }

  console.log('\n🎉 ============================================');
  console.log('   SCRAPE COMPLETADO');
  console.log('   ============================================');
  console.log(`\n   📁 Guardado en: seed/cards_data.json`);
  console.log(`   🃏 Total cartas: ${uniqueCards.length}`);
  console.log(`   📦 Total sets: ${output.sets.length}`);
  console.log('\n   Cartas por set:');
  Object.entries(setCount).sort((a, b) => a[0].localeCompare(b[0])).forEach(([set, count]) => {
    console.log(`      ${set.toUpperCase().padEnd(8)} → ${count} cartas`);
  });
  console.log('\n   ✅ Ahora ejecuta: npm run seed:local');
  console.log('   ✅ Y luego: npm run dev\n');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
