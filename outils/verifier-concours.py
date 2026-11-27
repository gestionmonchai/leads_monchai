"""Recette de la simulation, sans aucune inscription réelle."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--sortie', type=Path, required=True)
parser.add_argument('--public', action='store_true')
args = parser.parse_args()
args.sortie.mkdir(parents=True, exist_ok=True)
root = Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = None
if args.public:
    base = 'https://monchai.fr'
else:
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
report = {'base': base, 'formats': [], 'controles': [], 'transmissions': []}
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width in (320, 390, 768, 1440):
            ctx = browser.new_context(viewport={'width': width, 'height': 980})
            p = ctx.new_page()
            errors = []
            p.on('pageerror', lambda e: errors.append(str(e)))
            p.on('request', lambda r: report['transmissions'].append(r.url) if r.method != 'GET' or not r.url.startswith(base + '/') else None)
            response = p.goto(base + '/concours/', wait_until='networkidle')
            assert response.status == 200
            expect(p.locator('h1')).to_be_visible()
            assert p.evaluate('document.documentElement.scrollWidth <= innerWidth')
            p.screenshot(path=str(args.sortie / f'accueil-{width}.png'), full_page=True)
            p.locator('button[type=submit]').click()
            expect(p.locator('#registration')).to_be_visible()
            assert not p.locator('#firstname').evaluate('(el)=>el.validity.valid')
            p.locator('#sample-profile').click()
            expect(p.locator('#news')).not_to_be_checked()
            p.locator('button[type=submit]').click()
            expect(p.locator('#ready')).to_be_visible()
            p.locator('#untimed').check()
            p.locator('#start').click()
            p.locator('#pause').click()
            expect(p.locator('#board')).not_to_be_visible()
            p.locator('#resume').click()
            # Apprentissage des positions, puis résolution comme un joueur.
            known = {}
            for i in range(0, 8, 2):
                for j in (i, i+1):
                    card = p.locator('.memory-card').nth(j)
                    card.click()
                    label = card.get_attribute('aria-label').split(' : ', 1)[1].split(', paire')[0]
                    known.setdefault(label, []).append(j)
                p.wait_for_timeout(1000)
            for positions in known.values():
                if not p.locator('#game').is_visible(): break
                if p.locator('.memory-card').nth(positions[0]).is_disabled(): continue
                for j in positions: p.locator('.memory-card').nth(j).click()
            expect(p.locator('#result')).to_be_visible()
            expect(p.locator('#result-pairs')).to_have_text('4 / 4')
            p.locator('#reveal').click()
            expect(p.locator('#surprise-open')).to_contain_text('aucun lot attribué')
            assert p.evaluate('document.documentElement.scrollWidth <= innerWidth')
            p.screenshot(path=str(args.sortie / f'resultat-{width}.png'), full_page=True)
            p.locator('#replay').click()
            expect(p.locator('#ready')).to_be_visible()
            if width == 390:
                p.locator('#untimed').uncheck()
                p.clock.install()
                p.locator('#start').click()
                p.clock.run_for(5000)
                p.locator('#pause').click()
                before = p.locator('#time').inner_text()
                p.clock.run_for(20000)
                assert p.locator('#time').inner_text() == before
                p.locator('#resume').click()
                p.get_by_role('button', name='Comment jouer ?').click()
                expect(p.locator('#help-dialog')).to_be_visible()
                p.keyboard.press('Escape')
                expect(p.locator('#pause-panel')).to_be_visible()
                p.locator('#resume').click()
                p.screenshot(path=str(args.sortie / 'jeu-390.png'), full_page=True)
                p.clock.run_for(31000)
                expect(p.locator('#result')).to_be_visible()
                expect(p.locator('#result-summary')).to_contain_text('temps est écoulé')
                report['controles'].extend(['chronomètre', 'pause sans perte de temps', 'aide et retour en pause', 'expiration'])
            p.locator('#restart').click() if p.locator('#result').is_visible() else p.locator('.back-registration').click()
            expect(p.locator('#registration')).to_be_visible()
            assert not errors, errors
            assert p.evaluate('localStorage.length === 0 && sessionStorage.length === 0')
            report['formats'].append(width)
            ctx.close()
        ctx = browser.new_context(java_script_enabled=False)
        p = ctx.new_page(); p.goto(base + '/concours/')
        expect(p.locator('#firstname')).to_be_disabled()
        expect(p.locator('button[type=submit]')).to_be_disabled()
        ctx.close(); browser.close()
        report['controles'].extend(['formulaire invalide', 'profil fictif', 'newsletter décochée', 'victoire', 'surprise fictive', 'rejeu', 'aucun stockage', 'aucune transmission', 'sans JavaScript'])
        assert not report['transmissions'], report['transmissions']
finally:
    if server: server.shutdown()
    (args.sortie / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
