// Небольшие интерактивные функции. Основной сайт работает и без JavaScript.
document.addEventListener("DOMContentLoaded", () => {
  // Не даём случайно перейти по незаполненным ссылкам (#).
  document.querySelectorAll("[data-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") {
        event.preventDefault();
        link.classList.remove("needs-link");
        void link.offsetWidth;
        link.classList.add("needs-link");
        window.setTimeout(() => link.classList.remove("needs-link"), 650);
      }
    });
  });

  // Лёгкий эффект наклона на десктопе; отключается для сенсорных устройств и reduced motion.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".link-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-3px) perspective(700px) rotateX(${-y * 1.6}deg) rotateY(${x * 1.6}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }
});
