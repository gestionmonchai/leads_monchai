"""Génère la vitrine et son catalogue public depuis cuvees.json."""

import argparse
import json
from html import escape
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
DOSSIER = "votre-futur-vignoble"
BASE = f"/{DOSSIER}/"
SITE = f"https://monchai.fr{BASE}"
DOMAINE = "Sillons Vifs"
CONTENANCE_CL = 75
DEVISE = "EUR"
FILTRES = ("Toutes", "Rouge", "Blanc", "Rosé", "Bulles")


def url_cuvee(cuvee):
    return f"{BASE}cuvees/{cuvee['slug']}/"


def categorie(cuvee):
    return "Bulles" if cuvee["type"] == "Vin effervescent" else cuvee["couleur"]


def decimal_fr(nombre):
    return f"{nombre:g}".replace(".", ",")


def prix_fr(nombre):
    return f"{nombre:.2f}".replace(".", ",") + " €"


def produit(cuvee):
    url = f"https://monchai.fr{url_cuvee(cuvee)}"
    proprietes = (
        ("Millésime", cuvee["millesime"], None),
        ("Appellation", cuvee["appellation"], None),
        ("Cépages", ", ".join(cuvee["cepages"]), None),
        ("Contenance", CONTENANCE_CL, "cl"),
        ("Degré d’alcool", cuvee["degre_alcool"], "% vol."),
        ("Prix indicatif TTC", cuvee["prix_ttc"], DEVISE),
        ("Accords", cuvee["accord"], None),
        ("Température de service", cuvee["service"], None),
    )
    return {
        "@type": "Product",
        "@id": url + "#produit",
        "url": url,
        "name": cuvee["nom"],
        "sku": cuvee["reference"],
        "image": image_cuvee(cuvee),
        "description": cuvee["description"],
        "brand": {"@type": "Brand", "name": DOMAINE},
        "category": cuvee["type"],
        "color": cuvee["couleur"],
        "additionalProperty": [
            {"@type": "PropertyValue", "name": nom, "value": valeur,
             **({"unitText": unite} if unite else {})}
            for nom, valeur, unite in proprietes
        ],
    }


def image_cuvee(cuvee):
    return f"{SITE}assets/{cuvee['slug']}.webp"


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
  <link rel="stylesheet" href="{BASE}style.css">
{script}  <script type="application/ld+json">{jsonld}</script>
</head>
<body>
  <a class="skip" href="#contenu">Aller au contenu</a>
  <header class="entete">
    <div class="largeur barre">
      <a class="marque" href="{BASE}" aria-label="Sillons Vifs, accueil">
        <span class="sillon" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>Sillons Vifs</span>
      </a>
      <nav aria-label="Navigation principale">
        <a href="{BASE}#domaine">Le domaine</a>
        <a href="{BASE}#cuvees">Les cuvées</a>
        <a class="lien-donnees" href="{BASE}#donnees">Catalogue public</a>
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
        <p>Vignoble fictif créé pour une démonstration Mon Chai. Les cuvées et leurs tarifs sont illustratifs.</p>
      </div>
      <a class="retour-monchai" href="/">Découvrir Mon Chai</a>
    </div>
  </footer>
</body>
</html>
"""


def carte(cuvee):
    nom = escape(cuvee["nom"])
    etiquette = categorie(cuvee)
    return f"""        <li class="cuvee" data-couleur="{etiquette.lower()}">
          <a href="{url_cuvee(cuvee)}" class="cuvee-lien" aria-label="Découvrir {nom}, {cuvee['millesime']}">
            <div class="cuvee-image">
              <img src="{BASE}assets/{cuvee['slug']}.webp" width="512" height="512" loading="lazy" alt="">
              <span class="pastille">{etiquette} <span aria-hidden="true">·</span> {cuvee['millesime']}</span>
            </div>
            <div class="cuvee-texte">
              <p class="appellation">{escape(cuvee['appellation'])}</p>
              <h3>{nom}</h3>
              <p class="notes">{escape(cuvee['notes'])}</p>
              <span class="prix">{prix_fr(cuvee['prix_ttc'])} <small>/ {CONTENANCE_CL} cl</small></span>
            </div>
          </a>
        </li>"""


def accueil(cuvees):
    cartes = "\n".join(carte(cuvee) for cuvee in cuvees)
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
        <p class="hero-intro">Un vignoble de coteaux, six cuvées et autant de façons de goûter le Rhône.</p>
        <a class="bouton bouton-clair" href="#cuvees">Découvrir les cuvées</a>
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
        <p>Les six fiches de démonstration sont disponibles sous forme de données structurées.</p>
      </div>
      <a class="bouton bouton-sombre" href="catalogue.json">Ouvrir le catalogue JSON</a>
    </section>"""
    donnees = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Cuvées de démonstration Sillons Vifs",
        "numberOfItems": len(cuvees),
        "itemListElement": [
            {"@type": "ListItem", "position": i, "item": produit(c)}
            for i, c in enumerate(cuvees, 1)
        ],
    }
    return page("Sillons Vifs | Votre futur vignoble",
                "Explorez les six cuvées de Sillons Vifs, un domaine fictif imaginé par Mon Chai pour la démonstration de données produits.",
                SITE, contenu, donnees, SITE + "assets/vignoble.webp", accueil=True)


