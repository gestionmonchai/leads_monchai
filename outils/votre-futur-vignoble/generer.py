"""Génère les fiches et les pages de la vitrine Sillons Vifs."""

import argparse
import json
from html import escape
from pathlib import Path

from hospitalite import VISITES, apercu, contenu_visite

RACINE = Path(__file__).resolve().parents[2]
DOSSIER = "votre-futur-vignoble"
BASE = f"/{DOSSIER}/"
SITE = f"https://monchai.fr{BASE}"
DOMAINE = "Sillons Vifs"
DEVISE = "EUR"
VIDEO_CUVEE = "elan-de-schiste"
# Coordonnées du texte imprimé sur le papier dans les photos de 512 px.
IMPRESSION_VERSO = {
    "elan-de-schiste": (329, 41, "#cdb1c9"),
    "de-bonne-heure": (322, 43, "#f0e3c9"),
    "a-fleur-de-roche": (322, 43, "#eed8ce"),
    "la-pente-douce": (333, 45, "#e5a594"),
    "vent-de-craie": (333, 45, "#d0d7bb"),
    "les-eclats": (343, 43, "#f3e5ae"),
    "elan-de-schiste-magnum": (342, 61, "#d9b8d4"),
}
FILTRES = ("Toutes", "Rouge", "Blanc", "Rosé", "Bulles")
CHAMPS_TECHNIQUES = (
    ("Vendanges", "vendanges", None),
    ("Vinification", "vinification", None),
    ("Élevage", "elevage", None),
    ("Sucres résiduels", "sucres_g_l", "g/L"),
    ("Garde", "garde", None),
    ("Ingrédients", "ingredients", None),
    ("Fabrication", "fabrication", None),
    ("Acidité", "acidite_pct", "%"),
    ("Conservation", "conservation", None),
    ("Allergènes", "allergenes", None),
    ("Lot", "lot", None),
    ("Stock au caveau", "stock_caveau", "unités"),
    ("Unités par carton", "unites_carton", "unités"),
    ("Poids brut", "poids_brut_g", "g"),
)


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


def assemblage(article):
    return ", ".join(f"{cepage} {part} %" for cepage, part in article["assemblage"].items())


def proprietes_techniques(article):
    valeurs = []
    if "assemblage" in article:
        valeurs.append(("Assemblage", assemblage(article), None))
    valeurs.extend(
        (nom, article[cle], unite) for nom, cle, unite in CHAMPS_TECHNIQUES if cle in article
    )
    return valeurs


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
    prix = article["prix_ttc"]
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
    proprietes = [dimension(article), ("Prix indicatif TTC", prix, DEVISE),
                  ("Conditionnement", article["conditionnement"], None)]
    for nom, cle, unite in champs:
        if cle in article:
            valeur = ", ".join(article[cle]) if cle == "cepages" else article[cle]
            proprietes.append((nom, valeur, unite))
    if article.get("parcelles"):
        proprietes.append(("Parcelles", ", ".join(p["nom"] for p in article["parcelles"]), None))
    proprietes.extend(proprietes_techniques(article))
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
        "weight": {"@type": "QuantitativeValue", "value": article["poids_brut_g"], "unitCode": "GRM"},
        "offers": {
            "@type": "Offer",
            "url": url,
            "description": "Tarif et disponibilité de démonstration.",
            "price": prix,
            "priceCurrency": DEVISE,
            "priceSpecification": {"@type": "UnitPriceSpecification", "price": prix,
                                   "priceCurrency": DEVISE, "valueAddedTaxIncluded": True},
            "availability": "https://schema.org/" + ("InStock" if article["stock_caveau"] else "OutOfStock"),
            "inventoryLevel": {"@type": "QuantitativeValue", "value": article["stock_caveau"], "unitCode": "C62"},
        },
        "additionalProperty": [
            {"@type": "PropertyValue", "name": nom, "value": valeur,
             **({"unitText": unite} if unite else {})}
            for nom, valeur, unite in proprietes
        ],
    }


