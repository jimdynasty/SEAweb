// CMS Content Loader - Client-side markdown parsing
// Fetches markdown files directly, no build step needed!

// Parse markdown frontmatter
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = {};
  const frontmatterText = match[1];

  let currentKey = null;
  let currentValue = [];

  frontmatterText.split('\n').forEach(line => {
    if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/) && !line.startsWith(' ')) {
      if (currentKey) {
        let value = currentValue.join(' ').trim();
        value = value.replace(/^["']|["']$/g, '');
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        frontmatter[currentKey] = value;
      }

      const colonIndex = line.indexOf(':');
      currentKey = line.substring(0, colonIndex).trim();
      const firstValue = line.substring(colonIndex + 1).trim();
      currentValue = firstValue ? [firstValue] : [];
    } else if (currentKey && line.trim() && line.startsWith('  ')) {
      currentValue.push(line.trim());
    }
  });

  if (currentKey) {
    let value = currentValue.join(' ').trim();
    value = value.replace(/^["']|["']$/g, '');
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    frontmatter[currentKey] = value;
  }

  frontmatter.content = match[2].trim();
  return frontmatter;
}

// Fetch list of markdown files from a directory
async function fetchMarkdownFiles(folder) {
  try {
    // Fetch the directory listing from GitHub  
    const response = await fetch(`https://api.github.com/repos/jimdynasty/SEAweb/contents/content/${folder}`);
    if (!response.ok) return [];

    const files = await response.json();
    const markdownFiles = files.filter(f => f.name.endsWith('.md'));

    // Fetch and parse each markdown file
    const results = [];
    for (const file of markdownFiles) {
      try {
        const contentResponse = await fetch(file.download_url);
        if (contentResponse.ok) {
          const text = await contentResponse.text();
          const parsed = parseFrontmatter(text);
          if (parsed) results.push(parsed);
        }
      } catch (error) {
        console.error(`Error loading ${file.name}:`, error);
      }
    }
    return results;
  } catch (error) {
    console.error(`Error fetching ${folder}:`, error);
    return [];
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

// Load events
async function loadEvents() {
  const events = await fetchMarkdownFiles('events');
  const now = new Date();
  return events
    .filter(event => !event.past && new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Load news
async function loadNews() {
  const posts = await fetchMarkdownFiles('news');
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    const truncated = description.length > 200 ? description.substring(0, 200) + '...' : description;
    const needsExpand = description.length > 200;

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
              <p id="desc-${index}" class="event-description">${truncated}</p>
              ${needsExpand ? `
                <button onclick="toggleDescription(${index})" class="text-accent text-sm hover:text-accent-light transition mt-2">
                  <span id="btn-${index}">Read more →</span>
                </button>
                <div id="full-desc-${index}" class="hidden">${description}</div>
              ` : ''}
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
    const needsExpand = excerpt.length > 150;

    featuredContainer.innerHTML = `
      <div class="card p-8 border-accent/30">
        <span class="bestseller-badge inline-block mb-4">Featured</span>
        <h2 class="font-display text-3xl text-white mt-2 mb-4">${featuredPost.title}</h2>
        <div class="text-gray-400 mb-6">
          <p id="featured-excerpt" class="news-excerpt">${truncated}</p>
          ${needsExpand ? `
            <button onclick="toggleNewsExcerpt('featured')" class="text-accent text-sm hover:text-accent-light transition mt-2">
              <span id="featured-btn">Read more →</span>
            </button>
            <div id="featured-full" class="hidden">${excerpt}</div>
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
        const needsExpand = excerpt.length > 200;

        return `
          <article class="card p-6">
            <span class="text-accent text-xs uppercase">${post.category || 'News'}</span>
            <h3 class="text-xl text-white font-semibold mt-1 mb-2">${post.title}</h3>
            <div class="text-gray-400 text-sm">
              <p id="news-excerpt-${index}">${truncated}</p>
              ${needsExpand ? `
                <button onclick="toggleNewsExcerpt(${index})" class="text-accent text-sm hover:text-accent-light transition mt-2">
                  <span id="news-btn-${index}">Read more →</span>
                </button>
                <div id="news-full-${index}" class="hidden">${excerpt}</div>
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
  const truncatedEl = document.getElementById(index === 'featured' ? 'featured-excerpt' : `news-excerpt-${index}`);
  const fullEl = document.getElementById(index === 'featured' ? 'featured-full' : `news-full-${index}`);
  const btnEl = document.getElementById(index === 'featured' ? 'featured-btn' : `news-btn-${index}`);

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
