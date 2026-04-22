let allEpisodes = [];
let allShows = [];
const dataCache = {};

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
  const episodeGroup = document.getElementById('episode-filter-group');

  // Initial UI State
  episodeGroup.style.display = 'none';
  countElement.style.display = 'inline-block';

  // load all shows and populate the show dropdown
  allShows = await fetchAllShows();
  populateShowSelector(allShows, showSelector);

  rootElem.innerHTML = `<div class="welcome-container">
      <h2 class="welcome-title">Welcome to the TV Show Explorer</h2>
      <p class="welcome-text">Select <strong>Gallery (All Shows)</strong> 
      or pick one <strong>Show</strong> from the menu above to begin your journey...</p>
      <div class="welcome-icon">📺</div>
    </div> `;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const isGalleryMode =
      document.getElementById('hide-shows').style.display !== 'none';

    if (isGalleryMode) {
      const filteredShows = allShows.filter(
        (show) =>
          show.name.toLowerCase().includes(query) ||
          show.genres.some((g) => g.toLowerCase().includes(query)) ||
          (show.summary && show.summary.toLowerCase().includes(query))
      );
      makePageForShows(filteredShows, rootElem);
      updateCount(filteredShows.length, allShows.length, countElement);
    } else {
      const filteredEpisodes = allEpisodes.filter(
        (episode) =>
          episode.name.toLowerCase().includes(query) ||
          (episode.summary && episode.summary.toLowerCase().includes(query))
      );
      makePageForEpisodes(filteredEpisodes, rootElem);
      updateCount(filteredEpisodes.length, allEpisodes.length, countElement);
    }
  });

  showSelector.addEventListener('change', async (event) => {
    const showId = event.target.value;

    //option Clean State, option to see gallery view or select a single show
    if (showId === '0' || showId === '') {
      if (titleContainer) titleContainer.innerHTML = '';
      rootElem.innerHTML =
        '<p>Select Gallery (All Shows) or One Show to begin...</p>';
      updateCount(0, 0, countElement);
      return;
    }

    //if user select gallery option, show all shows in gallery view
    if (showId === 'gallery') {
      if (titleContainer) titleContainer.innerHTML = '';
      rootElem.innerHTML = "<p class='loading>Loading Gallery view...</p>";

      makePageForShows(allShows, rootElem);
      updateCount(allShows.length, allShows.length, countElement);
      return;
    }

    await loadEpisodesForShow(showId);
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
 *  Data Functions API  & Cache
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
  const currentShow = allShows.find((show) => show.id == showId);
  const showName = currentShow ? currentShow.name : showId;

  if (dataCache[showId]) {
    console.log('%c 📦 Loading: ${showName} from cache...');
    return dataCache[showId];
  }

  try {
    console.log(`%c [API] 🌐 Downloading: ${showName}...`);
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok)
      throw new Error(
        'Network response did not downloaded episodes, please try again'
      );
    const data = await response.json();
    dataCache[showId] = data;
    return data;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
}

/**
 *  Rendering Functions
 */
function makePageForShows(showList, rootElement) {
  const titleContainer = document.getElementById('show-title-container');
  if (titleContainer) titleContainer.innerHTML = ''; 

  if (showList.length === 0) {
    rootElem.innerHTML = '<p>No TV shows found matching your search.</p>';
  }

  rootElement.innerHTML = '';
  showList.forEach((show) => {
    const showCard = document.createElement('section');
    showCard.classList.add('episode-card');

    const img = show.image
      ? show.image.medium
      : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png';
    const genres = show.genres ? show.genres.join(', ') : 'No genres available';

    showCard.innerHTML = `
      <h2 class="clickable-title">${show.name}</h2>
      <img src="${img}" alt="${show.name}" class="clickable-img">

      <div class="show-info">
        <p><strong>Genres:</strong> ${genres}</p>
        <p><strong>Rating:</strong> ⭐ ${show.rating.average || 'N/A'}</p>
        <p><strong>Status:</strong> ${show.status}</p>
        <p><strong>Runtime:</strong> ${show.runtime} mins</p>
      </div>

      <div class="summary">
        <h3>Summary</h3>
        ${show.summary || 'no summary available.'}
      </div>`;

    //added class to make clickable the title and image for each show
    const trigger = () => loadEpisodesForShow(show.id);
    showCard.querySelector('.clickable-title').onclick = trigger;
    showCard.querySelector('.clickable-img').onclick = trigger;
    rootElement.appendChild(showCard);
  });
}

function makePageForEpisodes(episodeList, rootElement) {
  const titleContainer = document.getElementById('show-title-container');
  rootElement.innerHTML = '';

  if (episodeList.length === 0) {
    rootElem.innerHTML = '<p>No episodes found matching your search.</p>';
  }

  const currentShowId = document.getElementById('showSelector').value;
  const currentShow = allShows.find((show) => show.id == currentShowId);


  if (titleContainer) {
    if (currentShow) {
      titleContainer.innerHTML = `<h1> Show ${currentShow.name}</h1>`;
    } else {
      titleContainer.innerHTML = '';
    }
  }

  if (episodeList.length === 0) {
    const noResults = document.createElement('p');
    noResults.innerText = 'No episodes found matching your criteria.';
    rootElement.appendChild(noResults);
    return;
  }

  episodeList.forEach((episode) => {
    const seasonAndEpisode = transformSeasonAndEpisodeNum(episode);
    const episodeCard = document.createElement('section');
    episodeCard.classList.add('episode-card');

    const img = episode.image
      ? episode.image.medium
      : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png';

    episodeCard.innerHTML = `
      <h2>${seasonAndEpisode} - ${episode.name}</h2>
      <img src="${img}" alt="${episode.name}">
      <div class="summary">${episode.summary || 'No summary available.'}</div>
    `;
    rootElement.appendChild(episodeCard);
  });
}

/**
 *  Navigation & UI Helpers
 */
async function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById('content-grid');
  const showGroup = document.getElementById('hide-shows');
  const episodeGroup = document.getElementById('episode-filter-group');
  const countElement = document.getElementById('episodeCount');

  document.getElementById('searchInput').value = '';
  rootElem.innerHTML = "<p class='loading'>Loading episodes...</p>";

  showGroup.style.display = 'none';
  episodeGroup.style.display = 'inline-block';

  document.getElementById('showSelector').value = showId;

  allEpisodes = await fetchEpisodes(showId);

  populateEpisodeSelector(
    allEpisodes,
    document.getElementById('episodeSelector')
  );
  makePageForEpisodes(allEpisodes, rootElem);
  updateCount(allEpisodes.length, allEpisodes.length, countElement);

  renderBackButton();
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
  selectorElement.innerHTML = `
                            <option value="0">Select a show</option>';
                            <option value = "gallery">🖼️ Gallery (All Shows)</option>`;
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


function showDropVisible(status) {
  const showSelector = document.getElementById('showSelector');
  showSelector.style.display = status ? 'block' : 'none';
}

function episodeDropVisible(status) {
  const episodeSelector = document.getElementById('episodeSelector');
  episodeSelector.style.display = status ? 'block' : 'none';
}

window.onload = setup;
