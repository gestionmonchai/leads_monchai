/* =========================================================
   1. Mise à l'échelle des écrans 1920×1200
   ========================================================= */
const page = document.getElementById('page');
const W = 1920, H = 1200;

/* matchMedia plutôt qu'innerWidth : il lit la même largeur que les media
   queries d'assets/css/index-responsive.css, sans compter la barre de
   défilement. */
const GRAND_ECRAN = window.matchMedia('(min-width: 1200px)');

function fit() {
  const scale = window.innerWidth / W;

  // Publiée pour tout ce qui vit hors de .page et doit suivre la même
  // échelle : le header fixe (header.css) et, sous 1200px, les écrans encore
  // dessinés dans des SVG (index-responsive.css).
  document.documentElement.style.setProperty('--echelle', scale);

  if (!GRAND_ECRAN.matches) {
    // Sous 1200px l'écran d'accueil repasse en flux : la scène ne peut plus
    // être mise à l'échelle d'un bloc. On retire ce que ce mode avait posé.
    page.style.transform = '';
    document.body.style.height = '';
    document.body.style.overflowY = '';
    return;
  }

  page.style.transform = 'scale(' + scale + ')';

  // les écrans n'ont pas tous la même hauteur (1200 pour Accueil/Pourquoi,
  // 1081 pour les autres, recadrés de leur bande de header) et se chevauchent
  // d'1px : on lit donc la hauteur réelle de .page plutôt que de l'additionner.
  document.body.style.height = (page.offsetHeight * scale) + 'px';

  // Un transform ne change pas la géométrie : la boîte de mise en page de
  // .page garde sa hauteur NON réduite et déborde du body raccourci. Chrome
  // n'en tient pas compte, mais Firefox et Safari l'ajoutent à la zone de
  // défilement : on pouvait défiler dans du blanc sous le pied de page. On
  // rogne ce débord au niveau du body ; html reste le défileur (styles.css).
  document.body.style.overflowY = 'hidden';
}
window.addEventListener('resize', fit);
if (GRAND_ECRAN.addEventListener) GRAND_ECRAN.addEventListener('change', fit);
else if (GRAND_ECRAN.addListener) GRAND_ECRAN.addListener(fit);
window.addEventListener('load', fit);
fit();

// La hauteur de .page bouge après coup (bascule des polices, publications
// Instagram chargées ou repliées) : la hauteur du body posée par fit()
// deviendrait fausse, laissant un blanc ou coupant le pied de page.
if (window.ResizeObserver) new ResizeObserver(fit).observe(page);


/* =========================================================
   2. Modules « De la vigne à la vente »
      survol -> encadré · clic -> figé · clic ailleurs -> fermé
   ========================================================= */
const slots = document.querySelectorAll('#parcours .pq-slot');

function defiger() {
  slots.forEach(function (s) {
    s.classList.remove('est-fige');
    s.querySelector('.pq-module').setAttribute('aria-expanded', 'false');
  });
}

slots.forEach(function (slot) {
  const bouton = slot.querySelector('.pq-module');
  bouton.addEventListener('click', function (e) {
    e.stopPropagation();
    const dejaFige = slot.classList.contains('est-fige');
    defiger();
    if (!dejaFige) {
      slot.classList.add('est-fige');
      bouton.setAttribute('aria-expanded', 'true');
    }
  });
  slot.querySelector('.pq-panneau').addEventListener('click', function (e) {
    e.stopPropagation();
  });
});

document.addEventListener('click', defiger);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') defiger();
});


/* =========================================================
   3. Header : disparaît vers le bas, réapparaît vers le haut
      - seuil de 6px : ignore les micro-mouvements du trackpad
      - reste visible dans les 80 premiers pixels
   ========================================================= */
const header = document.getElementById('siteHeader');
const SEUIL = 6;
const HAUT = 80;

let dernierY = window.scrollY;
let enAttente = false;

function majHeader() {
  const y = window.scrollY;
  const delta = y - dernierY;

  if (Math.abs(delta) > SEUIL) {
    if (delta > 0 && y > HAUT) header.classList.add('est-masque');
    else header.classList.remove('est-masque');
    dernierY = y;
  }
  if (y <= HAUT) header.classList.remove('est-masque');
}


/* =========================================================
   4. Barre de lecture
   ========================================================= */
const barre = document.getElementById('readingBar');

function majBarre() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
  barre.style.width = Math.min(100, Math.max(0, pct)) + '%';
}


