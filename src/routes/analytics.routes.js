// ============================================
// Rutas de analytics y estadísticas
// ============================================
const router = require('express').Router();
const analyticsCtrl = require('../controllers/analytics.controller');

// Todos los endpoints de analytics son públicos (solo lectura)

// GET /api/analytics/top-used - Top cartas más usadas en mazos
router.get('/top-used', analyticsCtrl.topUsedCards);

// GET /api/analytics/top-rated - Top cartas mejor valoradas
router.get('/top-rated', analyticsCtrl.topRatedCards);

// GET /api/analytics/colors - Distribución de colores en el meta
router.get('/colors', analyticsCtrl.colorDistribution);

// GET /api/analytics/stats - Estadísticas generales de la plataforma
router.get('/stats', analyticsCtrl.platformStats);

// GET /api/analytics/sets - Stats por set
router.get('/sets', analyticsCtrl.setStats);

// GET /api/analytics/rarity - Distribución de rareza
router.get('/rarity', analyticsCtrl.rarityDistribution);

// GET /api/analytics/tags - Tags más populares
router.get('/tags', analyticsCtrl.popularTags);

// GET /api/analytics/cost-curve - Curva de coste media
router.get('/cost-curve', analyticsCtrl.avgCostCurve);

module.exports = router;
