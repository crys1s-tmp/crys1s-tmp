document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const audio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  const bioText = document.getElementById("bio-text");
  const visualizer = document.getElementById("visualizer");
  const ambientBg = document.getElementById("ambient-bg");

  let isPlaying = false;
  const originalBio = "Every crisis is temporary";

  // СПИСОК ВАШИХ ТРЕКОВ ИЗ ПАПКИ
  const playlist = [
    { name: "Lex Amarni - the kill 2", src: "Lex Amarni, 2muchmotion - the kill 2.mp3" },
  ];

  let currentTrackIndex = -1;

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

  // Функция выбора и запуска случайного трека
  function playRandomTrack() {
    if (playlist.length === 0) return;

    let newIndex;
    if (playlist.length > 1) {
      do {
        newIndex = Math.floor(Math.random() * playlist.length);
      } while (newIndex === currentTrackIndex);
    } else {
      newIndex = 0;
    }

    currentTrackIndex = newIndex;
    const track = playlist[currentTrackIndex];

    audio.src = track.src;
    audio.load();

    audio.play().then(() => {
      isPlaying = true;
      musicToggle.classList.add("playing");
      visualizer.classList.add("active");
      if (ambientBg) ambientBg.classList.add("active");
      changeBioText(track.name);
    }).catch(err => {
      console.log("Ошибка воспроизведения аудио:", err);
    });
  }

  // Автоматический переход к следующему случайному треку по окончании текущего
  audio.addEventListener("ended", () => {
    playRandomTrack();
  });

  // Функция входа при клике в ЛЮБОЕ место экрана-заставки
  function handleEnter() {
    if (splash.classList.contains("hidden")) return;

    splash.classList.add("hidden");
    audio.volume = 0;

    playRandomTrack();

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
      if (ambientBg) ambientBg.classList.remove("active");
      changeBioText(originalBio);
    } else {
      if (!audio.src) {
        playRandomTrack();
      } else {
        audio.play().then(() => {
          audio.volume = 0.25;
          isPlaying = true;
          musicToggle.classList.add("playing");
          visualizer.classList.add("active");
          if (ambientBg) ambientBg.classList.add("active");
          changeBioText(playlist[currentTrackIndex]?.name || originalBio);
        }).catch(err => {
          console.log("Ошибка воспроизведения аудио:", err);
        });
      }
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

  // --- СКРИПТ ТРОЙНОГО КЛИКА, ОТПРАВКИ, СЧЕТЧИКА И КУЛДАУНА ---
  const avatarWrap = document.querySelector(".avatar-wrap");
  const tgModal = document.getElementById("tg-modal");
  const tgInput = document.getElementById("tg-input");
  const tgSend = document.getElementById("tg-send");
  const tgCancel = document.getElementById("tg-cancel");
  const charCounter = document.getElementById("char-counter");

  let clickCount = 0;
  let clickTimer = null;

  if (avatarWrap && tgModal) {
    avatarWrap.addEventListener("click", (e) => {
      e.stopPropagation();
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 500);
      } else if (clickCount === 3) {
        clearTimeout(clickTimer);
        clickCount = 0;
        
        tgModal.classList.add("active");
        tgModal.setAttribute("aria-hidden", "false");
        tgInput.value = "";
        charCounter.textContent = "0/300";
        charCounter.classList.remove("limit-reached");
        setTimeout(() => tgInput.focus(), 100);
      }
    });

    tgCancel.addEventListener("click", () => {
      tgModal.classList.remove("active");
      tgModal.setAttribute("aria-hidden", "true");
    });

    tgModal.addEventListener("click", (e) => {
      if (e.target === tgModal) {
        tgModal.classList.remove("active");
        tgModal.setAttribute("aria-hidden", "true");
      }
    });

    // Отслеживание ввода символов для счетчика
    tgInput.addEventListener("input", () => {
      const len = tgInput.value.length;
      charCounter.textContent = `${len}/300`;
      if (len >= 300) {
        charCounter.classList.add("limit-reached");
      } else {
        charCounter.classList.remove("limit-reached");
      }
    });

    async function sendToTelegram() {
      const text = tgInput.value.trim();
      if (!text) return;

      if (text.length > 300) {
        alert("Message is too long (max 300 characters).");
        return;
      }

      const lastSendTime = localStorage.getItem("last_tg_msg_time") || 0;
      const cooldownTime = 30000;
      const currentTime = Date.now();

      if (currentTime - lastSendTime < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - (currentTime - lastSendTime)) / 1000);
        alert(`Please wait ${timeLeft}s before sending another message.`);
        return;
      }

      const botToken = "8679891410:AAFNvvTpbIqAZktCs2bGnCNBpj9EnKAkFlg";
      const chatId = "6643626815";

      tgSend.textContent = "Sending...";
      tgSend.disabled = true;

      let ipLocation = "Unknown";
      try {
        const geoRes = await fetch("https://ipapi.co/json/");
        const geoData = await geoRes.json();
        if (geoData && geoData.ip) {
          ipLocation = `${geoData.ip} (${geoData.city || "Unknown city"}, ${geoData.country_name || "Unknown country"})`;
        }
      } catch (err) {
        console.log("Geo fetch error:", err);
      }

      const systemLang = navigator.language || navigator.userLanguage || "Unknown";
      const platform = navigator.platform || "Unknown";
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const userAgent = navigator.userAgent;

      const fullMessage = 
        `📩 New anonymous message from the site:\n\n` +
        `💬 Message (${text.length}/300 chars):\n${text}\n\n` +
        `📊 Visitor Info:\n` +
        `🌐 IP & Location: ${ipLocation}\n` +
        `🗣 System Language: ${systemLang}\n` +
        `💻 Platform: ${platform} (${screenRes})\n` +
        `📱 User-Agent: ${userAgent}`;

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: fullMessage
          })
        });
        const data = await res.json();
        if (data.ok) {
          localStorage.setItem("last_tg_msg_time", Date.now());

          tgModal.classList.remove("active");
          tgModal.setAttribute("aria-hidden", "true");
          tgInput.value = "";
          charCounter.textContent = "0/300";
          charCounter.classList.remove("limit-reached");
        } else {
          alert("Error sending message! Check bot credentials.");
        }
      } catch (err) {
        console.error("Telegram API Error:", err);
        alert("Network error. Failed to send message.");
      } finally {
        tgSend.textContent = "Send";
        tgSend.disabled = false;
      }
    }

    tgSend.addEventListener("click", sendToTelegram);

    tgInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendToTelegram();
      }
    });
  }
});
