CREATE DATABASE IF NOT EXISTS valkrohn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE valkrohn;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT 'local',
  provider_id VARCHAR(190) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS google_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  google_id VARCHAR(190) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  picture_url VARCHAR(500) NULL,
  synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_google_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS facebook_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  facebook_id VARCHAR(190) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  picture_url VARCHAR(500) NULL,
  connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_facebook_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(24) NOT NULL UNIQUE,
  customer_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address VARCHAR(180) NOT NULL,
  city VARCHAR(80) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  size VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO products (id, name, category, price, image, description) VALUES
(1, 'Tech Jacket', 'chaquetas', 850000, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', 'Chaqueta ligera con corte amplio y acabados premium.'),
(2, 'Cargo Pants', 'pantalones', 580000, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 'Pantalon comodo y estructurado para uso diario.'),
(3, 'Logo Hoodie', 'sudaderas', 445000, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'Sudadera sobria con ajuste comodo.'),
(4, 'Logo Cap', 'accesorios', 220000, 'https://images.unsplash.com/photo-1521369909026-2afed882baee?auto=format&fit=crop&w=900&q=80', 'Gorra con estructura firme y acabado limpio.'),
(5, 'Field Coat', 'chaquetas', 960000, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'Abrigo versatil con estetica tecnica.'),
(6, 'Relax Tee', 'sudaderas', 310000, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80', 'Camiseta de corte relajado y diseno limpio.')
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), image = VALUES(image), description = VALUES(description);
