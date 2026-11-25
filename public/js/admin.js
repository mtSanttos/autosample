var colecoes = {
  poesia: {
    lista: "/dashboard/listar-poesias", criar: "/dashboard/cadastrar-poesia",
    editar: "/dashboard/poesias", id: "idPoesia", campos: { titulo: "titulo_poesia", texto: "texto_poesia" },
    emocoes: true, botao: "Cadastrar Poesia"
  },
  musica: {
    lista: "/dashboard/listar-musicas", criar: "/dashboard/cadastrar-musica",
    editar: "/dashboard/musicas", id: "idMusica",
    campos: { titulo: "titulo_musica", artista: "artista_musica", link: "link_musica" },
    emocoes: true, botao: "Cadastrar Música"
  },
  referencia: {
    lista: "/acervo/referencias", criar: "/acervo/referencias", editar: "/acervo/referencias", id: "idReferencias",
    campos: { nome: "ref_nome", genero: "ref_genero", origem: "ref_origem", impacto: "ref_impacto", link: "ref_link", posicao: "ref_posicao" },
    botao: "Salvar Referência"
  },
  album: {
    lista: "/acervo/albuns", criar: "/acervo/albuns", editar: "/acervo/albuns", id: "idAlbum",
    campos: { titulo: "album_titulo", artista: "album_artista", genero: "album_genero", ano: "album_ano",
      faixa_destaque: "album_faixa", impacto: "album_impacto", link: "album_link", posicao: "album_posicao" },
    botao: "Cadastrar Álbum"
  },
  old_school: {
    lista: "/acervo/old-school", criar: "/acervo/old-school", editar: "/acervo/old-school", id: "idOldSchool",
    campos: { titulo: "old_titulo", artista: "old_artista", ano: "old_ano", impacto: "old_impacto", link: "old_link" },
    botao: "Cadastrar Faixa"
  }
};

var catalogoEmocoes = [];

function mostrarStatus(tipo, texto) {
  document.getElementById("status_" + tipo).textContent = texto;
}

function formatarEmocao(nome) {
  return nome === "realizacao" ? "Realização" : nome.charAt(0).toUpperCase() + nome.slice(1);
}

function preencherEmocoes(select) {
  select.replaceChildren(new Option("Selecione a emoção", ""));
  for (var emocao of catalogoEmocoes) select.add(new Option(formatarEmocao(emocao.nome), emocao.nome));
}

function adicionarEmocao(tipo, nome, intensidade) {
  var lista = document.getElementById("emocoes_extras_" + tipo);
  if (lista.children.length >= catalogoEmocoes.length - 1) return;

  var linha = document.createElement("div");
  linha.className = "linha-emocao-extra";

  var select = document.createElement("select");
  select.setAttribute("aria-label", "Emoção adicional");
  select.required = true;
  preencherEmocoes(select);
  select.value = nome || "";

  var nivel = document.createElement("input");
  nivel.type = "number";
  nivel.min = "1";
  nivel.max = "5";
  nivel.required = true;
  nivel.value = intensidade ?? "3";
  nivel.setAttribute("aria-label", "Intensidade da emoção adicional");

  var remover = criarBotao("Remover", function () { linha.remove(); });
  remover.className = "botao-secundario";
  linha.append(select, nivel, remover);
  lista.append(linha);
}

function lerEmocoes(tipo) {
  var lista = [];
  var primeira = document.getElementById("emocao_" + tipo).value;
  if (primeira) {
    lista.push({ nome: primeira, intensidade: document.getElementById("intensidade_" + tipo).value });
  }

  for (var linha of document.getElementById("emocoes_extras_" + tipo).children) {
    lista.push({ nome: linha.querySelector("select").value, intensidade: linha.querySelector("input").value });
  }
  return lista;
}

function criarBotao(texto, acao) {
  var botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  botao.addEventListener("click", acao);
  return botao;
}

function limparFormulario(tipo) {
  var form = document.getElementById("form_" + tipo);
  form.reset();
  delete form.dataset.id;
  document.getElementById("salvar_" + tipo).textContent = colecoes[tipo].botao;
  document.getElementById("cancelar_" + tipo).hidden = true;

  if (colecoes[tipo].emocoes) document.getElementById("emocoes_extras_" + tipo).replaceChildren();
}

