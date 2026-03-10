// ============================================
// Servicio de mazos (deck builder)
// ============================================
const pool = require('../config/db');
const { validateDeck } = require('../utils/deckValidator');

class DeckService {

  // Obtener mazos públicos con filtros
  async getPublicDecks(filters, pagination) {
    const { page, limit, offset } = pagination;
    let where = ['d.is_public = TRUE'];
    let params = [];

    if (filters.color) {
      where.push('d.color = ?');
      params.push(filters.color);
    }
    if (filters.leader) {
      where.push('d.leader_card_id LIKE ?');
      params.push(`%${filters.leader}%`);
    }
    if (filters.user_id) {
      where.push('d.user_id = ?');
      params.push(filters.user_id);
    }
    if (filters.is_valid !== undefined) {
      where.push('d.is_valid = ?');
      params.push(filters.is_valid === 'true' ? 1 : 0);
    }

    const whereClause = 'WHERE ' + where.join(' AND ');

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM decks d ${whereClause}`, params
    );

    const [rows] = await pool.query(
      `SELECT d.*,
              u.username as author,
              lc.name as leader_name, lc.image_url as leader_image
       FROM decks d
       JOIN users u ON d.user_id = u.id
       JOIN cards lc ON d.leader_card_id = lc.id
       ${whereClause}
       ORDER BY d.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { decks: rows, total: countResult[0].total, page, limit };
  }

  // Obtener mazos de un usuario
  async getUserDecks(userId) {
    const [rows] = await pool.query(
      `SELECT d.*, lc.name as leader_name, lc.image_url as leader_image
       FROM decks d
       JOIN cards lc ON d.leader_card_id = lc.id
       WHERE d.user_id = ?
       ORDER BY d.updated_at DESC`,
      [userId]
    );
    return rows;
  }

  // Obtener mazo por ID con todas sus cartas
  async getById(deckId, requestUserId = null) {
    const [rows] = await pool.query(
      `SELECT d.*, u.username as author,
              lc.name as leader_name, lc.image_url as leader_image,
              lc.color as leader_color, lc.effect as leader_effect
       FROM decks d
       JOIN users u ON d.user_id = u.id
       JOIN cards lc ON d.leader_card_id = lc.id
       WHERE d.id = ?`,
      [deckId]
    );

    if (rows.length === 0) {
      throw { status: 404, message: 'Mazo no encontrado.' };
    }

    const deck = rows[0];

    // Solo visible si es público o es del propio usuario
    if (!deck.is_public && deck.user_id !== requestUserId) {
      throw { status: 403, message: 'Este mazo es privado.' };
    }

    // Cartas del mazo
    const [cards] = await pool.query(
      `SELECT dc.quantity, c.*,
              COALESCE(AVG(r.score), 0) as avg_rating
       FROM deck_cards dc
       JOIN cards c ON dc.card_id = c.id
       LEFT JOIN ratings r ON c.id = r.card_id
       WHERE dc.deck_id = ?
       GROUP BY c.id, dc.quantity
       ORDER BY c.cost ASC, c.name ASC`,
      [deckId]
    );

    // Estadísticas del mazo
    const colorDist = {};
    const typeDist = {};
    const costCurve = {};

    for (const card of cards) {
      // Distribución por tipo
      typeDist[card.card_type] = (typeDist[card.card_type] || 0) + card.quantity;
      // Curva de coste
      const costKey = card.cost === '-' ? '0' : card.cost;
      costCurve[costKey] = (costCurve[costKey] || 0) + card.quantity;
    }

    return {
      ...deck,
      cards,
      stats: {
        total_cards: cards.reduce((sum, c) => sum + c.quantity, 0),
        type_distribution: typeDist,
        cost_curve: costCurve,
        avg_cost: this._calcAvgCost(cards)
      }
    };
  }

