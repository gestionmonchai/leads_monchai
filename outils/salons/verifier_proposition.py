"""Recette du formulaire public ; EmailJS est intercepté, aucun mail n'est envoyé."""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from generer import load_events
from pathlib import Path
import threading
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--sortie',type=Path,required=True)
parser.add_argument('--public',action='store_true')
args=parser.parse_args()
OUT=args.sortie.resolve();OUT.mkdir(parents=True,exist_ok=True)
report={'controles':[],'rendus':[],'erreurs_js':[],'envois_reels':0}
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
    def copyfile(self,source,output):
        try: super().copyfile(source,output)
        except (ConnectionAbortedError,ConnectionResetError,BrokenPipeError): pass
server=None
if args.public: BASE='https://monchai.fr'
else:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    BASE=f'http://127.0.0.1:{server.server_port}'

API='https://api.emailjs.com/api/v1.0/email/send'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  def new(width=1440,height=1000,js=True,reply=200,pending=False,limited=False):
   ctx=browser.new_context(viewport={'width':width,'height':height},java_script_enabled=js,timezone_id='Europe/Paris',reduced_motion='reduce')
   ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE+'/') else r.abort())
   ctx.add_init_script("localStorage.setItem('monchai_cookie_consent',JSON.stringify({audience:false,tiers:false,ts:Date.now(),version:'2026-10-29-ga4'}));")
   calls=[];routes=[]
   def intercept(route):
    assert route.request.method=='POST'
    calls.append(route.request.post_data_json)
    if pending: routes.append(route)
    elif reply=='network': route.abort('failed')
    else: route.fulfill(status=reply,body='OK' if reply==200 else 'Service indisponible',headers={'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'})
   ctx.route(API,intercept)
   p=ctx.new_page();p.on('pageerror',lambda err:report['erreurs_js'].append(str(err)))
   if js: p.clock.install(time=datetime(2026,11,22,12,tzinfo=timezone.utc))
   response=p.goto(BASE+'/proposer-salon.html',wait_until='load')
   assert response.status==200
   if js: p.clock.run_for(3000)
   if limited: p.evaluate("localStorage.setItem('monchai_contact_submissions',JSON.stringify({a:[],b:Date.now()+300000}));")
   return ctx,p,calls,routes
  def fill(p):
   values={'nom':'Salon de recette Mon Chai','organisateur':'Association de recette','source':'https://example.org/salon','debut':'2027-04-17','fin':'2027-04-18','lieu':'Salle de recette, 1 rue des Vignes','ville':'Guidel','code-postal':'56520','description':'Un événement fictif pour vérifier la proposition de salon, la dégustation et les conditions de participation.','exposants':'Candidature après sélection, conditions à vérifier.','contact':'Camille Test','email':'test@example.org'}
   for name,value in values.items():p.locator('#salon-'+name).fill(value)
   for name,value in [('region','Bretagne'),('public','Grand public'),('objectif','Vendre aux particuliers')]:p.locator('#salon-'+name).select_option(label=value)
   p.locator('#salon-consent').check()
  def send(p):p.locator('#salon-envoyer').click()
  def no_overflow(p):assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')

  ctx,p,calls,_=new()
  assert p.locator('link[rel=canonical]').get_attribute('href')=='https://monchai.fr/proposer-salon.html'
  assert p.locator('main h1').count()==1
  assert p.locator('#proposition-salon').get_attribute('data-hs-do-not-collect')=='true'
  schema=[json.loads(x) for x in p.locator('script[type="application/ld+json"]').all_text_contents()]
  assert any(x.get('@type')=='WebPage' for x in schema)
  response=ctx.request.get(BASE+'/sitemap.xml')
  urls=[x.text for x in ET.fromstring(response.text()).findall('.//{*}loc')]
  assert urls.count('https://monchai.fr/proposer-salon.html')==1
  send(p)
  assert p.locator('#salon-nom').get_attribute('aria-invalid')=='true'
  assert not calls
  fill(p)
  for name,value in [('source','javascript:alert(1)'),('fin','2027-04-16'),('email','invalide'),('description','Trop court')]:
   old=p.locator('#salon-'+name).input_value()
   p.locator('#salon-'+name).fill(value);send(p)
   assert p.locator('#salon-'+name).get_attribute('aria-invalid')=='true',name
   assert not calls
   p.locator('#salon-'+name).fill(old)
  p.locator('#salon-consent').uncheck();send(p)
  assert p.locator('#salon-consent').get_attribute('aria-invalid')=='true'
  assert not calls
  p.locator('#salon-consent').check()
  p.locator('#salon-website').fill('robot');send(p)
  assert not calls and not p.locator('#salon-succes').is_visible()
  p.locator('#salon-website').fill('')
  assert p.locator('#compteur-description').inner_text().endswith('/ 1 800')
  ctx.close()
  report['controles'].append('HTTP 200, canonique, WebPage et sitemap ; champs requis, URL HTTP(S), dates cohérentes, e-mail, description, autorisation et honeypot')

  ctx,p,calls,routes=new(pending=True)
  fill(p);send(p)
  expect(p.locator('#salon-envoyer')).to_be_disabled()
  p.wait_for_timeout(100)
  assert len(calls)==1
  p.locator('#proposition-salon').dispatch_event('submit')
  assert len(calls)==1
  payload=calls[0]
  assert payload['service_id']=='service_dmflavl' and payload['template_id']=='template_yajlaes'
  params=payload['template_params']
  assert params['objet']=='proposition_salon' and params['newsletter']=='non'
  assert params['from_email']=='test@example.org'
  assert 'to_email' not in params
  for marker in ['Salon de recette Mon Chai','Association de recette','https://example.org/salon','2027-04-17','2027-04-18','Salle de recette','56520 Guidel','Bretagne','Grand public','Vendre aux particuliers','Candidature après sélection','Camille Test','test@example.org','CONTACT PRIVÉ, À NE PAS PUBLIER']:
   assert marker in params['priorite'],marker
  assert params['message']==params['priorite']
  routes[0].fulfill(status=200,body='OK',headers={'Access-Control-Allow-Origin':'*'})
  expect(p.locator('#salon-succes')).to_be_visible()
  assert not p.locator('#proposition-salon').is_visible()
  assert 'Après validation' in p.locator('#salon-succes').inner_text()
  assert p.locator('#salon-succes').evaluate('el=>el===document.activeElement')
  assert 'test@example.org' not in p.locator('#salon-succes').inner_text()
  p.locator('#proposition-salon').dispatch_event('submit')
  assert len(calls)==1
  assert p.evaluate("!Object.values(localStorage).some(v=>v.includes('test@example.org')||v.includes('Camille Test'))")
  p.screenshot(path=str(OUT/'succes-1440.png'),animations='disabled')
  ctx.close()
  report['controles'].append('un seul envoi en cours, destinataire figé par le service, payload complet, succès après HTTP 200 avec validation rappelée, aucun stockage local des coordonnées')

  for reply in [500,429,'network']:
   ctx,p,calls,_=new(reply=reply)
   fill(p);send(p)
   expect(p.locator('#salon-retour')).to_be_visible()
   assert p.locator('#proposition-salon').is_visible()
   assert not p.locator('#salon-succes').is_visible()
   assert p.locator('#salon-nom').input_value()=='Salon de recette Mon Chai'
   expect(p.locator('#salon-envoyer')).to_be_enabled()
   assert len(calls)==1
   if reply==429:
    send(p)
    assert len(calls)==1
   else:
    ctx.route(API,lambda r:r.fulfill(status=200,body='OK',headers={'Access-Control-Allow-Origin':'*'}))
    send(p);expect(p.locator('#salon-succes')).to_be_visible()
   ctx.close()
  ctx,p,calls,_=new(limited=True);fill(p);send(p)
  assert p.locator('#salon-retour').is_visible() and not calls
  ctx.close()
  report['controles'].append('HTTP 500/429 et erreur réseau : saisie conservée, pas de faux succès, réessai possible, limitation de fréquence')

  for width,height in [(320,568),(390,844),(768,1024),(1440,1000),(844,390)]:
   ctx,p,calls,_=new(width,height)
   no_overflow(p)
   p.screenshot(path=str(OUT/f'formulaire-{width}.png'),animations='disabled')
   fill(p);p.locator('#salon-consent').focus();p.keyboard.press('Tab')
   assert p.locator('#salon-envoyer').evaluate('el=>el===document.activeElement') or p.locator('.sp-consent a').evaluate('el=>el===document.activeElement')
   p.locator('#salon-envoyer').focus();p.keyboard.press('Enter')
   expect(p.locator('#salon-succes')).to_be_visible();no_overflow(p)
   p.screenshot(path=str(OUT/f'confirmation-{width}.png'),animations='disabled')
   p.locator('#salon-succes a').click();p.wait_for_url('**/salons-viticoles.html')
   assert p.locator('[data-salon]').count()==len(load_events(ROOT)['evenements'])
   assert not p.locator('[data-salon]').filter(has_text='Salon de recette Mon Chai').count()
   p.locator('.sl-hero a[href="proposer-salon.html"]').click()
   p.wait_for_url('**/proposer-salon.html')
   report['rendus'].append({'width':width,'height':height})
   ctx.close()
  ctx,p,calls,_=new(js=False)
  assert not p.locator('#proposition-salon').is_visible()
  assert p.locator('noscript').is_visible()
  assert p.locator('.sp-alternative a[href^="mailto:"]').is_visible()
  assert not calls
  ctx.close();browser.close()
  assert not report['erreurs_js'],report['erreurs_js']
  report['controles'].append('5 formats, clavier, confirmation et retour au moteur, catalogue complet conservé, repli sans JavaScript, aucune erreur JS et aucun e-mail réel')
finally:
 if server:server.shutdown()
 (OUT/'verification-proposition.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