def page(titre, description, canonical, contenu, donnees, image, accueil=False):
    script = ""
    if accueil:
        script = f'  <script src="{BASE}filtres.js" defer></script>\n  <script src="{BASE}cartes.js" defer></script>\n'
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
  <meta property="og:type" content="website">
  <meta property="og:title" content="{escape(titre)}">
  <meta property="og:description" content="{escape(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{image}">
  <link rel="stylesheet" href="{BASE}style.css?v=20261127-terroirs">
  <script src="{BASE}majorite.js" defer></script>
  <script src="{BASE}boutique.js" defer></script>
{script}  <script type="application/ld+json">{jsonld}</script>
</head>
<body>
  <dialog class="verification-age" id="verification-age" aria-labelledby="titre-majorite">
    <div class="age-texte">
      <p class="marque"><span class="sillon" aria-hidden="true"><i></i><i></i><i></i></span> Sillons Vifs</p>
      <h2 id="titre-majorite" tabindex="-1" autofocus>Avez-vous<br><em>18&nbsp;ans ou plus&nbsp;?</em></h2>
      <div class="age-actions">
        <button class="bouton bouton-sombre" type="button" data-confirmer-age>Oui, j’ai 18 ans ou plus</button>
        <button class="bouton bouton-sortie" type="button" data-quitter-vitrine>Non, quitter la vitrine</button>
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
        <a href="{BASE}sejours/">Séjours</a>
        <a href="{BASE}experiences/">Expériences</a>
        <a href="{BASE}domaines/">Nos domaines</a>
      </nav>
      <button class="panier-ouvrir" type="button" data-panier-ouvrir aria-controls="panier" hidden>Panier <span data-panier-nombre>0</span></button>
    </div>
  </header>
  <main id="contenu" tabindex="-1">
{contenu}
  </main>
  <dialog class="panneau" id="panier" aria-labelledby="titre-panier">
    <div class="panneau-entete">
      <h2 id="titre-panier">Votre panier</h2>
      <button class="panneau-fermer" type="button" aria-label="Fermer le panier" data-fermer>×</button>
    </div>
    <p id="panier-vide">Votre panier est vide.</p>
    <ul id="panier-lignes" class="panier-lignes"></ul>
    <p class="panier-total" aria-live="polite">Total <strong data-panier-total>0,00 €</strong></p>
    <button class="bouton bouton-sombre" type="button" data-fermer>Continuer la visite</button>
    <p class="panier-demo">Les achats et les réservations sont simulés.</p>
  </dialog>
  <footer class="pied">
    <div class="largeur pied-contenu">
      <div>
        <a class="marque" href="{BASE}">Sillons Vifs</a>
        <p>Vignoble fictif créé pour une démonstration Mon Chai. Les offres et leurs tarifs sont illustratifs.</p>
      </div>
      <a class="retour-monchai" href="/">Découvrir Mon Chai</a>
    </div>
  </footer>
