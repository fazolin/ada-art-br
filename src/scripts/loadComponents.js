document.addEventListener("DOMContentLoaded", () => {
  // Carrega header
  fetch("src/components/header.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;
      iniciarSPA(); // Roda após carregar header
    });

  // Carrega footer
  fetch("src/components/footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    });

  // Cria dinamicamente o modal na página (caso não esteja no HTML)
  const modalHTML = `
    <div id="modal" class="modal-overlay">
      <div class="modal-content"></div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
});

function iniciarSPA() {
  const links = document.querySelectorAll(".nav-link");

  // Scroll suave ao clicar no menu
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").substring(1);
      const target = document.getElementById(id);
      const headerOffset = 80;

      if (target) {
        const offsetTop = target.offsetTop - headerOffset;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
        history.pushState(null, "", `#${id}`);
      }
    });
  });

  // Destaque do menu com base na rolagem central
  let activeSectionId = null;

  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll(".spa-section");
    const scrollMiddle = window.scrollY + window.innerHeight / 2;

    let closestSection = null;
    let smallestDistance = Infinity;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionMiddle = window.scrollY + rect.top + rect.height / 2;
      const distance = Math.abs(scrollMiddle - sectionMiddle);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestSection = section;
      }
    });

    if (closestSection && closestSection.id !== activeSectionId) {
      activeSectionId = closestSection.id;

      document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.classList.remove("active"));

      const currentLink = document.querySelector(
        `.nav-link[href="#${activeSectionId}"]`
      );
      if (currentLink) currentLink.classList.add("active");
    }
  });

  // Scroll para a seção atual ao recarregar
  const initial = location.hash.replace("#", "") || "ada";
  const initialSection = document.getElementById(initial);
  if (initialSection) {
    setTimeout(() => {
      window.scrollTo({
        top: initialSection.offsetTop - 80,
        behavior: "smooth",
      });
    }, 300);
  }
}
