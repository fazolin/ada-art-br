// Monitora mudanças na hash (ex: #trabalho?id=xxx)
window.addEventListener("hashchange", verificarHashTrabalho);
window.addEventListener("DOMContentLoaded", verificarHashTrabalho);

function verificarHashTrabalho() {
  const hash = window.location.hash;
  if (hash.startsWith("#trabalho?id=")) {
    const id = new URLSearchParams(hash.split("?")[1]).get("id");
    if (id) abrirModalTrabalho(id);
  }
}

async function abrirModalTrabalho(id) {
  const modal = document.getElementById("modal");
  const content = modal.querySelector(".modal-content");

  try {
    const res = await fetch("src/data/trabalhos.json");
    const trabalhos = await res.json();
    const trabalho = trabalhos.find((t) => t.id === id);
    if (!trabalho) return;

    let imagensHTML = "";

    if (trabalho.pasta && trabalho.prefixo) {
      const extensoes = ["jpg", "jpeg", "png", "bmp", "webp"];
      let index = 1;
      let encontrou = false;
      while (true) {
        encontrou = false;
        for (const ext of extensoes) {
          const path = `${trabalho.pasta}${trabalho.prefixo} (${index}).${ext}`;
          try {
            const head = await fetch(path, { method: "HEAD" });
            if (head.ok) {
              imagensHTML += `<img src="${path}" style="width:100%; margin-top:1rem; border-radius:6px;" />`;
              encontrou = true;
              break;
            }
          } catch {}
        }
        if (!encontrou) break;
        index++;
      }
    }

    const youtube = trabalho.youtubeId
      ? `
      <div class="video-wrapper" style="margin-top:2rem;">
        <iframe 
          src="https://www.youtube.com/embed/${trabalho.youtubeId}" 
          allowfullscreen></iframe>
      </div>
    `
      : "";

    const ficha = trabalho["ficha técnica"]
      ? `<div style="margin-top:2rem;"><h4>Ficha Técnica</h4><p>${trabalho["ficha técnica"]}</p></div>`
      : "";

    content.innerHTML = `
      <span class="modal-close" aria-label="Fechar">&times;</span>
      <h2>${trabalho.titulo}</h2>
      <p>${trabalho.descricao}</p>
      ${youtube}
      ${imagensHTML}
      ${ficha}
    `;

    modal.classList.add("active");
  } catch (err) {
    console.error("Erro ao carregar trabalho:", err);
  }
}

// Fecha modal ao clicar fora ou no X
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (
    e.target.classList.contains("modal-overlay") ||
    e.target.classList.contains("modal-close")
  ) {
    modal.classList.remove("active");
    history.pushState(null, "", "#works");
  }
});

// Fecha modal com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("modal").classList.remove("active");
    history.pushState(null, "", "#works");
  }
});
