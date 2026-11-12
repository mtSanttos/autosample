-- Arquivo de apoio, caso você queira criar tabelas como as aqui criadas para a API funcionar.
-- Você precisa executar os comandos no banco de dados para criar as tabelas,
-- ter este arquivo aqui não significa que a tabela em seu BD estará como abaixo!

/*
comandos para mysql server
*/

CREATE DATABASE autosample;

USE autosample;


CREATE TABLE usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50),
	email VARCHAR(50),
	senha VARCHAR(50),
	proximidade VARCHAR(30),
  	papel VARCHAR(10) NOT NULL DEFAULT 'visitante',
  	dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  	CONSTRAINT chk_papel CHECK (papel IN ('admin', 'visitante'))
);




/* esta tabela deve estar de acordo com o que está em INSERT de sua API do arduino - dat-acqu-ino */



insert into empresa (razao_social, codigo_ativacao) values ('Empresa 1', 'ED145B');
insert into empresa (razao_social, codigo_ativacao) values ('Empresa 2', 'A1B2C3');
insert into aquario (descricao, fk_empresa) values ('Aquário de Estrela-do-mar', 1);
insert into aquario (descricao, fk_empresa) values ('Aquário de Peixe-dourado', 2);