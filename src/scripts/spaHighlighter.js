export function inicializarHighlighter() {
  const navLinks = document.querySelectorAll(".nav-link");
  let activeSectionId = null;

  function updateHighlight() {
    const sections = document.querySelectorAll(".spa-section");
    let bestSection = null;
    let bestVisibility = 0;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      const visibleHeight =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

      if (visibleHeight > bestVisibility && visibleHeight > 100) {
        bestVisibility = visibleHeight;
        bestSection = section;
      }
    });

    if (bestSection && bestSection.id !== activeSectionId) {
      activeSectionId = bestSection.id;

      navLinks.forEach((link) => link.classList.remove("active"));

      const activeLink = document.querySelector(
        `.nav-link[href="#${activeSectionId}"]`
      );
      if (activeLink) activeLink.classList.add("active");
    }
  }

  window.addEventListener("scroll", updateHighlight);
  window.addEventListener("resize", updateHighlight);
  window.addEventListener("load", updateHighlight);

  updateHighlight();
}
