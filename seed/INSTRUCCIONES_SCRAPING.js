// ============================================
// SCRAPER DE CARTAS DESDE TU NAVEGADOR
// ============================================
//
// INSTRUCCIONES:
//
// PASO 1: Abre esta URL en Chrome:
//   https://www.dbs-cardgame.com/fw/en/cardlist/?search=true
//
// PASO 2: En la página, NO selecciones ningún filtro.
//   Haz clic en el botón azul "SEARCH" (sin filtros)
//   para que cargue TODAS las cartas.
//   Espera unos segundos a que carguen todas.
//
// PASO 3: Abre la consola del navegador (F12 → Console)
//   y pega TODO este código de abajo:
//
// ─────────────────────────────────────
// COPIAR DESDE AQUÍ ↓↓↓
// ─────────────────────────────────────
//
// (function() {
//   // Obtener todas las cartas del DOM
//   const modals = document.querySelectorAll('.modal.cardDetail, .modalCol, [class*="cardDetail"]');
//   
//   // Método alternativo: buscar en los datos internos de la página
//   // La web de Bandai almacena los datos en variables JavaScript
//   
//   // Buscar en los elementos visibles de la lista
//   const cardElements = document.querySelectorAll('.cardListCol, .resultCol li, #cardlist li, .list-inner li');
//   
//   console.log('Elementos encontrados:', cardElements.length);
//   
//   const cards = [];
//   
//   // Intentar extraer de los alt text de las imágenes
//   const imgs = document.querySelectorAll('img[alt*="-"]');
//   const seen = new Set();
//   
//   imgs.forEach(img => {
//     const alt = img.alt || '';
//     const match = alt.match(/^([A-Z]{2,3}\d{2}-\d{3}[a-z]?)\s+(.+)/);
//     if (match && !seen.has(match[1])) {
//       seen.add(match[1]);
//       const src = img.src || '';
//       cards.push({
//         id: match[1],
//         code: match[1],
//         name: match[2].trim(),
//         image_url: src.includes('noimage') ? null : src
//       });
//     }
//   });
//   
//   console.log(`Cartas extraídas: ${cards.length}`);
//   
//   // Copiar al portapapeles
//   const json = JSON.stringify(cards, null, 2);
//   navigator.clipboard.writeText(json).then(() => {
//     console.log('✅ JSON copiado al portapapeles! Pégalo en un archivo.');
//   }).catch(() => {
//     // Si no funciona clipboard, crear un descargable
//     const blob = new Blob([json], {type: 'application/json'});
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'bandai_cards.json';
//     a.click();
//     console.log('✅ Descargando bandai_cards.json');
//   });
// })();
//
// ─────────────────────────────────────
// COPIAR HASTA AQUÍ ↑↑↑
// ─────────────────────────────────────
//
// NOTA: El método anterior solo extrae IDs y nombres de las imágenes.
// Para datos COMPLETOS (coste, poder, efecto, etc.) necesitamos
// hacer clic en cada carta y leer el modal de detalle.
//
// ===================================================================
// MÉTODO ALTERNATIVO RECOMENDADO:
// ===================================================================
//
// La web de Bandai usa categorías internas con IDs numéricos.
// Cada categoría tiene un JSON que se puede descargar directamente.
//
// Abre cada una de estas URLs en tu navegador, una a una,
// y guarda la página (Ctrl+S) como .html en:
//   C:\Users\David\Desktop\dbfw-api\seed\pages\
//
// CATEGORÍAS:
// Todas las cartas (sin filtro):
//   https://www.dbs-cardgame.com/fw/en/cardlist/?search=true
//
// O puedes usar el método de abajo que es más fácil...

console.log(`
╔════════════════════════════════════════════════════╗
║  MEJOR MÉTODO: USA EL SCRIPT scrapeFromBrowser.js ║
║                                                    ║
║  Lee las instrucciones en ese archivo              ║
╚════════════════════════════════════════════════════╝
`);
