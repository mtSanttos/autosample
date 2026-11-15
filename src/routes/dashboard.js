var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

router.get("/emocoes-poesia", function (req, res) {
    dashboardController.buscarEmocoesPoesia(req, res);
});

module.exports = router;