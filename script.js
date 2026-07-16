/* =========================================================
   1. Mise à l'échelle des écrans 1920×1200
   ========================================================= */
const page = document.getElementById('page');
const W = 1920, H = 1200;

const liensHeader = document.querySelector('.site-header__liens');

function fit() {
  if (window.innerWidth <= 820) {
    page.style.transform = '';
    document.body.style.height = '';
    if (liensHeader) liensHeader.style.transform = '';
    return;
  }
  const scale = window.innerWidth / W;
  page.style.transform = 'scale(' + scale + ')';

  // les écrans n'ont pas tous la même hauteur (1200 pour Accueil/Pourquoi,
  // 1081 pour les autres, recadrés de leur bande de header) et se chevauchent
  // d'1px : on lit donc la hauteur réelle de .page plutôt que de l'additionner.
  document.body.style.height = (page.offsetHeight * scale) + 'px';

  // les zones cliquables du header suivent la même échelle
  if (liensHeader) liensHeader.style.transform = 'scale(' + scale + ')';
}
window.addEventListener('resize', fit);
fit();


/* =========================================================
   1 bis. Navigation mobile
   ========================================================= */
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.getElementById('mobileNav');

function fermerMenuMobile() {
  if (!mobileMenuBtn || !mobileNav) return;
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('est-ouvert');
}

if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', function () {
    const ouvert = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', String(!ouvert));
    mobileNav.classList.toggle('est-ouvert', !ouvert);
  });
  mobileNav.querySelectorAll('a, button').forEach(function (element) {
    element.addEventListener('click', fermerMenuMobile);
  });
  document.addEventListener('click', function (event) {
    if (!mobileNav.contains(event.target) && !mobileMenuBtn.contains(event.target)) fermerMenuMobile();
  });
}

// Cartes modules mobiles : un toucher fige l'état animé, comme sur desktop.
const mobileModuleCards = Array.prototype.slice.call(document.querySelectorAll('.mobile-module-card'));
const mobileModulePanel = document.getElementById('mobileModulePanel');
const mobileModuleTitle = document.getElementById('mobileModuleTitle');
const mobileModuleList = document.getElementById('mobileModuleList');
const mobileModuleContent = {
  parcelles: ['Parcelles', 'Suivi des parcelles', 'Interventions', 'Informations clés du vignoble'],
  vendanges: ['Vendanges', 'Encuvages', 'Pressurages', 'Rendements'],
  cuverie: ['Cuverie', 'Assemblages', 'Soutirages', 'Élevage et analyses'],
  mises: ['Mises', 'Planificateur', 'Embouteillage', 'Matières sèches'],
  stocks: ['Stocks', 'Lots commerciaux', 'Inventaires', 'Valorisation'],
  ventes: ['Ventes', 'Devis et factures', 'Livraisons', 'Caisse'],
  clients: ['Clients', 'Segmentation', 'Historique des achats', 'Prospection'],
  administratif: ['Administratif', 'Déclarations', 'Douane et capsules', 'Registres'],
  'tableaux-de-bord': ['Tableaux de bord', 'Indicateurs', 'Coûts et marges', 'Vue globale']
};
function cacherPanneauModuleMobile() {
  if (mobileModulePanel) mobileModulePanel.hidden = true;
}
function afficherPanneauModuleMobile(card) {
  if (!mobileModulePanel || !mobileModuleTitle || !mobileModuleList) return;
  const contenu = mobileModuleContent[card.dataset.mobileModule];
  if (!contenu) return;
  mobileModuleTitle.textContent = contenu[0];
  mobileModuleList.replaceChildren();
  contenu.slice(1).forEach(function (texte) {
    const item = document.createElement('li');
    item.textContent = texte;
    mobileModuleList.appendChild(item);
  });
  mobileModulePanel.hidden = false;
}
function fermerModulesMobiles(exception) {
  mobileModuleCards.forEach(function (card) {
    if (card === exception) return;
    card.classList.remove('est-actif');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-expanded', 'false');
  });
  if (!exception) cacherPanneauModuleMobile();
}
mobileModuleCards.forEach(function (card) {
  card.setAttribute('aria-controls', 'mobileModulePanel');
  card.setAttribute('aria-expanded', 'false');
  card.addEventListener('click', function (event) {
    event.stopPropagation();
    const activer = !card.classList.contains('est-actif');
    fermerModulesMobiles();
    card.classList.toggle('est-actif', activer);
    card.setAttribute('aria-pressed', String(activer));
    card.setAttribute('aria-expanded', String(activer));
    if (activer) afficherPanneauModuleMobile(card);
  });
});
if (mobileModulePanel) {
  mobileModulePanel.addEventListener('click', function (event) { event.stopPropagation(); });
  const fermerPanneau = mobileModulePanel.querySelector('.mobile-module-panel__close');
  if (fermerPanneau) fermerPanneau.addEventListener('click', function () { fermerModulesMobiles(); });
}
document.addEventListener('click', function () { fermerModulesMobiles(); });
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') fermerModulesMobiles();
});


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
   8. Pop-up « M'inscrire au programme bêta-test »
      Ouverte par tout élément [data-beta], fermée par la croix, le fond
      sombre ou la touche Échap.
   ========================================================= */
