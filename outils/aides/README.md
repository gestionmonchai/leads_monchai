# Panorama des aides viticoles

Publication datée du 28 octobre 2026, France entière. 62 fiches et portes d’entrée,
61 nouveaux articles et le guide DJA existant. Sources primaires dans chaque
fiche et dans `catalogue.json`. Ce dossier n’est pas une décision d’éligibilité
ni une garantie d’exhaustivité des aides locales.

`contenus.py` contient les textes et références ; `generer.py` génère les pages
statiques, le catalogue, son maillage et le sitemap :

```sh
python outils/aides/generer.py .
python outils/verifier-coherence.py . --strict
node --test outils/test-harmoniser-article.cjs
```

Avant une mise à jour, vérifier le règlement, les dates de dépôt et de paiement,
les bénéficiaires et les éventuelles modifications. Réviser aussi les dates
visibles dans le générateur : changer la date seule ne constitue pas une revue.
Une FAQ ancienne peut contredire le règlement de l’appel courant.

Les fichiers sous `outils/` sont retirés de l’artefact GitHub Pages. La recherche
publique utilise seulement le HTML et `assets/js/aides.js`, sans API, compte,
envoi de mots recherchés ou coût de service supplémentaire.

## Contrat UX/UI à conserver

Entrées : Ressources, actualités, installation, DJA, menus français et footer
commun dans les cinq langues (dossier en français explicitement identifié).
Hiérarchie : six étapes chronologiques, puis fiches avec type, situation,
calendrier, territoire, financeur et sources. Une fiche mène à un article réel.

Recherche collante sous le header ; filtres repliés sur téléphone. Combinaison
texte/étape/territoire/type/situation, compteur annoncé, zéro résultat explicite
et réinitialisation avec focus. Pas de calcul automatique de droit. Sans JS,
tout le catalogue reste lisible et les contrôles de recherche restent masqués.

Conserver labels, clavier, focus visible et cibles de 44 px. Vérifier 320, 390,
768 et 1440 px, absence de débordement, recherche non recouverte par le header,
liens de retour et sources. Un filtre DOM ne doit pas transposer les dispositifs
métropolitains. Une aide close ou un paiement réservé ne doit pas être présenté
comme un dépôt ouvert. La navigation d’étape rétablit les fiches masquées.
