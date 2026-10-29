"""Aligne les métadonnées du lot sur le texte final, sans appel réseau."""
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

ROOT=Path(sys.argv[1]).resolve()
names={'declaration-recolte-2026.html','drm-vin-guide.html','dae-daes-gamma2-vin.html','dja-installation-vigneron.html','ift-viticulture-calcul.html','cahier-de-culture-vigne.html','paquet-vin-europeen-2027.html','registre-phyto-numerique-2027.html','aides-vignerons.html'}
names.update(p.name for p in ROOT.glob('aide-*.html'))
names.update(p.name for p in ROOT.glob('declaration-recolte-*.html'))
changed=set()
for path in [*ROOT.glob('*.html'),*(p for lang in ['en','de','it','zh'] for p in (ROOT/lang).glob('*.html'))]:
    if path.name not in names:continue
    # Les guides nouvellement enrichis sont français ; seules les corrections
    # explicitement reportées sur les traductions portent cette nouvelle date.
    if path.parent!=ROOT and path.name not in {'paquet-vin-europeen-2027.html','registre-phyto-numerique-2027.html'}:continue
    s=path.read_text(encoding='utf-8')
    soup=BeautifulSoup(s,'html.parser')
    words=len(soup.select_one('main').get_text(' ',strip=True).split())
    def update(m):
        d=json.loads(m[1])
        if d.get('@type')=='Article':
            d['dateModified']='2026-10-29'
            if 'wordCount' in d:d['wordCount']=words
        return '<script type="application/ld+json">'+json.dumps(d,ensure_ascii=False).replace('</','< /')+'</script>'
    s=re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>',update,s)
    if path.name=='dja-installation-vigneron.html' and 'Mis à jour le 29 octobre 2026' not in s:
        s=re.sub(r'(<span class="actu-date">[\s\S]*?)(</span>)',r'\1 · Mis à jour le 29 octobre 2026\2',s,count=1)
    path.write_text(s,encoding='utf-8',newline='\n')
    changed.add(path.relative_to(ROOT).as_posix())
path=ROOT/'sitemap.xml'
s=path.read_text(encoding='utf-8')
def url(m):
    block=m[0]
    if any('<loc>https://monchai.fr/'+name+'</loc>' in block for name in changed):
        if '<lastmod>' in block:block=re.sub(r'<lastmod>[^<]*</lastmod>','<lastmod>2026-10-29</lastmod>',block)
        else:block=block.replace('</url>','<lastmod>2026-10-29</lastmod></url>')
    return block
s=re.sub(r'<url>[\s\S]*?</url>',url,s)
ET.fromstring(s)
path.write_text(s,encoding='utf-8',newline='\n')
print(f'Métadonnées et sitemap alignés sur {len(changed)} pages du lot.')
