/* Le header partagé se met à l’échelle sur la largeur disponible, hors scrollbar. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header--page');
  if (!header) return;
  function ajuster() {
    if (window.matchMedia('(min-width:1200px)').matches) {
      header.style.setProperty('--echelle', document.documentElement.clientWidth / 1920);
    } else {
      header.style.removeProperty('--echelle');
    }
  }
  ajuster();
  window.addEventListener('resize', ajuster);
  window.addEventListener('load', ajuster);
})();
