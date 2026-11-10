"""Génère la navigation statique depuis un composant par langue.

python outils/header/generer.py . [--check]
Les liens restent disponibles sans JavaScript. --check interdit les dérives.
"""
import argparse
from pathlib import Path
import re

LANGUES = ('fr', 'en', 'de', 'it', 'zh')
HEADER = re.compile(r'<header\b[^>]*class="hd"[^>]*>.*?</header>', re.S)


def rendre(root, page, source):
    langue = page.parent.name if page.parent != root else 'fr'
    template = (root / 'outils/header' / f'{langue}.html').read_text(encoding='utf-8')
    ancien = HEADER.search(source)
    if not ancien:
        raise ValueError(f'{page}: header absent')
    # La rubrique active est une propriété de la page, pas du composant.
    actif = re.search(r'<button\b(?=[^>]*class="[^"]*est-actif)[^>]*aria-controls="([^"]+)"', ancien[0])
    if not actif:
        actif = re.search(r'<button\b(?=[^>]*aria-controls="([^"]+)")(?=[^>]*class="[^"]*est-actif)[^>]*>', ancien[0])
    template = re.sub(r'\s+aria-current="page"', '', template)
    template = template.replace(' est-actif', '')
    if actif:
        ident = actif[1]
        template = re.sub(r'<button\b[^>]*>', lambda m: m[0].replace('hd__declencheur', 'hd__declencheur est-actif') if f'aria-controls="{ident}"' in m[0] else m[0], template)
    prefixe = '' if langue == 'fr' else '../'
    # Le sélecteur conduit à la traduction de la page quand elle existe.
    def langue_lien(m):
        tag = m[0]
        code = re.search(r'\blang="([^"]+)"', tag)[1]
        code = 'zh' if code == 'zh-Hans' else code
        dossier = root if code == 'fr' else root / code
        nom = page.name if (dossier / page.name).exists() else 'index.html'
        cible = prefixe + ('' if code == 'fr' else code + '/') + nom
        tag = re.sub(r'href="[^"]*"', f'href="{cible}"', tag)
        if code == langue:
            tag = tag[:-1] + ' aria-current="page">'
        return tag
    template = re.sub(r'<a\b(?=[^>]*\blang=")[^>]*>', langue_lien, template)
    def courant(m):
        tag = m[0]
        href = re.search(r'href="([^"]*)"', tag)
        if href and href[1] == page.name and 'lang=' not in tag:
            tag = tag[:-1] + ' aria-current="page">'
        return tag
    return re.sub(r'<a\b[^>]*>', courant, template).strip()


def generer(root, check=False):
    changements = []
    pages = [*root.glob('*.html'), *(p for langue in LANGUES[1:] for p in (root / langue).glob('*.html'))]
    for page in sorted(pages):
        source = page.read_text(encoding='utf-8-sig')
        ancien = HEADER.search(source)
        nouveau = rendre(root, page, source)
        # Les anciennes scènes 1920 réservent déjà leur bande de navigation.
        # Sortir le vrai header de la scène évite transform/overflow du parent.
        avant = source[:ancien.start()]
        if not re.search(r'<div\b[^>]*class="site-header[^"\n]*"[^>]*>\s*$', avant):
            source = source[:ancien.start()] + '<div class="header-reserve-scene" aria-hidden="true"></div>' + source[ancien.end():]
            source = re.sub(r'(<body\b[^>]*>)', lambda m: m[0] + '\n<div class="site-header" id="siteHeader">\n' + nouveau + '\n</div>', source, count=1)
        else:
            source = source[:ancien.start()] + nouveau + source[ancien.end():]
            # Une enveloppe fixe conserve sa place dans les pages en flux.
            fin = source.index('</header>') + len('</header>')
            fermeture = re.match(r'\s*</div>', source[fin:])
            position = fin + fermeture.end()
            if 'header-reserve-scene' not in source and not re.match(r'\s*<div class="header-reserve', source[position:]):
                mod = ' header-reserve--page' if 'site-header--page' in avant else ''
                source = source[:position] + f'\n<div class="header-reserve{mod}" aria-hidden="true"></div>' + source[position:]
        if source != page.read_text(encoding='utf-8-sig'):
            changements.append(page.relative_to(root).as_posix())
            if not check:
                page.write_text(source, encoding='utf-8', newline='\n')
    print(f'Header commun : {len(pages)} pages, {len(changements)} différence(s).')
    if check and changements:
        print('\n'.join(changements))
        raise SystemExit(1)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    generer(args.site.resolve(), args.check)
