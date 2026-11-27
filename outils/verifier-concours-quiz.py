"""Recette du quiz et de l’archive, sans participation ou tirage réels."""
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
report={'base':base,'formats':[],'errors':[],'transmissions':[],'ressources_absentes':[],'controles':[]}
def capture(p,name,width):
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
    p.screenshot(path=str(args.sortie/f'{name}-{width}.png'),full_page=True,animations='disabled')
def entry(p):
    p.locator('#sample-profile').click();p.locator('button[type=submit]').click();expect(p.locator('#ready')).to_be_visible()
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch()
        for width in (320,390,768,1440):
            ctx=browser.new_context(viewport={'width':width,'height':1000},is_mobile=width<700,has_touch=width<700)
            p=ctx.new_page();p.on('pageerror',lambda e:report['errors'].append(str(e)))
            p.on('request',lambda r:report['transmissions'].append(r.url) if r.method!='GET' or not r.url.startswith(base+'/') else None)
            p.on('response',lambda r:report['ressources_absentes'].append(r.url) if r.status>=400 else None)
            response=p.goto(base+'/concours/',wait_until='networkidle');assert response.status==200
            expect(p.locator('.fairness')).to_contain_text('Le score ne change pas vos chances')
            for lot in ('Un mois Mon Chai offert','Un emballage Bottleflow','Une bouteille de champagne'):expect(p.locator('.prizes')).to_contain_text(lot)
            capture(p,'accueil',width);p.locator('button[type=submit]').click();expect(p.locator('#registration')).to_be_visible();entry(p);capture(p,'participation',width)
            p.locator('#skip-quiz').click();expect(p.locator('#entry-count')).to_have_text('1 participation simulée');expect(p.locator('#score-box')).not_to_be_visible();capture(p,'quiz-passe',width)
            p.locator('#replay').click()
            # Toutes les réponses fausses restent éligibles au même principe de tirage.
            for i in range(5):
                correct=p.evaluate('i=>QuizMonChai.questions[i].correct',i)
                p.locator(f'[data-answer="{(correct+1)%3}"]').click();expect(p.locator('#answer-feedback')).to_be_visible()
                assert p.locator('#answer-options button:disabled').count()==3
                expect(p.locator('.quiz-reminder')).to_contain_text('ne change pas vos chances')
                p.locator('#next-question').click()
            expect(p.locator('#final-score')).to_have_text('0 / 5');expect(p.locator('#entry-count')).to_have_text('1 participation simulée')
            p.locator('#replay').click()
            for i in range(5):
                expect(p.locator('#question-number')).to_have_text(f'Question {i+1} sur 5')
                correct=p.evaluate('i=>QuizMonChai.questions[i].correct',i)
                p.locator(f'[data-answer="{correct}"]').click()
                expect(p.locator('#answer-verdict')).to_have_text('Bonne réponse !')
                if i==1:capture(p,'question',width)
                if i==2:
                    p.get_by_role('button',name='Le principe du jeu').first.click();expect(p.locator('#rules-dialog')).to_be_visible();p.keyboard.press('Escape');expect(p.locator('#rules-dialog')).not_to_be_visible()
                p.locator('#next-question').click()
            expect(p.locator('#final-score')).to_have_text('5 / 5');expect(p.locator('#entry-count')).to_have_text('1 participation simulée');expect(p.locator('.result-chance')).to_contain_text('réussi, raté ou passé');capture(p,'resultat',width)
            p.locator('#replay').click();p.locator('[data-answer="0"]').click();p.locator('#stop-quiz').click();expect(p.locator('#entry-count')).to_have_text('1 participation simulée');expect(p.locator('#answered-count')).to_contain_text('1 question répondue')
            p.locator('#restart').click();expect(p.locator('#registration')).to_be_visible();assert p.evaluate('localStorage.length===0&&sessionStorage.length===0')
            if width==390:
                response=p.goto(base+'/concours/millesime/',wait_until='networkidle');assert response.status==200
                expect(p.locator('h1')).to_contain_text('Quel viticulteur');p.locator('#sample-profile').click();p.locator('button[type=submit]').click();p.locator('#start').click();expect(p.locator('#guide-count')).to_contain_text('Atelier 1 / 6');capture(p,'archive',width)
            report['formats'].append(width);ctx.close()
        ctx=browser.new_context(java_script_enabled=False);p=ctx.new_page();p.goto(base+'/concours/');expect(p.locator('#firstname')).to_be_disabled();expect(p.locator('button[type=submit]')).to_be_disabled()
        qr=ctx.request.get(base+'/concours/qr-concours.svg');assert qr.status==200;assert qr.body()==(root/'concours/qr-concours.svg').read_bytes();ctx.close();browser.close()
        assert not report['errors'],report['errors'];assert not report['transmissions'],report['transmissions'];assert not report['ressources_absentes'],report['ressources_absentes']
        report['controles']=['lots annoncés présents','tirage indépendant du score annoncé avant le jeu','quiz facultatif passé : 1 participation simulée','0/5 : 1 participation simulée','5/5 : 1 participation simulée','rejouer sans bonus de participation','arrêt anticipé sans perte de participation','une réponse par question','explication et progression','aide et clavier','aucun stockage ni envoi','formulaire bloqué sans JavaScript','ancien parcours conservé et fonctionnel','QR téléchargeable identique au fichier source']
finally:
    if server:server.shutdown()
    (args.sortie/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
