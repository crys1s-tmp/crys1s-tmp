document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const audio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  const volumeSlider = document.getElementById("volume-slider");
  const bioText = document.getElementById("bio-text");
  const visualizer = document.getElementById("visualizer");
  const ambientBg = document.getElementById("ambient-bg");
  const toast = document.getElementById("toast");

  let isPlaying = false;
  let previousVolume = 5;
  const originalBio = "Every crisis is temporary";

  const playlist = [
    { name: "Lex Amarni - the kill 2", src: "Lex Amarni, 2muchmotion - the kill 2.mp3" },
  ];

  let currentTrackIndex = -1;

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

  // Универсальный показ Toast
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

  // --- TELEGRAM MODAL & TRIPLE CLICK ---
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
        clickTimer = setTimeout(() => { clickCount = 0; }, 500);
      } else if (clickCount === 3) {
        clearTimeout(clickTimer);
        clickCount = 0;

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
      }
    });

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

    async function sendToTelegram() {
      if (!tgInput) return;
      const text = tgInput.value.trim();
      if (!text) return;

      if (text.length > 300) {
        showToast("Message is too long (max 300 chars).", true);
        return;
      }

      const lastSendTime = localStorage.getItem("last_tg_msg_time") || 0;
      const cooldownTime = 30000;
      const currentTime = Date.now();

      if (currentTime - lastSendTime < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - (currentTime - lastSendTime)) / 1000);
        showToast(`Please wait ${timeLeft}s before next message`, true);
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

      // Обращаемся к нашему серверному эндпоинту на Vercel
      const endpoint = "/api/send-message";

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
          sendTestMessage = sendToTelegram(); // fixed call
        }
      });
    }
  }
});
