/* =========================================================
   Mon Chai : carte d'appel à l'action (13/10/2026, texte de Denis du 14/10)
   Une carte discrète, jamais en plein écran : en bas à droite sur
   ordinateur, panneau bas compact sur téléphone (Google pénalise les
   interstitiels qui masquent le contenu sur mobile).

   Elle apparaît au premier des trois signaux : 25 s sur la page, la moitié
   de la page lue, ou la souris qui sort par le haut (intention de départ).
   Jamais tant que le bandeau de cookies attend une réponse. Au plus une
   fois par semaine, et plus du tout pendant 30 jours après un clic.

   Offre de lancement : gratuit jusqu'au 31/12/2026 pour toute inscription
   avant le 31/10/2026. À partir du 1er novembre 2026 (FIN_OFFRE), le bloc
   d'offre et la ligne « reprise et formation offertes » disparaissent
   d'eux-mêmes et le bouton redevient « Essayer Mon Chai ».

   Le HTML et le CSS vivent ici : toute page qui charge ce script est
   couverte. Textes selon <html lang>. Événements envoyés à GTM :
   cta_popup_affiche, cta_popup_essai, cta_popup_ferme.
   ========================================================= */
(function () {
  if (window.self !== window.top) return;

  var CLE = 'monchai_cta_vu';
  var JOUR = 86400000;
  var APP = 'https://tester.monchai.fr';
  var FIN_OFFRE = new Date('2026-11-01T00:00:00+01:00');

  try {
    var vu = JSON.parse(localStorage.getItem(CLE));
    if (vu && vu.ts && Date.now() - vu.ts < (vu.clic ? 30 : 7) * JOUR) return;
  } catch (e) {}

  var TEXTES = {
    fr: { titre: 'Et si vous réduisiez vos coûts de gestion ?', accroche: 'Moins d’abonnements, moins de ressaisies, moins de temps perdu.', texte: 'Centralisez toute la gestion de votre domaine, de la vigne à la facturation, dans un seul logiciel simple et abordable.', badge: 'Offre de lancement', offre: 'Gratuit jusqu’au 31 décembre 2026 pour toute inscription avant le 31 octobre 2026.', coche1: 'Reprise de vos données et formation offertes', coche2: 'Sans engagement ni carte bancaire', bouton: 'Je profite de l’offre', boutonApres: 'Essayer Mon Chai', prix: 'Puis 59 € HT/mois ou 590 € HT/an.', prixApres: '59 € HT/mois ou 590 € HT/an.', plus_tard: 'Plus tard', fermer: 'Fermer' },
    en: { titre: 'What if you cut your management costs?', accroche: 'Fewer subscriptions, less re-keying, less wasted time.', texte: 'Bring all of your estate’s management together, from vineyard to invoicing, in one simple and affordable software.', badge: 'Launch offer', offre: 'Free until 31 December 2026 for any sign-up before 31 October 2026.', coche1: 'Free data import and training', coche2: 'No commitment, no credit card', bouton: 'Claim the offer', boutonApres: 'Try Mon Chai', prix: 'Then €59 excl. VAT/month or €590 excl. VAT/year.', prixApres: '€59 excl. VAT/month or €590 excl. VAT/year.', plus_tard: 'Later', fermer: 'Close' },
    de: { titre: 'Wie wäre es, Ihre Verwaltungskosten zu senken?', accroche: 'Weniger Abos, weniger doppelte Eingaben, weniger verlorene Zeit.', texte: 'Bündeln Sie die gesamte Verwaltung Ihres Weinguts, vom Weinberg bis zur Rechnung, in einer einzigen einfachen und günstigen Software.', badge: 'Einführungsangebot', offre: 'Kostenlos bis 31. Dezember 2026 bei Anmeldung vor dem 31. Oktober 2026.', coche1: 'Datenübernahme und Schulung kostenlos', coche2: 'Ohne Verpflichtung und ohne Kreditkarte', bouton: 'Angebot nutzen', boutonApres: 'Mon Chai testen', prix: 'Danach 59 € zzgl. MwSt./Monat oder 590 € zzgl. MwSt./Jahr.', prixApres: '59 € zzgl. MwSt./Monat oder 590 € zzgl. MwSt./Jahr.', plus_tard: 'Später', fermer: 'Schließen' },
    it: { titre: 'E se riduceste i costi di gestione?', accroche: 'Meno abbonamenti, meno doppie digitazioni, meno tempo perso.', texte: 'Riunite tutta la gestione della vostra azienda, dalla vigna alla fatturazione, in un unico software semplice e conveniente.', badge: 'Offerta di lancio', offre: 'Gratis fino al 31 dicembre 2026 per ogni iscrizione entro il 31 ottobre 2026.', coche1: 'Importazione dei dati e formazione offerte', coche2: 'Senza impegno né carta di credito', bouton: 'Approfitto dell’offerta', boutonApres: 'Prova Mon Chai', prix: 'Poi 59 € IVA esclusa/mese o 590 € IVA esclusa/anno.', prixApres: '59 € IVA esclusa/mese o 590 € IVA esclusa/anno.', plus_tard: 'Più tardi', fermer: 'Chiudi' },
    zh: { titre: '何不降低您的管理成本？', accroche: '更少的订阅，更少的重复录入，更少的时间浪费。', texte: '将酒庄从葡萄园到开票的全部管理，集中到一款简单实惠的软件中。', badge: '首发优惠', offre: '2026年10月31日前注册，可免费使用至2026年12月31日。', coche1: '免费数据导入和培训', coche2: '无需承诺，无需银行卡', bouton: '立即享受优惠', boutonApres: '试用 Mon Chai', prix: '之后每月59欧元（不含税）或每年590欧元（不含税）。', prixApres: '每月59欧元（不含税）或每年590欧元（不含税）。', plus_tard: '稍后', fermer: '关闭' }
  };
  var T = TEXTES[(document.documentElement.lang || 'fr').slice(0, 2).toLowerCase()] || TEXTES.fr;
  var offreValable = Date.now() < FIN_OFFRE.getTime();

  var CSS = [
    '.mc-cta{position:fixed;right:24px;bottom:24px;z-index:290;width:min(390px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow-y:auto;box-sizing:border-box;padding:26px 24px 18px;background:#FFFCF8;border:1px solid #E7D3BC;border-radius:18px;box-shadow:0 24px 60px rgba(71,19,24,.22);font-family:"Inter",system-ui,-apple-system,sans-serif;color:#2E2826;opacity:0;transform:translateY(16px);transition:opacity .35s ease,transform .35s ease;}',
    '.mc-cta.est-visible{opacity:1;transform:none;}',
    '.mc-cta[hidden]{display:none;}',
    '.mc-cta__fermer{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#7B1E22;font-size:22px;line-height:1;cursor:pointer;}',
    '.mc-cta__fermer:hover{background:rgba(123,30,34,.07);}',
    '.mc-cta__titre{margin:0 0 8px;padding-right:26px;font:600 22px/1.25 "Playfair Display",Georgia,serif;color:#7B1E22;}',
    '.mc-cta__accroche{margin:0 0 6px;font-size:14.5px;line-height:1.5;font-weight:600;color:#2E2826;}',
    '.mc-cta__texte{margin:0 0 14px;font-size:14px;line-height:1.55;color:#4E4440;}',
    '.mc-cta__offre{margin:0 0 12px;padding:12px 14px;border-radius:12px;background:#F8EFE4;border:1px solid #E7D3BC;}',
    '.mc-cta__badge{display:inline-block;margin:0 0 6px;padding:4px 10px;border-radius:999px;background:#7B1E22;color:#fff;font:700 10.5px/1.3 "Poppins","Inter",sans-serif;letter-spacing:.08em;text-transform:uppercase;}',
    '.mc-cta__offre p{margin:0;font-size:14px;line-height:1.45;font-weight:600;color:#7B1E22;}',
    '.mc-cta__coches{margin:0 0 16px;padding:0;list-style:none;}',
    '.mc-cta__coches li{position:relative;padding-left:22px;font-size:13.5px;line-height:1.6;color:#2E2826;}',
    '.mc-cta__coches li::before{content:"\\2713";position:absolute;left:0;top:0;color:#A85D35;font-weight:700;}',
    '.mc-cta__btn{display:flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:999px;background:#C99159;color:#fff;font:600 15.5px/1.2 "Poppins","Inter",sans-serif;text-decoration:none;text-align:center;box-sizing:border-box;transition:background .18s ease;}',
    '.mc-cta__btn:hover{background:#b87f4a;}',
    '.mc-cta__prix{margin:10px 0 0;text-align:center;font-size:12.5px;line-height:1.4;color:#6E625C;}',
    '.mc-cta__plus-tard{display:block;margin:8px auto 0;padding:4px 8px;border:0;background:none;color:#6E625C;font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;}',
    '@media (max-width:639px){.mc-cta{left:0;right:0;bottom:0;width:100%;max-height:70vh;border-radius:18px 18px 0 0;border-bottom:0;padding:18px 18px calc(10px + env(safe-area-inset-bottom));}.mc-cta__titre{font-size:18.5px;margin-bottom:6px;}.mc-cta__accroche{font-size:13.5px;}.mc-cta__texte{display:none;}.mc-cta__offre{padding:10px 12px;margin-bottom:10px;}.mc-cta__offre p{font-size:13px;}.mc-cta__coches{margin-bottom:12px;}.mc-cta__coches li{font-size:13px;}.mc-cta__btn{min-height:46px;font-size:15px;}.mc-cta__prix{margin-top:8px;}.mc-cta__plus-tard{margin-top:4px;}}',
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
      '<p class="mc-cta__titre" id="mcCtaTitre">' + T.titre + '</p>' +
      '<p class="mc-cta__accroche">' + T.accroche + '</p>' +
      '<p class="mc-cta__texte">' + T.texte + '</p>' +
      (offreValable ? '<div class="mc-cta__offre"><span class="mc-cta__badge">' + T.badge + '</span><p>' + T.offre + '</p></div>' : '') +
      '<ul class="mc-cta__coches">' +
        (offreValable ? '<li>' + T.coche1 + '</li>' : '') +
        '<li>' + T.coche2 + '</li>' +
      '</ul>' +
      '<a class="mc-cta__btn" href="' + APP + '" data-mc-cta="essai">' + (offreValable ? T.bouton : T.boutonApres) + '</a>' +
      '<p class="mc-cta__prix">' + (offreValable ? T.prix : T.prixApres) + '</p>' +
      '<button type="button" class="mc-cta__plus-tard">' + T.plus_tard + '</button>';
    document.body.appendChild(carte);

    carte.querySelector('.mc-cta__fermer').addEventListener('click', fermer);
    carte.querySelector('.mc-cta__plus-tard').addEventListener('click', fermer);
    carte.querySelector('[data-mc-cta]').addEventListener('click', function () {
      memoriser(true);
      signaler('cta_popup_essai');
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
