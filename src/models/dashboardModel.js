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

module.exports = {
    buscarEmocoesPoesia
};