/* Destination display registered to the original 1536 x 763 bus artwork. */
(() => {
  'use strict';

  const MESSAGE = 'Ulaşımda İhtiyacın Olan Her Şey Bir Arada';
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
    const pitch = 2.75;
    const diameter = 2.25;
    let x = 8;
    let path = '';
    function dot(column, row) {
      const cx = x + column * pitch;
      const cy = 3 + row * pitch;
      path += `M${cx.toFixed(2)} ${cy.toFixed(2)}a1.125 1.125 0 1 0 ${diameter} 0a1.125 1.125 0 1 0 -${diameter} 0`;
    }
    for (const letter of text) {
      if (letter === ' ') { x += pitch * 4; continue; }
      const base = letter === 'İ' ? 'I' : letter === 'Ş' ? 'S' : letter;
      const rows = GLYPHS[base];
      if (!rows) { x += pitch * 6; continue; }
      rows.forEach((row, y) => [...row].forEach((pixel, col) => {
        if (pixel === '1') dot(col, y + 2);
      }));
      if (letter === 'İ') dot(2, 0);
      if (letter === 'Ş') { dot(2, 9); dot(1, 10); }
      x += pitch * 6;
    }
    return { path, period: x + 55 };
  }

  function mount() {
    const stage = document.querySelector('.eg-transit-stage');
    if (!stage || stage.querySelector(`#${ID}`)) return;
    const { path, period } = dotPath(MESSAGE.toLocaleUpperCase('tr-TR'));
    const style = document.createElement('style');
    style.textContent = `
      .eg-bus-led-overlay{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;overflow:visible}
      .eg-bus-led-track{animation:egBusLEDScroll ${Math.round(period / 32)}s linear infinite;animation-play-state:paused}
      .eg-panel.active .eg-bus-led-track{animation-play-state:running}
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
    svg.setAttribute('viewBox', '0 0 1536 763');
    svg.setAttribute('preserveAspectRatio', 'none');
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
        <pattern id="eg-led-grid" width="2.75" height="2.75" patternUnits="userSpaceOnUse">
          <circle cx="1.375" cy="1.375" r=".8" fill="#a7752b" opacity=".12"/>
        </pattern>
        <filter id="eg-led-bloom" x="-3%" y="-30%" width="106%" height="160%">
          <feGaussianBlur stdDeviation="1.1"/>
        </filter>
      </defs>
      <g transform="matrix(1 .11 0 1 849 232)">
        <rect x="-2" y="-1.5" width="222" height="36" rx="2.5" fill="#101315" stroke="#596066" stroke-opacity=".5" stroke-width="1.2"/>
        <svg width="218" height="33" viewBox="0 0 218 33" overflow="hidden">
          <rect width="218" height="33" fill="#060809"/>
          <rect width="218" height="33" fill="url(#eg-led-grid)"/>
          <g class="eg-bus-led-track">
            <g color="#ff9500" opacity=".8" filter="url(#eg-led-bloom)">
              <path fill="currentColor" d="${path}"/><path fill="currentColor" d="${path}" transform="translate(${period} 0)"/>
            </g>
            <g color="#ffdc91">
              <path fill="currentColor" d="${path}"/><path fill="currentColor" d="${path}" transform="translate(${period} 0)"/>
            </g>
          </g>
          <g class="eg-bus-led-static" fill="#ffd078" font-family="Arial,sans-serif" font-weight="700" font-size="11" text-anchor="middle" letter-spacing="1">
            <text x="109" y="10">ULAŞIMDA İHTİYACIN</text>
            <text x="109" y="21">OLAN HER ŞEY</text>
            <text x="109" y="32">BİR ARADA</text>
          </g>
          <rect width="218" height="33" fill="url(#eg-led-edge)"/>
          <rect width="218" height="33" fill="url(#eg-led-glass)"/>
          <path d="M0 0H218V5L0 2Z" fill="#d5e0e7" opacity=".07"/>
        </svg>
      </g>`;
    stage.appendChild(svg);
    stage.closest('.eg-transit-hero')?.setAttribute('aria-label', `Mercedes-Benz Conecto, kayan tabela: ${MESSAGE}`);
  }

  mount();
  document.addEventListener('DOMContentLoaded', mount, { once: true });
  window.addEventListener('elma-home-widgets-ready', mount, { once: true });
})();

