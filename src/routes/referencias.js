var express = require("express");
var router = express.Router();

var acervoController = require("../controllers/acervoController");

router.post("/referencias", function (req, res) {
    acervoController.cadastrarReferencia(req, res);
});

module.exports = router;