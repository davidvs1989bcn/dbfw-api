// ============================================
// DRAGON BALL FUSION WORLD TCG - REST API
// Entry point
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middlewares globales
// ============================================
app.use(cors({
  origin: '*', // En producción, limitar a tu dominio
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta de nuevo en unos minutos.'
  }
});
app.use('/api/', limiter);

// ============================================
// Swagger UI
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #f97316; }',
  customSiteTitle: 'DBFW API Docs'
}));

// ============================================
// Frontend estático
// ============================================
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================
// Rutas
// ============================================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cards', require('./routes/card.routes'));
app.use('/api/sets', require('./routes/set.routes'));
app.use('/api/decks', require('./routes/deck.routes'));
app.use('/api/community', require('./routes/rating.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/collection', require('./routes/collection.routes'));

// ============================================
// Ruta raíz - Info de la API
// ============================================
app.get('/api', (req, res) => {
  res.json({
    name: 'Dragon Ball Fusion World TCG API',
    version: '1.0.0',
    description: 'API REST para catálogo de cartas, deck builder, ratings y analytics',
    author: 'David',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrar usuario',
        'POST /api/auth/login': 'Iniciar sesión',
        'GET  /api/auth/profile': 'Mi perfil (auth)',
        'POST /api/auth/logout': 'Cerrar sesión (auth)'
      },
      cards: {
        'GET    /api/cards': 'Listar cartas (filtros: name, color, card_type, rarity, set_id, cost, min_power, max_power, features, effect)',
        'GET    /api/cards/search?q=': 'Buscar cartas por texto',
        'GET    /api/cards/:id': 'Detalle de carta (con tags, sinergias, rating)',
        'POST   /api/cards': 'Crear carta (admin)',
        'PUT    /api/cards/:id': 'Actualizar carta (admin)',
        'DELETE /api/cards/:id': 'Eliminar carta (admin)'
      },
      sets: {
        'GET    /api/sets': 'Listar sets',
        'GET    /api/sets/:id': 'Detalle de set',
        'POST   /api/sets': 'Crear set (admin)',
        'PUT    /api/sets/:id': 'Actualizar set (admin)',
        'DELETE /api/sets/:id': 'Eliminar set (admin)'
      },
      decks: {
        'GET    /api/decks': 'Mazos públicos (filtros: color, leader, is_valid)',
        'GET    /api/decks/me/list': 'Mis mazos (auth)',
        'GET    /api/decks/:id': 'Detalle de mazo con cartas y stats',
        'GET    /api/decks/:id/validate': 'Validar mazo contra reglas oficiales',
        'POST   /api/decks': 'Crear mazo (auth)',
        'POST   /api/decks/:id/cards': 'Añadir cartas al mazo (auth)',
        'DELETE /api/decks/:id/cards/:cardId': 'Quitar carta del mazo (auth)',
        'DELETE /api/decks/:id': 'Eliminar mazo (auth)'
      },
      community: {
        'POST   /api/community/cards/:cardId/rate': 'Valorar carta 1-5 (auth)',
        'GET    /api/community/cards/:cardId/ratings': 'Ver ratings de carta',
        'DELETE /api/community/cards/:cardId/rate': 'Eliminar mi rating (auth)',
        'POST   /api/community/cards/:cardId/tags': 'Añadir tag a carta (auth)',
        'DELETE /api/community/cards/:cardId/tags/:tag': 'Eliminar mi tag (auth)',
        'POST   /api/community/synergies': 'Crear sinergia (auth)',
        'POST   /api/community/synergies/:id/vote': 'Votar sinergia (auth)'
      },
      analytics: {
        'GET /api/analytics/top-used': 'Top cartas más usadas en mazos',
        'GET /api/analytics/top-rated': 'Top cartas mejor valoradas',
        'GET /api/analytics/colors': 'Distribución de colores en el meta',
        'GET /api/analytics/stats': 'Estadísticas generales de la plataforma',
        'GET /api/analytics/sets': 'Stats por set',
        'GET /api/analytics/rarity': 'Distribución de rareza en el meta',
        'GET /api/analytics/tags': 'Tags más populares de la comunidad',
        'GET /api/analytics/cost-curve': 'Curva de coste media del meta'
      }
    }
  });
});

// ============================================
// 404 handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada.`
  });
});

// ============================================
// Error handler global
// ============================================
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
});

// ============================================
// Arrancar servidor (solo si se ejecuta directamente)
// ============================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🐉 Dragon Ball Fusion World TCG API`);
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📖 Swagger UI en http://localhost:${PORT}/api-docs`);
    console.log(`🎴 Frontend en http://localhost:${PORT}/\n`);
  });
}

module.exports = app;
