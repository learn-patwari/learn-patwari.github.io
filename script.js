/* ═══════════════ Loader ═══════════════ */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("done"), 350);
});
// safety net: never trap the user behind the loader
setTimeout(() => document.getElementById("loader").classList.add("done"), 4000);

/* ═══════════════ Typing effect ═══════════════ */
const roles = [
  "scalable Java backends.",
  "ML platforms that ship.",
  "real-time data pipelines.",
  "systems that don't page you at 3am.",
];

const typedEl = document.getElementById("typed");
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const word = roles[roleIdx];
  typedEl.textContent = word.slice(0, charIdx);

  let delay = deleting ? 35 : 70;

  if (!deleting && charIdx === word.length) {
    delay = 1800; // pause on full word
    deleting = true;
  } else if (deleting && charIdx === 0) {
    deleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    delay = 400;
  } else {
    charIdx += deleting ? -1 : 1;
  }

  setTimeout(typeLoop, delay);
}
typeLoop();

/* ═══════════════ Cursor glow ═══════════════ */
const glow = document.getElementById("cursorGlow");
window.addEventListener("pointermove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* ═══════════════ Scroll reveal ═══════════════ */
const revealEls = document.querySelectorAll(".reveal");

// stagger siblings that reveal together
document.querySelectorAll(".projects-grid, .skills-grid, .hero-content, .timeline").forEach((group) => {
  group.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.setProperty("--d", `${i * 0.09}s`);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));

/* ═══════════════ Nav + scroll progress ═══════════════ */
const nav = document.getElementById("nav");
const progressBar = document.getElementById("scrollProgress");
let lastY = window.scrollY;

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 30);
  nav.classList.toggle("hidden", y > lastY && y > 300);
  lastY = y;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}, { passive: true });

/* mobile menu */
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("open");
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

/* ═══════════════ Animated counters ═══════════════ */
const counters = document.querySelectorAll(".stat-num");

const counterObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el = entry.target;
    const target = +el.dataset.count;
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  }
}, { threshold: 0.5 });

counters.forEach((el) => counterObserver.observe(el));

/* ═══════════════ Project card tilt + glow tracking ═══════════════ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--my", `${(y / rect.height) * 100}%`);

    if (reduceMotion) return;
    const rx = ((y / rect.height) - 0.5) * -7;
    const ry = ((x / rect.width) - 0.5) * 7;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

/* ═══════════════ Duplicate ticker content for seamless loop ═══════════════ */
const track = document.getElementById("tickerTrack");
track.innerHTML += track.innerHTML;

/* ═══════════════ Footer year ═══════════════ */
document.getElementById("year").textContent = new Date().getFullYear();
