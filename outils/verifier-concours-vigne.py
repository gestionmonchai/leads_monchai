"""Recette du concours. Les écritures sont exclusivement autorisées vers une API locale."""
import argparse,json,threading,uuid
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
API='https://monchai-concours-vinitech.norbertmoutier.chatgpt.site/api/'
parser=argparse.ArgumentParser();parser.add_argument('--public',action='store_true');parser.add_argument('--api');parser.add_argument('--sortie',type=Path,required=True);args=parser.parse_args()
if args.api:
 assert not args.public,'Aucune écriture pendant la recette publique.'
 u=urlsplit(args.api);assert u.scheme=='http' and u.hostname in ['127.0.0.1','localhost'],'API de QA exclusivement loopback.'
args.sortie.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=None
if not args.public:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
report={'largeurs':[],'mode':'parcours local complet' if args.api else 'lecture et geste sans participation','ecritures_hebergees':0}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in [320,390,768,1440]:
   ctx=browser.new_context(viewport={'width':width,'height':950},reduced_motion='reduce');page=ctx.new_page();errors=[];missing=[];posts=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:missing.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
   if server:
    local=f'http://127.0.0.1:{server.server_port}'
    ctx.route('https://monchai.fr/**',lambda r:r.fulfill(response=r.fetch(url=r.request.url.replace('https://monchai.fr',local))))
   if args.api:
    def proxy(r):
     target=r.request.url.replace(API,args.api.rstrip('/')+'/')
     response=r.fetch(url=target,headers={**r.request.headers,'Origin':'http://127.0.0.1:5176'})
     r.fulfill(response=response,headers={**response.headers,'access-control-allow-origin':'https://monchai.fr'})
    ctx.route(API+'**',proxy)
   else:
    def no_write(r):
     if r.request.method=='POST':posts.append(r.request.url);r.abort()
     else:r.continue_()
    ctx.route(API+'**',no_write)
   with page.expect_response(lambda r:r.url==API+'status') as loaded_status:
    page.goto('https://monchai.fr/concours/',wait_until='networkidle')
   state=loaded_status.value.json()
   assert 'remaining' not in state and 'instant' not in state,state
   assert all(set(p)=={'id','label'} for p in state['prizes']),state['prizes']
   assert page.locator('.hero-prizes li').count()==3
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   expect(page.locator('#campaign-status')).not_to_contain_text('Nous vérifions')
   page.screenshot(path=str(args.sortie/f'accueil-{width}.png'),full_page=True)
   page.locator('#try-gesture').click()
   assert page.locator('#pruning-cursor').get_attribute('aria-hidden')=='true'
   assert page.locator('#pruning-cursor').evaluate("e=>getComputedStyle(e).pointerEvents")=='none'
   for _ in range(6):page.locator('#prune-one').click()
   expect(page.locator('#reveal-title')).to_have_text('La vigne est prête.')
   assert not page.locator('#prize-reference').inner_text()
   if args.api:
    page.locator('#enter').click();page.locator('[name=firstName]').fill('Camille');page.locator('[name=lastName]').fill('Test');page.locator('[name=email]').fill(f'qa-{uuid.uuid4()}@example.invalid');page.locator('[name=adult]').check();page.locator('[name=rules]').check();page.locator('#concours-form button[type=submit]').click();expect(page.locator('#entry-dialog')).not_to_be_visible()
    page.locator('#reveal-direct').click();expect(page.locator('#vine-result')).to_be_visible();ref=page.locator('#prize-reference').inner_text();assert len(ref)==36
    page.screenshot(path=str(args.sortie/f'cadeau-{width}.png'))
    page.reload(wait_until='networkidle');expect(page.locator('#vine-result')).to_be_visible();assert page.locator('#prize-reference').inner_text()==ref
   page.locator('#open-quiz').click();expect(page.locator('#quiz-intro')).to_be_visible()
   if args.api:
    page.locator('#quiz-start').click()
    for i,choice in enumerate([1,0,1,2,1]):
     expect(page.locator('#quiz-number')).to_have_text(f'Question {i+1} sur 5')
     if i==4:page.screenshot(path=str(args.sortie/f'question-expert-{width}.png'))
     page.locator('#quiz-options button').nth(choice).click();expect(page.locator('#quiz-feedback')).to_be_visible();page.locator('#quiz-next').click()
    expect(page.locator('#quiz-finish')).to_be_visible();assert float(page.locator('#quiz-final-score').inner_text().replace(',','.'))<=100
    page.locator('[name=pseudonym]').fill(f'QA Visuel {width}');page.locator('[name=consent]').check();page.locator('#score-form button').click();expect(page.locator('#publish-status')).to_contain_text('publié');page.screenshot(path=str(args.sortie/f'score-{width}.png'))
   page.locator('#quiz-dialog .close').click()
   for name in ['help-dialog','rules-dialog','score-dialog']:
    page.locator(f'[data-dialog={name}]').first.click();expect(page.locator('#'+name)).to_be_visible();page.keyboard.press('Escape');expect(page.locator('#'+name)).not_to_be_visible()
   page.locator('#refresh-board').click();expect(page.locator('#refresh-board')).to_be_enabled()
   assert not errors,errors;assert not missing,missing;assert not posts,posts
   assert page.locator('a[href="millesime/"]').count()>=1
   report['largeurs'].append({'largeur':width,'debordement':False,'erreurs_js':errors,'ressources_manquantes':missing,'parcours':'OK'})
   ctx.close()
  browser.close()
finally:
 if server:server.shutdown();server.server_close()
(args.sortie/'recette.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
