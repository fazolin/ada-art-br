fetch("src/data/trabalhos.json")
  .then((res) => res.json())
  .then(async (trabalhos) => {
    const container = document.getElementById("trabalhos");

    // Ordena por ano (descendente)
    trabalhos.sort((a, b) => (b.ano || 0) - (a.ano || 0));

    for (const trab of trabalhos) {
      const div = document.createElement("div");
      div.classList.add("card");
      div.dataset.id = trab.id;

      let capa = "";
      let capaEncontrada = false;
      const extensoes = ["jpg", "jpeg", "png", "bmp", "webp"];

      // 1. Tenta imagem com índice (prefixo (n).ext)
      if (trab.thumbIndex && trab.pasta && trab.prefixo) {
        for (const ext of extensoes) {
          const tentativa = `${trab.pasta}${trab.prefixo} (${trab.thumbIndex}).${ext}`;
          try {
            const res = await fetch(tentativa, { method: "HEAD" });
            if (res.ok) {
              capa = tentativa;
              capaEncontrada = true;
              break;
            }
          } catch {}
        }
      }

      // 2. Tenta imagem única (prefixo.ext)
      if (!capaEncontrada && trab.pasta && trab.prefixo) {
        for (const ext of extensoes) {
          const tentativa = `${trab.pasta}${trab.prefixo}.${ext}`;
          try {
            const res = await fetch(tentativa, { method: "HEAD" });
            if (res.ok) {
              capa = tentativa;
              capaEncontrada = true;
              break;
            }
          } catch {}
        }
      }

      // 3. Thumb YouTube direto, sem fetch
      if (!capaEncontrada && trab.youtubeId) {
        capa = `https://img.youtube.com/vi/${trab.youtubeId}/maxresdefault.jpg`;
        capaEncontrada = true;
      }

      if (!capaEncontrada) continue;

      const isYouTube = capa.includes("youtube.com");
      const extraClass = isYouTube ? "thumb-youtube" : "";

      const imgTag = isYouTube
        ? `<img src="${capa}" alt="${trab.titulo}" class="${extraClass}" 
                onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${trab.youtubeId}/hqdefault.jpg'" />`
        : `<img src="${capa}" alt="${trab.titulo}" class="${extraClass}" />`;

      div.innerHTML = `
        <div class="thumb-wrapper">
          ${imgTag}
        </div>
        <h3>${trab.titulo}</h3>
        <p>${trab["descricao curta"] || trab.descricao}</p>
      `;

      div.addEventListener("click", () => {
        location.hash = `#trabalho?id=${trab.id}`;
      });

      container.appendChild(div);
    }
  })
  .catch((err) => {
    console.error("Erro ao carregar os trabalhos:", err);
  });
