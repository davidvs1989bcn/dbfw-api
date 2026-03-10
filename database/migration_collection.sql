-- ============================================
-- MIGRACIÓN: Sistema de colección + usuarios
-- Ejecutar: node seed/migrate.js
-- ============================================
USE dbfw_api;

-- Tabla de colección de cartas por usuario
CREATE TABLE IF NOT EXISTS user_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_id VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'wanted',
  quantity INT DEFAULT 1,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_user_card (user_id, card_id),
  INDEX idx_collection_user (user_id),
  INDEX idx_collection_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);
