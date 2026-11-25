function cadastrar(nome, email, senha, proximidade, funcao) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, proximidade, funcao);

    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, proximidade, funcao) VALUES ('${nome}', '${email}', '${senha}', '${proximidade}', '${funcao}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarReferencia(nome, genero, origem, impacto, link, posicao){


    let instrucaoSql = ` INSERT INTO usuario (nome, genero, origem)`

}