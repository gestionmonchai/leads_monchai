"""Recette du moteur de salons et des guides, sans envoi de formulaire ni tiers."""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from generer import load_events
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
    events=load_events(ROOT)['evenements']
    total=len(events)
    local_total=sum(bool(a.get('local')) for a in events)
    def active_at(a,day):
        return a['fin']>=day if a['fin'] else a['edition']>=int(day[:4])
    assert local_total>=22
    assert all(active_at(a,'2026-11-22') for a in events)
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
        assert cards(p).count()==total
        for value in ['particuliers','pros','equipement']:
            goal(p,value)
            assert cards(p).count()==sum(a['objectif']==value for a in events)
            assert cards(p).evaluate_all('(xs,v)=>xs.every(x=>x.dataset.objectif===v)',value)
        reset(p)
        p.locator('#q-salons').fill('salons du vin Bordeaux')
        assert cards(p).count()==2
        p.locator('#q-salons').fill('epernay')
        assert cards(p).count()==1
        reset(p)
        p.locator('#region-salons').select_option('occ')
        assert cards(p).count()==sum(a['region']=='occ' for a in events)
        p.locator('#periode-salons').select_option('2027-t1')
        assert cards(p).count()==sum(a['region']=='occ' and bool(a['debut']) and a['debut']<='2027-03-31' and a['fin']>='2027-01-01' for a in events)
        assert p.locator('#salon-millesime-bio-2027').is_visible()
        p.get_by_role('button',name='Retirer le critère : Occitanie',exact=True).click()
        assert p.locator('#region-salons').input_value()==''
        p.locator('#form-salons [type=submit]').click()
        assert p.locator('#titre-resultats-salons').evaluate('(el)=>el===document.activeElement')
        reset(p)
        p.locator('#periode-salons').select_option('incertain')
        assert cards(p).count()==sum(a['statut_dates']!='annoncees' for a in events)
        assert p.locator('#salon-sitevi-2027').inner_text().count('jours à confirmer')>=1
        assert p.locator('[data-statut=a_reconfirmer]').count()==sum(a['statut_dates']=='a_reconfirmer' for a in events)
        assert p.locator('#salon-intervin-vienne-2027').is_visible()
        p.locator('#salon-les-angles-2027 summary').click()
        assert '14 avril' in p.locator('#salon-les-angles-2027 .sl-date-note').inner_text()
        p.locator('#q-salons').fill('<img src=x onerror=alert(1)>')
        assert p.locator('#salons-vide').is_visible()
        assert not p.locator('#criteres-salons img').count()
        p.get_by_role('button',name='Effacer les critères',exact=True).click()
        assert cards(p).count()==total
        p.locator('#salon-millesime-bio-2027 summary').click()
        assert p.locator('#salon-millesime-bio-2027 details[open]').count()==1
        assert 'conversion' in p.locator('#salon-millesime-bio-2027 details').inner_text()
        assert p.locator('#salon-millesime-bio-2027 .sl-official').get_attribute('href').startswith('https://www.millesime-bio.com/')
        assert p.evaluate("!(window.dataLayer||[]).some(x=>x.event==='salons_recherche')")
        ctx.close()
        report['controles'].append(f'{total} éditions, 3 objectifs, région/période combinées, accents, critères supprimables, zéro/reset, saisie sûre, admission et sources')

        ctx,p=new()
        for organizer,expected in [('Aux Vignobles!',13),('Mer et Vigne',9),('Vitisaveurs',3)]:
            p.locator('#q-salons').fill(organizer)
            assert cards(p).count()==expected,organizer
        reset(p)
        p.locator('#region-salons').select_option('bfc')
        assert cards(p).count()==1
        assert p.locator('#salon-mer-vigne-dijon-2027').is_visible()
        reset(p)
        p.locator('#q-salons').fill('Contrastes')
        assert cards(p).count()==1
        p.locator('#salon-contrastes-toulouse-2027 summary').click()
        assert 'lieu à confirmer' in p.locator('#salon-contrastes-toulouse-2027').inner_text()
        assert 'négoce' in p.locator('#salon-contrastes-toulouse-2027 details').inner_text()
        assert p.locator('#salon-millesime-bio-2027').count()==1
        assert p.locator('#salon-grigny-2026').count()<=1
        ctx.close()
        report['controles'].append('37 éditions issues de la veille publiées : 13 Aux Vignobles, 9 Mer et Vigne, 3 Vitisaveurs, Dijon en BFC et lieu/charte de Contrastes explicites')

        ctx,p=new()
        p.locator('#locaux-salons').check()
        assert cards(p).count()==local_total
        assert cards(p).evaluate_all('(xs)=>xs.every(x=>x.dataset.local==="oui")')
        p.locator('#q-salons').fill('56')
        assert cards(p).count()==1
        assert p.locator('#salon-guidel-2027').is_visible()
        p.locator('#q-salons').fill('Morbihan')
        assert cards(p).count()==1
        p.locator('#q-salons').fill('VIN sur VIN')
        assert cards(p).count()==1
        assert p.locator('#salon-vinotours-2027').is_visible()
        p.locator('#q-salons').fill('')
        p.locator('#region-salons').select_option('bre')
        p.locator('#periode-salons').select_option('2027-t2')
        assert cards(p).count()==2
        p.get_by_role('button',name='Retirer le critère : Événements locaux',exact=True).click()
        assert not p.locator('#locaux-salons').is_checked()
        assert p.locator('#region-salons').input_value()=='bre'
        assert p.locator('#periode-salons').input_value()=='2027-t2'
        reset(p)
        assert cards(p).count()==total
        p.locator('#q-salons').fill('44')
        assert p.locator('#salon-saint-nazaire-bretagne-2027').is_visible()
        assert p.locator('#salon-saint-nazaire-bretagne-2027').get_attribute('data-region')=='pdl'
        p.locator('#salon-saint-nazaire-bretagne-2027 summary').click()
        assert 'uniquement' in p.locator('#salon-saint-nazaire-bretagne-2027 details').inner_text()
        ctx.close()
        report['controles'].append(f'{local_total} initiatives locales : département, organisateur, région/période, retrait isolé du filtre, admission géographique et reset')

        ctx,p=new(future=True)
        assert cards(p).count()==sum(active_at(a,'2027-03-01') for a in events)
        assert not p.locator('#salon-vinitech-sifel-2026').is_visible()
        p.locator('#archives-salons').check()
        assert cards(p).count()==total
        reset(p)
        p.goto(BASE+'/salons-viticoles.html#salon-vinitech-sifel-2026',wait_until='load')
        assert p.locator('#salon-vinitech-sifel-2026').is_visible()
        assert p.locator('#salon-vinitech-sifel-2026 .sl-past').is_visible()
        assert p.locator('#archives-salons').is_checked()
        ctx.close()
        report['controles'].append('horloge navigateur au 1er mars 2027 : éditions terminées archivées, option et lien direct récupérables')
        ctx,p=new(future=2028)
        assert cards(p).count()==0
        assert p.locator('#salons-vide').is_visible()
        p.get_by_role('button',name='Inclure les éditions passées',exact=True).click()
        assert cards(p).count()==total
        assert p.locator('#salon-sitevi-2027 .sl-past').is_visible()
        ctx.close()
        report['controles'].append('en 2028, une édition sans jours mais avec année passée est aussi archivée')

        for width,height in [(320,568),(390,844),(768,1024),(1440,1000),(844,390)]:
            ctx,p=new(width=width,height=height)
            p.locator('.sl-hero .sv-button').click()
            no_overflow(p)
            p.screenshot(path=str(OUT/f'moteur-{width}.png'),animations='disabled')
            p.locator('#locaux-salons').check()
            p.locator('#q-salons').fill('56')
            p.locator('#form-salons [type=submit]').click()
            no_overflow(p)
            p.screenshot(path=str(OUT/f'local-{width}.png'),animations='disabled')
            reset(p)
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
        assert cards(p).count()==total
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
