"""Inventaire exhaustif des formulaires et recette sans envoi réel."""
import argparse
from datetime import datetime,timezone
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import json
from pathlib import Path
import threading

ROOT=Path(__file__).resolve().parents[1]
LOCAL={('aides-vignerons.html','form-aides'),('salons-viticoles.html','form-salons'),('demonstration/index.html','visit-form'),('visite-interactive/index.html','visit-form'),('concours/millesime/index.html','concours-form')}
IGNORE={'.git','.github','node_modules','outils'}
class Scan(HTMLParser):
 def __init__(self):super().__init__();self.forms=[];self.current=None;self.scripts=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='script' and a.get('src'):self.scripts.append(a['src'])
  if tag=='form':self.current={'attrs':a,'traps':[]};self.forms.append(self.current)
  elif tag=='input' and self.current is not None and 'data-honeypot' in a:self.current['traps'].append(a)
 def handle_endtag(self,tag):
  if tag=='form':self.current=None

def inventory():
 result=[];seen_local=set()
 for path in sorted(ROOT.rglob('*.html')):
  if IGNORE.intersection(path.relative_to(ROOT).parts):continue
  rel=path.relative_to(ROOT).as_posix();s=Scan();s.feed(path.read_text(encoding='utf-8'))
  for form in s.forms:
   ident=form['attrs'].get('id','');key=(rel,ident)
   if key in LOCAL:
    seen_local.add(key);result.append({'page':rel,'id':ident,'type':'local'});continue
   assert 'data-honeypot-form' in form['attrs'],f'Formulaire non protégé et non classé local : {rel}#{ident}'
   assert form['traps'],f'Piège manquant : {rel}#{ident}'
   assert any('assets/js/antispam.js' in src for src in s.scripts),f'Garde non chargée : {rel}'
   for trap in form['traps']:
    assert trap.get('name') and trap.get('tabindex')=='-1' and trap.get('autocomplete')=='off',rel
    assert trap.get('type','text')=='text',f'Le piège doit rester un champ textuel : {rel}'
   result.append({'page':rel,'id':ident,'type':'envoi','pieges':[t['name'] for t in form['traps']]})
 assert seen_local==LOCAL,'Un formulaire local déclaré a disparu : mettre à jour le périmètre.'
 assert len([f for f in result if f['type']=='envoi'])>=8
 return result

parser=argparse.ArgumentParser()
parser.add_argument('--inventaire',action='store_true')
parser.add_argument('--sortie',type=Path)
parser.add_argument('--public',action='store_true')
args=parser.parse_args()
report={'formulaires':inventory(),'controles':[],'envois_reels':0}
if args.inventaire:
 print(json.dumps(report,ensure_ascii=False));raise SystemExit()
assert args.sortie,'--sortie est obligatoire pour la recette navigateur'
args.sortie.mkdir(parents=True,exist_ok=True)
from playwright.sync_api import sync_playwright,expect
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def copyfile(self,source,output):
  try:super().copyfile(source,output)
  except (ConnectionAbortedError,ConnectionResetError,BrokenPipeError):pass
