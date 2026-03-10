// ============================================
// Servicio de autenticación
// ============================================
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {

  // Registrar nuevo usuario
  async register(username, email, password) {
    // Verificar si ya existe
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      throw { status: 409, message: 'El usuario o email ya existe.' };
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    return {
      id: result.insertId,
      username,
      email,
      role: 'user'
    };
  }

  // Login
  async login(email, password) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  // Obtener perfil
  async getProfile(userId) {
    const [rows] = await pool.query(
      `SELECT id, username, email, role, avatar_url, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      throw { status: 404, message: 'Usuario no encontrado.' };
    }

    // Stats del usuario
    const [deckCount] = await pool.query(
      'SELECT COUNT(*) as total FROM decks WHERE user_id = ?', [userId]
    );
    const [ratingCount] = await pool.query(
      'SELECT COUNT(*) as total FROM ratings WHERE user_id = ?', [userId]
    );

    return {
      ...rows[0],
      stats: {
        totalDecks: deckCount[0].total,
        totalRatings: ratingCount[0].total
      }
    };
  }
}

module.exports = new AuthService();
