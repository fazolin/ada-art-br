export function iniciarHighlighter() {
  const observerOptions = {
    threshold: 0.4,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (navLink && entry.isIntersecting) {
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        navLink.classList.add("active");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".spa-section").forEach((section) => {
    observer.observe(section);
  });
}
