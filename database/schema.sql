-- ============================================
-- DRAGON BALL FUSION WORLD TCG - API DATABASE
-- Ejecutar en phpMyAdmin o MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS dbfw_api
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dbfw_api;

-- ============================================
-- TABLA: sets (colecciones/boosters)
-- ============================================
CREATE TABLE IF NOT EXISTS sets (
  id VARCHAR(10) PRIMARY KEY,           -- ej: 'fb01', 'fs01'
  name VARCHAR(100) NOT NULL,           -- ej: 'Awakened Pulse'
  code VARCHAR(10) NOT NULL,            -- ej: 'FB01'
  type VARCHAR(20) NOT NULL DEFAULT 'booster',
  release_date DATE DEFAULT NULL,
  total_cards INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: cards (catálogo de cartas)
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
  id VARCHAR(20) PRIMARY KEY,           -- ej: 'FB01-001'
  code VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  card_type VARCHAR(20) NOT NULL DEFAULT 'BATTLE',
  color VARCHAR(10) NOT NULL DEFAULT 'Red',
  rarity VARCHAR(5) NOT NULL DEFAULT 'C',
  cost VARCHAR(5) DEFAULT '-',
  specified_cost VARCHAR(10) DEFAULT '-',
  power VARCHAR(10) DEFAULT '-',
  combo_power VARCHAR(10) DEFAULT '-',
  features VARCHAR(255) DEFAULT NULL,    -- ej: 'Saiyan/Universe 7'
  effect TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  set_id VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_cards_name (name),
  INDEX idx_cards_color (color),
  INDEX idx_cards_type (card_type),
  INDEX idx_cards_rarity (rarity),
  INDEX idx_cards_set (set_id),
  FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: users (usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_email (email)
);

-- ============================================
-- TABLA: decks (mazos)
-- ============================================
CREATE TABLE IF NOT EXISTS decks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  leader_card_id VARCHAR(20) NOT NULL,   -- carta líder obligatoria
  color VARCHAR(10) NOT NULL DEFAULT 'Red',
  is_public BOOLEAN DEFAULT TRUE,
  is_valid BOOLEAN DEFAULT FALSE,        -- se valida automáticamente
  total_cards INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_decks_user (user_id),
  INDEX idx_decks_color (color),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (leader_card_id) REFERENCES cards(id) ON DELETE RESTRICT
);

-- ============================================
-- TABLA: deck_cards (cartas dentro de un mazo)
-- ============================================
CREATE TABLE IF NOT EXISTS deck_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deck_id INT NOT NULL,
  card_id VARCHAR(20) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,

  UNIQUE KEY uk_deck_card (deck_id, card_id),
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,

  CHECK (quantity >= 1 AND quantity <= 4)
);

-- ============================================
-- TABLA: ratings (valoraciones de cartas)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_id VARCHAR(20) NOT NULL,
  score TINYINT NOT NULL,                -- 1-5 estrellas
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_user_card_rating (user_id, card_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,

  CHECK (score >= 1 AND score <= 5)
);

-- ============================================
-- TABLA: card_synergies (sinergias entre cartas)
-- ============================================
CREATE TABLE IF NOT EXISTS card_synergies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id_1 VARCHAR(20) NOT NULL,
  card_id_2 VARCHAR(20) NOT NULL,
  description TEXT DEFAULT NULL,          -- por qué combinan bien
  votes INT DEFAULT 0,                   -- votos de la comunidad
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_synergy_pair (card_id_1, card_id_2),
  FOREIGN KEY (card_id_1) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id_2) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: card_tags (tags de la comunidad)
-- ============================================
CREATE TABLE IF NOT EXISTS card_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id VARCHAR(20) NOT NULL,
  tag VARCHAR(50) NOT NULL,              -- ej: 'meta', 'budget', 'staple', 'combo-piece'
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_card_tag_user (card_id, tag, user_id),
  INDEX idx_tag (tag),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Usuario admin por defecto (password: admin123)
-- El hash se genera con bcrypt, rounds=10
-- ============================================
-- NOTA: Ejecuta el seed desde Node.js para crear el admin
-- porque el hash de bcrypt no se puede generar en SQL puro
