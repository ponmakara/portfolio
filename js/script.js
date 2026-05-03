const text = ["Full-Stack Developer", "Web Developer", "UI/UX Designer"];
let index = 0;
let charIndex = 0;

function typeEffect() {
    const typingElement = document.getElementById("typingText");

    if (charIndex < text[index].length) {
        typingElement.innerHTML = text[index].substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeEffect, 120);
    } else {
        setTimeout(() => eraseEffect(), 1500);
    }
}



function eraseEffect() {
    const typingElement = document.getElementById("typingText");

    if (charIndex > 0) {
        typingElement.innerHTML = text[index].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseEffect, 80);
    } else {
        index = (index + 1) % text.length;
        setTimeout(typeEffect, 300);
    }
}

typeEffect();

// Logo click/keyboard handler: toggle green and scroll to top
(function () {
    const logo = document.getElementById('logo');
    if (!logo) return;

    let lastTouch = 0;

    function activateLogo(toggle = true) {
        // toggle persistent active class (green) and scroll to top
        if (toggle) {
            if (logo.classList.contains('active')) {
                logo.classList.remove('active');
            } else {
                logo.classList.add('active');
            }
        } else {
            logo.classList.add('active');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Handle touch first (mobile). Use touchend and toggle persistent active state.
    logo.addEventListener('touchend', (e) => {
        // prevent the synthetic click that often follows touch
        e.preventDefault();
        lastTouch = Date.now();
        activateLogo(true);
    }, { passive: false });

    // Click handler ignores synthetic clicks shortly after a touch event
    logo.addEventListener('click', (e) => {
        if (Date.now() - lastTouch < 700) return;
        activateLogo(true);
    });

    // Keyboard accessibility
    logo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateLogo();
        }
    });
})();

// Compute nav height and set CSS variable so anchor targets appear below fixed nav
(function () {
    function updateNavOffset() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        // add a small buffer so headings are comfortably below the nav
        const buffer = 16;
        const navHeight = nav.offsetHeight || 0;
        document.documentElement.style.setProperty('--nav-offset', (navHeight + buffer) + 'px');
    }

    // Run on load and resize
    window.addEventListener('load', updateNavOffset);
    window.addEventListener('resize', updateNavOffset);
    // Also run once now in case script loads after DOM is ready
    updateNavOffset();
})();

// NAV: set active nav link on click and while scrolling
(function () {
    const navLinks = document.querySelectorAll('nav ul li a');
    if (!navLinks || navLinks.length === 0) return;

    // Click behavior: mark clicked link active
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Build list of section elements that correspond to nav hrefs
    const sectionIds = Array.from(navLinks).map(a => a.getAttribute('href')).filter(Boolean).map(h => h.replace('#', ''));
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    // IntersectionObserver to update active link while scrolling (50% visibility threshold)
    const ioOptions = {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.target.id) return;
            const id = entry.target.id;
            const link = document.querySelector(`nav ul li a[href="#${id}"]`);
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                if (link) link.classList.add('active');
            }
        });
    }, ioOptions);

    sections.forEach(s => observer.observe(s));
})();

// Hero image modal / touch / keyboard handler
(function () {
    const heroPic = document.getElementById('heroPic');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    if (!imageModal || !modalImage) return;

    const modalClose = imageModal.querySelector('.modal-close');
    let lastTouch = 0;

    function openModal(src, alt = '') {
        if (!src) return;
        modalImage.src = src;
        modalImage.alt = alt || 'Expanded view';
        imageModal.classList.add('active');
        imageModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        imageModal.classList.remove('active');
        imageModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        modalImage.src = '';
    }

    function bindClickableCard(card) {
        const img = card.querySelector('img');
        if (!img) return;
        card.setAttribute('tabindex', '0');

        card.addEventListener('click', () => {
            openModal(img.src, img.alt);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(img.src, img.alt);
            }
        });
    }

    // Hero image can also open the modal
    if (heroPic) {
        heroPic.addEventListener('touchend', (e) => {
            e.preventDefault();
            lastTouch = Date.now();
            const img = heroPic.querySelector('img');
            openModal(img?.src, img?.alt);
        }, { passive: false });

        heroPic.addEventListener('click', (e) => {
            if (Date.now() - lastTouch < 700) return;
            const img = heroPic.querySelector('img');
            openModal(img?.src, img?.alt);
        });

        heroPic.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const img = heroPic.querySelector('img');
                openModal(img?.src, img?.alt);
            }
        });
    }

    document.querySelectorAll('.workshop-card').forEach(bindClickableCard);

    modalClose.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal || e.target.classList.contains('modal-overlay')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('active')) closeModal();
    });
})();


