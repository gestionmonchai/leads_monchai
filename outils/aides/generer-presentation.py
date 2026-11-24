"""Génère la page autonome ; ne migre pas l'URL du moteur.

python outils/aides/generer-presentation.py CHEMIN_SITE
"""
import argparse
from datetime import date
import html
import json
from pathlib import Path
import re

SLUG = 'subventions-viticulture.html'
PUBLISHED = '2026-11-21'
TITLE = 'Subventions viticoles : financer son domaine'
DESCRIPTION = 'Quels financements pour votre domaine viticole ? Explorez les subventions et aides par projet et région avec le moteur gratuit de Mon Chai.'


def date_fr(value):
    d = date.fromisoformat(value)
    months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    return f'{d.day} {months[d.month - 1]} {d.year}'


def generate(root):
    template = (root / 'ressources.html').read_text(encoding='utf-8')
    body_header = template[template.index('<body'):template.index('<main')]
    body_header = re.sub(r' aria-current="page"', '', body_header)
    # Le générateur du header commun rétablit ensuite langue et rubrique courantes.
    footer = re.search(r'<footer\b[^>]*>.*?</footer>', template, re.S)[0]
    scripts = template[template.index('</footer>') + len('</footer>'):template.index('</body>')]
    catalogue = json.loads((root / 'outils/aides/catalogue.json').read_text(encoding='utf-8'))
    body = (root / 'outils/aides/subventions-viticulture-corps.html').read_text(encoding='utf-8')
    body = body.replace('@@NOMBRE_FICHES@@', str(len(catalogue['fiches'])))
    body = body.replace('@@VEILLE_ISO@@', catalogue['derniere_veille']).replace('@@VEILLE_LIBELLE@@', date_fr(catalogue['derniere_veille']))
    url = f'https://monchai.fr/{SLUG}'
    schema = {'@context': 'https://schema.org', '@type': 'WebPage', 'name': TITLE, 'description': DESCRIPTION, 'url': url,
              'inLanguage': 'fr', 'datePublished': PUBLISHED, 'dateModified': PUBLISHED,
              'publisher': {'@type': 'Organization', 'name': 'Mon Chai', 'url': 'https://monchai.fr/'},
              'isPartOf': {'@type': 'WebSite', 'name': 'Mon Chai', 'url': 'https://monchai.fr/'},
              'relatedLink': ['https://monchai.fr/aides-vignerons.html'],
              'image': 'https://monchai.fr/assets/img/editorial/aides-viticoles-photo-2026.jpg'}
    breadcrumb = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': 'https://monchai.fr/'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Ressources', 'item': 'https://monchai.fr/ressources.html'},
        {'@type': 'ListItem', 'position': 3, 'name': 'Subventions viticoles', 'item': url}]}
    e = html.escape
    head = f'''<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(TITLE)} | Mon Chai</title><meta name="description" content="{e(DESCRIPTION)}">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Mon Chai"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{e(TITLE)}"><meta property="og:description" content="{e(DESCRIPTION)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="https://monchai.fr/assets/img/editorial/aides-viticoles-photo-2026.jpg"><meta property="og:image:alt" content="Illustration générée : dossier de financement devant un vignoble">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(TITLE)}"><meta name="twitter:description" content="{e(DESCRIPTION)}"><meta name="twitter:image" content="https://monchai.fr/assets/img/editorial/aides-viticoles-photo-2026.jpg">
<link rel="icon" type="image/png" href="assets/img/logo_mon_chai.png"><meta name="theme-color" content="#7B1E22">
<link rel="stylesheet" href="assets/css/polices.css"><link rel="stylesheet" href="assets/css/header.css"><link rel="stylesheet" href="assets/css/actus.css"><link rel="stylesheet" href="assets/css/footer-commun.css?v=20261028-footer"><link rel="stylesheet" href="assets/css/subventions.css?v=20261121">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(breadcrumb, ensure_ascii=False)}</script>
<script src="assets/js/analytics.js?v=20261124-gtm" defer></script>
</head>'''
    (root / SLUG).write_text(head + body_header + body + footer + scripts + '</body></html>\n', encoding='utf-8', newline='\n')
    sitemap = (root / 'sitemap.xml').read_text(encoding='utf-8')
    if f'<loc>{url}</loc>' not in sitemap:
        sitemap = sitemap.replace('</urlset>', f'<url><loc>{url}</loc><lastmod>{PUBLISHED}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>')
        (root / 'sitemap.xml').write_text(sitemap, encoding='utf-8', newline='\n')
    # Porte d'entrée durable dans les guides, sans remplacer celle du moteur.
    resources_path = root / 'ressources.html'
    resources = resources_path.read_text(encoding='utf-8')
    if 'id="presentation-subventions"' not in resources:
        card = '<section class="serie-carte" id="presentation-subventions"><p class="actu-date">Comprendre les financements</p><h2><a href="subventions-viticulture.html">Subventions viticoles : notre démarche pour votre domaine</a></h2><p>Découvrez comment Mon Chai réunit les pistes de financement, comment utiliser le moteur de subventions et quelles données préparer pour vos échanges avec le financeur.</p></section>\n'
        resources, count = re.subn(r'(?=<section\b[^>]*id="dossier-aides")', lambda m: card, resources, count=1)
        assert count == 1, 'Porte d’entrée du dossier introuvable dans les ressources.'
    def update_collection(match):
        data = json.loads(match[1])
        if data.get('@type') != 'CollectionPage':
            return match[0]
        items = data.setdefault('mainEntity', {'@type': 'ItemList', 'itemListElement': []}).setdefault('itemListElement', [])
        item = next((item for item in items if item.get('url') == url), None)
        if item is None:
            items.insert(0, {'@type': 'ListItem', 'position': 1, 'name': TITLE, 'url': url})
        else:
            item['name'] = TITLE
        for i, item in enumerate(items):
            item['position'] = i + 1
        data['dateModified'] = PUBLISHED
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
    resources = re.sub(r'<script type="application/ld\+json">(.*?)</script>', update_collection, resources, flags=re.S)
    resources_path.write_text(resources, encoding='utf-8', newline='\n')
    sitemap = (root / 'sitemap.xml').read_text(encoding='utf-8')
    sitemap = re.sub(r'(<url>\s*<loc>https://monchai.fr/ressources\.html</loc>.*?<lastmod>)[^<]+(</lastmod>)', lambda m: m[1] + PUBLISHED + m[2], sitemap, flags=re.S)
    (root / 'sitemap.xml').write_text(sitemap, encoding='utf-8', newline='\n')
    print(f'Présentation générée : {SLUG} ; URL du moteur conservée.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path)
    generate(parser.parse_args().site.resolve())