  // Crear mazo
  async create(userId, deckData) {
    const { name, description, leader_card_id, is_public } = deckData;

    // Verificar que el líder existe y es LEADER
    const [leader] = await pool.query(
      'SELECT * FROM cards WHERE id = ? AND card_type = ?',
      [leader_card_id, 'LEADER']
    );

    if (leader.length === 0) {
      throw { status: 400, message: 'La carta líder no existe o no es de tipo LEADER.' };
    }

    const [result] = await pool.query(
      `INSERT INTO decks (user_id, name, description, leader_card_id, color, is_public)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, description || null, leader_card_id, leader[0].color, is_public !== false]
    );

    return this.getById(result.insertId, userId);
  }

  // Añadir cartas al mazo
  async addCards(deckId, userId, cards) {
    // Verificar propiedad
    await this._verifyOwnership(deckId, userId);

    for (const { card_id, quantity } of cards) {
      // Verificar que la carta existe
      const [card] = await pool.query('SELECT id FROM cards WHERE id = ?', [card_id]);
      if (card.length === 0) {
        throw { status: 400, message: `Carta ${card_id} no existe.` };
      }

      // INSERT o UPDATE si ya existe
      await pool.query(
        `INSERT INTO deck_cards (deck_id, card_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = ?`,
        [deckId, card_id, quantity || 1, quantity || 1]
      );
    }

    // Revalidar mazo
    await this._revalidate(deckId);

    return this.getById(deckId, userId);
  }

  // Quitar carta del mazo
  async removeCard(deckId, userId, cardId) {
    await this._verifyOwnership(deckId, userId);

    await pool.query(
      'DELETE FROM deck_cards WHERE deck_id = ? AND card_id = ?',
      [deckId, cardId]
    );

    await this._revalidate(deckId);
    return this.getById(deckId, userId);
  }

  // Eliminar mazo
  async delete(deckId, userId) {
    await this._verifyOwnership(deckId, userId);
    await pool.query('DELETE FROM decks WHERE id = ?', [deckId]);
    return { message: 'Mazo eliminado.' };
  }

  // Validar mazo (endpoint público)
  async validate(deckId) {
    const deck = await this.getById(deckId);

    // Obtener datos completos de las cartas
    const [leader] = await pool.query(
      'SELECT * FROM cards WHERE id = ?', [deck.leader_card_id]
    );
    const [deckCards] = await pool.query(
      `SELECT c.*, dc.quantity FROM deck_cards dc
       JOIN cards c ON dc.card_id = c.id
       WHERE dc.deck_id = ?`,
      [deckId]
    );

    const result = validateDeck(leader[0], deckCards);
    return result;
  }

  // === Helpers privados ===

  async _verifyOwnership(deckId, userId) {
    const [rows] = await pool.query(
      'SELECT user_id FROM decks WHERE id = ?', [deckId]
    );
    if (rows.length === 0) {
      throw { status: 404, message: 'Mazo no encontrado.' };
    }
    if (rows[0].user_id !== userId) {
      throw { status: 403, message: 'No eres el dueño de este mazo.' };
    }
  }

  async _revalidate(deckId) {
    const [deck] = await pool.query('SELECT * FROM decks WHERE id = ?', [deckId]);
    const [leader] = await pool.query(
      'SELECT * FROM cards WHERE id = ?', [deck[0].leader_card_id]
    );
    const [deckCards] = await pool.query(
      `SELECT c.*, dc.quantity FROM deck_cards dc
       JOIN cards c ON dc.card_id = c.id WHERE dc.deck_id = ?`,
      [deckId]
    );

    const totalCards = deckCards.reduce((sum, c) => sum + c.quantity, 0);
    const { isValid } = validateDeck(leader[0], deckCards);

    await pool.query(
      'UPDATE decks SET is_valid = ?, total_cards = ? WHERE id = ?',
      [isValid, totalCards, deckId]
    );
  }

  _calcAvgCost(cards) {
    let total = 0, count = 0;
    for (const c of cards) {
      const cost = parseInt(c.cost);
      if (!isNaN(cost)) {
        total += cost * c.quantity;
        count += c.quantity;
      }
    }
    return count > 0 ? (total / count).toFixed(2) : '0.00';
  }
}

module.exports = new DeckService();