// Scroll / reveal animations: use IntersectionObserver for reliable enter/exit
(() => {
    const revealSelector = '.reveal, .reveal-img, .eduFade';
    const items = Array.from(document.querySelectorAll(revealSelector));
    if (items.length === 0) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                el.classList.add('active');
                // If element is an eduFade item, ensure inline styles show it
                if (el.classList.contains('eduFade')) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
            } else {
                // Remove active when leaving viewport so scrolling back up re-triggers
                el.classList.remove('active');
                if (el.classList.contains('eduFade')) {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(40px)';
                }
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.12 });

    items.forEach(it => revealObserver.observe(it));
})();

// Simple animation when images appear (enter/exit handling)
const images = document.querySelectorAll('.gallery img, .project-preview img, .project-image img, .additional-image');
(() => {
    if (!images || images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                el.classList.add('in-view');
                if (!el.classList.contains('floating-img')) el.classList.add('floating-img');
                if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                    el.classList.add('animate-bob');
                }
                // animate into view
                el.style.opacity = 1;
                el.style.transform = 'translateY(0)';
            } else {
                // remove classes when scrolled out so re-entering retriggers animation
                el.classList.remove('in-view');
                if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                    el.classList.remove('animate-bob');
                }
                // reset transform/opacity for smooth re-entry
                el.style.opacity = 0;
                el.style.transform = 'translateY(20px)';
            }
        });
    }, { threshold: 0.25 });

    images.forEach(img => {
        img.classList.add('parallax-layer');
        img.style.opacity = 0;
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        imageObserver.observe(img);
    });
})();

// Add a lightweight mousemove parallax for images within their container
function attachParallax(containerSelector) {
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
        const img = container.querySelector('img.parallax-layer');
        if (!img) return;
        function onMove(e) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const tx = x * 12; // tweak intensity
            const ty = y * 8;
            img.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        }
        function onLeave() { img.style.transform = ''; }
        container.addEventListener('mousemove', onMove);
        container.addEventListener('mouseleave', onLeave);
    });
}

// Attach parallax to gallery item containers
attachParallax('.gallery');
attachParallax('.project-card');
attachParallax('.project-preview');













// (Old scroll-based reveal removed — using IntersectionObserver earlier)




// Initialize marquee content once (clone for seamless loop)
document.addEventListener('DOMContentLoaded', function () {
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        marqueeContent.innerHTML += marqueeContent.innerHTML;
    }
});

document.getElementById("userForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("userName").value.trim();
    let email = document.getElementById("userEmail").value.trim();
    let msg = document.getElementById("userMessage").value.trim();

    if (!name || !email || !msg) {
        alert("Please fill out all the fields.");
        return;
    }

    alert("Your message has been sent!");
    this.reset();
});


