var dashboardModel = require("../models/dashboardModel");
var validacao = require("../validacao");

var camposPoesia = [
    ["titulo", "título", 100, true],
    ["texto", "texto", "texto longo", true]
];
var camposMusica = [
    ["titulo", "título", 100, true],
    ["artista", "artista", 100, true],
    ["link", "link", "link", false]
];

async function buscarEmocoesPoesia(req, res) {
    res.json(await dashboardModel.buscarEmocoesPoesia());
}

async function listarEmocoes(req, res) {
    res.json(await dashboardModel.listarEmocoes());
}

async function listarPoesias(req, res) {
    res.json(await dashboardModel.listarObras("poesia"));
}

async function listarMusicas(req, res) {
    res.json(await dashboardModel.listarObras("musica"));
}

function lerEmocoes(corpo) {
    // Os cadastros antigos enviavam só uma emoção fora do vetor.
    var lista = corpo.emocoes;
    if (lista === undefined) lista = [{ nome: corpo.emocao, intensidade: corpo.intensidade }];

    var emocoes = [];
    if (Array.isArray(lista) && lista.length <= 7) {
        for (var item of lista) {
            var nome = validacao.texto(item?.nome, 45);
            var intensidade = validacao.inteiro(item?.intensidade, 1, 5);
            if (!nome || intensidade === null ||
                emocoes.some(function (emocao) { return emocao.nome === nome; })) break;

            emocoes.push({ nome: nome, intensidade: intensidade });
        }
        if (emocoes.length === lista.length) return emocoes;
    }

    var erro = new Error("Escolha emoções diferentes e informe intensidades de 1 a 5.");
    erro.status = 400;
    throw erro;
}

async function salvarObra(req, res, tipo, campos) {
    var novo = req.method === "POST";
    var id = novo ? null : validacao.inteiro(req.params.id, 1, 2147483647);
    if (!novo && id === null) return res.status(400).send("ID inválido.");

    var dados = validacao.lerCampos(req.body, campos);
    var emocoes = lerEmocoes(req.body);
    var resultado = await dashboardModel.salvarObra(tipo, id, dados, emocoes, req.usuario.id);
    if (!resultado) return res.status(404).send("Obra não encontrada.");

    res.status(novo ? 201 : 200).json(resultado);
}

function salvarPoesia(req, res) {
    return salvarObra(req, res, "poesia", camposPoesia);
}

function salvarMusica(req, res) {
    return salvarObra(req, res, "musica", camposMusica);
}

async function excluirObra(req, res, tipo) {
    var id = validacao.inteiro(req.params.id, 1, 2147483647);
    if (id === null) return res.status(400).send("ID inválido.");

    var excluida = await dashboardModel.excluirObra(tipo, id);
    if (!excluida) return res.status(404).send("Obra não encontrada.");

    res.sendStatus(204);
}

function excluirPoesia(req, res) {
    return excluirObra(req, res, "poesia");
}

function excluirMusica(req, res) {
    return excluirObra(req, res, "musica");
}

module.exports = {
    buscarEmocoesPoesia, listarEmocoes, listarPoesias, listarMusicas,
    salvarPoesia, salvarMusica, excluirPoesia, excluirMusica
};
