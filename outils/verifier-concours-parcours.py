"""Recette du millésime complet, sans contact, collecte ni inscription réels."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright,expect

parser=argparse.ArgumentParser();parser.add_argument('--sortie',type=Path,required=True);parser.add_argument('--public',action='store_true');args=parser.parse_args();args.sortie.mkdir(parents=True,exist_ok=True)
root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=None
if args.public:base='https://monchai.fr'
else:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
report={'base':base,'formats':[],'errors':[],'transmissions':[],'controles':[]}
def screenshot(p,name,width):
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
    p.screenshot(path=str(args.sortie/f'{name}-{width}.png'),full_page=True,animations='disabled')
def advance(p):
    expect(p.locator('#debrief')).to_be_visible();p.locator('#next-chapter').click()
def check(p,score=100):
    p.locator('#check-mission').click();expect(p.locator('#debrief-score')).to_have_text(f'{score} / 100')
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        for width in (320,390,768,1440):
            ctx=browser.new_context(viewport={'width':width,'height':1000},is_mobile=width<700,has_touch=width<700,accept_downloads=True)
            p=ctx.new_page();p.on('pageerror',lambda e:report['errors'].append(str(e)));p.on('request',lambda r:report['transmissions'].append(r.url) if r.method!='GET' or not r.url.startswith(base+'/') else None)
            response=p.goto(base+'/concours/',wait_until='networkidle');assert response.status==200
            screenshot(p,'accueil',width);p.locator('button[type=submit]').click();expect(p.locator('#registration')).to_be_visible()
            p.locator('#sample-profile').click();expect(p.locator('#news')).not_to_be_checked();p.locator('button[type=submit]').click();expect(p.locator('#ready')).to_be_visible();p.locator('#start').click()
            expect(p.locator('#campaign-title')).to_have_text('Le geste juste')
            cuts=p.evaluate('Taille.scenario(0).branches.map(b=>({id:b.id,mm:Math.round(Taille.ideal(b)),eyes:b.target}))')
            for cut in cuts:
                p.locator(f'.branch-button[data-branch="{cut["id"]}"]').click();p.locator('#cut-position').evaluate('(el,n)=>{el.value=n;el.dispatchEvent(new Event("input",{bubbles:true}));}',cut['mm']);p.locator('#confirm-cut').click()
                assert p.locator(f'[data-branch="{cut["id"]}"] [data-eye]').count()==cut['eyes']
            screenshot(p,'taille',width);p.locator('#validate-vine').click();expect(p.locator('#debrief-score')).to_have_text('100 / 100');advance(p)
            expect(p.locator('#campaign-title')).to_have_text('Le bon moment');expect(p.locator('#check-mission')).to_be_disabled()
            for i in (1,3,4,5,7):p.locator(f'[data-sample="{i}"]').click()
            expect(p.locator('#sample-count')).to_have_text('5 / 5 zones');p.locator('#read-harvest').click();p.locator('#harvest-day').select_option('0');screenshot(p,'vendanges',width);check(p);advance(p)
            expect(p.locator('#campaign-title')).to_have_text('La cuve monte');p.locator('#read-monitor').click();p.locator('#valve').click();expect(p.locator('#cooling')).to_be_checked()
            p.locator('#target-temp').fill('26');p.locator('#follow').check()
            p.locator('#pause').click();expect(p.locator('#pause-panel')).to_be_visible();p.locator('#resume').click();expect(p.locator('#target-temp')).to_have_value('26');expect(p.locator('#cooling')).to_be_checked()
            p.get_by_role('button',name='Comment jouer ?').click();expect(p.locator('#help-dialog')).to_be_visible();p.keyboard.press('Escape');expect(p.locator('#pause-panel')).to_be_visible();p.locator('#resume').click()
            screenshot(p,'cuve',width);check(p);advance(p)
            expect(p.locator('#campaign-title')).to_have_text('La malo… ou une alerte ?');expect(p.locator('#read-lab')).to_be_disabled()
            p.locator('#take-sample').click();expect(p.locator('#sample-bottle')).to_be_visible();p.locator('#read-lab').click();expect(p.locator('#alert-lab')).to_contain_text('18 g/L')
            if width==390:
                for action in ('lancer','assembler','attendre'):p.locator(f'[data-plan="{action}"]').click()
                check(p,25);expect(p.locator('#debrief-explain')).to_contain_text('ne suffit pas');p.locator('#retry-chapter').click();p.locator('#take-sample').click();p.locator('#read-lab').click()
            for action in ('isoler','diagnostic','protocole'):p.locator(f'[data-plan="{action}"]').click()
            p.locator('#undo-plan').click();expect(p.locator('#check-mission')).to_be_disabled();p.locator('[data-plan="protocole"]').click();screenshot(p,'derive',width);check(p)
            if width==390:expect(p.locator('#debrief-attempt')).to_contain_text('premier score de 25')
            advance(p)
            expect(p.locator('#campaign-title')).to_have_text('C’est fini, la malo ?');expect(p.locator('#enzymatic')).to_be_disabled();p.locator('#compare-paper').click();p.locator('#enzymatic').click();expect(p.locator('#enzymatic-result')).to_contain_text('0,06 g/L');p.locator('#stabilize').check();screenshot(p,'controle-malo',width);check(p);advance(p)
            expect(p.locator('#campaign-title')).to_have_text('La part des anges');p.locator('#clean').check();p.locator('#reserve').select_option('F18');p.locator('#fill-volume').fill('5.5');p.locator('#pump').click();expect(p.locator('#fill-volume')).to_have_value('6');p.locator('#closed').check();expect(p.locator('#air-label')).to_have_text('Niveau atteint');screenshot(p,'ouillage',width);check(p);advance(p)
            expect(p.locator('#result')).to_be_visible();expect(p.locator('#result-score')).to_contain_text('525 / 600' if width==390 else '600 / 600');assert p.locator('#final-breakdown details').count()==6;assert p.locator('#portrait-axes progress').count()==4
            p.locator('#final-breakdown summary').nth(3).click();expect(p.locator('#final-breakdown details').nth(3)).to_contain_text('ne suffit pas')
            with p.expect_download() as d:p.locator('#download-portrait').click()
            content=Path(d.value.path()).read_text(encoding='utf-8');assert 'camille@example.org' not in content and 'Camille' not in content;assert 'diagnostic' not in d.value.suggested_filename;report['controles'].append({'largeur':width,'portrait_telecharge_sans_coordonnees':True})
            p.locator('#reveal').click();expect(p.locator('#surprise-open')).to_contain_text('aucun lot attribué');screenshot(p,'portrait',width)
            p.locator('#replay').click();p.locator('#start').click();p.locator('#leave-game').click();p.locator('#exit-cancel').click();expect(p.locator('#pause-panel')).to_be_visible();p.locator('#resume').click();p.locator('#leave-game').click();p.locator('#exit-confirm').click();expect(p.locator('#registration')).to_be_visible()
            assert p.evaluate('localStorage.length===0 && sessionStorage.length===0');report['formats'].append(width);ctx.close()
        ctx=browser.new_context(java_script_enabled=False);p=ctx.new_page();p.goto(base+'/concours/');expect(p.locator('#firstname')).to_be_disabled();expect(p.locator('button[type=submit]')).to_be_disabled();ctx.close();browser.close()
        assert not report['errors'],report['errors'];assert not report['transmissions'],report['transmissions']
        report['controles']+=['six ateliers et débriefs','taille géométrique','prélèvement cinq zones','vanne et réglage thermique','alerte malo et plan ordonné','papier et confirmation enzymatique','volume et réserve d’ouillage','portrait et carnet complet','premier score conservé après réessai','pause/aide/sortie','aucun envoi ou stockage','formulaire désactivé sans JavaScript']
finally:
    if server:server.shutdown()
    (args.sortie/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
