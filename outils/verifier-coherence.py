"""Inventaire reproductible du site public (aucun accès réseau, aucune mutation).

Usage: python scripts/audit_coherence_site.py CHEMIN_SITE --output rapport.json
Ne parcourt que les pages publiées : racine et quatre répertoires de langues.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


def audit(root):
    root = root.resolve()
    files = sorted([*root.glob('*.html'), *(p for lang in ('en', 'de', 'it', 'zh')
                                          for p in (root / lang).glob('*.html'))])
    parsed = {p: Page(p.read_text(encoding='utf-8-sig')) for p in files}
    ids = {p: {a['id'] for _, a in page.tags if a.get('id')} for p, page in parsed.items()}
    pages, issues = [], []
    for path, page in parsed.items():
        name = path.relative_to(root).as_posix()
        footers = [a.get('class', '') for t, a in page.tags if t == 'footer']
        scripts = [a['src'] for t, a in page.tags if t == 'script' and a.get('src')]
        privacy = any('politique-confidentialite.html' in a.get('href', '') for _, a in page.tags)
        cookies = any('data-cookies' in a for _, a in page.tags)
        h1 = sum(t == 'h1' for t, _ in page.tags)
        counts = Counter(a['id'] for _, a in page.tags if a.get('id'))
        for code, condition in [('footer_absent', not footers), ('confidentialite_absente', not privacy),
                                ('cookies_inaccessibles', not cookies), ('h1_non_unique', h1 != 1)]:
            if condition:
                issues.append(dict(page=name, code=code))
        for ident, n in counts.items():
            if n > 1:
                issues.append(dict(page=name, code='id_duplique', cible=ident, nombre=n))
        for tag, attrs in page.tags:
            # Les liens hreflang/canonical absolus ne sont pas des fichiers locaux.
            ref = attrs.get('href') if tag in ('a', 'link') else attrs.get('src')
            if not ref:
                continue
            u = urlsplit(ref)
            if u.scheme or u.netloc or ref.startswith(('data:', 'javascript:')):
                continue
            target = (root / unquote(u.path).lstrip('/') if u.path.startswith('/')
                      else path.parent / unquote(u.path)).resolve() if u.path else path
            if target.is_dir():
                target /= 'index.html'
            if not target.is_relative_to(root):
                issues.append(dict(page=name, code='lien_hors_site', cible=ref))
            elif not target.exists():
                issues.append(dict(page=name, code='ressource_absente', cible=ref))
            elif u.fragment and target in ids and unquote(u.fragment) not in ids[target]:
                issues.append(dict(page=name, code='ancre_absente', cible=ref))
        pages.append(dict(page=name, footers=footers, scripts=scripts, confidentialite=privacy,
                          cookies=cookies, h1=h1))
    return dict(pages_analysees=len(pages), langues=dict(Counter(
        p['page'].split('/')[0] if '/' in p['page'] else 'fr' for p in pages)),
        totaux=dict(Counter(i['code'] for i in issues)), anomalies=issues, pages=pages)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--strict', action='store_true', help='Échoue si une anomalie est détectée.')
    args = parser.parse_args()
    report = audit(args.site)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in ('pages_analysees', 'langues', 'totaux')}, ensure_ascii=False))
    if args.strict:
        commun = all(p['footers'] == ['mc-site-footer'] for p in report['pages'])
        if not commun:
            print('Le footer commun doit figurer exactement une fois sur chaque page.')
        references, divergences = {}, []
        for page in report['pages']:
            name = page['page']
            langue = name.split('/')[0] if '/' in name else 'fr'
            source = (args.site / name).read_text(encoding='utf-8-sig')
            footer = re.search(r'<footer\b[^>]*>.*?</footer>', source, flags=re.S)
            if footer:
                normalized = re.sub(r'\s+', ' ', footer[0]).strip()
                expected = references.setdefault(langue, normalized)
                if normalized != expected:
                    divergences.append(name)
        if divergences:
            print('Footers différents dans une même langue : ' + ', '.join(divergences))
        sys.exit(1 if report['anomalies'] or not commun or divergences else 0)
