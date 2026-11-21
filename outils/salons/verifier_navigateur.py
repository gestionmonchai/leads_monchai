"""Recette du moteur de salons et des guides, sans envoi de formulaire ni tiers."""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import threading
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--sortie',type=Path,required=True)
OUT=parser.parse_args().sortie.resolve()
OUT.mkdir(parents=True,exist_ok=True)
report={'controles':[],'rendus':[],'erreurs_js':[]}

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
    def copyfile(self,source,output):
        try: super().copyfile(source,output)
        except (ConnectionAbortedError,ConnectionResetError,BrokenPipeError): pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}'

try:
    articles=json.loads((ROOT/'outils/salons/articles.json').read_text(encoding='utf-8'))
    urls=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
    for slug in ['salons-viticoles']+[a['slug'] for a in articles]:
        source=(ROOT/(slug+'.html')).read_text(encoding='utf-8')
        url=f'https://monchai.fr/{slug}.html'
        assert f'<link rel="canonical" href="{url}">' in source
        assert urls.count(url)==1
        assert not re.search(r'http-equiv=["\']refresh',source,re.I)
    report['controles'].append('six canoniques propres et entrées uniques au sitemap, sans redirection')
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        def new(path='salons-viticoles.html',width=1440,height=1000,js=True,future=False):
            ctx=browser.new_context(viewport={'width':width,'height':height},java_script_enabled=js,reduced_motion='reduce',timezone_id='Europe/Paris')
            ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.abort())
            ctx.add_init_script("localStorage.setItem('monchai_cookie_consent',JSON.stringify({audience:false,tiers:false,ts:Date.now(),version:'2026-10-29-ga4'}));")
            p=ctx.new_page()
            p.on('pageerror',lambda err:report['erreurs_js'].append(str(err)))
            if js:
                if future: p.clock.install(time=datetime(2028 if future==2028 else 2027,3,1,12,tzinfo=timezone.utc))
                else: p.clock.install(time=datetime(2026,11,22,12,tzinfo=timezone.utc))
            p.goto(BASE+'/'+path,wait_until='load')
            if js: p.clock.pause_at(datetime.fromtimestamp((p.evaluate('Date.now()')+1000)/1000,tz=timezone.utc))
            return ctx,p
        def cards(p): return p.locator('[data-salon]:visible')
        def goal(p,value): p.locator(f'.sl-goals input[value="{value}"]').locator('..').click()
        def reset(p): p.locator('#form-salons [type=reset]').click()
        def no_overflow(p): assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')

        ctx,p=new()
        assert cards(p).count()==14
        for value,count in [('particuliers',9),('pros',2),('equipement',3)]:
            goal(p,value)
            assert cards(p).count()==count
            assert cards(p).evaluate_all('(xs,v)=>xs.every(x=>x.dataset.objectif===v)',value)
        reset(p)
        p.locator('#q-salons').fill('salons du vin Bordeaux')
        assert cards(p).count()==2
        p.locator('#q-salons').fill('epernay')
        assert cards(p).count()==1
        reset(p)
        p.locator('#region-salons').select_option('occ')
        assert cards(p).count()==2
        p.locator('#periode-salons').select_option('2027-t1')
        assert cards(p).count()==1
        assert p.locator('#salon-millesime-bio-2027').is_visible()
        p.get_by_role('button',name='Retirer le critère : Occitanie',exact=True).click()
        assert p.locator('#region-salons').input_value()==''
        p.locator('#form-salons [type=submit]').click()
        assert p.locator('#titre-resultats-salons').evaluate('(el)=>el===document.activeElement')
        reset(p)
        p.locator('#periode-salons').select_option('incertain')
        assert cards(p).count()==6
        assert p.locator('#salon-sitevi-2027').inner_text().count('jours à confirmer')>=1
        assert p.locator('[data-statut=a_reconfirmer]').count()==5
        p.locator('#q-salons').fill('<img src=x onerror=alert(1)>')
        assert p.locator('#salons-vide').is_visible()
        assert not p.locator('#criteres-salons img').count()
        p.get_by_role('button',name='Effacer les critères',exact=True).click()
        assert cards(p).count()==14
        p.locator('#salon-millesime-bio-2027 summary').click()
        assert p.locator('#salon-millesime-bio-2027 details[open]').count()==1
        assert 'conversion' in p.locator('#salon-millesime-bio-2027 details').inner_text()
        assert p.locator('#salon-millesime-bio-2027 .sl-official').get_attribute('href').startswith('https://www.millesime-bio.com/')
        assert p.evaluate("!(window.dataLayer||[]).some(x=>x.event==='salons_recherche')")
        ctx.close()
        report['controles'].append('14 éditions, 3 objectifs, région/période combinées, accents, critères supprimables, zéro/reset, saisie sûre, admission et sources')

        ctx,p=new(future=True)
        assert cards(p).count()==8
        assert not p.locator('#salon-vinitech-sifel-2026').is_visible()
        p.locator('#archives-salons').check()
        assert cards(p).count()==14
        reset(p)
        p.goto(BASE+'/salons-viticoles.html#salon-vinitech-sifel-2026',wait_until='load')
        assert p.locator('#salon-vinitech-sifel-2026').is_visible()
        assert p.locator('#salon-vinitech-sifel-2026 .sl-past').is_visible()
        assert p.locator('#archives-salons').is_checked()
        ctx.close()
        report['controles'].append('horloge navigateur au 1er mars 2027 : 6 éditions archivées, option et lien direct récupérables')
        ctx,p=new(future=2028)
        assert cards(p).count()==0
        assert p.locator('#salons-vide').is_visible()
        p.get_by_role('button',name='Inclure les éditions passées',exact=True).click()
        assert cards(p).count()==14
        assert p.locator('#salon-sitevi-2027 .sl-past').is_visible()
        ctx.close()
        report['controles'].append('en 2028, une édition sans jours mais avec année passée est aussi archivée')

        for width,height in [(320,568),(390,844),(768,1024),(1440,1000),(844,390)]:
            ctx,p=new(width=width,height=height)
            p.locator('.sl-hero .sv-button').click()
            no_overflow(p)
            p.screenshot(path=str(OUT/f'moteur-{width}.png'),animations='disabled')
            if width==1440: p.screenshot(path=str(OUT/'moteur-complet-1440.png'),full_page=True,animations='disabled')
            # Accès Ressources, au clavier, puis filtre par objectif.
            if p.locator('.hd__burger').is_visible(): p.locator('.hd__burger').click()
            button=p.locator('[aria-controls="sous-menu-ressources"]')
            button.focus()
            button.press('ArrowDown')
            p.clock.run_for(300)
            assert p.locator('#sous-menu-ressources a[href="salons-viticoles.html"]').is_visible()
            p.keyboard.press('Escape')
            goal(p,'pros')
            p.locator('#form-salons [type=submit]').click()
            no_overflow(p)
            p.screenshot(path=str(OUT/f'resultats-{width}.png'),animations='disabled')
            p.locator('#q-salons').fill('aucunzzsalon')
            p.locator('#form-salons [type=submit]').click()
            no_overflow(p)
            if width==390: p.screenshot(path=str(OUT/'vide-390.png'),animations='disabled')
            report['rendus'].append({'page':'moteur','width':width,'height':height})
            ctx.close()

        for index,a in enumerate(articles):
            for width in [390,1440]:
                ctx,p=new(a['slug']+'.html',width,900)
                assert p.locator('main h1').count()==1
                assert p.locator('.sl-toc a').count()>=4
                link=p.locator('.sl-toc a').first
                link.focus();p.keyboard.press('Enter')
                assert p.url.endswith(link.get_attribute('href'))
                no_overflow(p)
                if index in [0,2]:
                    p.evaluate('scrollTo(0,0)')
                    p.screenshot(path=str(OUT/f'{a["slug"]}-{width}.png'),animations='disabled')
                p.locator('.sl-article-next .sv-button').click()
                p.wait_for_url('**/salons-viticoles.html#recherche-salons')
                assert p.locator('#form-salons').is_visible()
                report['rendus'].append({'page':a['slug'],'width':width})
                ctx.close()
        report['controles'].append('5 formats, menu clavier, vide et 5 guides sur mobile/ordinateur, liens réels vers le moteur, sans débordement')

        ctx,p=new(js=False)
        assert cards(p).count()==14
        assert not p.locator('#recherche-salons').is_visible()
        p.locator('#salon-vi-paris-2026 summary').click()
        assert p.locator('#salon-vi-paris-2026 .sl-date-note').is_visible()
        ctx.close()
        ctx,p=new('budget-salon-vin.html',js=False)
        assert p.locator('.sl-table table').is_visible()
        assert p.locator('.sl-toc a').count()>=4
        ctx.close()
        assert not report['erreurs_js'],report['erreurs_js']
        browser.close()
        report['controles'].append('moteur et guide lisibles sans JS, détail natif, aucune erreur JavaScript')
finally:
    server.shutdown()
    (OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
