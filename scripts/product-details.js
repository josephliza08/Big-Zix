(() => {
  const cards = [...document.querySelectorAll(".items li")];
  const dialog = document.querySelector("#product-dialog");
  const favoriteButton = document.querySelector("#product-favorite");
  const filter = document.querySelector("#favorites-filter");
  let opener;

  function requestLogin(reason) {
    if (dialog.open) {
      dialog.addEventListener(
        "close",
        () => window.BigZixAccount.open(reason),
        { once: true },
      );
      dialog.close();
    } else {
      window.BigZixAccount.open(reason);
    }
  }

  function showDetails(card, button) {
    opener = button;
    const selectedName = card.querySelector("h4").textContent;
    document.querySelector("#product-title").textContent = selectedName;
    document.querySelector("#product-price").textContent =
      card.querySelector("p").textContent;
    document.querySelector("#product-category").textContent = card
      .closest("[data-section]")
      .querySelector("h3").textContent;
    document.querySelector("#product-photo").src =
      card.querySelector("img").src;
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
    favorite.textContent = "\u2661";
    favorite.setAttribute(
      "aria-label",
      "Log in to save " +
        card.querySelector("h4").textContent +
        " to favorites",
    );
    favorite.setAttribute("aria-haspopup", "dialog");
    favorite.addEventListener("click", () => requestLogin("favorites"));
    controls.append(details, favorite);
    card.querySelector(".item-details").append(controls);
  }

  favoriteButton.addEventListener("click", () => requestLogin("favorites"));
  document
    .querySelector("#product-order")
    .addEventListener("click", () => requestLogin("order"));
  dialog.addEventListener("close", () => opener?.focus());
  filter.setAttribute("aria-haspopup", "dialog");
  filter.removeAttribute("aria-pressed");
  filter.textContent = "My favorites";
  filter.addEventListener("click", () => requestLogin("favorites"));
})();
