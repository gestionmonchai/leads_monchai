"""Régénère les trois guides et les 23 fiches à partir des sources éditoriales.

Usage : python outils/editorial/generer-guides.py CHEMIN_SITE
Ne réalise aucun appel réseau. Les sources métier sont datées séparément.
"""
import html
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(sys.argv[1]).resolve()
HERE = Path(__file__).resolve().parent
DATE = '2026-10-29'
ORIGIN = 'https://monchai.fr/'
VENDANGES = 'https://www.douane.gouv.fr/service-en-ligne/declarations-de-recolteproduction-vendanges'
MANUEL = 'https://www.douane.gouv.fr/sites/default/files/2026-09/25/Manuel%20utilisateur%20VENDANGES%20r%C3%A9colte.pdf'
EXPORT = 'https://www.douane.gouv.fr/demarche/sassurer-de-la-sortie-effective-des-marchandises-du-territoire-douanier-de-lunion-une'
VAD = 'https://www.douane.gouv.fr/demarche/declarer-vos-ventes-en-ligne-dalcool-ou-boissons-alcooliques-vente-distance-vad'
entries = json.loads((ROOT / 'outils/recolte/interprofessions.json').read_text(encoding='utf-8'))['entries']
profiles = json.loads((ROOT / 'outils/recolte/parcours.json').read_text(encoding='utf-8'))['fiches']
assert len(entries) == len(profiles) == 23
assert {entry['id'] for entry in entries} == set(profiles)


def esc(value):
    return html.escape(str(value), quote=True)


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8', newline='\n')


def update_meta(source, title, description, slug, new=False, breadcrumb=None):
    source = re.sub(r'<title>.*?</title>', '<title>' + esc(title) + ' | Mon Chai</title>', source, count=1, flags=re.S)
    def meta(match):
        tag = match[0]
        key = re.search(r'(?:name|property)="([^"]+)"', tag)
        value = {'description': description, 'og:description': description,
                 'og:title': title, 'og:url': ORIGIN + slug,
                 'og:image': ORIGIN + 'assets/img/pages/vigne-vendanges.jpg'}.get(key[1] if key else '')
        return re.sub(r'content="[^"]*"', lambda _: 'content="' + esc(value) + '"', tag) if value is not None else tag
    source = re.sub(r'<meta\b[^>]*>', meta, source)
    source = re.sub(r'(<link\b[^>]*rel="canonical"[^>]*href=")[^"]+', lambda m: m[1] + ORIGIN + slug, source)
    def schema(match):
        data = json.loads(match[1])
        if data.get('@type') == 'Article':
            data.update(headline=title, description=description, dateModified=DATE,
                        mainEntityOfPage=ORIGIN + slug, image=ORIGIN + 'assets/img/pages/vigne-vendanges.jpg')
            if new:
                data['datePublished'] = DATE
            data['author'] = {'@type': 'Organization', 'name': 'Mon Chai', 'url': ORIGIN + 'index.html#apropos'}
        elif data.get('@type') == 'BreadcrumbList':
            if breadcrumb is not None:
                data['itemListElement'] = [{'@type': 'ListItem', 'position': i + 1, 'name': name, 'item': ORIGIN + url}
                                           for i, (name, url) in enumerate(breadcrumb)]
            else:
                data['itemListElement'][-1]['name'] = title
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace('</', '< /') + '</script>'
    source = re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>', schema, source)
    if 'assets/css/guides-reglementaires.css' not in source:
        source = source.replace('</head>', '<link rel="stylesheet" href="assets/css/guides-reglementaires.css?v=20261029">\n</head>', 1)
    return source


def replace_main(source, body):
    result, n = re.subn(r'<main\b[^>]*>[\s\S]*?</main>', lambda _: '<main class="article article-couts" id="contenu" tabindex="-1">\n' + body + '\n</main>', source, count=1)
    assert n == 1
    return result


