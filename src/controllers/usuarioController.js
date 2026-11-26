var usuarioModel = require("../models/usuarioModel");
var sessao = require("../sessao");
var validacao = require("../validacao");

var senhaSegura = require("../senha");

var proximidades = ["amigo", "familia", "cena", "site", "professor", "admin"];
var funcoes = ["MC", "beatmaker", "DJ", "produtor", "ouvinte"];

function validarSenhaNova(senha) {
    var simbolos = "!@#$%&*()_+-=[]{};:,.<>?/|~";
    var numeros = "0123456789";
    var temSimbolo = false;
    var temNumero = false;

    if (typeof senha === "string" && senha.length <= 255) {
        for (var i = 0; i < senha.length; i++) {
            if (simbolos.includes(senha[i])) temSimbolo = true;
            if (numeros.includes(senha[i])) temNumero = true;
        }

        var temMaiuscula = senha !== senha.toLowerCase();
        var temMinuscula = senha !== senha.toUpperCase();
        if (temSimbolo && temNumero && temMaiuscula && temMinuscula) return;
    }

    var erro = new Error("Use uma senha com maiúscula, minúscula, número e símbolo.");
    erro.status = 400;
    throw erro;
}

function lerConta(corpo) {
    var dados = validacao.lerCampos(corpo, [
        ["nomeServer", "nome", 50, true],
        ["emailServer", "e-mail", 100, true],
        ["proximidadeServer", "proximidade", 30, true],
        ["funcaoServer", "função", 30, true]
    ]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.emailServer) ||
        !proximidades.includes(dados.proximidadeServer) || !funcoes.includes(dados.funcaoServer)) {
        var erro = new Error("Confira o e-mail, a proximidade e a função.");
        erro.status = 400;
        throw erro;
    }
    return dados;
}

async function autenticar(req, res) {
    var email = validacao.texto(req.body.emailServer, 100);
    var senha = req.body.senhaServer;
    if (!email || typeof senha !== "string" || !senha || senha.length > 255) {
        return res.status(400).send("Informe e-mail e senha válidos.");
    }

    var usuarios = await usuarioModel.buscarPorEmail(email);
    var usuario = usuarios[0];
    if (!usuario) {
        return res.status(403).send("E-mail ou senha inválidos.");
    }

    var senhaCorreta = await senhaSegura.conferirSenha(senha, usuario.senha);
    if (!senhaCorreta) {
        return res.status(403).send("E-mail ou senha inválidos.");
    }

    if (!senhaSegura.senhaTemHash(usuario.senha)) {
        var novoHash = await senhaSegura.gerarHash(senha);
        var resultado = await usuarioModel.atualizarSenha(usuario.id, novoHash, usuario.senha);
        if (!resultado.affectedRows) return res.status(409).send("A conta mudou. Tente entrar novamente.");
    }

    sessao.iniciar(req, res, usuario.id);
    res.set("Cache-Control", "no-store");
    res.json({ id: usuario.id, email: usuario.email, nome: usuario.nome, perfil: usuario.perfil });
}

async function cadastrar(req, res) {
    var dados = lerConta(req.body);
    var senha = req.body.senhaServer;
    validarSenhaNova(senha);
    var resultado = await usuarioModel.cadastrar(
        dados.nomeServer, dados.emailServer, senha, dados.proximidadeServer, dados.funcaoServer
    );
    res.status(201).json({ id: resultado.insertId });
}

function consultarConta(req, res) {
    res.json(req.usuario);
}

async function atualizarConta(req, res) {
    var dados = lerConta(req.body);
    var senhaNova = req.body.senhaServer;
    var senhaSalva;
    var hash;

    if (senhaNova != null && senhaNova !== "") {
        validarSenhaNova(senhaNova);
        senhaSalva = await usuarioModel.buscarSenha(req.usuario.id);
        if (!await senhaSegura.conferirSenha(req.body.senhaAtual, senhaSalva)) {
            return res.status(403).send("A senha atual está incorreta.");
        }
        hash = await senhaSegura.gerarHash(senhaNova);
    }

    var resultado = await usuarioModel.atualizarConta(
        req.usuario.id, dados.nomeServer, dados.emailServer, dados.proximidadeServer, dados.funcaoServer, hash, senhaSalva
    );
    if (!resultado.affectedRows) return res.status(409).send("A conta mudou. Entre novamente.");

    if (hash) {
        sessao.encerrarDoUsuario(req.usuario.id);
        sessao.iniciar(req, res, req.usuario.id);
    }
    res.json(await usuarioModel.buscarConta(req.usuario.id));
}

async function excluirConta(req, res) {
    var senhaSalva = await usuarioModel.buscarSenha(req.usuario.id);
    if (!await senhaSegura.conferirSenha(req.body.senhaAtual, senhaSalva)) {
        return res.status(403).send("A senha atual está incorreta.");
    }

    var resultado;
    try {
        resultado = await usuarioModel.excluirConta(req.usuario.id, req.usuario.perfil, senhaSalva);
    } catch (erro) {
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).send("Sua conta ainda é autora de conteúdo no acervo.");
        }
        throw erro;
    }
    if (resultado === "ultimoAdmin") {
        return res.status(409).send("A última conta de administrador precisa ficar ativa.");
    }

    sessao.encerrarDoUsuario(req.usuario.id);
    sessao.encerrar(req, res);
    res.sendStatus(204);
}

async function consultarPerfil(req, res) {
    var perfil = await usuarioModel.buscarPerfil(req.usuario.id);
    res.json(perfil);
}

async function salvarPerfil(req, res) {
    var dados = validacao.lerCampos(req.body, [
        ["bio", "bio", "texto longo", false],
        ["estilo_favorito", "estilo favorito", 50, false],
        ["artista_favorito", "artista favorito", 100, false],
        ["link_rede_social", "link da rede social", "link", false]
    ]);
    var novo = req.method === "POST";
    var salvar = novo ? usuarioModel.cadastrarPerfil : usuarioModel.atualizarPerfil;
    var resultado = await salvar(req.usuario.id, dados.bio, dados.estilo_favorito, dados.artista_favorito, dados.link_rede_social);

    if (!resultado.affectedRows) return res.status(404).send("Perfil musical ainda não cadastrado.");
    res.status(novo ? 201 : 200).json(dados);
}

async function excluirPerfil(req, res) {
    var resultado = await usuarioModel.excluirPerfil(req.usuario.id);
    if (!resultado.affectedRows) return res.status(404).send("Perfil musical ainda não cadastrado.");
    res.sendStatus(204);
}

async function contarPorFuncao(req, res) {
    res.json(await usuarioModel.contarPorFuncao());
}

async function contarPorProximidade(req, res) {
    res.json(await usuarioModel.contarPorProximidade());
}

module.exports = {
    autenticar, cadastrar, consultarConta, atualizarConta, excluirConta,
    consultarPerfil, salvarPerfil, excluirPerfil, contarPorFuncao, contarPorProximidade
};
