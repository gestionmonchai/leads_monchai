"""Ajustements idempotents des fragments et résumés avant génération."""
from pathlib import Path
import re
import sys
from bs4 import BeautifulSoup

ROOT = Path(sys.argv[1]).resolve()

def fragment(name, transform):
    p = ROOT / 'outils/editorial' / name
    old = p.read_text(encoding='utf-8')
    new = transform(old)
    if new != old:
        p.write_text(new, encoding='utf-8', newline='\n')

def circulation(s):
    if 'id="vente-distance"' not in s:
        added = '''<section aria-labelledby="vente-distance"><h2 id="vente-distance">Vente à distance : le document commercial reste obligatoire</h2><p>Pour un envoi à un particulier en France, la Douane exige un document commercial dans ou sur le colis, avec identité et adresse de l’expéditeur, identité et adresse du destinataire, lieu de livraison s’il diffère, nature et quantités des produits, et indication de vente à distance de produits soumis à accise. La dispense de titre fiscal ne supprime donc pas ce document. La FAQ officielle précise qu’il est requis même lorsque les produits portent une capsule fiscale.</p><p>Vers un particulier d’un autre État membre, consultez les formalités de destination et les mentions supplémentaires : le recours à un représentant fiscal dépend du pays, il n’est pas universellement obligatoire dans l’Union. <a href="{{SOURCE_VAD}}">Douane : vente à distance, France et autres États membres</a>.</p></section>\n'''
        s = s.replace('<section aria-labelledby="limites-crd">', added + '<section aria-labelledby="limites-crd">', 1)
    s = s.replace('<a href="#limites-crd">Limites des CRD</a>', '<a href="#limites-crd">Limites des CRD</a><a href="#vente-distance">Vente à distance</a>') if 'href="#vente-distance"' not in s else s
    return s

fragment('circulation-corps.html', circulation)

def drm(s):
    return s.replace('La modification CIEL dépend du système comptable et des déclarations suivantes déjà validées.', 'La FAQ CIEL exclut la modification en ligne après la date limite de dépôt, ainsi que lorsqu’une déclaration de la période suivante a déjà été validée. Sa disponibilité dépend aussi du système comptable.')

fragment('drm-corps.html', drm)

summaries = {
    'declaration-recolte-2026.html': ('Récolte 2026 : dates, portails et étapes de dépôt', 'Identifiez votre qualité de déclarant et votre portail avant de retenir une date. Procédure, 23 fiches d’interprofessions, checklist et sources.'),
    'drm-vin-guide.html': ('DRM du vin : qui déclare, quand et comment déposer', 'Entrepositaires agréés : dépôt au plus tard le 10 du mois suivant, avec le report prévu pour un jour non ouvré. Données, contrôles et confirmation du dépôt.'),
    'dae-daes-gamma2-vin.html': ('DAE, DAES, DSA : choisir le document de circulation du vin', 'Destination, destinataire et régime de droits : choisissez le parcours adapté. CRD nationales, vente à distance et formalités GAMMA 2 distinguées.'),
}
for path in ROOT.glob('*.html'):
    if path.name in summaries:
        continue
    source = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(source, 'html.parser')
    changed = False
    for card in soup.select('article.actu-fiche'):
        for target, (title, summary) in summaries.items():
            if card.select_one('h2 a[href="' + target + '"]'):
                heading = card.select_one('h2 a')
                paragraph = card.select_one('.actu-fiche__resume')
                if heading and paragraph:
                    heading.string = title
                    paragraph.string = summary
                    old = re.search(r'<article\b[^>]*>[\s\S]*?</article>', str(card))
                    # Remplacement ciblé par la carte de même URL dans le HTML brut.
                    pattern = r'<article\b[^>]*>[\s\S]*?</article>'
                    def replace(m):
                        return str(card) if re.search(r'<h2\b[^>]*>[\s\S]*?href="' + re.escape(target) + '"', m[0]) else m[0]
                    updated = re.sub(pattern, replace, source)
                    changed = changed or updated != source
                    source = updated
    if path.name == 'actualites-douane-declarations.html':
        source = source.replace('Les premiers articles de cette rubrique paraîtront prochainement. En attendant, voici les échéances qui structurent l’année déclarative et les sources à consulter directement.', 'Retrouvez les guides de récolte, de DRM et de circulation ci-dessus. Pour les autres formalités, partez de votre qualité de déclarant et des sources officielles.')
        source = re.sub(r'<p[^>]*>Les premiers articles de cette rubrique paraîtront prochainement\.[\s\S]*?</p>', '<p>Retrouvez les guides de récolte, de DRM et de circulation ci-dessus. Les autres obligations se vérifient selon votre statut et les sources officielles.</p>', source)
        source = source.replace("DRM avant le 10 du mois, déclaration de stock le 10 septembre, déclaration de récolte avant le 10 décembre, titres de mouvement pour chaque expédition", "DRM mensuelle, récolte et production selon votre qualité de déclarant, stocks et circulation du vin")
        changed = True
    if path.name == 'dja-installation-vigneron.html' and 'id="aides-complementaires"' not in source:
        block = '<section id="aides-complementaires"><h2>Comparer les autres démarches d’installation</h2><p>Chaque dispositif possède ses propres critères. Leur rapprochement ne garantit ni l’éligibilité ni le cumul.</p><ul><li><a href="aide-nouveaux-agriculteurs-viticulture.html">S’installer hors du parcours jeune agriculteur</a></li><li><a href="aide-msa-jeunes-viticulture.html">Exonération MSA des jeunes agriculteurs</a></li><li><a href="aide-acja-viticulture.html">ACJA : aide complémentaire PAC</a></li><li><a href="aide-acre-viticulture.html">ACRE agricole</a> et <a href="aide-arce-are-viticulture.html">droits ARCE ou ARE</a></li></ul></section>'
        source = source.replace('</main>', block + '</main>', 1)
        changed = True
    if changed:
        path.write_text(source, encoding='utf-8', newline='\n')
print('Fragments, cartes et liens DJA actualisés.')
