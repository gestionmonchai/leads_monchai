"""Recette locale du footer, des documents et du consentement. Aucun envoi réel."""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

OUT = Path(os.environ.get('MONCHAI_RECETTE_SORTIE', str(Path(__file__).resolve().parent)))
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('MONCHAI_RECETTE_BASE', 'http://127.0.0.1:8147')
rapport = {'rendus': [], 'parcours': [], 'erreurs': []}


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    context = browser.new_context()
    externes = []
    def filtrer(route):
        if route.request.url.startswith(BASE):
            route.continue_()
        else:
            externes.append(route.request.url)
            route.abort()
    context.route('**/*', filtrer)
    page = context.new_page()
    page.on('pageerror', lambda error: rapport['erreurs'].append(str(error)))
    pages = ['index.html', 'fonctionnalites.html', 'contact.html', 'cgu.html',
             'politique-confidentialite.html', 'actualites-reglementaires.html',
             'en/index.html', 'de/contact.html', 'it/faq.html', 'zh/tarifs.html',
             'en/politique-confidentialite.html', 'de/mentions-legales.html', 'zh/politique-confidentialite.html']
    for nom in pages:
        for largeur in (390, 1440):
            page.set_viewport_size({'width': largeur, 'height': 900})
            page.goto(BASE + '/' + nom, wait_until='networkidle')
            page.locator('.mc-site-footer').scroll_into_view_if_needed()
            mesure = page.locator('.mc-site-footer').evaluate('''el => {
              const r=el.getBoundingClientRect(), a=el.querySelector('nav a');
              return {x:r.x,right:r.right,width:r.width,font:parseFloat(getComputedStyle(a).fontSize),
              overflow:el.scrollWidth>el.clientWidth+1, links:el.querySelectorAll('a').length};
            }''')
            rapport['rendus'].append({'page': nom, 'largeur': largeur, **mesure})
            assert not mesure['overflow'] and mesure['right'] <= largeur + 2, (nom, largeur, mesure)
            assert mesure['font'] >= 12, (nom, largeur, mesure)
            assert page.locator('.mc-site-footer [data-cookies]').count() == 1
            assert page.locator('#cookieBanner').count() == 1
            assert page.locator('#cookieModal').count() == 1
            if nom == 'index.html':
                # Vue isolée du composant : retirer les éléments fixes de la capture.
                page.locator('.mc-site-footer').screenshot(path=str(OUT / f'footer-{largeur}.png'),
                    style='.site-header,.cookie{visibility:hidden!important}')

    for largeur in (320, 768):
        page.set_viewport_size({'width': largeur, 'height': 900})
        page.goto(BASE + '/index.html', wait_until='networkidle')
        assert page.locator('.mc-site-footer').evaluate('el => el.scrollWidth <= el.clientWidth + 1')
        rapport['rendus'].append({'page': 'index.html', 'largeur': largeur, 'overflow': False})

    # Première visite : aucun chargement des services facultatifs.
    externes.clear()
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.goto(BASE + '/index.html', wait_until='networkidle')
    assert not any(any(x in u for x in ('hs-scripts', 'googletagmanager', 'instagram.com/embed')) for u in externes), externes
    page.get_by_role('button', name='Refuser', exact=True).click()
    page.locator('.mc-site-footer [data-cookies]').click()
    assert not page.locator('#optAudience').is_checked()
    assert not page.locator('#optTiers').is_checked()
    page.locator('#optTiers').check()
    page.locator('#cookieEnregistrer').click()
    page.wait_for_timeout(300)
    assert not any('googletagmanager' in u or 'hs-scripts' in u for u in externes), externes
    rapport['parcours'].append('Sans choix, refus et Instagram seul : aucun chargement de mesure.')

    page.locator('.mc-site-footer [data-cookies]').click()
    page.locator('#optAudience').check()
    page.locator('#cookieEnregistrer').click()
    page.wait_for_timeout(300)
    assert any('hs-scripts' in u for u in externes)
    assert any('googletagmanager' in u for u in externes)
    rapport['parcours'].append('Audience acceptée : chargements HubSpot/GTM demandés, bloqués par la recette.')

    page.locator('.mc-site-footer [data-cookies]').click()
    externes.clear()
    with page.expect_navigation(wait_until='networkidle'):
        page.locator('#cookieToutRefus').click()
    choix = page.evaluate("JSON.parse(localStorage.getItem('monchai_cookie_consent'))")
    assert choix['audience'] is False and choix['tiers'] is False
    assert not any('googletagmanager' in u or 'hs-scripts' in u for u in externes)
    rapport['parcours'].append('Retrait : les deux catégories sont enregistrées à false.')

    # Lecture de contenu uniquement, liens autonomes conservés, focus natif.
    trigger = page.locator('.mc-site-footer a[href="cgu.html"]')
    trigger.click()
    dialog = page.locator('dialog[open]')
    dialog.locator('main.legal').wait_for()
    assert dialog.locator('.hd, .site-header, footer, iframe').count() == 0
    assert 'Conditions' in dialog.locator('#mc-legal-title').inner_text()
    assert dialog.locator('[data-legal-page]').get_attribute('target') == '_blank'
    for _ in range(12):
        page.keyboard.press('Tab')
        assert page.evaluate("!!document.activeElement.closest('dialog')")
    page.keyboard.press('Escape')
    assert page.evaluate("document.activeElement.getAttribute('href')") == 'cgu.html'
    rapport['parcours'].append('CGU : contenu seul, Échap et restitution du focus.')

    # Une lecture légale depuis le formulaire ne ferme pas le formulaire parent.
    page.evaluate('window.declencherFormulaireBeta()')
    page.locator('#modalBeta a[href="politique-confidentialite.html"]').click()
    dialog.locator('main.legal').wait_for()
    page.keyboard.press('Escape')
    assert page.locator('#modalBeta').is_visible()
    page.locator('#modalBeta .modal__fermer').click()
    rapport['parcours'].append('Lecture depuis un formulaire : Échap ferme le document seul.')

    page.locator('.mc-site-footer a[href$="#vos-droits"]').click()
    dialog.locator('#vos-droits').wait_for()
    assert dialog.locator('#vos-droits').is_visible()
    dialog.screenshot(path=str(OUT / 'document-1440.png'))
    page.keyboard.press('Escape')

    # Erreur de chargement explicite et lien de secours utilisable.
    page.route('**/cgu.html', lambda route: route.fulfill(status=503, body='indisponible'))
    trigger.click()
    dialog.get_by_text('Le document ne peut pas être chargé.', exact=False).wait_for()
    assert dialog.locator('[data-legal-page]').get_attribute('href').endswith('/cgu.html')
    page.keyboard.press('Escape')
    page.unroute('**/cgu.html')
    rapport['parcours'].append('Erreur 503 : message et lien vers la page complète conservés.')

    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('.mc-site-footer a[href="politique-confidentialite.html"]').click()
    dialog.locator('main.legal').wait_for()
    assert dialog.bounding_box()['width'] <= 390
    dialog.screenshot(path=str(OUT / 'document-390.png'))
    page.keyboard.press('Escape')

    # L'ouverture de Contact seule ne télécharge plus le SDK d'envoi.
    externes.clear()
    page.goto(BASE + '/contact.html', wait_until='networkidle')
    assert not any('emailjs' in u for u in externes)
    rapport['parcours'].append('Contact : aucun SDK EmailJS chargé avant une soumission.')
    page.locator('#prenom').fill('Recette')
    page.locator('#nom').fill('Locale')
    page.locator('#email').fill('recette@example.invalid')
    page.locator('#objet').select_option('autre')
    page.locator('#message').fill('Vérification locale sans envoi réel.')
    page.locator('#consent').check()
    page.wait_for_timeout(2100)
    page.locator('#submit-btn').click()
    page.locator('#form-message').get_by_text('Service momentanément indisponible.', exact=False).wait_for()
    assert page.locator('#submit-btn').is_enabled()
    # SDK simulé et envoi simulé : le navigateur ne contacte pas EmailJS.
    page.route('**/npm/@emailjs/browser@4/dist/email.min.js', lambda route: route.fulfill(
        content_type='application/javascript', body='window.emailjs={init:function(){},send:function(){return Promise.resolve({status:200});}};'))
    page.locator('#submit-btn').click()
    page.locator('#ctSucces').wait_for()
    rapport['parcours'].append('Contact : panne SDK réessayable et succès avec envoi entièrement simulé.')
    page.goto(BASE + '/contact.html?objet=newsletter', wait_until='networkidle')
    assert not page.locator('#newsletter').is_checked()
    rapport['parcours'].append('Newsletter : un lien présélectionnant l’objet ne coche pas l’accord.')
    # Le stockage malformé n'autorise aucun traceur facultatif.
    page.evaluate("localStorage.setItem('monchai_cookie_consent', JSON.stringify({ts:Date.now(),audience:'oui',tiers:false}))")
    externes.clear()
    page.goto(BASE + '/index.html', wait_until='networkidle')
    assert not any('googletagmanager' in u or 'hs-scripts' in u for u in externes)
    rapport['parcours'].append('Choix malformé : aucun consentement déduit de chaînes de caractères.')
    # Les liens restent de vrais liens en l'absence de JavaScript.
    sans_js = browser.new_context(java_script_enabled=False)
    sans_js.route('**/*', filtrer)
    simple = sans_js.new_page()
    simple.goto(BASE + '/index.html')
    simple.locator('.mc-site-footer a[href="politique-confidentialite.html"]').click()
    simple.wait_for_url('**/politique-confidentialite.html')
    assert simple.locator('main.legal h1').is_visible()
    rapport['parcours'].append('Sans JavaScript : accès autonome à la politique depuis le footer.')
    browser.close()

OUT.joinpath('recette-navigateur.json').write_text(json.dumps(rapport, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps({'rendus': len(rapport['rendus']), 'parcours': rapport['parcours'], 'erreurs': rapport['erreurs']}, ensure_ascii=False))
assert not rapport['erreurs'], rapport['erreurs']
