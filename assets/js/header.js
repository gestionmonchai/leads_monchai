/* =========================================================
   Mon Chai, header partagé
   Chargé par index.html et par les 8 pages « Le logiciel ».
   1. tiroir de navigation (bouton menu, sous 900px)
   2. menus déroulants « Le logiciel » et « À propos » (au-dessus de 900px)
   ========================================================= */

(function () {
  'use strict';

  /* Un seul point de bascule pour le CSS et le JS : matchMedia lit la même
     largeur que la media query, contrairement à innerWidth qui compte la
     barre de défilement. */
  var NAV_HORIZ = window.matchMedia('(min-width: 900px)');

  var hd     = document.querySelector('.hd');
  var burger = document.querySelector('.hd__burger');
  if (!hd) return;


  /* ---------- 1. Tiroir (petit écran) ---------- */
  function fermerTiroir() {
    hd.classList.remove('est-deploye');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var ouvert = hd.classList.toggle('est-deploye');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
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
  var menus = [].slice.call(document.querySelectorAll('.hd__menu'));

  function toutFermer(sauf) {
    menus.forEach(function (m) {
      if (m === sauf) return;
      m.classList.remove('est-ouvert');
      var b = m.querySelector('.hd__lien');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  menus.forEach(function (menu) {
    var bouton = menu.querySelector('.hd__lien');
    if (!bouton) return;
    var timer = null;

    function ouvrir() {
      if (!NAV_HORIZ.matches) return;   // sous 900px le sous-menu est déjà déplié
      clearTimeout(timer);
      toutFermer(menu);
      menu.classList.add('est-ouvert');
      bouton.setAttribute('aria-expanded', 'true');
    }
    function fermer() {
      menu.classList.remove('est-ouvert');
      bouton.setAttribute('aria-expanded', 'false');
    }
    // 160 ms : le temps de traverser l'espace entre le lien et le panneau
    function fermerDiffere() { timer = setTimeout(fermer, 160); }

    menu.addEventListener('mouseenter', ouvrir);
    menu.addEventListener('mouseleave', fermerDiffere);

    bouton.addEventListener('keydown', function (e) {
      if (!NAV_HORIZ.matches) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menu.classList.contains('est-ouvert') ? fermer() : ouvrir();
      }
    });

    menu.__fermer = fermer;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { toutFermer(null); fermerTiroir(); }
  });

  document.addEventListener('click', function (e) {
    var dans = menus.some(function (m) { return m.contains(e.target); });
    if (!dans) toutFermer(null);
  });
})();
