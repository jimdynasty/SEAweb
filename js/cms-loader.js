// CMS Content Loader - Loads from static JSON files
// JSON files are generated when content changes

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

// Helper to get base path
function getBasePath() {
  const isGitHubPages = window.location.hostname.includes('github.io');
  return isGitHubPages ? '/SEAweb' : '';
}

// Helper to resolve image paths (handle local/prod and spaces)
function resolvePath(path) {
  if (!path) return null;

  // Clean path
  let cleanPath = path.trim();

  // Prepend base path if it starts with /
  if (cleanPath.startsWith('/')) {
    cleanPath = getBasePath() + cleanPath;
  }

  // Encode spaces and other special chars, but leave slashes
  return encodeURI(cleanPath);
}

// Load events from static JSON
async function loadEvents() {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}/events.json?t=${new Date().getTime()}`); // Add timestamp to prevent caching
    if (!response.ok) return [];
    const events = await response.json();

    // Filter out past events and sort by date
    const now = new Date();
    return events
      .filter(event => (event.past !== true && event.past !== 'true') && new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

// Load news from static JSON
async function loadNews() {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}/news.json?t=${new Date().getTime()}`);
    if (!response.ok) return [];
    const posts = await response.json();

    // Sort by date, newest first
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading news:', error);
    return [];
  }
}

