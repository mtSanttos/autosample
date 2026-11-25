var express = require("express");
var router = express.Router();
var usuarioController = require("../controllers/usuarioController");
var sessao = require("../sessao");
var responder = require("./responder");

router.post("/cadastrar", responder(usuarioController.cadastrar, "Este e-mail já está cadastrado."));
router.post("/autenticar", responder(usuarioController.autenticar));
router.get("/por-funcao", responder(usuarioController.contarPorFuncao));
router.get("/por-proximidade", responder(usuarioController.contarPorProximidade));

router.get("/sessao", sessao.exigirSessao, usuarioController.consultarConta);
router.delete("/sessao", function (req, res) {
    sessao.encerrar(req, res);
    res.sendStatus(204);
});

router.get("/conta", sessao.exigirSessao, usuarioController.consultarConta);
router.put("/conta", sessao.exigirSessao, responder(usuarioController.atualizarConta, "Este e-mail já está cadastrado."));
router.delete("/conta", sessao.exigirSessao, responder(usuarioController.excluirConta));

router.get("/perfil-musical", sessao.exigirSessao, responder(usuarioController.consultarPerfil));
router.post("/perfil-musical", sessao.exigirSessao, responder(usuarioController.salvarPerfil, "Sua conta já tem um perfil musical. Atualize a página."));
router.put("/perfil-musical", sessao.exigirSessao, responder(usuarioController.salvarPerfil));
router.delete("/perfil-musical", sessao.exigirSessao, responder(usuarioController.excluirPerfil));

module.exports = router;
