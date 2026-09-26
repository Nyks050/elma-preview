(() => {
  const privacyIcon = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 26 8v7c0 6.2-4 10.8-10 13-6-2.2-10-6.8-10-13V8z"/><path d="M11.5 16 14.5 19 21 12"/></svg>';
  function mount() {
    const legal = document.getElementById('egAccountLegal');
    if (!legal || document.getElementById('egAccountPrivacy')) return;
    legal.onclick = () => { window.location.href = 'legal.html'; };
    const privacy = document.createElement('button');
    privacy.id = 'egAccountPrivacy';
    privacy.className = 'eg-setting eg-setting-button';
    privacy.type = 'button';
    privacy.innerHTML = '<span class="eg-account-privacy-icon">' + privacyIcon + '</span><div class="eg-setting-copy"><b>Gizlilik Politikası</b><small>Verilerin nasıl işlendiğini ve haklarını incele</small></div><span class="eg-setting-arrow">›</span>';
    privacy.onclick = () => { window.location.href = 'privacy.html'; };
    const accountPanel = document.querySelector('[data-panel="account"] .eg-settings');
    const firstSection = accountPanel?.querySelector('.eg-settings-section');
    if (firstSection) accountPanel.insertBefore(privacy, firstSection);
    const style = document.createElement('style');
    style.textContent = '.eg-account-privacy-icon{width:42px;height:42px;display:grid;place-items:center;flex:0 0 42px;border-radius:14px;background:#f2f2f3}.eg-account-privacy-icon svg{width:24px;height:24px;fill:none;stroke:#111;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#egAccountPrivacy{margin:0 0 18px;border:1px solid #dedfe2;border-radius:20px;background:#fff;padding:13px 14px;gap:12px}';
    document.head.appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0));
  else setTimeout(mount, 0);
  window.addEventListener('elma-home-widgets-ready', mount);
})();
