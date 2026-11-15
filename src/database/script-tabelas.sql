USE autosample;

DESCRIBE usuario;

CREATE TABLE usuario (
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
nome	varchar(50) NOT NULL,
email	varchar(100) NOT NULL UNIQUE,
senha	varchar(255)NOT NULL,
proximidade	varchar(30),
funcao	varchar(30),
perfil	varchar(10) NOT NULL, 
dt_cadastro	DATETIME DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT chk_perfil CHECK ((perfil IN ('admin', 'visitante'))
);


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


SELECT e.nome,
       COUNT(*) AS total,
       AVG(pe.intensidade) AS media
FROM poesia_emocao AS pe
JOIN emocao AS e ON e.idEmocao = pe.fkEmocao
GROUP BY e.nome;


SELECT table_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE() AND referenced_table_name IS NOT NULL;
