</body>
</html>
"""


def ajout_panier(article, classe):
    if not article["stock_caveau"]:
        return ""
    nom = escape(article["nom"])
    return f"""<button class="{classe}" type="button" data-ajouter="{article['reference']}"
              data-nom="{nom}" data-prix="{round(article['prix_ttc'] * 100)}"
              data-format="{escape(format_court(article))}" hidden>Ajouter au panier</button>"""


def a_video(article):
    return article["slug"] in {VIDEO_CUVEE, "trois-coteaux", "elan-de-schiste-magnum"}


def titre_apercu(article):
    return "Dans le coffret" if "contenu" in article else "Conseils et accords"


def menu_produit(article):
    url = BASE + chemin_produit(article)
    nom = escape(article["nom"])
    zone = f"apercu-{article['slug']}"
    video = ''
    if a_video(article):
        video = f'<a href="{BASE}cuvees/{VIDEO_CUVEE}/#video-sommelier" data-apercu="video" aria-controls="{zone}">Vidéo de la sommelière</a>'
    return f"""          <details class="menu-produit">
            <summary aria-label="Actions pour {nom}"><i aria-hidden="true"></i></summary>
            <div class="menu-produit-liens">
              <a href="{url}">Voir la fiche complète</a>
              <a href="{url}#degustation" data-apercu="accords" aria-controls="{zone}">{titre_apercu(article)}</a>
              {video}{ajout_panier(article, "menu-ajouter")}
            </div>
          </details>"""


def lecteur_sommelier():
    return f"""<video controls playsinline preload="none" width="1280" height="720" poster="{BASE}assets/camille-degustation.webp" aria-label="Camille présente Élan de Schiste">
          <source src="{BASE}assets/camille-degustation.mp4" type="video/mp4">
          <track src="{BASE}assets/camille-degustation.vtt" kind="captions" srclang="fr" label="Français" default>
        </video>"""


def photo_carte(article, verso):
    slug = article["slug"]
    recto = f'<img class="face-recto" src="{BASE}assets/{slug}.webp" width="512" height="512" loading="lazy" alt="">'
    if not verso:
        return recto
    impression = ""
    if slug in IMPRESSION_VERSO:
        y, hauteur, papier = IMPRESSION_VERSO[slug]
        position = f"--papier-etiquette:{papier};--texte-y:{y / 5.12:.2f}%;--texte-h:{hauteur / 5.12:.2f}%"
        impression = f"""
                  <div class="impression-verso" style="{position}" aria-hidden="true">
                    <span>{escape(article['appellation'])}</span>
                    <span>{article['millesime']} · {format_court(article)}</span>
                    <span>{decimal_fr(article['degre_alcool'])} % vol.</span>
                  </div>"""
    return f"""<div class="photo-rotation">
                {recto}
                <div class="face-verso">
                  <img src="{BASE}assets/{slug}-verso.webp" width="512" height="512" loading="lazy" alt="">{impression}
                </div>
              </div>"""


def apercus_carte(article, produits, verso):
    slug = article["slug"]
    nom = escape(article["nom"])
    accords = "\n".join(conseils_article(article, produits, "h5"))
    etiquette = ""
    if verso:
        etiquette = f"""              <div data-contenu="etiquette" hidden>
                <h4>Contre-étiquette</h4>
                <p>{escape(surtitre_produit(article))}</p>
                <p>{escape(article['description'])}</p>
                <dl class="caracteristiques">
{caracteristiques(article)}
                </dl>
              </div>"""
    video = ""
    if a_video(article):
        video = f"""              <div data-contenu="video" hidden>
                <h4>La dégustation avec Camille</h4>
                <p>Élan de Schiste · 2023 · 75 cl</p>
                <template>{lecteur_sommelier()}</template>
                <div data-lecteur></div>
              </div>"""
    return f"""          <div class="carte-couche">
            <section class="carte-apercu" id="apercu-{slug}" aria-label="Aperçu de {nom}" hidden>
              <button class="carte-fermer" type="button" data-fermer-apercu aria-label="Fermer l’aperçu">×</button>
              <div class="carte-apercu-corps">
                <div data-contenu="accords" hidden>
                  <h4>{titre_apercu(article)}</h4>
                  <p class="carte-nom">{nom}</p>
{accords}
                </div>
{etiquette}
{video}
              </div>
            </section>
          </div>"""


def carte(article, produits):
    nom = escape(article["nom"])
    slug = article["slug"]
    vin = article["collection"] == "cuvees"
    attribut = f' data-couleur="{categorie(article).lower()}"' if vin else ''
    if vin:
        pastille = f"{categorie(article)} · {article['millesime']}"
        libelle = f"{nom}, {article['millesime']}"
    else:
        pastille = article["conditionnement"]
        libelle = nom
    sous_titre = article["appellation"] if vin else article["type"]
    verso = (RACINE / DOSSIER / "assets" / f"{slug}-verso.webp").is_file()
    outils = ""
    if verso:
        outils = f"""          <div class="carte-outils" hidden>
            <button type="button" data-retourner>Contre-étiquette</button>
            <button type="button" data-apercu="etiquette" aria-controls="apercu-{slug}" hidden>Lire l’étiquette</button>
          </div>"""
    return f"""        <li class="cuvee"{attribut}>
          <a href="{BASE}{chemin_produit(article)}" class="cuvee-lien" aria-label="Découvrir {libelle}">
            <div class="cuvee-image">
              {photo_carte(article, verso)}
              <span class="pastille">{escape(pastille)}</span>
            </div>
            <div class="cuvee-texte">
              <p class="appellation">{escape(sous_titre)}</p>
              <h3>{nom}</h3>
              <p class="notes">{escape(article['notes'])}</p>
              <span class="prix">{prix_fr(article['prix_ttc'])} <small>/ {escape(format_court(article))}</small></span>
            </div>
          </a>
{menu_produit(article)}
{outils}
{apercus_carte(article, produits, verso)}
        </li>"""


def accueil(cuvees, comptoir, produits, parcelles):
    cartes = "\n".join(carte(cuvee, produits) for cuvee in cuvees)
    cartes_comptoir = "\n".join(carte(article, produits) for article in comptoir)
    filtres = "\n".join(
        f'          <button type="button" data-filtre="{nom.lower()}" aria-pressed="{str(nom == "Toutes").lower()}">{nom}</button>'
        for nom in FILTRES
    )
    cepages = ", ".join(sorted({cepage for p in parcelles for cepage in p["plantations"]}, key=str.casefold))
    contenu = f"""    <section class="hero" aria-labelledby="titre">
      <picture class="hero-image">
        <source media="(max-width: 640px)" srcset="{BASE}assets/vignoble-mobile.webp">
        <img src="{BASE}assets/vignoble.webp" width="1536" height="1024" alt="" fetchpriority="high">
      </picture>
      <div class="largeur hero-contenu">
        <p class="surtitre">Vallée du Rhône</p>
        <h1 id="titre">Faisons parler<br><em>le terroir.</em></h1>
        <p class="hero-intro">Des vins de coteaux, des coffrets et le raisin jusque dans l’épicerie.</p>
        <div class="hero-actions">
          <a class="bouton bouton-clair" href="#cuvees">Découvrir les produits</a>
          <a class="bouton bouton-transparente" href="{BASE}sejours/">Séjourner au domaine</a>
        </div>
      </div>
    </section>

    <section class="largeur cepages-domaine" aria-labelledby="titre-cepages">
      <div>
        <h2 id="titre-cepages">Les cépages du domaine</h2>
        <p>{escape(cepages)}.</p>
      </div>
      <a class="bouton bouton-sombre" href="{BASE}domaines/#parcelles">Explorer les parcelles</a>
    </section>

    <section class="largeur section-cuvees" id="cuvees" aria-labelledby="titre-cuvees">
      <div class="entete-section">
        <div>
          <h2 id="titre-cuvees">Les cuvées</h2>
            <p>Consultez les fiches pour découvrir les assemblages et les accords de chaque millésime.</p>
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

