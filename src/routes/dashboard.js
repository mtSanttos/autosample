var express = require("express");
var router = express.Router();
var dashboardController = require("../controllers/dashboardController");
var sessao = require("../sessao");
var responder = require("./responder");

var admin = [sessao.exigirSessao, sessao.exigirAdmin];

router.get("/emocoes-poesia", responder(dashboardController.buscarEmocoesPoesia));
router.get("/emocoes", responder(dashboardController.listarEmocoes));
router.get("/listar-poesias", responder(dashboardController.listarPoesias));
router.get("/listar-musicas", responder(dashboardController.listarMusicas));

router.post("/cadastrar-poesia", admin, responder(dashboardController.salvarPoesia));
router.put("/poesias/:id", admin, responder(dashboardController.salvarPoesia));
router.delete("/poesias/:id", admin, responder(dashboardController.excluirPoesia));

router.post("/cadastrar-musica", admin, responder(dashboardController.salvarMusica));
router.put("/musicas/:id", admin, responder(dashboardController.salvarMusica));
router.delete("/musicas/:id", admin, responder(dashboardController.excluirMusica));

module.exports = router;
