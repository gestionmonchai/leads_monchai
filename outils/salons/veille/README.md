# Veille quotidienne des salons viticoles

Python 3.10 ou plus récent, sans clé API et sans installation de bibliothèque.
Les informations recensées restent des **candidats à relire**, jamais des fiches
publiées automatiquement. Le catalogue éditorial `evenements*.json` est lu, pas modifié.

## Lancer

Sous Windows, double-cliquer sur **Lancer la veille.cmd**. Le script ouvre le
rapport à la fin. Si Python n'est pas dans le PATH, définir `MONCHAI_PYTHON` avec
le chemin de son exécutable. Le lanceur installé dans le projet Mon Chai utilise
son environnement Python existant.

Depuis la racine du dépôt du site :

```console
python outils/salons/veille/recenser.py --ouvrir
```

Sans navigateur, ou sur un serveur :

```console
python outils/salons/veille/recenser.py --sortie /chemin/veille-salons
```

Sortie par défaut : `%LOCALAPPDATA%\MonChai\VeilleSalons\resultats` sous Windows,
`~/.local/share/MonChai/VeilleSalons/resultats` ailleurs. Conserver ce répertoire
entre les passages : il contient l'historique et le cache conditionnel HTTP.
La veille ne nécessite ni Git ni une connexion à l'administration de Mon Chai.

- `rapport.html` : nouveautés, modifications, contradictions, sources, erreurs.
- `candidats.csv` : tableau utilisable dans Excel (UTF-8 avec BOM, séparateur `;`).
- `rapport.json` : preuves factuelles, changements et anciennes fiches non retrouvées.
- `etat.json` : état cumulatif à conserver, également récupérable dans les artefacts GitHub.
- `cache/` : pages téléchargées localement, ETag et Last-Modified.
- `historique/` : rapports horodatés de chaque passage local.

Les anciennes captures HTML restent dans le cache local, jamais dans le rapport
ni dans le dépôt public. Seuls nom, commune, lieu, dates, type de public lorsqu'il
est explicite et liens de provenance sont extraits. Aucune liste d'exposants,
coordonnée personnelle, description éditoriale ou prix n'est importé.

## Sources et limites concrètes

`sources.json` configure Vinabox, les deux catégories françaises de nSalons,
Aux Vignobles!, Mer et Vigne, Vitisaveurs et les Vignerons Indépendants.
Le script ajoute les pages HTML des sources du catalogue Mon Chai, notamment
les organisateurs associatifs, communes et offices de tourisme déjà identifiés.

- Vinabox : lecture de la table, suivi des liens explicitement officiels.
- nSalons : lecture des cartes, pagination bornée à quatre pages par catégorie.
- Aux Vignobles! : lecture des dates de la carte nationale et suivi des éditions.
- Réseaux : suivi des chemins de fiches explicitement autorisés dans la configuration.
- Pages officielles : lecture des `Event` JSON-LD ; pour une fiche connue ou de
  réseau sans données structurées, repérage prudent des dates françaises explicites.
  Plusieurs plages ou une édition en préparation restent à vérifier.

Une nouvelle source JSON-LD peut être ajoutée sans modifier Python :

```console
python outils/salons/veille/recenser.py --source https://organisateur.example/agenda
```

Pour un nouveau réseau, ajouter une entrée `type: officielle`, `parseur: generique`,
`url`, `nom` et éventuellement `suivre: /chemin-des-fiches/` dans `sources.json`.
Les liens suivis restent sur le même domaine et dans ce chemin ; profondeur
maximale deux. Un format spécifique nécessite son parseur et une fixture de test.

Ce n'est pas un moteur de recherche de tout le Web : un petit événement absent
de ces sources ne sera pas découvert par magie. L'ajout de nouveaux agendas
locaux améliore donc la couverture. Les PDF, affiches, pages nécessitant une
connexion, flux RSS/iCal et interfaces ne livrant leurs événements qu'après
exécution JavaScript ne sont pas lus par cette version. Une absence de résultat
exploitable est signalée, pas assimilée à un agenda vide fiable.

Les annuaires fournissent des pistes. Une date annoncée par eux ne reçoit jamais
le statut « source officielle » simplement parce qu'un lien organisateur existe.
Une date lue sur la page officielle reste à relire avant publication. Aucun prix
visiteur ne devient un prix de stand. Une édition annuelle n'est jamais prolongée
en changeant son année. Une annulation ou un report JSON-LD est signalé.

## Relances, doublons et pannes

- Regroupement par URL d'édition et année, puis nom/commune/dates identiques.
  Deux saisons éloignées de plus de 45 jours restent distinctes. Les variantes
  de nom sans URL commune peuvent donc rester des doublons à relire.
- Identifiants stables entre passages, empreinte des champs utiles pour les
  modifications, première et dernière observation conservées.
