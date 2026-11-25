var crypto = require("node:crypto");
var promisify = require("node:util").promisify;

var scrypt = promisify(crypto.scrypt);
var formatoHash = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;

function senhaTemHash(senhaSalva) {
    return formatoHash.test(senhaSalva);
}

async function gerarHash(senha) {
    // O sal é diferente para cada senha gravada, inclusive quando duas senhas são iguais.
    var sal = crypto.randomBytes(16).toString("hex");
    var hash = await scrypt(senha, sal, 64);
    return "scrypt$" + sal + "$" + hash.toString("hex");
}

async function conferirSenha(senha, senhaSalva) {
    if (typeof senha !== "string" || !senha || senha.length > 255 || !senhaSalva) {
        return false;
    }

    var partes = formatoHash.exec(senhaSalva);

    if (partes) {
        var sal = partes[1];
        var hashSalvo = Buffer.from(partes[2], "hex");
        var hashDigitado = await scrypt(senha, sal, 64);
        return crypto.timingSafeEqual(hashDigitado, hashSalvo);
    }

    // Contas antigas são convertidas para hash depois de um login válido.
    var senhaDigitada = Buffer.from(senha);
    var senhaAntiga = Buffer.from(senhaSalva);
    if (senhaDigitada.length !== senhaAntiga.length) {
        return false;
    }
    return crypto.timingSafeEqual(senhaDigitada, senhaAntiga);
}

module.exports = { senhaTemHash, gerarHash, conferirSenha };
