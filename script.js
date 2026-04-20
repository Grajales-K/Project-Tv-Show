let allEpisodes = [];

/**
 * 1. orchestration
 * Fetches all shows first and initializes the show dropdown.
 */
async function setup() {
  // Capture DOM Elements
  const rootElem = document.getElementById('content-grid');
  const searchInput = document.getElementById('searchInput');
  const episodeSelector = document.getElementById('episodeSelector');
  const countElement = document.getElementById('episodeCount');
  const showSelector = document.getElementById('showSelector');

  // load all shows and populate the show dropdown
  const allShows = await fetchAllShows();
  populateShowSelector(allShows, showSelector);
  rootElem.innerHTML = '<p>Select All Shows or One Show to begin...</p>';

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(query) ||
        (allEpisode.summary && allEpisode.summary.toLowerCase().includes(query))
    );
    makePageForEpisodes(filtered, rootElem);
    updateCount(filtered.length, allEpisodes.length, countElement);
  });

  showSelector.addEventListener('change', async (event) => {
    const showId = event.target.value;

    if (showId === '0') {
      rootElem.innerHTML = '<p>Select a show to begin...</p>';
      return;
    }

    rootElem.innerHTML = "<p class='loading'>Loading episodes...</p>";
    searchInput.value = ''; // Clear search input on show change

    allEpisodes = await fetchEpisodes(showId);

    populateEpisodeSelector(allEpisodes, episodeSelector);
    makePageForEpisodes(allEpisodes, rootElem);
    updateCount(allEpisodes.length, allEpisodes.length, countElement);
  });

  episodeSelector.addEventListener('change', (event) => {
    const selectedId = parseInt(event.target.value);

    if (selectedId === 0) {
      makePageForEpisodes(allEpisodes, rootElem);
      updateCount(allEpisodes.length, allEpisodes.length, countElement);
    } else {
      const single = allEpisodes.filter((episode) => episode.id === selectedId);
      makePageForEpisodes(single, rootElem);
      updateCount(1, allEpisodes.length, countElement);
    }
  });
}

/**
 *  Data Functions (API)
 */

async function fetchAllShows() {
  try {
    const response = await fetch('https://api.tvmaze.com/shows');
    if (!response.ok)
      throw new Error('Network response was not ok, please try again');
    return await response.json();
  } catch (error) {
    console.error('error fetching shows:', error);
    return [];
  }
}

async function fetchEpisodes(showId) {
  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok)
      throw new Error(
        'Network response did not downloaded episodes, please try again'
      );
    return await response.json();
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
}

/**
 *  Rendering Functions
 */
function makePageForShows(showList, rootElement) {
  rootElement.innerHTML = '';

  showList.forEach((show) => {
    const showCard = document.createElement('section');
    showCard.classList.add('show-card');

    const img = show.image
      ? show.image.medium
      : 'https://via.placeholder.com/210x295?text=No+Image';
    const genres = show.genres ? show.genres.join(', ') : 'No genres available';

    showCard.innerHTML = `
      <h2>${show.name}</h2>
      <img src="${img}" alt="${show.name}"> 

      <div class="show-info">  
        <strong>${genres}</strong> | ⭐ ${show.rating.average || 'N/A'}
      </div>

      <div class="summary">
      ${show.summary || 'no summary avaliable.'}  
      </div>

      <div class="show-footer">
        <span> Status: ${show.status}</span> | <span>${show.runtime}</span>
      </div> `;
    rootElement.appendChild(showCard);
  });
}

function makePageForEpisodes(episodeList, rootElement) {
  rootElement.innerHTML = '';

  if (episodeList.length === 0) {
    rootElem.innerHTML = '<p>No episodes found matching your criteria.</p>';
  }

  episodeList.forEach((episode) => {
    const seasonAndEpisode = transformSeasonAndEpisodeNum(episode);
    const episodeCard = document.createElement('section');
    episodeCard.classList.add('episode-card');

    const img = episode.image
      ? episode.image.medium
      : 'https://via.placeholder.com/210x295?text=No+Image';

    episodeCard.innerHTML = `
      <h2>${seasonAndEpisode} - ${episode.name}</h2>
      <img src="${img}" alt="${episode.name}">
      <div class="summary">${episode.summary || 'No summary available.'}</div>
    `;
    rootElement.appendChild(episodeCard);
  });
}

/**
 *  COUNT FEATURE
 */
function updateCount(displayed, total, countElement) {
  if (countElement) {
    countElement.textContent = `Showing: ${displayed} / ${total} episode(s)`;
  }
}

function populateShowSelector(shows, selectorElement) {
  selectorElement.innerHTML = '<option value="0">Select a show</option>';
  shows.sort((a, b) => a.name.localeCompare(b.name));

  shows.forEach((show) => {
    const option = new Option(show.name, show.id);
    selectorElement.add(option);
  });
}

function populateEpisodeSelector(episodes, selectorElement) {
  selectorElement.innerHTML = '<option value="0">All Episodes</option>';

  episodes.forEach((episode) => {
    const label = `${transformSeasonAndEpisodeNum(episode)} - ${episode.name}`;
    selectorElement.add(new Option(label, episode.id));
  });
}

function transformSeasonAndEpisodeNum(episode) {
  const paddedSeason = episode.season.toString().padStart(2, '0');
  const paddedEpisode = episode.number.toString().padStart(2, '0');
  return `S${paddedSeason}E${paddedEpisode}`;
}

window.onload = setup;
