// HRMS Serene - Interactive Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Toggle hamburger icon animation
            menuToggle.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            if (menuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 2. Active Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 3. Chart Animation on Viewport Entry
    const chartBars = document.querySelectorAll('.chart-bar');
    const progressRingBar = document.querySelector('.progress-ring-bar');

    // Save targets and temporarily reset
    const barHeights = [];
    chartBars.forEach((bar, index) => {
        barHeights[index] = bar.style.height;
        bar.style.height = '0%';
    });

    let animatedRing = false;
    let animatedBars = false;

    const animateWidgets = () => {
        // Animate circular progress ring
        if (progressRingBar && !animatedRing) {
            const rect = progressRingBar.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                // Total circumference: 2 * PI * r = 2 * 3.14159 * 50 = 314.16
                // Target: 82% filled, so gap is 18% -> 314.16 * 0.18 = 56.55 (already set in HTML)
                // We transition from full gap (314.16) to target gap (56.55)
                progressRingBar.style.strokeDashoffset = '314.16';
                progressRingBar.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Force a reflow
                progressRingBar.getBoundingClientRect();
                
                progressRingBar.style.strokeDashoffset = '56.55';
                animatedRing = true;
            }
        }

        // Animate chart bars
        if (chartBars.length > 0 && !animatedBars) {
            const rect = chartBars[0].getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                chartBars.forEach((bar, index) => {
                    bar.style.transition = `height 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
                    bar.style.height = barHeights[index];
                });
                animatedBars = true;
            }
        }
    };

    // Run on scroll and on load
    window.addEventListener('scroll', animateWidgets);
    // Delay slightly to ensure smooth loading transition
    setTimeout(animateWidgets, 300);

    // 4. Subtle Page Scroll Elements Fade-In
    const fadeElements = document.querySelectorAll('.feature-card, .suite-card, .features-content');
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    const scrollFadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    fadeElements.forEach(el => scrollFadeObserver.observe(el));
});
