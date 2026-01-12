// ============================================
// CMS Content Loader
// Dynamically loads news and events from markdown files
// ============================================

// Parse markdown frontmatter
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');

      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      frontmatter[key] = value;
    }
  });

  frontmatter.content = match[2].trim();
  return frontmatter;
}

// Simple markdown to HTML converter (basic)
function markdownToHTML(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  return html;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format event date for card
function formatEventDate(dateString) {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year: date.getFullYear()
  };
}

// Load news posts
async function loadNews() {
  try {
    // In production, you'd fetch from actual files or API
    // For now, we'll use the sample data
    const sampleNews = [
      {
        title: "Cursebound Tour TICKETS",
        date: "2025-01-10T10:00:00Z",
        featured: true,
        category: "Tour",
        excerpt: "The Cursebound UK tour is HERE! Grab your tickets for London, Manchester, and Edinburgh stops.",
        series: "Faebound"
      }
    ];

    return sampleNews;
  } catch (error) {
    console.error('Error loading news:', error);
    return [];
  }
}

// Load events
async function loadEvents() {
  try {
    const sampleEvents = [
      {
        title: "Cursebound Tour - London",
        date: "2025-02-15T18:30:00Z",
        type: "Book Signing",
        location: "Waterstones Piccadilly",
        time: "6:30 PM",
        description: "Join me for the London stop of the Cursebound book tour! I'll be signing copies and chatting about the Faebound series.",
        ticketLink: "#",
        past: false
      },
      {
        title: "Cursebound Tour - Manchester",
        date: "2025-02-22T19:00:00Z",
        type: "Book Signing",
        location: "Waterstones Deansgate",
        time: "7:00 PM",
        description: "The Cursebound tour heads north! Meet me in Manchester for signings and a Q&A session.",
        ticketLink: "#",
        past: false
      },
      {
        title: "Cursebound Tour - Edinburgh",
        date: "2025-03-01T18:00:00Z",
        type: "Book Signing",
        location: "Waterstones West End",
        time: "6:00 PM",
        description: "The final stop of the UK tour! Join me in beautiful Edinburgh.",
        ticketLink: "#",
        past: false
      }
    ];

    // Filter out past events and sort by date
    const now = new Date();
    return sampleEvents
      .filter(event => !event.past && new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

// Render events on homepage
async function renderHomeEvents() {
  const container = document.getElementById('home-events');
  if (!container) return;

  const events = await loadEvents();
  const upcomingEvents = events.slice(0, 3); // Show only next 3

  container.innerHTML = upcomingEvents.map(event => {
    const dateInfo = formatEventDate(event.date);
    return `
      <div class="card p-6">
        <div class="flex items-start gap-4">
          <div class="bg-accent/20 rounded-lg p-3 text-center min-w-[60px]">
            <p class="text-accent font-bold text-xl">${dateInfo.day}</p>
            <p class="text-accent-light text-xs uppercase">${dateInfo.month}</p>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-1">${event.title}</h3>
            <p class="text-gray-400 text-sm mb-3">${event.location}</p>
            <a href="${event.ticketLink}" class="text-accent text-sm hover:text-accent-light transition">Get Tickets →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render full events page
async function renderEventsPage() {
  const container = document.getElementById('events-list');
  if (!container) return;

  const events = await loadEvents();

  container.innerHTML = events.map(event => {
    const dateInfo = formatEventDate(event.date);
    return `
      <div class="card p-6 md:p-8">
        <div class="flex flex-col md:flex-row md:items-start gap-6">
          <div class="bg-accent/20 rounded-xl p-4 text-center min-w-[100px] flex-shrink-0">
            <p class="text-accent font-bold text-3xl">${dateInfo.day}</p>
            <p class="text-accent-light text-sm uppercase">${dateInfo.month} ${dateInfo.year}</p>
          </div>
          <div class="flex-1">
            <span class="text-xs text-accent uppercase tracking-wider">${event.type}</span>
            <h3 class="text-xl text-white font-semibold mt-1 mb-2">${event.title}</h3>
            <p class="text-gray-400 mb-4">${event.description}</p>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${event.location}
              </span>
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ${event.time}
              </span>
            </div>
            ${event.ticketLink ? `<a href="${event.ticketLink}" class="btn-primary text-sm">Get Tickets</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render news posts
async function renderNewsPosts() {
  const featuredContainer = document.getElementById('featured-news');
  const postsContainer = document.getElementById('news-posts');

  const posts = await loadNews();
  const featuredPost = posts.find(p => p.featured);
  const regularPosts = posts.filter(p => !p.featured);

  // Render featured post
  if (featuredContainer && featuredPost) {
    featuredContainer.innerHTML = `
      <div class="card p-8 border-accent/30">
        <span class="bestseller-badge inline-block mb-4">Featured</span>
        <h2 class="font-display text-3xl text-white mt-2 mb-4">${featuredPost.title}</h2>
        <p class="text-gray-400 mb-6">${featuredPost.excerpt}</p>
        <a href="#" class="btn-primary">Read More</a>
      </div>
    `;
  }

  // Render regular posts
  if (postsContainer) {
    postsContainer.innerHTML = regularPosts.map(post => `
      <article class="card p-6">
        <span class="text-accent text-xs uppercase">${post.category}</span>
        <h3 class="text-xl text-white font-semibold mt-1 mb-2">${post.title}</h3>
        <p class="text-gray-400 text-sm">${post.excerpt}</p>
      </article>
    `).join('');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Homepage
  renderHomeEvents();

  // Events page
  renderEventsPage();

  // News page
  renderNewsPosts();
}
