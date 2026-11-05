# Correction ARIA des diapositives, 5 novembre 2026

Le signalement PageSpeed concerne `article role="group"` : `group` n'est pas
un rôle autorisé pour `article`. Les trois conteneurs de l'accueil deviennent
`div role="group"`. Les libellés de diapositive et les contrôles sont conservés.

Références : [ARIA in HTML](https://www.w3.org/TR/html-aria/) et
[modèle W3C du carrousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/).

## Volet UX/UI

- Entrée : zone Nouveautés de l'accueil français ; boutons IA, Mon Chai Notes,
  Annonces et flèches existants.
- Hiérarchie : région nommée, groupe de la diapositive visible, titre, vidéo,
  description et lien ; choix de diapositive dans un groupe nommé.
- États : une seule diapositive visible ; les autres sont masquées avec
  `hidden`, hors de la navigation et de l'arbre d'accessibilité. Le carrousel
  reste manuel. Sans JavaScript, la première diapositive et les liens de repli
  restent disponibles ; aucun nouveau chargement ou état d'erreur.
- Feedback : choix actif via `aria-pressed`, compteur et annonce existante
  du titre après changement volontaire ; la vidéo quittée est mise en pause.
- Responsive : présentation et dimensions existantes, aucune modification CSS.
- Accessibilité : boutons nommés, navigation au clavier, focus visible,
  conteneurs dont le rôle est autorisé par HTML, une seule diapositive exposée.
- Acceptation : reproduire l'échec axe `aria-allowed-role` avant correction
  sur les trois diapositives, puis absence d'erreur sur les règles ARIA ciblées
  à 320, 390, 768 et 1440 px ; vérifier boutons, flèches, Home/End, flèches du
  clavier et liens sans JavaScript. Vérifier l'arbre Chromium et les ressources.
- Observabilité : preuves avant/après et recette dans
  `docs/site_vitrine/carrousel_accessibilite_2026-11-05/` du dépôt applicatif.
  Cette recette ciblée ne constitue pas un score PageSpeed global.

Modification statique de trois balises, aucune nouvelle fonction ou route
dans l'application Django et son assistant.
