// ============================================
// Saara El-Arifi - Author Website
// Main JavaScript
// ============================================

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

// Dynamic Logo Resizing to prevent navbar overlap
function adjustLogoResponsive() {
    const logo = document.querySelector('.logo-white');
    const nav = document.querySelector('.nav-desktop');

    if (!logo || !nav) return;

    // Only run on desktop where nav is visible
    if (window.getComputedStyle(nav).display === 'none') {
        logo.style.maxWidth = '';
        return;
    }

    // Reset to measure natural size
    logo.style.maxWidth = '';

    const logoRect = logo.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const buffer = 10; // Minimum space between logo and nav

    // Calculate if overlap is happening or imminent
    // We use the logo's left position + current width vs nav's left position
    const availableSpace = navRect.left - logoRect.left - buffer;

    if (logoRect.width > availableSpace) {
        logo.style.maxWidth = `${Math.max(0, availableSpace)}px`;
    }
}

// Run on load and resize
window.addEventListener('load', adjustLogoResponsive);
window.addEventListener('resize', adjustLogoResponsive);
// Also run immediately in case DOM is ready
adjustLogoResponsive();

// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        toggleMobileMenu();
    });
});

// Scroll reveal animation
function reveal() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', reveal);
reveal(); // Run on page load

// Header scroll effect removed for homepage transparency


// Newsletter form handling removed to allow Web3Forms contact submission

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add hover parallax effect to book covers
document.querySelectorAll('.book-cover').forEach(cover => {
    cover.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    cover.addEventListener('mouseleave', function () {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});
// Contact Form Handling
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const form = document.getElementById('contact-form');
        const successMsg = document.getElementById('form-success');

        if (form && successMsg) {
            form.classList.add('hidden');
            successMsg.classList.remove('hidden');
            // Smooth scroll to success message
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// Reusable Carousel Initialization
function initCarousel(carouselId, dotsId) {
    const carousel = document.getElementById(carouselId);
    const dotsContainer = document.getElementById(dotsId);
    const dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];

    if (!carousel) return;

    function updateDots() {
        if (!dots.length) return;
        const scrollLeft = carousel.scrollLeft;
        // Width + gap (approx 24px/1.5rem) - Adjust if gap differs
        const itemWidth = carousel.firstElementChild ? (carousel.firstElementChild.offsetWidth + 24) : 300;
        const index = Math.round(scrollLeft / itemWidth);

        dots.forEach((dot, i) => {
            dot.style.opacity = i === index ? '1' : '0.4';
        });
    }

    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    // Prevent default image drag
    carousel.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Prevent link click if dragging
    carousel.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    carousel.addEventListener('scroll', () => {
        requestAnimationFrame(updateDots);
    });

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        carousel.classList.add('active');
        carousel.style.scrollSnapType = 'none';

        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        if (isDown) {
            isDown = false;
            carousel.classList.remove('active');
            carousel.style.scrollSnapType = 'x mandatory';
        }
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
        carousel.style.scrollSnapType = 'x mandatory';
        setTimeout(() => { isDragging = false; }, 50);
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;

        if (Math.abs(walk) > 5) {
            isDragging = true;
            e.preventDefault();
            carousel.scrollLeft = scrollLeft - walk;
        }
    });

    // Initial dot state
    updateDots();
}

// Initialize Carousels
document.addEventListener('DOMContentLoaded', () => {
    initCarousel('my-worlds-carousel', 'carousel-dots');
    initCarousel('faebound-carousel', 'faebound-dots');
    initCarousel('ending-fire-carousel', 'ending-fire-dots');
});


// ============================================
// EASTER EGGS 🥚
// ============================================
(function () {
    let inputs = [];
    const konami = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';
    const pudding = 'pudding';

    document.addEventListener('keydown', (e) => {
        // IGNORE INPUTS (Forms, Search, etc)
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
            return;
        }

        // Build Log: Key for Konami, Lowercase Key for Pudding
        const key = e.key;

        // PUDDING CHECK
        // Only track letters for Pudding
        if (key.length === 1 && key.match(/[a-z]/i)) {
            inputs.push(key.toLowerCase());
        }
        // KONAMI CHECK
        else {
            inputs.push(key);
        }

        // Keep buffer reasonable
        if (inputs.length > 20) {
            inputs.shift();
        }

        const log = inputs.join('');

        if (log.includes(konami) || log.includes(pudding)) {
            // Trigger Reset
            inputs = [];
            // Redirect to Game Page
            window.location.href = 'game.html';
        }
    });
})();
