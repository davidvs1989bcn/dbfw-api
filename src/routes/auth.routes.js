// ============================================
// Rutas de autenticación
// ============================================
const router = require('express').Router();
const { register, login, getProfile, logout } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

// POST /api/auth/register - Registrar usuario
router.post('/register', register);

// POST /api/auth/login - Login
router.post('/login', login);

// GET /api/auth/profile - Mi perfil (protegido)
router.get('/profile', auth, getProfile);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', auth, logout);

module.exports = router;
