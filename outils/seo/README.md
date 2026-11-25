# Politique SEO et GEO de Mon Chai

Le site aide les domaines à choisir et à utiliser un logiciel de gestion viticole. Les contenus doivent répondre à une question métier précise et donner au lecteur de quoi agir ou contrôler une réponse. La visite guidée, les tarifs et l’essai répondent aux questions sur Mon Chai.

## Pages et intentions

| Besoin du lecteur | Page de référence | Ce que la page apporte |
| --- | --- | --- |
| Comparer des logiciels viticoles | [Guide logiciel](https://monchai.fr/choisir-logiciel-viticole.html) | Critères de choix, exercice chiffré utilisable avec plusieurs éditeurs et guide à imprimer |
| Vérifier une fonction de Mon Chai | [Fonctionnalités](https://monchai.fr/fonctionnalites.html) et les pages modules | Cas d’usage, captures datées lorsqu’une date est connue et lien vers le parcours correspondant |
| Préparer un projet de financement | [Subventions viticoles](https://monchai.fr/subventions-viticulture.html) | Orientation par projet et explication des démarches |
| Trouver un dispositif précis | [Moteur de subventions](https://monchai.fr/aides-vignerons.html) | Recherche par projet et territoire, conditions et sources datées. Adresse historique conservée pour Vinitech |
| Choisir un salon ou proposer un événement local | [Salons viticoles](https://monchai.fr/salons-viticoles.html) | Dates, lieux, public, intérêt pour un exposant et lien organisateur |

Une page nouvelle mérite une URL quand elle répond à une intention distincte avec assez de matière propre. Une question déjà couverte se traite sur la page existante, avec les mots réellement utilisés par les vignerons. Les ressources locales et réglementaires indiquent l’organisme, le territoire, la date de vérification et la source officielle. L’annuaire de salons distingue les dates annoncées des éditions à confirmer. Les pages produit distinguent les fonctions disponibles, les itinéraires illustrés et les développements prévus.

Pour chaque publication, contrôler la réponse proposée dès l’introduction, les titres descriptifs, la lisibilité du contenu principal en HTML, les liens internes et les sources. Les captures proviennent d’un espace de démonstration. Les résultats chiffrés d’un test fictif sont présentés comme un exercice. Vérifier le statut HTTP, la canonique et les liens réciproques entre traductions lorsque la page existe dans plusieurs langues. Le sitemap contient les URL canoniques à indexer et date les changements de fond. Le balisage décrit le contenu visible. Les mêmes principes s’appliquent aux réponses génératives de Google. [Guide SEO de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) · [Guide des fonctionnalités génératives](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

## Premier lot du 25 novembre 2026

L’export Search Console daté du 26 octobre couvre le 25 juillet au 24 octobre. Il comptait 4 383 impressions et 184 clics pour le site. Le guide logiciel comptait 210 impressions, un clic et une position moyenne de 21,44. Cette période précède la page autonome des subventions et sert de repère historique.

Le premier test ajoute au guide logiciel un exercice reproductible sur la mise en bouteille et la sortie de stock. L’hypothèse est qu’un guide exploitable pendant une démonstration attire des recherches de comparaison et aide les visiteurs à évaluer Mon Chai. Les pages Stocks et Changer de logiciel relient le guide à leur contexte. La publication du 25 novembre sert de point de repère pour les séries.

### Parcours et critères UX/UI

- Depuis le guide, le lecteur peut se rendre à l’exercice ou télécharger le PDF. L’exercice affiche les données de départ, les gestes, puis le résultat à contrôler pour chaque étape.
- La capture des lots commerciaux illustre le type d’écran recherché. La légende identifie l’espace de démonstration et le texte reste compréhensible si l’image tarde, manque ou est désactivée.
- À la fin de l’exercice, le lien vers le chai de la visite interactive constitue l’action principale. Le détail du module Stocks est accessible en complément. Les liens n’exigent pas de connexion.
- Le parcours se vérifie à 320, 390 et 1440 px, au clavier et sans JavaScript. Les liens sont identifiables, le focus est visible et le PDF reste accessible depuis son emplacement habituel.
- La mesure du parcours n’a aucun impact UI direct. L’exploitant vérifie les événements `guide_logiciel_visite` et `guide_logiciel_demo`, émis uniquement après accord d’audience. Ces événements représentent l’ouverture d’une destination. Le visiteur suit le même parcours quel que soit son choix de consentement.

## Relevé et décisions

Chaque semaine, relever les clics et impressions par URL dans Search Console. Après réexploration, examiner 28 jours complets et les 28 jours précédents avec les mêmes filtres. Noter les dates de mise en ligne, les événements saisonniers et les changements de Google. Sur de faibles volumes, prolonger la période avant de conclure. Une variation observée sur une page donne une tendance, avec une attribution à confirmer.

```sh
python outils/seo/suivi.py chemin/vers/export-search-console.zip
```

Le relevé lit un export de performances Web, en français ou en anglais, et affiche les périodes, les pages prioritaires et les familles de requêtes visibles. Pour relier des requêtes à une page, exporter après avoir appliqué le filtre URL dans Search Console. Examiner les ouvertures de la visite et de la réservation en GA4 avec le périmètre du consentement. Vérifier séparément les demandes réellement reçues.

Chaque mois, relever les pages visibles dans le rapport génératif de Google et les pages citées dans Bing Webmaster Tools. Conserver moteur, période, URL et mesure pour comparer le même périmètre. Une impression Google et une citation Bing ont des définitions distinctes. [Comparaisons Search Console](https://support.google.com/webmasters/answer/17011165) · [Rapport génératif Google](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) · [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