// Render events on homepage
async function renderHomeEvents() {
  const container = document.getElementById('home-events');
  if (!container) return;

  const events = await loadEvents();
  const upcomingEvents = events.slice(0, 3);

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

  container.innerHTML = events.map((event, index) => {
    const dateInfo = formatEventDate(event.date);
    const description = event.description || '';

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
            <div class="text-gray-400 mb-4">
              <p class="event-description">${description}</p>
            </div>
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
            ${event.ticketLink ? `<a href="${event.ticketLink}" target="_blank" rel="noopener noreferrer" class="btn-primary text-sm">Get Tickets</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle description expansion
window.toggleDescription = function (index) {
  const truncatedEl = document.getElementById(`desc-${index}`);
  const fullEl = document.getElementById(`full-desc-${index}`);
  const btnEl = document.getElementById(`btn-${index}`);

  if (fullEl.classList.contains('hidden')) {
    truncatedEl.classList.add('hidden');
    fullEl.classList.remove('hidden');
    btnEl.textContent = 'Show less ←';
  } else {
    truncatedEl.classList.remove('hidden');
    fullEl.classList.add('hidden');
    btnEl.textContent = 'Read more →';
  }
};

// Render news posts
async function renderNewsPosts() {
  const featuredContainer = document.getElementById('featured-news');
  const postsContainer = document.getElementById('news-posts');

  const posts = await loadNews();

  if (posts.length === 0) {
    if (featuredContainer) featuredContainer.innerHTML = '';
    if (postsContainer) {
      postsContainer.innerHTML = '<div class="max-w-4xl mx-auto px-6"><div class="text-center py-12 text-gray-400">No news posts yet. Check back soon!</div></div>';
    }
    return;
  }

  const featuredPost = posts.find(p => p.featured);
  const regularPosts = posts.filter(p => !p.featured);

  // Render featured post
  if (featuredContainer && featuredPost) {
    const excerpt = featuredPost.excerpt || '';
    const truncated = excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;
    // Use body if available (parsed with marked), otherwise fallback to long excerpt
    const fullContent = featuredPost.body ? marked.parse(featuredPost.body) : excerpt;
    const needsExpand = !!featuredPost.body || excerpt.length > 150;
    const image = resolvePath(featuredPost.image);

    featuredContainer.innerHTML = `
      <div class="card p-8 border-accent/30">
        <span class="bestseller-badge inline-block mb-4">Featured</span>
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="flex-1 order-2 md:order-1">
            <h2 class="font-display text-3xl text-white mb-4">${featuredPost.title}</h2>
            <div class="text-gray-400">
              <div id="featured-excerpt" class="news-excerpt prose prose-invert">${truncated}</div>
              ${needsExpand ? `
                <button id="featured-btn-readmore" onclick="toggleNewsExcerpt('featured')" class="btn-primary mt-4">
                  <span>Read more</span>
                </button>
                <div id="featured-full" class="hidden mt-4 text-left">
                  <div class="prose prose-invert max-w-none mb-6">${fullContent}</div>
                  <button onclick="toggleNewsExcerpt('featured')" class="btn-primary">
                    <span>Close</span>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
          ${image ? `
            <div class="w-full md:w-1/3 flex-shrink-0 order-1 md:order-2">
              <img src="${image}" alt="${featuredPost.title}" class="w-full h-auto rounded-lg shadow-lg object-cover border border-white/10">
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else if (featuredContainer) {
    featuredContainer.innerHTML = '';
  }

  // Render regular posts
  if (postsContainer) {
    if (regularPosts.length === 0 && !featuredPost) {
      postsContainer.innerHTML = '<div class="max-w-4xl mx-auto px-6"><div class="text-center py-12 text-gray-400">No news posts yet. Check back soon!</div></div>';
      return;
    }

    if (regularPosts.length > 0) {
      postsContainer.innerHTML = '<div class="max-w-4xl mx-auto px-6"><div class="grid gap-6">' + regularPosts.map((post, index) => {
        const excerpt = post.excerpt || '';
        const truncated = excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt;
        const fullContent = post.body ? marked.parse(post.body) : excerpt;
        const needsExpand = !!post.body || excerpt.length > 200;
        const image = resolvePath(post.image);

        return `
          <article class="card p-6">
            <div class="flex flex-col md:flex-row gap-6 items-start">
              <div class="flex-1 order-2 md:order-1">
                <span class="text-accent text-xs uppercase">${post.category || 'News'}</span>
                <h3 class="text-xl text-white font-semibold mt-1 mb-2">${post.title}</h3>
                <div class="text-gray-400 text-sm">
                  <div id="news-excerpt-${index}" class="prose prose-invert">${truncated}</div>
                  ${needsExpand ? `
                    <button id="news-btn-readmore-${index}" onclick="toggleNewsExcerpt(${index})" class="btn-primary mt-4 text-sm">
                      <span>Read more</span>
                    </button>
                    <div id="news-full-${index}" class="hidden mt-4 text-left">
                      <div class="prose prose-invert max-w-none mb-4">${fullContent}</div>
                      <button onclick="toggleNewsExcerpt(${index})" class="btn-primary text-sm">
                        <span>Close</span>
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
              ${image ? `
                <div class="w-full md:w-1/4 flex-shrink-0 order-1 md:order-2">
                  <img src="${image}" alt="${post.title}" class="w-full h-32 md:h-24 rounded-lg shadow-md object-cover border border-white/10">
                </div>
              ` : ''}
            </div>
          </article>
        `;
      }).join('') + '</div></div>';
    } else {
      postsContainer.innerHTML = '';
    }
  }
}

// Toggle news excerpt expansion
window.toggleNewsExcerpt = function (index) {
  const excerptEl = document.getElementById(index === 'featured' ? 'featured-excerpt' : `news-excerpt-${index}`);
  const fullEl = document.getElementById(index === 'featured' ? 'featured-full' : `news-full-${index}`);
  const readMoreBtn = document.getElementById(index === 'featured' ? 'featured-btn-readmore' : `news-btn-readmore-${index}`);

  if (fullEl.classList.contains('hidden')) {
    // Expand
    excerptEl.classList.add('hidden');
    readMoreBtn.classList.add('hidden'); // Hide read more button
    fullEl.classList.remove('hidden');
  } else {
    // Collapse
    excerptEl.classList.remove('hidden');
    readMoreBtn.classList.remove('hidden'); // Show read more button
    fullEl.classList.add('hidden');
  }
};

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  renderHomeEvents();
  renderEventsPage();
  renderNewsPosts();
}
