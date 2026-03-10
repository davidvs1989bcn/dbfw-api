// ============================================
// Rutas de ratings, tags y sinergias
// ============================================
const router = require('express').Router();
const ratingCtrl = require('../controllers/rating.controller');
const { auth } = require('../middleware/auth');

// --- Ratings ---
// POST /api/cards/:cardId/rate - Valorar carta (1-5)
router.post('/cards/:cardId/rate', auth, ratingCtrl.rateCard);

// GET /api/cards/:cardId/ratings - Ver ratings de una carta
router.get('/cards/:cardId/ratings', ratingCtrl.getCardRatings);

// DELETE /api/cards/:cardId/rate - Eliminar mi rating
router.delete('/cards/:cardId/rate', auth, ratingCtrl.deleteRating);

// --- Tags ---
// POST /api/cards/:cardId/tags - Añadir tag a carta
router.post('/cards/:cardId/tags', auth, ratingCtrl.addTag);

// DELETE /api/cards/:cardId/tags/:tag - Eliminar mi tag
router.delete('/cards/:cardId/tags/:tag', auth, ratingCtrl.removeTag);

// --- Sinergias ---
// POST /api/synergies - Crear sinergia entre dos cartas
router.post('/synergies', auth, ratingCtrl.addSynergy);

// POST /api/synergies/:id/vote - Votar sinergia
router.post('/synergies/:id/vote', auth, ratingCtrl.voteSynergy);

module.exports = router;
