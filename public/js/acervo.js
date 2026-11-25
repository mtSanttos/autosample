var secoesAcervo = {
  poesias: { rota: "/dashboard/listar-poesias", grade: "gradePoesias", contador: "contadorPoesias" },
  musicas: { rota: "/dashboard/listar-musicas", grade: "gradeMusicas", contador: "contadorMusicas" },
  referencias: { rota: "/acervo/referencias", grade: "gradeReferencias", contador: "contadorReferencias" },
  albuns: { rota: "/acervo/albuns", grade: "gradeAlbuns", contador: "contadorAlbuns" },
  "old-school": { rota: "/acervo/old-school", grade: "gradeOldSchool", contador: "contadorOldSchool" }
};

function formatarEmocao(nome) {
  if (nome === "realizacao") return "Realização";
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function criarTexto(tag, classe, texto) {
  var elemento = document.createElement(tag);
  elemento.className = classe;
  elemento.textContent = texto;
  return elemento;
}

function criarLinkObra(endereco, tipo) {
  if (!endereco) return null;

  try {
    var url = new URL(endereco);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    var link = criarTexto("a", "obra-link-btn", tipo === "musicas" ? "Ouvir Sample" : "Abrir link");
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  } catch (erro) {
    return null;
  }
}

function criarCardObra(item, tipo) {
  var card = document.createElement("article");
  card.className = tipo === "musicas" ? "card-obra obra-musica" : "card-obra";

  var topo = document.createElement("div");
  topo.className = "obra-topo";
  var dados = document.createElement("div");
  var posicao = item.posicao ? item.posicao + "º · " : "";
  var titulo = posicao + (item.titulo || item.nome);
  dados.append(criarTexto("h4", "obra-titulo", titulo));

  var detalhes = [item.artista, item.genero, item.origem, item.ano].filter(Boolean);
  if (detalhes.length) dados.append(criarTexto("p", "obra-subtitulo", detalhes.join(" · ")));
  if (item.faixa_destaque) dados.append(criarTexto("p", "obra-subtitulo", "Faixa destaque: " + item.faixa_destaque));
  topo.append(dados);

  if (item.emocoes && item.emocoes.length > 0) {
    var tags = document.createElement("div");
    tags.className = "tags-emocoes";
    for (var emocao of item.emocoes) {
      tags.append(criarTexto("span", "tag-emocao", formatarEmocao(emocao.nome) + " · " + emocao.intensidade + "/5"));
    }
    topo.append(tags);
  }
  card.append(topo);

  if (item.texto || item.impacto) card.append(criarTexto("p", "obra-texto", item.texto || item.impacto));
  var link = criarLinkObra(item.link, tipo);
  if (link) card.append(link);

  var rodape = document.createElement("div");
  rodape.className = "obra-rodape";
  rodape.append(criarTexto("span", "", tipo === "poesias" ? "Autor: " + item.autor : "Adicionado por: " + item.autor));
  if (item.dtCriacaoFormatada) rodape.append(criarTexto("span", "", item.dtCriacaoFormatada));
  card.append(rodape);

  return card;
}

async function carregarSecao(tipo) {
  var secao = secoesAcervo[tipo];
  var grade = document.getElementById(secao.grade);
  var contador = document.getElementById(secao.contador);
  grade.replaceChildren(criarTexto("p", "mensagem-vazia", "Carregando…"));

  try {
    var itens = await pedirDados(secao.rota);
    grade.replaceChildren();
    contador.textContent = itens.length + (itens.length === 1 ? " registro" : " registros");

    if (itens.length === 0) grade.append(criarTexto("p", "mensagem-vazia", "Nenhum registro no momento."));
    for (var i = 0; i < itens.length; i++) {
      var card = criarCardObra(itens[i], tipo);
      grade.append(card);
    }
  } catch (erro) {
    contador.textContent = "—";
    grade.replaceChildren(criarTexto("p", "mensagem-vazia", "Não foi possível carregar esta seção."));
  }
}

function carregarPoesias() {
  carregarSecao("poesias");
}

function carregarMusicas() {
  carregarSecao("musicas");
}

function filtrar(tipo) {
  for (var secao of document.querySelectorAll("[data-tipo-acervo]")) {
    secao.hidden = tipo !== "todas" && secao.dataset.tipoAcervo !== tipo;
  }
  for (var botao of document.querySelectorAll("[data-filtro]")) {
    var ativo = botao.dataset.filtro === tipo;
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", ativo);
  }
}

carregarPoesias();
carregarMusicas();
carregarSecao("referencias");
carregarSecao("albuns");
carregarSecao("old-school");
atualizarMenu().catch(console.error);
