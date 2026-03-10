const pool = require('../config/db');

class CollectionService {

  async getUserCollection(userId, filters) {
    let where = ['uc.user_id = ?'];
    let params = [userId];

    if (filters.status) {
      where.push('uc.status = ?');
      params.push(filters.status);
    }
    if (filters.set_id) {
      where.push('c.set_id = ?');
      params.push(filters.set_id);
    }

    const [rows] = await pool.query(
      `SELECT uc.*, c.name, c.card_type, c.color, c.rarity, c.cost, c.power,
              c.image_url, c.set_id, c.features
       FROM user_collections uc
       JOIN cards c ON uc.card_id = c.id
       WHERE ${where.join(' AND ')}
       ORDER BY c.set_id ASC, c.id ASC`,
      params
    );

    return rows;
  }

  async getCollectionStats(userId) {
    const [statusCount] = await pool.query(
      `SELECT status, COUNT(*) as count, SUM(quantity) as total_qty
       FROM user_collections WHERE user_id = ? GROUP BY status`,
      [userId]
    );

    const [colorCount] = await pool.query(
      `SELECT c.color, uc.status, COUNT(*) as count
       FROM user_collections uc JOIN cards c ON uc.card_id = c.id
       WHERE uc.user_id = ? GROUP BY c.color, uc.status`,
      [userId]
    );

    const [setCount] = await pool.query(
      `SELECT c.set_id, COUNT(*) as owned,
              (SELECT COUNT(*) FROM cards c2 WHERE c2.set_id = c.set_id) as total
       FROM user_collections uc JOIN cards c ON uc.card_id = c.id
       WHERE uc.user_id = ? AND uc.status = 'owned'
       GROUP BY c.set_id`,
      [userId]
    );

    return { by_status: statusCount, by_color: colorCount, completion: setCount };
  }

  async setCardStatus(userId, cardId, status, quantity, notes) {
    const valid = ['owned', 'wanted', 'ordered', 'trading'];
    if (!valid.includes(status)) {
      throw { status: 400, message: `Status must be: ${valid.join(', ')}` };
    }

    const [card] = await pool.query('SELECT id FROM cards WHERE id = ?', [cardId]);
    if (card.length === 0) throw { status: 404, message: `Card ${cardId} not found.` };

    await pool.query(
      `INSERT INTO user_collections (user_id, card_id, status, quantity, notes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, quantity = ?, notes = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, cardId, status, quantity || 1, notes || null, status, quantity || 1, notes || null]
    );

    return { card_id: cardId, status, quantity: quantity || 1 };
  }

  async bulkSetStatus(userId, cardIds, status) {
    const valid = ['owned', 'wanted', 'ordered', 'trading'];
    if (!valid.includes(status)) {
      throw { status: 400, message: `Status must be: ${valid.join(', ')}` };
    }

    let count = 0;
    for (const cardId of cardIds) {
      try {
        await pool.query(
          `INSERT INTO user_collections (user_id, card_id, status) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE status = ?, updated_at = CURRENT_TIMESTAMP`,
          [userId, cardId, status, status]
        );
        count++;
      } catch (e) {}
    }

    return { updated: count, status };
  }

  async removeFromCollection(userId, cardId) {
    const [r] = await pool.query(
      'DELETE FROM user_collections WHERE user_id = ? AND card_id = ?',
      [userId, cardId]
    );
    if (r.affectedRows === 0) throw { status: 404, message: 'Card not in collection.' };
    return { removed: cardId };
  }
}

module.exports = new CollectionService();
