var database = require("../database/config");

function listar(tipo) {
    var instrucaoSql;

    if (tipo === "referencias") {
        instrucaoSql = `
            SELECT c.idReferencias, c.nome, c.genero, c.origem,
                   c.impacto, c.link, c.posicao, c.dtCriacao, u.nome AS autor
            FROM top_referencias c
            JOIN usuario u ON u.id = c.fkUsuario
            ORDER BY c.posicao;
        `;
    } else if (tipo === "albuns") {
        instrucaoSql = `
            SELECT c.idAlbum, c.titulo, c.artista, c.genero, c.ano,
                   c.faixa_destaque, c.impacto, c.link, c.posicao, c.dtCriacao, u.nome AS autor
            FROM top_albuns c
            JOIN usuario u ON u.id = c.fkUsuario
            ORDER BY c.posicao;
        `;
    } else if (tipo === "old-school") {
        instrucaoSql = `
            SELECT c.idOldSchool, c.titulo, c.artista, c.ano,
                   c.impacto, c.link, c.dtCriacao, u.nome AS autor
            FROM old_school c
            JOIN usuario u ON u.id = c.fkUsuario
            ORDER BY c.idOldSchool DESC;
        `;
    } else {
        throw new Error("Coleção do acervo inválida.");
    }

    return database.executar(instrucaoSql);
}

function cadastrar(tipo, dados, idUsuario) {
    var instrucaoSql;
    var valores;

    if (tipo === "referencias") {
        instrucaoSql = `
            INSERT INTO top_referencias (nome, genero, origem, impacto, link, posicao, fkUsuario)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        valores = [dados.nome, dados.genero, dados.origem, dados.impacto, dados.link, dados.posicao, idUsuario];
    } else if (tipo === "albuns") {
        instrucaoSql = `
            INSERT INTO top_albuns (titulo, artista, genero, ano, faixa_destaque, impacto, link, posicao, fkUsuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        valores = [
            dados.titulo, dados.artista, dados.genero, dados.ano,
            dados.faixa_destaque, dados.impacto, dados.link, dados.posicao, idUsuario
        ];
    } else if (tipo === "old-school") {
        instrucaoSql = `
            INSERT INTO old_school (titulo, artista, ano, impacto, link, fkUsuario)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        valores = [dados.titulo, dados.artista, dados.ano, dados.impacto, dados.link, idUsuario];
    } else {
        throw new Error("Coleção do acervo inválida.");
    }

    return database.executar(instrucaoSql, valores);
}

function atualizar(tipo, id, dados) {
    var instrucaoSql;
    var valores;

    if (tipo === "referencias") {
        instrucaoSql = `
            UPDATE top_referencias
            SET nome = ?, genero = ?, origem = ?, impacto = ?,
                link = ?, posicao = ?
            WHERE idReferencias = ?;
        `;
        valores = [dados.nome, dados.genero, dados.origem, dados.impacto, dados.link, dados.posicao, id];
    } else if (tipo === "albuns") {
        instrucaoSql = `
            UPDATE top_albuns
            SET titulo = ?, artista = ?, genero = ?, ano = ?,
                faixa_destaque = ?, impacto = ?, link = ?, posicao = ?
            WHERE idAlbum = ?;
        `;
        valores = [
            dados.titulo, dados.artista, dados.genero, dados.ano,
            dados.faixa_destaque, dados.impacto, dados.link, dados.posicao, id
        ];
    } else if (tipo === "old-school") {
        instrucaoSql = `
            UPDATE old_school
            SET titulo = ?, artista = ?, ano = ?, impacto = ?,
                link = ?
            WHERE idOldSchool = ?;
        `;
        valores = [dados.titulo, dados.artista, dados.ano, dados.impacto, dados.link, id];
    } else {
        throw new Error("Coleção do acervo inválida.");
    }

    return database.executar(instrucaoSql, valores);
}

function excluir(tipo, id) {
    var instrucaoSql;

    if (tipo === "referencias") {
        instrucaoSql = `
            DELETE FROM top_referencias WHERE idReferencias = ?;
        `;
    } else if (tipo === "albuns") {
        instrucaoSql = `
            DELETE FROM top_albuns WHERE idAlbum = ?;
        `;
    } else if (tipo === "old-school") {
        instrucaoSql = `
            DELETE FROM old_school WHERE idOldSchool = ?;
        `;
    } else {
        throw new Error("Coleção do acervo inválida.");
    }

    return database.executar(instrucaoSql, [id]);
}

module.exports = { listar, cadastrar, atualizar, excluir };
