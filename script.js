document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const audio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  const volumeSlider = document.getElementById("volume-slider");
  const bioText = document.getElementById("bio-text");
  const visualizer = document.getElementById("visualizer");
  const ambientBg = document.getElementById("ambient-bg");
  const toast = document.getElementById("toast");
  const cursorGlow = document.getElementById("splash-cursor-glow");

  let isPlaying = false;
  let previousVolume = 5;
  const originalBio = "Every crisis is temporary";

  const playlist = [
    { name: "Lex Amarni - the kill 2", src: "Lex Amarni, 2muchmotion - the kill 2.mp3" },
    { name: "backfromparadise - LEGACY (slowed)", src: "backfromparadise, PIXY - LEGACY (slowed down).mp3" },
    { name: "LONOWN - addiction", src: "LONOWN, Asenssia - addiction.mp3" },
    { name: "LONOWN - worry", src: "LONOWN, riserayss - worry.mp3" },
  ];

  let currentTrackIndex = -1;

  // --- ЖИВЫЕ ЧАСЫ В ТЕРМИНАЛЬНОМ HUD ---
  const hudTime = document.getElementById("hud-time");
  if (hudTime) {
    function updateHudTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      hudTime.textContent = `TIME: ${hours}:${minutes}:${seconds} // LIVE`;
    }
    updateHudTime();
    setInterval(updateHudTime, 1000);
  }

  // Интерактивное слежение свечения за курсором (только для ПК с мышкой)
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (splash && cursorGlow && finePointer) {
    splash.addEventListener("pointermove", (e) => {
      const rect = splash.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cursorGlow.style.left = `${x}px`;
      cursorGlow.style.top = `${y}px`;
    });
  }

  if (visualizer) {
    visualizer.querySelectorAll("span").forEach((span) => {
      const randomDuration = (0.5 + Math.random() * 0.9).toFixed(2);
      const randomDelay = (Math.random() * 0.8).toFixed(2);
      span.style.animationDuration = `${randomDuration}s`;
      span.style.animationDelay = `${randomDelay}s`;
    });
  }

  function changeBioText(newText) {
    if (!bioText) return;
    bioText.classList.add("fade-out");
    setTimeout(() => {
      bioText.textContent = newText;
      bioText.classList.remove("fade-out");
    }, 300);
  }

  function updateSpeakerIcon(volPercent) {
    const states = [
      document.getElementById("speaker-state-0"),
      document.getElementById("speaker-state-1"),
      document.getElementById("speaker-state-2"),
      document.getElementById("speaker-state-3")
    ];

    states.forEach(state => state && state.classList.remove("active"));

    let activeIndex = 0;
    if (volPercent === 0) activeIndex = 0;
    else if (volPercent <= 30) activeIndex = 1;
    else if (volPercent <= 60) activeIndex = 2;
    else activeIndex = 3;

    if (states[activeIndex]) {
      states[activeIndex].classList.add("active");
    }
  }

  function setVolume(val) {
    const vol = parseFloat(val);
    if (audio) audio.volume = vol / 100;
    if (volumeSlider) volumeSlider.value = vol;

    updateSpeakerIcon(vol);

    const scale = vol === 0 ? 0 : 0.5 + (vol / 100) * 0.5;
    if (visualizer) {
      visualizer.style.setProperty("--vol-scale", scale);
    }

    if (vol === 0) {
      if (visualizer) visualizer.classList.remove("active");
      if (bioText && bioText.textContent !== originalBio) {
        changeBioText(originalBio);
      }
    } else {
      if (isPlaying) {
        if (visualizer) visualizer.classList.add("active");
        if (playlist[currentTrackIndex] && bioText && bioText.textContent !== playlist[currentTrackIndex].name) {
          changeBioText(playlist[currentTrackIndex].name);
        }
      }
    }
  }

  function playRandomTrack() {
    if (!audio || playlist.length === 0) return;

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
      if (audio.volume > 0) {
        if (visualizer) visualizer.classList.add("active");
        changeBioText(track.name);
      } else {
        changeBioText(originalBio);
      }
      if (ambientBg) ambientBg.classList.add("active");
    }).catch(err => {
      console.log("Audio play error:", err);
    });
  }

  if (audio) {
    audio.addEventListener("ended", playRandomTrack);
  }

  function handleEnter() {
    if (!splash || splash.classList.contains("hidden")) return;

    splash.classList.add("hidden");
    setVolume(5);
    playRandomTrack();

    // Запуск Web Audio API анализатора после взаимодействия пользователя
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    initAudioAnalyzer();
  }

  if (splash) {
    splash.addEventListener("click", handleEnter);
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      const val = e.target.value;
      if (!isPlaying && val > 0) {
        if (audio && !audio.src) playRandomTrack();
        else if (audio) audio.play();
        isPlaying = true;
      }
      setVolume(val);
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (!audio) return;
      if (audio.volume > 0) {
        previousVolume = volumeSlider ? volumeSlider.value : 5;
        setVolume(0);
      } else {
        setVolume(previousVolume || 5);
        if (!isPlaying) {
          if (!audio.src) playRandomTrack();
          else audio.play();
          isPlaying = true;
        }
      }
    });
  }

  function showToast(message = "Message sent", isError = false) {
    if (!toast) return;
    const toastMsg = toast.querySelector(".toast-message");
    const toastIcon = toast.querySelector(".toast-icon");
    
    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.textContent = isError ? "✕" : "✓";
      toastIcon.style.background = isError ? "#ef4444" : "#22c55e";
    }

    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  const openTgModalBtn = document.getElementById("open-tg-modal");
  const tgModal = document.getElementById("tg-modal");
  const tgInput = document.getElementById("tg-input");
  const tgSend = document.getElementById("tg-send");
  const tgCancel = document.getElementById("tg-cancel");
  const charCounter = document.getElementById("char-counter");

  if (openTgModalBtn && tgModal) {
    openTgModalBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tgModal.classList.add("active");
      tgModal.setAttribute("aria-hidden", "false");
      if (tgInput) {
        tgInput.value = "";
        setTimeout(() => tgInput.focus(), 100);
      }
      if (charCounter) {
        charCounter.textContent = "0/300";
        charCounter.classList.remove("limit-reached");
      }
    });

    async function sendToTelegram() {
      if (!tgInput) return;
      const text = tgInput.value.trim();
      if (!text) return;

      if (text.length > 300) {
        showToast("Message is too long (max 300 chars).", true);
        return;
      }

      const lastSendTime = localStorage.getItem("last_tg_msg_time") || 0;
      const cooldownTime = 300000;
      const currentTime = Date.now();

      if (currentTime - lastSendTime < cooldownTime) {
        const timeLeftSec = Math.ceil((cooldownTime - (currentTime - lastSendTime)) / 1000);
        
        // Автоматический перевод в минуты и секунды
        const minutes = Math.floor(timeLeftSec / 60);
        const seconds = timeLeftSec % 60;
        const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        showToast(`Please wait ${timeString} before next message`, true);
        return;
      }

      if (tgSend) {
        tgSend.textContent = "Sending...";
        tgSend.disabled = true;
      }

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

      const endpoint = "https://weathered-hat-6e12.testaccbykl.workers.dev";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            visitorInfo: {
              ipLocation,
              systemLang,
              platform: `${platform} (${screenRes})`,
              userAgent
            }
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          localStorage.setItem("last_tg_msg_time", Date.now());

          tgModal.classList.remove("active");
          tgModal.setAttribute("aria-hidden", "true");
          tgInput.value = "";
          if (charCounter) {
            charCounter.textContent = "0/300";
            charCounter.classList.remove("limit-reached");
          }

          showToast("Message sent", false);
        } else {
          showToast("Error sending message!", true);
        }
      } catch (err) {
        console.error("API Error:", err);
        showToast("Network error. Failed to send.", true);
      } finally {
        if (tgSend) {
          tgSend.textContent = "Send";
          tgSend.disabled = false;
        }
      }
    }

    if (tgSend) tgSend.addEventListener("click", sendToTelegram);

    if (tgInput) {
      tgInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendToTelegram();
        }
      });
    }

    if (tgCancel) {
      tgCancel.addEventListener("click", () => {
        tgModal.classList.remove("active");
        tgModal.setAttribute("aria-hidden", "true");
      });
    }

    tgModal.addEventListener("click", (e) => {
      if (e.target === tgModal) {
        tgModal.classList.remove("active");
        tgModal.setAttribute("aria-hidden", "true");
      }
    });

    if (tgInput && charCounter) {
      tgInput.addEventListener("input", () => {
        const len = tgInput.value.length;
        charCounter.textContent = `${len}/300`;
        if (len >= 300) charCounter.classList.add("limit-reached");
        else charCounter.classList.remove("limit-reached");
      });
    }
  }

  if (window.matchMedia('(pointer: fine)').matches) {
  const gridBg = document.querySelector('.site-grid-bg');
  if (gridBg) {
    window.addEventListener('mousemove', (e) => {
      // 1. Управляем координатами для радиальной маски затухания
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);

      // 2. Управляем параллакс-смещением сетки
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      gridBg.style.transform = `rotate(10deg) scale(1.6) translate(${x}px, ${y}px)`;
    });
  }
} else {
  // Логика наклона для Android остается без изменений
  const isMobileDevice = window.matchMedia('(pointer: coarse)').matches;
  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isMobileDevice && !isIOSDevice) {
    let currentTiltX = 0;
    let currentTiltY = 0;

    window.addEventListener('deviceorientation', (e) => {
      const gridBg = document.querySelector('.site-grid-bg');
      if (!gridBg) return;

      let gamma = e.gamma || 0;
      let beta = e.beta || 0;

      gamma = Math.max(-45, Math.min(45, gamma));
      beta = Math.max(10, Math.min(90, beta));

      const targetX = gamma * 1.5;
      const targetY = (beta - 45) * 1.5;

      currentTiltX += (targetX - currentTiltX) * 0.15;
      currentTiltY += (targetY - currentTiltY) * 0.15;

      gridBg.style.transform = `rotate(10deg) scale(1.6) translate(${currentTiltX}px, ${currentTiltY}px)`;
    });
  }
}
  // --- НАСТОЯЩИЙ АНАЛИЗАТОР МУЗЫКИ (WEB AUDIO API) ---
  let audioCtx = null;
  let analyser = null;
  let dataArray = null;
  let isSourceConnected = false;

  function initAudioAnalyzer() {
    if (isSourceConnected || !audio) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      
      const source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      analyser.fftSize = 128; // Больше точек для плавной сетки (64 частотных бина)
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      isSourceConnected = true;

      visualizeRealtime();
    } catch (e) {
      console.log("Web Audio API skipped:", e);
    }
  }

  function visualizeRealtime() {
    requestAnimationFrame(visualizeRealtime);

    if (!visualizer || !analyser || !isPlaying || audio.volume === 0) return;

    analyser.getByteFrequencyData(dataArray);
    const spans = visualizer.querySelectorAll("span");
    const totalSpans = spans.length;

    spans.forEach((span, index) => {
      // Равномерно распределяем полоски по спектру (отсекая пустые высокие частоты)
      const dataIndex = Math.floor((index / totalSpans) * (dataArray.length * 0.75));
      const val = dataArray[dataIndex];
      const heightPercent = Math.max(10, (val / 255) * 100);
      span.style.height = `${heightPercent}%`;
    });
  }
  function parseUserAgent(ua) {
  if (!ua || ua === "Unknown") return "❓ Unknown Device";

  let os = "Unknown OS";
  let icon = "💻";

  // ОС и тип устройства
  if (/android/i.test(ua)) {
    os = "Android";
    icon = "📱";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
    icon = "📱";
  } else if (/windows nt 10\.0/i.test(ua)) {
    os = "Windows 10/11";
    icon = "🖥️";
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = "Windows 7";
    icon = "🖥️";
  } else if (/mac os x/i.test(ua)) {
    os = "macOS";
    icon = "💻";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
    icon = "🐧";
  }

  // Определение браузера (опционально)
  let browser = "";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return `${icon} ${os}${browser ? ` (${browser})` : ""}`;
}
});
