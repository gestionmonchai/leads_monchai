/* =========================================================
   Mon Chai, page Contact : formulaire -> envoi du mail (EmailJS)
   Mécanisme repris du formulaire bêta d'index.html (script.js, § 10) :
   honeypot, délai minimal, limitation de fréquence, validation, puis
   message de confirmation à la place du formulaire.

   Le gabarit EmailJS est, pour l'instant, celui du formulaire bêta : ses
   champs (activite, outil, priorite…) sont réutilisés pour porter l'objet,
   le choix newsletter et le message, et les champs propres au contact
   (objet, message, newsletter) sont envoyés en plus. Quand un gabarit
   « contact » existera dans EmailJS, il suffira de changer TEMPLATE_ID.
   ========================================================= */
(function () {
  'use strict';

  var CLE_PUBLIQUE = 'SW76TlsTwVd5Z8v8y';
  var SERVICE_ID   = 'service_dmflavl';
  var TEMPLATE_ID  = 'template_yajlaes';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var g = function (id) { return document.getElementById(id); };
  var objet = g('objet'), message = g('message'), newsletter = g('newsletter');
  var aide = g('objet-aide'), reqMsg = g('message-req'), facMsg = g('message-fac');
  var email = g('email'), consent = g('consent'), submit = g('submit-btn');
  var retour = g('form-message'), honeypot = g('website');
  var succes = g('ctSucces'), succesTitre = g('ctSuccesTitre'), succesTexte = g('ctSuccesTexte');
  var libelleBtn = submit.textContent;
  var placeholderMsg = message.getAttribute('placeholder') || '';
  var chargePage = Date.now();
  var ejsPret = false;


  /* ---------- 1. Objet de la demande ----------
     Une aide par objet, sous le menu. Pour la newsletter, le message devient
     facultatif et la case est cochée : il n'y a rien d'autre à dire. */
  var AIDES = {
    demo:        'Indiquez vos disponibilités et ce que vous aimeriez voir en priorité : parcelles, cave, stocks, facturation, DRM…',
    essai:       'Dites-nous en quelques mots votre activité et vos outils actuels, nous revenons vers vous rapidement.',
    api:         'Précisez l’outil ou le service à connecter, et les données à échanger : clients, produits, stocks, factures…',
    newsletter:  'Rien d’autre à remplir : validez, et vous recevrez les prochaines nouvelles de Mon Chai.',
    tarifs:      'Posez votre question : essai gratuit, nombre d’utilisateurs, facturation, résiliation…',
    formation:   'Indiquez les modules à prendre en main et les fichiers à reprendre : clients, produits, tarifs, parcelles…',
    assistance:  'Décrivez ce qui bloque, en précisant le module concerné : nous vous répondons directement.',
    partenariat: '',
    autre:       ''
  };

  function libelleObjet() {
    var o = objet.options[objet.selectedIndex];
    return o && o.value ? o.textContent.trim() : '';
  }

  function appliquerObjet() {
    var k = objet.value;
    var texte = AIDES[k] || '';
    aide.textContent = texte;
    aide.hidden = !texte;

    var nl = (k === 'newsletter');
    if (nl) newsletter.checked = true;
    reqMsg.hidden = nl;
    facMsg.hidden = !nl;
    message.required = !nl;
    message.setAttribute('placeholder', nl ? 'Un mot si vous le souhaitez.' : placeholderMsg);
  }

  objet.addEventListener('change', appliquerObjet);

  // ?objet=api, ?objet=newsletter… : l'objet arrive présélectionné depuis
  // les autres pages (tarifs.html, liens du panneau).
  function choisir(k) {
    if (!k) return false;
    var ok = !!objet.querySelector('option[value="' + k + '"]');
    if (ok) { objet.value = k; appliquerObjet(); }
    return ok;
  }
  try { choisir(new URLSearchParams(window.location.search).get('objet')); } catch (e) {}

  // Les ancres du panneau gauche : elles mènent au formulaire ET choisissent l'objet.
  document.querySelectorAll('[data-objet]').forEach(function (a) {
    a.addEventListener('click', function () {
      var k = a.getAttribute('data-objet');
      choisir(k);
      // le saut d'ancre a lieu d'abord, le focus ensuite, sans nouveau défilement
      setTimeout(function () {
        var cible = (k === 'newsletter') ? email : message;
        try { cible.focus({ preventScroll: true }); } catch (e) { cible.focus(); }
      }, 300);
    });
  });

  appliquerObjet();


  /* ---------- 2. Limitation de fréquence (localStorage) ---------- */
  var CLE_RL = 'monchai_contact_submissions';
  function lireRL() {
    try {
      var d = JSON.parse(localStorage.getItem(CLE_RL));
      if (!d || typeof d !== 'object') return { a: [], b: 0 };
      if (!Array.isArray(d.a)) d.a = [];
      if (typeof d.b !== 'number') d.b = 0;
      return d;
    } catch (e) { return { a: [], b: 0 }; }
  }
  function ecrireRL(d) { try { localStorage.setItem(CLE_RL, JSON.stringify(d)); } catch (e) {} }
  function verifRL() {
    var d = lireRL(), now = Date.now();
    if (d.b > now) return { ok: false, attendre: Math.ceil((d.b - now) / 1000) };
    d.a = d.a.filter(function (t) { return now - t < 300000; });
    if (d.a.length) {
      var last = d.a[d.a.length - 1];
      if (now - last < 30000) return { ok: false, attendre: Math.ceil((30000 - (now - last)) / 1000) };
    }
    if (d.a.length >= 5) { d.b = now + 300000; ecrireRL(d); return { ok: false, trop: true }; }
    return { ok: true };
  }
  function enregistrerRL() { var d = lireRL(); d.a.push(Date.now()); ecrireRL(d); }


  /* ---------- 3. Envoi ---------- */
  function afficher(type, texte) {
    retour.textContent = texte;
    retour.className = 'ct__message ' + (type === 'ok' ? 'ok' : 'err');
    retour.style.display = 'block';
  }
  function cacher() { retour.style.display = 'none'; retour.textContent = ''; }
  function etatBouton(off, texte) { submit.disabled = off; submit.textContent = texte || libelleBtn; }
  function invalide(el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  function net(el) { return (el && el.value ? el.value.trim() : ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    cacher();
    ['prenom', 'nom', 'email', 'objet', 'message'].forEach(function (id) { g(id).removeAttribute('aria-invalid'); });

    if (honeypot && honeypot.value) return;
    if (Date.now() - chargePage < 2000) return;

    var rl = verifRL();
    if (!rl.ok) {
      afficher('err', rl.trop ? 'Trop de tentatives. Réessayez dans quelques minutes.'
                              : 'Merci de patienter ' + rl.attendre + ' s avant un nouvel envoi.');
      return;
    }

    var requis = ['prenom', 'nom'];
    for (var k = 0; k < requis.length; k++) {
      if (!net(g(requis[k]))) { afficher('err', 'Merci de remplir les champs obligatoires (*).'); invalide(g(requis[k])); return; }
    }

    var mail = net(email).toLowerCase();
    var rx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!mail || mail.length > 100 || !rx.test(mail)) { afficher('err', 'Merci de saisir une adresse e-mail valide.'); invalide(email); return; }

    if (!objet.value) { afficher('err', 'Merci de choisir l’objet de votre demande.'); invalide(objet); return; }

    var nl = newsletter.checked;
    var texte = net(message);
    if (objet.value !== 'newsletter' && !texte) { afficher('err', 'Merci d’écrire votre message.'); invalide(message); return; }

    if (!consent.checked) { afficher('err', 'Merci d’accepter l’utilisation de vos informations pour continuer.'); consent.focus(); return; }

    if (typeof emailjs === 'undefined') { afficher('err', 'Service momentanément indisponible. Réessayez dans un instant ou écrivez-nous à contact@monchai.fr.'); return; }
    if (!ejsPret) { emailjs.init(CLE_PUBLIQUE); ejsPret = true; }

    var libelle = libelleObjet();
    etatBouton(true, 'Envoi…');
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      from_email: mail,
      prenom: net(g('prenom')),
      nom: net(g('nom')),
      telephone: net(g('telephone')),
      domaine: net(g('domaine')),
      // champs du gabarit bêta, réemployés
      siret: '(sans objet)',
      activite: 'Contact · ' + libelle,
      outil: 'Newsletter : ' + (nl ? 'oui' : 'non'),
      priorite: texte || '(pas de message)',
      // champs propres au contact, pour un futur gabarit dédié
      objet: objet.value,
      objet_libelle: libelle,
      message: texte,
      newsletter: nl ? 'oui' : 'non',
      consentement: 'oui',
      source: 'monchai-contact-2026',
      sent_at: new Date().toISOString()
    }).then(function () {
      enregistrerRL();
      if (objet.value === 'newsletter') {
        succesTitre.textContent = 'Votre inscription est enregistrée.';
        succesTexte.textContent = 'Vous recevrez les prochaines nouvelles de Mon Chai à l’adresse ' + mail + '.';
      } else {
        succesTitre.textContent = 'Votre message est bien parti.';
        succesTexte.textContent = 'L’équipe Mon Chai vous répond directement, par e-mail, à l’adresse ' + mail + '.'
          + (nl ? ' Votre inscription à la newsletter est enregistrée.' : '');
      }
      form.hidden = true;
      succes.hidden = false;
      try { succes.scrollIntoView({ block: 'nearest' }); } catch (err) {}
    }).catch(function (err) {
      console.error('[MonChai] EmailJS :', err);
      afficher('err', 'Une erreur est survenue. Réessayez ou écrivez-nous à contact@monchai.fr.');
      etatBouton(false);
    });
  });
})();
