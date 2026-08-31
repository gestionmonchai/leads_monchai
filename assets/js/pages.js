/* =========================================================
   Mon Chai, pages « Le logiciel »
   Mise à l'échelle de la scène 1920 au-dessus de 1200px.
   Le header (tiroir, menus déroulants) est dans assets/js/header.js,
   partagé avec index.html.
   ========================================================= */

(function () {
  'use strict';

  /* matchMedia plutôt qu'innerWidth : il lit la même largeur que la media
     query CSS, sans compter la barre de défilement. */
  var GRAND_ECRAN = window.matchMedia('(min-width: 1200px)');
  var page = document.getElementById('page');
  var W = 1920;

  function fit() {
    if (!page) return;

    if (!GRAND_ECRAN.matches) {
      // sous 1200px la page est en flux : on retire tout ce que le mode
      // « scène » avait posé en style en ligne.
      page.style.transform = '';
      document.body.style.height = '';
      return;
    }

    var scale = window.innerWidth / W;
    page.style.transform = 'scale(' + scale + ')';
    // la hauteur dépend du contenu (une page module, la page annuaire et son
    // pied de page n'ont pas la même) : on la lit plutôt que de la fixer.
    document.body.style.height = (page.offsetHeight * scale) + 'px';
  }

  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  if (GRAND_ECRAN.addEventListener) GRAND_ECRAN.addEventListener('change', fit);
  else if (GRAND_ECRAN.addListener) GRAND_ECRAN.addListener(fit);
  fit();
})();
