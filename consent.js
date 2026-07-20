/* =========================================================
   Mon Chai — consentement cookies (conforme CNIL)
   SOURCE UNIQUE : ce fichier porte TOUTE la gestion du consentement
   (remplace hubspot-consent.js + la section cookies de script.js).

   Phase 1 (synchrone, AVANT le chargement du traceur HubSpot) :
   lit le choix enregistré et pousse doNotTrack en conséquence.
   Phase 2 (au DOMContentLoaded) : injecte le bandeau, le panneau de
   réglages et leurs styles, puis câble tous les boutons [data-cookies].

   Le HTML et le CSS du bandeau vivent ici et nulle part ailleurs :
   toute page qui charge ce script est couverte, y compris les pages
   légales qui n'ont ni styles.css ni le DOM de la landing.

   Cookies strictement nécessaires : toujours actifs, sans consentement.
   Mesure d'audience + tiers : soumis au consentement. Choix conservé
   6 mois, réouvrable via « Gérer mes cookies ».
   ========================================================= */
(function () {
  var CLE = 'monchai_cookie_consent';
  var SIX_MOIS = 1000 * 60 * 60 * 24 * 182;

  function lire() {
    try {
      var d = JSON.parse(localStorage.getItem(CLE));
      if (!d || !d.ts || Date.now() - d.ts > SIX_MOIS) return null;   // expiré
      return d;
    } catch (e) { return null; }
  }

  /* ---------- Phase 1 : avant le traceur HubSpot ---------- */
  // Mon Chai gère le consentement avec son propre bandeau.
  window.disableHubSpotCookieBanner = true;
  window._hsq = window._hsq || [];

  var initial = lire();
  // Cette commande est traitée par HubSpot dès le chargement du traceur.
  // Sans accord préalable, aucune donnée analytics n'est envoyée.
  if (initial && initial.audience) {
    window._hsq.push(['doNotTrack', { track: true }]);
  } else {
    window._hsq.push(['doNotTrack']);
  }

  /* ---------- Phase 2 : bandeau + réglages ----------
     Bandeau volontairement compact (≤ ~25 % de la hauteur d'écran à 320 px) :
     texte court, « Personnaliser » en lien dans le texte, et « Refuser »
     présenté exactement comme « Tout accepter » (exigence CNIL d'équivalence). */
  var CSS = [
    '.cookie{position:fixed;left:0;right:0;bottom:0;z-index:300;display:flex;align-items:center;gap:10px 24px;flex-wrap:wrap;padding:14px 16px calc(14px + env(safe-area-inset-bottom));background:#fff;box-shadow:0 -12px 40px rgba(33,27,24,.16);border-top:2px solid #DFB780;font-family:"Inter",system-ui,-apple-system,sans-serif;}',
    '.cookie[hidden]{display:none;}',
    '.cookie__texte{flex:1 1 300px;}',
    '.cookie__texte p{font-size:12.5px;line-height:1.4;color:#6E625C;margin:0;}',
    '.cookie__texte strong{color:#7B1E22;}',
    '.cookie__texte a{color:#7B1E22;}',
    '.cookie__perso{padding:0;border:0;background:none;color:#7B1E22;font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;}',
    '.cookie__actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;width:100%;}',
    '.cookie__btn{padding:11px 14px;border-radius:999px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;border:1.5px solid #7B1E22;transition:background-color .2s ease;}',
    '.cookie__btn--ghost{background:#fff;color:#7B1E22;}',
    '.cookie__btn--ghost:hover{background:rgba(123,30,34,.06);}',
    '.cookie__btn--plein{background:#7B1E22;color:#fff;}',
    '.cookie__btn--plein:hover{background:#671519;}',
    '@media (min-width:821px){.cookie{padding:16px 28px;}.cookie__actions{display:flex;width:auto;}.cookie__actions .cookie__btn{width:154px;min-width:154px;padding:12px 20px;}}',
    '.cookie-modal{position:fixed;inset:0;z-index:310;display:flex;align-items:center;justify-content:center;padding:24px;font-family:"Inter",system-ui,-apple-system,sans-serif;}',
    '.cookie-modal[hidden]{display:none;}',
    '.cookie-modal__fond{position:absolute;inset:0;background:rgba(33,27,24,.55);}',
    '.cookie-modal__boite{position:relative;width:min(560px,94vw);max-height:90vh;overflow:auto;background:#fff;border-radius:22px;padding:36px 34px;box-shadow:0 40px 90px rgba(33,27,24,.35);}',
    '.cookie-modal__boite h2{font-size:24px;font-weight:700;color:#7B1E22;margin:0 0 8px;}',
    '.cookie-modal__intro{font-size:14px;color:#6E625C;margin:0 0 22px;}',
    '.cookie-opt{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:16px 0;border-top:1px solid rgba(223,183,128,.4);font-size:13.5px;line-height:1.5;color:#6E625C;}',
    '.cookie-opt strong{color:#211B18;}',
    '.cookie-opt input{margin-top:3px;flex:0 0 auto;width:20px;height:20px;accent-color:#7B1E22;}',
    '.cookie-modal__pied{display:flex;justify-content:space-between;gap:12px;margin-top:24px;flex-wrap:wrap;}',
    '.cookie-modal__fermer{position:absolute;top:14px;right:16px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(33,27,24,.06);color:#7B1E22;font-size:26px;line-height:1;cursor:pointer;}',
    '.cookie-modal__fermer:hover{background:rgba(33,27,24,.12);}',
  ].join('\n');

  var HTML_BANNIERE =
    '<div class="cookie__texte">' +
      '<p><strong>Cookies&nbsp;:</strong> nécessaires au fonctionnement du site et, avec votre accord, de mesure d’audience. ' +
      '<a href="politique-confidentialite.html">En savoir plus</a> · ' +
      '<button type="button" class="cookie__perso" id="cookieRegler">Personnaliser</button></p>' +
    '</div>' +
    '<div class="cookie__actions">' +
      '<button type="button" class="cookie__btn cookie__btn--plein" id="cookieRefus">Refuser</button>' +
      '<button type="button" class="cookie__btn cookie__btn--plein" id="cookieAccept">Tout accepter</button>' +
    '</div>';

  var HTML_MODALE =
    '<div class="cookie-modal__fond" data-cookies-fermer></div>' +
    '<div class="cookie-modal__boite" role="dialog" aria-modal="true" aria-label="Réglages des cookies">' +
      '<button class="cookie-modal__fermer" data-cookies-fermer aria-label="Fermer">&times;</button>' +
      '<h2>Réglages des cookies</h2>' +
      '<p class="cookie-modal__intro">Choisissez les cookies que vous acceptez. Vos choix sont conservés six mois.</p>' +
      '<label class="cookie-opt">' +
        '<span><strong>Strictement nécessaires</strong><br>Indispensables au fonctionnement et à la sécurité du site. Toujours actifs.</span>' +
        '<input type="checkbox" checked disabled>' +
      '</label>' +
      '<label class="cookie-opt">' +
        '<span><strong>Mesure d’audience</strong><br>Nous aident à comprendre l’usage du site pour l’améliorer.</span>' +
        '<input type="checkbox" id="optAudience">' +
      '</label>' +
      '<label class="cookie-opt">' +
        '<span><strong>Services tiers</strong><br>Contenus et outils externes (formulaires, vidéos, suivi de campagne).</span>' +
        '<input type="checkbox" id="optTiers">' +
      '</label>' +
      '<div class="cookie-modal__pied">' +
        '<button type="button" class="cookie__btn cookie__btn--ghost" id="cookieToutRefus">Tout refuser</button>' +
        '<button type="button" class="cookie__btn cookie__btn--plein" id="cookieEnregistrer">Enregistrer mes choix</button>' +
      '</div>' +
    '</div>';

  function ecrire(audience, tiers) {
    try { localStorage.setItem(CLE, JSON.stringify({ audience: audience, tiers: tiers, ts: Date.now() })); } catch (e) {}
    appliquer(audience, tiers);
  }

  function chargerHubSpot() {
    // Le traceur n'est injecté qu'après un consentement explicite.
    window._hsq = window._hsq || [];
    window._hsq.push(['doNotTrack', { track: true }]);
    if (!document.getElementById('hs-script-loader')) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'hs-script-loader';
      script.async = true;
      script.defer = true;
      script.src = 'https://js-eu1.hs-scripts.com/147891073.js';
      (document.head || document.documentElement).appendChild(script);
    }
  }

  function arreterHubSpot() {
    // Si HubSpot a déjà été chargé dans cette page, bloque les nouveaux envois
    // et retire ses cookies de consentement lors d'un retrait de l'accord.
    if (!document.getElementById('hs-script-loader')) return;

    window._hsq = window._hsq || [];
    window._hsq.push(['doNotTrack']);
    window._hsp = window._hsp || [];
    window._hsp.push(['revokeCookieConsent']);
  }

  // Active les scripts de mesure uniquement selon le choix enregistré.
  function appliquer(audience, tiers) {
    window.monchaiConsent = { audience: !!audience, tiers: !!tiers };
    document.documentElement.dataset.consentAudience = audience ? '1' : '0';
    document.documentElement.dataset.consentTiers = tiers ? '1' : '0';
    if (audience) chargerHubSpot();
    else arreterHubSpot();
  }

  if (initial) appliquer(initial.audience, initial.tiers);

  function initDom() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var banniere = document.createElement('div');
    banniere.className = 'cookie';
    banniere.id = 'cookieBanner';
    banniere.hidden = true;
    banniere.innerHTML = HTML_BANNIERE;
    document.body.appendChild(banniere);

    var modalC = document.createElement('div');
    modalC.className = 'cookie-modal';
    modalC.id = 'cookieModal';
    modalC.hidden = true;
    modalC.innerHTML = HTML_MODALE;
    document.body.appendChild(modalC);

    var optAud = document.getElementById('optAudience');
    var optTiers = document.getElementById('optTiers');
    var elementAvantReglages = null;

    function montrerBanniere() { banniere.hidden = false; }
    function cacherBanniere()  { banniere.hidden = true; }
    function ouvrirReglages() {
      var d = lire();
      optAud.checked = d ? !!d.audience : false;
      optTiers.checked = d ? !!d.tiers : false;
      elementAvantReglages = document.activeElement;
      modalC.hidden = false;
      var fermer = modalC.querySelector('.cookie-modal__fermer');
      if (fermer) fermer.focus();
    }
    function fermerReglages() {
      modalC.hidden = true;
      if (elementAvantReglages && typeof elementAvantReglages.focus === 'function') elementAvantReglages.focus();
    }

    // état initial : pas de choix valide enregistré -> bandeau
    if (!lire()) montrerBanniere();

    document.getElementById('cookieAccept').addEventListener('click', function () { ecrire(true, true); cacherBanniere(); });
    document.getElementById('cookieRefus').addEventListener('click', function () { ecrire(false, false); cacherBanniere(); });
    document.getElementById('cookieRegler').addEventListener('click', ouvrirReglages);
    document.getElementById('cookieToutRefus').addEventListener('click', function () { ecrire(false, false); fermerReglages(); cacherBanniere(); });
    document.getElementById('cookieEnregistrer').addEventListener('click', function () {
      ecrire(optAud.checked, optTiers.checked);
      fermerReglages(); cacherBanniere();
    });

    // « Gérer mes cookies » (footer, nav mobile, pages légales) rouvre les réglages
    document.querySelectorAll('[data-cookies]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); ouvrirReglages(); });
    });
    modalC.querySelectorAll('[data-cookies-fermer]').forEach(function (el) {
      el.addEventListener('click', fermerReglages);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalC.hidden) fermerReglages();
    });
    modalC.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || modalC.hidden) return;
      var focusables = Array.prototype.slice.call(modalC.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(function (element) { return element.offsetParent !== null; });
      if (!focusables.length) return;
      var premier = focusables[0];
      var dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault(); dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault(); premier.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDom);
  } else {
    initDom();
  }
})();
