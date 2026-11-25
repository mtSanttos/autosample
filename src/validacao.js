function texto(valor, maximo) {
    if (typeof valor !== "string" || valor.trim().length > maximo) return null;
    return valor.trim() || null;
}

function inteiro(valor, minimo, maximo) {
    if (typeof valor === "string" && /^\d+$/.test(valor)) valor = Number(valor);
    if (!Number.isInteger(valor) || valor < minimo || valor > maximo) return null;
    return valor;
}

function link(valor) {
    var endereco = texto(valor, 255);
    if (!endereco) return null;

    try {
        var url = new URL(endereco);
        if (url.protocol === "http:" || url.protocol === "https:") return endereco;
    } catch (erro) {
        return null;
    }
    return null;
}

function lerCampos(corpo, campos) {
    var dados = {};
    for (var [nome, rotulo, tamanho, obrigatorio] of campos) {
        var valor = corpo[nome];
        var vazio = valor == null || (typeof valor === "string" && !valor.trim());
        if (vazio && !obrigatorio) {
            dados[nome] = null;
            continue;
        }

        if (tamanho === "link") dados[nome] = link(valor);
        else if (tamanho === "ano") dados[nome] = inteiro(valor, 1, 9999);
        else if (tamanho === "posicao") dados[nome] = inteiro(valor, 1, 5);
        else if (tamanho === "texto longo") {
            var longo = texto(valor, 65535);
            dados[nome] = longo && Buffer.byteLength(longo, "utf8") <= 65535 ? longo : null;
        } else dados[nome] = texto(valor, tamanho);

        if (dados[nome] === null) {
            var erro = new Error("Confira o campo " + rotulo + ".");
            erro.status = 400;
            throw erro;
        }
    }
    return dados;
}

module.exports = { texto, inteiro, lerCampos };
