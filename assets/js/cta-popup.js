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
  cadeauVinitech.src = new URL('cadeau-vinitech.js?v=20261103', balise.src).href;
  document.head.appendChild(cadeauVinitech);

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
  window.addEventListener('monchai:cadeau-ouvert', function () {
    terminee = true;
    clearTimeout(timer);
    fermer();
    memoriser(true);
  });
  if (dejaVue()) return;

  // Reprise du modèle « Pop-up inscription » : vignoble estompé, crème,
  // titre sans empattement bordeaux/cuivre et boutons en pilule.
  var photo = new URL('assets/img/hero-fond-960.webp', racine).href;
  var logo = new URL('assets/img/logo-header-344.webp', racine).href;
  var signatures = {fr: 'Pensé avec les vignerons', en: 'Built with winegrowers', de: 'Mit Winzern entwickelt', it: 'Creato con i viticoltori', zh: '与葡萄种植者共同打造'};
  var CSS = [
    '.mc-cta{position:fixed;right:24px;bottom:24px;z-index:290;display:grid;grid-template-columns:132px minmax(0,1fr);box-sizing:border-box;width:min(510px,calc(100vw - 40px));max-height:calc(100dvh - 48px);overflow:auto;background:#FBF8F2;border:1px solid #EADCC9;border-radius:24px;box-shadow:0 24px 70px #47131830,0 4px 16px #4713180c;color:#433C35;font-family:Inter,system-ui,sans-serif;animation:mc-cta-entree .3s cubic-bezier(.2,.9,.3,1);isolation:isolate}',
    '.mc-cta[hidden]{display:none}.mc-cta *{box-sizing:border-box}.mc-cta__visuel{position:relative;min-height:100%;background:linear-gradient(180deg,#F5F0E8 0%,#F5F0E8E8 23%,#F5F0E855 65%,#F5F0E826 100%),url("' + photo + '") 45% bottom/auto 100%;border-right:1px solid #EADCC9}.mc-cta__logo{position:absolute;top:28px;left:14px;width:104px;height:auto;mix-blend-mode:multiply}.mc-cta__visuel:after{content:"";position:absolute;left:24px;right:24px;top:85px;height:1px;background:#C9915966}',
    '.mc-cta__contenu{min-width:0;padding:28px 26px 22px}.mc-cta__signature{margin:0 22px 14px 0;color:#8F5D31;font:600 9px/1.5 Poppins,Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase}.mc-cta__titre{margin:0 0 14px;font:600 25px/1.17 Poppins,Inter,system-ui,sans-serif;letter-spacing:-.8px;color:#7B1E22}.mc-cta__titre span{color:#A46C38}.mc-cta__texte{margin:0 0 22px;color:#5B524A;font-size:13px;line-height:1.65}',
    '.mc-cta__fermer{position:absolute;z-index:2;top:6px;right:6px;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:#7B1E22;font:24px/1 system-ui;cursor:pointer}.mc-cta__fermer:hover{background:#7B1E2209}.mc-cta__actions{display:grid;gap:9px}',
    '.mc-cta__btn{display:flex;align-items:center;justify-content:center;gap:12px;min-height:46px;padding:11px 14px;border:1px solid #7B1E22;border-radius:30px;background:#7B1E22;color:#fff;text-decoration:none;text-align:center;font-size:13px;font-weight:600;line-height:1.4;box-shadow:0 7px 18px #7B1E2226;transition:background .2s,box-shadow .2s}.mc-cta__btn:hover{background:#64181C;box-shadow:0 9px 22px #7B1E2233}.mc-cta__fleche{font-size:20px;line-height:1;font-weight:400}.mc-cta__btn--secondaire{background:transparent;border-color:#D8BFA7;color:#7B1E22;box-shadow:none}.mc-cta__btn--secondaire:hover{background:#F4EBDF;box-shadow:none}',
    '.mc-cta__note{margin:18px 0 0;padding-top:13px;border-top:1px solid #E7D8C5;color:#76695E;font-size:10px;line-height:1.4;text-align:center}.mc-cta :focus-visible{outline:3px solid #7B1E22;outline-offset:3px}',
    '@keyframes mc-cta-entree{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '@media(max-width:639px){.mc-cta{left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));width:auto;grid-template-columns:1fr;max-height:45dvh;border-radius:20px}.mc-cta__visuel{min-height:52px;background:linear-gradient(90deg,#F5F0E8 8%,#F5F0E8DD 38%,#F5F0E822 100%),url("' + photo + '") 75% 48%/cover;border-right:0;border-bottom:1px solid #E7D8C5}.mc-cta__logo{top:8px;left:18px;width:108px}.mc-cta__visuel:after{display:none}.mc-cta__contenu{padding:16px 18px 18px}.mc-cta__signature{display:none}.mc-cta__titre{font-size:21px;line-height:1.2;letter-spacing:-.6px;margin-bottom:10px}.mc-cta__texte{font-size:12px;line-height:1.5;margin-bottom:16px}.mc-cta__actions{gap:7px}.mc-cta__btn{min-height:44px;padding:10px 12px;font-size:13px}.mc-cta__note{display:none}.mc-cta__fermer{top:4px;right:4px;background:#FBF8F2E8}}',
    '@media(max-width:360px){.mc-cta__contenu{padding:14px}.mc-cta__titre{font-size:19px}.mc-cta__visuel{min-height:46px}.mc-cta__logo{top:7px;width:98px}}',
    '@media(max-height:700px) and (max-width:639px){.mc-cta{max-height:55dvh}}',
    '@media(prefers-reduced-motion:reduce){.mc-cta,.mc-cta__btn{animation:none;transition:none}}@media print{.mc-cta{display:none!important}}'
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
      '<div class="mc-cta__visuel" aria-hidden="true"><img class="mc-cta__logo" src="' + logo + '" alt="" width="344" height="111"></div>' +
      '<div class="mc-cta__contenu"><p class="mc-cta__signature">' + (signatures[langue] || signatures.fr) + '</p>' +
      '<h2 class="mc-cta__titre" id="mcCtaTitre">' + T.titre.replace('Mon Chai', '<span>Mon Chai</span>') + '</h2>' +
      '<p class="mc-cta__texte" id="mcCtaTexte">' + T.texte + '</p>' +
      '<div class="mc-cta__actions"><a class="mc-cta__btn" href="https://tester.monchai.fr" data-mc-cta="essai">' + T.essai + '<span class="mc-cta__fleche" aria-hidden="true">&rarr;</span></a>' +
      '<a class="mc-cta__btn mc-cta__btn--secondaire" data-mc-cta="demo">' + T.demo + '</a></div>' +
      '<p class="mc-cta__note">' + T.note + '</p></div>';
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
