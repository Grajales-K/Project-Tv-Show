let allEpisodes [];

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
    const filtered = allEpisodes.filter(episode => episode.name.toLowerCase().includes(query) ||
      (allEpisodes.summary && allEpisodes.summary.toLowerCase().includes(query))
    )
    makePageForEpisodes(filtered, rootElem);
    updateCount(filtered.length, allEpisodes.length, countElement);
  })
  
  showSelector.addEventListener('change', async (event) => {
    const showId = e.target.value;
    if (showId === '0') {
      rootElem.innerHTML = '<p>Select a show to begin...</p>';
      return;
    }

    rootElem.innerHTML = "<p>Loading episodes...</p>";
    searchInput.value = ""; // Clear search input on show change


    allEpisodes = await fetchEpisodes(showId);

    populateEpisodeSelector(allEpisodes, episodeSelector);
    makePageForEpisodes(allEpisodes, rootElem);
    updateCount(allEpisodes.length, allEpisodes.length, countElement);
  });

  episodeSelector.addEventListener('change', (event) => {
    const selectedId = parseInt(event.target.value);

    if(selectedId === 0) {
      makePageForEpisodes(allEpisodes, rootElem);
      updateCount(allEpisodes.length, allEpisodes.length, countElement);
    }else {
      const single = allEpisodes.filter((episode) => episode.id === selectedId);
      makePageForEpisodes(single, rootElem);  
      updateCount(1, allEpisodes.length, countElement);
    }
  });
}

/**
 *  Data Functions (API)
 */

async function fetchAllShows(){
  try{
    const response = await fetch('https://api.tvmaze.com/shows');
    if(!response.ok) throw new Error("Network response was not ok, please try again");
    return await response.json(); 
  }catch(error){
    console.error('error fetching shows:', error);
    return [];
  }
}

async function fetchEpisodes(showId){
  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error("Network response did not downloaded episodes, please try again");
    return await response.json();
  }catch(error) {
    console.error('Error fetching episodes:', error);
    return []; 
  }
  
}


/**
 *  Rendering Functions
 */
function makePageForEpisodes(episodeList, rootElement){
  rootElement.innerHTML = '';
  if(episodeList.length === 0) {
    rootElem.innerHTML = '<p>No episodes found matching your criteria.</p>';
  }
  episodeList.forEach((episode) =>  {
    const seasonAndEpisode = transformSeasonAndEpisodeNum(episode);
    const episodeCard = document.createElement('section');
    episodeCard.classList.add('episode-card');
    
    const img = episode.image ? episode.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'; 

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
  if(countElement) {
    countElement.textContent = `Showing: ${displayed} / ${total} episode(s)`;
  }
}

function populateShowSelector(shows, selectorElement){
  selectorElement.innerHTML = '<option value="0">Select a show</option>';
  shows.sort((a, b) => a.name.localeCompare(b.name));

  shows.forEach((show) => {
    const option = new Option(show.name, show.id);
    selectorElement.add(option);

  });
}




/**
 * 2. SEARCH FEATURE
 * Handles filtering when the user types in the search box.
 */
function setupSearchFeature(allEpisodes, searchInput, countElement, rootElem) {
  if (!searchInput) return;
  //update displaying numbers
  searchInput.oninput = (event) => {
    const searchString = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const summary = episode.summary || '';
      const name = episode.name || '';

      return (
        summary.toLowerCase().includes(searchString) ||
        name.toLowerCase().includes(searchString)
      );
    });

    // Update numbers and cards
    updateCount(filteredEpisodes.length, allEpisodes.length, countElement);
    makePageForEpisodes(filteredEpisodes, rootElem);
  };
}

/**
 * 3. SELECTOR FEATURE
 * Handles showing a single episode from the dropdown menu.
 */
function setupSelectorFeature(
  allEpisodes,
  episodeSelector,
  searchInput,
  countElement,
  rootElem
) {
  if (!episodeSelector) return;

  // Fill the dropdown options
  populateEpisodeSelector(allEpisodes, episodeSelector);
  //replaced eventlistener as it is causing an error
  episodeSelector.onchange = (event) => {
    const selectedId = parseInt(event.target.value, 10);

    // Reset search bar and counter when using the dropdown
    if (searchInput) searchInput.value = '';

    if (selectedId > 0) {
      const selectedEpisode = allEpisodes.find((ep) => ep.id === selectedId);
      // prevent undefined
      if (!selectedEpisode) {
        makePageForEpisodes(allEpisodes, rootElem);
        updateCount(allEpisodes.length, allEpisodes.length, countElement);
        return;
      }

      makePageForEpisodes([selectedEpisode], rootElem);
      updateCount(1, allEpisodes.length, countElement);
    } else {
      makePageForEpisodes(allEpisodes, rootElem);
      updateCount(allEpisodes.length, allEpisodes.length, countElement);
    }
  };
}


// Populates the <select> element with options
function populateEpisodeSelector(episodes, selectorElement) {
  // Clear any existing options (except the first one)
  selectorElement.innerHTML = '<option value="0">All Episodes</option>';

  episodes.forEach((episode) => {
    const option = document.createElement('option');
    option.value = episode.id;
    option.textContent = `${transformSeasonAndEpisodeNum(episode)} - ${
      episode.name
    }`;
    selectorElement.appendChild(option);
  });
}

// Formats numbers to S01E01
function transformSeasonAndEpisodeNum(episode) {
  const paddedSeason = episode.season.toString().padStart(2, '0');
  const paddedEpisode = episode.number.toString().padStart(2, '0');
  return `S${paddedSeason}E${paddedEpisode}`;
}

// load Episodes for Show by ANGELA
async function loadEpisodesForShow(
  showId,
  rootElem,
  searchInput,
  episodeSelector,
  countElement
) {
  rootElem.innerHTML = "<p class='loading'>Loading episodes...</p>";

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    const allEpisodes = await response.json();

    makePageForEpisodes(allEpisodes, rootElem);
    updateCount(allEpisodes.length, allEpisodes.length, countElement);
    // Clear old listeners
    searchInput.oninput = null;
    episodeSelector.onchange = null;
    //refresh
    setupSearchFeature(allEpisodes, searchInput, countElement, rootElem);
    setupSelectorFeature(
      allEpisodes,
      episodeSelector,
      searchInput,
      countElement,
      rootElem
    );
  } catch (error) {
    console.error('Error fetching episodes:', error);
    rootElem.innerHTML = '<p>Failed load episodes. Please try again.</p>';
  }
}

window.onload = setup;






