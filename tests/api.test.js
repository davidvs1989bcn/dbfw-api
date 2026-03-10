// ============================================
// Tests para la Dragon Ball Fusion World TCG API
//
// Requisitos antes de ejecutar:
//   1. MySQL corriendo con la BD dbfw_api creada
//   2. Seed ejecutado (npm run seed:local)
//
// Uso: npm test
// ============================================
const request = require('supertest');
const app = require('../src/index');

let adminToken = '';
let userToken = '';
let testUserId = null;

// ==============================
// AUTH
// ==============================
describe('Auth endpoints', () => {

  test('POST /api/auth/login - admin login correcto', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dbfw.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
    adminToken = res.body.data.token;
  });

  test('POST /api/auth/login - credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dbfw.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - crear usuario nuevo', async () => {
    const random = Math.floor(Math.random() * 99999);
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `testuser_${random}`,
        email: `test_${random}@capsule.com`,
        password: 'testpass123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('user');
    testUserId = res.body.data.id;

    // Login con el usuario creado
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: `test_${random}@capsule.com`, password: 'testpass123' });

    userToken = loginRes.body.data.token;
  });

  test('POST /api/auth/register - password corta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'short', email: 'short@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/profile - perfil autenticado', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('admin');
    expect(res.body.data.stats).toBeDefined();
  });

  test('GET /api/auth/profile - sin token da 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});

// ==============================
// CARDS
// ==============================
describe('Cards endpoints', () => {

  test('GET /api/cards - listar cartas con paginación', async () => {
    const res = await request(app).get('/api/cards?limit=5&page=1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  test('GET /api/cards - filtro por color', async () => {
    const res = await request(app).get('/api/cards?color=Red&limit=50');

    expect(res.status).toBe(200);
    res.body.data.forEach(card => {
      expect(card.color).toBe('Red');
    });
  });

  test('GET /api/cards - filtro por tipo LEADER', async () => {
    const res = await request(app).get('/api/cards?card_type=LEADER');

    expect(res.status).toBe(200);
    res.body.data.forEach(card => {
      expect(card.card_type).toBe('LEADER');
    });
  });

  test('GET /api/cards - filtro por rareza SR', async () => {
    const res = await request(app).get('/api/cards?rarity=SR');

    expect(res.status).toBe(200);
    res.body.data.forEach(card => {
      expect(card.rarity).toBe('SR');
    });
  });

  test('GET /api/cards - filtro por set', async () => {
    const res = await request(app).get('/api/cards?set_id=fb01');

    expect(res.status).toBe(200);
    res.body.data.forEach(card => {
      expect(card.set_id).toBe('fb01');
    });
  });

  test('GET /api/cards/search - buscar por nombre', async () => {
    const res = await request(app).get('/api/cards/search?q=goku');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/cards/search - query muy corta da 400', async () => {
    const res = await request(app).get('/api/cards/search?q=a');
    expect(res.status).toBe(400);
  });

  test('GET /api/cards/:id - detalle de carta existente', async () => {
    const res = await request(app).get('/api/cards/FB01-001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('FB01-001');
    expect(res.body.data.name).toBe('Son Goku');
    expect(res.body.data.card_type).toBe('LEADER');
    expect(res.body.data.tags).toBeDefined();
    expect(res.body.data.synergies).toBeDefined();
  });

  test('GET /api/cards/:id - carta no existente da 404', async () => {
    const res = await request(app).get('/api/cards/NOEXISTE-999');
    expect(res.status).toBe(404);
  });

  test('POST /api/cards - crear carta sin auth da 401', async () => {
    const res = await request(app)
      .post('/api/cards')
      .send({ id: 'TEST-001', code: 'TEST-001', name: 'Test Card', card_type: 'BATTLE', color: 'Red', rarity: 'C', set_id: 'fb01' });

    expect(res.status).toBe(401);
  });

  test('POST /api/cards - crear carta como user da 403', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ id: 'TEST-001', code: 'TEST-001', name: 'Test Card', card_type: 'BATTLE', color: 'Red', rarity: 'C', set_id: 'fb01' });

    expect(res.status).toBe(403);
  });
});

