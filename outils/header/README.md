# Header public partagé

Les cinq fichiers HTML sont les composants de référence, repris des accueils
existants. Modifier ici les liens ou libellés, puis exécuter :

```sh
python outils/header/generer.py .
python outils/header/generer.py . --check
```

La génération conserve la rubrique active, marque la page courante et adapte
le sélecteur de langues aux traductions disponibles. Les 256 pages conservent
une navigation HTML statique, sans chargement réseau du composant au runtime.
Les deux publications GitHub Pages régénèrent le composant avant livraison ;
la CI refuse une copie HTML divergente. Tout `outils/` est exclu de l'artefact.

Le style et les interactions sont uniquement dans `assets/css/header.css` et
`assets/js/header.js`. Le comportement de l'accueil est commun : toujours
visible sous 1200 px ; au-delà, masqué en descendant après 80 px et réaffiché
en remontant, avec un seuil de 6 px. Un menu ouvert ou un focus dans le header
le garde visible. Les scènes des modules réservent leur bande, mais le vrai
header reste un enfant direct du body, hors de leurs transformations.

Ne pas modifier une copie de page seule : régénérer après toute modification
du composant. Les générateurs éditoriaux doivent être suivis de cette commande.
