-- Selecione o schema do Autosample antes de rodar em um banco vazio.

CREATE TABLE usuario (
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
nome	varchar(50) NOT NULL,
email	varchar(100) NOT NULL UNIQUE,
senha	varchar(255)NOT NULL,
proximidade	varchar(30),
funcao	varchar(30),
perfil varchar(10) NOT NULL DEFAULT 'visitante',
dt_cadastro	DATETIME DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT chk_perfil CHECK (perfil IN ('admin', 'visitante'))
);

CREATE TABLE emocao (
  idEmocao INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(45) NOT NULL,
  PRIMARY KEY (idEmocao),
  CONSTRAINT uk_emocao_nome UNIQUE (nome),
  CONSTRAINT chk_nome CHECK (nome IN ('amor', 'saudade', 'verdade', 'tristeza', 'alegria', 'realizacao', 'orgulho'))
);

CREATE TABLE poesia (
  idPoesia INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  texto TEXT NOT NULL,
  dtCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fkUsuario INT NOT NULL,
  PRIMARY KEY (idPoesia),
  FOREIGN KEY (fkUsuario) REFERENCES usuario(id)
  );
  
  CREATE TABLE musica (
  idMusica INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  artista VARCHAR(100) NOT NULL,
  link VARCHAR(255),
  dtCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fkUsuario INT NOT NULL,
  PRIMARY KEY (idMusica),
  FOREIGN KEY (fkUsuario) REFERENCES usuario(id)
);

CREATE TABLE poesia_emocao (
  fkPoesia INT NOT NULL,
  fkEmocao INT NOT NULL,
  intensidade TINYINT NOT NULL,
  PRIMARY KEY (fkPoesia, fkEmocao),
  FOREIGN KEY (fkPoesia) REFERENCES poesia(idPoesia),
  FOREIGN KEY (fkEmocao) REFERENCES emocao(idEmocao),
  CHECK (intensidade BETWEEN 1 AND 5)
);

CREATE TABLE musica_emocao (
  fkMusica INT NOT NULL,
  fkEmocao INT NOT NULL,
  intensidade TINYINT NOT NULL,
  PRIMARY KEY (fkMusica, fkEmocao),
  FOREIGN KEY (fkMusica) REFERENCES musica(idMusica),
  FOREIGN KEY (fkEmocao) REFERENCES emocao(idEmocao),
  CHECK (intensidade BETWEEN 1 AND 5)
);

CREATE TABLE top_referencias (
  idReferencias INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  genero VARCHAR(100) NOT NULL,
  origem VARCHAR(100),       -- Ex: "Hip-Hop 90s / Zona Sul SP"
  impacto TEXT NOT NULL,            -- Por que é sua referência pessoal
  link VARCHAR(255),
  posicao TINYINT NOT NULL,          -- 1 a 5
  dtCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  fkUsuario INT NOT NULL,
  FOREIGN KEY (fkUsuario) REFERENCES usuario(id),
  CONSTRAINT uk_referencias_posicao UNIQUE (posicao),
  CONSTRAINT chk_posicao_ref CHECK (posicao BETWEEN 1 AND 5)
);

CREATE TABLE top_albuns (
  idAlbum INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,     -- Ex: "Sobrevivendo no Inferno"
  artista VARCHAR(100) NOT NULL,    -- Ex: "Racionais MC's"
  genero VARCHAR(100) NOT NULL,
  ano INT,                          -- Ex: 1997
  faixa_destaque VARCHAR(100),      -- Ex: "Capítulo 4, Versículo 3"
  impacto TEXT NOT NULL,            -- O que esse disco causou na sua vida
  link VARCHAR(255),
  posicao TINYINT NOT NULL,          -- 1 a 5
  dtCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  fkUsuario INT NOT NULL,
  FOREIGN KEY (fkUsuario) REFERENCES usuario(id),
  CONSTRAINT uk_albuns_posicao UNIQUE (posicao),
  CONSTRAINT chk_posicao_album CHECK (posicao BETWEEN 1 AND 5)
);

CREATE TABLE old_school (
  idOldSchool INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,      -- Ex: "The Message" ou "Diário de um Detento"
  artista VARCHAR(100) NOT NULL,     -- Ex: "Grandmaster Flash" ou "Racionais MC's"
  ano INT,                           -- Ex: 1982
  impacto TEXT,                      -- O que essa faixa representa para a história
  link VARCHAR(255),                 -- Link YouTube / Spotify
  dtCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  fkUsuario INT NOT NULL,
  FOREIGN KEY (fkUsuario) REFERENCES usuario(id)
);

CREATE TABLE perfil_musical (
  idPerfil INT PRIMARY KEY AUTO_INCREMENT,
  bio TEXT,                           
  estilo_favorito VARCHAR(50),        
  artista_favorito VARCHAR(100),     
  link_rede_social VARCHAR(255),             
  fkUsuario INT NOT NULL UNIQUE,      
  FOREIGN KEY (fkUsuario) REFERENCES usuario(id)
);


INSERT INTO emocao (nome)
VALUES ('amor'), ('saudade'), ('verdade'), ('tristeza'), ('alegria'), ('realizacao'), ('orgulho');

SHOW TABLES;


SELECT e.nome,
       COUNT(*) AS total,
       AVG(pe.intensidade) AS media
FROM poesia_emocao AS pe
JOIN emocao AS e ON e.idEmocao = pe.fkEmocao
GROUP BY e.nome;


SELECT table_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE() AND referenced_table_name IS NOT NULL;
