/* GA4 et GTM attendent le choix validé par consent.js.
   Le flux GA4 est configuré une seule fois par document. */
(function () {
  'use strict';
  if (window.self !== window.top || window.monchaiAnalyticsInitialise) return;
  window.monchaiAnalyticsInitialise = true;
  var ID = 'G-2VZ6WQSB52';
  var CONTENEUR = 'GTM-NDSQV6T7';
  var autorise = false;
  var configure = false;
  var gaCharge = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function etat(accepte) {
    return {analytics_storage: accepte ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
  }
  window.gtag('consent', 'default', etat(false));
  window['ga-disable-' + ID] = true;

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
    if (!window.monchaiGtmCharge) {
      window.monchaiGtmCharge = true;
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
      var gtm = document.createElement('script');
      gtm.id = 'monchai-gtm';
      gtm.async = true;
      gtm.referrerPolicy = 'strict-origin';
      gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + CONTENEUR;
      document.head.appendChild(gtm);
    }
  }

  function appliquer(c) {
    var precedent = autorise;
    autorise = !!c && c.audience === true;
    window['ga-disable-' + ID] = !autorise;
    if (autorise) {
      if (!precedent) window.gtag('consent', 'update', etat(true));
      if (document.readyState === 'complete') charger();
      else window.addEventListener('load', charger, {once: true});
    } else retirerCookiesGoogle();
  }
  window.addEventListener('monchai:consent', function () {
    appliquer(window.monchaiConsent);
  });
  appliquer(window.monchaiConsent);
})();
