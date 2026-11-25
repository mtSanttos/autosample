function responder(acao, mensagemDuplicada) {
    return async function (req, res, next) {
        try {
            await acao(req, res);
        } catch (erro) {
            if (erro.status === 400 || erro.status === 409) {
                return res.status(erro.status).send(erro.message);
            }
            if (erro.code === "ER_DUP_ENTRY") {
                return res.status(409).send(mensagemDuplicada || "Já existe um registro com esses dados.");
            }
            if (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(409).send("A operação entra em conflito com um registro relacionado.");
            }
            next(erro);
        }
    };
}

module.exports = responder;
