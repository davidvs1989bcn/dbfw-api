// ============================================
// Servicio de analytics y estadísticas
// ============================================
const pool = require('../config/db');

class AnalyticsService {

  // Top cartas más usadas en mazos
  async topUsedCards(limit = 20) {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.color, c.card_type, c.rarity, c.image_url,
              COUNT(dc.deck_id) as deck_count,
              SUM(dc.quantity) as total_copies,
              COALESCE(AVG(r.score), 0) as avg_rating
       FROM deck_cards dc
       JOIN cards c ON dc.card_id = c.id
       JOIN decks d ON dc.deck_id = d.id AND d.is_public = TRUE
       LEFT JOIN ratings r ON c.id = r.card_id
       GROUP BY c.id
       ORDER BY deck_count DESC, total_copies DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Top cartas mejor valoradas
  async topRatedCards(limit = 20) {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.color, c.card_type, c.rarity, c.image_url,
              AVG(r.score) as avg_rating,
              COUNT(r.id) as total_ratings
       FROM cards c
       JOIN ratings r ON c.id = r.card_id
       GROUP BY c.id
       HAVING total_ratings >= 3
       ORDER BY avg_rating DESC, total_ratings DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Distribución de colores en el meta (mazos válidos)
  async colorDistribution() {
    const [rows] = await pool.query(
      `SELECT color, COUNT(*) as deck_count,
              ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM decks WHERE is_public = TRUE AND is_valid = TRUE), 2) as percentage
       FROM decks
       WHERE is_public = TRUE AND is_valid = TRUE
       GROUP BY color
       ORDER BY deck_count DESC`
    );
    return rows;
  }

  // Estadísticas generales de la plataforma
  async platformStats() {
    const [cards] = await pool.query('SELECT COUNT(*) as total FROM cards');
    const [sets] = await pool.query('SELECT COUNT(*) as total FROM sets');
    const [users] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [decks] = await pool.query('SELECT COUNT(*) as total FROM decks WHERE is_public = TRUE');
    const [validDecks] = await pool.query('SELECT COUNT(*) as total FROM decks WHERE is_valid = TRUE AND is_public = TRUE');
    const [ratings] = await pool.query('SELECT COUNT(*) as total FROM ratings');
    const [synergies] = await pool.query('SELECT COUNT(*) as total FROM card_synergies');

    return {
      total_cards: cards[0].total,
      total_sets: sets[0].total,
      total_users: users[0].total,
      total_public_decks: decks[0].total,
      total_valid_decks: validDecks[0].total,
      total_ratings: ratings[0].total,
      total_synergies: synergies[0].total
    };
  }

  // Stats por set
  async setStats() {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.code, s.total_cards, s.type,
              COUNT(DISTINCT dc.deck_id) as used_in_decks,
              COALESCE(AVG(r.score), 0) as avg_rating
       FROM sets s
       LEFT JOIN cards c ON c.set_id = s.id
       LEFT JOIN deck_cards dc ON dc.card_id = c.id
       LEFT JOIN ratings r ON r.card_id = c.id
       GROUP BY s.id
       ORDER BY s.id ASC`
    );
    return rows;
  }

  // Distribución de rareza en el meta
  async rarityDistribution() {
    const [rows] = await pool.query(
      `SELECT c.rarity,
              COUNT(DISTINCT dc.deck_id) as deck_count,
              SUM(dc.quantity) as total_copies
       FROM deck_cards dc
       JOIN cards c ON dc.card_id = c.id
       JOIN decks d ON dc.deck_id = d.id AND d.is_public = TRUE
       GROUP BY c.rarity
       ORDER BY total_copies DESC`
    );
    return rows;
  }

  // Tags más populares
  async popularTags(limit = 20) {
    const [rows] = await pool.query(
      `SELECT tag, COUNT(*) as usage_count,
              COUNT(DISTINCT card_id) as cards_tagged
       FROM card_tags
       GROUP BY tag
       ORDER BY usage_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Curva de coste media del meta
  async avgCostCurve() {
    const [rows] = await pool.query(
      `SELECT c.cost, SUM(dc.quantity) as total_cards
       FROM deck_cards dc
       JOIN cards c ON dc.card_id = c.id
       JOIN decks d ON dc.deck_id = d.id AND d.is_public = TRUE AND d.is_valid = TRUE
       WHERE c.cost != '-'
       GROUP BY c.cost
       ORDER BY CAST(c.cost AS UNSIGNED) ASC`
    );
    return rows;
  }
}

module.exports = new AnalyticsService();
