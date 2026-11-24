/* Invitation Vinitech unique : visuel du post et réservation NeetoCal.
   Une apparition par session, après 20 secondes et hors des parcours engagés.
   L'image est servie par Mon Chai ; aucune intégration ni requête Instagram. */
(function () {
  'use strict';
  if (window.self !== window.top || window.monchaiCtaContextuelle) return;
  window.monchaiCtaContextuelle = true;
  window.monchaiCadeauVinitech = true;
  var script = document.currentScript;
  if (!script || !script.src) return;
  var root = new URL('../../', script.src);
  var path = decodeURIComponent(location.pathname).slice(root.pathname.length)
    .replace(/^(en|de|it|zh)\//, '').replace(/\/$/, '/index.html');
  if (/^(contact|essai-gratuit|cgu|mentions-legales|politique-confidentialite|monchainotes)\.html$/.test(path) ||
      /^(demonstration(?:-2)?|visite-interactive|developpeurs)\//.test(path)) return;
  if (Date.now() >= Date.parse('2026-12-04T00:00:00+01:00')) return;
  var KEY = 'monchai_popup_vinitech_visuel_20261124';
  var lang = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  var TEXT = {
    fr: {close:'Fermer cette invitation',book:'Réservez votre rendez-vous',alt:'On vous offre une coupe ! Mon Chai, BottleFlow et JobVinum vous invitent à Vinitech-Sifel, mercredi 2 décembre dès 11 h 30, stand Mon Chai B2307 à Bordeaux.'},
    en: {close:'Close this invitation',book:'Book your appointment',alt:'Join Mon Chai, BottleFlow and JobVinum for a drink at Vinitech-Sifel in Bordeaux, Wednesday 2 December from 11:30, Mon Chai stand B2307. Poster in French.'},
    de: {close:'Diese Einladung schließen',book:'Vereinbaren Sie Ihren Termin',alt:'Mon Chai, BottleFlow und JobVinum laden zum Vinitech-Sifel in Bordeaux ein: Mittwoch, 2. Dezember, ab 11:30 Uhr, Stand Mon Chai B2307. Plakat auf Französisch.'},
    it: {close:'Chiudi questo invito',book:'Prenota il tuo appuntamento',alt:'Mon Chai, BottleFlow e JobVinum vi invitano a Vinitech-Sifel a Bordeaux, mercoledì 2 dicembre dalle 11:30, stand Mon Chai B2307. Locandina in francese.'},
    zh: {close:'关闭此邀请',book:'预约会面时间',alt:'Mon Chai、BottleFlow和JobVinum邀请您参加波尔多Vinitech-Sifel展会的交流酒会：12月2日星期三11:30起，Mon Chai展位B2307。海报为法语。'}
  };
  var t = TEXT[lang] || TEXT.fr;
  var booking = 'https://mon-chai.neetocal.com/demo-vinitech';
  var image = new URL('assets/img/invitation-apero-vinitech-2026.png', root).href;
  var card = null, before = null, timer = null, done = false;
  var CSS = [
    '.mc-vinitech{position:fixed;right:20px;bottom:20px;z-index:290;box-sizing:border-box;width:min(360px,calc(100vw - 40px));max-height:calc(100dvh - 32px);overflow:auto;border:1px solid #d4b58b;border-radius:12px;background:#faf4ea;color:#681d2c;box-shadow:0 12px 36px #38251f26;font-family:Inter,system-ui,sans-serif;isolation:isolate;animation:mc-vinitech-entree .25s ease-out}.mc-vinitech[hidden]{display:none}.mc-vinitech *{box-sizing:border-box}',
    '.mc-vinitech__header{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:2px 6px 2px 18px;border-bottom:1px solid #d4b58b66}.mc-vinitech__title{margin:0;font:600 12px/1.4 Inter,system-ui,sans-serif;letter-spacing:.04em}.mc-vinitech__close{display:grid;place-items:center;flex:0 0 44px;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:transparent;color:#681d2c;font:26px/1 system-ui;cursor:pointer}.mc-vinitech__close:hover{background:#eadfce}',
    '.mc-vinitech__visual{margin:0;padding:0;background:#f7efe2}.mc-vinitech__image{display:block;width:100%;height:auto;max-height:min(52dvh,450px);object-fit:contain}.mc-vinitech__fallback{margin:0;padding:22px;font-size:14px;line-height:1.6}.mc-vinitech__fallback[hidden]{display:none}',
    '.mc-vinitech__actions{padding:14px 18px 16px;border-top:1px solid #d4b58b66;background:#faf4ea}.mc-vinitech__book{display:flex;align-items:center;justify-content:center;gap:12px;min-height:48px;padding:12px 16px;border:1px solid #681d2c;border-radius:7px;background:#681d2c;color:#fff8ee;text-decoration:none;text-align:center;font-size:14px;font-weight:600;line-height:1.45}.mc-vinitech__book:hover{background:#501422}.mc-vinitech__arrow{font-size:20px;line-height:1}.mc-vinitech :focus-visible{outline:3px solid #a86a24;outline-offset:3px}',
    '@media(max-width:639px){.mc-vinitech{left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));width:auto;max-height:calc(100dvh - 24px)}.mc-vinitech__header{padding-left:14px}.mc-vinitech__actions{padding:12px 14px 14px}.mc-vinitech__book{font-size:13px}.mc-vinitech__image{max-height:52dvh}}',
    '@media(max-height:450px){.mc-vinitech{right:12px;bottom:12px;width:min(360px,calc(100vw - 24px))}.mc-vinitech__image{max-height:calc(100dvh - 152px)}.mc-vinitech__actions{padding:8px 12px 10px}}',
    '@keyframes mc-vinitech-entree{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.mc-vinitech{animation:none}}@media print{.mc-vinitech{display:none!important}}'
  ].join('\n');
  function seen() {
    if (done) return true;
    try { return sessionStorage.getItem(KEY) === 'vue'; } catch (e) { return false; }
  }
  function measure(event) {
    if (window.monchaiConsent && window.monchaiConsent.audience === true) {
      (window.dataLayer = window.dataLayer || []).push({event:event,cta_campagne:'vinitech_2026',cta_variante:'visuel_instagram_20261124'});
    }
  }
  function visible(el) {
    return !!el && !el.hidden && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function busy() {
    if (document.visibilityState === 'hidden') return true;
    if (visible(document.getElementById('cookieBanner')) || visible(document.getElementById('cookieModal'))) return true;
    if ([].some.call(document.querySelectorAll('[aria-modal="true"],dialog[open],.hd.est-deploye'),visible)) return true;
    var focus = document.activeElement;
    return !!focus && (focus.matches('input,select,textarea') || focus.isContentEditable);
  }
  function close(reason) {
    if (!card || card.hidden) return;
    var inside = card.contains(document.activeElement);
    card.hidden = true;
    if (inside) {
      var target = before && before.isConnected && before !== document.body ? before : document.querySelector('main h1,h1,main');
      if (target) {
        var previous = target.getAttribute('tabindex');
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
        if (previous === null) target.removeAttribute('tabindex');
        else target.setAttribute('tabindex',previous);
      }
    }
    if (reason !== 'navigation') measure('cta_popup_ferme');
  }
  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    card = document.createElement('aside');
    card.className = 'mc-cta mc-vinitech';
    card.setAttribute('aria-labelledby','mcVinitechTitle');
    card.setAttribute('aria-live','polite');
    card.setAttribute('data-campagne','vinitech_2026');
    card.setAttribute('data-variante','visuel_instagram_20261124');
    var header = document.createElement('div');
    header.className = 'mc-vinitech__header';
    var title = document.createElement('h2');
    title.id = 'mcVinitechTitle';
    title.className = 'mc-vinitech__title';
    title.textContent = 'Vinitech-Sifel';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mc-vinitech__close';
    button.setAttribute('aria-label',t.close);
    button.textContent = '×';
    button.addEventListener('click',close);
    header.appendChild(title);
    header.appendChild(button);
    var visual = document.createElement('figure');
    visual.className = 'mc-vinitech__visual';
    var poster = document.createElement('img');
    poster.className = 'mc-vinitech__image';
    poster.alt = t.alt;
    poster.decoding = 'async';
    poster.width = 800;
    poster.height = 1000;
    var fallback = document.createElement('p');
    fallback.className = 'mc-vinitech__fallback';
    fallback.hidden = true;
    fallback.textContent = t.alt;
    poster.addEventListener('error',function () {
      poster.hidden = true;
      poster.style.display = 'none';
      fallback.hidden = false;
    });
    poster.src = image;
    visual.appendChild(poster);
    visual.appendChild(fallback);
    var actions = document.createElement('div');
    actions.className = 'mc-vinitech__actions';
    var link = document.createElement('a');
    link.className = 'mc-vinitech__book';
    link.href = booking;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = t.book;
    var arrow = document.createElement('span');
    arrow.className = 'mc-vinitech__arrow';
    arrow.setAttribute('aria-hidden','true');
    arrow.textContent = '→';
    link.appendChild(arrow);
    link.addEventListener('click',function () {
      measure('cta_popup_reservation');
      close('navigation');
    });
    actions.appendChild(link);
    card.appendChild(header);
    card.appendChild(visual);
    card.appendChild(actions);
    before = document.activeElement;
    document.body.appendChild(card);
    document.addEventListener('keydown',function (event) {
      if (event.key === 'Escape' && ![].some.call(document.querySelectorAll('[aria-modal="true"],dialog[open]'),visible)) close();
    },true);
  }
  function show() {
    clearTimeout(timer);
    if (seen()) return;
    if (busy()) { timer = setTimeout(show,1000); return; }
    done = true;
    build();
    try { sessionStorage.setItem(KEY,'vue'); } catch (e) {}
    measure('cta_popup_affiche');
  }
  function start() {
    clearTimeout(timer);
    timer = setTimeout(show,Math.max(0,20000-(window.performance ? performance.now() : 0)));
  }
  window.addEventListener('pagehide',function () { clearTimeout(timer); });
  window.addEventListener('pageshow',function (event) { if (event.persisted && !seen()) start(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
