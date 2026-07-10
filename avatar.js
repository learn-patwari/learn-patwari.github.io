/* ═══════════════════ Speaking avatar assistant ═══════════════════
   A floating avatar that greets visitors and narrates each section
   as they scroll, with a typed speech bubble, viseme-style mouth
   animation, and optional browser text-to-speech.

   To use your own animated avatar (GIF / APNG / WebP / video frame),
   set AVATAR_IMAGE_URL below, e.g. "static/image/avatar.gif".
   The built-in cartoon is replaced automatically; the speech bubble
   and voice keep working.
   ══════════════════════════════════════════════════════════════════ */

const AVATAR_IMAGE_URL = "";

const AVATAR_LINES = {
  home: "Hi, I'm Akshay! Welcome to my portfolio. Go on — grab that cube and give it a spin!",
  about: "Quick intro: I'm a Java engineer with 8+ years across insurance, banking and AI.",
  skills: "My toolkit — Java and Spring at the core, Kubernetes and MLOps all around it.",
  experience: "My journey: from intern to Staff Engineer at Samsung, now leading a team of six.",
  projects: "Here's the work I'm proud of — like the PADO MLOps platform I build and run.",
  contact: "Want to work together? Drop me a line — my inbox is always open!",
};

const BUILTIN_AVATAR_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- hoodie -->
  <path d="M22 120 Q22 88 60 86 Q98 88 98 120 Z" fill="url(#hoodieGrad)"/>
  <defs>
    <linearGradient id="hoodieGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6c8cff"/>
      <stop offset="0.6" stop-color="#a06bff"/>
      <stop offset="1" stop-color="#4fd1c5"/>
    </linearGradient>
  </defs>
  <!-- neck -->
  <rect x="52" y="76" width="16" height="14" rx="6" fill="#e8b087"/>
  <!-- head -->
  <ellipse cx="60" cy="52" rx="26" ry="28" fill="#f2c19b"/>
  <!-- ears -->
  <circle cx="33" cy="54" r="5" fill="#e8b087"/>
  <circle cx="87" cy="54" r="5" fill="#e8b087"/>
  <!-- hair -->
  <path d="M32 46 Q30 20 60 18 Q90 20 88 46 Q84 30 60 30 Q36 30 32 46 Z" fill="#1d2333"/>
  <!-- eyebrows -->
  <path d="M42 42 Q48 39 54 42" stroke="#1d2333" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M66 42 Q72 39 78 42" stroke="#1d2333" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <!-- eyes (blink via CSS scaleY on .eyes) -->
  <g class="eyes">
    <circle cx="48" cy="52" r="3.4" fill="#1d2333"/>
    <circle cx="72" cy="52" r="3.4" fill="#1d2333"/>
    <circle cx="49.2" cy="50.8" r="1.1" fill="#fff"/>
    <circle cx="73.2" cy="50.8" r="1.1" fill="#fff"/>
  </g>
  <!-- glasses -->
  <g stroke="#5c6987" stroke-width="1.8" fill="none" opacity="0.9">
    <rect x="40" y="45" width="16" height="13" rx="5"/>
    <rect x="64" y="45" width="16" height="13" rx="5"/>
    <path d="M56 51 L64 51"/>
  </g>
  <!-- nose -->
  <path d="M60 56 Q62 62 59 64" stroke="#d99e73" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- mouth visemes (one visible at a time via data-viseme) -->
  <g class="m-rest"><path d="M50 71 Q60 77 70 71" stroke="#b06a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <g class="m-small"><ellipse cx="60" cy="72" rx="5" ry="3.4" fill="#7a3b2e"/></g>
  <g class="m-open"><ellipse cx="60" cy="72.5" rx="7" ry="6" fill="#7a3b2e"/><ellipse cx="60" cy="75" rx="4" ry="2.4" fill="#d9705c"/></g>
  <g class="m-wide"><path d="M48 70 Q60 82 72 70 Q60 74 48 70 Z" fill="#7a3b2e"/></g>
