// ============================================
// Rutas de sets (colecciones)
// ============================================
const router = require('express').Router();
const setCtrl = require('../controllers/set.controller');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// GET /api/sets - Listar todos los sets
router.get('/', setCtrl.getAll);

// GET /api/sets/:id - Detalle de set
router.get('/:id', setCtrl.getById);

// POST /api/sets - Crear set (admin)
router.post('/', auth, roleCheck('admin'), setCtrl.create);

// PUT /api/sets/:id - Actualizar set (admin)
router.put('/:id', auth, roleCheck('admin'), setCtrl.update);

// DELETE /api/sets/:id - Eliminar set (admin)
router.delete('/:id', auth, roleCheck('admin'), setCtrl.remove);

module.exports = router;
