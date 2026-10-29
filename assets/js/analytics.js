/* GA4 direct : aucun chargement Google avant l'accord « Mesure d'audience ».
   Le conteneur GTM historique n'est chargé que sur les pages qui l'utilisaient.
   Une seule configuration directe du flux par document ; publicité refusée. */
(function () {
  'use strict';
  if (window.self !== window.top || window.monchaiAnalyticsInitialise) return;
  window.monchaiAnalyticsInitialise = true;
  var ID = 'G-2VZ6WQSB52';
  var CLE = 'monchai_cookie_consent';
  var VERSION = '2026-10-29-ga4';
  var DUREE = 1000 * 60 * 60 * 24 * 182;
  var autorise = false;
  var configure = false;
  var gaCharge = false;
  var scriptCourant = document.currentScript;
  var utiliserGtm = scriptCourant && scriptCourant.hasAttribute('data-gtm');
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function etat(accepte) {
    return {analytics_storage: accepte ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
  }
  window.gtag('consent', 'default', etat(false));
  window['ga-disable-' + ID] = true;

  function choixSauve() {
    try {
      var c = JSON.parse(localStorage.getItem(CLE));
      return c && typeof c.ts === 'number' && Number.isFinite(c.ts) && c.ts <= Date.now() &&
        Date.now() - c.ts <= DUREE && typeof c.audience === 'boolean' && typeof c.tiers === 'boolean' &&
        (!c.audience || c.version === VERSION) ? c : null;
    } catch (e) { return null; }
  }

  function retirerCookiesGoogle() {
    var noms = document.cookie.split(';').map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (nom) { return /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(nom); });
    var host = location.hostname.split('.');
    var domaines = [''];
    while (host.length > 1) { domaines.push(host.join('.'), '.' + host.join('.')); host.shift(); }
    var chemins = ['/'];
    var segments = location.pathname.split('/').filter(Boolean);
    var chemin = '';
    segments.slice(0, -1).forEach(function (segment) { chemin += '/' + segment; chemins.push(chemin, chemin + '/'); });
    noms.forEach(function (nom) { domaines.forEach(function (domaine) { chemins.forEach(function (path) {
      document.cookie = nom + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path +
        (domaine ? '; domain=' + domaine : '') + '; SameSite=Lax';
    }); }); });
  }

  function charger() {
    if (!autorise) return;
    if (!configure) {
      configure = true;
      window.gtag('js', new Date());
      window.gtag('config', ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: location.origin + location.pathname,
        page_referrer: (function () { try { var u = new URL(document.referrer); return u.origin + u.pathname; } catch (e) { return ''; } })(),
        cookie_expires: 60 * 60 * 24 * 395,
        cookie_update: false
      });
    }
    if (!gaCharge) {
      gaCharge = true;
      var ga = document.createElement('script');
      ga.id = 'monchai-ga4';
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
      document.head.appendChild(ga);
    }
    if (utiliserGtm && !window.monchaiGtmCharge) {
      window.monchaiGtmCharge = true;
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
      var gtm = document.createElement('script');
      gtm.id = 'monchai-gtm';
      gtm.async = true;
      gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-NDSQV6T7';
      document.head.appendChild(gtm);
    }
  }

  function appliquer(c) {
    autorise = !!c && c.audience === true;
    window['ga-disable-' + ID] = !autorise;
    window.gtag('consent', 'update', etat(autorise));
    if (autorise) {
      if (document.readyState === 'complete') charger();
      else window.addEventListener('load', charger, {once: true});
    } else retirerCookiesGoogle();
  }
  window.addEventListener('monchai:consent', function (event) {
    appliquer(event.detail);
  });
  // Rafraîchir le choix si un autre onglet vient de le modifier.
  window.addEventListener('storage', function (event) {
    if (event.key === CLE) {
      var precedent = autorise;
      appliquer(choixSauve());
      if (precedent && !autorise) location.reload();
    }
  });
  appliquer(choixSauve());
})();
