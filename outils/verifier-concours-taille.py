"""Recette du jeu de taille sur navigateur, sans inscription ni envoi réel."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

parser=argparse.ArgumentParser()
parser.add_argument('--sortie',type=Path,required=True)
parser.add_argument('--public',action='store_true')
parser.add_argument('--apercu',action='store_true')
args=parser.parse_args();args.sortie.mkdir(parents=True,exist_ok=True)
root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=None
if args.public: base='https://monchai.fr'
else:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
    threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
report={'base':base,'formats':[],'controles':[],'transmissions':[],'errors':[]}
def start(p,timed=False):
    p.goto(base+'/concours/',wait_until='networkidle')
    p.locator('#sample-profile').click();p.locator('button[type=submit]').click()
    if timed:p.locator('#timed').check()
    p.locator('#start').click();expect(p.locator('#game')).to_be_visible()
def place(p,ident,mm):
    p.locator(f'[data-branch="{ident}"].branch-button').click()
    p.locator('#cut-position').evaluate('(el,value)=>{el.value=value;el.dispatchEvent(new Event("input",{bubbles:true}));}',mm)
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        for width in ((1440,390) if args.apercu else (320,390,768,1440)):
            ctx=browser.new_context(viewport={'width':width,'height':1000},is_mobile=width<700,has_touch=width<700)
            p=ctx.new_page();p.on('pageerror',lambda e:report['errors'].append(str(e)))
            p.on('request',lambda r:report['transmissions'].append(r.url) if r.method!='GET' or not r.url.startswith(base+'/') else None)
            start(p)
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
            p.screenshot(path=str(args.sortie/f'cep-{width}.png'),full_page=True)
            if args.apercu:
                place(p,'B',610)
                p.screenshot(path=str(args.sortie/f'coupe-{width}.png'),full_page=True)
                ctx.close();continue
            # The visual target is hit through screen coordinates, including transformed zoom.
            p.locator('#zoom-in').click();p.locator('#zoom-in').click()
            expect(p.locator('#zoom-value')).to_have_text('150 %')
            coordinates=p.evaluate('''()=>{const b=Taille.scenario(0).branches[0],q=Taille.point(b,.4),svg=document.querySelector('#vine-svg'),p=svg.createSVGPoint();p.x=q.x;p.y=q.y;const c=p.matrixTransform(document.querySelector('#vine-view').getScreenCTM());return {x:c.x,y:c.y};}''')
            p.locator('#vine-svg').scroll_into_view_if_needed()
            # Obtain coordinates again after scrolling the document.
            coordinates=p.evaluate('''()=>{const b=Taille.scenario(0).branches[0],q=Taille.point(b,.4),svg=document.querySelector('#vine-svg'),p=svg.createSVGPoint();p.x=q.x;p.y=q.y;const c=p.matrixTransform(document.querySelector('#vine-view').getScreenCTM());return {x:c.x,y:c.y};}''')
            p.mouse.click(coordinates['x'],coordinates['y'])
            expect(p.locator('#selected-label')).to_contain_text('A · Courson')
            p.locator('#reset-view').click();expect(p.locator('#zoom-value')).to_have_text('100 %')
            # An actually bad cut changes the retained geometry and can be undone.
            place(p,'A',20);before=p.locator('[data-branch="A"] [data-eye]').count()
            p.locator('#confirm-cut').click()
            assert p.locator('[data-branch="A"] [data-eye]').count()<before
            expect(p.locator('#game-status')).to_contain_text('objectif : 2')
            p.locator('#undo').click();assert p.locator('[data-branch="A"] [data-eye]').count()==before
            for index in range(3):
                cuts=p.evaluate('''i=>Taille.scenario(i).branches.map(b=>({id:b.id,mm:Math.round(b.target?b.buds[b.target-1].mm+15:b.diameter*2),eyes:b.target}))''',index)
                for target in cuts:
                    place(p,target['id'],target['mm'])
                    expect(p.locator('#eyes-left')).to_have_text(str(target['eyes']))
                    old=int(p.locator('#cut-position').input_value());p.locator('#cut-more').click()
                    assert int(p.locator('#cut-position').input_value())==old+1
                    p.locator('#cut-less').click()
                    if index==0 and target['id']=='B':p.screenshot(path=str(args.sortie/f'precision-{width}.png'),full_page=True)
                    p.locator('#confirm-cut').click()
                    assert p.locator(f'[data-branch="{target["id"]}"] [data-eye]').count()==target['eyes']
                p.locator('#validate-vine').click()
                expect(p.locator('#review-title')).to_contain_text('100 / 100')
                p.locator('#next-vine').click()
            expect(p.locator('#result-score')).to_have_text('300 / 300')
            p.locator('#reveal').click();expect(p.locator('#surprise-open')).to_contain_text('aucun lot attribué')
            p.screenshot(path=str(args.sortie/f'resultat-{width}.png'),full_page=True)
            p.locator('#replay').click();expect(p.locator('#ready')).to_be_visible()
            p.locator('#start').click();p.locator('#leave-game').click();expect(p.locator('#exit-dialog')).to_be_visible()
            p.locator('#exit-cancel').click();expect(p.locator('#pause-panel')).to_be_visible();p.locator('#resume').click()
            if width==390:
                p.locator('#leave-game').click();p.locator('#exit-confirm').click();expect(p.locator('#registration')).to_be_visible()
                start(p,timed=True);p.clock.install();p.clock.run_for(10000);p.locator('#pause').click()
                before=p.locator('#time').inner_text();p.clock.run_for(30000);assert p.locator('#time').inner_text()==before
                p.locator('#resume').click();p.get_by_role('button',name='Comment jouer ?').click();p.keyboard.press('Escape')
                expect(p.locator('#pause-panel')).to_be_visible();p.locator('#resume').click()
                p.clock.run_for(181000);expect(p.locator('#result')).to_be_visible()
                expect(p.locator('#result-summary')).to_contain_text('temps est écoulé')
                expect(p.locator('#result-score')).to_have_text('0 / 300')
            assert p.evaluate('localStorage.length===0 && sessionStorage.length===0')
            assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
            report['formats'].append(width);ctx.close()
        ctx=browser.new_context(java_script_enabled=False);p=ctx.new_page();p.goto(base+'/concours/')
        expect(p.locator('#firstname')).to_be_disabled();expect(p.locator('button[type=submit]')).to_be_disabled();ctx.close();browser.close()
        assert not report['errors'],report['errors']
        assert not report['transmissions'],report['transmissions']
        report['controles']=['aperçu visuel','sans JavaScript'] if args.apercu else ['vraie sélection sur le sarment à 150 %','géométrie réellement coupée','annulation','réglage de 1 mm','yeux conservés sur les 3 ceps','bilan 300/300','surprise fictive','quitter/continuer','chronomètre/pause/expiration','aucun stockage ou envoi','sans JavaScript']
finally:
    if server:server.shutdown()
    (args.sortie/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
