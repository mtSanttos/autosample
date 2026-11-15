USE autosample;

DESCRIBE usuario;

CREATE TABLE emocao (
  idEmocao INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(45) NOT NULL,
  PRIMARY KEY (idEmocao),
  UNIQUE (nome)
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

SHOW TABLES;