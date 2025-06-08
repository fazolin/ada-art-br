function loadComponent(id, file) {
  fetch(`src/components/${file}`)
    .then((res) => res.text())
    .then((html) => {
      const target = document.getElementById(id);
      if (target) target.innerHTML = html;
    })
    .catch((err) => console.error(`Erro ao carregar ${file}:`, err));
}

loadComponent("header", "header.html");
loadComponent("footer", "footer.html");
