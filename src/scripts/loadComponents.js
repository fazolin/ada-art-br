import { inicializarHighlighter } from "./spaHighlighter.js";

document.addEventListener("DOMContentLoaded", () => {
  // Carrega header
  fetch("src/components/header.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;

      // Aguarda DOM do header estar disponível
      setTimeout(() => {
        configurarSPA();
        inicializarHighlighter();
      }, 100); // delay curto, garante que os nav-links já estejam renderizados
    });

  // Carrega footer
  fetch("src/components/footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    });

  // Cria modal
  if (!document.getElementById("modal")) {
    const modalHTML = `
      <div id="modal" class="modal-overlay">
        <div class="modal-content"></div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
});

function configurarSPA() {
  const links = document.querySelectorAll(".nav-link");
  const headerOffset = 80;

  // Scroll suave ao clicar nos links
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").substring(1);
      const target = document.getElementById(id);

      if (target) {
        const offsetTop = target.offsetTop - headerOffset;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
        history.pushState(null, "", `#${id}`);
      }
    });
  });

  // Scroll para seção inicial
  const initial = location.hash.replace("#", "") || "ada";
  const section = document.getElementById(initial);
  if (section) {
    setTimeout(() => {
      window.scrollTo({
        top: section.offsetTop - headerOffset,
        behavior: "smooth",
      });
    }, 300);
  }
}
