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
      <div class="card p-4 md:p-6">
        <div class="flex flex-row items-center gap-3 md:gap-6">
          
          <!-- Column 1: Date Only -->
          <div class="flex flex-col items-center text-center min-w-[60px] md:min-w-[100px] flex-shrink-0">
            <div class="bg-accent/20 rounded-xl p-2 md:p-3 text-center w-full">
              <p class="text-accent font-bold text-xl md:text-3xl leading-none">${dateInfo.day}</p>
              <p class="text-accent-light text-[10px] md:text-sm uppercase font-semibold">${dateInfo.month} ${dateInfo.year}</p>
            </div>
          </div>

          <!-- Column 2: Title & Location/Time & Description -->
          <div class="flex-1 text-left min-w-0">
            <span class="text-[10px] md:text-xs text-accent uppercase tracking-wider mb-1 block">${event.type || 'Event'}</span>
            <h3 class="text-base md:text-xl text-white font-semibold mb-1 md:mb-2 leading-tight">${event.title}</h3>
            
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-[11px] md:text-sm mb-1.5 md:mb-3">
               <div class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span class="truncate">${event.location}</span>
               </div>
               ${event.time ? `
               <div class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>${event.time}</span>
               </div>` : ''}
            </div>

            ${description ? `<p class="text-gray-400 text-sm hidden md:block max-w-2xl">${description}</p>` : ''}
          </div>

          <!-- Column 3: Ticket Button -->
          <div class="flex-shrink-0">
             ${event.ticketLink ? `<a href="${event.ticketLink}" target="_blank" rel="noopener noreferrer" class="btn-primary text-xs md:text-sm px-3 py-2 md:px-6 md:py-3 whitespace-nowrap">Tickets</a>` : ''}
          </div>

        </div>
      </div>
    `;
  }).join('');
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
