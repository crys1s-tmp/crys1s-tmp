// Small interactive effects. The site still works without JavaScript.
document.addEventListener("DOMContentLoaded", () => {
  // A subtle desktop tilt effect; disabled for touch devices and reduced-motion settings.
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
