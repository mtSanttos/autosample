async function pedirDados(url, metodo, dados) {
  var opcoes = { method: metodo || "GET" };

  if (dados !== undefined) {
    opcoes.headers = { "Content-Type": "application/json" };
    opcoes.body = JSON.stringify(dados);
  }

  var resposta = await fetch(url, opcoes);
  if (!resposta.ok) {
    var erro = new Error(resposta.status >= 500
      ? "Não foi possível falar com o servidor."
      : await resposta.text());
    erro.status = resposta.status;
    throw erro;
  }

  if (resposta.status !== 204) return resposta.json();
}

function guardarSessao(usuario) {
  sessionStorage.ID_USUARIO = usuario.id;
  sessionStorage.NOME_USUARIO = usuario.nome;
  sessionStorage.EMAIL_USUARIO = usuario.email;
  sessionStorage.PERFIL_USUARIO = usuario.perfil;
}

async function consultarSessao() {
  try {
    var usuario = await pedirDados("/usuarios/sessao");
    guardarSessao(usuario);
    return usuario;
  } catch (erro) {
    if (erro.status !== 401) throw erro;
    sessionStorage.clear();
    return null;
  }
}

async function validarSessao() {
  var usuario = await consultarSessao();
  if (!usuario) window.location.replace("/login.html");
  return usuario;
}

async function validarAdmin() {
  var usuario = await validarSessao();
  if (usuario && usuario.perfil !== "admin") {
    window.location.replace("/index.html");
    return null;
  }
  return usuario;
}

function aplicarMenu(usuario) {
  var itens = document.querySelectorAll("[data-sessao]");

  for (var i = 0; i < itens.length; i++) {
    var item = itens[i];
    var acesso = item.dataset.sessao;

    if (acesso === "visitante") {
      item.hidden = usuario !== null;
    } else if (acesso === "admin") {
      item.hidden = !usuario || usuario.perfil !== "admin";
    } else {
      item.hidden = !usuario;
    }
  }
}

async function atualizarMenu() {
  var usuario = await consultarSessao();
  aplicarMenu(usuario);
  return usuario;
}

async function limparSessao() {
  try {
    await pedirDados("/usuarios/sessao", "DELETE");
    sessionStorage.clear();
    window.location.replace("/login.html");
  } catch (erro) {
    alert("Não foi possível sair. Tente de novo.");
  }
}

function aguardar() {
  document.getElementById("div_aguardar").style.display = "flex";
}

function finalizarAguardar(texto) {
  document.getElementById("div_aguardar").style.display = "none";
  if (texto) {
    var erros = document.getElementById("div_erros_login");
    erros.style.display = "flex";
    erros.textContent = texto;
  }
}
