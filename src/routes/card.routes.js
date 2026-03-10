// ============================================
// Rutas de cartas (catálogo)
// ============================================
const router = require('express').Router();
const cardCtrl = require('../controllers/card.controller');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// --- Públicos ---
// GET /api/cards - Listar todas con filtros y paginación
router.get('/', cardCtrl.getAll);

// GET /api/cards/search?q=goku - Búsqueda por texto
router.get('/search', cardCtrl.search);

// GET /api/cards/:id - Detalle de carta
router.get('/:id', cardCtrl.getById);

// --- Admin only ---
// POST /api/cards - Crear carta
router.post('/', auth, roleCheck('admin'), cardCtrl.create);

// PUT /api/cards/:id - Actualizar carta
router.put('/:id', auth, roleCheck('admin'), cardCtrl.update);

// DELETE /api/cards/:id - Eliminar carta
router.delete('/:id', auth, roleCheck('admin'), cardCtrl.remove);

module.exports = router;