- Comparaison aux éditions publiées : déjà présent, absent, écart de calendrier.
- Une erreur conserve les preuves précédentes et leur date réelle ; une source
  en panne ne met jamais son ancien relevé à la date du jour.
- Une ancienne fiche non retrouvée après une lecture réussie est conservée dans
  `non_retrouves` du rapport. Cela ne supprime rien du site.
- Budget par défaut : 220 pages ; URLs restantes enregistrées et prioritaires au
  passage suivant. `--max-pages 300` permet de l'augmenter (maximum 1 000).
- Robots.txt vérifié, identité de robot explicite, pause minimale par domaine,
  délais réseau et taille de page limités ; aucune tentative de contourner un
  refus. Un Crawl-delay supérieur à 30 secondes laisse la source à la lecture
  manuelle ; il n'est pas raccourci. Les adresses privées sont refusées.
- Cache HTTP conditionnel ; `--hors-ligne` permet un diagnostic à partir des
  copies, **sans modifier l'état ni renouveler la fraîcheur**.
- Écritures atomiques, verrou empêchant deux collectes dans le même dossier.
  Après une interruption brutale seulement, vérifier qu'aucun recensement n'est
  actif, puis retirer le fichier exact `collecte.lock` avant de relancer.

Codes de sortie : `0` complet ; `2` partiel avec rapport (erreurs ou budget) ;
`1` aucune source lue ou erreur fatale ; `3` autre collecte active/verrou présent.
Les erreurs HTTP 403/429/500 sont visibles dans le rapport. Une page dont le
format a changé nécessite une correction du parseur, pas une relance en boucle.

## Tous les jours sur GitHub

Workflow [Veille quotidienne des salons](https://github.com/gestionmonchai/leads_monchai/actions/workflows/veille-salons.yml),
exécutable aussi avec **Run workflow**. Passage prévu à 05:43 UTC, soit 06:43 en
hiver et 07:43 en été à Paris. L'horaire GitHub est indicatif et peut être retardé.
Le workflow doit être sur la branche principale pour que le calendrier fonctionne.

Chaque exécution fournit un résumé et un artefact `veille-salons-N` à télécharger :
ouvrir `rapport.html` après extraction. La collecte partielle affiche un
avertissement ; la panne totale fait échouer le workflow. Les rapports sont
gardés 30 jours ; l'état et le cache sont repris entre les exécutions. Un cache
GitHub peut être évincé : `etat.json` est aussi livré dans l'artefact pour reprise.
Sur un dépôt public, GitHub peut désactiver la planification après 60 jours sans
activité : réactiver le workflow si nécessaire. Le lancement local reste disponible.

Aucun commit quotidien, déploiement, e-mail, abonnement ni publication de salon
n'est effectué. L'équipe vérifie les propositions et suit ensuite le circuit
éditorial de `outils/salons/README.md`.

Références techniques : [calendriers GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
[persistance des caches](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching),
[urllib.robotparser](https://docs.python.org/3/library/urllib.robotparser.html).

## Contrat UX/UI et exploitation

- Problème : l'exploitant doit retrouver quotidiennement les nouveaux salons et
  les changements sans recommencer une comparaison manuelle des annuaires.
- Entrée : lanceur Windows ou commande documentée ; onglet Actions pour le passage distant.
- Hiérarchie : bilan, marche à suivre, erreurs, nouveautés/modifications puis sources.
- États : première collecte, inchangé, nouveau, modifié, absence de dates,
  contradiction, déjà publié, absence du catalogue, archive, panne partielle/totale,
  budget atteint, collecte déjà en cours, diagnostic hors ligne.
- Feedback : progression console avec compteur et URL ; codes de sortie ; rapport
  ouvrable même après une collecte partielle ; message explicite si aucun événement exploitable.
- Provenance : dates ISO, liens officiels distincts des annuaires, méthode de lecture,
  date d'observation ; aucune confirmation de publication ni de disponibilité exposant.
- Responsive et accessibilité : rapport HTML sans JavaScript, une colonne, texte
  redimensionnable, liens contrastés et focus visibles, détails natifs au clavier,
  URLs longues sécables, pas de dépendance réseau pour le lire.
- Aucun impact UI direct sur le site public : seule l'interface locale d'exploitation
  change ; elle se vérifie par les compteurs, erreurs, exports et historique.
  Aucun nouveau bouton, route ou comportement de l'application ni de son assistant.
- Acceptation : une deuxième collecte inchangée annonce zéro nouveauté ; une date
  modifiée est signalée ; une panne conserve l'ancien relevé ; les calendriers en
  conflit ne sont pas arbitrés automatiquement ; rapport lisible à 390 et 1440 px,
  sans débordement ni exécution d'un HTML trouvé dans un nom de salon.

```console
python -m unittest discover -s outils/salons/veille -p "test_*.py" -v
```