server=None
if args.public:BASE='https://monchai.fr'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();BASE=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  for width in [390,1440]:
   for f in [f for f in report['formulaires'] if f['type']=='envoi']:
    ctx=browser.new_context(viewport={'width':width,'height':900},timezone_id='Europe/Paris',reduced_motion='reduce')
    posts=[];errors=[]
    def route(r):
     if r.request.method=='POST':
      posts.append(r.request.url)
      r.fulfill(status=200,body='OK',headers={'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'})
     elif r.request.url.startswith(BASE+'/'):r.continue_()
     else:r.abort()
    ctx.route('**/*',route)
    if f['id']=='partner-form':ctx.route('**/proto_bevhive/app.js',lambda r:r.abort())
    ctx.add_init_script("localStorage.setItem('monchai_cookie_consent',JSON.stringify({audience:false,tiers:false,ts:Date.now(),version:'2026-10-29-ga4'}));window.__hpSent=[];window.emailjs={init:()=>{},send:(...args)=>{window.__hpSent.push(args);return Promise.resolve({status:200});}};")
    p=ctx.new_page();p.on('pageerror',lambda err:errors.append(str(err)))
    p.clock.install(time=datetime(2026,11,22,12,tzinfo=timezone.utc))
    response=p.goto(BASE+'/'+f['page'],wait_until='load');assert response.status==200
    p.clock.run_for(3000)
    form=p.locator('#'+f['id']);trap=form.locator('input[data-honeypot]').first
    assert trap.count()==1
    assert trap.get_attribute('tabindex')=='-1'
    assert trap.evaluate("el=>!!el.closest('[aria-hidden=true]')")
    assert trap.evaluate("el=>{const r=el.getBoundingClientRect(),p=el.closest('[aria-hidden=true]'),b=p.getBoundingClientRect(),s=getComputedStyle(p);return r.width<=1||r.x+r.width<=0||(b.width<=1&&s.overflow==='hidden')||s.clipPath!=='none'||!!el.closest('[hidden]')||!!el.closest('dialog:not([open])');}")
    p.evaluate("window.__hpReached=0;document.querySelector('form[data-honeypot-form]').addEventListener('submit',()=>window.__hpReached++);")
    trap.evaluate("el=>el.value='robot-spam'")
    form.dispatch_event('submit')
    assert p.evaluate('window.__hpReached')==0
    assert not posts and p.evaluate('window.__hpSent.length')==0
    trap.evaluate("el=>el.value=''")
    if f['id']=='partner-form':
     form.dispatch_event('submit')
     assert p.evaluate('window.__hpReached')==1
    elif f['id']=='proposition-salon':
     values={'salon-nom':'Salon de recette','salon-organisateur':'Association de recette','salon-source':'https://example.org/salon','salon-debut':'2027-04-17','salon-fin':'2027-04-18','salon-lieu':'Salle de recette','salon-ville':'Guidel','salon-code-postal':'56520','salon-description':'Une description fictive suffisamment longue pour tester le formulaire sans envoyer de message réel.','salon-contact':'Camille Test','salon-email':'test@example.org'}
     form.evaluate("(el,values)=>{for(const [id,value] of Object.entries(values))el.querySelector('#'+id).value=value;for(const s of el.querySelectorAll('select'))s.selectedIndex=1;el.querySelector('[type=checkbox]').checked=true;}",values)
     form.dispatch_event('submit');expect(p.locator('#salon-succes')).to_be_visible();assert len(posts)==1
    else:
     values={'prenom':'Camille','nom':'Test','email':'test@example.org','domaine':'Domaine de recette','siret':'00000000000000','message':'Demande fictive de contrôle, sans envoi réel.'}
     form.evaluate("(el,values)=>{for(const [id,value] of Object.entries(values)){const f=el.querySelector('#'+id);if(f)f.value=value;}for(const s of el.querySelectorAll('select'))s.selectedIndex=1;el.querySelector('#consent').checked=true;}",values)
     form.dispatch_event('submit');p.wait_for_function('window.__hpSent.length===1')
    assert p.evaluate('window.__hpReached')==1
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert not errors,(f,errors)
    ctx.close()
    report['controles'].append({'page':f['page'],'largeur':width,'piege_rempli':'aucun envoi','piege_vide':'parcours conservé'})
  # Une régression de gabarit doit bloquer avant tout gestionnaire d'envoi.
  ctx=browser.new_context();ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE+'/') else r.abort())
  p=ctx.new_page();p.goto(BASE+'/contact.html',wait_until='load')
  p.locator('[data-honeypot]').evaluate('el=>el.remove()')
  p.evaluate("window.__hpReached=0;document.querySelector('#contact-form').addEventListener('submit',()=>window.__hpReached++);")
  p.locator('#contact-form').dispatch_event('submit');assert p.evaluate('window.__hpReached')==0
  ctx.close();browser.close()
  report['controles'].append('Piège supprimé : envoi bloqué avant les gestionnaires')
finally:
 if server:server.shutdown()
 (args.sortie/'verification-honeypots.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
