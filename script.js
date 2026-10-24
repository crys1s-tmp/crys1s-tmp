document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const audio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  const bioText = document.getElementById("bio-text");
  const visualizer = document.getElementById("visualizer");
  const ambientBg = document.getElementById("ambient-bg");

  let isPlaying = false;
  const trackName = "jinsang — Affection";
  const originalBio = "Every crisis is temporary";

  // Делаем каждый столбик эквалайзера полностью независимым
  document.querySelectorAll('.visualizer span').forEach((span) => {
    const randomDuration = (0.5 + Math.random() * 0.9).toFixed(2);
    const randomDelay = (Math.random() * 0.8).toFixed(2);
    span.style.animationDuration = `${randomDuration}s`;
    span.style.animationDelay = `${randomDelay}s`;
  });

  function changeBioText(newText) {
    bioText.classList.add("fade-out");
    setTimeout(() => {
      bioText.textContent = newText;
      bioText.classList.remove("fade-out");
    }, 300);
  }

  // Функция входа при клике в ЛЮБОЕ место экрана-заставки
  function handleEnter() {
    if (splash.classList.contains("hidden")) return;

    splash.classList.add("hidden");

    audio.volume = 0;
    audio.play().then(() => {
      isPlaying = true;
      musicToggle.classList.add("playing");
      visualizer.classList.add("active");
      if (ambientBg) ambientBg.classList.add("active"); // Включаем амбиент-фон
      changeBioText(trackName);

      // Плавный запуск громкости от 0 до 25% за 1 секунду
      let currentVol = 0;
      const targetVol = 0.25;
      const duration = 1000; 
      const intervalTime = 50; 
      const step = targetVol / (duration / intervalTime);

      const fadeInterval = setInterval(() => {
        currentVol += step;
        if (currentVol >= targetVol) {
          audio.volume = targetVol;
          clearInterval(fadeInterval);
        } else {
          audio.volume = currentVol;
        }
      }, intervalTime);

    }).catch(err => {
      console.log("Автовоспроизведение заблокировано:", err);
    });
  }

  // Клик в любое место на сплэш-экране открывает сайт
  splash.addEventListener("click", handleEnter);

  // Кнопка в правом верхнем углу (пауза/старт)
  musicToggle.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      musicToggle.classList.remove("playing");
      visualizer.classList.remove("active");
      if (ambientBg) ambientBg.classList.remove("active"); // Выключаем амбиент-фон
      changeBioText(originalBio);
    } else {
      audio.play().then(() => {
        audio.volume = 0.25;
        isPlaying = true;
        musicToggle.classList.add("playing");
        visualizer.classList.add("active");
        if (ambientBg) ambientBg.classList.add("active"); // Включаем амбиент-фон
        changeBioText(trackName);
      }).catch(err => {
        console.log("Ошибка воспроизведения аудио:", err);
      });
    }
  });

  // Эффект наклона карточек
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".link-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-2px) perspective(700px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }
});
