var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/por-funcao", function (req, res) {
    usuarioController.contarPorFuncao(req, res);
});

router.get("/por-proximidade", function (req, res) {
    usuarioController.contarPorProximidade(req, res);
});

module.exports = router;