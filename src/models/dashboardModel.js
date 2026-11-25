var database = require("../database/config");

var obras = {
    poesia: { tabela: "poesia", id: "idPoesia", vinculo: "poesia_emocao", fk: "fkPoesia" },
    musica: { tabela: "musica", id: "idMusica", vinculo: "musica_emocao", fk: "fkMusica" }
};

function buscarEmocoesPoesia() {
    return database.executar(`
        SELECT e.nome, COUNT(*) AS total, AVG(pe.intensidade) AS media
        FROM poesia_emocao pe
        JOIN emocao e ON e.idEmocao = pe.fkEmocao
        GROUP BY e.nome
        ORDER BY e.nome;
    `);
}

function listarEmocoes() {
    return database.executar("SELECT idEmocao, nome FROM emocao ORDER BY idEmocao;");
}

async function listarObras(tipo) {
    var obra = obras[tipo];
    var camposObra;

    if (tipo === "poesia") {
        camposObra = "o.idPoesia, o.titulo, o.texto";
    } else {
        camposObra = "o.idMusica, o.titulo, o.artista, o.link";
    }

    var instrucaoSql = `
        SELECT ${camposObra}, DATE_FORMAT(o.dtCriacao, '%d/%m/%Y %H:%i') AS dtCriacaoFormatada,
               u.nome AS autor, e.nome AS emocao, v.intensidade
        FROM ${obra.tabela} o
        JOIN usuario u ON u.id = o.fkUsuario
        LEFT JOIN ${obra.vinculo} v ON v.${obra.fk} = o.${obra.id}
        LEFT JOIN emocao e ON e.idEmocao = v.fkEmocao
        ORDER BY o.${obra.id} DESC, e.nome;
    `;
    var linhas = await database.executar(instrucaoSql);
    var registros = [];
    var registro;

    // O ORDER BY deixa juntas todas as linhas da mesma obra.
    for (var i = 0; i < linhas.length; i++) {
        var linha = linhas[i];

        if (!registro || registro[obra.id] !== linha[obra.id]) {
            registro = linha;
            registro.emocoes = [];
            registros.push(registro);
        }

        if (linha.emocao) {
            registro.emocoes.push({ nome: linha.emocao, intensidade: linha.intensidade });
        }
    }

    return registros;
}

async function salvarVinculos(obra, id, emocoes, conexao) {
    var catalogo = await database.executar("SELECT idEmocao, nome FROM emocao;", [], conexao);
    for (var emocao of emocoes) {
        var item = catalogo.find(function (itemCatalogo) {
            return itemCatalogo.nome === emocao.nome;
        });
        if (!item) {
            var erro = new Error("Selecione uma emoção do catálogo.");
            erro.status = 400;
            throw erro;
        }
        await database.executar(`
            INSERT INTO ${obra.vinculo} (${obra.fk}, fkEmocao, intensidade) VALUES (?, ?, ?);
        `, [id, item.idEmocao, emocao.intensidade], conexao);
    }
}

function inserirObra(tipo, dados, idUsuario, conexao) {
    var instrucaoSql;
    var valores;

    if (tipo === "poesia") {
        instrucaoSql = `
            INSERT INTO poesia (titulo, texto, fkUsuario) VALUES (?, ?, ?);
        `;
        valores = [dados.titulo, dados.texto, idUsuario];
    } else {
        instrucaoSql = `
            INSERT INTO musica (titulo, artista, link, fkUsuario) VALUES (?, ?, ?, ?);
        `;
        valores = [dados.titulo, dados.artista, dados.link, idUsuario];
    }

    return database.executar(instrucaoSql, valores, conexao);
}

function atualizarObra(tipo, id, dados, conexao) {
    var instrucaoSql;
    var valores;

    if (tipo === "poesia") {
        instrucaoSql = `
            UPDATE poesia SET titulo = ?, texto = ? WHERE idPoesia = ?;
        `;
        valores = [dados.titulo, dados.texto, id];
    } else {
        instrucaoSql = `
            UPDATE musica SET titulo = ?, artista = ?, link = ? WHERE idMusica = ?;
        `;
        valores = [dados.titulo, dados.artista, dados.link, id];
    }

    return database.executar(instrucaoSql, valores, conexao);
}

function salvarObra(tipo, id, dados, emocoes, idUsuario) {
    var obra = obras[tipo];

    return database.transacao(async function (conexao) {
        var idObra = id;

        if (idObra === null) {
            var cadastro = await inserirObra(tipo, dados, idUsuario, conexao);
            idObra = cadastro.insertId;
        } else {
            var atualizacao = await atualizarObra(tipo, idObra, dados, conexao);
            if (!atualizacao.affectedRows) {
                return null;
            }

            // Na edição, a lista enviada substitui os vínculos anteriores.
            var excluirVinculos = `DELETE FROM ${obra.vinculo} WHERE ${obra.fk} = ?;`;
            await database.executar(excluirVinculos, [idObra], conexao);
        }

        // Se um vínculo falhar, a transação desfaz também a alteração da obra.
        await salvarVinculos(obra, idObra, emocoes, conexao);

        if (tipo === "poesia") {
            return { idPoesia: idObra };
        }
        return { idMusica: idObra };
    });
}

function excluirObra(tipo, id) {
    var obra = obras[tipo];
    return database.transacao(async function (conexao) {
        var resultado = await database.executar(`
            SELECT ${obra.id} FROM ${obra.tabela} WHERE ${obra.id} = ? FOR UPDATE;
        `, [id], conexao);
        if (!resultado.length) return false;

        await database.executar(`DELETE FROM ${obra.vinculo} WHERE ${obra.fk} = ?;`, [id], conexao);
        await database.executar(`DELETE FROM ${obra.tabela} WHERE ${obra.id} = ?;`, [id], conexao);
        return true;
    });
}

module.exports = { buscarEmocoesPoesia, listarEmocoes, listarObras, salvarObra, excluirObra };