def fiche(cuvee, suivante):
    nom = escape(cuvee["nom"])
    details = (
        ("Millésime", str(cuvee["millesime"])),
        ("Couleur", cuvee["couleur"]),
        ("Cépages", ", ".join(cuvee["cepages"])),
        ("Format", f"Bouteille · {CONTENANCE_CL} cl"),
        ("Degré d’alcool", decimal_fr(cuvee["degre_alcool"]) + " % vol."),
        ("Référence", cuvee["reference"]),
    )
    lignes = "\n".join(f"          <div><dt>{label}</dt><dd>{escape(valeur)}</dd></div>" for label, valeur in details)
    contenu = f"""    <section class="largeur fiche" aria-labelledby="nom-cuvee">
      <a class="retour" href="{BASE}#cuvees">Toutes les cuvées</a>
      <div class="fiche-grille">
        <img class="fiche-image" src="{BASE}assets/{cuvee['slug']}.webp" width="512" height="512" alt="Bouteille de {nom}, Sillons Vifs" fetchpriority="high">
        <div class="fiche-corps">
          <p class="surtitre">{escape(cuvee['appellation'])} · {cuvee['millesime']}</p>
          <h1 id="nom-cuvee">{nom}</h1>
          <p class="fiche-notes">{escape(cuvee['notes'])}</p>
          <p>{escape(cuvee['description'])}</p>
          <p class="fiche-prix"><strong>{prix_fr(cuvee['prix_ttc'])}</strong> <span>Prix indicatif TTC</span></p>
          <dl class="caracteristiques">
{lignes}
          </dl>
        </div>
      </div>
      <div class="service">
        <div><h2>À table</h2><p>{escape(cuvee['accord'])}.</p></div>
        <div><h2>Service</h2><p>{escape(cuvee['service'])}</p></div>
        <a class="retour" href="{url_cuvee(suivante)}">Cuvée suivante <span>{escape(suivante['nom'])}</span></a>
      </div>
    </section>"""
    donnees = {"@context": "https://schema.org", **produit(cuvee)}
    return page(f"{cuvee['nom']} {cuvee['millesime']} | {DOMAINE}", cuvee["description"],
                donnees["url"], contenu, donnees, image_cuvee(cuvee))


def catalogue(cuvees):
    return {
        "version": 1,
        "domaine": DOMAINE,
        "site": SITE,
        "demonstration": True,
        "description": "Catalogue fictif pour la démonstration d’import de données produits Mon Chai. Prix indicatifs, cuvées sans offre de vente.",
        "produits": [
            {
                **cuvee,
                "contenance_ml": CONTENANCE_CL * 10,
                "conditionnement": "Bouteille",
                "devise": DEVISE,
                "url": f"https://monchai.fr{url_cuvee(cuvee)}",
                "image": image_cuvee(cuvee),
            }
            for cuvee in cuvees
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Contrôler les fichiers publiables sans les modifier.")
    args = parser.parse_args()
    cuvees = json.loads(Path(__file__).with_name("cuvees.json").read_text(encoding="utf-8"))
    for champ in ("slug", "reference"):
        if len({cuvee[champ] for cuvee in cuvees}) != len(cuvees):
            parser.error("Valeurs en double dans le catalogue pour " + champ)
    fichiers = {
        "index.html": accueil(cuvees),
        "catalogue.json": json.dumps(catalogue(cuvees), ensure_ascii=False, indent=2) + "\n",
    }
    for i, cuvee in enumerate(cuvees):
        if not (RACINE / DOSSIER / "assets" / f"{cuvee['slug']}.webp").is_file():
            parser.error("Visuel de bouteille manquant pour " + cuvee["slug"])
        fichiers[f"cuvees/{cuvee['slug']}/index.html"] = fiche(cuvee, cuvees[(i + 1) % len(cuvees)])
    for nom, contenu in fichiers.items():
        fichier = RACINE / DOSSIER / nom
        if args.check:
            if not fichier.is_file() or fichier.read_text(encoding="utf-8") != contenu:
                parser.error(f"{nom} doit être régénéré")
        else:
            fichier.parent.mkdir(parents=True, exist_ok=True)
            fichier.write_text(contenu, encoding="utf-8", newline="\n")
    print(f"{len(cuvees)} cuvées et {len(fichiers)} fichiers cohérents.")


if __name__ == "__main__":
    main()
