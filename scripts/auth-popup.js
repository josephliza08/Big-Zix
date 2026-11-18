(() => {
  const dialog = document.querySelector("#account-dialog");
  let opener;
  function open(reason = "order") {
    const favorites = reason === "favorites";
    dialog.querySelector(".account-kicker").textContent = favorites
      ? "Save your favorites"
      : "Before you order";
    dialog.querySelector("#account-message").textContent = favorites
      ? "Log in to save your favorite dishes. New to Big Zix? Create an account to get started."
      : "You need to log in before ordering. New to Big Zix? Create an account to get started.";
    opener = document.activeElement;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".account-login").focus();
  }
  function close() {
    dialog.close();
  }
  window.BigZixAccount = Object.freeze({ open });
  document.querySelector("#close-account").addEventListener("click", close);
  document.querySelector("#continue-browsing").addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      close();
  });
  dialog.addEventListener("close", () => opener?.focus());
})();
