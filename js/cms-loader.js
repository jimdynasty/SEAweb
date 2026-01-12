// ============================================
// CMS Content Loader
// Dynamically loads news and events from markdown files via GitHub API
// ============================================

const GITHUB_REPO = 'jimdynasty/SEAweb';
const GITHUB_BRANCH = 'main';

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

// Fetch file list from GitHub
async function fetchFileList(path) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`
    );
    if (!response.ok) return [];
    const files = await response.json();
    return files.filter(f => f.name.endsWith('.md'));
  } catch (error) {
    console.error(`Error fetching file list from ${path}:`, error);
    return [];
  }
}

// Fetch and parse a markdown file
async function fetchMarkdownFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    return parseFrontmatter(text);
  } catch (error) {
    console.error('Error fetching markdown file:', error);
    return null;
  }
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

// Load news posts from GitHub
async function loadNews() {
  try {
    const files = await fetchFileList('content/news');
    const posts = [];

    for (const file of files) {
      const content = await fetchMarkdownFile(file.download_url);
      if (content) {
        posts.push(content);
      }
    }

    // Sort by date, newest first
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading news:', error);
    return [];
  }
}

// Load events from GitHub
async function loadEvents() {
  try {
    const files = await fetchFileList('content/events');
    const events = [];

    for (const file of files) {
      const content = await fetchMarkdownFile(file.download_url);
      if (content) {
        events.push(content);
      }
    }

    // Filter out past events and sort by date
    const now = new Date();
    return events
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

  if (upcomingEvents.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center">No upcoming events at this time.</p>';
    return;
  }

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
            <a href="${event.ticketLink || '#'}" class="text-accent text-sm hover:text-accent-light transition">Get Tickets →</a>
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

  if (events.length === 0) {
    container.innerHTML = '<div class="text-center py-12 text-gray-400">No upcoming events at this time. Check back soon!</div>';
    return;
  }

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
            <span class="text-xs text-accent uppercase tracking-wider">${event.type || 'Event'}</span>
            <h3 class="text-xl text-white font-semibold mt-1 mb-2">${event.title}</h3>
            <p class="text-gray-400 mb-4">${event.description || ''}</p>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${event.location}
              </span>
              ${event.time ? `<span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ${event.time}
              </span>` : ''}
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
        <p class="text-gray-400 mb-6">${featuredPost.excerpt || ''}</p>
        <a href="#" class="btn-primary">Read More</a>
      </div>
    `;
  }

  // Render regular posts
  if (postsContainer) {
    postsContainer.innerHTML = regularPosts.map(post => `
      <article class="card p-6">
        <span class="text-accent text-xs uppercase">${post.category || 'News'}</span>
        <h3 class="text-xl text-white font-semibold mt-1 mb-2">${post.title}</h3>
        <p class="text-gray-400 text-sm">${post.excerpt || ''}</p>
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
