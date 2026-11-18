"""Recette réelle du moteur et de l'invitation visite, sans transmission externe.

python outils/aides/verifier_navigateur.py --sortie CHEMIN_TEMPORAIRE
"""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--sortie', type=Path, required=True)
OUT = parser.parse_args().sortie.resolve()
OUT.mkdir(parents=True, exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'
report = {'controles': [], 'erreurs_js': [], 'rendus': []}

try:
 with sync_playwright() as pw:
  browser = pw.chromium.launch()
  def new(path='aides-vignerons.html', width=1440, height=900, consent=True, js=True, storage=True):
    ctx = browser.new_context(viewport={'width':width, 'height':height}, java_script_enabled=js)
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
    if consent:
      ctx.add_init_script("localStorage.setItem('monchai_cookie_consent',JSON.stringify({audience:false,tiers:false,ts:Date.now(),version:'2026-10-29-ga4'}));")
    if not storage:
      ctx.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}});")
    p = ctx.new_page()
    p.on('pageerror', lambda e: report['erreurs_js'].append(str(e)))
    if js: p.clock.install()
    p.goto(BASE+'/'+path, wait_until='load')
    if js: p.clock.pause_at(datetime.fromtimestamp((p.evaluate('Date.now()')+1000)/1000, tz=timezone.utc))
    return ctx, p
  def visible(p): return p.locator('[data-aide]:visible')
  def reset(p): p.locator('#form-aides [type=reset]').click()
  def no_overflow(p): assert p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'débordement horizontal'

  ctx,p = new()
  total = visible(p).count()
  assert total == 64
  assert p.locator('#recherche').bounding_box()['y'] < p.locator('.aides-veille').bounding_box()['y']
  for q in ['subvention chai', 'subventions viticoles chai', 'aides chai', 'financement chai']:
    p.locator('#q-aides').fill(q)
    assert visible(p).count() > 0, q
    if q.startswith('subvention'):
      assert visible(p).evaluate_all("xs=>xs.every(x=>x.dataset.type==='subvention')")
  reset(p)
  p.locator('#territoire-aides').select_option('naq')
  p.get_by_role('button',name='Investir au chai',exact=True).click()
  assert p.locator('#territoire-aides').input_value() == 'naq'
  assert visible(p).count() > 0
  p.locator('#form-aides [type=submit]').click()
  assert p.locator('#resultats').evaluate('(el)=>el===document.activeElement')
  p.locator('#recherche').scroll_into_view_if_needed()
  p.get_by_role('button',name='Retirer le critère : Nouvelle-Aquitaine',exact=True).click()
  assert p.locator('#territoire-aides').input_value() == ''
  p.locator('#q-aides').fill('zzzaaaaaucunresultat')
  assert p.locator('#aides-vide').is_visible()
  p.get_by_role('button',name='Revoir toutes les fiches',exact=True).click()
  assert visible(p).count() == total
  for region in ['gua','guy','mar','may','reu']:
    p.locator('#territoire-aides').select_option(region)
    assert visible(p).evaluate_all("xs=>xs.every(x=>!x.dataset.territoire.split(' ').includes('metropole'))")
  reset(p)
  p.get_by_role('button',name='Subventions',exact=True).click()
  assert visible(p).evaluate_all("xs=>xs.every(x=>x.dataset.type==='subvention')")
  p.locator('.aides-parcours-details summary').click()
  p.locator('.aides-parcours a[href="#risques"]').click()
  assert visible(p).count()==total
  assert p.locator('#risques').is_visible()
  p.locator('details.aides-filtres').evaluate('(el)=>el.open=true')
  p.locator('#statut-aides').select_option('paiement')
  assert visible(p).evaluate_all("xs=>xs.every(x=>x.dataset.statut==='paiement')")
  reset(p)
  report['controles'].append('64 fiches, synonymes, nature subvention, exemples, région conservée, critères supprimables, focus résultats, zéro/reset, 5 DOM, étapes, paiement')
  ctx.close()

  for width,height in [(320,568),(390,844),(768,1024),(1440,900),(844,390)]:
    ctx,p=new(width=width,height=height)
    p.locator('#recherche').scroll_into_view_if_needed()
    p.screenshot(path=str(OUT/f'recherche-{width}.png'), animations='disabled')
    no_overflow(p)
    p.locator('.aides-filtres summary').click()
    assert p.locator('#type-aides').is_visible()
    no_overflow(p)
    p.get_by_role('button',name='Subventions',exact=True).click()
    p.locator('#form-aides [type=submit]').click()
    p.screenshot(path=str(OUT/f'resultats-{width}.png'), animations='disabled')
    no_overflow(p)
    report['rendus'].append({'page':'recherche','width':width,'height':height})
    ctx.close()
  ctx,p=new(js=False)
  assert visible(p).count()==total
  assert p.locator('noscript').inner_text()
  assert not p.locator('#recherche').is_visible()
  ctx.close()
  report['controles'].append('5 formats, critères avancés, absence de débordement, repli sans JS')

  # Invitation : variantes de pages et langues, lien réel, pas de média préchargé.
  for path,width,height in [('tarifs.html',390,844),('index.html',1440,900),('aide-investissement-chai-viticulture.html',320,568),('de/tarifs.html',768,1024),('en/index.html',844,390),('it/tarifs.html',390,844),('zh/tarifs.html',390,844)]:
    ctx,p=new(path,width,height)
    p.clock.run_for(21000)
    card=p.locator('.mc-cta:visible')
    assert card.count()==1, path
    assert p.locator('[data-mc-cta=visite]').get_attribute('href')==BASE+'/visite-interactive/'
    assert p.locator('[data-mc-cta=demo]').get_attribute('href').endswith('contact.html?objet=demo#formulaire')
    assert not p.locator('.mc-cta__objectif').count()
    for sel in ['.mc-cta__fermer','[data-mc-cta=visite]','[data-mc-cta=demo]']:
      box=p.locator(sel).bounding_box()
      assert box['height']>=43.9 and box['y']>=0 and box['y']+box['height']<=height, (sel,box)
    no_overflow(p)
    p.screenshot(path=str(OUT/f'invitation-{path.split("/")[0].replace(".html","")}-{width}.png'), animations='disabled')
    p.locator('[data-mc-cta=visite]').focus()
    p.keyboard.press('Escape')
    assert not card.count()
    assert p.evaluate("!document.activeElement.closest('.mc-cta')")
    report['rendus'].append({'page':path,'width':width,'height':height})
    ctx.close()
  report['controles'].append('invitation sur 7 pages/formats, cinq langues, croix/actions 44px, lien visite, Échap et focus')
  ctx,p=new('tarifs.html')
  p.clock.run_for(21000)
  assert p.evaluate("!(window.dataLayer||[]).some(x=>x.event==='cta_popup_affiche')")
  p.evaluate('window.monchaiConsent={audience:true}')
  p.locator('[data-mc-cta=visite]').click()
  p.wait_for_url('**/visite-interactive/')
  assert p.locator('h1').is_visible()
  assert p.evaluate("JSON.parse(sessionStorage.getItem('monchai_cta_contextes_v1')).pause")
  p.goto(BASE+'/tarifs.html')
  p.clock.run_for(21000)
  assert not p.locator('.mc-cta:visible').count()
  ctx.close()
  ctx,p=new('tarifs.html',consent=False)
  p.clock.run_for(21000)
  assert not p.locator('.mc-cta:visible').count()
  ctx.close()
  ctx,p=new()
  p.locator('#q-aides').focus()
  p.clock.run_for(21000)
  assert not p.locator('.mc-cta:visible').count()
  p.locator('#q-aides').blur()
  p.clock.run_for(1500)
  assert p.locator('.mc-cta:visible').count()==1
  ctx.close()
  ctx,p=new('tarifs.html',storage=False)
  p.clock.run_for(21000)
  assert p.locator('.mc-cta:visible').count()==1
  ctx.close()
  for path in ['contact.html','visite-interactive/']:
    ctx,p=new(path)
    p.clock.run_for(21000)
    assert not p.locator('.mc-cta:visible').count()
    ctx.close()
  report['controles'].append('clic visite et session, mesure consentie uniquement, cookies/saisie, stockage refusé, exclusions contact et visite')
  assert not report['erreurs_js'], report['erreurs_js']
  browser.close()
finally:
 server.shutdown()
 (OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
