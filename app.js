var ambiente = process.env.AMBIENTE_PROCESSO || "desenvolvimento";
var caminhoEnv = ambiente === "producao" ? ".env" : ".env.dev";

require("dotenv").config({ path: caminhoEnv });
process.env.AMBIENTE_PROCESSO = process.env.AMBIENTE_PROCESSO || ambiente;

var express = require("express");
var path = require("node:path");

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var dashboardRouter = require("./src/routes/dashboard");

var porta = process.env.APP_PORT || 3333;
var host = process.env.APP_HOST || "localhost";
var app = express();

app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ extended: false, limit: "512kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/dashboard", dashboardRouter);

app.use(function (erro, req, res, next) {
    if (res.headersSent) return next(erro);
    if (erro.type === "entity.parse.failed") return res.status(400).send("Confira os dados enviados.");
    if (erro.type === "entity.too.large") return res.status(413).send("Os dados enviados são grandes demais.");

    console.error("Falha na aplicação:", erro.code || erro.name);
    res.status(500).send("Não foi possível concluir a operação.");
});

app.listen(porta, function () {
    console.log(`Autosample rodando em http://${host}:${porta} (${process.env.AMBIENTE_PROCESSO}).`);
});
