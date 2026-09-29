(() => {
  function mount() {
    const legal = document.getElementById('egAccountLegal');
    document.getElementById('egAccountPrivacy')?.remove();
    if (!legal) return;
    legal.onclick = () => { window.location.href = 'legal.html'; };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0));
  else setTimeout(mount, 0);
  window.addEventListener('elma-home-widgets-ready', mount);
})();
