var acervoModel = require("../models/acervoModel");
var validacao = require("../validacao");

var campos = {
    referencias: [
        ["nome", "nome", 100, true],
        ["genero", "gênero", 100, true],
        ["origem", "origem", 100, false],
        ["impacto", "impacto", "texto longo", true],
        ["link", "link", "link", false],
        ["posicao", "posição", "posicao", true]
    ],
    albuns: [
        ["titulo", "título", 100, true],
        ["artista", "artista", 100, true],
        ["genero", "gênero", 100, true],
        ["ano", "ano", "ano", false],
        ["faixa_destaque", "faixa destaque", 100, false],
        ["impacto", "impacto", "texto longo", true],
        ["link", "link", "link", false],
        ["posicao", "posição", "posicao", true]
    ],
    "old-school": [
        ["titulo", "título", 100, true],
        ["artista", "artista", 100, true],
        ["ano", "ano", "ano", false],
        ["impacto", "impacto", "texto longo", false],
        ["link", "link", "link", false]
    ]
};

async function listar(req, res) {
    var registros = await acervoModel.listar(req.colecaoAcervo);
    res.json(registros);
}

async function salvar(req, res) {
    var tipo = req.colecaoAcervo;
    var novo = req.method === "POST";
    var id = novo ? null : validacao.inteiro(req.params.id, 1, 2147483647);
    if (!novo && id === null) return res.status(400).send("ID inválido.");

    var corpo = req.body;
    if (tipo === "referencias") {
        corpo = {
            nome: corpo.nome ?? corpo.nomeServer,
            genero: corpo.genero ?? corpo.generoServer,
            origem: corpo.origem ?? corpo.origemServer,
            impacto: corpo.impacto ?? corpo.impactoServer,
            link: corpo.link ?? corpo.linkServer,
            posicao: corpo.posicao ?? corpo.posicaoServer
        };
    }
    var dados = validacao.lerCampos(corpo, campos[tipo]);

    if (novo) {
        var cadastro = await acervoModel.cadastrar(tipo, dados, req.usuario.id);
        return res.status(201).json({ id: cadastro.insertId });
    }

    var atualizacao = await acervoModel.atualizar(tipo, id, dados);
    if (!atualizacao.affectedRows) return res.status(404).send("Registro não encontrado.");
    res.json({ id: id });
}

async function excluir(req, res) {
    var id = validacao.inteiro(req.params.id, 1, 2147483647);
    if (id === null) return res.status(400).send("ID inválido.");

    var resultado = await acervoModel.excluir(req.colecaoAcervo, id);
    if (!resultado.affectedRows) return res.status(404).send("Registro não encontrado.");
    res.sendStatus(204);
}

module.exports = { listar, salvar, excluir };
