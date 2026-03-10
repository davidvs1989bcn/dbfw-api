const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbfw_api',
    multipleStatements: true
  });

  try {
    // 1. Ejecutar migration SQL
    const sql = fs.readFileSync(path.join(__dirname, 'migration_collection.sql'), 'utf8');
    await conn.query(sql);
    console.log('Tabla user_collections creada');

    // 2. Crear usuarios
    const users = [
      { username: 'admin', email: 'admin@dbfw.com', password: 'admin123', role: 'admin' },
      { username: 'Alessio', email: 'alessio@dbfw.com', password: 'alessio123', role: 'user' }
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await conn.query(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE password = ?, role = ?`,
        [u.username, u.email, hash, u.role, hash, u.role]
      );
      console.log(`Usuario "${u.username}" listo (${u.email} / ${u.password}) [${u.role}]`);
    }

    console.log('\nMigracion completada');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
  }
}

migrate();
