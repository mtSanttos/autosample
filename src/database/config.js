var mysql = require("mysql2/promise");

var conexoes = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function executar(instrucao, valores, conexao) {
    var [resultados] = await (conexao || conexoes).execute(instrucao, valores);
    return resultados;
}

async function transacao(operacao) {
    var conexao = await conexoes.getConnection();

    try {
        await conexao.beginTransaction();
        var resultado = await operacao(conexao);
        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

module.exports = { executar, transacao };
