var temPerfilMusical = false;

function mostrarStatusPerfil(secao, texto) {
  document.getElementById(secao + "_status").textContent = texto;
}

function tratarFalhaPerfil(secao, erro) {
  mostrarStatusPerfil(secao, erro.message);
  if (erro.status === 401) window.location.replace("/login.html");
}

async function enviarPerfil(secao, acao) {
  var salvar = document.getElementById(secao + "_salvar");
  var excluir = document.getElementById(secao + "_excluir");
  if (salvar.disabled) return;

  salvar.disabled = true;
  excluir.disabled = true;
  mostrarStatusPerfil(secao, "Processando…");

  try {
    await acao();
  } catch (erro) {
    tratarFalhaPerfil(secao, erro);
  } finally {
    salvar.disabled = false;
    excluir.disabled = false;
  }
}

function preencherConta(conta) {
  document.getElementById("conta_nome").value = conta.nome;
  document.getElementById("conta_email").value = conta.email;
  document.getElementById("conta_proximidade").value = conta.proximidade || "";
  document.getElementById("conta_funcao").value = conta.funcao || "";

  for (var id of ["conta_senha_atual", "conta_senha_nova", "conta_confirmacao"]) {
    document.getElementById(id).value = "";
  }
}

function preencherPerfilMusical(perfil) {
  temPerfilMusical = perfil !== null;
  document.getElementById("perfil_bio").value = perfil?.bio || "";
  document.getElementById("perfil_estilo").value = perfil?.estilo_favorito || "";
  document.getElementById("perfil_artista").value = perfil?.artista_favorito || "";
  document.getElementById("perfil_link").value = perfil?.link_rede_social || "";
  document.getElementById("musical_salvar").textContent = temPerfilMusical ? "Salvar Perfil Musical" : "Criar Perfil Musical";
  document.getElementById("musical_excluir").hidden = !temPerfilMusical;
}

function salvarConta(evento) {
  evento.preventDefault();

  var senha = document.getElementById("conta_senha_nova").value;
  if (senha !== document.getElementById("conta_confirmacao").value) {
    return mostrarStatusPerfil("conta", "As senhas não conferem.");
  }

  enviarPerfil("conta", async function () {
    var conta = await pedirDados("/usuarios/conta", "PUT", {
      nomeServer: document.getElementById("conta_nome").value,
      emailServer: document.getElementById("conta_email").value,
      proximidadeServer: document.getElementById("conta_proximidade").value,
      funcaoServer: document.getElementById("conta_funcao").value,
      senhaAtual: document.getElementById("conta_senha_atual").value,
      senhaServer: senha
    });

    guardarSessao(conta);
    preencherConta(conta);
    mostrarStatusPerfil("conta", "Conta atualizada.");
  });
}

function excluirConta() {
  var senha = document.getElementById("conta_senha_atual");
  if (!senha.value) {
    mostrarStatusPerfil("conta", "Informe a senha atual para excluir a conta.");
    senha.focus();
    return;
  }

  if (!confirm("Excluir sua conta e seu perfil musical?")) return;

  enviarPerfil("conta", async function () {
    await pedirDados("/usuarios/conta", "DELETE", { senhaAtual: senha.value });
    sessionStorage.clear();
    window.location.replace("/index.html");
  });
}

function salvarPerfilMusical(evento) {
  evento.preventDefault();
  enviarPerfil("musical", async function () {
    var perfil = await pedirDados("/usuarios/perfil-musical", temPerfilMusical ? "PUT" : "POST", {
      bio: document.getElementById("perfil_bio").value,
      estilo_favorito: document.getElementById("perfil_estilo").value,
      artista_favorito: document.getElementById("perfil_artista").value,
      link_rede_social: document.getElementById("perfil_link").value
    });
    preencherPerfilMusical(perfil);
    mostrarStatusPerfil("musical", "Perfil musical salvo.");
  });
}

function excluirPerfilMusical() {
  if (!confirm("Excluir seu perfil musical?")) return;

  enviarPerfil("musical", async function () {
    await pedirDados("/usuarios/perfil-musical", "DELETE");
    preencherPerfilMusical(null);
    mostrarStatusPerfil("musical", "Perfil musical excluído.");
  });
}

async function carregarPerfil() {
  var status = document.getElementById("perfil_inicio");
  try {
    var conta = await validarSessao();
    if (!conta) return;

    aplicarMenu(conta);
    preencherConta(conta);
    preencherPerfilMusical(await pedirDados("/usuarios/perfil-musical"));
    document.getElementById("perfil_conteudo").hidden = false;
    status.hidden = true;
  } catch (erro) {
    status.textContent = erro.message;
    if (erro.status === 401) window.location.replace("/login.html");
  }
}

carregarPerfil();