/* =========================================================
   5. Navigation latérale en tirets
   ========================================================= */
const liens = Array.prototype.slice.call(document.querySelectorAll('.dot-nav a'));
const sections = liens.map(function (a) {
  return document.getElementById(a.dataset.cible);
});

function majNav() {
  const milieu = window.scrollY + window.innerHeight / 2;
  let actif = 0;
  sections.forEach(function (sec, i) {
    const haut = sec.getBoundingClientRect().top + window.scrollY;
    if (milieu >= haut) actif = i;
  });
  liens.forEach(function (a, i) {
    a.classList.toggle('est-actif', i === actif);
  });
}

liens.forEach(function (a) {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    const cible = document.getElementById(a.dataset.cible);
    const haut = cible.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: haut, behavior: 'smooth' });
  });
});


/* =========================================================
   6. Un seul écouteur de scroll pour les trois comportements
   ========================================================= */
window.addEventListener('scroll', function () {
  if (enAttente) return;
  enAttente = true;
  requestAnimationFrame(function () {
    majHeader();
    majBarre();
    majNav();
    enAttente = false;
  });
}, { passive: true });

window.addEventListener('resize', function () {
  majBarre();
  majNav();
});

majBarre();
majNav();


/* =========================================================
   7. Fonds d'écran différés
      Les trois plus gros SVG de fond (parcours-bas, a-propos-faq,
      actualite) ne sont chargés qu'à l'approche du viewport : la classe
      .bg-pret déclenche le background-image (styles.css). Marge large
      (2400 px) pour que l'image soit là avant que l'écran n'arrive.
      Sans IntersectionObserver : tout est chargé immédiatement.
   ========================================================= */
(function () {
  var fonds = Array.prototype.slice.call(document.querySelectorAll('[data-fond]'));
  if (!fonds.length) return;

  function activer(el) { el.classList.add('bg-pret'); }

  if (!('IntersectionObserver' in window)) { fonds.forEach(activer); return; }

  var observateur = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (entree.isIntersecting) {
        activer(entree.target);
        observateur.unobserve(entree.target);
      }
    });
  }, { rootMargin: '2400px 0px' });

  fonds.forEach(function (el) { observateur.observe(el); });
})();


/* =========================================================
   9. FAQ : accordéon
      Clic sur une question -> ouvre sa réponse (et referme les autres).
      Clic ailleurs -> referme celle qui est ouverte.
   ========================================================= */
const faqItems = document.querySelectorAll('#apropos-faq .faq-item');

