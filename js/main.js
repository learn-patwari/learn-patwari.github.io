document.addEventListener('DOMContentLoaded', () => {

    // Static tagline
    const typedEl = document.getElementById('typedText');
    if (typedEl) typedEl.textContent = 'Staff Software Engineer · Java · Kubernetes · MLOps';

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

    // ===== ACTIVE NAV LINK ON SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        navLinkEls.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();


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

});
