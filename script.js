//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

}

function transformSeasonAndEpisodeNum(episode) {
  const { season, number } = episode;

  const paddedSeason = season.toString().padStart(2, '0');
  const paddedEpisode = number.toString().padStart(2, '0');

  return `S${paddedSeason}E${paddedEpisode}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
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
