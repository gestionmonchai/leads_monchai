/* Filtres par catégorie de l'index des actualités réglementaires.
   Masquage côté client uniquement : les pages hubs actualites-<categorie>.html
   restent les vraies pages de catégorie pour les moteurs de recherche. */
(function () {
  'use strict';
  var barre = document.getElementById('actusFiltres');
  if (!barre) return;

  barre.addEventListener('click', function (e) {
    var bouton = e.target.closest('.actus-filtre');
    if (!bouton) return;
    var cat = bouton.getAttribute('data-categorie');

    barre.querySelectorAll('.actus-filtre').forEach(function (b) {
      var actif = b === bouton;
      b.classList.toggle('est-actif', actif);
      b.setAttribute('aria-pressed', actif ? 'true' : 'false');
    });

    document.querySelectorAll('.actu-fiche').forEach(function (fiche) {
      var visible = cat === 'tout' || fiche.getAttribute('data-categorie') === cat;
      fiche.classList.toggle('est-masquee', !visible);
    });
  });
})();