/* Les panneaux et leur contenu fonctionnent sans ce complément JavaScript. */
(function () {
  'use strict';

  function ouvrirAncre() {
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch (e) { return; }
    if (!id) return;
    var titre = document.getElementById(id);
    var fiche = titre && titre.closest('details.recolte-fiche');
    if (!fiche) return;
    fiche.open = true;
    window.requestAnimationFrame(function () {
      titre.scrollIntoView({ block: 'start' });
      titre.focus({ preventScroll: true });
    });
  }

  window.addEventListener('hashchange', ouvrirAncre);
  document.addEventListener('click', function (event) {
    var lien = event.target.closest('a[href^="#recolte-"]');
    if (!lien) return;
    var titre = document.getElementById(lien.hash.slice(1));
    var fiche = titre && titre.closest('details.recolte-fiche');
    if (fiche) fiche.open = true;
    // Un second clic sur l'ancre courante ne déclenche pas hashchange.
    if (lien.hash === window.location.hash) ouvrirAncre();
  });
  ouvrirAncre();

  var avantImpression = null;
  window.addEventListener('beforeprint', function () {
    if (avantImpression) return;
    avantImpression = Array.prototype.map.call(
      document.querySelectorAll('details.recolte-fiche'),
      function (fiche) {
        var etat = { fiche: fiche, ouvert: fiche.open };
        fiche.open = true;
        return etat;
      }
    );
  });
  window.addEventListener('afterprint', function () {
    if (!avantImpression) return;
    avantImpression.forEach(function (etat) { etat.fiche.open = etat.ouvert; });
    avantImpression = null;
  });
})();
