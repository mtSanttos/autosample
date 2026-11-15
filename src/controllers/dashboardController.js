var dashboardModel = require("../models/dashboardModel");

function buscarEmocoesPoesia(req, res) {
    dashboardModel.buscarEmocoesPoesia()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao buscar emoções:", erro.sqlMessage);
            res.status(500).json("Erro ao buscar os dados do painel.");
        });
}

module.exports = {
    buscarEmocoesPoesia
};