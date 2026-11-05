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

## Navigation et présentation du 4 novembre 2026

Demande de Denis : rendre le dossier accessible depuis le header Ressources
et afficher clairement « aides à la viticulture française » pour le référencement.

- Point d'entrée : un lien HTML « Aides aux vignerons », juste après « Guides
  pratiques » dans les 141 headers français. Le même panneau sert au menu
  déroulant sur ordinateur et à l'accordéon dans le tiroir mobile.
- Hiérarchie : titre principal « Aides à la viticulture française : de
  l'installation à l'arrachage » ; introduction explicite ; catalogue et filtres
  existants. Titre SEO, description, Open Graph et CollectionPage cohérents.
- États : menu fermé/ouvert, page courante identifiée par `aria-current`.
  Lien public, sans compte, chargement distant ni nouvel état d'erreur ;
  sans JavaScript, le lien reste présent dans le document HTML indexable.
- Feedback et accessibilité : ouverture, focus, clavier, fermeture et navigation
  suivent le header partagé ; aucun nouveau composant ou interaction.
- Responsive : lien dans la liste existante, lisible sur petit téléphone,
  tablette et ordinateur ; vérifier l'accès réel par clic et au clavier.
- Données : présentation mise à jour le 4 novembre ; vérification des dispositifs
  conservée au 28 octobre. Les dates, montants et statuts des 62 fiches ne sont
  pas présentés comme ayant été réexaminés à l'occasion de cette retouche.
- Observabilité : contrôle du lien unique dans chaque header français, du
  parcours accueil vers catalogue, des métadonnées et du sitemap. Les versions
  étrangères conservent leur navigation et leur lien de footer vers ce dossier.
- Périmètre : navigation et contenu éditorial du site vitrine ; aucune nouvelle
  route ou fonctionnalité dans l'application Django ou son assistant.

Critères d'acceptation : les 141 headers français proposent exactement une
entrée vers le dossier ; le lien est accessible sur mobile et ordinateur ;
l'expression demandée figure dans le h1, l'introduction et les métadonnées ;
le catalogue et sa recherche restent utilisables. Le générateur conserve cette
entrée et ce titre lors d'une prochaine génération explicite.

## Veille du 5 novembre 2026 : volet UX/UI

- Problème : deux appels désormais clos restent affichés ouverts et des
  publications récentes proposent des échéances territoriales très proches.
- Point d'entrée : même URL et menu Ressources ; un encadré de veille sous
  l'introduction du catalogue mène aux fiches nouvelles ou complétées.
- Hiérarchie : nouveautés et échéances, recherche existante, six étapes et
  fiches. Les aides départementales gardent leur périmètre ; les financements
  d'animation sont distingués des subventions versées à un domaine.
- États et feedback : deux fermetures explicites, cadre 2027 à préparer,
  calendrier local à confirmer, ouverture DEPHY datée. Les filtres reflètent
  ces statuts ; zéro résultat, réinitialisation et liens de retour sont conservés.
- Données : deux nouvelles fiches ; dates de publication, modification et
  vérification distinctes. Les anciennes dates restent sur les fiches qui
  n'ont pas fait l'objet d'un examen de fond. Les sources inaccessibles ou
  contradictoires ne sont jamais marquées comme validées automatiquement.
- Responsive : encadré en flux, sans modale ; listes lisibles à 320 px,
  recherche et liens visibles sur téléphone et ordinateur.
- Accessibilité : h2 pour la veille, vrais liens internes, focus existant,
  contraste de la charte et compteur de recherche annoncé.
- Observabilité : preuve des sources consultées, journal des décisions,
  concordance des fiches/JSON-LD/catalogue/filtres et sitemap contrôlés.
- Critères d'acceptation : 64 cartes et liens valides ; promotion pays tiers
  et conseil RSE Grand Est exclus du filtre ouvert ; recherche DEPHY et
  réarmement ; échéances départementales non généralisées ; 320/390/1440 px
  sans débordement ; header et ticket conservés.
- Périmètre : contenu du site vitrine ; aucune nouvelle route Django ni
  procédure métier de l'assistant applicatif.

Lot structuré : `veille-2026-11-05.json`, appliqué par `contenus.py`. Le journal
des sources, décisions et limites est `BILAN_VEILLE_2026-11-05.md`. La génération
ciblée conserve les articles non réexaminés et leurs dates :

```sh
python outils/aides/generer.py . promotion-tiers,conseil-rse-grand-est,cab,isn,maec,rearmement-casi,dephy-ferme
```
