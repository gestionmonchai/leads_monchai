"""Raccorde les pages publiques à la mesure derrière le consentement Mon Chai."""

import re
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()
version = '20261124-gtm'
pages = [*root.glob('*.html')]
for langue in ('en', 'de', 'it', 'zh', 'developpeurs'):
    pages.extend((root / langue).glob('*.html'))

for page in pages:
    source = page.read_text(encoding='utf-8-sig')
    relative = '../' if page.parent != root else ''
    original = source
    for fichier, emplacement in [('assets/js/analytics.js', '</head>'), ('consent.js', '</body>')]:
        expression = re.compile(r'<script\b[^>]*\bsrc="(?:\.\./)?' + re.escape(fichier) +
                                r'(?:\?[^"]*)?"[^>]*>\s*</script>')
        balise = f'<script src="{relative}{fichier}?v={version}" defer></script>'
        occurrences = list(expression.finditer(source))
        if len(occurrences) > 1:
            raise ValueError(f'{page}: {fichier} est déclaré plusieurs fois')
        if occurrences:
            actuelle = occurrences[0][0]
            maj = re.sub(r'\bsrc="[^"]+"', f'src="{relative}{fichier}?v={version}"', actuelle, count=1)
            maj = re.sub(r'\s+data-gtm(?=\s|>)', '', maj, count=1)
            source = source.replace(actuelle, maj, 1)
        elif emplacement in source:
            source = source.replace(emplacement, balise + '\n' + emplacement, 1)
        else:
            raise ValueError(f'{page}: {emplacement} manquant')
    if 'googletagmanager.com' in source or 'google-analytics.com' in source:
        raise ValueError(f'{page}: retirer le chargement Google direct avant publication')
    if source != original:
        page.write_text(source, encoding='utf-8', newline='\n')

print(f'{len(pages)} pages raccordées à la mesure avec consentement.')
