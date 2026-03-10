// ============================================
// Servicio de sets (colecciones)
// ============================================
const pool = require('../config/db');

class SetService {

  async getAll() {
    const [rows] = await pool.query(
      `SELECT s.*, COUNT(c.id) as card_count
       FROM sets s
       LEFT JOIN cards c ON c.set_id = s.id
       GROUP BY s.id
       ORDER BY s.id ASC`
    );
    return rows;
  }

  async getById(setId) {
    const [rows] = await pool.query(
      'SELECT * FROM sets WHERE id = ?', [setId]
    );
    if (rows.length === 0) {
      throw { status: 404, message: `Set ${setId} no encontrado.` };
    }
    return rows[0];
  }

  async create(setData) {
    const { id, name, code, type, release_date } = setData;
    await pool.query(
      `INSERT INTO sets (id, name, code, type, release_date)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, code, type || 'booster', release_date || null]
    );
    return this.getById(id);
  }

  async update(setId, updates) {
    const allowed = ['name', 'code', 'type', 'release_date'];
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

    values.push(setId);
    await pool.query(`UPDATE sets SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(setId);
  }

  async delete(setId) {
    const [result] = await pool.query('DELETE FROM sets WHERE id = ?', [setId]);
    if (result.affectedRows === 0) {
      throw { status: 404, message: `Set ${setId} no encontrado.` };
    }
    return { message: `Set ${setId} eliminado.` };
  }
}

module.exports = new SetService();