// Robot and Developer interactive actions
(function () {
    const robot = document.getElementById('robotImg');
    const dev = document.getElementById('devScene');

    // Robot: lifelike idle motion with reactions to hover, click and keyboard
    if (robot) {
        const robotWrap = robot.parentElement;
        let animating = false;
        let blinkTimer;
        let resetTimer;

        if (robotWrap) {
            robotWrap.classList.add('robot-stage');
        }

        function clearRobotMotion() {
            robot.style.setProperty('--robot-x', '0px');
            robot.style.setProperty('--robot-y', '0px');
            robot.style.setProperty('--robot-rotate', '0deg');
        }

        function blinkOnce() {
            robot.classList.remove('robot-blink');
            void robot.offsetWidth;
            robot.classList.add('robot-blink');
            setTimeout(() => robot.classList.remove('robot-blink'), 260);
        }

        function scheduleBlink() {
            clearTimeout(blinkTimer);
            blinkTimer = setTimeout(() => {
                blinkOnce();
                scheduleBlink();
            }, 1800 + Math.random() * 2600);
        }

        function startWave() {
            if (animating) return;
            animating = true;
            robot.classList.add('robot-wave');
            setTimeout(() => {
                robot.classList.remove('robot-wave');
                animating = false;
            }, 1100);
        }

        function playExcited() {
            robot.classList.remove('robot-excited');
            void robot.offsetWidth;
            robot.classList.add('robot-excited');
            setTimeout(() => robot.classList.remove('robot-excited'), 700);
        }

        function reactToPointer(event) {
            if (!robotWrap) return;
            const rect = robotWrap.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) - 0.5;
            const y = ((event.clientY - rect.top) / rect.height) - 0.5;
            const moveX = Math.max(-8, Math.min(8, x * 16));
            const moveY = Math.max(-6, Math.min(6, y * 12));
            const rotate = Math.max(-8, Math.min(8, x * 14));

            robot.style.setProperty('--robot-x', `${moveX}px`);
            robot.style.setProperty('--robot-y', `${moveY}px`);
            robot.style.setProperty('--robot-rotate', `${rotate}deg`);
        }

        function settleRobot() {
            clearTimeout(resetTimer);
            resetTimer = setTimeout(clearRobotMotion, 120);
        }

        robot.addEventListener('mouseenter', startWave);
        robot.addEventListener('focus', startWave);
        robot.addEventListener('click', () => {
            playExcited();
            startWave();
            blinkOnce();
        });

        robot.addEventListener('mousemove', reactToPointer);
        if (robotWrap) {
            robotWrap.addEventListener('mousemove', reactToPointer);
            robotWrap.addEventListener('mouseleave', settleRobot);
        }
        robot.addEventListener('mouseleave', settleRobot);
        robot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playExcited();
                startWave();
                blinkOnce();
            }
        });

        scheduleBlink();
    }

    // Developer coding scene: animate code running text and highlight interaction
    if (dev) {
        const runPill = dev.querySelector('.run-pill');
        const output = dev.querySelector('.screen-output');
        if (runPill) runPill.textContent = 'PASS';
        if (output) output.textContent = 'BUILD SUCCESS';
    }
})();





const fadeItems = document.querySelectorAll(".eduFade");

function revealBoxes() {
    fadeItems.forEach(card => {
        const boxPos = card.getBoundingClientRect().top;
        if (boxPos < window.innerHeight - 100) {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }
    });
}

window.addEventListener("scroll", revealBoxes);

fadeItems.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "0.6s ease";
});


// Make all eduBox cards interactive: keyboard + mouse + ARIA
(function () {
    const cards = document.querySelectorAll('.eduBox');
    if (!cards || cards.length === 0) return;

    cards.forEach(card => {
        // Provide keyboard focus and ARIA role to each card
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');

        // Toggle selected state (visual highlight)
        function toggleSelected() {
            const isSelected = card.classList.toggle('selected');
            card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        }

        card.addEventListener('click', (e) => {
            // If user clicks form elements inside card, ignore; otherwise toggle
            toggleSelected();
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelected();
            }
        });
    });
})();

