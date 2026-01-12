# Saara El-Arifi - Author Website

A dark fantasy-themed author website for Saara El-Arifi, featuring book showcases, events, news, and contact information.

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind CSS via CDN), Vanilla JavaScript
- **CMS**: Netlify CMS for News and Events management
- **Hosting**: Netlify (recommended)
- **Local Development**: Python HTTP server

## Local Development

```bash
# Start local server
python3 -m http.server 8000

# Access at http://localhost:8000
```

## Pre-Deployment Checklist

### 🔴 Critical (Must Complete Before Launch)

#### 1. Contact Form Backend
- [ ] Choose a form service (Netlify Forms, Formspree, etc.)
- [ ] Update `contact.html` form action attribute
- [ ] Configure form handler for email notifications
- [ ] Test form submission and delivery

#### 2. Newsletter Integration
- [ ] Set up newsletter service (Mailchimp, Mailerlite, etc.)
- [ ] Update newsletter form on homepage (`index.html`)
- [ ] Configure API integration in `js/main.js`
- [ ] Test newsletter signup flow

#### 3. Retailer Links
- [ ] Add real Amazon UK links for all books in `books.html`
- [ ] Add Waterstones links for all books
- [ ] Add other retailer links as needed
- [ ] Test all purchase links

#### 4. Content Verification
- [ ] Verify all book descriptions are accurate
- [ ] Confirm all event details are current
- [ ] Check author bio is up to date
- [ ] Verify all contact email addresses

### 🟡 Important (Recommended)

#### 5. Analytics
- [ ] Set up Google Analytics or Plausible
- [ ] Add tracking code to all HTML pages
- [ ] Configure goal tracking for newsletter signups
- [ ] Configure goal tracking for book purchase clicks

#### 6. SEO Optimization
- [ ] Verify meta descriptions on all pages
- [ ] Add Open Graph tags for social sharing
- [ ] Create and upload `sitemap.xml`
- [ ] Create and upload `robots.txt`
- [ ] Add favicon files (all sizes)

#### 7. Performance
- [ ] Optimize all images (WebP format where possible)
- [ ] Test page load speeds
- [ ] Verify mobile responsiveness on real devices
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)

### 🟢 Optional (Nice to Have)

#### 8. Additional Features
- [ ] Set up custom domain email forwarding
- [ ] Add schema.org markup for author/books
- [ ] Add JSON-LD structured data
- [ ] Set up monitoring/uptime alerts

## Deployment to Netlify

### Step 1: Prepare Repository
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/saaraelarifi-website.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify
1. Log in to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: (leave empty - static site)
   - **Publish directory**: `.` (root)
5. Click "Deploy site"

### Step 3: Configure Domain
1. In Netlify dashboard, go to "Domain settings"
2. Add custom domain: `saaraelarifi.com`
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

### Step 4: Enable Netlify CMS
1. Enable Netlify Identity in site settings
2. Enable Git Gateway
3. Invite yourself as a user
4. Access CMS at `https://saaraelarifi.com/admin`

## File Structure

```
/
├── index.html              # Homepage
├── books.html             # Books showcase
├── events.html            # Events calendar
├── news.html              # News & updates
├── contact.html           # Contact form
├── about.html             # About page (no longer linked)
├── admin/
│   └── config.yml         # Netlify CMS config
├── assets/
│   └── images/            # All image files
├── css/
│   └── styles.css         # Custom styles
├── js/
│   ├── main.js           # Main JavaScript
│   └── cms-loader.js     # CMS content loader
└── CMS_GUIDE.md          # CMS usage guide
```

## Quick Reference

### Brand Colors
- **Pink Accent**: `#e91e8c`
- **Light Pink**: `#f472b6`
- **Dark Slate**: `#1a202c`
- **Slate Blue**: `#3d4a5c`

### Key Features
- Responsive design (mobile-first)
- Fixed navbar on all pages except homepage (absolute)
- Decorative wisps (viewport-fixed on homepage)
- Book hover parallax effects
- Newsletter signup form
- Contact form
- Netlify CMS for News and Events

## Support

For questions or issues, refer to `CMS_GUIDE.md` for CMS instructions or contact the developer.

## License

© 2025 Saara El-Arifi. All rights reserved.
Illustrations and logo by © Sophie Dunster
