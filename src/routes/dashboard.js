var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

router.get("/emocoes-poesia", function (req, res) {
    dashboardController.buscarEmocoesPoesia(req, res);
});

router.post("/cadastrar-musica", function (req, res) {
    dashboardController.cadastrarMusica(req, res);
});

router.post("/cadastrar-poesia", function (req, res) {
    dashboardController.cadastrarPoesia(req, res);
});

router.get("/listar-poesias", function (req, res) {
    dashboardController.listarPoesias(req, res);
});

router.get("/listar-musicas", function (req, res) {
    dashboardController.listarMusicas(req, res);
});

module.exports = router;