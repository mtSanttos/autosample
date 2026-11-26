var database = require("../database/config");

function buscarPorEmail(email) {
    var instrucaoSql = `
        SELECT id, nome, email, senha, perfil FROM usuario WHERE email = ?;
    `;
    return database.executar(instrucaoSql, [email]);
}

function cadastrar(nome, email, senha, proximidade, funcao) {
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, proximidade, funcao, perfil)
        VALUES (?, ?, ?, ?, ?, 'visitante');
    `;
    var valores = [nome, email, senha, proximidade, funcao];
    return database.executar(instrucaoSql, valores);
}

async function buscarConta(id) {
    var resultado = await database.executar(`
        SELECT id, nome, email, proximidade, funcao, perfil FROM usuario WHERE id = ?;
    `, [id]);
    return resultado[0];
}

async function buscarSenha(id) {
    var resultado = await database.executar("SELECT senha FROM usuario WHERE id = ?;", [id]);
    return resultado[0]?.senha;
}

function atualizarConta(id, nome, email, proximidade, funcao, senha, senhaAnterior) {
    if (senha) {
        return database.executar(`
            UPDATE usuario SET nome = ?, email = ?, proximidade = ?, funcao = ?, senha = ?
            WHERE id = ? AND BINARY senha = ?;
        `, [nome, email, proximidade, funcao, senha, id, senhaAnterior]);
    }

    return database.executar(`
        UPDATE usuario SET nome = ?, email = ?, proximidade = ?, funcao = ? WHERE id = ?;
    `, [nome, email, proximidade, funcao, id]);
}

function excluirConta(id, perfil, senha) {
    return database.transacao(async function (conexao) {
        if (perfil === "admin") {
            var admins = await database.executar("SELECT id FROM usuario WHERE perfil = 'admin' FOR UPDATE;", [], conexao);
            if (admins.length < 2) return "ultimoAdmin";
        }

        await database.executar("DELETE FROM perfil_musical WHERE fkUsuario = ?;", [id], conexao);
        var resultado = await database.executar("DELETE FROM usuario WHERE id = ? AND BINARY senha = ?;", [id, senha], conexao);
        if (!resultado.affectedRows) {
            var erro = new Error("A senha ou a conta mudou. Entre novamente.");
            erro.status = 409;
            throw erro;
        }
        return "excluida";
    });
}

async function buscarPerfil(id) {
    var resultado = await database.executar(`
        SELECT bio, estilo_favorito, artista_favorito, link_rede_social
        FROM perfil_musical WHERE fkUsuario = ?;
    `, [id]);
    return resultado[0] || null;
}

function cadastrarPerfil(id, bio, estilo, artista, link) {
    return database.executar(`
        INSERT INTO perfil_musical (fkUsuario, bio, estilo_favorito, artista_favorito, link_rede_social)
        VALUES (?, ?, ?, ?, ?);
    `, [id, bio, estilo, artista, link]);
}

function atualizarPerfil(id, bio, estilo, artista, link) {
    return database.executar(`
        UPDATE perfil_musical SET bio = ?, estilo_favorito = ?, artista_favorito = ?, link_rede_social = ?
        WHERE fkUsuario = ?;
    `, [bio, estilo, artista, link, id]);
}

function excluirPerfil(id) {
    return database.executar("DELETE FROM perfil_musical WHERE fkUsuario = ?;", [id]);
}

function contarPorFuncao() {
    return database.executar("SELECT funcao, COUNT(*) AS total FROM usuario WHERE perfil = 'visitante' GROUP BY funcao;");
}

function contarPorProximidade() {
    return database.executar(`
        SELECT proximidade, COUNT(*) AS total FROM usuario
        WHERE perfil = 'visitante' AND proximidade IS NOT NULL GROUP BY proximidade;
    `);
}

module.exports = {
    buscarPorEmail, cadastrar, buscarConta, buscarSenha, atualizarConta, excluirConta,
    buscarPerfil, cadastrarPerfil, atualizarPerfil, excluirPerfil, contarPorFuncao, contarPorProximidade
};
