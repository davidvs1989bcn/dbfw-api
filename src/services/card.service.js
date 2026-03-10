// ============================================
// Servicio de cartas (catálogo)
// ============================================
const pool = require('../config/db');

class CardService {

  // Obtener todas las cartas con filtros y paginación
  async getAll(filters, pagination) {
    const { page, limit, offset } = pagination;
    let where = [];
    let params = [];

    // Filtros dinámicos
    if (filters.name) {
      where.push('c.name LIKE ?');
      params.push(`%${filters.name}%`);
    }
    if (filters.color) {
      where.push('c.color = ?');
      params.push(filters.color);
    }
    if (filters.card_type) {
      where.push('c.card_type = ?');
      params.push(filters.card_type);
    }
    if (filters.rarity) {
      where.push('c.rarity = ?');
      params.push(filters.rarity);
    }
    if (filters.set_id) {
      where.push('c.set_id = ?');
      params.push(filters.set_id);
    }
    if (filters.cost && filters.cost !== '-') {
      where.push('c.cost = ?');
      params.push(filters.cost);
    }
    if (filters.min_power) {
      where.push('CAST(c.power AS UNSIGNED) >= ?');
      params.push(parseInt(filters.min_power));
    }
    if (filters.max_power) {
      where.push('CAST(c.power AS UNSIGNED) <= ?');
      params.push(parseInt(filters.max_power));
    }
    if (filters.features) {
      where.push('c.features LIKE ?');
      params.push(`%${filters.features}%`);
    }
    if (filters.effect) {
      where.push('c.effect LIKE ?');
      params.push(`%${filters.effect}%`);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    // Total para paginación
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM cards c ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Query principal con JOIN al set + rating medio
    const [rows] = await pool.query(
      `SELECT c.*,
              s.name as set_name, s.code as set_code, s.type as set_type,
              COALESCE(AVG(r.score), 0) as avg_rating,
              COUNT(r.id) as total_ratings
       FROM cards c
       LEFT JOIN sets s ON c.set_id = s.id
       LEFT JOIN ratings r ON c.id = r.card_id
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.set_id ASC, c.id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { cards: rows, total, page, limit };
  }

  // Obtener carta por ID con toda la info
  async getById(cardId) {
    const [rows] = await pool.query(
      `SELECT c.*,
              s.name as set_name, s.code as set_code, s.type as set_type,
              COALESCE(AVG(r.score), 0) as avg_rating,
              COUNT(r.id) as total_ratings
       FROM cards c
       LEFT JOIN sets s ON c.set_id = s.id
       LEFT JOIN ratings r ON c.id = r.card_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [cardId]
    );

    if (rows.length === 0) {
      throw { status: 404, message: `Carta ${cardId} no encontrada.` };
    }

    // Tags de la comunidad
    const [tags] = await pool.query(
      `SELECT tag, COUNT(*) as count
       FROM card_tags WHERE card_id = ?
       GROUP BY tag ORDER BY count DESC`,
      [cardId]
    );

    // Sinergias
    const [synergies] = await pool.query(
      `SELECT cs.*, 
              c1.name as card_name_1, c1.image_url as card_image_1,
              c2.name as card_name_2, c2.image_url as card_image_2
       FROM card_synergies cs
       JOIN cards c1 ON cs.card_id_1 = c1.id
       JOIN cards c2 ON cs.card_id_2 = c2.id
       WHERE cs.card_id_1 = ? OR cs.card_id_2 = ?
       ORDER BY cs.votes DESC LIMIT 10`,
      [cardId, cardId]
    );

    // Nº de mazos que usan esta carta
    const [deckUsage] = await pool.query(
      `SELECT COUNT(DISTINCT dc.deck_id) as decks_using
       FROM deck_cards dc
       JOIN decks d ON dc.deck_id = d.id
       WHERE dc.card_id = ? AND d.is_public = TRUE`,
      [cardId]
    );

    return {
      ...rows[0],
      tags,
      synergies,
      decks_using: deckUsage[0].decks_using
    };
  }

  // Crear carta (admin)
  async create(cardData) {
    const { id, code, name, card_type, color, rarity, cost, specified_cost,
            power, combo_power, features, effect, image_url, set_id } = cardData;

    // Verificar que el set existe
    const [setExists] = await pool.query('SELECT id FROM sets WHERE id = ?', [set_id]);
    if (setExists.length === 0) {
      throw { status: 400, message: `El set ${set_id} no existe.` };
    }

    await pool.query(
      `INSERT INTO cards (id, code, name, card_type, color, rarity, cost,
       specified_cost, power, combo_power, features, effect, image_url, set_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, code, name, card_type, color, rarity, cost || '-',
       specified_cost || '-', power || '-', combo_power || '-',
       features, effect, image_url, set_id]
    );

    // Actualizar contador del set
    await pool.query(
      'UPDATE sets SET total_cards = (SELECT COUNT(*) FROM cards WHERE set_id = ?) WHERE id = ?',
      [set_id, set_id]
    );

    return this.getById(id);
  }

  // Actualizar carta (admin)
  async update(cardId, updates) {
    const allowed = ['name', 'card_type', 'color', 'rarity', 'cost', 'specified_cost',
                     'power', 'combo_power', 'features', 'effect', 'image_url'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) {
      throw { status: 400, message: 'No hay campos para actualizar.' };
    }

    values.push(cardId);
    await pool.query(
      `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(cardId);
  }

  // Eliminar carta (admin)
  async delete(cardId) {
    const [result] = await pool.query('DELETE FROM cards WHERE id = ?', [cardId]);
    if (result.affectedRows === 0) {
      throw { status: 404, message: `Carta ${cardId} no encontrada.` };
    }
    return { message: `Carta ${cardId} eliminada.` };
  }

  // Búsqueda avanzada por texto en nombre y efecto
  async search(query) {
    const [rows] = await pool.query(
      `SELECT c.*, s.name as set_name,
              COALESCE(AVG(r.score), 0) as avg_rating
       FROM cards c
       LEFT JOIN sets s ON c.set_id = s.id
       LEFT JOIN ratings r ON c.id = r.card_id
       WHERE c.name LIKE ? OR c.effect LIKE ? OR c.features LIKE ?
       GROUP BY c.id
       ORDER BY c.name ASC
       LIMIT 50`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }
}

module.exports = new CardService();
