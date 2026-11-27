/* =========================================================
   DEVELOPMENT SITE WATERMARK
   Visual only: never blocks taps, hidden when printing.
   Add  ?clean  to the address to hide it (for screenshots).
   ========================================================= */
(() => {
  'use strict';

  // Safety net: put the dev site's hostname here and the watermark can
  // never show on any other site, even if this file is copied by mistake.
  // Example: const ONLY_ON = ['dev.example.com'];   (empty = show anywhere)
  const ONLY_ON = [];

  if (ONLY_ON.length && !ONLY_ON.includes(location.hostname)) return;
  if (/[?&]clean\b/.test(location.search)) return;

  const W = 290;
  const H = 180;

  const tile =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<g transform="rotate(-24 ${W / 2} ${H / 2})" text-anchor="middle" ` +
    `font-family="ui-monospace,Menlo,Consolas,monospace" font-weight="800">` +
    `<text x="${W / 2}" y="${H / 2 - 4}" font-size="25" letter-spacing="6" ` +
    `fill="#f59e0b" fill-opacity=".17">DEVELOPMENT</text>` +
    `<text x="${W / 2}" y="${H / 2 + 20}" font-size="10" letter-spacing="4" ` +
    `fill="#111827" fill-opacity=".16">&lt;/&gt; NOT THE LIVE SITE</text>` +
    `</g></svg>`;

  const css = `
    #devMarkLayer {
      position: fixed;
      top: -${H}px; left: -${W}px; right: -${W}px; bottom: -${H}px;
      z-index: 2147483000;
      pointer-events: none;
      background: url("data:image/svg+xml,${encodeURIComponent(tile)}");
      animation: devDrift 45s linear infinite;
    }

    #devMarkBar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 4px;
      z-index: 2147483001;
      pointer-events: none;
      background: repeating-linear-gradient(
        135deg, #f59e0b 0 10px, #111827 10px 20px);
    }

    #devMarkPill {
      position: fixed;
      left: 10px; bottom: 78px;
      z-index: 2147483001;
      pointer-events: none;
      padding: 4px 9px 4px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(245, 158, 11, .55);
      border-radius: 999px;
      background: rgba(17, 24, 39, .88);
      color: #fbbf24;
      font: 800 10px/1 ui-monospace, Menlo, Consolas, monospace;
      letter-spacing: 1.5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, .25);
    }

    #devMarkPill i {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #f59e0b;
      animation: devBlink 1.6s ease-in-out infinite;
    }

    @keyframes devDrift {
      to { transform: translate(${W}px, ${H}px); }
    }
    @keyframes devBlink {
      50% { opacity: .25; }
    }
    @media (prefers-reduced-motion: reduce) {
      #devMarkLayer, #devMarkPill i { animation: none; }
    }
    @media print {
      #devMarkLayer, #devMarkBar, #devMarkPill { display: none !important; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.id = 'devMarkLayer';
  layer.setAttribute('aria-hidden', 'true');

  const bar = document.createElement('div');
  bar.id = 'devMarkBar';
  bar.setAttribute('aria-hidden', 'true');

  const pill = document.createElement('div');
  pill.id = 'devMarkPill';
  pill.setAttribute('aria-hidden', 'true');
  pill.innerHTML = '<i></i>DEV BUILD';

  document.body.append(layer, bar, pill);

  if (!document.title.startsWith('[DEV]')) {
    document.title = '[DEV] ' + document.title;
  }

  console.log(
    '%c DEV BUILD %c development site',
    'background:#f59e0b;color:#111;font-weight:800;padding:2px 6px;border-radius:4px',
    'color:#f59e0b'
  );
})();
