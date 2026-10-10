(() => {
  'use strict';
  if (window.__elmaEventsMounted) return;
  window.__elmaEventsMounted = true;
  window.__elmaLostFoundMounted = true;
  window.__elmaNativeLostActive = false;
  const calendar = '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="7" width="22" height="22" rx="4"/><path d="M10 3v8M22 3v8M5 15h22M11 21h3M19 21h2"/></svg>';
  const style = document.createElement('style');
  style.textContent = '.eg-events{padding:0 0 110px;color:#111;background:#fff;min-height:65vh}.eg-events p{color:#747474;font-size:14px;line-height:1.6;margin:0}.eg-events-empty{margin-top:28px;border-radius:26px;background:#fafafa;padding:52px 20px;text-align:center}.eg-events-symbol{display:flex;width:76px;height:76px;margin:0 auto 20px;align-items:center;justify-content:center;background:#efefef;border-radius:24px}.eg-events-symbol svg{width:36px;height:36px}.eg-events h2{font-size:20px;margin:0 0 10px}.eg-lost-layer,.eg-lost-sheet,.eg-lost-message-badge,.eg-lost-unread-badge{display:none!important}';
  document.head.appendChild(style);
  function mount() {
    const host = document.getElementById('elmaHomeWidgets');
    if (!host) return;
    let panel = host.querySelector('[data-panel="lost-found"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'eg-panel';
      panel.dataset.panel = 'lost-found';
      host.appendChild(panel);
    }
    panel.classList.add('elma-has-back');
    if (!panel.querySelector('.eg-events')) panel.innerHTML = '<div class="eg-events"><header class="elma-back-header"><button type="button" class="eg-service-back" data-arrow-only aria-label="Geri"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg></button></header><div class="eg-events-empty"><span class="eg-events-symbol">'+calendar+'</span><h2>Henüz etkinlik yok</h2><p>Yeni etkinlikler burada yer alacak.</p></div></div>';
    const back = panel.querySelector('[data-arrow-only]');
    if (back && !back.dataset.bound) {
      back.dataset.bound = 'true';
      back.addEventListener('click', () => window.elmaSelectMainTab?.('transport'));
    }
    document.querySelectorAll('[data-tab="lost"],[data-elma-tab="lost"]').forEach(button => {
      if (button.getAttribute('aria-label') !== 'Etkinlik') {
        button.setAttribute('aria-label', 'Etkinlik');
        button.innerHTML = '<span class="ico">'+calendar+'</span><span>Etkinlik</span>';
      }
    });
    document.querySelectorAll('[data-service-target="lost-found"],.eg-lost-layer,.eg-lost-sheet').forEach(node => node.remove());
    document.querySelectorAll('button,a').forEach(node => {
      if (node.matches('[data-tab="lost"],[data-elma-tab="lost"]')) return;
      const label = node.textContent.trim();
      if (/^(İlanlarım|Mesajlarım|Kayıp ilanı ver|Talepler|İletişim talepleri|Kayıp eşya ilanları)$/i.test(label)) node.hidden = true;
    });
    const notice = document.getElementById('egNotificationStatus');
    if (notice && /Kayıp eşya/.test(notice.textContent)) notice.textContent = 'Şehir duyuruları';
  }
  function openEvents() {
    mount();
    document.querySelectorAll('.eg-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === 'lost-found'));
    document.querySelectorAll('.eg-tab,.elma-main-tab').forEach(tab => {
      const active = (tab.dataset.tab || tab.dataset.elmaTab) === 'lost';
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
    });
    document.querySelectorAll('.hero,.mapwrap').forEach(node => { node.style.display = 'none'; });
    document.getElementById('elmaHomeWidgets')?.classList.remove('home-active');
  }
  // Old bookmarks and older clients resolve to the replacement page.
  window.elmaOpenEvents = openEvents;
  window.elmaOpenLostFound = openEvents;
  window.elmaNativeLostFoundAPI = { handle() { openEvents(); } };
  window.addEventListener('elma-home-widgets-ready', mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  mount();
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; mount(); });
  }).observe(document.body, { childList: true, subtree: true });
})();
