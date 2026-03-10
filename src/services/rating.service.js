// ============================================
// Servicio de ratings, tags y sinergias
// ============================================
const pool = require('../config/db');

class RatingService {

  // === RATINGS ===

  // Valorar carta (1-5)
  async rateCard(userId, cardId, score, comment) {
    if (score < 1 || score > 5) {
      throw { status: 400, message: 'La puntuación debe ser entre 1 y 5.' };
    }

    // Verificar que la carta existe
    const [card] = await pool.query('SELECT id FROM cards WHERE id = ?', [cardId]);
    if (card.length === 0) {
      throw { status: 404, message: `Carta ${cardId} no encontrada.` };
    }

    // UPSERT: crear o actualizar
    await pool.query(
      `INSERT INTO ratings (user_id, card_id, score, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = ?, comment = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, cardId, score, comment || null, score, comment || null]
    );

    // Devolver rating medio actualizado
    const [avg] = await pool.query(
      `SELECT AVG(score) as avg_rating, COUNT(*) as total
       FROM ratings WHERE card_id = ?`,
      [cardId]
    );

    return {
      card_id: cardId,
      your_score: score,
      avg_rating: parseFloat(avg[0].avg_rating).toFixed(2),
      total_ratings: avg[0].total
    };
  }

  // Obtener ratings de una carta
  async getCardRatings(cardId, pagination) {
    const { limit, offset } = pagination;

    const [rows] = await pool.query(
      `SELECT r.*, u.username
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.card_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [cardId, limit, offset]
    );

    const [total] = await pool.query(
      'SELECT COUNT(*) as total FROM ratings WHERE card_id = ?', [cardId]
    );

    return { ratings: rows, total: total[0].total };
  }

  // Eliminar mi rating
  async deleteRating(userId, cardId) {
    const [result] = await pool.query(
      'DELETE FROM ratings WHERE user_id = ? AND card_id = ?',
      [userId, cardId]
    );
    if (result.affectedRows === 0) {
      throw { status: 404, message: 'No tienes rating para esta carta.' };
    }
    return { message: 'Rating eliminado.' };
  }

  // === TAGS ===

  // Añadir tag a una carta
  async addTag(userId, cardId, tag) {
    const normalizedTag = tag.toLowerCase().trim();

    if (normalizedTag.length < 2 || normalizedTag.length > 50) {
      throw { status: 400, message: 'El tag debe tener entre 2 y 50 caracteres.' };
    }

    const [card] = await pool.query('SELECT id FROM cards WHERE id = ?', [cardId]);
    if (card.length === 0) {
      throw { status: 404, message: `Carta ${cardId} no encontrada.` };
    }

    try {
      await pool.query(
        'INSERT INTO card_tags (card_id, tag, user_id) VALUES (?, ?, ?)',
        [cardId, normalizedTag, userId]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw { status: 409, message: 'Ya has puesto este tag en esta carta.' };
      }
      throw err;
    }

    // Devolver todos los tags de la carta
    const [tags] = await pool.query(
      `SELECT tag, COUNT(*) as count FROM card_tags
       WHERE card_id = ? GROUP BY tag ORDER BY count DESC`,
      [cardId]
    );

    return { card_id: cardId, tags };
  }

  // Eliminar mi tag de una carta
  async removeTag(userId, cardId, tag) {
    const [result] = await pool.query(
      'DELETE FROM card_tags WHERE user_id = ? AND card_id = ? AND tag = ?',
      [userId, cardId, tag.toLowerCase().trim()]
    );
    if (result.affectedRows === 0) {
      throw { status: 404, message: 'Tag no encontrado.' };
    }
    return { message: 'Tag eliminado.' };
  }

  // === SINERGIAS ===

  // Proponer sinergia entre dos cartas
  async addSynergy(userId, cardId1, cardId2, description) {
    if (cardId1 === cardId2) {
      throw { status: 400, message: 'No puedes crear sinergia de una carta consigo misma.' };
    }

    // Ordenar IDs para evitar duplicados invertidos
    const [sorted1, sorted2] = [cardId1, cardId2].sort();

    // Verificar que ambas cartas existen
    const [cards] = await pool.query(
      'SELECT id FROM cards WHERE id IN (?, ?)', [sorted1, sorted2]
    );
    if (cards.length < 2) {
      throw { status: 404, message: 'Una o ambas cartas no existen.' };
    }

    try {
      await pool.query(
        `INSERT INTO card_synergies (card_id_1, card_id_2, description, created_by)
         VALUES (?, ?, ?, ?)`,
        [sorted1, sorted2, description || null, userId]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw { status: 409, message: 'Esta sinergia ya existe.' };
      }
      throw err;
    }

    return { card_id_1: sorted1, card_id_2: sorted2, description };
  }

  // Votar sinergia
  async voteSynergy(synergyId) {
    const [result] = await pool.query(
      'UPDATE card_synergies SET votes = votes + 1 WHERE id = ?',
      [synergyId]
    );
    if (result.affectedRows === 0) {
      throw { status: 404, message: 'Sinergia no encontrada.' };
    }
    return { message: 'Voto registrado.' };
  }
}

module.exports = new RatingService();
