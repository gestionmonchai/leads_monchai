"""Génère la vitrine et son catalogue public depuis cuvees.json et comptoir.json."""

import argparse
import json
from html import escape
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
DOSSIER = "votre-futur-vignoble"
BASE = f"/{DOSSIER}/"
SITE = f"https://monchai.fr{BASE}"
DOMAINE = "Sillons Vifs"
DEVISE = "EUR"
FILTRES = ("Toutes", "Rouge", "Blanc", "Rosé", "Bulles")


def chemin_produit(article):
    repertoire = "cuvees" if article["collection"] == "cuvees" else "produits"
    return f"{repertoire}/{article['slug']}/"


def url_produit(article):
    return SITE + chemin_produit(article)


def image_produit(article):
    return f"{SITE}assets/{article['slug']}.webp"


def categorie(article):
    return "Bulles" if article["type"] == "Vin effervescent" else article["couleur"]


def decimal_fr(nombre):
    return f"{nombre:g}".replace(".", ",")


def prix_fr(nombre):
    return f"{nombre:.2f}".replace(".", ",") + " €"


def dimension(article):
    if "masse_nette_g" in article:
        return "Masse nette", article["masse_nette_g"], "g"
    return "Contenance", article["contenance_ml"] / 10, "cl"


def format_court(article):
    if "contenu" in article:
        total = sum(ligne["quantite"] for ligne in article["contenu"])
        return f"{total} bouteilles"
    _, valeur, unite = dimension(article)
    return f"{decimal_fr(valeur)} {unite}"


def surtitre_produit(article):
    textes = [article.get("appellation", article["type"])]
    if "millesime" in article:
        textes.append(str(article["millesime"]))
    return " · ".join(textes)


def produit(article):
    url = url_produit(article)
    champs = (
        ("Millésime", "millesime", None),
        ("Appellation", "appellation", None),
        ("Cépages", "cepages", None),
        ("Degré d’alcool", "degre_alcool", "% vol."),
        ("Accords", "accord", None),
        ("Température de service", "service", None),
        ("Conseil", "conseil", None),
        ("Variante de", "variante_de", None),
    )
    proprietes = [dimension(article), ("Prix indicatif TTC", article["prix_ttc"], DEVISE),
                  ("Conditionnement", article["conditionnement"], None)]
    for nom, cle, unite in champs:
        if cle in article:
            valeur = ", ".join(article[cle]) if cle == "cepages" else article[cle]
            proprietes.append((nom, valeur, unite))
    for ligne in article.get("contenu", []):
        proprietes.append(("Référence incluse", f"{ligne['quantite']} × {ligne['reference']}", None))
    return {
        "@type": "Product",
        "@id": url + "#produit",
        "url": url,
        "name": article["nom"],
        "sku": article["reference"],
        "image": image_produit(article),
        "description": article["description"],
        "brand": {"@type": "Brand", "name": DOMAINE},
        "category": article["type"],
        **({"color": article["couleur"]} if "couleur" in article else {}),
        "additionalProperty": [
            {"@type": "PropertyValue", "name": nom, "value": valeur,
             **({"unitText": unite} if unite else {})}
            for nom, valeur, unite in proprietes
        ],
    }