template = read('declaration-recolte-2026.html')
cards = []
for entry in entries:
    p = profiles[entry['id']]
    slug = p['slug']
    title = f'Déclaration de récolte {p["territoire"]} : circuit et consignes 2026'
    description = f'Récolte 2026 — {p["territoire"]} : portail compétent, calendrier confirmé ou à vérifier, préparation et sources pour votre déclaration.'
    sources = list(entry['sources'])
    if not any(s['url'] == VENDANGES for s in sources):
        sources.append({'url': VENDANGES, 'label': 'Douane : circuits, échéances et accès VENDANGES'})
    links = ''.join(f'<li><a href="{esc(s["url"])}">{esc(s["label"])}</a></li>' for s in sources)
    body = f'''<p class="article__ariane"><a href="index.html">Accueil</a> › <a href="actualites-douane-declarations.html">Douane &amp; déclarations</a> › <a href="declaration-recolte-2026.html">Guide Récolte 2026</a> › {esc(p['territoire'])}</p>
<div class="article__meta"><a class="actu-tag" href="actualites-douane-declarations.html">Douane &amp; déclarations</a><span class="actu-date">Par <a href="index.html#apropos">Mon Chai</a> · Publié le 29 octobre 2026 · Références relues le 29 octobre 2026</span></div>
<h1>Déclaration de récolte 2026 : {esc(p['territoire'])}</h1>
<p class="article__chapo">Votre repère pour identifier le circuit de récolte et les démarches à distinguer avec {esc(p['organisme'])}. La fiche sépare les informations confirmées des consignes à demander dans votre espace professionnel.</p>
<aside class="reg-fiche-repere" aria-label="Circuit et niveau de vérification"><p><strong>Circuit :</strong> {esc(p['circuit'])}</p><p><strong>Calendrier :</strong> {esc(p['calendrier'])}</p><p><strong>Niveau de vérification :</strong> {esc(entry['source_label'])}. {esc(entry['source_detail'])}</p></aside>
<nav class="recolte-sommaire" aria-label="Sommaire de la fiche"><a href="#circuit">Circuit et consignes</a><a href="#preparer">Préparer la démarche</a><a href="#verification">Contrôler le dépôt</a><a href="#questions">Questions à confirmer</a><a href="#sources">Sources</a></nav>
<section aria-labelledby="circuit"><h2 id="circuit">Quel circuit de récolte pour {esc(p['territoire'])} ?</h2>{entry['html']}<p class="reg-source">Les références territoriales et nationales sont détaillées dans les <a href="#sources">sources de cette fiche</a>. Le nom d’une interprofession identifie un interlocuteur ; il ne remplace pas la notice du téléservice.</p></section>
<section aria-labelledby="preparer"><h2 id="preparer">Préparer votre dossier avec les bonnes consignes</h2><p>Ces points de préparation sont proposés par Mon Chai à partir des distinctions documentées ci-dessus. Ils ne constituent pas une liste administrative exhaustive.</p><ol class="reg-etapes">'''
    body += ''.join('<li>' + esc(text) + '</li>' for text in p['preparation'])
    body += f'''</ol><p>Le <a href="declaration-recolte-2026.html#etapes-recolte">guide central détaille les étapes de saisie, contrôle et dépôt dans VENDANGES</a> pour les déclarants de ce circuit. Sur un autre portail, suivez sa propre notice. La <a href="declaration-recolte-2026.html#checklist-recolte">checklist de préparation</a> aide à classer les pièces.</p></section>
<section aria-labelledby="verification"><h2 id="verification">Après la préparation, vérifier quelle démarche a été déposée</h2><p>Distinguez récolte, revendication et <a href="drm-vin-guide.html">déclaration récapitulative mensuelle</a>. Les mêmes quantités peuvent servir au rapprochement, mais la validation d’une formalité ne prouve pas le dépôt d’une autre. Conservez la confirmation propre au portail utilisé et vérifiez l’exploitation et la campagne concernées.</p><p>Dans VENDANGES, un brouillon ne vaut pas dépôt ; la modification d’un dépôt doit elle aussi être déposée. Le maintien technique jusqu’au 31 juillet suivant la récolte ne prolonge pas le délai réglementaire. Ces modalités sont celles de VENDANGES ; pour votre autre circuit éventuel, demandez ses propres règles de correction. <a href="{MANUEL}">Manuel officiel VENDANGES (PDF)</a>.</p></section>
<section aria-labelledby="questions"><h2 id="questions">Les questions à confirmer pour {esc(p['territoire'])}</h2><ul>'''
    body += ''.join('<li>' + esc(text) + '</li>' for text in p['questions'])
    body += f'''</ul><p>Si un calendrier local 2026 n’est pas confirmé dans cette fiche, ne le déduisez ni de la date nationale ni d’un guide d’une campagne passée. Un accès réservé peut demander vos identifiants professionnels ; cette page publique ne reçoit aucune déclaration.</p></section>
<section class="article__sources" aria-labelledby="sources"><h2 id="sources">Sources, dates et limites de vérification</h2><p>Références relues le 29 octobre 2026. Les liens institutionnels servent à identifier l’organisme et ses accès ; seuls les documents de campagne cités étayent un calendrier local. Une page de connexion ne prouve pas le contenu d’une consigne réservée.</p><ul>{links}</ul><p>Les étapes de classement et les questions de préparation sont celles de Mon Chai. La notice actuelle, les consignes de l’organisme compétent et la qualité de votre déclaration déterminent la démarche à accomplir.</p></section>
<section class="article__suite"><h2>Retrouver le guide et les fiches liées</h2><ul><li><a href="declaration-recolte-2026.html#interprofessions">Les 23 fiches et le guide Récolte 2026</a></li>'''
    body += ''.join(f'<li><a href="{esc(profiles[neighbor]["slug"])}">{esc(profiles[neighbor]["territoire"])} : circuit distinct à comparer selon vos productions</a></li>' for neighbor in p['voisins'])
    body += '</ul></section>'
    page = template.replace('href="declaration-recolte-2026.html" aria-current="page"', 'href="' + slug + '" aria-current="page"')
    page = replace_main(page, body)
    page = update_meta(page, title, description, slug, new=True, breadcrumb=[('Accueil', 'index.html'), ('Douane & déclarations', 'actualites-douane-declarations.html'), ('Guide Récolte 2026', 'declaration-recolte-2026.html'), (p['territoire'], slug)])
    write(slug, page)
    cards.append(f'''<article class="reg-carte" aria-labelledby="recolte-{esc(entry['id'])}"><h3 id="recolte-{esc(entry['id'])}" tabindex="-1"><a href="{esc(slug)}">{esc(entry['label'])}</a></h3><p>{esc(p['circuit'])}</p><p><strong>Calendrier :</strong> {esc(p['calendrier'])}</p><a href="{esc(slug)}">Consulter la fiche {esc(p['territoire'])} →</a></article>''')