function fermerFaq() {
  faqItems.forEach(function (it) {
    it.classList.remove('ouvert');
    it.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
}

faqItems.forEach(function (it) {
  const q = it.querySelector('.faq-q');
  q.addEventListener('click', function (e) {
    e.stopPropagation();
    const dejaOuvert = it.classList.contains('ouvert');
    fermerFaq();
    if (!dejaOuvert) {
      it.classList.add('ouvert');
      q.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', fermerFaq);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fermerFaq();
});


/* =========================================================
   11. Cookies : consentement (conforme CNIL)
       Nécessaires : toujours actifs. Audience / tiers : soumis au choix.
       Choix conservé 6 mois, puis nouvelle sollicitation. Réouvrable via
       tout élément [data-cookies] (footer, pages légales).
   ========================================================= */
(function () {
  var CLE = 'monchai_cookie_consent';
  var SIX_MOIS = 1000 * 60 * 60 * 24 * 182;

  var banniere = document.getElementById('cookieBanner');
  var modalC   = document.getElementById('cookieModal');
  var optAud   = document.getElementById('optAudience');
  var optTiers = document.getElementById('optTiers');

  function lire() {
    try {
      var d = JSON.parse(localStorage.getItem(CLE));
      if (!d || !d.ts || Date.now() - d.ts > SIX_MOIS) return null;   // expiré
      return d;
    } catch (e) { return null; }
  }
  function ecrire(audience, tiers) {
    try { localStorage.setItem(CLE, JSON.stringify({ audience: audience, tiers: tiers, ts: Date.now() })); } catch (e) {}
    appliquer(audience, tiers);
  }

  // point d'accroche des scripts tiers : état global + évènement, écouté
  // par les publications Instagram (section 12)
  function appliquer(audience, tiers) {
    window.monchaiConsent = { audience: !!audience, tiers: !!tiers };
    document.documentElement.dataset.consentAudience = audience ? '1' : '0';
    document.documentElement.dataset.consentTiers = tiers ? '1' : '0';
    window.dispatchEvent(new CustomEvent('monchai:consent', { detail: window.monchaiConsent }));
  }

  function montrerBanniere() { if (banniere) banniere.hidden = false; }
  function cacherBanniere()  { if (banniere) banniere.hidden = true; }
  function ouvrirReglages() {
    if (!modalC) return;
    var d = lire();
    if (optAud)   optAud.checked   = d ? !!d.audience : false;
    if (optTiers) optTiers.checked = d ? !!d.tiers    : false;
    modalC.hidden = false;
  }
  function fermerReglages() { if (modalC) modalC.hidden = true; }

  // état initial
  var actuel = lire();
  if (actuel) appliquer(actuel.audience, actuel.tiers);
  else montrerBanniere();

  // bandeau
  var bA = document.getElementById('cookieAccept');
  var bR = document.getElementById('cookieRefus');
  var bP = document.getElementById('cookieRegler');
  if (bA) bA.addEventListener('click', function () { ecrire(true, true);  cacherBanniere(); });
  if (bR) bR.addEventListener('click', function () { ecrire(false, false); cacherBanniere(); });
  if (bP) bP.addEventListener('click', function () { ouvrirReglages(); });

  // panneau de réglages
  var bTout  = document.getElementById('cookieToutRefus');
  var bSave  = document.getElementById('cookieEnregistrer');
  if (bTout) bTout.addEventListener('click', function () { ecrire(false, false); fermerReglages(); cacherBanniere(); });
  if (bSave) bSave.addEventListener('click', function () {
    ecrire(optAud && optAud.checked, optTiers && optTiers.checked);
    fermerReglages(); cacherBanniere();
  });

  // « Gérer mes cookies » (footer, pages légales, cartes Instagram) rouvre
  // les réglages. Délégué au document : les cartes d'attente Instagram sont
  // réécrites par remettreAttente() (section 12), une liaison directe sur
  // leurs boutons serait perdue.
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-cookies]') : null;
    if (el) { e.preventDefault(); ouvrirReglages(); }
  });
  document.querySelectorAll('[data-cookies-fermer]').forEach(function (el) {
    el.addEventListener('click', fermerReglages);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modalC && !modalC.hidden) fermerReglages(); });
})();


/* =========================================================
   12. Publications Instagram (écran actualité)
       Repris de l'ancienne landing : aucun appel à Meta avant l'accord
       « Services tiers ». Tant qu'il manque, les coquilles gardent leur
       carte d'attente ; dès l'accord (ou s'il est déjà enregistré),
       embed.js remplit chaque [data-instagram-embed] avec sa publication.
       Un retrait du consentement remet les cartes d'attente.
   ========================================================= */
(function () {
  var publications = Array.prototype.slice.call(document.querySelectorAll('[data-instagram-embed]'));
  if (!publications.length) return;

  var contenusAttente = publications.map(function (publication) { return publication.innerHTML; });

  function remettreAttente() {
    publications.forEach(function (publication, index) {
      publication.innerHTML = contenusAttente[index];
      publication.classList.remove('instagram-embed-shell--charge');
    });
    var scriptInstagram = document.getElementById('instagram-embed-script');
    if (scriptInstagram) scriptInstagram.remove();
  }

  function traiterInstagram() {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  }

  function chargerInstagram() {
    publications.forEach(function (publication) {
      var url = publication.getAttribute('data-permalink');
      publication.classList.add('instagram-embed-shell--charge');
      publication.innerHTML =
        '<blockquote class="instagram-media" data-instgrm-permalink="' + url + '" data-instgrm-version="14">' +
          '<a href="' + url + '" target="_blank" rel="noopener noreferrer">Voir cette publication sur Instagram</a>' +
        '</blockquote>';
    });

    if (window.instgrm && window.instgrm.Embeds) {
      traiterInstagram();
      return;
    }
    if (document.getElementById('instagram-embed-script')) return;
    var script = document.createElement('script');
    script.id = 'instagram-embed-script';
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    script.onload = traiterInstagram;
    document.body.appendChild(script);
  }

  function appliquerInstagram(choix) {
    var consentement = choix || window.monchaiConsent || { tiers: false };
    if (consentement.tiers) chargerInstagram();
    else remettreAttente();
  }

  window.addEventListener('monchai:consent', function (event) {
    appliquerInstagram(event.detail);
  });
  appliquerInstagram();
})();
