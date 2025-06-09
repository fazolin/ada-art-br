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

  // Highlight do menu com base na rolagem
  const observerOptions = {
    threshold: 0.1, // corrigido para detectar melhor seções como "works"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const navLink = document.querySelector(`a[href="#${id}"]`);
      if (navLink) {
        if (entry.isIntersecting) {
          document
            .querySelectorAll(".nav-link")
            .forEach((l) => l.classList.remove("active"));
          navLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll(".spa-section").forEach((section) => {
    observer.observe(section);
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
