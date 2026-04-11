//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  //add feature/search
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (event) => {
    const searchString = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.summary.toLowerCase().includes(searchString) ||
        episode.name.toLowerCase().includes(searchString)
      );
    });
    makePageForEpisodes(filteredEpisodes);
  });
}

function transformSeasonAndEpisodeNum(episode) {
  const { season, number } = episode;

  const paddedSeason = season.toString().padStart(2, '0');
  const paddedEpisode = number.toString().padStart(2, '0');

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
    rootElem.appendChild(image)

    const summaryText = document.createElement("p");
    summaryText.innerHTML = episodes.summary;
    rootElem.appendChild(summaryText);
  })
}

window.onload = setup;
