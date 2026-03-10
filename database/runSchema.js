// ============================================
// Ejecuta el schema.sql en la base de datos
// Uso: node database/runSchema.js
// ============================================
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSchema() {
  // Conexión SIN especificar DB (para poder crearla)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Ejecutando schema.sql...');
    await connection.query(sql);
    console.log('✅ Base de datos y tablas creadas correctamente');

    // Crear usuario admin por defecto
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);

    await connection.query(`USE dbfw_api`);
    await connection.query(
      `INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
      ['admin', 'admin@dbfw.com', hash, 'admin']
    );
    console.log('✅ Usuario admin creado (admin@dbfw.com / admin123)');

  } catch (error) {
    console.error('❌ Error ejecutando schema:', error.message);
  } finally {
    await connection.end();
  }
}

runSchema();
