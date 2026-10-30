const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsCount = document.getElementById("results-count");
const searchStatus = document.getElementById("search-status");
const results = document.getElementById("results-container");

let activeSearch = 0;

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  const searchId = ++activeSearch;
  results.innerHTML = "";
  resultsCount.textContent = `Searching for ${query}...`;
  searchStatus.textContent = "";

  const url =
    "https://commons.wikimedia.org/w/api.php" +
    `?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=480" +
    "&format=json&origin=*";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The image search request failed (${response.status}).`);
    }

    const data = await response.json();
    if (searchId !== activeSearch) {
      return;
    }

    const pages = data.query && data.query.pages
      ? Object.values(data.query.pages)
      : [];
    let imageCount = 0;

    for (const page of pages) {
      const imageInfo = page.imageinfo && page.imageinfo[0];
      const imageUrl = imageInfo && (imageInfo.thumburl || imageInfo.url);
      if (typeof imageUrl !== "string" || !imageUrl) {
        continue;
      }

      const card = document.createElement("article");
      card.className = "result-card";

      const image = document.createElement("img");
      image.className = "result-card__image";
      image.src = imageUrl;
      image.alt = page.title || "Wikimedia Commons image";
      image.loading = "lazy";
      image.decoding = "async";

      const caption = document.createElement("p");
      caption.className = "result-card__caption";
      caption.textContent = page.title || "Untitled image";

      card.appendChild(image);
      card.appendChild(caption);
      results.appendChild(card);
      imageCount += 1;
    }

    resultsCount.textContent = `Showing ${imageCount} ${
      imageCount === 1 ? "result" : "results"
    } for ${query}`;
    if (imageCount === 0) {
      searchStatus.textContent = "No images with available previews were found.";
    }
  } catch (error) {
    if (searchId !== activeSearch) {
      return;
    }

    resultsCount.textContent = `Could not show results for ${query}.`;
    searchStatus.textContent = error instanceof Error
      ? error.message
      : "An unexpected error occurred while searching.";
  }
});
