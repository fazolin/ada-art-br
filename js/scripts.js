const hidden_elements = document.querySelectorAll(".hidden");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});

hidden_elements.forEach((el) => {
  observer.observe(el);
});
if (!window.location.hash) {
  document.getElementById("home").classList.add("menu-item-active");
}
function toggleActive(event) {
  var target = event.target || event.srcElement;
  var buttonList = document.querySelectorAll(".menu-item");
  buttonList.forEach(function (button) {
    if (button === target && !button.classList.contains("menu-item-active")) {
      return button.classList.add("menu-item-active");
    }
    return button.classList.remove("menu-item-active");
  });
}
