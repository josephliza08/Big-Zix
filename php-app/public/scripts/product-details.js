(() => {
  const cards = [...document.querySelectorAll(".items li")];
  const dialog = document.querySelector("#product-dialog");
  const favoriteButton = document.querySelector("#product-favorite");
  const filter = document.querySelector("#favorites-filter");
  let opener;
  let selected;
  let loaded = !BigZixAPI.user;
  const saved = new Set();
  const pending = new Set();
  const feedback = document.querySelector("#menu-feedback");
  const saveStatus = document.createElement("p");
  saveStatus.setAttribute("role", "status");
  dialog.append(saveStatus);

  function paint() {
    for (const card of cards) {
      const id = Number(card.dataset.productId);
      const active = saved.has(id);
      card.dataset.favorite = String(active);
      const button = card.querySelector(".favorite-toggle");
      button.textContent = active ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute(
        "aria-label",
        (active ? "Remove favorite: " : "Save favorite: ") +
          card.querySelector("h4").textContent,
      );
      button.disabled = !loaded || pending.has(id);
    }
    if (selected) {
      const id = Number(selected.dataset.productId);
      favoriteButton.textContent = saved.has(id)
        ? "Remove favorite"
        : "Save favorite";
      favoriteButton.setAttribute("aria-pressed", String(saved.has(id)));
      favoriteButton.disabled = !loaded || pending.has(id);
    }
    document.dispatchEvent(new Event("favoriteschange"));
  }

  async function toggle(card) {
    if (!BigZixAPI.user) return requestLogin("favorites");
    const id = Number(card.dataset.productId);
    if (!loaded || pending.has(id)) return;
    pending.add(id);
    paint();
    try {
      const result = await BigZixAPI.request("favorite", {
        product_id: id,
        saved: !saved.has(id),
      });
      if (result.saved) saved.add(id);
      else saved.delete(id);
      feedback.textContent = result.saved
        ? "Saved to your favorites."
        : "Removed from your favorites.";
      saveStatus.textContent = feedback.textContent;
    } catch (error) {
      feedback.textContent = saveStatus.textContent = error.message;
    } finally {
      pending.delete(id);
      paint();
    }
  }

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
    selected = card;
    saveStatus.textContent = "";
    paint();
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
    favorite.addEventListener("click", () => toggle(card));
    controls.append(details, favorite);
    card.querySelector(".item-details").append(controls);
  }

  favoriteButton.removeAttribute("aria-haspopup");
  favoriteButton.addEventListener("click", () => toggle(selected));
  document.querySelector("#product-order").addEventListener("click", () => {
    if (!BigZixAPI.user) return requestLogin("order");
    BigZixCart.add(selected.querySelector("h4").textContent);
    dialog.close();
    feedback.textContent = "Added to your cart.";
  });
  dialog.addEventListener("close", () => opener?.focus());
  filter.removeAttribute("aria-haspopup");
  filter.setAttribute("aria-pressed", "false");
  filter.textContent = "My favorites";
  filter.addEventListener("click", () => {
    if (!BigZixAPI.user) return requestLogin("favorites");
    filter.setAttribute(
      "aria-pressed",
      String(filter.getAttribute("aria-pressed") !== "true"),
    );
    document.dispatchEvent(new Event("favoriteschange"));
  });
  paint();
  if (BigZixAPI.user) {
    BigZixAPI.request("favorites")
      .then(({ ids }) => {
        ids.forEach((id) => saved.add(id));
        loaded = true;
        paint();
      })
      .catch((error) => {
        feedback.textContent =
          error.message + " Refresh to load your favorites.";
      });
  }
})();