def page(titre, description, canonical, contenu, donnees, image, accueil=False):
    script = f'  <script src="{BASE}filtres.js" defer></script>\n' if accueil else ''
    jsonld = json.dumps(donnees, ensure_ascii=False).replace("<", "\\u003c")
    return f"""<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(titre)}</title>
  <meta name="description" content="{escape(description)}">
  <meta name="robots" content="noindex, follow">
  <meta name="theme-color" content="#f8f4ea">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" type="application/json" title="Catalogue public Sillons Vifs" href="{SITE}catalogue.json">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{escape(titre)}">
  <meta property="og:description" content="{escape(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{image}">
  <link rel="stylesheet" href="{BASE}style.css?v=20261124-age">
  <script src="{BASE}majorite.js" defer></script>
{script}  <script type="application/ld+json">{jsonld}</script>
</head>
<body>
  <dialog class="verification-age" id="verification-age" aria-labelledby="titre-majorite">
    <div class="age-texte">
      <p class="marque"><span class="sillon" aria-hidden="true"><i></i><i></i><i></i></span> Sillons Vifs</p>
      <h2 id="titre-majorite" tabindex="-1" autofocus>Avez-vous<br><em>18&nbsp;ans ou plus&nbsp;?</em></h2>
      <div class="age-actions">
        <button class="bouton bouton-sombre" type="button" data-confirmer-age>Oui, j’ai 18 ans ou plus</button>
        <a class="bouton bouton-sortie" href="/" data-quitter-vitrine>Non, quitter la vitrine</a>
      </div>
    </div>
  </dialog>
  <a class="skip" href="#contenu">Aller au contenu</a>
  <header class="entete">
    <div class="largeur barre">
      <a class="marque" href="{BASE}" aria-label="Sillons Vifs, accueil">
        <span class="sillon" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>Sillons Vifs</span>
      </a>
      <nav aria-label="Navigation principale">
        <a href="{BASE}#cuvees">Les cuvées</a>
        <a href="{BASE}#comptoir">Le comptoir</a>
        <a class="lien-donnees" href="{BASE}#donnees">Données</a>
      </nav>
    </div>
  </header>
  <main id="contenu" tabindex="-1">
{contenu}
  </main>
  <footer class="pied">
    <div class="largeur pied-contenu">
      <div>
        <a class="marque" href="{BASE}">Sillons Vifs</a>
        <p>Vignoble fictif créé pour une démonstration Mon Chai. Les produits et leurs tarifs sont illustratifs.</p>
      </div>
      <a class="retour-monchai" href="/">Découvrir Mon Chai</a>
    </div>
  </footer>
</body>
</html>
"""


def carte(article):
    nom = escape(article["nom"])
    vin = article["collection"] == "cuvees"
    attribut = f' data-couleur="{categorie(article).lower()}"' if vin else ''
    if vin:
        pastille = f"{categorie(article)} · {article['millesime']}"
        libelle = f"{nom}, {article['millesime']}"
    else:
        pastille = article["conditionnement"]
        libelle = nom
    sous_titre = article["appellation"] if vin else article["type"]
    return f"""        <li class="cuvee"{attribut}>
          <a href="{BASE}{chemin_produit(article)}" class="cuvee-lien" aria-label="Découvrir {libelle}">
            <div class="cuvee-image">
              <img src="{BASE}assets/{article['slug']}.webp" width="512" height="512" loading="lazy" alt="">
              <span class="pastille">{escape(pastille)}</span>
            </div>
            <div class="cuvee-texte">
              <p class="appellation">{escape(sous_titre)}</p>
              <h3>{nom}</h3>
              <p class="notes">{escape(article['notes'])}</p>
              <span class="prix">{prix_fr(article['prix_ttc'])} <small>/ {escape(format_court(article))}</small></span>
            </div>
          </a>
        </li>"""


