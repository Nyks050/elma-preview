/* Approved eco-bus artwork, keeping the surrounding hero layout unchanged. */
(() => {
  'use strict';

  const MESSAGE = 'DAHA YEŞİL BİR AMASYA İÇİN';
  const ID = 'eg-bus-led-sign';
  const NS = 'http://www.w3.org/2000/svg';
  // Seven-row destination-sign glyphs, with separate Turkish accent rows.
  const GLYPHS = {
    A: ['01110','10001','10001','11111','10001','10001','10001'],
    B: ['11110','10001','10001','11110','10001','10001','11110'],
    C: ['01111','10000','10000','10000','10000','10000','01111'],
    D: ['11110','10001','10001','10001','10001','10001','11110'],
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    H: ['10001','10001','10001','11111','10001','10001','10001'],
    I: ['01110','00100','00100','00100','00100','00100','01110'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
    M: ['10001','11011','10101','10101','10001','10001','10001'],
    N: ['10001','11001','10101','10011','10001','10001','10001'],
    O: ['01110','10001','10001','10001','10001','10001','01110'],
    R: ['11110','10001','10001','11110','10100','10010','10001'],
    S: ['01111','10000','10000','01110','00001','00001','11110'],
    T: ['11111','00100','00100','00100','00100','00100','00100'],
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    Y: ['10001','10001','01010','00100','00100','00100','00100']
  };

  function dotPath(text) {
    const pitch = 4;
    const diameter = 2.9;
    let x = 8;
    let path = '';
    function dot(column, row) {
      const cx = x + column * pitch;
      const cy = 7 + row * pitch;
      path += `M${cx.toFixed(2)} ${cy.toFixed(2)}a1.45 1.45 0 1 0 ${diameter} 0a1.45 1.45 0 1 0 -${diameter} 0`;
    }
    for (const letter of text) {
      if (letter === ' ') { x += pitch * 4; continue; }
      const base = letter === 'İ' ? 'I' : letter === 'Ş' ? 'S' : letter === 'Ç' ? 'C' : letter;
      const rows = GLYPHS[base];
      if (!rows) { x += pitch * 6; continue; }
      rows.forEach((row, y) => [...row].forEach((pixel, col) => {
        if (pixel === '1') dot(col, y + 2);
      }));
      if (letter === 'İ') dot(2, 0);
      if (letter === 'Ş' || letter === 'Ç') { dot(2, 9); dot(1, 10); }
      x += pitch * 6;
    }
    return { path, period: x + 55 };
  }

  function mount() {
    const stage = document.querySelector('.eg-transit-stage');
    if (!stage || stage.querySelector(`#${ID}`)) return;
    const artwork = stage.querySelector('.eg-reference-frame');
    if (!artwork) return;
    const { path, period } = dotPath(MESSAGE.toLocaleUpperCase('tr-TR'));
    const style = document.createElement('style');
    style.textContent = `
      .eg-transit-hero .eg-transit-stage.eg-eco-stage{inset:0;left:0;top:0;width:100%;height:100%;transform:none}
      .eg-eco-stage:before,.eg-eco-stage:after{display:none!important}
      .eg-transit-hero .eg-eco-stage .eg-reference-frame{inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:none}
      .eg-bus-led-overlay{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;overflow:hidden}
      .eg-bus-led-track{animation:egBusLEDScroll ${period / 40}s linear infinite;animation-play-state:paused}
      .eg-panel.active .eg-bus-led-track{animation-play-state:running}
      .eg-eco-hidden .eg-bus-led-track{animation-play-state:paused!important}
      .eg-bus-led-static{display:none}
      @keyframes egBusLEDScroll{from{transform:translateX(0)}to{transform:translateX(-${period}px)}}
      html[data-reduce-motion="true"] .eg-bus-led-track{display:none;animation:none!important}
      html[data-reduce-motion="true"] .eg-bus-led-static{display:block}
      @media(prefers-reduced-motion:reduce){.eg-bus-led-track{display:none;animation:none!important}.eg-bus-led-static{display:block}}
    `;
    document.head.appendChild(style);
    const svg = document.createElementNS(NS, 'svg');
    svg.id = ID;
    svg.setAttribute('class', 'eg-bus-led-overlay');
    svg.setAttribute('viewBox', '0 0 1721 914');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = `
      <defs>
        <linearGradient id="eg-led-glass" x1="0" y1="0" x2="0.2" y2="1">
          <stop stop-color="#9ba5ad" stop-opacity=".23"/>
          <stop offset=".46" stop-color="#1c2226" stop-opacity=".04"/>
          <stop offset="1" stop-color="#000" stop-opacity=".2"/>
        </linearGradient>
        <linearGradient id="eg-led-edge">
          <stop stop-color="#060809"/>
          <stop offset=".055" stop-color="#060809" stop-opacity="0"/>
          <stop offset=".945" stop-color="#060809" stop-opacity="0"/>
          <stop offset="1" stop-color="#060809"/>
        </linearGradient>
        <radialGradient id="eg-led-diode"><stop stop-color="#ffe8ad"/><stop offset=".42" stop-color="#ffc34f"/><stop offset="1" stop-color="#df8f1e"/></radialGradient>
        <linearGradient id="eg-led-panel" x2="0" y2="1"><stop stop-color="#10171e"/><stop offset="1" stop-color="#080e14"/></linearGradient>
        <pattern id="eg-led-grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#26303b" opacity=".38"/>
        </pattern>
        <filter id="eg-led-bloom" x="-3%" y="-30%" width="106%" height="160%">
          <feGaussianBlur stdDeviation="1.25"/>
        </filter>
      </defs>
      <g transform="matrix(1 .073 .065 1 877 247)">
        <svg width="268" height="59" viewBox="0 0 268 59" overflow="hidden">
          <rect width="268" height="59" fill="url(#eg-led-panel)"/>
          <rect width="268" height="59" fill="url(#eg-led-grid)"/>
          <g class="eg-bus-led-track">
            <g color="#ffa915" opacity=".28" filter="url(#eg-led-bloom)">
              <path fill="currentColor" d="${path}"/><path fill="currentColor" d="${path}" transform="translate(${period} 0)"/>
            </g>
            <g>
              <path fill="url(#eg-led-diode)" d="${path}"/><path fill="url(#eg-led-diode)" d="${path}" transform="translate(${period} 0)"/>
            </g>
          </g>
          <g class="eg-bus-led-static" fill="#ffc34f" font-family="monospace" font-weight="700" font-size="17" text-anchor="middle">
            <text x="134" y="35" textLength="249" lengthAdjust="spacingAndGlyphs">${MESSAGE}</text>
          </g>
        </svg>
      </g>`;
    const replacement = new Image();
    replacement.onload = () => {
      if (!stage.isConnected) return;
      artwork.src = replacement.src;
      artwork.alt = 'Yeşil durakta bekleyen beyaz şehir otobüsü';
      stage.classList.add('eg-eco-stage');
      stage.appendChild(svg);
      const hero = stage.closest('.eg-transit-hero');
      hero?.setAttribute('aria-label', `Otobüs, kayan tabela: ${MESSAGE}`);
      let visible = true;
      const sync = () => svg.classList.toggle('eg-eco-hidden', document.hidden || !visible);
      document.addEventListener('visibilitychange', sync);
      if (hero && 'IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting === true; sync(); }).observe(hero);
      sync();
    };
    replacement.src = new URL('assets/eco-bus-amasya-20261016.png', document.baseURI).href;
  }

  mount();
  document.addEventListener('DOMContentLoaded', mount, { once: true });
  window.addEventListener('elma-home-widgets-ready', mount, { once: true });
})();