function editarRegistro(tipo, registro) {
  var config = colecoes[tipo];
  var form = document.getElementById("form_" + tipo);
  limparFormulario(tipo);

  form.dataset.id = registro[config.id];
  for (var [campo, id] of Object.entries(config.campos)) {
    document.getElementById(id).value = registro[campo] ?? "";
  }

  if (config.emocoes && registro.emocoes.length) {
    document.getElementById("emocao_" + tipo).value = registro.emocoes[0].nome;
    document.getElementById("intensidade_" + tipo).value = registro.emocoes[0].intensidade;

    for (var i = 1; i < registro.emocoes.length; i++) {
      adicionarEmocao(tipo, registro.emocoes[i].nome, registro.emocoes[i].intensidade);
    }
  }

  document.getElementById("salvar_" + tipo).textContent = "Salvar alterações";
  document.getElementById("cancelar_" + tipo).hidden = false;
  mostrarStatus(tipo, "Editando " + (registro.titulo || registro.nome));
  document.getElementById(Object.values(config.campos)[0]).focus();
}

async function carregarLista(tipo) {
  var config = colecoes[tipo];
  var lista = document.getElementById("lista_" + tipo);
  lista.textContent = "Carregando…";

  try {
    var registros = await pedirDados(config.lista);
    lista.replaceChildren();
    if (registros.length === 0) lista.textContent = "Nenhum registro por aqui ainda.";

    for (let item of registros) {
      var linha = document.createElement("div");
      linha.className = "linha-registro";
      var titulo = document.createElement("strong");
      var posicao = item.posicao ? item.posicao + "º · " : "";
      titulo.textContent = posicao + (item.titulo || item.nome);

      var acoes = document.createElement("div");
      acoes.className = "acoes-admin";
      acoes.append(
        criarBotao("Editar", function () { editarRegistro(tipo, item); }),
        criarBotao("Excluir", function (evento) { excluirRegistro(tipo, item, evento.currentTarget); })
      );
      linha.append(titulo, acoes);
      lista.append(linha);
    }
  } catch (erro) {
    lista.textContent = erro.message;
  }
}

async function salvarCadastro(tipo) {
  var config = colecoes[tipo];
  var form = document.getElementById("form_" + tipo);
  var botao = document.getElementById("salvar_" + tipo);
  if (botao.disabled || !form.reportValidity()) return;

  var idRegistro = form.dataset.id;
  var dados = {};
  for (var [campo, id] of Object.entries(config.campos)) dados[campo] = document.getElementById(id).value;
  if (config.emocoes) dados.emocoes = lerEmocoes(tipo);

  var rota = config.criar;
  var metodo = "POST";
  if (idRegistro) {
    rota = config.editar + "/" + idRegistro;
    metodo = "PUT";
  }

  botao.disabled = true;
  mostrarStatus(tipo, "Salvando…");
  try {
    await pedirDados(rota, metodo, dados);
    limparFormulario(tipo);
    mostrarStatus(tipo, idRegistro ? "Alterações salvas." : "Cadastro salvo.");
    await carregarLista(tipo);
  } catch (erro) {
    mostrarStatus(tipo, erro.message);
    if (erro.status === 401) window.location.replace("/login.html");
  } finally {
    botao.disabled = false;
  }
}

async function excluirRegistro(tipo, registro, botao) {
  if (!confirm("Excluir " + (registro.titulo || registro.nome) + "?")) return;

  var config = colecoes[tipo];
  var id = registro[config.id];
  botao.disabled = true;
  try {
    await pedirDados(config.editar + "/" + id, "DELETE");
    if (document.getElementById("form_" + tipo).dataset.id === String(id)) limparFormulario(tipo);
    mostrarStatus(tipo, "Registro excluído.");
    await carregarLista(tipo);
  } catch (erro) {
    mostrarStatus(tipo, erro.message);
    if (erro.status === 401) window.location.replace("/login.html");
  } finally {
    botao.disabled = false;
  }
}

function cadastrarPoesia() {
  salvarCadastro("poesia");
  return false;
}

function cadastrarMusica() {
  salvarCadastro("musica");
  return false;
}

function cadastrarReferencia() {
  salvarCadastro("referencia");
  return false;
}

async function carregarAdmin(usuario) {
  if (!usuario) return;
  aplicarMenu(usuario);
  document.getElementById("nome_admin").textContent = usuario.nome;

  try {
    catalogoEmocoes = await pedirDados("/dashboard/emocoes");
    preencherEmocoes(document.getElementById("emocao_poesia"));
    preencherEmocoes(document.getElementById("emocao_musica"));
    document.getElementById("admin_conteudo").hidden = false;
    document.getElementById("admin_inicio").hidden = true;
    for (var tipo of Object.keys(colecoes)) carregarLista(tipo);
  } catch (erro) {
    mostrarErroAdmin(erro);
  }
}

function mostrarErroAdmin(erro) {
  document.getElementById("admin_inicio").textContent = erro.message;
}
