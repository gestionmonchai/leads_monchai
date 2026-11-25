(() => {
  'use strict';
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || !(event.target instanceof Element) ||
        !window.monchaiAnalyticsInitialise || window.monchaiConsent?.audience !== true ||
        typeof window.gtag !== 'function') return;

    const lien = event.target.closest('a[data-evenement-guide]');
    const nom = lien?.dataset.evenementGuide;
    if (nom === 'guide_logiciel_visite' || nom === 'guide_logiciel_demo') {
      window.gtag('event', nom);
    }
  });
})();
