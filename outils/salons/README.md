# Salons viticoles et cinq guides

Implémentation autorisée par Denis le 22 novembre 2026. Le lot ajoute une page
`salons-viticoles.html`, 14 éditions françaises, cinq guides, le lien Ressources,
la carte des guides et le maillage/sitemap. Aucune route ni fonction Django.

Sources : `evenements.json`, `articles.json` et les cinq fichiers `guide-*.html`.
Les textes de préparation sont des méthodes Mon Chai. Les données d'accès et de
calendrier sont issues des organisateurs, avec un lien et une date de contrôle.
La liste n'est pas exhaustive. Aucun formulaire d'inscription n'est transmis.

```sh
python outils/salons/generer.py .
python outils/header/generer.py .
python outils/verifier-coherence.py . --strict --output CHEMIN_TEMPORAIRE/coherence.json
python outils/salons/verifier_navigateur.py --sortie CHEMIN_TEMPORAIRE
node --check assets/js/salons.js
```

Pour régénérer aussi les lots de subventions, exécuter leurs générateurs avant
celui des salons, puis terminer par le header commun. Les modifications de dates
doivent découler d'une vérification réelle ; ne pas mettre à jour seulement le
champ `verifie`. Les pages d'édition ont priorité sur un agenda général, mais
les contradictions observées restent affichées tant qu'elles sont présentes.

## Contrat UX/UI en vigueur

- Entrée : Ressources → Salons viticoles ; les cinq guides sont aussi reliés
  depuis les ressources et entre eux. Consultation publique, sans compte.
- Hiérarchie : objectif (particuliers/pros/équipement), région, période, mot-clé,
  compteur, résultats chronologiques, public, détail des conditions et sources.
- États : tous les résultats, critères combinés, zéro résultat, critères
  supprimables, reset, dates annoncées/à reconfirmer/non publiées, édition passée.
- Feedback : nombre dans le bouton et annonce polie ; récupération du vide et
  lien de retour au moteur. Les inscriptions restent chez l'organisateur.
- Données : jours du salon séparés des éventuels délais exposants. SITEVI n'a
  pas de jours inventés. Cinq éditions VI conservent une alerte de contradiction.
  Les coûts non repris restent à demander, sans transformer le badge en stand.
- Archives : le navigateur compare la fin du salon au jour local ; les éditions
  passées sont masquées sauf choix explicite. Un lien direct révèle sa fiche.
  Sans JS, toutes les éditions restent lisibles avec leurs dates.
- Responsive : radios et filtres dans le flux ; une colonne sur téléphone,
  deux sur tablette, trois sur ordinateur. Aucun grand formulaire collant.
- Accessibilité : fieldset/legend, labels, radios natifs, cibles de 44 px,
  focus visible, compteur annoncé, détails natifs et navigation au clavier.
- Guides : titre, introduction, sommaire, intertitres, sources et liens utiles.
  Exemple économique et calcul de stock explicitement fictifs. Les repères
  de prospection sont reliés à la CNIL ; aucune campagne n'est envoyée.
- Cohérence : polices, header, footer, crème/bordeaux et invitation vers la visite
  interactive existants. Aucune recherche transmise par les filtres locaux.

## Acceptation

1. Chaque objectif renvoie les salons pertinents ; le public et l'admission
   restent visibles et ne sont pas déduits d'un nom ou d'un lieu.
2. Une date incertaine conserve sa mention ; le filtre de période n'invente pas
   de mois pour SITEVI. Le passage du temps et la révélation d'archives sont testés.
3. Recherche, retrait d'un critère, reset, zéro résultat et accès au détail
   fonctionnent au clavier. L'index et les guides restent lisibles sans JS.
4. Vérifier 320/390/768/1440 px et paysage 844 × 390, sans débordement ni erreur
   JavaScript ; captures du moteur, du résultat vide et d'un guide.
5. Vérifier les liens, les six canoniques, les métadonnées, le sitemap, la
   génération stable et la version optimisée avant toute publication.

Suivi après publication : requêtes/pages dans Search Console, usages et clics
consentis de la visite selon la mesure existante ; aucun volume SEO ni taux de
conversion n'est promis. Aucune automatisation de maintenance n'est créée.
