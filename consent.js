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
  // Une page légale affichée dans la modale de la landing réutilise le choix
  // du document parent et ne doit injecter ni second bandeau ni second traceur.
  if (window.self !== window.top) return;

  var CLE = 'monchai_cookie_consent';
  var SIX_MOIS = 1000 * 60 * 60 * 24 * 182;

  // Textes du bandeau dans la langue de la page (attribut lang de <html>).
  // Le lien « En savoir plus » vise la politique de confidentialité du même
  // dossier de langue.
  var TEXTES = {
    fr: { bandeau: '<strong>Cookies&nbsp;:</strong> nécessaires au site et, avec votre accord, pour la mesure d’audience et les contenus Instagram.', plus: 'En savoir plus', perso: 'Personnaliser', refus: 'Refuser', accepte: 'Tout accepter', reglages: 'Réglages des cookies', fermer: 'Fermer', intro: 'Choisissez les cookies que vous acceptez. Vos choix sont conservés six mois.', necT: 'Strictement nécessaires', necD: 'Indispensables au fonctionnement et à la sécurité du site. Toujours actifs.', audT: 'Mesure d’audience', audD: 'Nous aident à comprendre l’usage du site pour l’améliorer.', tiersT: 'Services tiers', tiersD: 'Contenus et outils externes (formulaires, vidéos, suivi de campagne).', toutRefus: 'Tout refuser', enregistrer: 'Enregistrer mes choix' },
    en: { bandeau: '<strong>Cookies:</strong> required for the site and, with your consent, for audience measurement and Instagram content.', plus: 'Learn more', perso: 'Customize', refus: 'Decline', accepte: 'Accept all', reglages: 'Cookie settings', fermer: 'Close', intro: 'Choose the cookies you accept. Your choices are kept for six months.', necT: 'Strictly necessary', necD: 'Essential to the operation and security of the site. Always active.', audT: 'Audience measurement', audD: 'Help us understand how the site is used so we can improve it.', tiersT: 'Third-party services', tiersD: 'External content and tools (forms, videos, campaign tracking).', toutRefus: 'Decline all', enregistrer: 'Save my choices' },
    de: { bandeau: '<strong>Cookies:</strong> für den Betrieb der Website erforderlich und, mit Ihrer Zustimmung, für die Reichweitenmessung und Instagram-Inhalte.', plus: 'Mehr erfahren', perso: 'Anpassen', refus: 'Ablehnen', accepte: 'Alle akzeptieren', reglages: 'Cookie-Einstellungen', fermer: 'Schließen', intro: 'Wählen Sie die Cookies, die Sie akzeptieren. Ihre Auswahl wird sechs Monate gespeichert.', necT: 'Unbedingt erforderlich', necD: 'Für den Betrieb und die Sicherheit der Website unerlässlich. Immer aktiv.', audT: 'Reichweitenmessung', audD: 'Hilft uns zu verstehen, wie die Website genutzt wird, um sie zu verbessern.', tiersT: 'Dienste von Drittanbietern', tiersD: 'Externe Inhalte und Werkzeuge (Formulare, Videos, Kampagnenverfolgung).', toutRefus: 'Alle ablehnen', enregistrer: 'Auswahl speichern' },
    it: { bandeau: '<strong>Cookie:</strong> necessari al sito e, con il tuo consenso, per la misurazione del pubblico e i contenuti Instagram.', plus: 'Scopri di più', perso: 'Personalizza', refus: 'Rifiuta', accepte: 'Accetta tutto', reglages: 'Impostazioni dei cookie', fermer: 'Chiudi', intro: 'Scegli i cookie che accetti. Le tue scelte vengono conservate per sei mesi.', necT: 'Strettamente necessari', necD: 'Indispensabili al funzionamento e alla sicurezza del sito. Sempre attivi.', audT: 'Misurazione del pubblico', audD: 'Ci aiutano a capire come viene usato il sito per migliorarlo.', tiersT: 'Servizi di terze parti', tiersD: 'Contenuti e strumenti esterni (moduli, video, monitoraggio delle campagne).', toutRefus: 'Rifiuta tutto', enregistrer: 'Salva le mie scelte' },
    zh: { bandeau: '<strong>Cookie：</strong>网站运行所必需；经您同意后，还用于访问量统计和 Instagram 内容。', plus: '了解更多', perso: '自定义', refus: '拒绝', accepte: '全部接受', reglages: 'Cookie 设置', fermer: '关闭', intro: '请选择您接受的 Cookie。您的选择将保留六个月。', necT: '必要 Cookie', necD: '网站运行和安全所必需，始终启用。', audT: '访问量统计', audD: '帮助我们了解网站的使用情况，以便改进。', tiersT: '第三方服务', tiersD: '外部内容和工具（表单、视频、推广活动跟踪）。', toutRefus: '全部拒绝', enregistrer: '保存我的选择' }
  };
  var T = TEXTES[(document.documentElement.lang || 'fr').slice(0, 2).toLowerCase()] || TEXTES.fr;

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
      '<p>' + T.bandeau + ' ' +
      '<a href="politique-confidentialite.html">' + T.plus + '</a> · ' +
      '<button type="button" class="cookie__perso" id="cookieRegler">' + T.perso + '</button></p>' +
    '</div>' +
    '<div class="cookie__actions">' +
      '<button type="button" class="cookie__btn cookie__btn--plein" id="cookieRefus">' + T.refus + '</button>' +
      '<button type="button" class="cookie__btn cookie__btn--plein" id="cookieAccept">' + T.accepte + '</button>' +
    '</div>';

  var HTML_MODALE =
    '<div class="cookie-modal__fond" data-cookies-fermer></div>' +
    '<div class="cookie-modal__boite" role="dialog" aria-modal="true" aria-label="' + T.reglages + '">' +
      '<button class="cookie-modal__fermer" data-cookies-fermer aria-label="' + T.fermer + '">&times;</button>' +
      '<h2>' + T.reglages + '</h2>' +
      '<p class="cookie-modal__intro">' + T.intro + '</p>' +
      '<label class="cookie-opt">' +
        '<span><strong>' + T.necT + '</strong><br>' + T.necD + '</span>' +
        '<input type="checkbox" checked disabled>' +
      '</label>' +
      '<label class="cookie-opt">' +
        '<span><strong>' + T.audT + '</strong><br>' + T.audD + '</span>' +
        '<input type="checkbox" id="optAudience">' +
      '</label>' +
      '<label class="cookie-opt">' +
        '<span><strong>' + T.tiersT + '</strong><br>' + T.tiersD + '</span>' +
        '<input type="checkbox" id="optTiers">' +
      '</label>' +
      '<div class="cookie-modal__pied">' +
        '<button type="button" class="cookie__btn cookie__btn--ghost" id="cookieToutRefus">' + T.toutRefus + '</button>' +
        '<button type="button" class="cookie__btn cookie__btn--plein" id="cookieEnregistrer">' + T.enregistrer + '</button>' +
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
    try {
      window.dispatchEvent(new CustomEvent('monchai:consent', {
        detail: { audience: !!audience, tiers: !!tiers }
      }));
    } catch (e) {}
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

    // Délégation : couvre aussi les boutons recréés quand un contenu tiers est retiré.
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-cookies]');
      if (!el) return;
      e.preventDefault();
      ouvrirReglages();
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
