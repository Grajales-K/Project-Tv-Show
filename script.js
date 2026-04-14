//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  // -----ADD FEATURE/SEARCH by ANGELA
  //get the search input field from the HTML page
  const searchInput = document.getElementById("searchInput");
  // listen for typing inside the search box
  searchInput.addEventListener("input", (event) => {
    //take what the user inputs and convert it to lowercase so it can take any case type inputted
    const searchString = event.target.value.toLowerCase();
    //filter through the full list of episodes based on the search
    const filteredEpisodes = allEpisodes.filter((episode) => {
      //check search against the episode name /the episode summary.
      return (
        //return the results
        episode.summary.toLowerCase().includes(searchString) ||
        episode.name.toLowerCase().includes(searchString)
      );
    });
    // get the element for episode count from HTML
    const countElement = document.getElementById("episodeCount");
   if (searchString.length > 0) {
          // change the text in that element and show how many episodes matched the search against the total number of episodes
    countElement.textContent = `Showing: ${filteredEpisodes.length} / ${allEpisodes.length} episode(s)`;
  } else {
    
    countElement.textContent = "";
  }
    makePageForEpisodes(filteredEpisodes);
  });

  // -----ADD EPISODE SELECTOR by ANGELA-----//
  // get the dropdown menu from the HTML page
  const episodeSelector = document.getElementById("episodeSelector");
  // fill the dropdown with all episodes
  populateEpisodeSelector(allEpisodes, episodeSelector);
  // when the user changes the selected episode
  episodeSelector.addEventListener("change", function (event) {
    // get the value from the dropdown
    const selectedValue = event.target.value;
    // turn the string into a number
    const selectedId = parseInt(selectedValue, 10);
    //clear search input
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input")); 
    // only continue if the user picked something
    if (selectedId > 0) {
      // search for the episode
      let selectedEpisode = null;
      // iterate through all episodes so we can process/display each one
      for (let i = 0; i < allEpisodes.length; i++) {
        const episode = allEpisodes[i];
        // If the episode's id matches the selected id, we found it stoop searching
        if (episode.id === selectedId) {
          selectedEpisode = episode;
          break;
        }
      }
      makePageForEpisodes([selectedEpisode]);
    } else {
      // If the user picked "Show all episodes"
      makePageForEpisodes(allEpisodes);
    }
  });
}

// -----ADD EPISODE SELECTOR DROP DOWN MENU by ANGELA-----//
function populateEpisodeSelector(episodes, selectorElement) {
  // Loop through each episode in the list
  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    // Create a new <option> element
    const option = document.createElement("option");
    // Set the value of the option (what gets submitted)
    option.value = episode.id;
    // Set the text that the user will see
    const label = transformSeasonAndEpisodeNum(episode) + " - " + episode.name;
    option.textContent = label;
    // Add the option to the dropdown menu
    selectorElement.appendChild(option);
  }
}

function transformSeasonAndEpisodeNum(episode) {
  const { season, number } = episode;

  const paddedSeason = season.toString().padStart(2, "0");
  const paddedEpisode = number.toString().padStart(2, "0");

  return `S${paddedSeason}E${paddedEpisode}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  episodeList.forEach((episodes) => {
    const titleEpisodes = document.createElement("h2");
    titleEpisodes.textContent = `${transformSeasonAndEpisodeNum(episodes)}: ${
      episodes.name
    }`;
    rootElem.appendChild(titleEpisodes);

    const image = document.createElement("img");
    image.src = episodes.image.medium;
    rootElem.appendChild(image);

    const summaryText = document.createElement("p");
    summaryText.innerHTML = episodes.summary;
    rootElem.appendChild(summaryText);
  });
}

window.onload = setup;
