const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

fetch("src/data/trabalhos.json")
  .then((res) => res.json())
  .then(async (trabalhos) => {
    const trabalho = trabalhos.find((t) => t.id === id);
    if (!trabalho) return;

    document.title = trabalho.titulo;

    const main = document.querySelector("main");
    const container = document.createElement("section");

    // Cabeçalho com título e descrição
    container.innerHTML = `
      <h2>${trabalho.titulo}</h2>
      <p>${trabalho.descricao}</p>
    `;

    // Video YouTube
    if (trabalho.youtubeId) {
      const videoWrapper = document.createElement("div");
      videoWrapper.className = "video-wrapper";
      videoWrapper.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${trabalho.youtubeId}" 
          allowfullscreen
        ></iframe>
      `;
      container.appendChild(videoWrapper);
    }

    // Galeria de imagens
    if (trabalho.pasta && trabalho.prefixo) {
      const galeria = document.createElement("div");
      galeria.className = "galeria";

      const extensoes = ["jpg", "jpeg", "png", "bmp", "webp"];
      let index = 1;

      while (true) {
        let encontrou = false;
        for (const ext of extensoes) {
          const path = `${trabalho.pasta}${trabalho.prefixo} (${index}).${ext}`;
          try {
            const res = await fetch(path, { method: "HEAD" });
            if (res.ok) {
              const img = document.createElement("img");
              img.src = path;
              img.alt = `${trabalho.titulo} ${index}`;
              galeria.appendChild(img);
              encontrou = true;
              break;
            }
          } catch {}
        }
        if (!encontrou) break;
        index++;
      }

      if (galeria.children.length > 0) {
        container.appendChild(galeria);
      }
    }

    // Ficha Técnica (se disponível)
    if (trabalho["ficha técnica"]) {
      const ficha = document.createElement("div");
      ficha.classList.add("ficha-tecnica");
      ficha.innerHTML = `
        <h4>Ficha Técnica</h4>
        <p>${trabalho["ficha técnica"]}</p>
      `;
      container.appendChild(ficha);
    }

    // (Opcional) Tags e Ano – apenas para uso futuro
    // if (trabalho.tags) console.log("Tags:", trabalho.tags);
    // if (trabalho.ano) console.log("Ano:", trabalho.ano);

    main.appendChild(container);
  })
  .catch((err) => {
    console.error("Erro ao carregar o trabalho:", err);
  });
