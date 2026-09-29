(() => {
  function mount() {
    const legal = document.getElementById('egAccountLegal');
    document.getElementById('egAccountPrivacy')?.remove();
    document.querySelectorAll('.eg-setting-copy b').forEach(label => {
      if (label.textContent.trim() === 'Elma Go hakkında') label.closest('.eg-setting')?.remove();
    });
    if (!legal) return;
    legal.onclick = () => { window.location.href = 'legal.html'; };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0));
  else setTimeout(mount, 0);
  window.addEventListener('elma-home-widgets-ready', mount);
})();
