"""Recette de la page autonome et du maintien de l'URL historique, sans tiers."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import threading
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--sortie', type=Path, required=True)
OUT = parser.parse_args().sortie.resolve()
OUT.mkdir(parents=True, exist_ok=True)
SLUG = 'subventions-viticulture.html'
report = {'controles': [], 'rendus': [], 'erreurs_js': []}

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
    def copyfile(self, source, output):
        try: super().copyfile(source, output)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'

try:
    new_html = (ROOT / SLUG).read_text(encoding='utf-8')
    old_html = (ROOT / 'aides-vignerons.html').read_text(encoding='utf-8')
    for slug, source in [(SLUG, new_html), ('aides-vignerons.html', old_html)]:
        assert f'<link rel="canonical" href="https://monchai.fr/{slug}">' in source
        assert not re.search(r'http-equiv=["\']refresh', source, re.I)
        assert not re.search(r'<meta[^>]+name="robots"[^>]+noindex', source)
    assert '@@' not in new_html
    assert 'subventions-viticulture.html' in old_html
    tree = ET.parse(ROOT / 'sitemap.xml')
    urls = [x.text for x in tree.findall('.//{*}loc')]
    for slug in [SLUG, 'aides-vignerons.html']:
        assert urls.count(f'https://monchai.fr/{slug}') == 1
    report['controles'].append('deux URL canoniques propres, deux entrées sitemap, aucune migration, refresh ou noindex')

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        def new(width=1440, height=1000, js=True):
            context = browser.new_context(viewport={'width':width, 'height':height}, java_script_enabled=js, reduced_motion='reduce')
            context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
            context.add_init_script("localStorage.setItem('monchai_cookie_consent', JSON.stringify({audience:false,tiers:false,ts:Date.now(),version:'2026-10-29-ga4'}));")
            page = context.new_page()
            page.on('pageerror', lambda e: report['erreurs_js'].append(str(e)))
            if js: page.clock.install()
            page.goto(BASE + '/' + SLUG, wait_until='load')
            return context, page

        for width, height in [(320,568),(390,844),(768,1024),(1440,1000),(844,390)]:
            ctx, page = new(width,height)
            assert page.locator('.sv-page h1').count() == 1
            assert page.locator('.sv-projects>a').count() == 6
            assert page.locator('.sv-faq details').count() == 6
            assert page.locator('.sv-page').inner_text().count('Mon Chai') >= 5
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(OUT/f'page-{width}.png'), animations='disabled')
            if width in [390,1440]:
                page.screenshot(path=str(OUT/f'page-complete-{width}.png'), full_page=True, animations='disabled')
            # Le menu partagé conduit à la présentation et au moteur directement.
            if page.locator('.hd__burger').is_visible():
                page.locator('.hd__burger').click()
                page.clock.run_for(400)
            resources_button = page.locator('[aria-controls="sous-menu-ressources"]')
            if resources_button.get_attribute('aria-expanded') != 'true': resources_button.click()
            page.clock.run_for(400)
            assert page.locator('#sous-menu-ressources a[href="'+SLUG+'"]').is_visible()
            assert page.locator('#sous-menu-ressources a[href="aides-vignerons.html"]').inner_text() == 'Moteur de subventions'
            page.keyboard.press('Escape')
            if page.locator('.hd.est-deploye').count(): page.locator('.hd__burger').click()
            # FAQ native, utilisable au clavier.
            question = page.locator('.sv-faq summary').first
            question.focus()
            page.keyboard.press('Enter')
            assert page.locator('.sv-faq details').first.get_attribute('open') is not None
            assert page.locator('.sv-faq details').first.locator('p').is_visible()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            # Navigation réelle de la page autonome vers le moteur existant.
            page.locator('.sv-hero .sv-button').click()
            page.wait_for_url('**/aides-vignerons.html#recherche')
            assert page.locator('#form-aides').is_visible()
            page.locator('#q-aides').fill('subvention chai')
            assert page.locator('[data-aide]:visible').count() > 0
            assert page.locator('[data-aide]:visible').evaluate_all("xs=>xs.every(x=>x.dataset.type==='subvention')")
            page.locator('#presentation-subventions-moteur a').click()
            page.wait_for_url('**/'+SLUG)
            report['rendus'].append({'largeur':width,'hauteur':height})
            ctx.close()
        report['controles'].append('5 formats sans débordement, header, FAQ clavier, parcours page vers moteur, recherche et retour')

        ctx,page = new(js=False)
        assert page.locator('.sv-page h1').count()==1
        assert page.locator('#demarche').is_visible() and page.locator('#monchai').is_visible()
        page.locator('.sv-faq summary').first.click()
        assert page.locator('.sv-faq details').first.locator('p').is_visible()
        assert page.locator('.sv-hero .sv-button').get_attribute('href') == 'aides-vignerons.html#recherche'
        ctx.close()
        ctx,page = new()
        page.clock.run_for(21000)
        assert page.url == BASE+'/'+SLUG
        assert page.locator('[data-mc-cta="visite"]').count() == 1
        assert page.locator('.mc-cta').get_attribute('data-campagne') == 'aides'
        ctx.close()
        report['controles'].append('contenu propre lisible sans JS, FAQ native, aucune redirection automatique après 21 secondes')
        assert not report['erreurs_js'], report['erreurs_js']
        browser.close()
finally:
    server.shutdown()
    (OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
