document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== TYPING TAGLINE =====
    const typedEl = document.getElementById('typedText');
    const phrases = [
        'Staff Software Engineer',
        'Java · Spring Boot · Microservices',
        'Kubernetes & Cloud-Native',
        'MLOps Platform Lead',
    ];
    if (typedEl) {
        if (reduceMotion) {
            typedEl.textContent = phrases[0];
            const c = document.querySelector('.cursor');
            if (c) c.style.display = 'none';
        } else {
            let pIndex = 0, cIndex = 0, deleting = false;
            const type = () => {
                const current = phrases[pIndex];
                cIndex += deleting ? -1 : 1;
                typedEl.textContent = current.slice(0, cIndex);

                let delay = deleting ? 45 : 80;
                if (!deleting && cIndex === current.length) {
                    delay = 1800;            // pause at full phrase
                    deleting = true;
                } else if (deleting && cIndex === 0) {
                    deleting = false;
                    pIndex = (pIndex + 1) % phrases.length;
                    delay = 400;             // pause before next phrase
                }
                setTimeout(type, delay);
            };
            setTimeout(type, 900);
        }
    }

    // ===== DYNAMIC EXPERIENCE YEARS =====
    function calcExp(startDate) {
        const ms = new Date() - startDate;
        const years = ms / (1000 * 60 * 60 * 24 * 365.25);
        return Math.floor(years * 2) / 2; // rounds to nearest 0.5
    }
    function fmt(years) { return `${years}+`; }

    // Total: from internship start (Feb 2018)
    const totalExp = calcExp(new Date(2018, 1, 1));
    // Professional: from first full-time role (Feb 2019)
    const proExp   = calcExp(new Date(2019, 1, 1));

    document.querySelectorAll('[data-exp-total]').forEach(el => el.textContent = fmt(totalExp));
    document.querySelectorAll('[data-exp-professional]').forEach(el => el.textContent = fmt(proExp));

    // ===== NAV MOBILE TOGGLE =====
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));

    // close on link click
    navLinks?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // ===== ACTIVE NAV LINK + NAVBAR SHRINK ON SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    function onScroll() {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        navLinkEls.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ===== SCROLL REVEAL (IntersectionObserver) =====
    const revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;

                // Stagger siblings that share a parent for a cascade effect
                const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
                const idx = siblings.indexOf(el);
                if (idx > 0) el.style.transitionDelay = Math.min(idx * 90, 450) + 'ms';

                // Stagger inner children when [data-stagger] is set
                if (el.hasAttribute('data-stagger')) {
                    Array.from(el.children).forEach((child, i) => {
                        child.style.transitionDelay = Math.min(i * 70, 560) + 'ms';
                    });
                }

                el.classList.add('is-visible');
                obs.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    // ===== COUNT-UP NUMBERS =====
    function animateCount(el) {
        const target = el.dataset.countTarget;
        const match = String(target).match(/^([\d,.]+)(.*)$/);
        if (!match) { el.textContent = target; return; }
        const num = parseFloat(match[1].replace(/,/g, ''));
        const suffix = match[2] || '';
        const isFloat = match[1].includes('.');
        const duration = 1400;
        const start = performance.now();

        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            const val = num * eased;
            el.textContent = (isFloat ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    }

    function initCounters(scope) {
        const nums = (scope || document).querySelectorAll('.stat-num, .gh-num');
        nums.forEach(el => {
            if (el.dataset.counted) return;
            el.dataset.countTarget = el.textContent.trim();
            el.dataset.counted = '1';
            if (reduceMotion || !('IntersectionObserver' in window)) return;
            el.textContent = '0';
            const obs = new IntersectionObserver((entries, o) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { animateCount(el); o.unobserve(el); }
                });
            }, { threshold: 0.5 });
            obs.observe(el);
        });
    }
    initCounters();


    // ===== GITHUB API =====
    async function loadGitHub() {
        const container = document.getElementById('githubStats');
        if (!container) return;
        try {
            const [userRes, reposRes] = await Promise.all([
                fetch('https://api.github.com/users/learn-patwari'),
                fetch('https://api.github.com/users/learn-patwari/repos?per_page=100')
            ]);
            const user = await userRes.json();
            const repos = await reposRes.json();
            const stars = Array.isArray(repos) ? repos.reduce((s, r) => s + r.stargazers_count, 0) : 0;

            container.innerHTML = [
                { num: user.public_repos ?? '—', lbl: 'Repositories' },
                { num: user.followers ?? '—', lbl: 'Followers' },
                { num: user.following ?? '—', lbl: 'Following' },
                { num: stars, lbl: 'Total stars' },
            ].map(d => `
                <div class="gh-card">
                    <span class="gh-num">${d.num}</span>
                    <span class="gh-lbl">${d.lbl}</span>
                </div>
            `).join('');
            initCounters(container);
            container.querySelectorAll('.gh-card').forEach(attachTilt);
        } catch {
            container.innerHTML = `<p style="color:var(--text-muted);font-size:.875rem;padding:.5rem 0;">GitHub data unavailable — <a href="https://github.com/learn-patwari" target="_blank" rel="noopener">visit profile</a>.</p>`;
        }
    }
    loadGitHub();

    // ===== CONTACT FORM (Web3Forms) =====
    // Replace YOUR_ACCESS_KEY below:
    // 1. Go to https://web3forms.com
    // 2. Enter akshaypatwariap@gmail.com → click "Create Access Key"
    // 3. Copy the key and paste it here
    const WEB3FORMS_KEY = 'ad87bf2c-72c7-4d5c-85ab-5ae5af409713';

    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name    = form.querySelector('#cf-name');
            const email   = form.querySelector('#cf-email');
            const msg     = form.querySelector('#cf-message');
            const nameErr = document.getElementById('nameError');
            const emailErr= document.getElementById('emailError');
            const msgErr  = document.getElementById('msgError');
            const notice  = document.getElementById('formNotice');
            const submitBtn = form.querySelector('button[type="submit"]');

            // Clear previous state
            [name, email, msg].forEach(f => f.classList.remove('invalid'));
            [nameErr, emailErr, msgErr].forEach(el => { el.textContent = ''; });
            notice.textContent = '';
            notice.className = 'form-notice';

            // Validate
            let valid = true;
            if (!name.value.trim()) {
                name.classList.add('invalid');
                nameErr.textContent = 'Please enter your name.';
                valid = false;
            }
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(email.value.trim())) {
                email.classList.add('invalid');
                emailErr.textContent = 'Please enter a valid email address.';
                valid = false;
            }
            if (msg.value.trim().length < 10) {
                msg.classList.add('invalid');
                msgErr.textContent = 'Message must be at least 10 characters.';
                valid = false;
            }
            if (!valid) return;

            // Submit to Web3Forms
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            try {
                const formData = new FormData(form);
                formData.append('access_key', WEB3FORMS_KEY);
                formData.append('subject', 'New message from portfolio — ' + name.value.trim());

                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                const data = await res.json().catch(() => ({}));
                if (res.ok && data.success) {
                    notice.textContent = 'Message sent. I will get back to you shortly.';
                    notice.classList.add('form-notice-success');
                    playFormSuccess(submitBtn, notice);
                    form.reset();
                } else {
                    notice.textContent = data.message || 'Submission failed. Please try emailing directly.';
                    notice.classList.add('form-notice-error');
                }
            } catch {
                notice.textContent = 'Connection error. Please try emailing akshaypatwariap@gmail.com directly.';
                notice.classList.add('form-notice-error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send message';
            }
        });
    }

    // ===== HERO PARTICLE CONSTELLATION =====
    const heroCanvas = document.querySelector('.hero-canvas');
    const heroSection = document.getElementById('home');

    if (heroCanvas && heroSection && !reduceMotion) {
        const ctx = heroCanvas.getContext('2d');
        let dpr = 1, cssW = 0, cssH = 0;
        let particles = [];
        let rafId = null;
        let running = false;
        let inView = true;

        const LINK_DIST = 130;   // px; lines drawn under this distance
        const DOT_R = 1.6;       // particle radius (css px)

        const rand = (min, max) => min + Math.random() * (max - min);

        const particleCount = () => {
            const w = cssW || window.innerWidth;
            if (w < 600)  return 22;
            if (w < 1000) return 38;
            return Math.min(64, Math.round(w / 26));
        };

        const makeParticles = () => {
            const n = particleCount();
            particles = [];
            for (let i = 0; i < n; i++) {
                particles.push({
                    x: rand(0, cssW),
                    y: rand(0, cssH),
                    vx: rand(-0.18, 0.18),
                    vy: rand(-0.18, 0.18),
                });
            }
        };

        const resize = () => {
            const rect = heroSection.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            cssW = rect.width;
            cssH = rect.height;
            heroCanvas.width  = Math.round(cssW * dpr);
            heroCanvas.height = Math.round(cssH * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            makeParticles();
        };

        const draw = () => {
            ctx.clearRect(0, 0, cssW, cssH);

            for (const p of particles) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < -10) p.x = cssW + 10; else if (p.x > cssW + 10) p.x = -10;
                if (p.y < -10) p.y = cssH + 10; else if (p.y > cssH + 10) p.y = -10;
            }

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > LINK_DIST * LINK_DIST) continue;
                    const d = Math.sqrt(d2);
                    const alpha = (1 - d / LINK_DIST) * 0.18;
                    ctx.strokeStyle = 'rgba(201,168,76,' + alpha.toFixed(3) + ')';
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = 'rgba(201,168,76,0.5)';
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, DOT_R, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => {
            draw();
            rafId = requestAnimationFrame(loop);
        };
        const start = () => {
            if (running || reduceMotion) return;
            running = true;
            rafId = requestAnimationFrame(loop);
        };
        const stop = () => {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        };

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                inView = entries[0].isIntersecting;
                if (inView && !document.hidden) start(); else stop();
            }, { threshold: 0 });
            io.observe(heroSection);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else if (inView) start();
        });

        let resizeQueued = false;
        window.addEventListener('resize', () => {
            if (resizeQueued) return;
            resizeQueued = true;
            requestAnimationFrame(() => { resize(); resizeQueued = false; });
        }, { passive: true });

        resize();
        start();
    }

    // ===== MICRO-INTERACTION GUARDS =====
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const motionOK = !reduceMotion;
    const tiltEnabled = motionOK && !coarsePointer;

    // ===== CARD 3D TILT =====
    const TILT_MAX = 6; // degrees
    function attachTilt(card) {
        if (!tiltEnabled || card.dataset.tilt) return;
        card.dataset.tilt = '1';
        card.style.perspective = '700px';
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rotY = (px - 0.5) * 2 * TILT_MAX;
            const rotX = (0.5 - py) * 2 * TILT_MAX;
            card.classList.add('tilt-active');
            card.classList.remove('tilt-reset');
            card.style.transform =
                `perspective(700px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('tilt-active');
            card.classList.add('tilt-reset');
            card.style.transform = '';
        });
    }
    if (tiltEnabled) {
        document.querySelectorAll('.stat-item, .skill-group, .achievement-card, .timeline-body, .gh-card')
            .forEach(attachTilt);
    }

    // ===== BUTTON RIPPLE =====
    if (motionOK) {
        document.querySelectorAll('.btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                const r = btn.getBoundingClientRect();
                const size = Math.max(r.width, r.height);
                const span = document.createElement('span');
                span.className = 'ripple';
                span.style.width = span.style.height = size + 'px';
                span.style.left = (e.clientX - r.left - size / 2) + 'px';
                span.style.top  = (e.clientY - r.top  - size / 2) + 'px';
                btn.appendChild(span);
                span.addEventListener('animationend', () => span.remove());
            });
        });
    }

    // ===== MAGNETIC BUTTONS =====
    if (motionOK && !coarsePointer) {
        const STRENGTH = 0.3;
        const MAX = 8;
        document.querySelectorAll('.btn-primary, .nav-cta').forEach((el) => {
            el.classList.add('magnetic');
            const lift = el.classList.contains('nav-cta') ? 1 : 2;
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                let dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
                let dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
                dx = Math.max(-MAX, Math.min(MAX, dx));
                dy = Math.max(-MAX, Math.min(MAX, dy));
                el.classList.remove('magnet-reset');
                el.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - lift).toFixed(1)}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.classList.add('magnet-reset');
                el.style.transform = '';
            });
        });
    }

    // ===== FORM SUCCESS ANIMATION =====
    function playFormSuccess(btn, notice) {
        if (!motionOK) return;
        const check = document.createElement('span');
        check.className = 'success-check';
        check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6"/></svg>';
        notice.prepend(check);
        btn.classList.add('btn-success-pulse');
        btn.addEventListener('animationend', () => btn.classList.remove('btn-success-pulse'), { once: true });
    }

});
