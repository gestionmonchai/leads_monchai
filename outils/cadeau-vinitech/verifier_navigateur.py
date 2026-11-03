"""Recette locale du cadeau : horloge, souris, tactile, clavier, consentement."""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument('--sortie', type=Path, required=True)
OUT = ap.parse_args().sortie.resolve()
OUT.mkdir(parents=True, exist_ok=True)


class Serveur(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        # Le navigateur peut interrompre une image au changement de page.
        pass


class Silencieux(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = Serveur(('127.0.0.1', 0), partial(Silencieux, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'
rapport = {'controles': [], 'apparitions': [], 'rendus': [], 'erreurs_js': []}
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def nouvelle(nom='tarifs.html', largeur=1440, hauteur=900, consent=True, touch=False, reduit=False, fin=False, deja_cta=False, stockage=True):
            ctx = browser.new_context(viewport={'width': largeur, 'height': hauteur}, has_touch=touch, is_mobile=touch, reduced_motion='reduce' if reduit else 'no-preference')
            ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
            if consent:
                ctx.add_init_script("localStorage.setItem('monchai_cookie_consent',JSON.stringify({audience:false,tiers:false,ts:Date.parse('2026-11-02T00:00:00Z'),version:'2026-10-29-ga4'}));")
            if deja_cta:
                ctx.add_init_script("sessionStorage.setItem('monchai_cta_contextes_v1',JSON.stringify({vus:['tarifs'],pause:true}));")
            if not stockage:
                ctx.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}})")
            page = ctx.new_page()
            page.on('pageerror', lambda e: rapport['erreurs_js'].append(str(e)))
            page.clock.install(time=datetime(2026, 12, 4, 12, tzinfo=timezone.utc) if fin else datetime(2026, 11, 3, 12, tzinfo=timezone.utc))
            page.goto(BASE + '/' + nom, wait_until='load')
            page.clock.pause_at(datetime.fromtimestamp((page.evaluate('Date.now()') + 1000) / 1000, tz=timezone.utc))
            page.evaluate("window.testApparition=null;new MutationObserver(()=>{if(window.testApparition===null&&document.querySelector('.mc-gift:not([hidden])'))window.testApparition=performance.now()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']})")
            return ctx, page

        def avance(page, ms=31000):
            page.clock.run_for(ms)

        def cadeau(page):
            return page.locator('.mc-gift:visible')

        def cliquer_clavier(page):
            cadeau(page).focus()
            page.keyboard.press('Enter')
            assert page.locator('.mc-gift-offer[open]').count() == 1

        positions = set()
        for _ in range(5):
            ctx, page = nouvelle()
            page.clock.run_for(max(0, int(24900 - page.evaluate('performance.now()'))))
            assert cadeau(page).count() == 0
            page.clock.run_for(max(0, int(30001 - page.evaluate('performance.now()'))))
            assert cadeau(page).count() == 1, page.evaluate("({date:new Date().toISOString(),perf:performance.now(),charge:window.monchaiCadeauVinitech,dom:document.querySelectorAll('.mc-gift').length,main:document.querySelector('main')?.getBoundingClientRect().toJSON(),erreurs:window.testApparition,scripts:[...document.scripts].map(s=>s.src).filter(s=>s.includes('cadeau'))})")
            instant = page.evaluate('testApparition')
            assert 25000 <= instant <= 30000, instant
            box = cadeau(page).bounding_box()
            positions.add((round(box['x']), round(box['y'])))
            assert box['width'] == box['height'] == 44
            assert cadeau(page).locator('svg').bounding_box()['width'] == 26
            rapport['apparitions'].append({'ms': instant, 'x': box['x'], 'y': box['y']})
            ctx.close()
        assert len(positions) > 1
        rapport['controles'].append('5 apparitions entre 25 et 30 secondes, positions variables, SVG 26 px et cible 44 px')

        ctx, page = nouvelle()
        avance(page)
        before = cadeau(page).bounding_box()
        page.mouse.move(before['x'] + 22, before['y'] + 22)
        cadeau(page).evaluate('el => {getComputedStyle(el).left;return Promise.all(el.getAnimations().map(a=>a.finished))}')
        avance(page, 400)
        after = cadeau(page).bounding_box()
        assert (before['x'], before['y']) != (after['x'], after['y']), (before, after)
        avance(page, 2600)
        cadeau(page).evaluate('el => {getComputedStyle(el).left;return Promise.all(el.getAnimations().map(a=>a.finished))}')
        stable = cadeau(page).bounding_box()
        page.mouse.move(stable['x'] + 22, stable['y'] + 22)
        avance(page, 400)
        assert cadeau(page).bounding_box() == stable
        page.mouse.click(stable['x'] + 22, stable['y'] + 22)
        assert page.locator('.mc-gift-offer[open]').count() == 1
        assert page.locator('.mc-cta:visible').count() == 0
        page.keyboard.press('Escape')
        assert page.locator('.mc-gift-offer[open]').count() == 0
        assert not page.evaluate("document.activeElement.closest('.mc-gift-offer,.mc-gift') !== null")
        page.reload(wait_until='load')
        avance(page)
        assert cadeau(page).count() == 0
        assert page.locator('.mc-cta:visible').count() == 0
        ctx.close()
        rapport['controles'].append('esquive réelle à la souris, stabilité après 2,5 secondes, clic, Échap, focus et non-répétition')

        for touch, reduit in ((True, False), (False, True)):
            ctx, page = nouvelle(largeur=390, hauteur=844, touch=touch, reduit=reduit)
            avance(page)
            before = cadeau(page).bounding_box()
            if touch:
                cadeau(page).tap()
            else:
                cadeau(page).click()
            assert page.locator('.mc-gift-offer[open]').count() == 1
            ctx.close()
        rapport['controles'].append('ouverture immédiate au toucher et avec mouvement réduit')

        ctx, page = nouvelle(deja_cta=True)
        avance(page)
        assert cadeau(page).count() == 1
        cliquer_clavier(page)
        assert page.locator('.mc-gift-offer__reserver').get_attribute('href') == 'https://mon-chai.neetocal.com/demo-vinitech'
        assert page.locator('.mc-gift-offer__reserver').get_attribute('target') == '_blank'
        for _ in range(8):
            page.keyboard.press('Tab')
            assert page.evaluate("document.activeElement.closest('.mc-gift-offer') !== null")
        page.locator('.mc-gift-offer__close').click()
        assert page.locator('.mc-gift-offer[open]').count() == 0
        ctx.close()
        rapport['controles'].append('clavier et focus piégé, lien dédié exact, cadeau indépendant des anciennes pop-ups déjà vues')

        for obstacle in ('cookies', 'saisie', 'modale', 'onglet'):
            ctx, page = nouvelle(consent=obstacle != 'cookies')
            if obstacle == 'saisie':
                page.evaluate("let x=document.createElement('input');x.id='testObstacle';document.body.prepend(x);x.focus()")
            elif obstacle == 'modale':
                page.evaluate("let x=document.createElement('div');x.id='testObstacle';x.setAttribute('aria-modal','true');x.textContent='Test';document.body.append(x)")
            elif obstacle == 'onglet':
                page.evaluate("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'})")
            avance(page)
            assert cadeau(page).count() == 0, obstacle
            if obstacle == 'cookies':
                page.locator('#cookieRefus').click()
            else:
                page.evaluate("document.querySelector('#testObstacle')?.remove();delete document.visibilityState")
            avance(page, 1500)
            assert cadeau(page).count() == 1, obstacle
            assert page.evaluate("!(window.dataLayer||[]).some(x=>String(x.event).startsWith('cadeau_vinitech'))")
            ctx.close()
        rapport['controles'].append('report cookies, saisie, modale, onglet ; refus de mesure respecté')

        ctx, page = nouvelle(stockage=False)
        avance(page)
        cliquer_clavier(page)
        ctx.close()
        ctx, page = nouvelle(fin=True)
        avance(page)
        assert cadeau(page).count() == 0
        ctx.close()
        for nom in ('contact.html', 'essai-gratuit.html', 'cgu.html', 'monchainotes.html'):
            ctx, page = nouvelle(nom)
            avance(page)
            assert cadeau(page).count() == 0, nom
            ctx.close()
        rapport['controles'].append('stockage indisponible, campagne expirée et pages exclues')

        ctx, page = nouvelle()
        page.evaluate("window.monchaiConsent={audience:true}")
        avance(page)
        cliquer_clavier(page)
        page.locator('.mc-gift-offer__reserver').evaluate("el=>el.addEventListener('click',e=>e.preventDefault())")
        page.locator('.mc-gift-offer__reserver').click()
        assert page.evaluate("['cadeau_vinitech_affiche','cadeau_vinitech_ouvert','cadeau_vinitech_reservation'].every(e=>window.dataLayer.some(x=>x.event===e))")
        ctx.close()
        rapport['controles'].append('événements consentis, réservation non envoyée pendant la recette')

        for nom, largeur, hauteur in [('tarifs.html', 320, 568), ('declaration-recolte-2026.html', 390, 844), ('vigne-vendanges.html', 768, 1024), ('index.html', 1440, 900)]:
            ctx, page = nouvelle(nom, largeur, hauteur)
            page.evaluate("document.querySelector('h1').setAttribute('tabindex','-1');document.querySelector('h1').focus()")
            avance(page)
            assert cadeau(page).count() == 1, (nom, largeur)
            assert page.evaluate("document.activeElement.tagName==='H1'")
            box = cadeau(page).bounding_box()
            assert 0 <= box['x'] <= largeur - 44 and 0 <= box['y'] <= hauteur - 44
            page.screenshot(path=str(OUT / f'cadeau-{largeur}.png'), animations='disabled')
            cliquer_clavier(page)
            offer = page.locator('.mc-gift-offer')
            box = offer.bounding_box()
            assert box['x'] >= 0 and box['x'] + box['width'] <= largeur + 1
            assert box['y'] >= 0 and box['y'] + box['height'] <= hauteur + 1
            assert offer.evaluate('el=>el.scrollWidth<=el.clientWidth+1')
            page.screenshot(path=str(OUT / f'invitation-{largeur}.png'), animations='disabled')
            rapport['rendus'].append({'page': nom, 'viewport': [largeur, hauteur], 'dialogue': box})
            ctx.close()
        rapport['controles'].append('4 viewports dont petit téléphone, placement et offre sans débordement ni vol de focus')
        assert not rapport['erreurs_js'], rapport['erreurs_js']
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    (OUT / 'verification.json').write_text(json.dumps(rapport, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(rapport, ensure_ascii=False))