def accueil(cuvees, comptoir):
    cartes = "\n".join(carte(cuvee) for cuvee in cuvees)
    cartes_comptoir = "\n".join(carte(article) for article in comptoir)
    filtres = "\n".join(
        f'          <button type="button" data-filtre="{nom.lower()}" aria-pressed="{str(nom == "Toutes").lower()}">{nom}</button>'
        for nom in FILTRES
    )
    contenu = f"""    <section class="hero" aria-labelledby="titre">
      <picture class="hero-image">
        <source media="(max-width: 640px)" srcset="{BASE}assets/vignoble-mobile.webp">
        <img src="{BASE}assets/vignoble.webp" width="1536" height="1024" alt="" fetchpriority="high">
      </picture>
      <div class="largeur hero-contenu">
        <p class="surtitre">Vallée du Rhône</p>
        <h1 id="titre">Faisons parler<br><em>le terroir.</em></h1>
        <p class="hero-intro">Des vins de coteaux, des coffrets et le raisin jusque dans l’épicerie.</p>
        <a class="bouton bouton-clair" href="#cuvees">Découvrir les produits</a>
      </div>
    </section>

    <section class="largeur section-cuvees" id="cuvees" aria-labelledby="titre-cuvees">
      <div class="entete-section">
        <div>
          <h2 id="titre-cuvees">Les cuvées</h2>
          <p>Du premier blanc aux dernières bulles.</p>
        </div>
        <div class="filtres" role="group" aria-label="Filtrer les cuvées" hidden>
{filtres}
        </div>
      </div>
      <p class="resultats" id="resultats-cuvees" aria-live="polite">{len(cuvees)} cuvées</p>
      <ul class="grille-cuvees">
{cartes}
      </ul>
    </section>

    <section class="comptoir" id="comptoir" aria-labelledby="titre-comptoir">
      <div class="largeur section-cuvees">
        <div class="entete-section">
          <div>
            <h2 id="titre-comptoir">Le comptoir</h2>
            <p>Un magnum et un coffret à offrir, des bulles sans alcool et des produits pour la cuisine.</p>
          </div>
        </div>
        <ul class="grille-cuvees">
{cartes_comptoir}
        </ul>
      </div>
    </section>

    <section class="domaine" id="domaine" aria-labelledby="titre-domaine">
      <div class="largeur domaine-grille">
        <img class="vendanges" src="{BASE}assets/vendanges.webp" alt="Des mains déposent une grappe de syrah dans un panier de vendange" width="760" height="1140" loading="lazy">
        <div class="domaine-texte">
          <p class="surtitre">Le domaine</p>
          <h2 id="titre-domaine">Là où la vigne<br><em>prend le vent.</em></h2>
          <p>Sur les hauteurs, la syrah mûrit à l’abri des chaleurs du fond de vallée. Plus bas, le grenache profite de la chaleur que les pierres restituent le soir.</p>
          <p>Au chai, chaque parcelle est vinifiée séparément. On assemble les lots après dégustation, pour garder la fraîcheur des coteaux et la texture des raisins mûrs.</p>
        </div>
      </div>
    </section>

    <section class="largeur section-donnees" id="donnees" aria-labelledby="titre-donnees">
      <div>
        <h2 id="titre-donnees">Le catalogue public</h2>
        <p>Les {len(cuvees) + len(comptoir)} fiches de démonstration sont disponibles sous forme de données structurées.</p>
      </div>
      <a class="bouton bouton-sombre" href="catalogue.json">Ouvrir le catalogue JSON</a>
    </section>"""
    donnees = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Catalogue de démonstration Sillons Vifs",
        "numberOfItems": len(cuvees) + len(comptoir),
        "itemListElement": [
            {"@type": "ListItem", "position": i, "item": produit(c)}
            for i, c in enumerate([*cuvees, *comptoir], 1)
        ],
    }
    return page("Sillons Vifs | Votre futur vignoble",
                "Explorez les vins et l’épicerie de Sillons Vifs, un domaine fictif créé par Mon Chai pour la démonstration de données produits.",
                SITE, contenu, donnees, SITE + "assets/vignoble.webp", accueil=True)


def caracteristiques(article):
    valeurs = []
    for nom, cle in (("Millésime", "millesime"), ("Couleur", "couleur"), ("Cépages", "cepages")):
        if cle in article:
            valeur = ", ".join(article[cle]) if cle == "cepages" else str(article[cle])
            valeurs.append((nom, valeur))
    _, valeur, unite = dimension(article)
    valeurs.append(("Format", f"{article['conditionnement']} · {decimal_fr(valeur)} {unite}"))
    if "degre_alcool" in article:
        valeurs.append(("Degré d’alcool", decimal_fr(article["degre_alcool"]) + " % vol."))
    valeurs.append(("Référence", article["reference"]))
    return "\n".join(f"          <div><dt>{nom}</dt><dd>{escape(valeur)}</dd></div>" for nom, valeur in valeurs)


def service(article, suivante, produits):
    contenu = []
    if "contenu" in article:
        liens = []
        for ligne in article["contenu"]:
            inclus = produits[ligne["reference"]]
            liens.append(f'<li>{ligne["quantite"]} × <a href="{BASE}{chemin_produit(inclus)}">{escape(inclus["nom"])}</a> · {format_court(inclus)}</li>')
        contenu.append('<div class="contenu-coffret"><h2>Dans le coffret</h2><ul>' + "".join(liens) + '</ul></div>')
    for titre, cle in (("À table", "accord"), ("Service", "service"), ("En cuisine", "conseil")):
        if cle in article:
            contenu.append(f"<div><h2>{titre}</h2><p>{escape(article[cle])}</p></div>")
    contenu.append(f'<a class="retour" href="{BASE}{chemin_produit(suivante)}">À découvrir ensuite <span>{escape(suivante["nom"])}</span></a>')
    return "\n        ".join(contenu)


