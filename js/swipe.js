'use strict';

/* =========================================================
   SWIPE GESTURES (phones / tablets)
   - Catalogue: swipe LEFT opens the cart. Nothing else (no swipe to Saved Orders).
   - Cart: swipe RIGHT closes it (same as the X button), back to the catalogue.
   - Saved Orders panel: swipe LEFT = Server tab, swipe RIGHT = Local tab.
   Ignored while typing, on horizontally scrolling areas (photo gallery),
   in popups, and near the screen edges (keeps the system back gesture).
   ========================================================= */
(() => {
  const MIN_DISTANCE = 70;     // px
  const MAX_DURATION = 700;    // ms
  const DIRECTION_RATIO = 1.8; // must be clearly more sideways than vertical
  const EDGE = 24;             // px kept free for the browser's own gestures

  let start = null;

  const $ = id => document.getElementById(id);

  function visible(el) {
    return !!el && !el.classList.contains('hidden') &&
      getComputedStyle(el).display !== 'none';
  }

  // A popup or dialog is showing: do nothing
  function dialogOpen() {
    return (
      visible($('quantityPanel')) ||
      visible($('settingsPanel')) ||
      !!document.querySelector(
        '#salesmanRecipientOverlay, #orderPromptOverlay, ' +
        '#notaPopupOverlay, #invoiceNoOverlay, .swipe-block'
      ) ||
      ($('requesterIdentityOverlay') &&
        $('requesterIdentityOverlay').style.display === 'flex')
    );
  }

  // 'catalog' | 'cart' | 'saved' | '' (no swipe)
  function currentMode() {
    if (dialogOpen()) return '';

    const open = Array.from(document.querySelectorAll('.cart-panel.open'));

    if (!open.length) return 'catalog';
    if (open.length === 1 && open[0].id === 'savedOrdersPanel') return 'saved';
    if (open.length === 1 && open[0].id === 'cartPanel') return 'cart';
    return '';
  }

  // Typing, or something that scrolls sideways by itself
  function startedOnBlocked(target) {
    if (!(target instanceof Element)) return true;

    if (target.closest('input, textarea, select, [contenteditable="true"], [data-no-swipe]')) {
      return true;
    }

    for (let el = target; el && el !== document.body; el = el.parentElement) {
      const overflowX = getComputedStyle(el).overflowX;
      if ((overflowX === 'auto' || overflowX === 'scroll') &&
          el.scrollWidth > el.clientWidth + 2) {
        return true;
      }
    }

    return false;
  }

  document.addEventListener('touchstart', event => {
    start = null;

    if (event.touches.length !== 1) return;

    const touch = event.touches[0];

    if (touch.clientX < EDGE || touch.clientX > window.innerWidth - EDGE) return;
    if (startedOnBlocked(event.target)) return;

    const mode = currentMode();
    if (!mode) return;

    start = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      mode
    };
  }, { passive: true });

  document.addEventListener('touchmove', event => {
    if (event.touches.length > 1) start = null;      // pinch / two fingers
  }, { passive: true });

  document.addEventListener('touchcancel', () => { start = null; }, { passive: true });

  document.addEventListener('touchend', event => {
    if (!start) return;

    const begin = start;
    start = null;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - begin.x;
    const dy = touch.clientY - begin.y;

    if (Date.now() - begin.time > MAX_DURATION) return;
    if (Math.abs(dx) < MIN_DISTANCE) return;
    if (Math.abs(dx) < Math.abs(dy) * DIRECTION_RATIO) return;

    // The situation may have changed during the swipe
    if (currentMode() !== begin.mode) return;

    const left = dx < 0;

    if (begin.mode === 'catalog') {
      // Desktop shows the cart as a side column already
      if (window.matchMedia('(min-width: 1000px)').matches) return;
      if (!left || typeof openCart !== 'function') return;

      // Opening the cart adds a history entry for the Back button. Chrome
      // ignores entries added before the page has ever been tapped, which
      // would make Back skip the cart. So wait for one tap first.
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
        if (typeof showToast === 'function') {
          showToast('Tap the page once, then swipe');
        }
        return;
      }

      openCart();
      return;
    }

    if (begin.mode === 'cart') {
      // Same path as the X button, so the Back-button guard stays in sync
      if (!left && typeof closeCart === 'function') closeCart();
      return;
    }

    if (begin.mode === 'saved') {
      const tab = $(left ? 'tabServer' : 'tabLocal');
      if (tab && !tab.classList.contains('is-active')) tab.click();
    }
  }, { passive: true });
})();
