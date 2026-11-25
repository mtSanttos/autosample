var express = require("express");
var router = express.Router();
var acervoController = require("../controllers/acervoController");
var sessao = require("../sessao");
var responder = require("./responder");

var admin = [sessao.exigirSessao, sessao.exigirAdmin];
var mensagemPosicao = "Esta posição já está ocupada no Top 5.";

function registrarColecao(colecao) {
    var rota = "/" + colecao;

    function escolherColecao(req, res, next) {
        req.colecaoAcervo = colecao;
        next();
    }

    router.get(rota, escolherColecao, responder(acervoController.listar));
    router.post(rota, admin, escolherColecao, responder(acervoController.salvar, mensagemPosicao));
    router.put(rota + "/:id", admin, escolherColecao, responder(acervoController.salvar, mensagemPosicao));
    router.delete(rota + "/:id", admin, escolherColecao, responder(acervoController.excluir));
}

registrarColecao("referencias");
registrarColecao("albuns");
registrarColecao("old-school");

module.exports = router;
