/**
 * 1. MAIN SETUP
 * Fetches all shows first and initializes the show dropdown.
 */
async function setup() {
  const url = "https://api.tvmaze.com/shows/82/episodes";

  // Capture DOM Elements
  const rootElem = document.getElementById("content-grid");
  const searchInput = document.getElementById("searchInput");
  const episodeSelector = document.getElementById("episodeSelector");
  const countElement = document.getElementById("episodeCount");
  const allShows = await fetchAllShows();
  // console.log("fetched shows", allShows);
  // rootElem.innerHTML = "<p>cShows loaded?</p>";
  const showSelector = document.getElementById("showSelector");
  // Clear any leftover handlers from previous runs by ANGELA
  searchInput.oninput = null;
  episodeSelector.onchange = null;
  if (!rootElem) return;

  rootElem.innerHTML =
    "<p class='loading'>Loading episodes, please wait...</p>";

  try {
    //fetch data from the API
    const response = await fetch(url);

    // Convert the response to JSON (a format JS understands)
    const allEpisodes = await response.json();
    //by ANGELA remove for now to fix the double render
    // Initial render and features
    // makePageForEpisodes(allEpisodes, rootElem);
    // updateCount(allEpisodes.length, allEpisodes.length, countElement);

    // We pass the data to these functions so they work locally
    setupSearchFeature(allEpisodes, searchInput, countElement, rootElem);
    setupSelectorFeature(
      allEpisodes,
      episodeSelector,
      searchInput,
      countElement,
      rootElem,
    );
    populateShowSelector(allShows, showSelector);
    setupShowSelector(
      showSelector,
      rootElem,
      searchInput,
      episodeSelector,
      countElement,
    );

    rootElem.innerHTML = "<p>Select a show to begin</p>";
  } catch (error) {
    rootElem.innerHTML =
      "<p>Error loading episodes. Please try again later.</p>";
    // If something goes wrong (no internet, server down), we show an error
    console.error("Error fetching episodes:", error);
  }
}

function setupShowSelector(
  showSelector,
  rootElem,
  searchInput,
  episodeSelector,
  countElement,
) {
  showSelector.addEventListener("change", (event) => {
    const showId = parseInt(event.target.value, 10);

    if (!showId) return;

    loadEpisodesForShow(
      showId,
      rootElem,
      searchInput,
      episodeSelector,
      countElement,
    );
  });
}

//fetch all shows by ANGELA
async function fetchAllShows() {
  const url = "https://api.tvmaze.com/shows";

  try {
    const response = await fetch(url);
    const allShows = await response.json();
    return allShows;
  } catch (error) {
    console.error("Error fetching shows:", error);
    return [];
  }
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
      const summary = episode.summary || "";
      const name = episode.name || "";

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
  rootElem,
) {
  if (!episodeSelector) return;

  // Fill the dropdown options
  populateEpisodeSelector(allEpisodes, episodeSelector);
  //replaced eventlistener as it is causing an error
  episodeSelector.onchange = (event) => {
    const selectedId = parseInt(event.target.value, 10);

    // Reset search bar and counter when using the dropdown
    if (searchInput) searchInput.value = "";

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

/**
 * 4. RENDERING
 * Responsible for creating the HTML "cards" for the episodes.
 */
function makePageForEpisodes(episodeList, rootElem) {
  rootElem.innerHTML = ""; // Clear current episodes

  episodeList.forEach((episode) => {
    const seasonAndEpisode = transformSeasonAndEpisodeNum(episode);
    const titleText = `${seasonAndEpisode} - ${episode.name}`;

    const episodeCard = document.createElement("section");
    episodeCard.className = "episode-card";

    episodeCard.innerHTML = `
      <h2>${titleText}</h2>
      <img src="${episode.image ? episode.image.medium : ""}" alt="${episode.name}">
      ${episode.summary}
    `;

    rootElem.appendChild(episodeCard);
  });
}

/**
 * 5. HELPERS
 * Small utility functions to keep the main logic readable.
 */

// Updates the "Showing X/Y" text
function updateCount(displayed, total, countElement) {
  if (countElement) {
    countElement.textContent = `Showing: ${displayed} / ${total} episode(s)`;
  }
}
//Populate the <select> shows with options by ANGELA
function populateShowSelector(shows, selectorElement) {
  selectorElement.innerHTML = '<option value="0">Select a show</option>';

  // sort a-z
  shows.sort((a, b) => a.name.localeCompare(b.name));

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selectorElement.appendChild(option);
  });
}

// Populates the <select> element with options
function populateEpisodeSelector(episodes, selectorElement) {
  // Clear any existing options (except the first one)
  selectorElement.innerHTML = '<option value="0">All Episodes</option>';

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${transformSeasonAndEpisodeNum(episode)} - ${episode.name}`;
    selectorElement.appendChild(option);
  });
}

// Formats numbers to S01E01
function transformSeasonAndEpisodeNum(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedEpisode = episode.number.toString().padStart(2, "0");
  return `S${paddedSeason}E${paddedEpisode}`;
}

// load Episodes for Show by ANGELA
async function loadEpisodesForShow(
  showId,
  rootElem,
  searchInput,
  episodeSelector,
  countElement,
) {
  rootElem.innerHTML = "<p class='loading'>Loading episodes...</p>";

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    const allEpisodes = await response.json();

    makePageForEpisodes(allEpisodes, rootElem);
    updateCount(allEpisodes.length, allEpisodes.length, countElement);
    // reset episode drop down by Angela
    // episodeSelector.innerHTML = '<option value="0">All Episodes</option>';
    // Clear old listeners
    searchInput.oninput = null;
    episodeSelector.onchange = null;

    setupSearchFeature(allEpisodes, searchInput, countElement, rootElem);
    setupSelectorFeature(
      allEpisodes,
      episodeSelector,
      searchInput,
      countElement,
      rootElem,
    );
  } catch (error) {
    console.error("Error fetching episodes:", error);
    rootElem.innerHTML = "<p>Could not load episodes. Please try again.</p>";
  }
}

window.onload = setup;
