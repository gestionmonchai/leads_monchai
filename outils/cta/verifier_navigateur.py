"""Recette des invitations contextuelles, hors réseau et sans envoi de formulaire."""
import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
args = argparse.ArgumentParser()
args.add_argument('--sortie', type=Path, required=True)
OUT = args.parse_args().sortie.resolve()
OUT.mkdir(parents=True, exist_ok=True)


class Silencieux(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Silencieux, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'
rapport = {'controles': [], 'rendus': [], 'messages': [], 'erreurs_js': []}
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def page_neuve(nom='tarifs.html', largeur=1440, consent=True, stockage=True):
            ctx = browser.new_context(viewport={'width': largeur, 'height': 900})
            ctx.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE) else route.abort())
            if consent:
                ctx.add_init_script("localStorage.setItem('monchai_cookie_consent', JSON.stringify({audience:false,tiers:false,ts:Date.now(),version:'2026-10-29-ga4'}));")
            if not stockage:
                ctx.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}});")
            page = ctx.new_page()
            page.on('pageerror', lambda e: rapport['erreurs_js'].append(str(e)))
            page.clock.install()
            page.goto(BASE + '/' + nom, wait_until='load')
            page.clock.pause_at(datetime.fromtimestamp((page.evaluate('Date.now()') + 1000) / 1000, tz=timezone.utc))
            return ctx, page

        def avance(page, ms=21000):
            page.clock.run_for(ms)

        def carte(page):
            return page.locator('.mc-cta:visible')

        contextes = {'declaration-recolte-2026.html': 'recolte', 'declaration-recolte-champagne-civc.html': 'recolte',
                     'tarifs.html': 'tarifs', 'vigne-vendanges.html': 'vigne', 'cave-vinification.html': 'cave',
                     'stocks-tracabilite.html': 'stocks', 'drm-vin-guide.html': 'drm',
                     'ventes-clients.html': 'ventes', 'mises-conditionnement.html': 'mises',
                     'cout-de-revient-bouteille-vin.html': 'couts', 'oenotourisme.html': 'oenotourisme',
                     'ia-au-service-de-mon-chai.html': 'assistant', 'changer-de-logiciel.html': 'migration',
                     'aide-assurance-recolte-viticulture.html': 'aides', 'fonctionnalites.html': 'generale'}
        for nom, attendu in contextes.items():
            ctx, page = page_neuve(nom)
            avance(page)
            assert carte(page).count() == 1, nom
            assert carte(page).get_attribute('data-campagne') == attendu, nom
            if page.locator('[data-mc-cta="essai"]').count():
                assert page.locator('[data-mc-cta="essai"]').get_attribute('href') == 'https://tester.monchai.fr'
            else:
                assert page.locator('[data-mc-cta="video"]').get_attribute('href') == BASE + '/index.html#nouveaute-ia'
            assert page.locator('[data-mc-cta="demo"]').get_attribute('href') == BASE + '/contact.html?objet=demo#formulaire'
            assert page.locator('.mc-cta__prefixe').is_visible()
            assert page.locator('#mcCtaNote').is_visible()
            assert 'gain' not in carte(page).inner_text().casefold()
            rapport['messages'].append({'page': nom, 'variante': carte(page).get_attribute('data-variante'),
                'titre': page.locator('#mcCtaTitre').inner_text(), 'objectif': page.locator('.mc-cta__objectif').inner_text(),
                'portee': page.locator('#mcCtaNote').inner_text()})
            ctx.close()
        rapport['controles'].append(f'{len(contextes)} rubriques et destinations')

        for nom, variante, objectif in [
            ('aide-distillation-crise-viticulture.html', 'aides-risques', 'temps'),
            ('aide-acja-viticulture.html', 'aides-installation', 'temps'),
            ('aide-pve-nouvelle-aquitaine-viticulture.html', 'aides-investissement', 'budget'),
            ('aide-apprentissage-ocapiat-viticulture.html', 'aides-emploi', 'temps'),
            ('aide-arrachage-viticulture.html', 'aides-transmission', 'temps'),
            ('aide-cab-viticulture.html', 'aides-transition', 'temps'),
            ('aide-promotion-tiers-viticulture.html', 'aides-commercial', 'temps'),
            ('actualites-reglementaires.html', 'reglementation', 'temps'),
            ('ressources.html', 'ressources', 'temps')]:
            ctx, page = page_neuve(nom)
            avance(page)
            assert carte(page).get_attribute('data-variante') == variante, nom
            assert carte(page).get_attribute('data-objectif') == objectif, nom
            assert 'Votre objectif : jusqu’à' in page.locator('.mc-cta__objectif').inner_text()
            if objectif == 'budget':
                assert page.locator('.mc-cta__valeur').inner_text() == '2 400 €'
                assert '200 €' in page.locator('.mc-cta__annuel').inner_text()
                assert 'par an' in page.locator('.mc-cta__unite').inner_text()
                assert 'économies' in page.locator('.mc-cta__unite').inner_text()
            else:
                assert 'gestion du domaine' in page.locator('.mc-cta__unite').inner_text()
                assert 'économisées par semaine' in page.locator('.mc-cta__unite').inner_text()
            rapport['messages'].append({'page':nom,'variante':variante,'titre':page.locator('#mcCtaTitre').inner_text(),
                'objectif':page.locator('.mc-cta__objectif').inner_text(),'portee':page.locator('#mcCtaNote').inner_text()})
            ctx.close()
        rapport['controles'].append('7 sous-thèmes d’aides, réglementation et ressources ; portée globale et calcul annuel')

        ctx, page = page_neuve('declaration-recolte-2026.html')
        avance(page)
        assert page.locator('.mc-cta__valeur').inner_text() == '30 s'
        assert 'défi' in page.locator('.mc-cta__prefixe').inner_text()
        assert 'dépôt officiel distinct' in page.locator('#mcCtaNote').inner_text()
        assert page.locator('[data-mc-cta="video"]').count() == 0
        ctx.close()
        rapport['controles'].append('récolte : défi explicite, pas de fausse vidéo ni assimilation au dépôt officiel')

        ctx, page = page_neuve('stocks-tracabilite.html')
        avance(page)
        page.evaluate('window.monchaiConsent={audience:true}')
        page.locator('[data-mc-cta="video"]').click()
        page.wait_for_url('**/index.html#nouveaute-ia')
        assert page.locator('#nouveaute-ia').is_visible()
        assert page.locator('#nouveaute-ia video source').get_attribute('src') == 'assets/video/monchai-mcp.mp4'
        page.locator('[data-diapo="1"]').click()
        assert page.locator('#nouveaute-notes').is_visible()
        page.evaluate("let a=document.createElement('a');a.href='index.html#nouveaute-ia';a.id='testRetourFilm';a.textContent='Retour film';a.style.cssText='display:block;min-height:44px';document.querySelector('.nouveautes-carrousel__navigation').insertAdjacentElement('afterend',a)")
        page.locator('#testRetourFilm').click()
        assert page.locator('#nouveaute-ia').is_visible()
        avance(page)
        assert carte(page).count() == 0
        ctx.close()
        rapport['controles'].append('vidéo MCP réelle, navigation vers la diapositive, même hash et pause des invitations')

        ctx, page = page_neuve()
        page.evaluate("window.scrollTo(0,document.body.scrollHeight);document.dispatchEvent(new MouseEvent('mouseout',{clientY:0,relatedTarget:null}));")
        avance(page, max(0, int(19500 - page.evaluate('performance.now()'))))
        assert carte(page).count() == 0
        avance(page, 1500)
        assert carte(page).count() == 1
        page.locator('.mc-cta__fermer').focus()
        page.keyboard.press('Escape')
        assert carte(page).count() == 0
        assert not page.evaluate("document.activeElement.closest('.mc-cta') !== null")
        page.reload(wait_until='load')
        avance(page)
        assert carte(page).count() == 0
        page.goto(BASE + '/vigne-vendanges.html', wait_until='load')
        avance(page)
        assert carte(page).count() == 1
        ctx.close()
        rapport['controles'].append('20 secondes strictes, scroll/sortie sans effet, Échap, focus, session par rubrique')

        ctx, page = page_neuve(consent=False)
        avance(page)
        assert carte(page).count() == 0
        page.locator('#cookieRefus').click()
        avance(page, 1500)
        assert carte(page).count() == 1
        assert page.evaluate("!(window.dataLayer||[]).some(x=>String(x.event).startsWith('cta_popup_'))")
        ctx.close()
        rapport['controles'].append('attente cookies, refus accepté, aucune mesure sans accord')

        for blocage in ('saisie', 'modale', 'onglet'):
            ctx, page = page_neuve()
            if blocage == 'saisie':
                page.evaluate("let x=document.createElement('input');x.id='testSaisie';document.body.prepend(x);x.focus()")
            elif blocage == 'modale':
                page.evaluate("let x=document.createElement('div');x.id='testModal';x.setAttribute('aria-modal','true');x.textContent='Test';document.body.append(x)")
            else:
                page.evaluate("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'})")
            avance(page)
            assert carte(page).count() == 0, blocage
            page.evaluate("document.querySelector('#testSaisie,#testModal')?.remove();delete document.visibilityState")
            avance(page, 1500)
            assert carte(page).count() == 1, blocage
            ctx.close()
        rapport['controles'].append('saisie, modale et onglet masqué retardent sans perdre la carte')

        for action in ('essai', 'demo'):
            ctx, page = page_neuve()
            avance(page)
            page.evaluate("window.monchaiConsent={audience:true};document.querySelectorAll('[data-mc-cta]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))")
            page.locator(f'[data-mc-cta="{action}"]').click()
            assert page.evaluate(f"window.dataLayer.some(x=>x.event==='cta_popup_{action}' && x.cta_campagne==='tarifs')")
            page.goto(BASE + '/vigne-vendanges.html', wait_until='load')
            avance(page)
            assert carte(page).count() == 0
            ctx.close()
        rapport['controles'].append('clics essai/démo : mesure consentie et suspension des autres invitations')

        for nom in ('contact.html', 'essai-gratuit.html', 'cgu.html', 'monchainotes.html'):
            ctx, page = page_neuve(nom)
            avance(page)
            assert carte(page).count() == 0, nom
            ctx.close()
        ctx, page = page_neuve(stockage=False)
        avance(page)
        assert carte(page).count() == 1
        ctx.close()
        rapport['controles'].append('exclusions et sessionStorage indisponible')

        for lang, libelle in [('en', 'Request a demo'), ('de', 'Vorführung anfragen'), ('it', 'Richiedi una dimostrazione'), ('zh', '预约演示')]:
            ctx, page = page_neuve(lang + '/tarifs.html', 390)
            avance(page)
            assert page.locator('[data-mc-cta="demo"]').inner_text().replace('→', '').strip() == libelle
            assert page.locator('[data-mc-cta="demo"]').get_attribute('href') == BASE + '/' + lang + '/contact.html?objet=demo#formulaire'
            ctx.close()
        rapport['controles'].append('4 langues secondaires et contact localisé')

        for largeur in (320, 390, 768, 1440):
            for nom in ('tarifs.html', 'declaration-recolte-2026.html'):
                ctx, page = page_neuve(nom, largeur)
                page.evaluate("document.querySelector('h1').setAttribute('tabindex','-1');document.querySelector('h1').focus()")
                avant = page.evaluate('document.activeElement.tagName')
                avance(page)
                assert page.evaluate('document.activeElement.tagName') == avant
                box = carte(page).bounding_box()
                assert box['x'] >= 0 and box['x'] + box['width'] <= largeur + 1, (nom, largeur, box)
                assert box['y'] >= 0 and box['y'] + box['height'] <= 901, box
                assert carte(page).evaluate('el=>el.scrollWidth<=el.clientWidth+1')
                for control in page.locator('.mc-cta a,.mc-cta button').all():
                    assert control.bounding_box()['height'] >= 44
                page.evaluate('document.activeElement.blur()')
                page.screenshot(path=str(OUT / f'{Path(nom).stem}-{largeur}.png'), animations='disabled')
                rapport['rendus'].append({'page': nom, 'largeur': largeur, 'boite': box})
                page.locator('.mc-cta__fermer').click()
                assert carte(page).count() == 0
                ctx.close()
        rapport['controles'].append('8 rendus, cibles 44 px, aucun focus volé et fermeture à la croix')
        for largeur, hauteur in ((320,568),(844,390)):
            ctx, page = page_neuve('tarifs.html', largeur)
            page.set_viewport_size({'width':largeur,'height':hauteur})
            avance(page)
            for control in page.locator('.mc-cta__fermer,.mc-cta__actions a').all():
                box=control.bounding_box()
                assert 0 <= box['y'] and box['y']+box['height'] <= hauteur+1, box
            page.locator('.mc-cta__contenu').evaluate('e=>e.scrollTop=e.scrollHeight')
            box=page.locator('.mc-cta__fermer').bounding_box()
            assert box['y'] >= 0
            page.screenshot(path=str(OUT / f'ecran-court-{largeur}x{hauteur}.png'))
            ctx.close()
        rapport['controles'].append('écrans courts : fermeture et actions toujours visibles pendant le défilement interne')
        assert not rapport['erreurs_js'], rapport['erreurs_js']
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    (OUT / 'verification.json').write_text(json.dumps(rapport, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(rapport, ensure_ascii=False))
