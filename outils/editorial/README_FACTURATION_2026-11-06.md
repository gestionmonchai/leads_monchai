# Article facturation électronique du 6 novembre 2026

Demande : publier un point d'actualité et expliquer la préparation de Mon Chai.
Article distinct du calendrier historique, avec liens réciproques. Publication
française uniquement, sans fausse traduction ni changement des autres langues.

## Préconisation UX/UI

- Problème : comprendre les votes de novembre et distinguer fichier Factur-X,
  plateforme agréée et e-reporting, sans confondre fonction livrée et projet.
- Point d'entrée : carte principale de l'actualité sur l'accueil, première carte
  des hubs réglementaire et Ventes & facturation, lien depuis le calendrier.
- Hiérarchie : date de vérification, résumé, actualité parlementaire, échéances,
  ventes du domaine, fonctions disponibles, étapes restantes, préparation, sources.
- États : lecture statique complète avec ou sans JavaScript ; pas de chargement,
  de saisie, de succès ni de permission propre à cet article. Un lien de contact
  et le module Ventes restent disponibles si le lecteur a une question.
- Feedback : liens nommés, ancres de sommaire, focus visible et liens sources
  placés près des faits ; aucune simulation d'envoi ou d'agrément.
- Données : actualité arrêtée au 6 novembre ; chiffres du bilan d'octobre datés ;
  échéances distinguées selon taille et opération ; sources officielles uniquement.
- Responsive : composants éditoriaux existants, listes et paragraphes sans tableau
  large ; une carte principale remplace la présentation générique de l'essai,
  les quatre cartes secondaires sont conservées.
- Accessibilité : un H1, titres hiérarchisés, sommaire nommé, lien d'évitement,
  navigation clavier, images décoratives de carte sans doublon vocal.
- Cohérence : actus.css et actualites-monchai.css, header/footer et CTA existants.

## Critères d'acceptation UX/UI

1. Le lecteur trouve le nouvel article depuis les trois entrées et son calendrier.
2. Le texte distingue le vote du 3 novembre du rejet budgétaire du 4 novembre,
   sans annoncer un report en vigueur ; réception 2026 et émission PME 2027.
3. Le prêt annoncé porte sur les données et le fichier ; le raccordement PA,
   les retours de statuts et l'e-reporting automatique restent explicitement à venir.
4. Lecture mobile/ordinateur, ancres et liens fonctionnels, sans débordement.
5. Métadonnées, Article/Breadcrumb et sitemap cohérents ; garde statique verte.

## Fondement des affirmations produit

Lecture du dépôt applicatif le 6 novembre 2026 :
`apps/commerce/facturx.py`, `apps/commerce/document_pdf.py`,
`templates/commerce/document_detail.html`, `apps/commerce/test_facturx.py`,
`docs/CDC_FACTURX.md`. Génération conditionnée aux données ; repli PDF sans XML
en cas d'informations insuffisantes. L'inspection du code ne constitue pas une
certification ni une recette de transmission réelle via PA. Aucun partenaire,
agrément, coût de plateforme ou garantie de conformité globale inventé.

Périmètre : contenu du site vitrine. Aucune nouvelle route ni fonction Django ;
pas de réentraînement de l'assistant pour ce lot éditorial.
