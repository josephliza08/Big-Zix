(() => {
  const dialog = document.querySelector('#account-dialog');
  const frame = document.querySelector('#account-frame');
  let opener;
  function open(mode = 'login') {
    opener = document.activeElement;
    frame.src = mode === 'signup' ? './LOGIN/register.html' : './LOGIN/LOGIN.html';
    if (!dialog.open) dialog.showModal();
    document.querySelector('#close-account').focus();
  }
  function close() { dialog.close(); }
  window.BigZixAccount = Object.freeze({ open });
  document.querySelector('#close-account').addEventListener('click', close);
  document.querySelectorAll('[data-account]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      open(link.dataset.account);
    });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  dialog.addEventListener('close', () => {
    frame.removeAttribute('src');
    opener?.focus();
  });
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
    if (event.data?.type === 'big-zix:close-account') close();
  });
})();
