# Recette du footer et des documents légaux

Le footer est un composant HTML commun et `assets/css/footer-commun.css` porte sa
présentation. `assets/js/documents-legaux.js` affiche seulement le contenu du
document, dans un dialogue natif, avec accès à sa page autonome. La gestion des
cookies est centralisée dans `consent.js`, y compris sur les pages traduites.

## Vérification

Depuis la racine du site, avec Python 3.12 ou plus :

```sh
python outils/verifier-coherence.py . --strict --output /tmp/coherence.json
python -m http.server 8147 --bind 127.0.0.1
```

Dans un autre terminal, avec Playwright et son Chromium disponibles :

```sh
python outils/recette-footer-2026-10-28/verifier_navigateur.py
```

La recette bloque tous les appels externes. Les envois de formulaire sont simulés.
Les variables `MONCHAI_RECETTE_BASE` et `MONCHAI_RECETTE_SORTIE` permettent de
tester une copie optimisée sans remplacer les références sources.

## Critères UX/UI

- Entrées : footer de chaque page, notice des formulaires et bandeau cookies.
- Hiérarchie : logiciel, ressources, confidentialité et données, puis mentions et conditions.
- États : lecture, chargement, indisponibilité du document, refus et retrait des
  catégories facultatives, formulaire parent conservé et liens sans JavaScript.
- Feedback : titre de document, accès à la page complète, erreur réessayable du
  formulaire ; pas d'inscription newsletter confirmée sur un simple envoi d'e-mail.
- Responsive : footer fluide, colonnes adaptées et absence de débordement.
- Accessibilité : liens HTML, titres, focus visible, tabulation contenue, Échap,
  retour au déclencheur et indication du nouvel onglet.
- Recette : compteurs détaillés dans les JSON ; captures desktop et mobile du
  composant isolé, sans header ni bandeau fixe au-dessus.

Les résultats techniques ne constituent pas une certification juridique.
La politique du lot est préparée pour revue des traitements et contrats réels.
La nouvelle information ne réécrit pas les versions de CGU déjà acceptées.
