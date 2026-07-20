/* =========================================================
   Landing Mon Chai — interactions du contenu natif.
   Chaque bloc est gardé par l'existence de son élément : le script ne
   présume jamais du DOM de la page qui le charge.
   ========================================================= */

/* =========================================================
   1. Navigation (burger sous 1200 px, menu horizontal au-delà)
   ========================================================= */
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.getElementById('mobileNav');

/* Chrome desktop 1920 px : seul le header et le hero sont mis à l'échelle.
   Le reste de la page demeure un flux HTML natif. */
const siteHeader = document.getElementById('siteHeader');
const liensHeader = document.querySelector('.site-header__liens');
const heroCanvas = document.getElementById('heroDesktopCanvas');
const readingBar = document.getElementById('readingBar');
const dotLinks = Array.prototype.slice.call(document.querySelectorAll('.dot-nav a'));

function ajusterCanvasDesktop() {
  const desktop = window.matchMedia('(min-width:1200px)').matches;
  const scale = window.innerWidth / 1920;
  document.documentElement.style.setProperty('--desktop-scale', desktop ? String(scale) : '1');
  if (liensHeader) liensHeader.style.transform = desktop ? 'scale(' + scale + ')' : '';
  if (heroCanvas) heroCanvas.style.transform = desktop ? 'scale(' + scale + ')' : '';
}
window.addEventListener('resize', function () {
  ajusterCanvasDesktop();
  majChromeDesktop();
});
ajusterCanvasDesktop();

let dernierYChrome = window.scrollY;
let chromeEnAttente = false;

function majChromeDesktop() {
  if (!window.matchMedia('(min-width:1200px)').matches) {
    if (siteHeader) siteHeader.classList.remove('est-masque');
    dernierYChrome = window.scrollY;
    return;
  }
  const y = window.scrollY;
  const delta = y - dernierYChrome;
  if (siteHeader && Math.abs(delta) > 6) {
    siteHeader.classList.toggle('est-masque', delta > 0 && y > 80);
    dernierYChrome = y;
  }
  if (siteHeader && y <= 80) siteHeader.classList.remove('est-masque');

  if (readingBar) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, Math.max(0, y / total * 100)) : 0;
    readingBar.style.width = pct + '%';
  }

  const milieu = y + window.innerHeight / 2;
  let actif = 0;
  dotLinks.forEach(function (lien, index) {
    const section = document.getElementById(lien.dataset.cible);
    if (!section) return;
    const haut = section.getBoundingClientRect().top + y;
    if (milieu >= haut) actif = index;
  });
  dotLinks.forEach(function (lien, index) {
    lien.classList.toggle('est-actif', index === actif);
    if (index === actif) lien.setAttribute('aria-current', 'true');
    else lien.removeAttribute('aria-current');
  });
}

dotLinks.forEach(function (lien) {
  lien.addEventListener('click', function (event) {
    const cible = document.getElementById(lien.dataset.cible);
    if (!cible) return;
    event.preventDefault();
    cible.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

window.addEventListener('scroll', function () {
  if (chromeEnAttente) return;
  chromeEnAttente = true;
  requestAnimationFrame(function () {
    majChromeDesktop();
    chromeEnAttente = false;
  });
}, {passive:true});
majChromeDesktop();

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

// Modules : accordéons tactiles sous 1200 px ; interaction Figma exacte sur
// desktop (survol/focus, clic figé, clic extérieur et Échap).
// Le contenu (taxonomie des 9 modules) vit dans le HTML, pas ici.
const modulesMobiles = Array.prototype.slice.call(document.querySelectorAll('.mm__toggle'));
const mediaModulesDesktop = window.matchMedia('(min-width:1200px)');

function fermerModulesMobiles(exception) {
  modulesMobiles.forEach(function (bouton) {
    if (bouton === exception) return;
    const module = bouton.closest('.mm');
    if (module) module.classList.remove('est-fige');
    bouton.setAttribute('aria-expanded', 'false');
    const panneau = document.getElementById(bouton.getAttribute('aria-controls'));
    if (panneau) panneau.hidden = true;
  });
}

modulesMobiles.forEach(function (bouton) {
  const module = bouton.closest('.mm');
  const panneau = document.getElementById(bouton.getAttribute('aria-controls'));
  bouton.addEventListener('click', function (event) {
    event.stopPropagation();
    if (!module || !panneau) return;

    if (mediaModulesDesktop.matches) {
      const dejaFige = module.classList.contains('est-fige');
      fermerModulesMobiles();
      if (!dejaFige) {
        module.classList.add('est-fige');
        bouton.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    const ouvrir = panneau.hidden;
    fermerModulesMobiles(bouton);
    bouton.setAttribute('aria-expanded', String(ouvrir));
    panneau.hidden = !ouvrir;
  });
  if (panneau) panneau.addEventListener('click', function (event) { event.stopPropagation(); });
});
document.addEventListener('click', function () {
  if (mediaModulesDesktop.matches) fermerModulesMobiles();
});
mediaModulesDesktop.addEventListener('change', function () { fermerModulesMobiles(); });
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    fermerModulesMobiles();
    fermerMenuMobile();
  }
});

// FAQ native : conserve l'accessibilité de <details> et un seul état ouvert.
const questionsFaq = Array.prototype.slice.call(document.querySelectorAll('.mobile-faq details'));
questionsFaq.forEach(function (question) {
  question.addEventListener('toggle', function () {
    if (!question.open) return;
    questionsFaq.forEach(function (autre) { if (autre !== question) autre.open = false; });
  });
});

// EmailJS n'est demandé qu'après une action explicite sur le formulaire.
let promesseEmailJS = null;
function chargerEmailJS() {
  if (window.emailjs) return Promise.resolve(window.emailjs);
  if (promesseEmailJS) return promesseEmailJS;
  promesseEmailJS = new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    script.onload = function () { resolve(window.emailjs); };
    script.onerror = function () { promesseEmailJS = null; reject(new Error('EmailJS indisponible')); };
    document.head.appendChild(script);
  });
  return promesseEmailJS;
}


/* =========================================================
   2. Pop-up « M'inscrire au programme bêta-test »
      Ouverte par tout élément [data-beta], fermée par la croix, le fond
      sombre ou la touche Échap.
   ========================================================= */
const modal = document.getElementById('modalBeta');
let elementAvantModal = null;

if (modal) {

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
modal.addEventListener('keydown', function (e) {
  if (e.key !== 'Tab' || modal.hidden) return;
  const focusables = Array.prototype.slice.call(modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(function (element) { return element.offsetParent !== null; });
  if (!focusables.length) return;
  const premier = focusables[0];
  const dernier = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === premier) {
    e.preventDefault(); dernier.focus();
  } else if (!e.shiftKey && document.activeElement === dernier) {
    e.preventDefault(); premier.focus();
  }
});

}


/* =========================================================
   3. Formulaire d'inscription bêta-test -> envoi du mail (EmailJS)
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

  form.addEventListener('submit', async function (e) {
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

    try { await chargerEmailJS(); }
    catch (erreur) { afficher('err','Service momentanément indisponible. Réessayez dans un instant.'); return; }
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


/* La gestion du consentement cookies (bandeau, réglages, doNotTrack HubSpot)
   vit dans consent.js — source unique partagée avec les pages légales. */
