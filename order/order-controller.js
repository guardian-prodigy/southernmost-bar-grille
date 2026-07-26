(() => {
  'use strict';

  const Store = window.SMStore;
  if (!Store) return;

  function syncOrderControls() {
    const state = Store.getState();
    const hasCurrentItems = state.cart.length > 0;

    document.querySelectorAll('[data-submit-round]').forEach(button => {
      button.disabled = !hasCurrentItems;
      button.setAttribute('aria-disabled', String(!hasCurrentItems));
    });

    document.querySelectorAll('[data-open-checkout]').forEach(button => {
      const hasBalance = Store.openBalance() > 0 || hasCurrentItems;
      button.disabled = !hasBalance;
      button.setAttribute('aria-disabled', String(!hasBalance));
    });
  }

  window.addEventListener(Store.eventName, syncOrderControls);
  window.addEventListener('pageshow', syncOrderControls);
  document.addEventListener('DOMContentLoaded', syncOrderControls, { once: true });

  const root = document.querySelector('#page-root');
  if (root) {
    new MutationObserver(syncOrderControls).observe(root, {
      childList: true,
      subtree: true
    });
  }

  syncOrderControls();
})();