// ==============================
// SETS
// ==============================
describe('Sets endpoints', () => {

  test('GET /api/sets - listar sets', async () => {
    const res = await request(app).get('/api/sets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/sets/:id - detalle de set', async () => {
    const res = await request(app).get('/api/sets/fb01');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('fb01');
    expect(res.body.data.name).toBe('Awakened Pulse');
  });

  test('GET /api/sets/:id - set no existente da 404', async () => {
    const res = await request(app).get('/api/sets/noexiste');
    expect(res.status).toBe(404);
  });
});

// ==============================
// DECKS
// ==============================
describe('Decks endpoints', () => {
  let deckId = null;

  test('POST /api/decks - crear mazo', async () => {
    const res = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Red Deck',
        description: 'Mazo de prueba',
        leader_card_id: 'FB01-001'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Red Deck');
    expect(res.body.data.color).toBe('Red');
    deckId = res.body.data.id;
  });

  test('POST /api/decks - crear mazo sin auth da 401', async () => {
    const res = await request(app)
      .post('/api/decks')
      .send({ name: 'Fail', leader_card_id: 'FB01-001' });

    expect(res.status).toBe(401);
  });

  test('POST /api/decks/:id/cards - añadir cartas al mazo', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/cards`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        cards: [
          { card_id: 'FB01-002', quantity: 4 },
          { card_id: 'FB01-003', quantity: 4 },
          { card_id: 'FB01-005', quantity: 3 }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.data.cards.length).toBeGreaterThan(0);
  });

  test('GET /api/decks/:id - detalle de mazo con cartas', async () => {
    const res = await request(app).get(`/api/decks/${deckId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.cards).toBeInstanceOf(Array);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.cost_curve).toBeDefined();
  });

  test('GET /api/decks/:id/validate - validar mazo incompleto', async () => {
    const res = await request(app).get(`/api/decks/${deckId}/validate`);

    expect(res.status).toBe(200);
    expect(res.body.data.isValid).toBe(false);
    expect(res.body.data.errors.length).toBeGreaterThan(0);
  });

  test('GET /api/decks - listar mazos públicos', async () => {
    const res = await request(app).get('/api/decks');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  test('DELETE /api/decks/:id/cards/:cardId - quitar carta', async () => {
    const res = await request(app)
      .delete(`/api/decks/${deckId}/cards/FB01-002`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  test('DELETE /api/decks/:id - eliminar mazo', async () => {
    const res = await request(app)
      .delete(`/api/decks/${deckId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});

// ==============================
// COMMUNITY (Ratings, Tags, Synergies)
// ==============================
describe('Community endpoints', () => {

  test('POST /api/community/cards/:cardId/rate - valorar carta', async () => {
    const res = await request(app)
      .post('/api/community/cards/FB01-001/rate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ score: 5, comment: 'Mejor líder rojo' });

    expect(res.status).toBe(200);
    expect(res.body.data.your_score).toBe(5);
    expect(res.body.data.avg_rating).toBeDefined();
  });

  test('POST /api/community/cards/:cardId/rate - score inválido', async () => {
    const res = await request(app)
      .post('/api/community/cards/FB01-001/rate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ score: 10 });

    expect(res.status).toBe(400);
  });

  test('GET /api/community/cards/:cardId/ratings - ver ratings', async () => {
    const res = await request(app).get('/api/community/cards/FB01-001/ratings');

    expect(res.status).toBe(200);
    expect(res.body.ratings).toBeInstanceOf(Array);
  });

  test('POST /api/community/cards/:cardId/tags - añadir tag', async () => {
    const res = await request(app)
      .post('/api/community/cards/FB01-001/tags')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ tag: 'meta' });

    expect(res.status).toBe(200);
    expect(res.body.data.tags).toBeInstanceOf(Array);
  });

  test('POST /api/community/synergies - crear sinergia', async () => {
    const res = await request(app)
      .post('/api/community/synergies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        card_id_1: 'FB01-001',
        card_id_2: 'FB01-005',
        description: 'El líder roba al atacar, combo con el Critical de la 005'
      });

    expect(res.status).toBe(201);
  });

  test('POST /api/community/synergies - sinergia consigo misma da error', async () => {
    const res = await request(app)
      .post('/api/community/synergies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ card_id_1: 'FB01-001', card_id_2: 'FB01-001' });

    expect(res.status).toBe(400);
  });
});

// ==============================
// ANALYTICS
// ==============================
describe('Analytics endpoints', () => {

  test('GET /api/analytics/stats - stats generales', async () => {
    const res = await request(app).get('/api/analytics/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.total_cards).toBeGreaterThan(0);
    expect(res.body.data.total_sets).toBeGreaterThan(0);
  });

  test('GET /api/analytics/sets - stats por set', async () => {
    const res = await request(app).get('/api/analytics/sets');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/analytics/tags - tags populares', async () => {
    const res = await request(app).get('/api/analytics/tags');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  test('GET /api/analytics/top-used - top cartas usadas', async () => {
    const res = await request(app).get('/api/analytics/top-used');
    expect(res.status).toBe(200);
  });

  test('GET /api/analytics/colors - distribución colores', async () => {
    const res = await request(app).get('/api/analytics/colors');
    expect(res.status).toBe(200);
  });
});

// ==============================
// 404 y ruta raíz
// ==============================
describe('General', () => {

  test('GET /api - info de la API', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Dragon Ball Fusion World TCG API');
  });

  test('GET /ruta/que/no/existe - 404', async () => {
    const res = await request(app).get('/api/noexiste');
    expect(res.status).toBe(404);
  });
});
