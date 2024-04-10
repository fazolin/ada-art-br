// const caminhoPasta = "../img/casa_nft/"; // Caminho da pasta onde estão as imagens

// Função para carregar imagens dinamicamente
function carregarImagens(path) {
  const container = document.getElementById("auto-images");

  fetch(path)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const imagens = doc.querySelectorAll("a");

      imagens.forEach((imagem) => {
        if (imagem.href.endsWith(".jpg") || imagem.href.endsWith(".png")) {
          const img = document.createElement("img");
          img.src = imagem.href;
          img.alt = imagem.href.split("/").pop();
          img.classList.add("auto-image");
          container.appendChild(img);
        }
      });
    })
    .catch((error) => console.error("Erro ao carregar imagens:", error));
}

// Chamada da função ao carregar a página
// window.onload = carregarImagens;