def existing_section(label):
    match = re.search(r'<section\b[^>]*aria-labelledby="' + label + r'"[^>]*>[\s\S]*?</section>', template)
    assert match, label
    return match[0]


interpros = '<section aria-labelledby="interprofessions"><h2 id="interprofessions">Trouver votre interprofession : les 23 fiches de récolte</h2><p>Chaque fiche possède sa propre adresse et décrit son circuit, ses sources et les informations encore à confirmer. Le choix se fait selon vos produits et votre qualité de déclarant, pas seulement selon le département du domaine. Annuaire de référence : <a href="https://www.intervin.fr/interprofessions/interprofessions-vinicoles">CNIV, interprofessions vinicoles</a>.</p><div class="reg-cartes">' + ''.join(cards) + '</div></section>'
cta = re.search(r'<div class="article-cta">[\s\S]*?</div>\s*</div>', template)
assert cta
harvest = (HERE / 'recolte-procedure.html').read_text(encoding='utf-8')
for marker, replacement in {'{{INTERPROFESSIONS}}': interpros, '{{CHECKLIST}}': existing_section('checklist-recolte'), '{{EXEMPLE}}': existing_section('exemple-monchai'), '{{CTA}}': cta[0]}.items():
    harvest = harvest.replace(marker, replacement)
guide = update_meta(replace_main(template, harvest), 'Déclaration de récolte 2026 : dates et démarches', 'Récolte 2026 : identifier votre circuit, préparer les données, contrôler et déposer. 23 fiches d’interprofessions, checklist et sources officielles.', 'declaration-recolte-2026.html')
write('declaration-recolte-2026.html', guide)
for slug, fragment, title, description in [
    ('drm-vin-guide.html', 'drm-corps.html', 'DRM vin : déclaration récapitulative mensuelle, étapes et dépôt', 'DRM du vin : qui déclare, quand, sur quel portail et avec quelles données ? Étapes de contrôle, dépôt, confirmation et correction, avec sources douanières.'),
    ('dae-daes-gamma2-vin.html', 'circulation-corps.html', 'DAE, DAES, DSA et GAMMA 2 : quel document pour le vin ?', 'Vin : choisir le parcours de circulation selon destination, destinataire et droits. DAE, DAES, DSA, limites des CRD et vente à distance, avec sources officielles.'),
]:
    body = (HERE / fragment).read_text(encoding='utf-8').replace('{{SOURCE_EXPORT}}', EXPORT).replace('{{SOURCE_VAD}}', VAD)
    write(slug, update_meta(replace_main(read(slug), body), title, description, slug))

# Insérer et dater uniquement les URL effectivement réécrites.
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
sitemap = read('sitemap.xml')
parsed = ET.fromstring(sitemap)
slugs = [p['slug'] for p in profiles.values()] + ['declaration-recolte-2026.html', 'drm-vin-guide.html', 'dae-daes-gamma2-vin.html']
for slug in slugs:
    loc = ORIGIN + slug
    escaped = re.escape(loc)
    pattern = r'(<url>\s*<loc>' + escaped + r'</loc>[\s\S]*?<lastmod>)[^<]+(</lastmod>)'
    if re.search(pattern, sitemap):
        sitemap = re.sub(pattern, lambda m: m[1] + DATE + m[2], sitemap, count=1)
    elif any(el.findtext('{'+NS+'}loc') == loc for el in parsed):
        sitemap = sitemap.replace('<loc>' + loc + '</loc>', '<loc>' + loc + '</loc><lastmod>' + DATE + '</lastmod>', 1)
    else:
        sitemap = sitemap.replace('</urlset>', '<url><loc>' + loc + '</loc><lastmod>' + DATE + '</lastmod></url>\n</urlset>')
write('sitemap.xml', sitemap)
print('Guides actualisés ; 23 fiches de récolte et leurs entrées sitemap générées.')
