var crypto = require("node:crypto");
var usuarioModel = require("./models/usuarioModel");

var sessoes = new Map();
var duracao = 8 * 60 * 60 * 1000;
var nomeCookie = "autosample_sessao";
var opcoesCookie = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.AMBIENTE_PROCESSO === "producao",
    path: "/"
};

setInterval(function () {
    for (var [chave, sessao] of sessoes) {
        if (sessao.expira <= Date.now()) sessoes.delete(chave);
    }
}, 60000).unref();

function lerCookie(req) {
    var cookies = (req.headers.cookie || "").split(";");
    for (var i = 0; i < cookies.length; i++) {
        var [nome, valor] = cookies[i].trim().split("=");
        if (nome === nomeCookie && /^[a-f0-9]{64}$/.test(valor)) return valor;
    }
}

function iniciar(req, res, idUsuario) {
    sessoes.delete(lerCookie(req));
    var chave = crypto.randomBytes(32).toString("hex");
    sessoes.set(chave, { idUsuario: idUsuario, expira: Date.now() + duracao });
    res.cookie(nomeCookie, chave, { ...opcoesCookie, maxAge: duracao });
}

function encerrar(req, res) {
    sessoes.delete(lerCookie(req));
    res.clearCookie(nomeCookie, opcoesCookie);
}

function encerrarDoUsuario(idUsuario) {
    for (var [chave, sessao] of sessoes) {
        if (sessao.idUsuario === idUsuario) sessoes.delete(chave);
    }
}

async function exigirSessao(req, res, next) {
    var sessao = sessoes.get(lerCookie(req));
    res.set("Cache-Control", "no-store");

    if (!sessao || sessao.expira <= Date.now()) {
        encerrar(req, res);
        return res.status(401).send("Entre na sua conta para continuar.");
    }

    try {
        req.usuario = await usuarioModel.buscarConta(sessao.idUsuario);
        if (!req.usuario) {
            encerrar(req, res);
            return res.status(401).send("Entre na sua conta para continuar.");
        }
        next();
    } catch (erro) {
        next(erro);
    }
}

function exigirAdmin(req, res, next) {
    if (req.usuario.perfil !== "admin") {
        return res.status(403).send("Esta ação é reservada ao administrador.");
    }
    next();
}

module.exports = { iniciar, encerrar, encerrarDoUsuario, exigirSessao, exigirAdmin };
