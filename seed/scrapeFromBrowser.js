// ============================================
// 🐉 SCRAPER BANDAI - Pegar en consola del navegador (F12)
// ============================================
//
// INSTRUCCIONES:
// 1. Abre Chrome y ve a: https://www.dbs-cardgame.com/fw/en/cardlist/
// 2. Pulsa F12 → pestaña "Console"
// 3. Copia y pega TODO este código
// 4. Espera a que termine (puede tardar 2-5 minutos)
// 5. Se descargará automáticamente un archivo "bandai_all_cards.json"
// 6. Mueve ese archivo a: C:\Users\David\Desktop\dbfw-api\seed\bandai_all_cards.json
// 7. Ejecuta: node seed/importBandai.js
//
// ============================================

(async function scrapeAllCards() {
  const DELAY = 800;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  console.log('🐉 Iniciando scraper de Bandai...');

  // Categorías con sus IDs internos de la web de Bandai
  // Extraídas del selector de la página
  const categories = [];
  const catSelect = document.querySelectorAll('.sortListItem, .seriesList li, [data-category]');

  // Intentar obtener categorías del DOM
  const seriesItems = document.querySelectorAll('.seriesCol li a, .seriesList li a, #seriesList li, .seriesCol li');
  console.log('Buscando categorías en la página...');

  // Método: buscar en el HTML los category IDs
  // Los IDs van de 583001 (FB01) a 583009 (FB09), más otros para starters y promos
  const CATEGORY_IDS = {
    '583009': { code: 'FB09', name: 'Dual Evolution', type: 'booster' },
    '583008': { code: 'FB08', name: "Saiyan's Pride", type: 'booster' },
    '583015': { code: 'SB02', name: 'Manga Booster 02', type: 'booster' },
    '583007': { code: 'FB07', name: 'Wish for Shenron', type: 'booster' },
    '583014': { code: 'SB01', name: 'Manga Booster 01', type: 'booster' },
    '583006': { code: 'FB06', name: 'Rivals Clash', type: 'booster' },
    '583005': { code: 'FB05', name: 'New Adventure', type: 'booster' },
    '583004': { code: 'FB04', name: 'Ultra Limit', type: 'booster' },
    '583003': { code: 'FB03', name: 'Raging Roar', type: 'booster' },
    '583002': { code: 'FB02', name: 'Blazing Aura', type: 'booster' },
    '583001': { code: 'FB01', name: 'Awakened Pulse', type: 'booster' },
    '583022': { code: 'FS12', name: 'The Beat of Ki', type: 'starter' },
    '583021': { code: 'FS11', name: 'The Phase of Evolution', type: 'starter' },
    '583020': { code: 'FS10', name: 'Giblet', type: 'starter' },
    '583019': { code: 'FS09', name: 'Shallot', type: 'starter' },
    '583018': { code: 'FS08', name: 'Vegeta SS3', type: 'starter' },
    '583017': { code: 'FS07', name: 'Vegeta (Mini)', type: 'starter' },
    '583016': { code: 'FS06', name: 'Son Goku (Mini)', type: 'starter' },
    '583013': { code: 'FS05', name: 'Bardock', type: 'starter' },
    '583012': { code: 'FS04', name: 'Frieza', type: 'starter' },
    '583011': { code: 'FS03', name: 'Broly', type: 'starter' },
    '583010': { code: 'FS02', name: 'Vegeta', type: 'starter' },
    '580001': { code: 'FS01', name: 'Son Goku', type: 'starter' },
    '583023': { code: 'PR', name: 'Promotion Card', type: 'promo' },
    '583024': { code: 'RE', name: 'Release Event Pack', type: 'promo' },
  };

  const allCards = [];
  const seenIds = new Set();
  let totalProcessed = 0;

  for (const [catId, catInfo] of Object.entries(CATEGORY_IDS)) {
    console.log(`\n📦 [${catInfo.code}] ${catInfo.name} (cat: ${catId})...`);

    // Navegar a la categoría
    const url = `https://www.dbs-cardgame.com/fw/en/cardlist/?search=true&category%5B0%5D=${catId}`;

    try {
      const response = await fetch(url);
      const html = await response.text();

      // Parsear el HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Buscar las cartas en la lista
      const cardLinks = doc.querySelectorAll('.resultCol li a, .cardList li a, #cardlist li a, ul.resultCol li');

      // Extraer IDs de las imágenes alt text
      const imgs = doc.querySelectorAll('img[alt]');
      let cardCount = 0;

      imgs.forEach(img => {
        const alt = (img.alt || '').trim();
        // Patrón: "FB01-001 Son Goku" o "FB01-001 Son Goku : SS"
        const match = alt.match(/^([A-Z]{2,3}\d{2}-\d{3}[a-z]?)\s+(.+)/i);
        if (match) {
          const cardId = match[1].toUpperCase();
          if (!seenIds.has(cardId)) {
            seenIds.add(cardId);
            const imgSrc = img.getAttribute('src') || '';

            // Construir URL de imagen real
            let imageUrl = null;
            if (imgSrc && !imgSrc.includes('noimage')) {
              if (imgSrc.startsWith('http')) {
                imageUrl = imgSrc;
              } else {
                imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${cardId}.webp`;
              }
            } else {
              imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${cardId}.webp`;
            }

            allCards.push({
              id: cardId,
              code: cardId,
              name: match[2].trim(),
              image_url: imageUrl,
              set_code: catInfo.code,
              set_name: catInfo.name,
              set_type: catInfo.type,
              _category_id: catId
            });
            cardCount++;
          }
        }
      });

      totalProcessed += cardCount;
      console.log(`   ✅ ${cardCount} cartas nuevas (total acumulado: ${totalProcessed})`);

    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    await sleep(DELAY);
  }

  // Ahora intentar obtener datos detallados haciendo clic en cada carta
  // Para esto necesitamos cargar la página principal y hacer fetch de cada carta
  console.log(`\n\n🔍 Obteniendo detalles de ${allCards.length} cartas...`);
  console.log('   (Esto puede tardar unos minutos)\n');

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];

    if (i % 50 === 0) {
      console.log(`   Procesando ${i}/${allCards.length}...`);
    }

    // Intentar cargar la página de detalle de la carta
    try {
      // La web de Bandai usa la URL del cardlist con el ID de la carta
      const detailUrl = `https://www.dbs-cardgame.com/fw/en/cardlist/?search=true&free=${card.id}`;
      const response = await fetch(detailUrl);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Buscar información detallada en el HTML
      const detailText = doc.body.innerText || doc.body.textContent || '';

      // Intentar extraer campos del texto
      // La web de Bandai suele poner estos datos en elementos específicos
      const cardTypeMatch = detailText.match(/Card Type[:\s]*(LEADER|BATTLE|EXTRA|ENERGY MARKER)/i);
      const colorMatch = detailText.match(/Color[:\s]*(Red|Blue|Green|Yellow|Black)/i);
      const rarityMatch = detailText.match(/Rarity[:\s]*(L|C|UC|R|SR|SCR|PR)/i);
      const powerMatch = detailText.match(/Power[:\s]*(\d+)/i);
      const costMatch = detailText.match(/Energy Cost[:\s]*(\d+)/i);

      if (cardTypeMatch) card.card_type = cardTypeMatch[1].toUpperCase();
      if (colorMatch) card.color = colorMatch[1];
      if (rarityMatch) card.rarity = rarityMatch[1].toUpperCase();
      if (powerMatch) card.power = powerMatch[1];
      if (costMatch) card.cost = costMatch[1];

      await sleep(100); // Pequeña pausa entre peticiones
    } catch (err) {
      // Si falla el detalle, seguimos con lo que tenemos
    }
  }

  console.log(`\n\n🎉 ============================================`);
  console.log(`   SCRAPE COMPLETADO`);
  console.log(`   ============================================`);
  console.log(`   Total cartas: ${allCards.length}`);
  console.log(`   Descargando JSON...`);

  // Descargar como archivo JSON
  const jsonStr = JSON.stringify(allCards, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bandai_all_cards.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`\n   ✅ Archivo descargado: bandai_all_cards.json`);
  console.log(`   📋 Ahora muévelo a: C:\\Users\\David\\Desktop\\dbfw-api\\seed\\`);
  console.log(`   🖥️  Y ejecuta: node seed/importBandai.js`);
  console.log(`   🖥️  Después: npm run seed:local`);

  return allCards;
})();