def fiche(article, suivante, produits, variantes):
    nom = escape(article["nom"])
    cuvee = article["collection"] == "cuvees"
    ancre = "cuvees" if cuvee else "comptoir"
    retour = "Toutes les cuvées" if cuvee else "Retour au comptoir"
    format_lie = produits.get(article.get("variante_de")) or variantes.get(article["reference"])
    lien_format = ""
    if format_lie:
        lien_format = f'<p class="autre-format"><a href="{BASE}{chemin_produit(format_lie)}">Existe aussi en {format_court(format_lie)}</a></p>'
    lignes = caracteristiques(article)
    conseils = service(article, suivante, produits)
    contenu = f"""    <section class="largeur fiche" aria-labelledby="nom-cuvee">
      <a class="retour" href="{BASE}#{ancre}">{retour}</a>
      <div class="fiche-grille">
        <img class="fiche-image" src="{BASE}assets/{article['slug']}.webp" width="512" height="512" alt="{nom}, {DOMAINE}" fetchpriority="high">
        <div class="fiche-corps">
          <p class="surtitre">{escape(surtitre_produit(article))}</p>
          <h1 id="nom-cuvee">{nom}</h1>
          <p class="fiche-notes">{escape(article['notes'])}</p>
          <p>{escape(article['description'])}</p>
          <p class="fiche-prix"><strong>{prix_fr(article['prix_ttc'])}</strong> <span>Prix indicatif TTC</span></p>
          <dl class="caracteristiques">
{lignes}
          </dl>{lien_format}
        </div>
      </div>
      <div class="service">
        {conseils}
      </div>
    </section>"""
    donnees = {"@context": "https://schema.org", **produit(article)}
    titre = " ".join(str(article[cle]) for cle in ("nom", "millesime") if cle in article)
    return page(f"{titre} | {DOMAINE}", article["description"], donnees["url"],
                contenu, donnees, image_produit(article))


def catalogue(produits):
    return {
        "version": 1,
        "domaine": DOMAINE,
        "site": SITE,
        "demonstration": True,
        "description": "Catalogue fictif pour la démonstration d’import de données produits Mon Chai. Prix indicatifs, produits sans offre de vente.",
        "produits": [
            {
                **article,
                "devise": DEVISE,
                "url": url_produit(article),
                "image": image_produit(article),
            }
            for article in produits
        ],
    }


def lire_collection(nom):
    source = Path(__file__).with_name(f"{nom}.json")
    return json.loads(source.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Contrôler les fichiers publiables sans les modifier.")
    args = parser.parse_args()
    cuvees = [
        {"contenance_ml": 750, "conditionnement": "Bouteille", **article, "collection": "cuvees"}
        for article in lire_collection("cuvees")
    ]
    par_reference = {article["reference"]: article for article in cuvees}
    comptoir = [
        {**par_reference.get(article.get("variante_de"), {}), **article, "collection": "comptoir"}
        for article in lire_collection("comptoir")
    ]
    articles = [*cuvees, *comptoir]
    for champ in ("slug", "reference"):
        if len({article[champ] for article in articles}) != len(articles):
            parser.error("Valeurs en double dans le catalogue pour " + champ)
    par_reference = {article["reference"]: article for article in articles}
    variantes = {article["variante_de"]: article for article in comptoir if "variante_de" in article}
    fichiers = {
        "index.html": accueil(cuvees, comptoir),
        "catalogue.json": json.dumps(catalogue(articles), ensure_ascii=False, indent=2) + "\n",
    }
    for collection in (cuvees, comptoir):
        for i, article in enumerate(collection):
            if not (RACINE / DOSSIER / "assets" / f"{article['slug']}.webp").is_file():
                parser.error("Visuel de produit manquant pour " + article["slug"])
            if "variante_de" in article and article["variante_de"] not in par_reference:
                parser.error("Référence de la variante inconnue pour " + article["slug"])
            for ligne in article.get("contenu", []):
                if ligne["reference"] not in par_reference or ligne["quantite"] < 1:
                    parser.error("Contenu du coffret invalide pour " + article["slug"])
            suivante = collection[(i + 1) % len(collection)]
            fichiers[f"{chemin_produit(article)}index.html"] = fiche(article, suivante, par_reference, variantes)
    for nom, contenu in fichiers.items():
        fichier = RACINE / DOSSIER / nom
        if args.check:
            if not fichier.is_file() or fichier.read_text(encoding="utf-8") != contenu:
                parser.error(f"{nom} doit être régénéré")
        else:
            fichier.parent.mkdir(parents=True, exist_ok=True)
            fichier.write_text(contenu, encoding="utf-8", newline="\n")
    print(f"{len(articles)} produits et {len(fichiers)} fichiers cohérents.")


if __name__ == "__main__":
    main()