const modal = document.getElementById('modalBeta');
let elementAvantModal = null;

function ouvrirModal(e) {
  if (e) e.preventDefault();
  elementAvantModal = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';      // fige le scroll de fond
  const fermer = modal.querySelector('.modal__fermer');
  if (fermer) fermer.focus();
}
function fermerModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (elementAvantModal && typeof elementAvantModal.focus === 'function') elementAvantModal.focus();
}

// API publique légère : permet à n’importe quel CTA futur d’ouvrir le formulaire.
window.declencherFormulaireBeta = ouvrirModal;

document.querySelectorAll('[data-beta]').forEach(function (b) {
  b.addEventListener('click', ouvrirModal);
});
modal.querySelectorAll('[data-fermer]').forEach(function (el) {
  el.addEventListener('click', fermerModal);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.hidden) fermerModal();
});


/* =========================================================
   10. Formulaire d'inscription bêta-test -> envoi du mail (EmailJS)
       Formulaire complet (prénom, nom, e-mail pro, tél, domaine, SIRET,
       activité, outil, priorité, consentement). Anti-spam : honeypot +
       timing + limitation de fréquence. Succès -> message de confirmation.
   ========================================================= */
(function () {
  var CLE_PUBLIQUE = 'SW76TlsTwVd5Z8v8y';
  var SERVICE_ID   = 'service_fjuir5i';
  var TEMPLATE_ID  = 'template_yajlaes';

  var form = document.getElementById('waitlist-form');
  if (!form) return;

  var g = function (id) { return document.getElementById(id); };
  var email = g('email'), consent = g('consent'), submit = g('submit-btn');
  var message = g('form-message'), honeypot = g('website'), succes = g('modalSucces');
  var siret = g('siret');
  var libelleBtn = submit.textContent;
  // Horloge monotone : insensible aux changements manuels de date/heure.
  var chargePage = performance.now();
  var ejsPret = false;

  var CLE_RL = 'monchai_form_submissions';
  function lireRL(){
    try {
      var d = JSON.parse(localStorage.getItem(CLE_RL));
      if (!d || typeof d !== 'object') return {a:[], b:0};
      if (!Array.isArray(d.a)) d.a = [];            // format ancien / corrompu
      if (typeof d.b !== 'number') d.b = 0;
      return d;
    } catch(e){ return {a:[], b:0}; }
  }
  function ecrireRL(d){ try { localStorage.setItem(CLE_RL, JSON.stringify(d)); } catch(e){} }
  function verifRL(){
    var d=lireRL(), now=Date.now();
    if (d.b>now) return {ok:false, attendre:Math.ceil((d.b-now)/1000)};
    d.a=d.a.filter(function(t){return now-t<300000;});
    if (d.a.length){ var last=d.a[d.a.length-1]; if (now-last<30000) return {ok:false, attendre:Math.ceil((30000-(now-last))/1000)}; }
    if (d.a.length>=5){ d.b=now+300000; ecrireRL(d); return {ok:false, trop:true}; }
    return {ok:true};
  }
  function enregistrerRL(){ var d=lireRL(); d.a.push(Date.now()); ecrireRL(d); }

  function afficher(type, texte){ message.textContent=texte; message.className='modal__message '+(type==='ok'?'ok':'err'); message.style.display='block'; }
  function cacher(){ message.style.display='none'; message.textContent=''; }
  function etatBouton(off, texte){ submit.disabled=off; submit.textContent=texte||libelleBtn; }
  function invalide(el){ el.setAttribute('aria-invalid','true'); el.focus(); }
  function net(el){ return (el && el.value ? el.value.trim() : ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    cacher();
    ['prenom','nom','email','domaine','siret','activite'].forEach(function(id){ g(id).removeAttribute('aria-invalid'); });

    if (honeypot && honeypot.value) return;
    if (performance.now() - chargePage < 2000) return;

    var rl = verifRL();
    if (!rl.ok) { afficher('err', rl.trop ? 'Trop de tentatives. Réessayez dans quelques minutes.' : 'Merci de patienter ' + rl.attendre + ' s avant un nouvel envoi.'); return; }

    // champs requis
    var requis = ['prenom','nom','domaine'];
    for (var k=0;k<requis.length;k++){ if (!net(g(requis[k]))){ afficher('err','Merci de remplir les champs obligatoires (*).'); invalide(g(requis[k])); return; } }

    var mail = net(email).toLowerCase();
    var rx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!mail || mail.length>100 || !rx.test(mail)){ afficher('err','Merci de saisir une adresse e-mail valide.'); invalide(email); return; }

    var sir = net(siret).replace(/\s/g,'');
    if (!/^\d{14}$/.test(sir)){ afficher('err','Le SIRET doit comporter 14 chiffres.'); invalide(siret); return; }

    if (!net(g('activite'))){ afficher('err','Merci de sélectionner votre activité.'); invalide(g('activite')); return; }

    if (!consent.checked){ afficher('err','Merci d’accepter la réutilisation de vos informations pour continuer.'); consent.focus(); return; }

    if (typeof emailjs === 'undefined'){ afficher('err','Service momentanément indisponible. Réessayez dans un instant.'); return; }
    if (!ejsPret){ emailjs.init(CLE_PUBLIQUE); ejsPret=true; }

    etatBouton(true, 'Envoi…');
    var nomComplet = net(g('prenom')) + ' ' + net(g('nom'));
    var resume = [
      'Nouvelle demande d’inscription au programme bêta Mon Chai',
      '',
      'Nom : ' + nomComplet,
      'E-mail : ' + mail,
      'Téléphone : ' + (net(g('telephone')) || 'Non renseigné'),
      'Domaine : ' + net(g('domaine')),
      'SIRET : ' + sir,
      'Activité : ' + net(g('activite')),
      'Outil actuel : ' + net(g('outil')),
      'Priorité : ' + (net(g('priorite')) || 'Non renseignée')
    ].join('\n');
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      // Noms standards utilisés par les templates EmailJS « Contact Us ».
      to_email: 'contact@monchai.fr',
      reply_to: mail,
      email: mail,
      name: nomComplet,
      title: 'Nouvelle inscription bêta — ' + net(g('domaine')),
      message: resume,
      from_email: mail,
      prenom: net(g('prenom')),
      nom: net(g('nom')),
      telephone: net(g('telephone')),
      domaine: net(g('domaine')),
      siret: sir,
      activite: net(g('activite')),
      outil: net(g('outil')),
      priorite: net(g('priorite')),
      consentement: 'oui',
      source: 'monchai-landing-2026',
      sent_at: new Date().toISOString()
    }).then(function () {
      enregistrerRL();
      form.style.display = 'none';
      if (succes) succes.hidden = false;
    }).catch(function (err) {
      console.error('[MonChai] EmailJS :', err);
      afficher('err','Une erreur est survenue. Réessayez ou écrivez-nous à contact@monchai.fr.');
      etatBouton(false);
    });
  });

  // à la réouverture de la pop-up, on repart d'un formulaire propre
  document.querySelectorAll('[data-beta]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (succes) succes.hidden = true;
      form.style.display = '';
      cacher(); etatBouton(false); form.reset();
    });
  });
})();


/* =========================================================
   11. Cookies — consentement (conforme CNIL)
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

  function chargerHubSpot() {
    var scriptExistant = document.getElementById('hs-script-loader');

    // Le bandeau maison reste l'unique interface de consentement.
    window.disableHubSpotCookieBanner = true;

    // Réactive le suivi si le consentement avait été retiré dans cette page.
    window._hsq = window._hsq || [];
    window._hsq.push(['doNotTrack', { track: true }]);

    if (scriptExistant) return;

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'hs-script-loader';
    script.async = true;
    script.defer = true;
    script.src = 'https://js-eu1.hs-scripts.com/147891073.js';
    document.body.appendChild(script);
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

  // « Gérer mes cookies » (footer, pages légales) rouvre les réglages
  document.querySelectorAll('[data-cookies]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); ouvrirReglages(); });
  });
  document.querySelectorAll('[data-cookies-fermer]').forEach(function (el) {
    el.addEventListener('click', fermerReglages);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalC && !modalC.hidden) fermerReglages();
  });
})();
