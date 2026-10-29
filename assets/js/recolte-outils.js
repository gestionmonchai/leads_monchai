/* Mesure du guide uniquement après accord audience. Aucun rattrapage après refus. */
(function () {
  'use strict';
  var organismes = ['civc','civa','bnic','interloire','anivin','bnia','inter-beaujolais','ivbd','civb','bivb','uivc','bivc','civ-corse','civj','civl','inter-oc','cnpc','civp','inter-rhone','civr','civs','ivse','ivso'];
  function mesurer(event, champs) {
    try {
      if (!window.monchaiConsent || window.monchaiConsent.audience !== true) return;
      (window.dataLayer = window.dataLayer || []).push(Object.assign({event:event, contenu:'recolte_2026'}, champs));
    } catch (e) { /* Lecture et téléchargements restent disponibles. */ }
  }
  document.addEventListener('click', function (e) {
    var lien = e.target.closest('a[data-recolte-action]');
    if (lien) {
      var action = lien.getAttribute('data-recolte-action');
      if (action === 'exemple_pdf' || action === 'checklist_pdf') mesurer('recolte_document_ouvert', {document_recolte:action});
      if (action === 'essai_guide') mesurer('recolte_essai_clique', {emplacement:'guide'});
    }
    var resume = e.target.closest('summary.recolte-fiche__resume');
    if (!resume) return;
    var fiche = resume.parentElement;
    var organisme = (fiche.getAttribute('aria-labelledby') || '').replace(/^recolte-/, '');
    if (!fiche.open && organismes.indexOf(organisme) !== -1) mesurer('recolte_interprofession_ouverte', {interprofession:organisme});
  });
})();
