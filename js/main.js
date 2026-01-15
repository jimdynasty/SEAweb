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

// Drag to Scroll implementation for My Worlds carousel
const carousel = document.getElementById('my-worlds-carousel');
const dotsContainer = document.getElementById('carousel-dots');
const dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];

function updateDots() {
    if (!carousel || !dots.length) return;
    const scrollLeft = carousel.scrollLeft;
    const itemWidth = carousel.firstElementChild.offsetWidth; // Approximate
    const index = Math.round(scrollLeft / itemWidth);

    dots.forEach((dot, i) => {
        dot.style.opacity = i === index ? '1' : '0.4';
    });
}

if (carousel) {
    let isDown = false;
    let startX;
    let scrollLeft;

    // Update dots on scroll
    carousel.addEventListener('scroll', () => {
        // Debounce slightly or just run
        requestAnimationFrame(updateDots);
    });

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active');
        // Disable snap during drag for smooth feel
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
        // Re-enable snap to let it settle
        carousel.style.scrollSnapType = 'x mandatory';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Initial dot state
    updateDots();
}
