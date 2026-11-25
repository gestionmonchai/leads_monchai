"""Relevé des exports CSV de performance Web de Google Search Console."""

import argparse
import csv
import io
import json
import re
import unicodedata
import zipfile
from datetime import date, timedelta
from pathlib import PurePosixPath


PAGES = {
    "guide_logiciel": "https://monchai.fr/choisir-logiciel-viticole.html",
    "guide_subventions": "https://monchai.fr/subventions-viticulture.html",
    "moteur_subventions": "https://monchai.fr/aides-vignerons.html",
    "salons": "https://monchai.fr/salons-viticoles.html",
    "fonctionnalites": "https://monchai.fr/fonctionnalites.html",
    "changement_logiciel": "https://monchai.fr/changer-de-logiciel.html",
}
FAMILLES = {
    "subventions": r"\bsubventions?\b",
    "aides": r"\baides?\b",
    "financements": r"\b(?:financements?|financer)\b",
    "salons": r"\b(?:salons?|foires?)\b",
    "logiciels": r"\b(?:logiciels?|progiciels?|erp)\b",
}


def normaliser(valeur):
    return "".join(
        c for c in unicodedata.normalize("NFKD", valeur.casefold())
        if not unicodedata.combining(c)
    ).strip()


def tableau(archive, noms, obligatoire=True):
    fichiers = [nom for nom in archive.namelist()
                if normaliser(PurePosixPath(nom).name) in noms]
    if len(fichiers) == 1:
        contenu = archive.read(fichiers[0]).decode("utf-8-sig")
        return list(csv.DictReader(io.StringIO(contenu)))
    if not fichiers and not obligatoire:
        return []
    raise ValueError(f"Un seul CSV attendu parmi {', '.join(sorted(noms))}.")


def compte(valeur):
    return int(valeur.strip().replace(" ", "").replace("\u202f", "").replace("\u00a0", "").replace(",", ""))


def nombre(ligne, champs):
    return compte(next(valeur for cle, valeur in ligne.items() if normaliser(cle) in champs))


def totaux(lignes):
    return {
        "clics": sum(nombre(ligne, {"clicks", "clics"}) for ligne in lignes),
        "impressions": sum(nombre(ligne, {"impressions"}) for ligne in lignes),
    }


def chiffres_page(ligne):
    position = next((valeur.strip() for cle, valeur in ligne.items()
                     if normaliser(cle) == "position"), "")
    return {**totaux([ligne]), "position": float(position.replace(",", ".")) if position else None}


def periode(jours, fin, duree):
    debut = fin - timedelta(days=duree - 1)
    selection = [jours.get(debut + timedelta(days=i)) for i in range(duree)]
    if any(ligne is None for ligne in selection):
        return None
    return {"du": debut.isoformat(), "au": fin.isoformat(), **totaux(selection)}


def analyser(chemin):
    with zipfile.ZipFile(chemin) as archive:
        graphique = tableau(archive, {"graphique.csv", "chart.csv"})
        pages = tableau(archive, {"pages.csv"})
        requetes = tableau(archive, {"requetes.csv", "queries.csv"})
        filtres = tableau(archive, {"filtres.csv", "filters.csv"}, obligatoire=False)

    jours = {date.fromisoformat(ligne["Date"]): ligne for ligne in graphique if ligne.get("Date")}
    if not jours:
        raise ValueError("Le graphique ne contient aucun jour.")
    fin = max(jours)
    index_pages = {next(iter(ligne.values())): ligne for ligne in pages}
    index_requetes = [(normaliser(next(iter(ligne.values()))), ligne) for ligne in requetes]
    return {
        "filtres": filtres,
        "export": {"du": min(jours).isoformat(), "au": fin.isoformat(), **totaux(jours.values())},
        "dernieres_4_semaines": periode(jours, fin, 28),
        "4_semaines_precedentes": periode(jours, fin - timedelta(days=28), 28),
        "pages": {
            nom: {"url": url, **(chiffres_page(index_pages[url]) if url in index_pages
                                else {"etat": "absente_de_l_export"})}
            for nom, url in PAGES.items()
        },
        "familles_de_requetes_visibles": {
            famille: totaux([ligne for requete, ligne in index_requetes if re.search(motif, requete)])
            for famille, motif in FAMILLES.items()
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", help="Archive ZIP CSV exportée depuis Search Console.")
    args = parser.parse_args()
    try:
        resultat = analyser(args.export)
    except (OSError, ValueError, KeyError, StopIteration, zipfile.BadZipFile) as erreur:
        parser.error(f"Export de performances Web illisible : {erreur}")
    print(json.dumps(resultat, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
