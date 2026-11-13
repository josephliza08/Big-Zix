(() => {
  const dialog = document.querySelector('#account-dialog');
  let opener;
  function open() {
    opener = document.activeElement;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.account-login').focus();
  }
  function close() { dialog.close(); }
  window.BigZixAccount = Object.freeze({ open });
  document.querySelector('#close-account').addEventListener('click', close);
  document.querySelector('#continue-browsing').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  dialog.addEventListener('close', () => opener?.focus());
})();
