(() => {
  const storageKey = "big-zix.favorites";
  const cards = [...document.querySelectorAll(".items li")];
  const names = new Set(
    cards.map((card) => card.querySelector("h4").textContent),
  );
  const dialog = document.querySelector("#product-dialog");
  const favoriteButton = document.querySelector("#product-favorite");
  const filter = document.querySelector("#favorites-filter");
  const feedback = document.querySelector("#menu-feedback");
  let favorites = new Set();
  let selectedName = "";
  let opener;

  function readFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return new Set(
        Array.isArray(saved) ? saved.filter((name) => names.has(name)) : [],
      );
    } catch {
      return new Set();
    }
  }

  function updateFavorites() {
    for (const card of cards) {
      const name = card.querySelector("h4").textContent;
      const saved = favorites.has(name);
      card.dataset.favorite = String(saved);
      const button = card.querySelector(".favorite-toggle");
      button.textContent = saved ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute(
        "aria-label",
        (saved ? "Remove " : "Save ") + name + " favorite",
      );
    }
    favoriteButton.textContent = favorites.has(selectedName)
      ? "Remove favorite"
      : "Save favorite";
    favoriteButton.setAttribute(
      "aria-pressed",
      String(favorites.has(selectedName)),
    );
    filter.textContent = "My favorites (" + favorites.size + ")";
    document.dispatchEvent(new Event("favoriteschange"));
  }

  function toggleFavorite(name) {
    if (favorites.has(name)) favorites.delete(name);
    else favorites.add(name);
    let message = favorites.has(name)
      ? name + " saved to favorites."
      : name + " removed from favorites.";
    try {
      localStorage.setItem(storageKey, JSON.stringify([...favorites]));
    } catch {
      message += " Saved for this visit only.";
    }
    updateFavorites();
    feedback.textContent = message;
  }

  function showDetails(card, button) {
    opener = button;
    selectedName = card.querySelector("h4").textContent;
    document.querySelector("#product-title").textContent = selectedName;
    document.querySelector("#product-price").textContent =
      card.querySelector("p").textContent;
    document.querySelector("#product-category").textContent = card
      .closest("[data-section]")
      .querySelector("h3").textContent;
    document.querySelector("#product-photo").src =
      card.querySelector("img").src;
    favoriteButton.textContent = favorites.has(selectedName)
      ? "Remove favorite"
      : "Save favorite";
    favoriteButton.setAttribute(
      "aria-pressed",
      String(favorites.has(selectedName)),
    );
    dialog.showModal();
  }

  for (const card of cards) {
    const controls = document.createElement("div");
    controls.className = "product-tools";
    const details = document.createElement("button");
    details.type = "button";
    details.textContent = "View details";
    details.setAttribute("aria-haspopup", "dialog");
    details.setAttribute(
      "aria-label",
      "View details for " + card.querySelector("h4").textContent,
    );
    details.addEventListener("click", () => showDetails(card, details));
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "favorite-toggle";
    favorite.addEventListener("click", () =>
      toggleFavorite(card.querySelector("h4").textContent),
    );
    controls.append(details, favorite);
    card.querySelector(".item-details").append(controls);
  }

  favoriteButton.addEventListener("click", () => toggleFavorite(selectedName));
  document.querySelector("#product-order").addEventListener("click", () => {
    dialog.close();
    window.BigZixAccount.open();
  });
  dialog.addEventListener("close", () => {
    if (opener?.closest("li")?.hidden) filter.focus();
    else opener?.focus();
  });
  filter.addEventListener("click", () => {
    filter.setAttribute(
      "aria-pressed",
      String(filter.getAttribute("aria-pressed") !== "true"),
    );
    document.dispatchEvent(new Event("favoriteschange"));
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    favorites = readFavorites();
    updateFavorites();
  });
  favorites = readFavorites();
  updateFavorites();
})();
