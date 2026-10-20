# Page Mon Chai Notes

Page publique : `https://monchai.fr/monchainotes.html`. Créée le 20 octobre 2026.

La page présente l’application Android, le parcours voix/clavier → vérification → envoi, les cinq opérations de terrain, six écrans et le téléchargement. Les fonctions côté ventes sont conditionnées à l’ouverture de la facturation pour l’exploitation. Aucun lien de boutique ni badge de disponibilité en magasin n’est affiché : Google Play et App Store sont à venir, selon Denis.

## Sources produit et images

- Projet de l’app : `Mon Chai Notes/docs/PLAY_STORE/FICHE.md`, contrat API et composants de l’app. Les captures proviennent de `docs/PLAY_STORE/visuels/captures/` : six PNG 1200 × 2400, app réelle sur un domaine fictif de démonstration, prises les 12 et 13 octobre. L’icône vient de `docs/PLAY_STORE/visuels/icone-512.png`.
- Aucun numéro de version n’est promis sur la page : les captures peuvent précéder la version distribuée et leur contexte est indiqué.
- La saisie hors réseau est distinguée de la transcription et de l’envoi, qui nécessitent Internet.
- La politique de confidentialité existante documente Mon Chai Notes, dont les fonctions impayés/règlements lorsque la facturation est ouverte.

## Téléchargement

Le CTA utilise la route existante `https://tester.monchai.fr/administration/connecteur/appareils-mobiles/telecharger/`. Une requête HEAD anonyme a confirmé HTTP 302 vers `/auth/connexion/?next=/administration/connecteur/appareils-mobiles/telecharger/` le 20 octobre. L’APK reste distribué par l’application après authentification et contrôle de l’accès mobile ; aucun binaire n’est copié sur le site statique. Le téléchargement authentifié complet n’a pas été exécuté dans cette livraison.

## Volet UX/UI

- Point d’entrée : entrée « Mon Chai Notes · Android » du menu Le logiciel, pied de page français, carte d’actualité de l’accueil et page Ressources.
- Hiérarchie : nom et proposition de valeur, téléchargement principal, condition de compte, aperçu réel ; parcours en trois étapes ; galerie ; usages et limites réseau ; installation ; FAQ.
- États : page statique lisible sans JavaScript, lien de téléchargement menant à la connexion si nécessaire, six captures avec liens directs de secours sans JS, galerie enrichie au clic, FAQ native. L’accès refusé ou l’absence de version distribuée restent gérés par l’application existante ; le site ne simule pas un téléchargement réussi.
- Feedback : légendes des captures, compteur du carrousel, état ouvert/fermé de la FAQ, date et contexte des captures. Aucun message de téléchargement terminé sans preuve.
- Données affichées : conditions Android/compte/exploitation, exemples en hL, données fictives des captures explicitement signalées. Pas de prix ni de numéro de version supposé.
- Responsive : texte et bouton de téléchargement avant les captures sur téléphone, galerie en deux colonnes puis trois ; aucun défilement horizontal de page. Vérifications à 320, 390, 768, 1024 et 1440 px.
- Accessibilité : lien d’évitement, un H1, H2/H3, liens et boutons nommés, descriptions d’images, focus visible, FAQ native. Galerie partagée avec fermeture Échap, navigation et restitution du focus ; animations désactivables via prefers-reduced-motion.
- Cohérence : polices et palette du site, header/footer/consentement et galerie existants. Styles spécifiques limités à cette page. Le popup commercial général n’est pas chargé sur la page d’installation.

## Critères d’acceptation

1. Depuis l’accueil ou le menu, ouvrir la page puis suivre le CTA vers la route officielle, avec reprise après connexion.
2. Afficher les six captures, ouvrir la galerie, passer à la suivante, fermer par Échap et retrouver le focus sur la vignette initiale.
3. Sur les cinq largeurs contrôlées, titre et CTA restent lisibles et les images chargent. Aucune promesse de boutique disponible ni de transcription hors ligne.
4. Vérifier le JSON-LD, les liens/ancres/assets, l’entrée du sitemap et l’ouverture des réponses de FAQ. Le téléchargement authentifié requiert une vérification distincte avec un compte ayant l’accès mobile.
