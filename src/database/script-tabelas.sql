
CREATE DATABASE autosample;

USE autosample;

CREATE TABLE usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  proximidade VARCHAR(30),
  perfil VARCHAR(10) NOT NULL DEFAULT 'visitante',
  dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_perfil CHECK (perfil IN ('admin', 'visitante'))
);

