var usuarioModel = require("../models/usuarioModel");


function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (typeof email !== "string" || email == "") {
        res.status(400).send("Informe o email.");
    } else if (typeof senha !== "string" || senha == "") {
        res.status(400).send("Informe a senha.");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultado) {
                    console.log(`\nResultados encontrados: ${resultado.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultado)}`); // transforma JSON em String

                    if (resultado.length == 1) {
                        console.log(resultado);


                                    res.json({
                                        id: resultado[0].id,
                                        email: resultado[0].email,
                                        nome: resultado[0].nome,
                                        perfil: resultado[0].perfil  
                                    });
                    } else if (resultado.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
})
            
            .catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var proximidade = req.body.proximidadeServer;
    var funcao = req.body.funcaoServer;

      if (nome == undefined || nome == "") {
        res.status(400).send("Informe seu nome.");
    } else if (email == undefined || email == "") {
        res.status(400).send("Informe seu email.");
    } else if (senha == undefined || senha == "") {
        res.status(400).send("Informe sua senha.");
    } else if (proximidade == undefined || proximidade == "") {
        res.status(400).send("Informe sua proximidade com o rap e com o Matheus?");
    } else if (funcao == undefined || funcao == "") {
        res.status(400).send("Informe sua função na música.");
    } else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
usuarioModel.cadastrar(nome, email, senha, proximidade)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                if (erro.errno == 1062) {
                    res.status(409).send("Este email já está cadastrado.");
                } else {
                    res.status(500).json(erro.sqlMessage);
                }
            });
    }
}
module.exports = {
    autenticar,
    cadastrar
}