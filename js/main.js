document.addEventListener('DOMContentLoaded', () => {
    // ===== ROUTING SYSTEM WITH SMOOTH SCROLL =====
    function navigateToSection(hash) {
        const sections = document.querySelectorAll('.section');
        const targetSection = document.querySelector(hash || '#home');
        
        if (targetSection) {
            // Remove active class from all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to target section
            targetSection.classList.add('active');
            
            // Smooth scroll to top of the newly active section
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href');
            history.pushState(null, '', hash);
            navigateToSection(hash);
        });
    });

    window.addEventListener('popstate', () => {
        navigateToSection(window.location.hash);
    });

    navigateToSection(window.location.hash || '#home');

    // ===== STARS GENERATION =====
    function generateStars() {
        const starsContainer = document.getElementById('stars');
        if (!starsContainer) return;

        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
    }
    generateStars();

    // ===== TYPING ANIMATION =====
    const phrases = [
        'Software Engineer',
        'Full Stack Developer',
        'Java Developer',
        'Kubernetes Expert',
        'MLOps Enthusiast',
        'Problem Solver'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeText() {
        const typingElement = document.getElementById('typingText');
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            setTimeout(() => isDeleting = true, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }

        setTimeout(typeText, isDeleting ? 50 : 100);
    }
    typeText();

    // ===== SKILLS DATA =====
    const skills = [
        { name: 'Java', icon: 'fab fa-java', level: 95 },
        { name: 'Kubernetes', icon: 'fas fa-dharmachakra', level: 90 },
        { name: 'Docker', icon: 'fab fa-docker', level: 90 },
        { name: 'Angular', icon: 'fab fa-angular', level: 85 },
        { name: 'Spring Boot', icon: 'fas fa-leaf', level: 90 },
        { name: 'Oracle DB', icon: 'fas fa-database', level: 88 },
        { name: 'MySQL', icon: 'fas fa-database', level: 85 },
        { name: 'Git', icon: 'fab fa-git-alt', level: 90 },
        { name: 'Jenkins', icon: 'fas fa-cogs', level: 85 },
        { name: 'Python', icon: 'fab fa-python', level: 80 },
        { name: 'Linux', icon: 'fab fa-linux', level: 85 },
        { name: 'AI/ML', icon: 'fas fa-brain', level: 75 }
    ];

    function loadSkills() {
        const skillsGrid = document.getElementById('skillsGrid');
        if (!skillsGrid) return;

        skillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-card">
                <div class="skill-icon">
                    <i class="${skill.icon}"></i>
                </div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                </div>
            </div>
        `).join('');
    }
    loadSkills();

    // ===== GITHUB API =====
    async function loadGitHubData() {
        try {
            const response = await fetch('https://api.github.com/users/learn-patwari');
            const data = await response.json();
            const imageUrl = 'static\image\IDCard.JPG';
            const reposResponse = await fetch('https://api.github.com/users/learn-patwari/repos?sort=updated&per_page=100');
            const repos = await reposResponse.json();

            const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

            document.getElementById('githubStats').innerHTML = `
                <div class="github-card glass-card">
                    <img src="${imageUrl}" alt="Akshay Patwari" class="github-avatar">
                    <h3>${data.name || data.login}</h3>
                    <p style="color: var(--text-secondary); margin: 10px 0;">@${data.login}</p>
                    <p style="color: var(--text-secondary);">${data.bio || 'Software Engineer'}</p>
                </div>
                <div class="github-card glass-card">
                    <div class="stat-number">${data.public_repos}</div>
                    <div class="stat-label">Public Repositories</div>
                </div>
                <div class="github-card glass-card">
                    <div class="stat-number">${data.followers}</div>
                    <div class="stat-label">Followers</div>
                </div>
                <div class="github-card glass-card">
                    <div class="stat-number">${totalStars}</div>
                    <div class="stat-label">Total Stars</div>
                </div>
                <div class="github-card glass-card">
                    <div class="stat-number">${data.following}</div>
                    <div class="stat-label">Following</div>
                </div>
                <div class="github-card glass-card">
                    <div class="stat-number">${totalForks}</div>
                    <div class="stat-label">Total Forks</div>
                </div>
            `;
        } catch (error) {
            document.getElementById('githubStats').innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <p style="color: var(--text-secondary);">Unable to load GitHub data. Please check the username.</p>
                </div>
            `;
        }
    }

    // ===== RESUME PROJECTS (VERTICAL) =====
    const resumeProjects = [
        {
            title: 'MLOps Framework & Secure Platform',
            role: 'Software Engineer – CL2 · Samsung Electro-Mechanics',
            period: '02/2022 – Present',
            summary: 'Engineered scalable MLOps lifecycle tooling and secure platform integrations to cut downtime and accelerate AI delivery.',
            impact: [
                'Built and deployed MLOps frameworks covering deploy, monitor, and maintain stages to reduce operational downtime.',
                'Leveraged Kubernetes orchestration for containerized apps, driving high resource utilization, scalability, and resilience.',
                'Implemented SSO with Keycloak across Kubeflow, Grafana, Jupyter, and Docker to strengthen security and UX.',
                'Led a 6-developer team, steering projects, process improvements, and client communication to ensure satisfaction.'
            ],
            tech: ['Java', 'Spring Boot', 'Kubernetes', 'Docker', 'Keycloak', 'Kubeflow', 'Grafana', 'CI/CD']
        },
        {
            title: 'Flexcube Banking Enhancements & Stability',
            role: 'Technical Staff Consultant · Oracle Financial Services Software Ltd',
            period: '08/2021 – 02/2022',
            summary: 'Delivered production fixes and feature enhancements for Flexcube banking modules with rigorous PL/SQL engineering.',
            impact: [
                'Analyzed modules and built PL/SQL packages/functions/procedures to extend banking functionality.',
                'Deployed data-fix patches using PL/SQL cursors and SQL to resolve production defects safely.',
                'Maintained compliance and seamless integration with banking services during enhancements.'
            ],
            tech: ['PL/SQL', 'Oracle DB', 'SQL', 'Banking Systems']
        },
        {
            title: 'Client Solutions & Walkback Handling',
            role: 'Programmer Analyst · Cognizant Technology Solutions',
            period: '02/2019 – 08/2021',
            summary: 'Delivered client-driven changes and resilience improvements with proactive engineering and process tuning.',
            impact: [
                'Implemented client-requested changes with a quality-focused, efficient delivery approach.',
                'Built walkback handling code to improve robustness and reduce downtime in production flows.',
                'Suggested and drove process optimizations aligned with business goals and future enhancements.'
            ],
            tech: ['Java', 'PL/SQL', 'Process Improvement', 'Reliability']
        }
    ];

    function loadProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;

        projectsGrid.innerHTML = resumeProjects.map(project => `
            <div class="project-card">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-meta">${project.role} · ${project.period}</p>
                    <p class="project-description">${project.summary}</p>
                    <ul class="project-bullets">
                        ${project.impact.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <div class="project-tags">
                        ${project.tech.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        const projectCount = document.getElementById('projectCount');
        if (projectCount) {
            projectCount.textContent = resumeProjects.length;
        }
    }

    // ===== LEETCODE API (Using Public API) =====
    async function loadLeetCodeData() {
        try {
            const response = await fetch('https://leetcode-stats-api.herokuapp.com/akshayPatwari');
            const data = await response.json();

            const totalSolved = data.totalSolved || 0;
            const easySolved = data.easySolved || 0;
            const mediumSolved = data.mediumSolved || 0;
            const hardSolved = data.hardSolved || 0;

            document.getElementById('leetcodeStats').innerHTML = `
                <div class="leetcode-card glass-card">
                    <div class="stat-number">${totalSolved}</div>
                    <div class="stat-label">Total Solved</div>
                </div>
                <div class="leetcode-card glass-card">
                    <div class="difficulty-label">Easy</div>
                    <div class="difficulty-count easy">${easySolved}</div>
                </div>
                <div class="leetcode-card glass-card">
                    <div class="difficulty-label">Medium</div>
                    <div class="difficulty-count medium">${mediumSolved}</div>
                </div>
                <div class="leetcode-card glass-card">
                    <div class="difficulty-label">Hard</div>
                    <div class="difficulty-count hard">${hardSolved}</div>
                </div>
            `;

            document.getElementById('problemsSolved').textContent = totalSolved;
        } catch (error) {
            document.getElementById('leetcodeStats').innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <p style="color: var(--text-secondary);">Unable to load LeetCode data. The API might be temporarily unavailable.</p>
                    <p style="color: var(--text-secondary); margin-top: 10px; font-size: 14px;">Visit: <a href="https://leetcode.com/akshayPatwari" target="_blank" style="color: var(--accent-primary);">leetcode.com/akshayPatwari</a></p>
                </div>
            `;
        }
    }

    // ===== LINKEDIN EXPERIENCE DATA =====
    function loadLinkedInData() {
        const experiences = [
            {
                company: 'Samsung Electro-Mechanics',
                title: 'Software Engineer',
                duration: 'May 2022 - Present',
                description: [
                    'Implemented scalable MLOps applications for AI model deployment',
                    'Designed SSO Keycloak-based login integrations',
                    'Developed microservices using Java and Angular',
                    'Managed Kubernetes clusters for container orchestration'
                ]
            },
            {
                company: 'Oracle Financial Services Software',
                title: 'Technical Staff Consultant',
                duration: 'Jan 2019 - May 2022',
                description: [
                    'Developed and maintained Flexcube applications with PL/SQL',
                    'Implemented production fixes for client databases',
                    'Optimized database queries for better performance',
                    'Collaborated with cross-functional teams'
                ]
            }
        ];

        document.getElementById('experienceTimeline').innerHTML = experiences.map(exp => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="company-name">${exp.company}</div>
                    <div class="job-title">${exp.title}</div>
                    <div class="job-duration">${exp.duration}</div>
                    <ul style="color: var(--text-secondary); margin-left: 20px;">
                        ${exp.description.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');

        const aboutDescription = document.getElementById('aboutDescription');
        if (aboutDescription) {
            aboutDescription.textContent = 'Results-driven Software Engineer with 6+ years of experience specializing in Java, Kubernetes, Docker, and full-stack development. Currently working at Samsung Electro-Mechanics, implementing scalable MLOps applications and microservices architecture. Passionate about cloud technologies, AI/ML, and solving complex problems.';
        }
    }

    // ===== RESUME DOWNLOAD =====
    const RESUME_URL = 'static/content/AkshayPatwari.pdf';

    function triggerResumeDownload() {
        const link = document.createElement('a');
        link.href = RESUME_URL;
        link.download = 'AkshayPatwari.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const downloadResumeBtn = document.getElementById('downloadResumeBtn');
    const heroDownloadBtn = document.getElementById('heroDownloadBtn');
    const viewResumeBtn = document.getElementById('viewResumeBtn');

    if (downloadResumeBtn) {
        downloadResumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerResumeDownload();
        });
    }

    if (heroDownloadBtn) {
        heroDownloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerResumeDownload();
            navigateToSection('#resume');
            history.pushState(null, '', '#resume');
        });
    }

    if (viewResumeBtn) {
        viewResumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(RESUME_URL, '_blank');
        });
    }

    // ===== LOAD ALL DATA =====
    setTimeout(() => {
        loadGitHubData();
        loadProjects();
        loadLeetCodeData();
        loadLinkedInData();
    }, 1000);

    // ===== SCROLL ANIMATIONS =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card, .skill-card, .project-card').forEach(el => {
        observer.observe(el);
    });

    // ===== COMING SOON MODAL =====
    const comingSoonModal = document.getElementById('comingSoonModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const backHomeBtn = document.getElementById('backHomeBtn');

    function showComingSoon() {
        comingSoonModal.classList.add('active');
    }

    function hideComingSoon() {
        comingSoonModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', hideComingSoon);
    backHomeBtn.addEventListener('click', () => {
        hideComingSoon();
        navigateToSection('#home');
        history.pushState(null, '', '#home');
    });

    comingSoonModal.addEventListener('click', (e) => {
        if (e.target === comingSoonModal) {
            hideComingSoon();
        }
    });

    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showComingSoon();
    });
});
