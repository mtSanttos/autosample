var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");


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

x