// ============================================
// Swagger / OpenAPI 3.0 spec
// ============================================
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Dragon Ball Fusion World TCG API',
    version: '1.0.0',
    description: 'API REST para catálogo de cartas, deck builder, ratings, sinergias y analytics del juego Dragon Ball Super Card Game: Fusion World.',
    contact: { name: 'David' },
    license: { name: 'MIT' }
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Card: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'FB01-001' },
          code: { type: 'string', example: 'FB01-001' },
          name: { type: 'string', example: 'Son Goku' },
          card_type: { type: 'string', enum: ['LEADER', 'BATTLE', 'EXTRA', 'ENERGY MARKER'] },
          color: { type: 'string', enum: ['Red', 'Blue', 'Green', 'Yellow', 'Black'] },
          rarity: { type: 'string', enum: ['L', 'C', 'UC', 'R', 'SR', 'SCR', 'PR'] },
          cost: { type: 'string', example: '3' },
          specified_cost: { type: 'string', example: '1' },
          power: { type: 'string', example: '20000' },
          combo_power: { type: 'string', example: '10000' },
          features: { type: 'string', example: 'Saiyan/Universe 7' },
          effect: { type: 'string' },
          image_url: { type: 'string' },
          set_id: { type: 'string', example: 'fb01' },
          avg_rating: { type: 'number', example: 4.5 },
          total_ratings: { type: 'integer', example: 12 }
        }
      },
      Set: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'fb01' },
          name: { type: 'string', example: 'Awakened Pulse' },
          code: { type: 'string', example: 'FB01' },
          type: { type: 'string', enum: ['booster', 'starter', 'promo'] },
          release_date: { type: 'string', format: 'date' },
          total_cards: { type: 'integer' }
        }
      },
      Deck: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', example: 'Red Aggro' },
          description: { type: 'string' },
          leader_card_id: { type: 'string', example: 'FB01-001' },
          color: { type: 'string' },
          is_public: { type: 'boolean' },
          is_valid: { type: 'boolean' },
          total_cards: { type: 'integer' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string', example: 'goku' },
          email: { type: 'string', example: 'goku@capsule.com' },
          role: { type: 'string', enum: ['user', 'admin'] }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {
    // ===== AUTH =====
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar nuevo usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['username', 'email', 'password'],
            properties: {
              username: { type: 'string', example: 'goku' },
              email: { type: 'string', example: 'goku@capsule.com' },
              password: { type: 'string', example: 'kamehameha', minLength: 6 }
            }
          }}}
        },
        responses: {
          201: { description: 'Usuario registrado' },
          409: { description: 'Usuario o email ya existe' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión (devuelve JWT)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['email', 'password'],
            properties: {
              email: { type: 'string', example: 'admin@dbfw.com' },
              password: { type: 'string', example: 'admin123' }
            }
          }}}
        },
        responses: {
          200: { description: 'Login OK - devuelve token JWT' },
          401: { description: 'Credenciales incorrectas' }
        }
      }
    },
    '/api/auth/profile': {
      get: {
        tags: ['Auth'], summary: 'Mi perfil + stats', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Perfil del usuario con estadísticas' }, 401: { description: 'No autenticado' } }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'], summary: 'Cerrar sesión', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sesión cerrada' } }
      }
    },

    // ===== CARDS =====
    '/api/cards': {
      get: {
        tags: ['Cards'],
        summary: 'Listar cartas con filtros y paginación',
        parameters: [
          { name: 'name', in: 'query', schema: { type: 'string' }, description: 'Filtrar por nombre' },
          { name: 'color', in: 'query', schema: { type: 'string', enum: ['Red', 'Blue', 'Green', 'Yellow', 'Black'] } },
          { name: 'card_type', in: 'query', schema: { type: 'string', enum: ['LEADER', 'BATTLE', 'EXTRA', 'ENERGY MARKER'] } },
          { name: 'rarity', in: 'query', schema: { type: 'string', enum: ['L', 'C', 'UC', 'R', 'SR', 'SCR', 'PR'] } },
          { name: 'set_id', in: 'query', schema: { type: 'string' }, description: 'Ej: fb01, fb02' },
          { name: 'cost', in: 'query', schema: { type: 'string' } },
          { name: 'min_power', in: 'query', schema: { type: 'integer' } },
          { name: 'max_power', in: 'query', schema: { type: 'integer' } },
          { name: 'features', in: 'query', schema: { type: 'string' }, description: 'Ej: Saiyan, Frieza Clan' },
          { name: 'effect', in: 'query', schema: { type: 'string' }, description: 'Buscar en texto del efecto' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 25, maximum: 100 } }
        ],
        responses: { 200: { description: 'Lista paginada de cartas' } }
      },
      post: {
        tags: ['Cards'], summary: 'Crear carta (admin)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['id', 'code', 'name', 'card_type', 'color', 'rarity', 'set_id'],
          properties: {
            id: { type: 'string', example: 'FB01-099' }, code: { type: 'string', example: 'FB01-099' },
            name: { type: 'string', example: 'Goku Ultra Instinct' },
            card_type: { type: 'string', enum: ['LEADER', 'BATTLE', 'EXTRA', 'ENERGY MARKER'] },
            color: { type: 'string', enum: ['Red', 'Blue', 'Green', 'Yellow', 'Black'] },
            rarity: { type: 'string', enum: ['L', 'C', 'UC', 'R', 'SR', 'SCR', 'PR'] },
            cost: { type: 'string' }, power: { type: 'string' }, features: { type: 'string' },
            effect: { type: 'string' }, image_url: { type: 'string' }, set_id: { type: 'string', example: 'fb01' }
          }
        }}}},
        responses: { 201: { description: 'Carta creada' }, 403: { description: 'Solo admin' } }
      }
    },
    '/api/cards/search': {
      get: {
        tags: ['Cards'], summary: 'Buscar cartas por texto (nombre, efecto, features)',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 }, description: 'Texto a buscar' }],
        responses: { 200: { description: 'Resultados de búsqueda (máx 50)' } }
      }
    },
    '/api/cards/{id}': {
      get: {
        tags: ['Cards'], summary: 'Detalle de carta (con tags, sinergias, rating, nº mazos)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'FB01-001' }],
        responses: { 200: { description: 'Carta completa' }, 404: { description: 'No encontrada' } }
      },
      put: {
        tags: ['Cards'], summary: 'Actualizar carta (admin)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, effect: { type: 'string' }, power: { type: 'string' } } } } } },
        responses: { 200: { description: 'Carta actualizada' }, 403: { description: 'Solo admin' } }
      },
      delete: {
        tags: ['Cards'], summary: 'Eliminar carta (admin)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Carta eliminada' }, 403: { description: 'Solo admin' } }
      }
    },

    // ===== SETS =====
    '/api/sets': {
      get: { tags: ['Sets'], summary: 'Listar todos los sets', responses: { 200: { description: 'Lista de sets' } } },
      post: {
        tags: ['Sets'], summary: 'Crear set (admin)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['id', 'name', 'code'],
          properties: { id: { type: 'string', example: 'fb10' }, name: { type: 'string', example: 'New Set' }, code: { type: 'string', example: 'FB10' }, type: { type: 'string', enum: ['booster', 'starter', 'promo'] }, release_date: { type: 'string', format: 'date' } }
        }}}},
        responses: { 201: { description: 'Set creado' } }
      }
    },
    '/api/sets/{id}': {
      get: { tags: ['Sets'], summary: 'Detalle de set', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Set' } } },
      put: { tags: ['Sets'], summary: 'Actualizar set (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Set actualizado' } } },
      delete: { tags: ['Sets'], summary: 'Eliminar set (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Set eliminado' } } }
    },

    // ===== DECKS =====
    '/api/decks': {
      get: {
        tags: ['Decks'], summary: 'Mazos públicos con filtros',
        parameters: [
          { name: 'color', in: 'query', schema: { type: 'string' } },
          { name: 'leader', in: 'query', schema: { type: 'string' } },
          { name: 'is_valid', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Lista paginada de mazos públicos' } }
      },
      post: {
        tags: ['Decks'], summary: 'Crear mazo', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['name', 'leader_card_id'],
          properties: {
            name: { type: 'string', example: 'Red Aggro' },
            description: { type: 'string', example: 'Mazo agresivo rojo' },
            leader_card_id: { type: 'string', example: 'FB01-001' },
            is_public: { type: 'boolean', default: true }
          }
        }}}},
        responses: { 201: { description: 'Mazo creado' } }
      }
    },
    '/api/decks/me/list': {
      get: { tags: ['Decks'], summary: 'Mis mazos', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de mis mazos' } } }
    },
    '/api/decks/{id}': {
      get: {
        tags: ['Decks'], summary: 'Detalle de mazo con cartas y estadísticas',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Mazo completo con cartas y stats' } }
      },
      delete: {
        tags: ['Decks'], summary: 'Eliminar mazo', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Mazo eliminado' } }
      }
    },
    '/api/decks/{id}/cards': {
      post: {
        tags: ['Decks'], summary: 'Añadir cartas al mazo', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['cards'],
          properties: { cards: { type: 'array', items: { type: 'object', properties: { card_id: { type: 'string', example: 'FB01-002' }, quantity: { type: 'integer', example: 4, minimum: 1, maximum: 4 } } } } }
        }}}},
        responses: { 200: { description: 'Cartas añadidas, mazo revalidado' } }
      }
    },
    '/api/decks/{id}/cards/{cardId}': {
      delete: {
        tags: ['Decks'], summary: 'Quitar carta del mazo', security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Carta eliminada del mazo' } }
      }
    },
    '/api/decks/{id}/validate': {
      get: {
        tags: ['Decks'], summary: 'Validar mazo contra reglas oficiales',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: '{ isValid, errors[] }' } }
      }
    },

    // ===== COMMUNITY =====
    '/api/community/cards/{cardId}/rate': {
      post: {
        tags: ['Community'], summary: 'Valorar carta (1-5 estrellas)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'cardId', in: 'path', required: true, schema: { type: 'string' }, example: 'FB01-001' }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['score'],
          properties: { score: { type: 'integer', minimum: 1, maximum: 5, example: 5 }, comment: { type: 'string', example: 'Mejor lider rojo' } }
        }}}},
        responses: { 200: { description: 'Rating registrado con media actualizada' } }
      },
      delete: {
        tags: ['Community'], summary: 'Eliminar mi rating', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'cardId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Rating eliminado' } }
      }
    },
    '/api/community/cards/{cardId}/ratings': {
      get: {
        tags: ['Community'], summary: 'Ver ratings de una carta',
        parameters: [
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Lista de ratings' } }
      }
    },
    '/api/community/cards/{cardId}/tags': {
      post: {
        tags: ['Community'], summary: 'Añadir tag a carta', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'cardId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['tag'],
          properties: { tag: { type: 'string', example: 'meta' } }
        }}}},
        responses: { 200: { description: 'Tag añadido' } }
      }
    },
    '/api/community/cards/{cardId}/tags/{tag}': {
      delete: {
        tags: ['Community'], summary: 'Eliminar mi tag', security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'tag', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Tag eliminado' } }
      }
    },
    '/api/community/synergies': {
      post: {
        tags: ['Community'], summary: 'Crear sinergia entre dos cartas', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['card_id_1', 'card_id_2'],
          properties: {
            card_id_1: { type: 'string', example: 'FB01-001' },
            card_id_2: { type: 'string', example: 'FB01-005' },
            description: { type: 'string', example: 'El líder roba carta al atacar y la batalla 005 tiene Critical' }
          }
        }}}},
        responses: { 201: { description: 'Sinergia creada' } }
      }
    },
    '/api/community/synergies/{id}/vote': {
      post: {
        tags: ['Community'], summary: 'Votar sinergia (+1)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Voto registrado' } }
      }
    },

    // ===== ANALYTICS =====
    '/api/analytics/stats': { get: { tags: ['Analytics'], summary: 'Estadísticas generales de la plataforma', responses: { 200: { description: 'Stats globales' } } } },
    '/api/analytics/top-used': { get: { tags: ['Analytics'], summary: 'Top cartas más usadas en mazos', parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }], responses: { 200: { description: 'Top cartas' } } } },
    '/api/analytics/top-rated': { get: { tags: ['Analytics'], summary: 'Top cartas mejor valoradas (mín 3 ratings)', parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }], responses: { 200: { description: 'Top rated' } } } },
    '/api/analytics/colors': { get: { tags: ['Analytics'], summary: 'Distribución de colores en el meta', responses: { 200: { description: 'Color distribution' } } } },
    '/api/analytics/sets': { get: { tags: ['Analytics'], summary: 'Stats por set', responses: { 200: { description: 'Set stats' } } } },
    '/api/analytics/rarity': { get: { tags: ['Analytics'], summary: 'Distribución de rareza en el meta', responses: { 200: { description: 'Rarity distribution' } } } },
    '/api/analytics/tags': { get: { tags: ['Analytics'], summary: 'Tags más populares de la comunidad', parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }], responses: { 200: { description: 'Popular tags' } } } },
    '/api/analytics/cost-curve': { get: { tags: ['Analytics'], summary: 'Curva de coste media del meta', responses: { 200: { description: 'Cost curve' } } } }
  },
  tags: [
    { name: 'Auth', description: 'Registro, login, perfil' },
    { name: 'Cards', description: 'Catálogo de cartas (CRUD + búsqueda + filtros)' },
    { name: 'Sets', description: 'Colecciones / Booster packs' },
    { name: 'Decks', description: 'Deck builder con validación de reglas' },
    { name: 'Community', description: 'Ratings, tags y sinergias de la comunidad' },
    { name: 'Analytics', description: 'Estadísticas y métricas del meta' }
  ]
};

module.exports = swaggerSpec;
