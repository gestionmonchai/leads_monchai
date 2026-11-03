/* Petite surprise Vinitech-Sifel, campagne du 3 novembre au 3 décembre 2026.
   SVG de 39 px, cible de 44 px ; aucune esquive au clavier ou sur téléphone. */
(function () {
  'use strict';
  var DEBUT = Date.parse('2026-11-03T00:00:00+01:00');
  var FIN = Date.parse('2026-12-04T00:00:00+01:00');
  if (window.self !== window.top || window.monchaiCadeauVinitech || Date.now() < DEBUT || Date.now() >= FIN) return;
  window.monchaiCadeauVinitech = true;
  var CLE = 'monchai_cadeau_vinitech_2026';
  var DUREE_ESQUIVE = 23000;
  var termine = false;
  try { if (sessionStorage.getItem(CLE)) return; } catch (e) {}
  var TEXTES = {
    fr: { label: 'Ouvrir votre cadeau Vinitech-Sifel', gagne: 'Bien joué, vous l’avez attrapé !', cadeau: 'Votre cadeau Mon Chai', invitation: 'Invitation offerte', salon: 'Vinitech-Sifel', dates: 'Bordeaux · 1, 2 et 3 décembre 2026', texte: 'Réservez votre créneau de démonstration Mon Chai et recevez votre invitation au salon.', reserver: 'Réserver mon créneau', suite: 'Votre invitation est liée à la réservation d’une démonstration.', fermer: 'Fermer cette invitation', onglet: 'Ouvre l’agenda dans un nouvel onglet' },
    en: { label: 'Open your Vinitech-Sifel gift', gagne: 'Well done, you caught it!', cadeau: 'Your Mon Chai gift', invitation: 'Your complimentary invitation', salon: 'Vinitech-Sifel', dates: 'Bordeaux · 1–3 December 2026', texte: 'Book your Mon Chai demonstration slot and receive your invitation to the show.', reserver: 'Book my demonstration', suite: 'Your invitation is linked to booking a demonstration.', fermer: 'Close this invitation', onglet: 'Opens the booking calendar in a new tab' },
    de: { label: 'Ihr Vinitech-Sifel-Geschenk öffnen', gagne: 'Gut gemacht, Sie haben es erwischt!', cadeau: 'Ihr Mon Chai Geschenk', invitation: 'Ihre kostenlose Einladung', salon: 'Vinitech-Sifel', dates: 'Bordeaux · 1.–3. Dezember 2026', texte: 'Buchen Sie Ihre Mon Chai Vorführung und erhalten Sie Ihre Einladung zur Messe.', reserver: 'Vorführung buchen', suite: 'Die Einladung ist mit der Buchung einer Vorführung verbunden.', fermer: 'Einladung schließen', onglet: 'Öffnet den Buchungskalender in einem neuen Tab' },
    it: { label: 'Apri il tuo regalo Vinitech-Sifel', gagne: 'Bravo, l’hai preso!', cadeau: 'Il tuo regalo Mon Chai', invitation: 'Il tuo invito in omaggio', salon: 'Vinitech-Sifel', dates: 'Bordeaux · 1–3 dicembre 2026', texte: 'Prenota una dimostrazione Mon Chai e ricevi il tuo invito alla fiera.', reserver: 'Prenota la dimostrazione', suite: 'L’invito è legato alla prenotazione di una dimostrazione.', fermer: 'Chiudi questo invito', onglet: 'Apre il calendario delle prenotazioni in una nuova scheda' },
    zh: { label: '打开您的 Vinitech-Sifel 礼物', gagne: '太棒了，您抓到了！', cadeau: 'Mon Chai 为您准备的礼物', invitation: '免费邀请函', salon: 'Vinitech-Sifel', dates: '波尔多 · 2026年12月1日至3日', texte: '预约 Mon Chai 演示时段，即可获赠展会邀请函。', reserver: '预约演示', suite: '邀请函与演示预约关联。', fermer: '关闭邀请', onglet: '在新标签页打开预约日历' }
  };
  var T = TEXTES[(document.documentElement.lang || 'fr').slice(0, 2).toLowerCase()] || TEXTES.fr;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  var souris = window.matchMedia('(hover: hover) and (pointer: fine)');
  var SVG = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false"><path d="M4 6h24a2 2 0 0 1 2 2v4a4 4 0 0 0 0 8v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a4 4 0 0 0 0-8V8a2 2 0 0 1 2-2Z" fill="#7B1E22" stroke="#DFC18D" stroke-width="1.3"/><path d="M7 8.7h16M7 23.3h16M5 9.5V11M5 21v1.5M27 9.5V11M27 21v1.5" stroke="#DFC18D" stroke-width=".75" stroke-linecap="round"/><path d="M22.3 10v12" stroke="#DFC18D" stroke-width=".8" stroke-dasharray="1.4 1.8"/><path d="m12.3 11.4 1.3 3.1 3.3 1.4-3.3 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.4Z" fill="#DFC18D"/></svg>';
  var CSS = [
    '.mc-gift{--mc-gift-safe-left:env(safe-area-inset-left,0px);--mc-gift-safe-right:env(safe-area-inset-right,0px);--mc-gift-safe-top:env(safe-area-inset-top,0px);position:fixed;left:0;top:0;z-index:85;display:grid;place-items:center;width:44px;height:44px;padding:2.5px;border:0;border-radius:10px;background:transparent;cursor:pointer;opacity:.88;transition:transform .62s cubic-bezier(.22,.61,.36,1);touch-action:manipulation}.mc-gift svg{display:block;width:39px;height:39px;filter:drop-shadow(0 2px 2px #3F211520);transform-origin:50% 70%;animation:mc-gift-tremble 1.8s ease-in-out infinite}.mc-gift:hover{opacity:1}.mc-gift:focus-visible svg{animation-play-state:paused}.mc-gift:focus-visible{outline:2px solid #7B1E22;outline-offset:2px;background:#FBF8F2}.mc-gift[hidden]{display:none}@keyframes mc-gift-tremble{0%,100%{transform:translate(0,0) rotate(-7deg)}15%{transform:translate(1px,-1px) rotate(10deg)}30%{transform:translate(-1.2px,.5px) rotate(-9deg)}45%{transform:translate(1px,0) rotate(8deg)}65%{transform:translate(-.8px,-1px) rotate(-11deg)}82%{transform:translate(.8px,.5px) rotate(9deg)}}',
    '.mc-gift-offer{position:fixed;inset:0;box-sizing:border-box;width:min(478px,calc(100vw - 28px));max-height:calc(100dvh - 28px);margin:auto;padding:10px;overflow:auto;border:1px solid #CDA76A;border-radius:8px;background:#641B2B;color:#4B3B32;box-shadow:0 30px 110px #20071180;font-family:Inter,system-ui,sans-serif}.mc-gift-offer:not([open]){display:none}.mc-gift-offer::backdrop{background:#281019A6;backdrop-filter:blur(7px)}.mc-gift-offer *{box-sizing:border-box}',
    '.mc-gift-offer__close{position:absolute;right:15px;top:15px;z-index:3;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:transparent;color:#6B1C2A;font:25px/1 system-ui;cursor:pointer}.mc-gift-offer__close:hover{background:#7B1E220B}.mc-gift-offer__body{position:relative;isolation:isolate;overflow:hidden;padding:32px 32px 0;border:1px solid #C6A36C;background:radial-gradient(ellipse at 50% 10%,#FFFDF8 0,#F9F2E6 70%,#F3E7D4 100%);text-align:center}.mc-gift-offer__body:before{content:"";position:absolute;z-index:-1;inset:5px;border:1px solid #C6A36C66;pointer-events:none}.mc-gift-offer__vigne{position:absolute;z-index:-1;inset:0;width:100%;height:100%;color:#B18B4F;opacity:.24;pointer-events:none}.mc-gift-offer__brand{margin:0 35px 10px;color:#6B1C2A;font:400 28px/1.15 Georgia,"Times New Roman",serif;letter-spacing:.02em}.mc-gift-offer__kicker{margin:0 auto;color:#805D31;font:500 10px/1.5 Inter,system-ui,sans-serif;letter-spacing:.04em}',
    '.mc-gift-offer__embleme{position:relative;display:grid;place-items:center;width:52px;height:52px;margin:22px auto 16px;border:1px solid #C6A36C;border-radius:50%;background:linear-gradient(135deg,#F8E9CA,#FFF9ED 50%,#EAD0A1);box-shadow:inset 0 0 0 4px #FFFBF099,0 3px 9px #845A3020}.mc-gift-offer__embleme svg{width:34px;height:34px;transform:rotate(-10deg)}.mc-gift-offer__embleme:before,.mc-gift-offer__embleme:after{content:"";position:absolute;top:25px;width:62px;height:1px;background:linear-gradient(90deg,transparent,#B99961);right:calc(100% + 14px)}.mc-gift-offer__embleme:after{left:calc(100% + 14px);right:auto;transform:rotate(180deg)}.mc-gift-offer__titre{margin:0;color:#6B1C2A;font:italic 400 44px/1.08 Georgia,"Times New Roman",serif;letter-spacing:-1.2px;text-wrap:balance;overflow-wrap:break-word}.mc-gift-offer__ticket{position:relative;margin:20px 0 18px;padding:18px 8px;border-top:1px solid #C6A36C99;border-bottom:1px solid #C6A36C99}.mc-gift-offer__ticket strong{display:block;color:#6B1C2A;font:400 30px/1.15 Georgia,"Times New Roman",serif;letter-spacing:.01em}.mc-gift-offer__ticket span{display:block;margin-top:10px;color:#66503C;font-size:12px;line-height:1.5;letter-spacing:.02em}.mc-gift-offer__texte{max-width:330px;margin:0 auto;color:#574538;font-size:13px;line-height:1.75;text-wrap:pretty}',
    '.mc-gift-offer__booking{position:relative;margin:24px -32px 0;padding:23px 28px 24px;background:linear-gradient(130deg,#731F31,#511323);border-top:1px solid #C6A36C}.mc-gift-offer__reserver{display:flex;align-items:center;justify-content:center;gap:14px;min-height:48px;padding:13px 18px;border:1px solid #E5C68F;border-radius:3px;background:linear-gradient(110deg,#F4E3BC,#E8CA93);color:#511323;text-decoration:none;font-size:14px;font-weight:650;line-height:1.4;box-shadow:0 5px 16px #20071130}.mc-gift-offer__reserver:hover{background:#FFF0CE;color:#511323}.mc-gift-offer__reserver span{font-size:20px;line-height:1}.mc-gift-offer__note{max-width:330px;margin:12px auto 0;color:#F2DDC2;font-size:10px;line-height:1.6}.mc-gift-offer :focus-visible{outline:2px solid #7B1E22;outline-offset:3px}.mc-gift-offer__booking :focus-visible{outline-color:#F4DEAF}',
    '@media(max-width:380px){.mc-gift-offer{padding:7px}.mc-gift-offer__body{padding:28px 20px 0}.mc-gift-offer__brand{font-size:26px}.mc-gift-offer__titre{font-size:36px}.mc-gift-offer__ticket strong{font-size:27px}.mc-gift-offer__booking{margin-left:-20px;margin-right:-20px;padding:20px}.mc-gift-offer__close{right:10px;top:10px}}@media(max-height:650px){.mc-gift-offer__body{padding-top:23px}.mc-gift-offer__brand{font-size:24px;margin-bottom:6px}.mc-gift-offer__embleme{width:38px;height:38px;margin:13px auto 12px}.mc-gift-offer__embleme svg{width:27px;height:27px}.mc-gift-offer__embleme:before,.mc-gift-offer__embleme:after{top:18px}.mc-gift-offer__titre{font-size:34px}.mc-gift-offer__ticket{margin:14px 0;padding:12px 4px}.mc-gift-offer__ticket strong{font-size:26px}.mc-gift-offer__ticket span{margin-top:7px}.mc-gift-offer__texte{font-size:12px;line-height:1.6}.mc-gift-offer__booking{margin-top:17px;padding-top:17px;padding-bottom:18px}}',
    '@media(max-width:600px){.mc-gift-offer:lang(en) .mc-gift-offer__titre{font-size:34px;letter-spacing:-.8px}}@media(max-width:380px){.mc-gift-offer:lang(en) .mc-gift-offer__titre{font-size:29px}}',
    '@media(prefers-reduced-motion:reduce){.mc-gift{transition:none}.mc-gift svg{animation:none}}@media print{.mc-gift,.mc-gift-offer{display:none!important}}'
  ].join('\n');

  var bouton = null, offre = null, position = null, focusAvant = null;
  var apparu = false, timer = null, finJeu = null, debutJeu = null, dernierMouvement = -Infinity;
  var apprivoise = false, ignorerClic = false, frame = null, secteur = Math.random() < .5 ? 'haut' : 'milieu';
  var popupEtaitVisible = false, reposPopupJusqua = 0;
  var attente = 50000 + Math.floor(Math.random() * 10001);
  function memoriser() {
    termine = true;
    try { sessionStorage.setItem(CLE, 'decouvert'); } catch (e) {}
  }
  function signaler(event) {
    if (window.monchaiConsent && window.monchaiConsent.audience === true) {
      (window.dataLayer = window.dataLayer || []).push({ event: event, cta_campagne: 'vinitech_2026' });
    }
  }
  function visible(el) { return !!el && !el.hidden && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; }
  function occupe() {
    if (document.visibilityState === 'hidden') return true;
    if ([].some.call(document.querySelectorAll('.mc-cta'), visible)) { popupEtaitVisible = true; return true; }
    if (popupEtaitVisible) { popupEtaitVisible = false; reposPopupJusqua = performance.now() + 5000; }
    if (performance.now() < reposPopupJusqua) return true;
    if (visible(document.getElementById('cookieBanner')) || visible(document.getElementById('cookieModal'))) return true;
    if ([].some.call(document.querySelectorAll('[aria-modal="true"],dialog[open],.hd.est-deploye'), visible)) return true;
    var focus = document.activeElement;
    return !!focus && (focus.matches('input,select,textarea') || focus.isContentEditable);
  }
  function zone(emplacement) {
    var largeur = document.documentElement.clientWidth, hauteur = window.innerHeight;
    if (!document.querySelector('main,.page') || largeur < 120 || hauteur < 180) return null;
    var style = getComputedStyle(bouton);
    var gauche = Math.max(28, largeur * .08, (parseFloat(style.getPropertyValue('--mc-gift-safe-left')) || 0) + 16);
    var droite = Math.min(largeur - 60 - (parseFloat(style.getPropertyValue('--mc-gift-safe-right')) || 0), largeur * .34, gauche + 220);
    var haut = Math.max(96, (parseFloat(style.getPropertyValue('--mc-gift-safe-top')) || 0) + 16);
    [].forEach.call(document.querySelectorAll('.hd,.site-header,.mobile-header'), function (el) {
      if (visible(el)) haut = Math.max(haut, el.getBoundingClientRect().bottom + 16);
    });
    var milieu = (emplacement || secteur) === 'milieu';
    var bas = Math.min(hauteur - 72, hauteur * (milieu ? .68 : .34));
    haut = Math.max(haut, hauteur * (milieu ? .38 : .14));
    if (droite < gauche || bas < haut) return null;
    return { left: gauche, right: droite, top: haut, bottom: bas };
  }
  function sure(x, y) {
    var interdits = 'a,button,input,select,textarea,summary,iframe,video,audio,[role="button"],[contenteditable="true"],.hd,.site-header,.mobile-header,.mc-cta,.cookie,.cookie-modal';
    return [[3, 3], [41, 3], [22, 22], [3, 41], [41, 41]].every(function (p) {
      var pile = document.elementsFromPoint(x + p[0], y + p[1]);
      var el = pile.filter(function (n) { return !n.closest('.mc-gift'); })[0];
      return el && !el.closest(interdits);
    });
  }
  function deplacer(x, y) {
    position = { x: x, y: y };
    bouton.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }
  function placer(eviter) {
    var secteurs = eviter ? [secteur] : [secteur, secteur === 'haut' ? 'milieu' : 'haut'];
    for (var j = 0; j < secteurs.length; j++) {
      var z = zone(secteurs[j]);
      if (!z) continue;
      for (var i = 0; i < 80; i++) {
        var x = Math.round(z.left + Math.random() * (z.right - z.left));
        var y = Math.round(z.top + Math.random() * (z.bottom - z.top));
        if (eviter && (Math.hypot(x + 22 - eviter.x, y + 22 - eviter.y) < 68 || (position && Math.hypot(x - position.x, y - position.y) < 58))) continue;
        if (!sure(x, y)) continue;
        secteur = secteurs[j];
        deplacer(x, y);
        return true;
      }
    }
    return false;
  }
  function terminerJeu() { apprivoise = true; clearTimeout(finJeu); }
  function esquiver(e) {
    if (e.pointerType !== 'mouse' || !souris.matches || reduit.matches || apprivoise || termine) return false;
    var maintenant = performance.now();
    if (debutJeu === null) {
      debutJeu = maintenant;
      finJeu = setTimeout(terminerJeu, DUREE_ESQUIVE);
    }
    if (maintenant - debutJeu >= DUREE_ESQUIVE) { terminerJeu(); return false; }
    if (maintenant - dernierMouvement < 760 || maintenant - debutJeu > DUREE_ESQUIVE - 700) return false;
    if (placer({ x: e.clientX, y: e.clientY })) {
      dernierMouvement = maintenant;
      return true;
    }
    terminerJeu();
    return false;
  }
  function retourFocus() {
    var cible = focusAvant && focusAvant.isConnected && focusAvant !== document.body && visible(focusAvant) ? focusAvant : document.querySelector('main h1,h1,main');
    if (!cible) return;
    var ancien = cible.getAttribute('tabindex');
    cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
    if (ancien === null) cible.removeAttribute('tabindex');
    else cible.setAttribute('tabindex', ancien);
  }
  function ouvrir() {
    if (termine || Date.now() >= FIN) return;
    terminerJeu();
    memoriser();
    bouton.hidden = true;
    window.dispatchEvent(new CustomEvent('monchai:cadeau-ouvert'));
    offre = document.createElement('dialog');
    offre.className = 'mc-gift-offer';
    offre.setAttribute('aria-labelledby', 'mcGiftTitle');
    offre.setAttribute('aria-describedby', 'mcGiftDescription');
    offre.innerHTML = '<button class="mc-gift-offer__close" type="button" aria-label="' + T.fermer + '">&times;</button>' +
      '<div class="mc-gift-offer__body"><svg class="mc-gift-offer__vigne" viewBox="0 0 450 620" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false"><path d="M8 245C65 205 12 142 45 80S120 40 145 8M442 370c-57 40-4 103-37 165s-75 40-100 72"/><path d="M35 106c-28-10-30-35-20-54 22 6 32 25 20 54Zm4-20c30-3 45-19 42-39-27 0-44 16-42 39ZM29 166C5 157 0 137 10 120c22 6 30 23 19 46Zm0-15c27 1 42-12 43-31-24-5-41 10-43 31Zm386 364c28 10 30 35 20 54-22-6-32-25-20-54Zm-4 20c-30 3-45 19-42 39 27 0 44-16 42-39Z"/><path d="M61 59c-2-26 14-39 34-40 6 23-8 40-34 40ZM389 556c2 26-14 39-34 40-6-23 8-40 34-40Z"/><circle cx="44" cy="193" r="4"/><circle cx="53" cy="191" r="4"/><circle cx="49" cy="201" r="4"/><circle cx="405" cy="424" r="4"/><circle cx="396" cy="426" r="4"/><circle cx="401" cy="416" r="4"/></svg>' +
      '<p class="mc-gift-offer__brand">Mon Chai</p><p class="mc-gift-offer__kicker">' + T.gagne + '</p>' +
      '<div class="mc-gift-offer__embleme" aria-hidden="true">' + SVG + '</div><h2 class="mc-gift-offer__titre" id="mcGiftTitle">' + T.invitation + '</h2>' +
      '<div class="mc-gift-offer__ticket"><strong>' + T.salon + '</strong><span>' + T.dates + '</span></div>' +
      '<p class="mc-gift-offer__texte" id="mcGiftDescription">' + T.texte + '</p>' +
      '<div class="mc-gift-offer__booking"><a class="mc-gift-offer__reserver" href="https://mon-chai.neetocal.com/demo-vinitech" target="_blank" rel="noopener noreferrer" title="' + T.onglet + '">' + T.reserver + '<span aria-hidden="true">&rarr;</span></a>' +
      '<p class="mc-gift-offer__note">' + T.suite + '</p></div></div>';
    document.body.appendChild(offre);
    offre.querySelector('button').addEventListener('click', function () { offre.close(); });
    offre.addEventListener('click', function (e) {
      var r = offre.getBoundingClientRect();
      if (e.target === offre && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) offre.close();
    });
    offre.addEventListener('close', function () { signaler('cadeau_vinitech_ferme'); retourFocus(); });
    offre.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var controles = offre.querySelectorAll('button,a[href]');
      var premier = controles[0], dernier = controles[controles.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    });
    offre.querySelector('a').addEventListener('click', function () { signaler('cadeau_vinitech_reservation'); });
    offre.showModal();
    signaler('cadeau_vinitech_ouvert');
  }
  function construire() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'mc-gift';
    bouton.hidden = true;
    bouton.setAttribute('aria-label', T.label);
    bouton.setAttribute('aria-haspopup', 'dialog');
    bouton.innerHTML = SVG;
    document.body.appendChild(bouton);
    bouton.addEventListener('pointerenter', esquiver);
    bouton.addEventListener('pointerdown', function (e) {
      ignorerClic = false;
      if (e.pointerType !== 'mouse') { terminerJeu(); return; }
      if (!reduit.matches && souris.matches && !apprivoise) {
        esquiver(e);
        if (!apprivoise && debutJeu !== null && performance.now() - debutJeu < DUREE_ESQUIVE) { ignorerClic = true; e.preventDefault(); }
      }
    });
    bouton.addEventListener('focus', terminerJeu);
    bouton.addEventListener('click', function (e) {
      if (ignorerClic && e.detail !== 0) { ignorerClic = false; return; }
      ouvrir();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && apparu && !termine && !occupe()) {
        var dedans = document.activeElement === bouton;
        memoriser(); bouton.hidden = true; terminerJeu();
        if (dedans) retourFocus();
        signaler('cadeau_vinitech_ferme');
      }
    });
  }
  function actualiser() {
    frame = null;
    if (!apparu || termine || !bouton) return;
    if (Date.now() >= FIN || occupe()) { masquer(true); return; }
    var z = zone();
    if (!z) { masquer(true); return; }
    if (!position || position.x < z.left || position.x > z.right || position.y < z.top || position.y > z.bottom || !sure(position.x, position.y)) {
      if (!placer()) { masquer(true); return; }
    }
    masquer(false);
  }
  function masquer(cache) { if (bouton.hidden !== cache) bouton.hidden = cache; }
  function demanderActualisation() { if (!frame) frame = requestAnimationFrame(actualiser); }
  function declencher() {
    clearTimeout(timer);
    if (termine || apparu || Date.now() >= FIN) return;
    if (occupe()) { timer = setTimeout(declencher, 1000); return; }
    if (!bouton) construire();
    if (!placer()) { timer = setTimeout(declencher, 1000); return; }
    focusAvant = document.activeElement;
    apparu = true;
    bouton.hidden = false;
    window.dispatchEvent(new CustomEvent('monchai:cadeau-affiche'));
    signaler('cadeau_vinitech_affiche');
    window.addEventListener('scroll', demanderActualisation, { passive: true });
    window.addEventListener('resize', function () { position = null; demanderActualisation(); });
    document.addEventListener('visibilitychange', demanderActualisation);
    document.addEventListener('focusin', demanderActualisation);
    document.addEventListener('focusout', demanderActualisation);
    document.addEventListener('click', demanderActualisation);
    new MutationObserver(demanderActualisation).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden', 'open', 'class'] });
  }
  function demarrer() { timer = setTimeout(declencher, Math.max(0, attente - performance.now())); }
  window.addEventListener('pagehide', function () { clearTimeout(timer); clearTimeout(finJeu); });
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    try { if (sessionStorage.getItem(CLE)) { termine = true; if (bouton) bouton.hidden = true; } } catch (erreur) {}
    if (!apparu && !termine) demarrer();
    else if (!termine) { terminerJeu(); actualiser(); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer, { once: true });
  else demarrer();
})();
