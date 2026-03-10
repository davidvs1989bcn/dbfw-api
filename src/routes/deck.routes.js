// ============================================
// Rutas de mazos (deck builder)
// ============================================
const router = require('express').Router();
const deckCtrl = require('../controllers/deck.controller');
const { auth, optionalAuth } = require('../middleware/auth');

// --- Públicos ---
// GET /api/decks - Mazos públicos con filtros
router.get('/', deckCtrl.getPublicDecks);

// GET /api/decks/:id - Detalle de mazo (público o propio)
router.get('/:id', optionalAuth, deckCtrl.getById);

// GET /api/decks/:id/validate - Validar mazo contra reglas oficiales
router.get('/:id/validate', deckCtrl.validate);

// --- Protegidos (requieren login) ---
// GET /api/decks/me/list - Mis mazos
router.get('/me/list', auth, deckCtrl.getMyDecks);

// POST /api/decks - Crear mazo
router.post('/', auth, deckCtrl.create);

// POST /api/decks/:id/cards - Añadir cartas al mazo
router.post('/:id/cards', auth, deckCtrl.addCards);

// DELETE /api/decks/:id/cards/:cardId - Quitar carta del mazo
router.delete('/:id/cards/:cardId', auth, deckCtrl.removeCard);

// DELETE /api/decks/:id - Eliminar mazo
router.delete('/:id', auth, deckCtrl.remove);

module.exports = router;
