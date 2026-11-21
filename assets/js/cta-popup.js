/* Mon Chai : petites invitations contextuelles, 20 secondes après l'ouverture.
   Une apparition par rubrique et par session ; un clic sur une action suspend
   toutes les invitations pour la session. Aucun déclenchement au défilement.
   La carte attend la fin du choix de cookies, des modales et de la saisie.
   Les événements de mesure restent soumis au consentement d'audience. */
(function () {
  'use strict';
  if (window.self !== window.top || window.monchaiCtaContextuelle) return;
  window.monchaiCtaContextuelle = true;

  var balise = document.currentScript;
  if (!balise || !balise.src) return;
  var racine = new URL('../../', balise.src);
  var chemin = decodeURIComponent(window.location.pathname).slice(racine.pathname.length);
  var langue = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  var nom = chemin.replace(/^(en|de|it|zh)\//, '').replace(/\/$/, '/index.html');
  // Ne pas interrompre un parcours déjà engagé ou les documents légaux.
  if (/^(contact|essai-gratuit|cgu|mentions-legales|politique-confidentialite|monchainotes)\.html$/.test(nom) ||
      /^(demonstration(?:-2)?|visite-interactive|developpeurs)\//.test(nom)) return;

  // La surprise a sa fréquence et son délai propres, même si cette rubrique
  // a déjà montré sa carte contextuelle pendant la session.
  var cadeauVinitech = document.createElement('script');
  cadeauVinitech.src = new URL('cadeau-vinitech.js?v=20261110-compact-stable', balise.src).href;
  document.head.appendChild(cadeauVinitech);

  var RUBRIQUES = [
    ['recolte', /^declaration-recolte/], ['tarifs', /^tarifs\./],
    ['drm', /^(drm-|dae-daes-|actualites-douane-)/],
    ['vigne', /^(vigne-vendanges|cahier-de-culture|registre-phyto|ift-viticulture|actualites-vigne)/],
    ['cave', /^(cave-vinification|registre-de-cave|actualites-cave)/],
    ['stocks', /^(stocks-tracabilite|tracabilite-lots)/],
    ['mises', /^(mises-conditionnement|actualites-etiquetage|ppwr-vin)/],
    ['ventes', /^(ventes-clients|vente-directe|facturation-electronique|actualites-ventes|recommandation-sociale|vin-multigenerationnel|vin-low-alcool)/],
    ['couts', /^(cout-|cout-de-|charges-indirectes|marge-vin|investir-leviers|activations-locales)/],
    ['oenotourisme', /^(oenotourisme|actualites-oenotourisme)/],
    ['assistant', /^(ia-au-service|ce-que-votre-assistant)/],
    ['migration', /^(changer-de-logiciel|choisir-logiciel)/],
    ['aides', /^(aide-|aides-|subventions-|dja-|s-installer)/],
    ['reglementation', /^(actualites-reglementaires|paquet-vin-europeen)/],
    ['ressources', /^(ressources|faq)\.html$/]
  ];
  var contexte = RUBRIQUES.filter(function (c) { return c[1].test(nom); })[0] || ['generale'];
  var variante = 'visite_interactive_20261118';
  var objectif = 'visite_interactive';
  var TEXTES = {
    fr: {titre:'On vous fait visiter ?',texte:'Entrez dans un domaine, explorez la vigne, le chai et le caveau. Découvrez Mon Chai au fil des lieux et des saisons.',note:'Une visite interactive d’un domaine fictif, à votre rythme et sans inscription.',visite:'Lancer la visite interactive',demo:'Parlons de votre domaine',fermer:'Fermer cette invitation'},
    en: {titre:'Shall we show you around?',texte:'Explore the vineyard, cellar and tasting room, and discover Mon Chai through the seasons.',note:'An interactive tour of a fictional estate. In French, no sign-up required.',visite:'Start the tour · French',demo:'Tell us about your estate',fermer:'Close this invitation'},
    de: {titre:'Dürfen wir Sie herumführen?',texte:'Entdecken Sie Weinberg, Keller und Probierstube und lernen Sie Mon Chai im Lauf der Jahreszeiten kennen.',note:'Interaktive Tour eines fiktiven Weinguts. Auf Französisch, ohne Anmeldung.',visite:'Tour starten · Französisch',demo:'Über Ihr Weingut sprechen',fermer:'Diese Einladung schließen'},
    it: {titre:'Vi facciamo visitare?',texte:'Esplorate la vigna, la cantina e la sala degustazione e scoprite Mon Chai attraverso le stagioni.',note:'Visita interattiva di un’azienda immaginaria. In francese, senza iscrizione.',visite:'Inizia la visita · Francese',demo:'Parliamo della tua azienda',fermer:'Chiudi questo invito'},
    zh: {titre:'带您参观一下？',texte:'探索葡萄园、酒窖和品酒室，在四季变换中了解 Mon Chai。',note:'虚构酒庄的互动导览。法语，无需注册。',visite:'开始导览 · 法语',demo:'聊聊您的酒庄',fermer:'关闭此邀请'}
  };
  var T = TEXTES[langue] || TEXTES.fr;
  var visite = new URL('visite-interactive/', racine);
  var contact = new URL((TEXTES[langue] && langue !== 'fr' ? langue + '/' : '') + 'contact.html?objet=demo#formulaire', racine);
  var CLE = 'monchai_cta_contextes_v1';
  var memoire = { vus: [], pause: false };
  function etat() {
    try {
      var lu = JSON.parse(sessionStorage.getItem(CLE));
      if (lu && Array.isArray(lu.vus)) memoire = lu;
    } catch (e) {}
    return memoire;
  }
  function dejaVue() {
    var e = etat();
    return e.pause || e.vus.indexOf(contexte[0]) !== -1;
  }
  function memoriser(action) {
    var e = etat();
    if (e.vus.indexOf(contexte[0]) === -1) e.vus.push(contexte[0]);
    if (action) e.pause = true;
    try { sessionStorage.setItem(CLE, JSON.stringify(e)); } catch (erreur) {}
  }
  window.addEventListener('monchai:cadeau-ouvert', function () {
    terminee = true;
    clearTimeout(timer);
    fermer();
    memoriser(true);
  });
  window.addEventListener('monchai:cadeau-affiche', function () {
    terminee = true;
    clearTimeout(timer);
  });
  if (dejaVue()) return;

  // Invitation à explorer : présentation courte, visite, contact.
  var logo = new URL('assets/img/logo-header-344.webp', racine).href;
  var signatures = {fr: 'Pensé avec les vignerons', en: 'Built with winegrowers', de: 'Mit Winzern entwickelt', it: 'Creato con i viticoltori', zh: '与葡萄种植者共同打造'};
  var photo = new URL('assets/img/cta-chai.webp', racine).href;
  var CSS = [
    ".mc-cta{position:fixed;right:20px;bottom:20px;z-index:290;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:64px minmax(0,1fr) auto;box-sizing:border-box;width:min(380px,calc(100vw - 40px));max-height:min(370px,55dvh,calc(100dvh - 32px));overflow:hidden;background:#FAF4EA;border:1px solid #D9C5AC;border-radius:12px;box-shadow:0 12px 36px #38251F26;color:#49372F;font-family:Inter,system-ui,sans-serif;animation:mc-cta-entree .3s ease-out;isolation:isolate}",
    ".mc-cta[hidden]{display:none}.mc-cta *{box-sizing:border-box}",
    ".mc-cta__bandeau{position:relative;isolation:isolate;grid-column:1;grid-row:1;min-width:0;overflow:hidden;background:#392B22;border-bottom:1px solid #D9C5AC}.mc-cta__bandeau::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#21160DB3,#21160D26)}.mc-cta__photo{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;object-position:50% 46%}.mc-cta__signature{position:absolute;left:142px;right:60px;top:50%;transform:translateY(-50%);margin:0;color:#FFF3DF;font-size:10px;line-height:1.4}",
    ".mc-cta__logo{position:absolute;top:12px;left:20px;z-index:1;width:104px;height:auto;padding:5px;margin:0;background:#FAF4EA;border:1px solid #D9C5AC;border-radius:3px}.mc-cta__contenu{grid-column:1;grid-row:2;min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;padding:18px 22px 14px;scrollbar-width:thin;scrollbar-color:#B5987C transparent}.mc-cta__titre{margin:0 0 12px;font:400 23px/1.18 'Playfair Display',Georgia,serif;letter-spacing:-.3px;color:#40291F;text-wrap:balance}",
    ".mc-cta__objectif{display:block;margin:0 0 12px;color:#752E33}.mc-cta__prefixe{display:block;margin-bottom:3px;color:#856347;font-size:11px;font-weight:500;line-height:1.4}.mc-cta__valeur{display:block;margin:0 0 4px;font:400 42px/1.05 'Playfair Display',Georgia,serif;letter-spacing:-1px;white-space:nowrap;color:#752E33}.mc-cta__unite{display:block;font-size:12px;font-weight:400;line-height:1.5;color:#5C4235}.mc-cta__annuel{display:block;margin-top:4px;color:#856347;font-size:11px;line-height:1.5}",
    ".mc-cta__texte{margin:0;color:#5F4A3D;font-size:12px;line-height:1.6}.mc-cta__note{margin:10px 0 0;padding-left:10px;border-left:2px solid #CEAF88;color:#766151;font-size:11px;line-height:1.5}",
    ".mc-cta__fermer{position:absolute;z-index:2;top:10px;right:10px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:1px solid #FFF3DF66;border-radius:50%;background:#FAF4EAF2;color:#57372B;font:23px/1 system-ui;cursor:pointer}.mc-cta__fermer:hover{background:#fff}",
    ".mc-cta__actions{grid-column:1;grid-row:3;display:grid;gap:2px;padding:0 22px 10px;background:#FAF4EA}.mc-cta__btn{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:10px 14px;border:1px solid #752E33;border-radius:7px;background:#752E33;color:#FFF9F1;text-decoration:none;text-align:left;font-size:12px;font-weight:500;line-height:1.4}.mc-cta__btn:hover{background:#5C2027}.mc-cta__fleche{font-size:20px;line-height:1;font-weight:400}.mc-cta__btn--secondaire{justify-content:center;padding:8px;border-color:transparent;border-radius:6px;background:transparent;color:#752E33;font-size:11px;font-weight:400;text-decoration:underline;text-decoration-color:#BE9A79;text-underline-offset:4px}.mc-cta__btn--secondaire:hover{background:#EFE4D6}.mc-cta :focus-visible{outline:2px solid #752E33;outline-offset:3px}",
    "@keyframes mc-cta-entree{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    "@media(max-width:639px){.mc-cta{left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));width:auto;max-height:min(320px,42dvh);grid-template-rows:48px minmax(0,1fr) auto}.mc-cta__logo{top:7px;left:18px;width:94px}.mc-cta__signature{left:130px;right:60px;font-size:9px}.mc-cta__fermer{top:2px;right:8px}.mc-cta__contenu{padding:15px 18px 12px}.mc-cta__titre{font-size:22px}.mc-cta__valeur{font-size:38px}.mc-cta__actions{padding:0 18px 8px}}",
    "@media(max-width:360px){.mc-cta__signature{display:none}.mc-cta__titre{font-size:21px}.mc-cta__valeur{font-size:36px}}",
    "@media(max-height:600px) and (min-width:640px){.mc-cta{grid-template-rows:56px minmax(0,1fr) auto}.mc-cta__logo{top:8px}.mc-cta__fermer{top:6px}}",
    "@media(prefers-reduced-motion:reduce){.mc-cta,.mc-cta__btn{animation:none;transition:none}}@media print{.mc-cta{display:none!important}}"
  ].join('\n');

  var carte = null, precedent = null, timer = null, terminee = false;
  function signaler(evenement) {
    if (!window.monchaiConsent || window.monchaiConsent.audience !== true) return;
    (window.dataLayer = window.dataLayer || []).push({ event: evenement, cta_campagne: contexte[0], cta_variante: variante, cta_objectif: objectif, cta_statut: 'invitation_visite' });
  }
  function fermer(raison) {
    if (!carte || carte.hidden) return;
    var focusDedans = carte.contains(document.activeElement);
    carte.hidden = true;
    if (focusDedans) {
      var cible = precedent && precedent.isConnected && precedent !== document.body ? precedent : document.querySelector('main h1, h1, main');
      if (cible) {
        var ancien = cible.getAttribute('tabindex');
        cible.setAttribute('tabindex', '-1');
        cible.focus({ preventScroll: true });
        if (ancien === null) cible.removeAttribute('tabindex');
        else cible.setAttribute('tabindex', ancien);
      }
    }
    if (raison !== 'navigation') signaler('cta_popup_ferme');
  }
  function construire() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    carte = document.createElement('aside');
    carte.className = 'mc-cta';
    carte.setAttribute('data-campagne', contexte[0]);
    carte.setAttribute('data-variante', variante);
    carte.setAttribute('data-objectif', objectif);
    carte.setAttribute('aria-labelledby', 'mcCtaTitre');
    carte.setAttribute('aria-describedby', 'mcCtaTexte mcCtaNote');
    carte.setAttribute('aria-live', 'polite');
    var principal = {id:'visite',texte:T.visite,href:visite.href};
    var secondaire = {id:'demo',texte:T.demo,href:contact.href};
    // Les textes proviennent uniquement du catalogue statique ci-dessus.
    carte.innerHTML = '<button type="button" class="mc-cta__fermer" aria-label="' + T.fermer + '">&times;</button>' +
      '<div class="mc-cta__bandeau"><img class="mc-cta__photo" src="' + photo + '" alt="" width="1000" height="563" decoding="async"><p class="mc-cta__signature">' + (signatures[langue] || signatures.fr) + '</p></div>' +
      '<div class="mc-cta__contenu" role="group" aria-labelledby="mcCtaTitre" tabindex="0"><img class="mc-cta__logo" src="' + logo + '" alt="Mon Chai" width="344" height="111"><h2 class="mc-cta__titre" id="mcCtaTitre">' + T.titre + '</h2>' +
      '<p class="mc-cta__texte" id="mcCtaTexte">' + T.texte + '</p>' +
      '<p class="mc-cta__note" id="mcCtaNote">' + T.note + '</p></div>' +
      '<div class="mc-cta__actions"><a class="mc-cta__btn" data-mc-cta="' + principal.id + '">' + principal.texte + '<span class="mc-cta__fleche" aria-hidden="true">&rarr;</span></a>' +
      '<a class="mc-cta__btn mc-cta__btn--secondaire" data-mc-cta="' + secondaire.id + '">' + secondaire.texte + '</a></div>';
    carte.querySelector('[data-mc-cta="' + principal.id + '"]').href = principal.href;
    carte.querySelector('[data-mc-cta="' + secondaire.id + '"]').href = secondaire.href;
    carte.querySelector('.mc-cta__fermer').addEventListener('click', fermer);
    carte.querySelectorAll('[data-mc-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        memoriser(true);
        signaler('cta_popup_' + a.getAttribute('data-mc-cta'));
        fermer('navigation');
      });
    });
    precedent = document.activeElement;
    document.body.appendChild(carte);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ![].some.call(document.querySelectorAll('[aria-modal="true"], dialog[open]'), visible)) fermer();
    }, true);
  }
  function visible(el) {
    return !!el && !el.hidden && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function occupe() {
    if (document.visibilityState === 'hidden') return true;
    if (visible(document.getElementById('cookieBanner')) || visible(document.getElementById('cookieModal'))) return true;
    if ([].some.call(document.querySelectorAll('[aria-modal="true"], dialog[open], .hd.est-deploye'), visible)) return true;
    var focus = document.activeElement;
    return !!focus && (focus.matches('input, select, textarea') || focus.isContentEditable);
  }
  function declencher() {
    clearTimeout(timer);
    if (terminee || dejaVue()) return;
    if (occupe()) { timer = setTimeout(declencher, 1000); return; }
    terminee = true;
    construire();
    memoriser(false);
    signaler('cta_popup_affiche');
  }
  function demarrer() {
    clearTimeout(timer);
    var ecoule = window.performance ? performance.now() : 0;
    timer = setTimeout(declencher, Math.max(0, 20000 - ecoule));
  }
  window.addEventListener('pagehide', function () { clearTimeout(timer); });
  window.addEventListener('pageshow', function (e) { if (e.persisted && !terminee) demarrer(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer, { once: true });
  else demarrer();
})();
