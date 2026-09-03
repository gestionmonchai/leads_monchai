/* =========================================================
   Mon Chai, header partagé
   Chargé par toutes les pages publiques dotées du header partagé.
   1. tiroir de navigation (bouton menu, sous 900px)
   2. menus déroulants de la rangée principale (au-dessus de 900px)
   ========================================================= */

(function () {
  'use strict';

  /* Un seul point de bascule pour le CSS et le JS : matchMedia lit la même
     largeur que la media query, contrairement à innerWidth qui compte la
     barre de défilement. */
  var NAV_HORIZ = window.matchMedia('(min-width: 900px)');

  /* Le header de référence est dessiné sur 1920 px. Publier son facteur ici
     permet aux pages éditoriales d'utiliser exactement le même composant que
     l'accueil, même lorsqu'elles ne chargent pas script.js. */
  function publierEchelle() {
    document.documentElement.style.setProperty('--echelle', window.innerWidth / 1920);
  }
  window.addEventListener('resize', publierEchelle);
  publierEchelle();

  var hd     = document.querySelector('.hd');
  var burger = document.querySelector('.hd__burger');
  if (!hd) return;
  var menus = [].slice.call(document.querySelectorAll('.hd__menu'));

  function boutonDe(menu) {
    return menu && menu.querySelector('.hd__declencheur');
  }

  function fermerMenu(menu) {
    if (!menu) return;
    menu.classList.remove('est-ouvert');
    var bouton = boutonDe(menu);
    if (bouton) bouton.setAttribute('aria-expanded', 'false');
  }

  function toutFermer(sauf) {
    menus.forEach(function (menu) {
      if (menu !== sauf) fermerMenu(menu);
    });
  }

  function ouvrirMenu(menu) {
    if (!menu) return;
    toutFermer(menu);
    menu.classList.add('est-ouvert');
    var bouton = boutonDe(menu);
    if (bouton) bouton.setAttribute('aria-expanded', 'true');
  }


  /* ---------- 1. Tiroir (petit écran) ---------- */
  function fermerTiroir() {
    hd.classList.remove('est-deploye');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    toutFermer(null);
  }

  if (burger) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var ouvert = hd.classList.toggle('est-deploye');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      if (ouvert) {
        var menuActif = menus.filter(function (menu) {
          var bouton = boutonDe(menu);
          return bouton && bouton.classList.contains('est-actif');
        })[0];
        if (menuActif) ouvrirMenu(menuActif);
      } else {
        toutFermer(null);
      }
    });
  }

  // un clic hors du header referme le tiroir
  document.addEventListener('click', function (e) {
    if (!hd.contains(e.target)) fermerTiroir();
  });

  // au passage en navigation horizontale, le tiroir n'a plus lieu d'être
  function surBascule() { if (NAV_HORIZ.matches) fermerTiroir(); }
  if (NAV_HORIZ.addEventListener) NAV_HORIZ.addEventListener('change', surBascule);
  else if (NAV_HORIZ.addListener) NAV_HORIZ.addListener(surBascule);


  /* ---------- 2. Menus déroulants ---------- */
  menus.forEach(function (menu) {
    var bouton = boutonDe(menu);
    if (!bouton) return;
    var timer = null;

    function ouvrir() {
      if (!NAV_HORIZ.matches) return;   // sous 900px, l'ouverture se fait au clic (accordéon)
      clearTimeout(timer);
      ouvrirMenu(menu);
    }
    // 160 ms : le temps de traverser l'espace entre le lien et le panneau
    function fermerDiffere() {
      if (NAV_HORIZ.matches) timer = setTimeout(function () { fermerMenu(menu); }, 160);
    }

    menu.addEventListener('mouseenter', ouvrir);
    menu.addEventListener('mouseleave', fermerDiffere);

    bouton.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.contains('est-ouvert') ? fermerMenu(menu) : ouvrirMenu(menu);
    });

    bouton.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        ouvrirMenu(menu);
        var premierLien = menu.querySelector('.hd__panneau a');
        if (premierLien) premierLien.focus();
      }
    });

    menu.querySelectorAll('.hd__panneau a').forEach(function (lien) {
      lien.addEventListener('click', function () {
        if (!NAV_HORIZ.matches) fermerTiroir();
      });
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { toutFermer(null); fermerTiroir(); }
  });

  document.addEventListener('click', function (e) {
    var dans = menus.some(function (m) { return m.contains(e.target); });
    if (!dans) toutFermer(null);
  });


  /* ---------- 3. Sélecteur de langue ---------- */
  var langue = document.querySelector('.hd__langue');
  var boutonLangue = langue && langue.querySelector('.hd__langue-bouton');
  function fermerLangues() {
    if (!langue || !boutonLangue) return;
    langue.classList.remove('est-ouvert');
    boutonLangue.setAttribute('aria-expanded', 'false');
  }
  if (boutonLangue) {
    boutonLangue.addEventListener('click', function (e) {
      e.stopPropagation();
      var ouvert = langue.classList.toggle('est-ouvert');
      boutonLangue.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      if (ouvert) toutFermer(null);
    });
  }
  document.addEventListener('click', function (e) {
    if (langue && !langue.contains(e.target)) fermerLangues();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermerLangues();
  });
})();