{apercu(BASE)}

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
    </section>"""
    donnees = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Les produits de Sillons Vifs",
        "numberOfItems": len(cuvees) + len(comptoir),
        "itemListElement": [
            {"@type": "ListItem", "position": i, "url": url_produit(c), "name": c["nom"], "item": produit(c)}
            for i, c in enumerate([*cuvees, *comptoir], 1)
        ],
    }
    return page("Sillons Vifs | Votre futur vignoble",
                "Explorez les vins et l’épicerie de Sillons Vifs, les séjours au milieu des vignes et les expériences au chai.",
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


def fiche_technique(article):
    valeurs = []
    for nom, valeur, unite in proprietes_techniques(article):
        texte = f"{decimal_fr(valeur)} {unite}" if unite else escape(valeur)
        valeurs.append((nom, texte))
    if article.get("parcelles"):
        liens = ", ".join(
            f'<a href="{BASE}domaines/#{p["slug"]}">{escape(p["nom"])}</a>' for p in article["parcelles"]
        )
        valeurs.insert(1, ("Parcelles", liens))
    lignes = "\n".join(f"          <div><dt>{nom}</dt><dd>{valeur}</dd></div>" for nom, valeur in valeurs)
    return f"""      <section class="fiche-technique" id="fiche-technique" aria-labelledby="titre-technique">
        <h2 id="titre-technique">Fiche technique</h2>
        <dl class="caracteristiques">
{lignes}
        </dl>
      </section>"""


def conseils_article(article, produits, balise):
    contenu = []
    if "contenu" in article:
        liens = []
        for ligne in article["contenu"]:
            inclus = produits[ligne["reference"]]
            liens.append(f'<li>{ligne["quantite"]} × <a href="{BASE}{chemin_produit(inclus)}">{escape(inclus["nom"])}</a> · {format_court(inclus)}</li>')
        titre = '<h2>Dans le coffret</h2>' if balise == "h2" else ''
        contenu.append('<div class="contenu-coffret">' + titre + '<ul>' + "".join(liens) + '</ul></div>')
    for titre, cle in (("À table", "accord"), ("Service", "service"), ("En cuisine", "conseil")):
        if cle in article:
            contenu.append(f"<div><{balise}>{titre}</{balise}><p>{escape(article[cle])}</p></div>")
    return contenu


def service(article, suivante, produits):
    contenu = conseils_article(article, produits, "h2")
    contenu.append(f'<a class="retour" href="{BASE}{chemin_produit(suivante)}">À découvrir ensuite <span>{escape(suivante["nom"])}</span></a>')
    return "\n        ".join(contenu)


def video_sommelier(article):
    if article["slug"] != VIDEO_CUVEE:
        return ""
    return f"""      <section class="video-sommelier" id="video-sommelier" aria-labelledby="titre-video">
        <div>
          <p class="surtitre">Dans le verre</p>
          <h2 id="titre-video">La dégustation avec Camille</h2>
          <p>Les arômes d’Élan de Schiste 2023 et deux idées pour le servir à table.</p>
        </div>
        {lecteur_sommelier()}
      </section>"""


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
    bouton = ajout_panier(article, "bouton bouton-sombre fiche-ajouter")
    ajout = f"\n          {bouton}" if bouton else ""
    video = video_sommelier(article)
    technique = fiche_technique(article)
    contenu = f"""    <section class="largeur fiche" aria-labelledby="nom-cuvee">
      <a class="retour" href="{BASE}#{ancre}">{retour}</a>
      <div class="fiche-grille">
        <img class="fiche-image" src="{BASE}assets/{article['slug']}.webp" width="512" height="512" alt="{nom}, {DOMAINE}" fetchpriority="high">
        <div class="fiche-corps">
          <p class="surtitre">{escape(surtitre_produit(article))}</p>
          <h1 id="nom-cuvee">{nom}</h1>
          <p class="fiche-notes">{escape(article['notes'])}</p>
          <p>{escape(article['description'])}</p>
          <p class="fiche-prix"><strong><data value="{article['prix_ttc']:.2f}">{prix_fr(article['prix_ttc'])}</data></strong>
            <span>Prix indicatif TTC</span>
            <span>{'En stock au caveau' if article['stock_caveau'] else 'Rupture au caveau'}</span>
          </p>
          <dl class="caracteristiques">
{lignes}
          </dl>{lien_format}{ajout}
          <p class="lien-technique"><a href="#fiche-technique">Voir la fiche technique</a></p>
        </div>
      </div>
{technique}
      <div class="service" id="degustation">
        {conseils}
      </div>
{video}
    </section>"""
    donnees = {"@context": "https://schema.org", **produit(article)}
    titre = " ".join(str(article[cle]) for cle in ("nom", "millesime") if cle in article)
    return page(f"{titre} | {DOMAINE}", article["description"], donnees["url"],
                contenu, donnees, image_produit(article))


def parcellaire(domaines, parcelles, cuvees):
    groupes = []
    entites = []
    for domaine in domaines:
        cartes = []
        for parcelle in parcelles:
            if parcelle["domaine"] != domaine["slug"]:
                continue
            slug = parcelle["slug"]
            plantations = ", ".join(f"{cepage} ({annee})" for cepage, annee in parcelle["plantations"].items())
            valeurs = [
                ("Surface", parcelle["surface_ha"], "ha"),
                ("Altitude", parcelle["altitude_m"], "m"),
                ("Exposition", parcelle["exposition"], None),
                ("Sol", parcelle["sol"], None),
                ("Cépages et années de plantation", plantations, None),
            ]
            description = "\n".join(
                f'            <div><dt>{nom}</dt><dd>{decimal_fr(valeur) + " " + unite if unite else escape(valeur)}</dd></div>'
                for nom, valeur, unite in valeurs
            )
            vins = ", ".join(
                f'<a href="{BASE}{chemin_produit(article)}">{escape(article["nom"])}</a>'
                for article in cuvees if parcelle in article["parcelles"]
            )
            liens = f'\n          <p class="lien-technique">Dans nos cuvées · {vins}</p>' if vins else ""
            cartes.append(f"""        <article class="parcelle" id="{slug}">
          <h4>{escape(parcelle["nom"])}</h4>
          <dl class="caracteristiques">
{description}
          </dl>{liens}
        </article>""")
            url = f"{SITE}domaines/#{slug}"
            entites.append({
                "@type": "Place",
                "@id": url,
                "url": url,
                "name": parcelle["nom"],
                "containedInPlace": {"@type": "Place", "name": domaine["nom"],
                                     "url": f'{SITE}domaines/#{domaine["slug"]}'},
                "additionalProperty": [
                    {"@type": "PropertyValue", "name": nom, "value": valeur,
                     **({"unitText": unite} if unite else {})}
                    for nom, valeur, unite in valeurs
                ],
            })
        groupes.append(f"""      <h3>{escape(domaine["nom"])}</h3>
      <div class="grille-parcelles">
{chr(10).join(cartes)}
      </div>""")
    surface = decimal_fr(sum(p["surface_ha"] for p in parcelles))
    return f"""
    <section class="largeur parcellaire" id="parcelles" aria-labelledby="titre-parcelles">
      <div class="entete-section">
        <div>
          <h2 id="titre-parcelles">Nos parcelles</h2>
          <p>{len(parcelles)} parcelles sur {surface} hectares, entre les terrasses du chai et les coteaux de la bastide.</p>
        </div>
      </div>
{chr(10).join(groupes)}
    </section>""", entites


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
    visites = lire_collection("hospitalite")
    parcelles = lire_collection("parcelles")
    par_slug = {p["slug"]: p for p in parcelles}
    if len(par_slug) != len(parcelles):
        parser.error("Identifiants de parcelles en double")
    domaines = {domaine["slug"] for domaine in visites["domaines"]}
    for p in parcelles:
        if p["domaine"] not in domaines or p["surface_ha"] <= 0 or not p["plantations"]:
            parser.error("Parcelle invalide : " + p["slug"])
    for article in articles:
        for champ, minimum in (("stock_caveau", 0), ("unites_carton", 1), ("poids_brut_g", 1)):
            valeur = article.get(champ)
            if type(valeur) is not int or valeur < minimum:
                parser.error(f"{champ} invalide pour {article['slug']}")
        if not article.get("lot"):
            parser.error("Lot manquant pour " + article["slug"])
        slugs = article.get("parcelles", [])
        if any(slug not in par_slug for slug in slugs):
            parser.error("Parcelle inconnue pour " + article["slug"])
        article["parcelles"] = [par_slug[slug] for slug in slugs]
        if "assemblage" in article:
            parts = article["assemblage"]
            if sum(parts.values()) != 100 or any(part <= 0 for part in parts.values()):
                parser.error("Assemblage invalide pour " + article["slug"])
            article["cepages"] = list(parts)
        if slugs:
            plantes = {cepage for p in article["parcelles"] for cepage in p["plantations"]}
            if not set(article.get("cepages", [])) <= plantes:
                parser.error("Cépage sans parcelle pour " + article["slug"])

    fichiers = {"index.html": accueil(cuvees, comptoir, par_reference, parcelles)}
    for cle, (nom, titre, description, image) in VISITES.items():
        url = f"{SITE}{cle}/"
        contenu = contenu_visite(cle, visites, BASE, prix_fr)
        meta = {"@context": "https://schema.org", "@type": "WebPage", "name": titre, "url": url,
                "description": description, "inLanguage": "fr"}
        if cle == "domaines":
            section, entites = parcellaire(visites["domaines"], parcelles, cuvees)
            contenu += section
            meta["mainEntity"] = entites
        fichiers[f"{cle}/index.html"] = page(f"{nom} | {DOMAINE}", description, url, contenu,
                                            meta, f"{SITE}assets/{image}.webp")
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
