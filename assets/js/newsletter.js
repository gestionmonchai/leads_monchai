/* Aucun script fournisseur : le formulaire hébergé ne s'ouvre qu'au clic. */
(function () {
  'use strict';
  var bouton = document.querySelector('[data-newsletter-inscription]');
  var attente = document.querySelector('[data-newsletter-attente]');
  if (!bouton || !attente) return;
  var controle = new AbortController();
  var timer = setTimeout(function () { controle.abort(); }, 8000);
  fetch('assets/data/newsletter.json', { signal: controle.signal, cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('configuration');
      return response.json();
    }).then(function (config) {
      if (!config || !config.form_url) return;
      var url = new URL(config.form_url);
      if (url.protocol !== 'https:' || url.username || url.password || url.port ||
          !(url.hostname === 'sibforms.com' || url.hostname.endsWith('.sibforms.com'))) return;
      bouton.href = url.href;
      bouton.hidden = false;
      attente.hidden = true;
    }).catch(function () {
      // L'état statique reste lisible et n'enregistre aucune inscription.
    }).finally(function () { clearTimeout(timer); });
})();