const technologies = [
    { name: "HTML5", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "Sass", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
    { name: "Bootstrap", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    { name: "JavaScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Node.js", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "Vue.js", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
    { name: "TypeScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "PHP", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "Laravel", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
    { name: "MySQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "OOP", img: "https://cdn-icons-png.flaticon.com/512/6062/6062646.png" },
    { name: "AWS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { name: "Figma", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "GitHub", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Jira", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg" },
    { name: "Postman", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" }
];

document.addEventListener('DOMContentLoaded', () => {
    const orbit = document.getElementById('skillsOrbit') || document.getElementById('rotatingSkills') || document.querySelector('.skills-ring');
    if (!orbit) return;

    const wrapper = orbit.closest('.orbit-wrapper') || orbit.parentElement;
    const centerEl = (wrapper && (wrapper.querySelector('.center-photo') || document.getElementById('myPhoto'))) || null;
    const total = technologies.length;
    const orbitState = {
        radius: 0,
        baseRotation: 0,
        lastFrame: 0,
        hoverIndex: -1,
        motionActive: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    function getBadgeSize() {
        return window.innerWidth <= 768 ? 58 : 72;
    }

    function getGap() {
        return window.innerWidth <= 768 ? 8 : 10;
    }

    function getOrbitRadius() {
        const rect = orbit.getBoundingClientRect();
        const wrapperSize = Math.min(rect.width || 420, rect.height || 420);
        const badgeSize = getBadgeSize();
        const centerSize = centerEl ? Math.max(centerEl.clientWidth, centerEl.clientHeight) : 260;
        const minRadius = centerSize / 2 + badgeSize / 2 - 4;
        const packedRadius = (total * (badgeSize + getGap())) / (2 * Math.PI) - 18;
        const maxRadius = wrapperSize / 2 - badgeSize / 2 - 10;
        return Math.min(Math.max(minRadius, packedRadius), Math.max(88, maxRadius));
    }

    orbit.innerHTML = '';
    const badges = technologies.map((tech, index) => {
        const badge = document.createElement('button');
        const img = document.createElement('img');
        const startAngle = (-Math.PI / 2) + ((Math.PI * 2) / total) * index;

        badge.type = 'button';
        badge.className = 'tech-badge';
        badge.setAttribute('data-tech', tech.name);
        badge.setAttribute('aria-label', tech.name);
        badge.style.setProperty('--badge-size', `${getBadgeSize()}px`);

        img.src = tech.img;
        img.alt = tech.name;
        badge.appendChild(img);
        orbit.appendChild(badge);

        badge.addEventListener('mouseenter', () => {
            orbitState.hoverIndex = index;
        });

        badge.addEventListener('mouseleave', () => {
            orbitState.hoverIndex = -1;
        });

        badge.addEventListener('focus', () => {
            orbitState.hoverIndex = index;
        });

        badge.addEventListener('blur', () => {
            orbitState.hoverIndex = -1;
        });

        return { badge, startAngle };
    });

    function render() {
        badges.forEach(({ badge, startAngle }, index) => {
            const angle = startAngle + orbitState.baseRotation;
            const x = Math.cos(angle) * orbitState.radius;
            const y = Math.sin(angle) * orbitState.radius;
            const isActive = orbitState.hoverIndex === index;
            const scale = isActive ? 1.12 : 1;
            const opacity = orbitState.hoverIndex === -1 || isActive ? 1 : 0.82;

            badge.style.opacity = opacity;
            badge.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        });
    }

    function updateLayout() {
        orbitState.radius = getOrbitRadius();
        badges.forEach(({ badge }) => {
            badge.style.setProperty('--badge-size', `${getBadgeSize()}px`);
        });
        render();
    }

    function animate(frameTime) {
        if (!orbitState.lastFrame) {
            orbitState.lastFrame = frameTime;
        }

        const delta = frameTime - orbitState.lastFrame;
        orbitState.lastFrame = frameTime;

        if (orbitState.motionActive && orbitState.hoverIndex === -1) {
            orbitState.baseRotation += delta * 0.00022;
        }

        render();
        requestAnimationFrame(animate);
    }

    updateLayout();
    requestAnimationFrame(animate);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            orbitState.lastFrame = 0;
            updateLayout();
        }, 120);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toolCards = document.querySelectorAll('.tools-card');
    if (!toolCards.length) return;

    const revealCards = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (!entry.isIntersecting) return;

            const card = entry.target;
            setTimeout(() => {
                card.classList.add('is-visible');
            }, index * 120);
            observer.unobserve(card);
        });
    }, {
        threshold: 0.2
    });

    toolCards.forEach((card) => {
        revealCards.observe(card);
    });
});

// Project preview modal for touch/click on project cards
(function () {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('projectModalClose');
    const modalImage = document.getElementById('projectModalImage');
    const modalTitle = document.getElementById('projectModalTitle');
    const modalKicker = document.getElementById('projectModalKicker');
    const modalDescription = document.getElementById('projectModalDescription');
    const modalView = document.getElementById('projectModalView');
    const modalGithub = document.getElementById('projectModalGithub');
    const projectItems = document.querySelectorAll('.project-preview-trigger');

    if (!modal || !modalClose || !modalImage || !modalTitle || !modalKicker || !modalDescription || !modalView || !modalGithub || !projectItems.length) {
        return;
    }

    function isUsableLink(href) {
        return Boolean(href && href.trim() && href.trim() !== '#');
    }

    function setActionState(element, href) {
        if (!isUsableLink(href)) {
            element.classList.add('is-hidden');
            element.setAttribute('tabindex', '-1');
            element.removeAttribute('href');
            return;
        }

        element.classList.remove('is-hidden');
        element.removeAttribute('tabindex');
        element.href = href;
    }

    function openModal(card) {
        const image = card.querySelector('img');
        const title = card.querySelector('h3');
        const kicker = card.querySelector('.project-kicker, .featured-kicker');
        const description = card.querySelector('p');
        const links = card.querySelectorAll('a[href]');
        const imageSrc = image ? image.getAttribute('src') : '';
        const imageAlt = image ? image.getAttribute('alt') || '' : '';
        const titleText = title ? title.textContent.trim() : 'Project Preview';
        const kickerText = kicker ? kicker.textContent.trim() : 'Project';
        const descriptionText = description ? description.textContent.trim() : 'Project preview';
        const viewHref = links[0] ? links[0].getAttribute('href') : '';
        const githubHref = Array.from(links).find((link) => /github\.com/i.test(link.getAttribute('href') || ''))?.getAttribute('href') || '';

        modalImage.src = imageSrc;
        modalImage.alt = imageAlt || titleText;
        modalKicker.textContent = kickerText;
        modalTitle.textContent = titleText;
        modalDescription.textContent = descriptionText;
        setActionState(modalView, viewHref);
        setActionState(modalGithub, githubHref);
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    projectItems.forEach((card) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        card.addEventListener('click', (event) => {
            if (event.target.closest('a, button')) return;
            openModal(card);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                if (event.target.closest('a, button')) return;
                event.preventDefault();
                openModal(card);
            }
        });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target.hasAttribute('data-close-project-modal')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();

// Soft Skills Image Lightbox
(function () {
    const softPhotos = document.querySelectorAll('.soft-photo');
    const imageModal = document.getElementById('imageModal');
    
    if (!softPhotos.length || !imageModal) return;
    
    const modalImage = imageModal.querySelector('#modalImage');
    const modalOverlay = imageModal.querySelector('.modal-overlay');
    const modalClose = imageModal.querySelector('.modal-close');
    
    if (!modalImage || !modalOverlay || !modalClose) return;
    
    let lastTouch = 0;
    
    function openModal(imgSrc) {
        modalImage.src = imgSrc;
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        imageModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Click/Touch handlers
    softPhotos.forEach(photo => {
        photo.addEventListener('touchend', (e) => {
            e.preventDefault();
            lastTouch = Date.now();
            const imgSrc = photo.querySelector('img').src;
            openModal(imgSrc);
        }, { passive: false });
        
        photo.addEventListener('click', (e) => {
            if (Date.now() - lastTouch < 700) return;
            const imgSrc = photo.querySelector('img').src;
            openModal(imgSrc);
        });
        
        // Keyboard access
        photo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const imgSrc = photo.querySelector('img').src;
                openModal(imgSrc);
            }
        });
    });
    
    // Close handlers
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('active')) {
            closeModal();
        }
    });
})();

