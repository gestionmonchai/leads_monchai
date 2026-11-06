# Retrait de l'offre close le 31 octobre, 6 novembre 2026

Demande de Denis : supprimer partout sur le site l'offre expirée. L'ancienne
gratuité du logiciel jusqu'au 31 décembre pour les inscriptions avant fin
octobre disparaît des 32 pages concernées dans les cinq langues.

## Volet UX/UI

- Entrées : accueil et fenêtre d'essai, tarifs, essai gratuit, FAQ, appels à
  l'action des actualités réglementaires, facturation et paquet vin.
- Hiérarchie : essai actuel de 30 jours, choix de poursuivre, abonnement
  existant à 59 € HT/mois ou 590 € HT/an. Les titres, badges et questions ne
  renvoient plus à l'ancien lancement ni à un démarrage au 1er janvier.
- États : contenu public statique ; ancienne section et question tarifaire
  retirées. L'essai courant et ses liens fonctionnent sans nouveau contrôle,
  chargement ou état d'erreur. Les accordéons gardent leur interaction.
- Feedback : durée de 30 jours lisible dans les cartes et réponses d'essai ;
  décision de poursuivre à la fin de l'essai et absence de carte bancaire.
- Données : la suppression de la gratuité logicielle expirée ne modifie pas
  les tarifs existants ni les conditions distinctes de formation/import déjà
  affichées jusqu'au 31 décembre. Aucune modification des comptes et avantages
  déjà accordés dans l'application ; aucune date réglementaire supprimée.
- Responsive : mêmes composants et mises en page ; vérifier les libellés
  traduits, les cartes de prix et les paragraphes à 320/390/1440 px.
- Accessibilité : titres cohérents après retrait du bloc obsolète, boutons et
  liens conservés, accordéons utilisables au clavier et focus existant.
- Référencement : meta descriptions et FAQ JSON-LD nettoyées ; questions
  obsolètes retirées aussi du balisage ; lastmod du sitemap actualisé.
- Critères : aucune mention de l'offre du 31 octobre dans les documents HTML
  publics ni leurs données structurées ; cinq langues couvertes ; un seul
  chapitre d'essai courant ; liens et FAQ valides, pas de débordement nouveau.
- Observabilité : inventaire des pages, contrôle intégral des mentions,
  données structurées, garde de cohérence et rendu navigateur conservés dans
  `docs/site_vitrine/retrait_offre_31_octobre_2026-11-06/` du dépôt applicatif.

Cette retouche ne crée aucun bouton ni route dans l'application Django et ne
change pas les procédures de son assistant. Les historiques internes et preuves
des versions précédentes restent conservés hors du site public.
