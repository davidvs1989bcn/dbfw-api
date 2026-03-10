// ============================================
// Configuración de conexión a MySQL (pool)
// ============================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dbfw_api',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL -', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = pool;
