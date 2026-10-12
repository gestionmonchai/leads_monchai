/* =========================================================
   Mon Chai : carte d'appel à l'action (13/10/2026)
   Une carte discrète, jamais en plein écran : en bas à droite sur
   ordinateur, panneau bas compact sur téléphone (Google pénalise les
   interstitiels qui masquent le contenu sur mobile).

   Elle apparaît au premier des trois signaux : 25 s sur la page, la moitié
   de la page lue, ou la souris qui sort par le haut (intention de départ).
   Jamais tant que le bandeau de cookies attend une réponse. Au plus une
   fois par semaine, et plus du tout pendant 30 jours après un clic.

   Le HTML et le CSS vivent ici : toute page qui charge ce script est
   couverte. Textes selon <html lang>. Événements envoyés à GTM :
   cta_popup_affiche, cta_popup_essai, cta_popup_demo, cta_popup_ferme.
   ========================================================= */
(function () {
  if (window.self !== window.top) return;

  var CLE = 'monchai_cta_vu';
  var JOUR = 86400000;
  var APP = 'https://tester.monchai.fr';
  var DEMO = 'https://calendar.app.google/bJGuZudhQ7q9ka3T9';
  var FIN_BETA = new Date('2027-01-01T00:00:00+01:00');

  try {
    var vu = JSON.parse(localStorage.getItem(CLE));
    if (vu && vu.ts && Date.now() - vu.ts < (vu.clic ? 30 : 7) * JOUR) return;
  } catch (e) {}

  var TEXTES = {
    fr: { badge: 'Bêta gratuite jusqu’au 31 décembre', titre: 'Prêt à lâcher les tableurs ?', texte: 'Testez Mon Chai sur vos vraies données. On reprend vos clients, produits, tarifs et cuvées, et on vous forme.', beta: 'Gratuit jusqu’au 31 décembre 2026, sans carte bancaire.', apres: 'Sans carte bancaire, sans engagement.', essai: 'Essayer Mon Chai', demo: 'Réserver une démo de 30 min', plus_tard: 'Plus tard', fermer: 'Fermer' },
    en: { badge: 'Free beta until 31 December', titre: 'Ready to ditch the spreadsheets?', texte: 'Try Mon Chai on your real data. We import your customers, products, prices and cuvées, and we train you.', beta: 'Free until 31 December 2026, no credit card.', apres: 'No credit card, no commitment.', essai: 'Try Mon Chai', demo: 'Book a 30-minute demo', plus_tard: 'Later', fermer: 'Close' },
    de: { badge: 'Kostenlose Beta bis 31. Dezember', titre: 'Bereit, die Tabellen hinter sich zu lassen?', texte: 'Testen Sie Mon Chai mit Ihren echten Daten. Wir übernehmen Ihre Kunden, Produkte, Preise und Cuvées und schulen Sie.', beta: 'Kostenlos bis 31. Dezember 2026, ohne Kreditkarte.', apres: 'Ohne Kreditkarte, ohne Verpflichtung.', essai: 'Mon Chai testen', demo: '30-Minuten-Demo buchen', plus_tard: 'Später', fermer: 'Schließen' },
    it: { badge: 'Beta gratuita fino al 31 dicembre', titre: 'Pronti a dire addio ai fogli di calcolo?', texte: 'Prova Mon Chai con i tuoi dati reali. Importiamo clienti, prodotti, listini e cuvée, e ti formiamo.', beta: 'Gratis fino al 31 dicembre 2026, senza carta di credito.', apres: 'Senza carta di credito, senza impegno.', essai: 'Prova Mon Chai', demo: 'Prenota una demo di 30 minuti', plus_tard: 'Più tardi', fermer: 'Chiudi' },
    zh: { badge: '2026年12月31日前免费测试', titre: '准备告别电子表格了吗？', texte: '用您的真实数据试用 Mon Chai。我们为您导入客户、产品、价格和酒款，并提供培训。', beta: '2026年12月31日前免费，无需银行卡。', apres: '无需银行卡，无需承诺。', essai: '试用 Mon Chai', demo: '预约30分钟演示', plus_tard: '稍后', fermer: '关闭' }
  };
  var T = TEXTES[(document.documentElement.lang || 'fr').slice(0, 2).toLowerCase()] || TEXTES.fr;
  var enBeta = Date.now() < FIN_BETA.getTime();

  var CSS = [
    '.mc-cta{position:fixed;right:24px;bottom:24px;z-index:290;width:min(380px,calc(100vw - 32px));box-sizing:border-box;padding:26px 24px 20px;background:#FFFCF8;border:1px solid #E7D3BC;border-radius:18px;box-shadow:0 24px 60px rgba(71,19,24,.22);font-family:"Inter",system-ui,-apple-system,sans-serif;color:#2E2826;opacity:0;transform:translateY(16px);transition:opacity .35s ease,transform .35s ease;}',
    '.mc-cta.est-visible{opacity:1;transform:none;}',
    '.mc-cta[hidden]{display:none;}',
    '.mc-cta__fermer{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#7B1E22;font-size:22px;line-height:1;cursor:pointer;}',
    '.mc-cta__fermer:hover{background:rgba(123,30,34,.07);}',
    '.mc-cta__badge{display:inline-block;margin:0 0 12px;padding:5px 11px;border-radius:999px;background:#7B1E22;color:#fff;font:600 11.5px/1.3 "Poppins","Inter",sans-serif;letter-spacing:.02em;}',
    '.mc-cta__titre{margin:0 0 8px;padding-right:22px;font:600 22px/1.25 "Playfair Display",Georgia,serif;color:#7B1E22;}',
    '.mc-cta__texte{margin:0 0 6px;font-size:14.5px;line-height:1.55;color:#4E4440;}',
    '.mc-cta__note{margin:0 0 16px;font-size:13px;line-height:1.45;color:#A85D35;font-weight:600;}',
    '.mc-cta__actions{display:grid;gap:9px;}',
    '.mc-cta__btn{display:flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;font:600 15px/1.2 "Poppins","Inter",sans-serif;text-decoration:none;text-align:center;box-sizing:border-box;transition:background .18s ease,border-color .18s ease;}',
    '.mc-cta__btn--plein{background:#C99159;color:#fff;}',
    '.mc-cta__btn--plein:hover{background:#b87f4a;}',
    '.mc-cta__btn--contour{border:1.5px solid #C99159;color:#A85D35;background:#fff;}',
    '.mc-cta__btn--contour:hover{background:#F8EFE4;border-color:#A85D35;}',
    '.mc-cta__plus-tard{display:block;margin:12px auto 0;padding:4px 8px;border:0;background:none;color:#6E625C;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer;}',
    '@media (max-width:639px){.mc-cta{left:0;right:0;bottom:0;width:100%;border-radius:18px 18px 0 0;border-bottom:0;padding:20px 18px calc(14px + env(safe-area-inset-bottom));}.mc-cta__titre{font-size:19px;}.mc-cta__texte{font-size:13.5px;}.mc-cta__note{margin-bottom:12px;}.mc-cta__btn{min-height:44px;font-size:14.5px;}.mc-cta__plus-tard{margin-top:8px;}}',
    '@media (prefers-reduced-motion:reduce){.mc-cta{transition:none;transform:none;}}'
  ].join('\n');

  function signaler(evenement) {
    try { (window.dataLayer = window.dataLayer || []).push({ event: evenement }); } catch (e) {}
  }
  function memoriser(clic) {
    try { localStorage.setItem(CLE, JSON.stringify({ ts: Date.now(), clic: !!clic })); } catch (e) {}
  }

  var carte = null, affichee = false;

  function construire() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    carte = document.createElement('div');
    carte.className = 'mc-cta';
    carte.hidden = true;
    carte.setAttribute('role', 'dialog');
    carte.setAttribute('aria-modal', 'false');
    carte.setAttribute('aria-labelledby', 'mcCtaTitre');
    carte.innerHTML =
      '<button type="button" class="mc-cta__fermer" aria-label="' + T.fermer + '">&times;</button>' +
      (enBeta ? '<p class="mc-cta__badge">' + T.badge + '</p>' : '') +
      '<p class="mc-cta__titre" id="mcCtaTitre">' + T.titre + '</p>' +
      '<p class="mc-cta__texte">' + T.texte + '</p>' +
      '<p class="mc-cta__note">' + (enBeta ? T.beta : T.apres) + '</p>' +
      '<div class="mc-cta__actions">' +
        '<a class="mc-cta__btn mc-cta__btn--plein" href="' + APP + '" data-mc-cta="essai">' + T.essai + '</a>' +
        '<a class="mc-cta__btn mc-cta__btn--contour" href="' + DEMO + '" target="_blank" rel="noopener" data-mc-cta="demo">' + T.demo + '</a>' +
      '</div>' +
      '<button type="button" class="mc-cta__plus-tard">' + T.plus_tard + '</button>';
    document.body.appendChild(carte);

    carte.querySelector('.mc-cta__fermer').addEventListener('click', fermer);
    carte.querySelector('.mc-cta__plus-tard').addEventListener('click', fermer);
    carte.querySelectorAll('[data-mc-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        memoriser(true);
        signaler(a.getAttribute('data-mc-cta') === 'demo' ? 'cta_popup_demo' : 'cta_popup_essai');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && affichee) fermer();
    });
  }

  function fermer() {
    if (!carte) return;
    carte.classList.remove('est-visible');
    setTimeout(function () { carte.hidden = true; }, 350);
    affichee = false;
    signaler('cta_popup_ferme');
  }

  function bandeauCookiesOuvert() {
    var b = document.getElementById('cookieBanner');
    return !!(b && !b.hidden && b.offsetParent !== null);
  }

  var declenchee = false;
  function declencher() {
    if (declenchee) return;
    if (bandeauCookiesOuvert()) {
      // On attend la réponse au bandeau, puis on laisse quelques secondes.
      window.addEventListener('monchai:consent', function () { setTimeout(declencher, 4000); }, { once: true });
      return;
    }
    declenchee = true;
    if (!carte) construire();
    carte.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { carte.classList.add('est-visible'); }); });
    affichee = true;
    memoriser(false);
    signaler('cta_popup_affiche');
  }

  function demarrer() {
    setTimeout(declencher, 25000);
    window.addEventListener('scroll', function surDefilement() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.5) { window.removeEventListener('scroll', surDefilement); declencher(); }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) declencher();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
