var database = require("../database/config");

function buscarEmocoesPoesia() {
    var instrucaoSql = `
        SELECT e.nome,
               COUNT(*) AS total,
               AVG(pe.intensidade) AS media
        FROM poesia_emocao pe
        JOIN emocao e ON e.idEmocao = pe.fkEmocao
        GROUP BY e.nome;
    `;
    return database.executar(instrucaoSql);
}

async function inserirMusica(titulo, artista, link, emocao, intensidade, usuario_id) {
    try {
        var instrucaoMusica = ` INSERT INTO musica (titulo, artista, link, fkUsuario) VALUES ('${titulo}', '${artista}', '${link}', '${usuario_id}')`;
        var resultadoMusica = await database.executar(instrucaoMusica);
        var idMusicaAdicionada = resultadoMusica.insertId;

        var buscarEmocao = await database.executar(`SELECT idEmocao FROM emocao WHERE nome = '${emocao}'`);
        var idEmocaAdicionada;

        if (buscarEmocao.length > 0) {
            idEmocaAdicionada = buscarEmocao[0].idEmocao;
        } else {
            var instrucaoEmocao = ` INSERT INTO emocao (nome) VALUES ('${emocao}')`;
            var resultadoEmocao = await database.executar(instrucaoEmocao);
            idEmocaAdicionada = resultadoEmocao.insertId;
        }

        var instrucaoMusicaEmocao = ` INSERT INTO musica_emocao (fkMusica, fkEmocao, intensidade) VALUES ('${idMusicaAdicionada}', '${idEmocaAdicionada}', '${intensidade}')`;
        return database.executar(instrucaoMusicaEmocao);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function inserirPoesia(titulo, texto, emocao, intensidade, usuario_id) {
    try {
        var instrucaoPoesia = `INSERT INTO poesia (titulo, texto, fkUsuario) VALUES ('${titulo}', '${texto}', '${usuario_id}')`;
        var resultadoPoesia = await database.executar(instrucaoPoesia);
        var idPoesiaAdicionada = resultadoPoesia.insertId;

        var buscarEmocao = await database.executar(`SELECT idEmocao FROM emocao WHERE nome = '${emocao}'`);
        var idEmocaoAdicionada;

        if (buscarEmocao.length > 0) {
            idEmocaoAdicionada = buscarEmocao[0].idEmocao;
        } else {
            var instrucaoEmocao = `INSERT INTO emocao (nome) VALUES ('${emocao}')`;
            var resultadoEmocao = await database.executar(instrucaoEmocao);
            idEmocaoAdicionada = resultadoEmocao.insertId;
        }

        var instrucaoPoesiaEmocao = `INSERT INTO poesia_emocao (fkPoesia, fkEmocao, intensidade) VALUES ('${idPoesiaAdicionada}', '${idEmocaoAdicionada}', '${intensidade}')`;
        return database.executar(instrucaoPoesiaEmocao);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

function listarPoesias() {
    var instrucaoSql = `
        SELECT p.idPoesia,
               p.titulo,
               p.texto,
               DATE_FORMAT(p.dtCriacao, '%d/%m/%Y %H:%i') AS dtCriacaoFormatada,
               e.nome AS emocao,
               pe.intensidade,
               u.nome AS autor
        FROM poesia p
        JOIN usuario u ON p.fkUsuario = u.id
        LEFT JOIN poesia_emocao pe ON p.idPoesia = pe.fkPoesia
        LEFT JOIN emocao e ON pe.fkEmocao = e.idEmocao
        ORDER BY p.idPoesia DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarMusicas() {
    var instrucaoSql = `
        SELECT m.idMusica,
               m.titulo,
               m.artista,
               m.link,
               DATE_FORMAT(m.dtCriacao, '%d/%m/%Y %H:%i') AS dtCriacaoFormatada,
               e.nome AS emocao,
               me.intensidade,
               u.nome AS autor
        FROM musica m
        JOIN usuario u ON m.fkUsuario = u.id
        LEFT JOIN musica_emocao me ON m.idMusica = me.fkMusica
        LEFT JOIN emocao e ON me.fkEmocao = e.idEmocao
        ORDER BY m.idMusica DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarEmocoesPoesia,
    inserirMusica,
    inserirPoesia,
    listarPoesias,
    listarMusicas
};