"""Sections et parcours de visite de la vitrine Sillons Vifs."""

from html import escape

VISITES = {
    "sejours": ("Séjours", "Dormir au milieu des vignes",
                "Une chambre face aux rangs ou un gîte avec terrasse, à la Bastide des Roches Claires.",
                "chambre-amandiers"),
    "experiences": ("Expériences", "Entrer dans les vignes",
                    "Marcher dans les coteaux, assembler deux vins au chai ou déjeuner sur la terrasse.",
                    "du-rang-au-verre"),
    "domaines": ("Nos domaines", "Deux lieux, une vallée",
                 "Du chai où les vins prennent forme à la bastide où l’on s’attarde au milieu des rangs.",
                 "chai-de-la-combe"),
}


def dialogue_reservation():
    return """    <dialog class="panneau" id="reservation" aria-labelledby="titre-reservation">
      <div class="panneau-entete">
        <h2 id="titre-reservation"></h2>
        <button class="panneau-fermer" type="button" aria-label="Fermer" data-fermer>×</button>
      </div>
      <fieldset class="champs-reservation">
        <legend>Préparer la réservation</legend>
        <div><label for="reservation-date">Date</label><input id="reservation-date" type="date" required></div>
        <div><label for="reservation-personnes">Personnes</label><input id="reservation-personnes" type="number" min="1" step="1" value="2" required></div>
        <div data-champ-nuits hidden><label for="reservation-nuits">Nuits</label><input id="reservation-nuits" type="number" min="1" step="1" value="1" required></div>
      </fieldset>
      <p class="reservation-total" aria-live="polite"></p>
      <button class="bouton bouton-sombre" type="button" data-reservation-ajouter>Ajouter au panier</button>
    </dialog>"""


def apercu(base):
    cartes = []
    for cle, (nom, _, _, image) in VISITES.items():
        cartes.append(f"""          <li><a href="{base}{cle}/">
            <img src="{base}assets/{image}.webp" alt="" loading="lazy" width="768" height="512">
            <span>{escape(nom)}</span>
          </a></li>""")
    return f"""    <section class="escale" aria-labelledby="titre-escale">
      <div class="largeur">
        <h2 id="titre-escale">Venir à Sillons Vifs</h2>
        <p>Une nuit au milieu des rangs, le temps d’un atelier ou d’un déjeuner.</p>
        <ul class="escale-grille">
{chr(10).join(cartes)}
        </ul>
      </div>
    </section>"""


def articles_visite(cle, data, base, prix_fr):
    domaines = {domaine["slug"]: domaine["nom"] for domaine in data["domaines"]}
    offres = []
    for article in data[cle]:
        nom = escape(article["nom"])
        points = "".join(f"<li>{escape(point)}</li>" for point in article["details"])
        if cle == "domaines":
            lieu = escape(article["lieu"])
            action = f'<a class="bouton bouton-sombre" href="{base}{article["lien"]}">{escape(article["action"])}</a>'
        else:
            domaine = article["domaine"]
            lieu = f'<a href="{base}domaines/#{domaine}">{escape(domaines[domaine])}</a>'
            unite = "nuit" if cle == "sejours" else "personne"
            horaire = f' data-horaire="{escape(article["horaire"])}"' if "horaire" in article else ''
            action = f"""<p class="offre-prix"><strong>{prix_fr(article["prix"])}</strong> / {unite}{(" · " + escape(article["horaire"])) if "horaire" in article else ""}</p>
            <button class="bouton bouton-sombre" type="button" data-reserver="{article["slug"]}" data-nom="{nom}"
              data-prix="{round(article["prix"] * 100)}" data-unite="{unite}" data-capacite="{article["capacite"]}"{horaire} hidden>Choisir une date</button>"""
        offres.append(f"""        <article class="offre" id="{article["slug"]}">
          <img src="{base}assets/{article["image"]}.webp" width="768" height="512" loading="lazy" alt="{escape(article["alt"])}">
          <div class="offre-corps">
            <p class="offre-lieu">{lieu}</p>
            <h2>{nom}</h2>
            <p>{escape(article["description"])}</p>
            <ul class="offre-details">{points}</ul>
            {action}
          </div>
        </article>""")
    return "\n".join(offres)


def contenu_visite(cle, data, base, prix_fr):
    nom, titre, description, image = VISITES[cle]
    carte = articles_visite(cle, data, base, prix_fr)
    reservation = dialogue_reservation() if cle != "domaines" else ""
    liens = []
    for rubrique, (libelle, *_) in VISITES.items():
        courant = ' aria-current="page"' if rubrique == cle else ''
        liens.append(f'<li><a href="{base}{rubrique}/"{courant}>{libelle}</a></li>')
    if cle == "domaines":
        liens.append('<li><a href="#parcelles">Les parcelles</a></li>')
    navigation = "\n        ".join(liens)
    return f"""    <section class="hero hero-visite" aria-labelledby="titre-visite">
      <picture class="hero-image">
        <img src="{base}assets/{image}.webp" width="768" height="512" alt="" fetchpriority="high">
      </picture>
      <div class="largeur hero-contenu">
        <p class="surtitre">{nom}</p>
        <h1 id="titre-visite">{titre}</h1>
        <p class="hero-intro">{description}</p>
      </div>
    </section>
    <section class="largeur visite-liste">
      <ul class="liens-visite" aria-label="Explorer Sillons Vifs">
        <li><a href="{base}#cuvees">Les cuvées</a></li>
        {navigation}
      </ul>
      <div class="offres offres-{cle}">
{carte}
      </div>
    </section>
{reservation}"""