</svg>`;

(function initAvatar() {
  /* build DOM */
  const widget = document.createElement("div");
  widget.className = "avatar-widget";
  widget.innerHTML = `
    <div class="avatar-bubble" id="avatarBubble"><p id="avatarText"></p></div>
    <div class="avatar-figure" id="avatarFigure" data-viseme="0" role="button" tabindex="0"
         aria-label="Portfolio assistant — click to replay, use buttons to toggle voice"></div>
    <div class="avatar-controls">
      <button id="avatarVoiceBtn" title="Turn voice on">🔇</button>
      <button id="avatarCloseBtn" title="Hide assistant">✕</button>
    </div>`;
  document.body.appendChild(widget);

  const reopen = document.createElement("button");
  reopen.className = "avatar-reopen";
  reopen.textContent = "👋 assistant";
  reopen.title = "Show assistant";
  document.body.appendChild(reopen);

  const figure = document.getElementById("avatarFigure");
  const bubble = document.getElementById("avatarBubble");
  const textEl = document.getElementById("avatarText");
  const voiceBtn = document.getElementById("avatarVoiceBtn");
  const closeBtn = document.getElementById("avatarCloseBtn");

  figure.innerHTML = AVATAR_IMAGE_URL
    ? `<img src="${AVATAR_IMAGE_URL}" alt="Animated avatar of Akshay">`
    : BUILTIN_AVATAR_SVG;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ttsSupported = "speechSynthesis" in window;
  let voiceOn = false;
  let typeTimer = null;
  let mouthTimer = null;
  let currentLine = AVATAR_LINES.home;

  /* ── blinking (built-in avatar only) ── */
  if (!AVATAR_IMAGE_URL && !reduceMotion) {
    (function blinkLoop() {
      setTimeout(() => {
        figure.classList.add("blink");
        setTimeout(() => figure.classList.remove("blink"), 140);
        blinkLoop();
      }, 2600 + Math.random() * 2600);
    })();
  }

  /* ── mouth animation while speaking ── */
  function startMouth() {
    figure.classList.add("speaking");
    if (AVATAR_IMAGE_URL || reduceMotion) return;
    clearInterval(mouthTimer);
    mouthTimer = setInterval(() => {
      figure.dataset.viseme = String(1 + Math.floor(Math.random() * 3));
    }, 110);
  }

  function stopMouth() {
    figure.classList.remove("speaking");
    clearInterval(mouthTimer);
    figure.dataset.viseme = "0";
  }

  /* ── text-to-speech ── */
  function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang.startsWith("en") && /male/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  }

  function speakAloud(text) {
    if (!ttsSupported || !voiceOn) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.02;
    u.pitch = 1.0;
    u.onend = () => { if (!typeTimer) stopMouth(); };
    window.speechSynthesis.speak(u);
  }

  /* ── typed speech bubble ── */
  function say(text) {
    currentLine = text;
    clearInterval(typeTimer);
    bubble.classList.add("show");
    bubble.classList.remove("done");
    textEl.textContent = "";
    startMouth();
    speakAloud(text);

    let i = 0;
    typeTimer = setInterval(() => {
      i++;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typeTimer);
        typeTimer = null;
        bubble.classList.add("done");
        // keep mouth moving while TTS is still talking
        if (!ttsSupported || !voiceOn || !window.speechSynthesis.speaking) stopMouth();
      }
    }, reduceMotion ? 0 : 28);

    if (reduceMotion) {
      clearInterval(typeTimer);
      typeTimer = null;
      textEl.textContent = text;
      bubble.classList.add("done");
      stopMouth();
    }
  }

  /* ── narrate sections on scroll ── */
  const spoken = new Set();
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = e.target.id;
        if (!AVATAR_LINES[id] || spoken.has(id)) continue;
        spoken.add(id);
        say(AVATAR_LINES[id]);
      }
    },
    { threshold: 0.4 }
  );
  Object.keys(AVATAR_LINES).forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  /* ── controls ── */
  voiceBtn.addEventListener("click", () => {
    voiceOn = !voiceOn;
    voiceBtn.textContent = voiceOn ? "🔊" : "🔇";
    voiceBtn.title = voiceOn ? "Turn voice off" : "Turn voice on";
    voiceBtn.classList.toggle("on", voiceOn);
    if (voiceOn) {
      say(currentLine); // user gesture → allowed to speak aloud
    } else if (ttsSupported) {
      window.speechSynthesis.cancel();
      stopMouth();
    }
  });

  function replay() { say(currentLine); }
  figure.addEventListener("click", replay);
  figure.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); replay(); }
  });

  closeBtn.addEventListener("click", () => {
    if (ttsSupported) window.speechSynthesis.cancel();
    stopMouth();
    widget.classList.add("hidden");
    reopen.classList.add("show");
  });

  reopen.addEventListener("click", () => {
    widget.classList.remove("hidden");
    reopen.classList.remove("show");
    say(currentLine);
  });

  /* ── greet after the loader clears ── */
  setTimeout(() => say(AVATAR_LINES.home), 1600);
})();
