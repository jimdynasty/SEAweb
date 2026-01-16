# Saara El-Arifi - Author Website

A dark fantasy-themed author website for Saara El-Arifi, featuring book showcases, events, news, and contact information.

## Tech Stack

- **Frontend**: HTML5, CSS3, Tailwind CSS (CDN), Vanilla JavaScript
- **CMS**: **Sveltia CMS** (Git-based, no backend required)
- **Hosting**: GitHub Pages
- **Forms**: Web3Forms

## Local Development

```bash
# Start local server
python3 -m http.server 8000

# Access at http://localhost:8000
```

## ✅ Completed Features

### Core Design
- [x] **Dark Fantasy Theme**: Custom `slate-darker` palette, "wisp" decorations, and glassmorphism cards.
- [x] **Responsive Layout**: Mobile-first design with hamburger menu and stackable grids.
- [x] **Typography**: 'Italiana' (Display) and 'Inter' (Body) font pairing.
- [x] **Animations**: Hover effects, scroll reveals, and smooth transitions.

### Interactive Elements
- [x] **Book Stacks**: "Fan-out" animation on homepage for trilogy series (hover on desktop, scroll-triggered on mobile).
- [x] **Easter Egg**: "Pudding & Noodle" pixel art reveal on Contact page FAQ hover.
- [x] **Carousel**: Horizontal scroll snap carousel for books on mobile.

### SEO
- [x] **Meta Tags**: Title, Description, Open Graph (Social), and Twitter Cards on all pages.
- [x] **Sitemap**: `sitemap.xml` generated.
- [x] **Robots**: `robots.txt` configured.
- [x] **Canonical URLs**: Added to prevent duplicate content issues.
- [x] **Favicon**: Author logo configured as site icon.

## 🚀 Pre-Publish Checklist (To Do)

### 1. Content Finalization
- [ ] **Retailer Links**: Update "Buy Now" buttons in `books.html` with real URLs.
- [ ] **Events**: Use the CMS to add upcoming real events.
- [ ] **News**: Use the CMS to add latest news items.
- [ ] **Privacy Policy**: Review `privacy.html` (created).
- [ ] **Newsletter**: Set up "Kit" (ConvertKit) account and replace the form action/script in `index.html`.

### 2. Form Configurationure

## File Structure

```
/
├── index.html              # Homepage (Hero, Author Bio, Featured Books)
├── books.html             # Full Book List (The Ending Fire, Faebound)
├── events.html            # Events Calendar (CMS Powered)
├── news.html              # Latest News (CMS Powered)
├── contact.html           # Contact Form & FAQs
├── 404.html               # Custom Error Page
├── fonts.html             # Client Font Review Page (Dev Tool)
├── sitemap.xml            # SEO Sitemap
├── robots.txt             # SEO Crawler Instructions
├── admin/                 # CMS Configuration
├── assets/
│   └── images/            # Optimized Images (WebP/JPG/PNG)
├── css/
│   └── styles.css         # Custom Overrides & Tailwind Config
└── js/
    ├── main.js           # UI Interactions (Mobile Menu, Scroll Observers)
    └── cms-loader.js     # JSON Content Loader
```

## CMS Guide

Refer to `CMS_GUIDE.md` for instructions on how to add/edit News and Events.

## License

© 2026 Saara El-Arifi. All rights reserved.
Illustrations and logo by © Sophie Dunster
