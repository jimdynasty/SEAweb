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
if (carousel) {
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        // The dragging will disable default click events, so links might need careful handling if a drag occurred.
        // But for <a href>, usually if mouseup happens on same element without move it's a click.
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Prevent text selection/drag behaviors
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        carousel.scrollLeft = scrollLeft - walk;
    });
}
