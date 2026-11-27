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

function preencherPerfilMusical(perfil) {
  temPerfilMusical = perfil !== null;
  document.getElementById("perfil_bio").value = perfil?.bio || "";
  document.getElementById("perfil_estilo").value = perfil?.estilo_favorito || "";
  document.getElementById("perfil_artista").value = perfil?.artista_favorito || "";
  document.getElementById("perfil_link").value = perfil?.link_rede_social || "";
  document.getElementById("musical_salvar").textContent = temPerfilMusical ? "Salvar Perfil Musical" : "Criar Perfil Musical";
  document.getElementById("musical_excluir").hidden = !temPerfilMusical;
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

async function carregarAcervoDoPerfil() {
  var status = document.getElementById("perfil_acervo_status");
  document.getElementById("perfil_acervo").hidden = false;

  try {
    var resposta = await fetch("/admin.html");
    if (!resposta.ok) throw new Error("Não foi possível carregar os formulários do acervo.");

    var paginaAdmin = new DOMParser().parseFromString(await resposta.text(), "text/html");
    var formularios = paginaAdmin.getElementById("admin_formularios");
    if (!formularios) throw new Error("Não foi possível carregar os formulários do acervo.");

    document.getElementById("perfil_acervo_formularios").innerHTML = formularios.innerHTML;
    await carregarEditorAcervo();
    status.hidden = true;
  } catch (erro) {
    tratarFalhaPerfil("perfil_acervo", erro);
  }
}

async function carregarPerfil() {
  var status = document.getElementById("perfil_inicio");
  try {
    var conta = await validarSessao();
    if (!conta) return;

    aplicarMenu(conta);
    preencherPerfilMusical(await pedirDados("/usuarios/perfil-musical"));
    document.getElementById("perfil_conteudo").hidden = false;
    status.hidden = true;
    if (conta.perfil === "admin") carregarAcervoDoPerfil();
  } catch (erro) {
    status.textContent = erro.message;
    if (erro.status === 401) window.location.replace("/login.html");
  }
}

carregarPerfil();
