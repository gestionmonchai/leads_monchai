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

  var CONTEXTES = [
    ['recolte', /^declaration-recolte(?:-|\.)/, 'Votre déclaration de récolte dans Mon Chai', 'Regroupez vos vendanges et préparez votre récapitulatif de récolte dans un seul outil.'],
    ['tarifs', /^tarifs\.html$/, 'Découvrez les économies possibles avec Mon Chai', 'Comparez le coût de vos outils actuels avec une gestion réunie dans Mon Chai, selon les besoins de votre domaine.'],
    ['drm', /^(drm-|dae-daes-|actualites-douane-)/, 'Votre DRM se prépare au fil du travail', 'Retrouvez vos mouvements de cave et préparez votre déclaration mensuelle dans Mon Chai.'],
    ['vigne', /^(vigne-vendanges|cahier-de-culture|registre-phyto|ift-viticulture|actualites-vigne)/, 'De vos parcelles à vos vendanges', 'Parcelles, interventions et réceptions de vendanges : retrouvez le suivi de votre vigne dans Mon Chai.'],
    ['cave', /^(cave-vinification|registre-de-cave|actualites-cave)/, 'Votre cave, un suivi clair au quotidien', 'Retrouvez vos cuves, vos lots et vos opérations de vinification dans un même logiciel.'],
    ['stocks', /^(stocks-tracabilite|tracabilite-lots)/, 'Savez-vous où en sont vos stocks ?', 'Suivez vos vins, vos bouteilles et leurs mouvements dans Mon Chai.'],
    ['mises', /^(mises-conditionnement|actualites-etiquetage|ppwr-vin)/, 'Préparez votre prochaine mise dans Mon Chai', 'Reliez votre mise en bouteille aux lots, aux matières sèches et au suivi des stocks.'],
    ['ventes', /^(ventes-clients|vente-directe|facturation-electronique|actualites-ventes)/, 'De votre client à votre facture', 'Retrouvez vos clients, vos ventes et vos documents commerciaux dans un seul outil.'],
    ['couts', /^(cout-|cout-de-|charges-indirectes|marge-vin|investir-leviers|activations-locales)/, 'Comprenez le coût de vos vins', 'Rassemblez vos données de production et de vente pour suivre vos coûts et vos marges dans Mon Chai.'],
    ['oenotourisme', /^(oenotourisme|actualites-oenotourisme)/, 'Reliez vos dégustations à vos ventes', 'Découvrez comment Mon Chai accompagne vos dégustations et le suivi de vos clients.'],
    ['assistant', /^(ia-au-service|ce-que-votre-assistant)/, 'Un assistant pour vous guider dans Mon Chai', 'Posez votre question et retrouvez les étapes pour avancer dans le logiciel.'],
    ['migration', /^(changer-de-logiciel|choisir-logiciel)/, 'Et si vous passiez à Mon Chai ?', 'Échangeons sur vos outils, vos données à reprendre et les besoins de votre domaine.'],
    ['aides', /^(aide-|aides-|dja-|s-installer)/, 'Un outil simple pour gérer votre domaine', 'Découvrez Mon Chai et échangeons sur votre organisation et vos besoins.']
  ];
  var contexte = CONTEXTES.filter(function (c) { return c[1].test(nom); })[0] ||
    ['generale', null, 'Et si votre gestion devenait plus simple ?', 'De la vigne à la vente, découvrez un logiciel accessible, construit avec les vignerons.'];

  // Les pages traduites gardent une invitation entièrement dans leur langue.
  var TEXTES = {
    fr: { titre: contexte[2], texte: contexte[3], essai: 'Essayer Mon Chai', demo: 'Demander une démonstration', fermer: 'Fermer cette invitation', note: 'Découvrez Mon Chai à votre rythme.' },
    en: { titre: 'Simplify your estate management', texte: 'From vineyard to sales, discover one accessible tool built with winegrowers.', essai: 'Try Mon Chai', demo: 'Request a demonstration', fermer: 'Close this invitation', note: 'Discover Mon Chai at your own pace.' },
    de: { titre: 'Verwalten Sie Ihr Weingut einfacher', texte: 'Vom Weinberg bis zum Verkauf: Entdecken Sie eine zugängliche Software, gemeinsam mit Winzern entwickelt.', essai: 'Mon Chai testen', demo: 'Vorführung anfragen', fermer: 'Diese Einladung schließen', note: 'Entdecken Sie Mon Chai in Ihrem eigenen Tempo.' },
    it: { titre: 'Semplifica la gestione della tua azienda', texte: 'Dalla vigna alla vendita, scopri un software accessibile, sviluppato con i viticoltori.', essai: 'Prova Mon Chai', demo: 'Richiedi una dimostrazione', fermer: 'Chiudi questo invito', note: 'Scopri Mon Chai al tuo ritmo.' },
    zh: { titre: '让酒庄管理更简单', texte: '从葡萄园到销售，了解与葡萄种植者共同打造的实用软件。', essai: '试用 Mon Chai', demo: '申请演示', fermer: '关闭此邀请', note: '按照自己的节奏了解 Mon Chai。' }
  };
  var T = TEXTES[langue] || TEXTES.fr;
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
  if (dejaVue()) return;

  var CSS = [
    '.mc-cta{position:fixed;right:24px;bottom:24px;z-index:290;box-sizing:border-box;width:min(390px,calc(100vw - 32px));max-height:calc(100dvh - 48px);overflow:auto;padding:24px;background:#FFFCF8;border:1px solid #E7D3BC;border-top:3px solid #A85D35;border-radius:16px;box-shadow:0 16px 48px #47131826;color:#2E2826;font-family:Inter,system-ui,sans-serif;animation:mc-cta-entree .25s ease-out;}',
    '.mc-cta[hidden]{display:none}.mc-cta *{box-sizing:border-box}.mc-cta__fermer{position:absolute;top:4px;right:4px;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:#7B1E22;font:26px/1 system-ui;cursor:pointer}.mc-cta__fermer:hover{background:#F8EFE4}',
    '.mc-cta__titre{margin:0 22px 10px 0;font:600 23px/1.25 "Playfair Display",Georgia,serif;color:#7B1E22}.mc-cta__texte{margin:0 0 18px;font-size:14px;line-height:1.55}.mc-cta__actions{display:grid;gap:8px}',
    '.mc-cta__btn{display:flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border:1px solid #7B1E22;border-radius:24px;background:#7B1E22;color:#fff;text-decoration:none;text-align:center;font-size:14px;font-weight:600;line-height:1.35}.mc-cta__btn:hover{background:#5F171B}.mc-cta__btn--secondaire{background:transparent;color:#7B1E22}.mc-cta__btn--secondaire:hover{background:#F8EFE4}',
    '.mc-cta__note{margin:12px 0 0;color:#625650;font-size:12px;line-height:1.4;text-align:center}.mc-cta :focus-visible{outline:3px solid #7B1E22;outline-offset:3px}',
    '@keyframes mc-cta-entree{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
    '@media(max-width:639px){.mc-cta{left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));width:auto;max-height:45dvh;padding:18px 16px 14px;border-radius:14px}.mc-cta__titre{font-size:19px;margin-bottom:8px;padding-right:8px}.mc-cta__texte{font-size:13px;line-height:1.4;margin-bottom:12px}.mc-cta__note{display:none}.mc-cta__actions{gap:6px}}',
    '@media(prefers-reduced-motion:reduce){.mc-cta{animation:none}}@media print{.mc-cta{display:none!important}}'
  ].join('\n');

  var carte = null, precedent = null, timer = null, terminee = false;
  function signaler(evenement) {
    if (!window.monchaiConsent || window.monchaiConsent.audience !== true) return;
    (window.dataLayer = window.dataLayer || []).push({ event: evenement, cta_campagne: contexte[0] });
  }
  function fermer() {
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
    signaler('cta_popup_ferme');
  }
  function construire() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    carte = document.createElement('aside');
    carte.className = 'mc-cta';
    carte.setAttribute('data-campagne', contexte[0]);
    carte.setAttribute('aria-labelledby', 'mcCtaTitre');
    carte.setAttribute('aria-describedby', 'mcCtaTexte');
    carte.setAttribute('aria-live', 'polite');
    // Tous les textes viennent du catalogue statique ci-dessus.
    carte.innerHTML = '<button type="button" class="mc-cta__fermer" aria-label="' + T.fermer + '">&times;</button>' +
      '<h2 class="mc-cta__titre" id="mcCtaTitre">' + T.titre + '</h2>' +
      '<p class="mc-cta__texte" id="mcCtaTexte">' + T.texte + '</p>' +
      '<div class="mc-cta__actions"><a class="mc-cta__btn" href="https://tester.monchai.fr" data-mc-cta="essai">' + T.essai + '</a>' +
      '<a class="mc-cta__btn mc-cta__btn--secondaire" data-mc-cta="demo">' + T.demo + '</a></div>' +
      '<p class="mc-cta__note">' + T.note + '</p>';
    carte.querySelector('[data-mc-cta="demo"]').href = contact.href;
    carte.querySelector('.mc-cta__fermer').addEventListener('click', fermer);
    carte.querySelectorAll('[data-mc-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        memoriser(true);
        signaler('cta_popup_' + a.getAttribute('data-mc-cta'));
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
