var dashboardModel = require("../models/dashboardModel");

function buscarEmocoesPoesia(req, res) {
    dashboardModel.buscarEmocoesPoesia()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao buscar emoções:", erro.sqlMessage);
            res.status(500).json("Erro ao buscar os dados do painel.");
        });
}

function cadastrarMusica(req, res) {
    
    let titulo = req.body.titulo;
    let artista = req.body.artista;
    let link = req.body.link;
    let emocao = req.body.emocao;
    let intensidade = req.body.intensidade;
    let usuario = req.body.usuario_id;


    dashboardModel.inserirMusica(titulo, artista, link, emocao, intensidade, usuario).then(function (resultado) {
       res.status(200).json("Musica cadastrada com sucesso")
    }).catch(function (erro) {
        res.status(500).json("Erro ao cadastrar música")
    });
}



function cadastrarPoesia(req, res) {
    let titulo = req.body.titulo;
    let texto = req.body.texto;
    let emocao = req.body.emocao;
    let intensidade = req.body.intensidade;
    let usuario = req.body.usuario_id;

    if (titulo == undefined || titulo == "") {
        res.status(400).send("Informe o título da poesia.");
    } else if (texto == undefined || texto == "") {
        res.status(400).send("Informe o texto da poesia.");
    } else if (emocao == undefined || emocao == "") {
        res.status(400).send("Informe a emoção da poesia.");
    } else if (usuario == undefined) {
        res.status(400).send("Usuário não identificado.");
    } else {
        dashboardModel.inserirPoesia(titulo, texto, emocao, intensidade, usuario)
            .then(function (resultado) {
                res.status(200).json("Poesia cadastrada com sucesso");
            })
            .catch(function (erro) {
                console.log("Erro ao cadastrar poesia:", erro);
                res.status(500).json("Erro ao cadastrar poesia");
            });
    }
}

function listarPoesias(req, res) {
    dashboardModel.listarPoesias()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao listar poesias:", erro.sqlMessage);
            res.status(500).json("Erro ao buscar as poesias.");
        });
}

function listarMusicas(req, res) {
    dashboardModel.listarMusicas()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao listar músicas:", erro.sqlMessage);
            res.status(500).json("Erro ao buscar as músicas.");
        });
}

module.exports = {
    buscarEmocoesPoesia,
    cadastrarMusica,
    cadastrarPoesia,
    listarPoesias,
    listarMusicas
};