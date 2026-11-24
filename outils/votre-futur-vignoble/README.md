# Sillons Vifs

Vitrine publique de démonstration pour l’import de données produits Mon Chai.

- Vitrine disponible à `/votre-futur-vignoble/`, fiches individuelles sous `cuvees/` et flux à `catalogue.json`.
- `cuvees.json` est la source des fiches et des données. Après une modification, lancer `python outils/votre-futur-vignoble/generer.py`. L’option `--check` contrôle que les fichiers versionnés ont été régénérés.
- Depuis la page d’accueil, le catalogue est découvrable via le lien HTML « Catalogue public », la balise `link[rel="alternate"]` et le bloc JSON-LD `ItemList`. Chaque fiche contient un objet `Product`.
- Les références et prix TTC sont des données fictives. Les montants sont exprimés en euros et la contenance en millilitres dans le flux JSON. Le parcours est en lecture seule et ne dépose aucun cookie. Les pages sont accessibles directement et portent la directive `noindex`.

## Parcours et validation UX/UI

L’accueil met en avant la photo du vignoble et l’accès aux cuvées. Le filtre conserve le focus, indique le choix actif et annonce le nombre de résultats. Les images et liens de fiches sont disponibles même sans JavaScript, avec les six cuvées affichées par défaut. Les fiches présentent d’abord le nom, l’appellation et la dégustation, puis les caractéristiques, l’accord et le service. Le lien « Catalogue public » mène au flux depuis chaque page.

La grille se réduit selon la largeur, le lien d’évitement mène au contenu principal et le focus reste visible. La recette couvre 320, 390, 820 et 1440 px, les filtres au clavier, le parcours vers et depuis une fiche, les URL des produits et la concordance des données avec et sans JavaScript.

## Photographies

Le générateur d’images intégré a produit le paysage `assets/vignoble.webp` et sa déclinaison mobile, les six packshots `assets/<slug>.webp`, et la photo `assets/vendanges.webp`. Les visuels se trouvent sous `votre-futur-vignoble/assets/`.

### Paysage

Photorealistic fine-art travel photograph for the full-width homepage of an imagined contemporary French Rhône wine estate named Sillons Vifs. Landscape 3:2. Seen from a gentle high viewpoint, long precise curved rows of leafy grape vines on a steep ochre slope lead into a small pale stone chai at the right and blue-grey layered hills in the distance. Clear early autumn afternoon, deep evergreen and dark plum-brown shadows, tawny roads, olive cover crops, and a small sliver of smoky blue sky in the upper 20 percent. The lower left half should be naturally dark with a soft shadow on the vines to hold white website typography added later. The vineyard texture and the geometry of the rows are the main subject, with believable imperfections and nuanced film color. Editorial photography with exceptional depth, a 35 mm lens, mature French wine-house feeling with fresh graphic framing. No people, text, lettering, borders, graphics, or signage. Single seamless landscape photo.

### Bouteilles

Photorealistic 3-by-2 contact sheet of premium wine bottle packshots for the fictional estate SILLONS VIFS. Six equal square tiles in exactly THREE columns and TWO rows filling the entire canvas with no grid gaps or outlines. Each tile has a softly lit, flat studio background and its own exactly centered single tall wine bottle, approximately 72% of that tile’s height with generous dead space around cap and bottom. Full silhouettes, no overlap. Contemporary French wine label design family: solid paper rectangle with a fine abstract diagonal vineyard contour line design and just “SILLONS VIFS” in clear understated black capitals, no other text or logos. A broad soft side shadow and textured paper. Top row left: dark glass burgundy bottle, violet foil and muted lilac paper label, lavender-grey backdrop. Top center: clear glass white wine, cream foil and ivory label, sand-yellow backdrop. Top right: clear glass pink rose, coral foil and ivory label, pale pink backdrop. Bottom left: dark glass red, dark cherry foil and pale red label, earthy terracotta backdrop. Bottom center: dark olive glass white wine with forest-green foil and soft sage label, pale sage backdrop. Bottom right: dark green sparkling wine bottle with charcoal foil and butter-yellow paper label, pastel lemon backdrop. High end studio photography, identical front-on placement and scale, no tabletop objects, no borders or decoration beyond the real bottle, its label and shadow. Full image 3:2 landscape divided precisely into a grid.

### Vendanges

Portrait 2:3 editorial photograph for a contemporary French wine estate website. A close overhead three-quarter angle of weathered adult winemaker hands placing a single bunch of dark purple syrah grapes in a small vintage woven harvest basket, at the edge of a row of vines. An olive work shirt sleeve and worn limestone gravel, scattered violet grapes and leaf, the hands are natural, realistic and anatomically correct. Hard warm afternoon light across the hands from the right, cooler shadow in the bottom left, physical textures. Color film appearance, earthy green and prune purple with warm sand. Vertical editorial crop, full bleed, no text, no props aside from basket and grapes.
