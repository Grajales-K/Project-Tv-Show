//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
   episodeList.forEach((episodes) => {
    const paragraph = document.createElement("h2");
    paragraph.textContent = ` ${episodes.name} S0${episodes.season}E0${episodes.number}`
    rootElem.appendChild(paragraph);

    const image = document.createElement("img");
    image.src = episodes.image.medium;
    rootElem.appendChild(image)

    const summaryText = document.createElement("p");
    summaryText.textContent = episodes.summary;
    rootElem.appendChild(summaryText);
  })
}

window.onload = setup;
