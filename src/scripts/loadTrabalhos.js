fetch("src/data/trabalhos.json")
  .then((res) => res.json())
  .then(async (trabalhos) => {
    const container = document.getElementById("trabalhos");

    for (const trab of trabalhos) {
      const div = document.createElement("div");
      div.classList.add("card");

      const link = `trabalho.html?id=${trab.id}`;
      let capa = "";
      let capaEncontrada = false;

      const extensoes = ["jpg", "jpeg", "png", "bmp", "webp"];

      // 1. Tenta imagem com thumbIndex (prefixo (n).ext)
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

      // 2. Se falhou, tenta imagem única (prefixo.ext)
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

      // 3. Se ainda falhou, tenta thumb do YouTube
      if (!capaEncontrada && trab.youtubeId) {
        const tentativaMax = `https://img.youtube.com/vi/${trab.youtubeId}/maxresdefault.jpg`;
        const tentativaHQ = `https://img.youtube.com/vi/${trab.youtubeId}/hqdefault.jpg`;

        try {
          const res = await fetch(tentativaMax, { method: "HEAD" });
          capa = res.ok ? tentativaMax : tentativaHQ;
        } catch {
          capa = tentativaHQ;
        }

        capaEncontrada = true;
      }

      if (!capaEncontrada) continue;

      const isYouTube = capa.includes("youtube.com");
      const extraClass = isYouTube ? "thumb-youtube" : "";

      div.innerHTML = `
        <a href="${link}">
          <img src="${capa}" alt="${trab.titulo}" class="${extraClass}" />
        </a>
        <h3>${trab.titulo}</h3>
        <p>${trab["descricao curta"] || trab.descricao}</p>
      `;

      container.appendChild(div);
    }
  })
  .catch((err) => {
    console.error("Erro ao carregar os trabalhos:", err);
  });
