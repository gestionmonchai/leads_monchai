"""Raccorde GA4 au bandeau existant, sans charger de tiers à la génération."""
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

ROOT = Path(sys.argv[1]).resolve()
ID = 'G-2VZ6WQSB52'
pages = [*ROOT.glob('*.html'), *(p for directory in ['en','de','it','zh','developpeurs'] for p in (ROOT/directory).glob('*.html'))]
count = 0
for page in pages:
    s = page.read_text(encoding='utf-8-sig')
    relative = '../' if page.parent != ROOT else ''
    has_gtm = 'GTM-NDSQV6T7' in s or bool(re.search(r'<script[^>]*src="[^"]*analytics.js[^>]*data-gtm', s))
    def script(match):
        body = match[0]
        if ('monchaiChargerGtm' in body or 'GTM-NDSQV6T7' in body or
            ('gtag(' in body and "'consent'" in body) or
            ('analytics.js' in body and 'src=' in body)):
            return ''
        return body
    s = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', script, s, flags=re.I)
    s = re.sub(r'<noscript\b[^>]*>[\s\S]*?googletagmanager\.com/ns\.html[\s\S]*?</noscript>', '', s, flags=re.I)
    tag = '<script src="' + relative + 'assets/js/analytics.js?v=20261029"' + (' data-gtm' if has_gtm else '') + '></script>'
    s = s.replace('</head>', tag + '\n</head>', 1)
    if 'consent.js' not in s:
        s = s.replace('</body>', '<script src="' + relative + 'consent.js?v=20261029-ga4"></script>\n</body>')
    else:
        s = re.sub(r'(src="(?:\.\./)?consent\.js)(?:\?[^"]*)?"', r'\1?v=20261029-ga4"', s)
    # Retirer les commentaires anciens dont le comportement n'est plus inline.
    s = re.sub(r'<!-- Mode consentement de Google[\s\S]*?-->', '', s)
    s = re.sub(r'<!-- Google Tag Manager,[\s\S]*?-->', '', s)
    s = s.replace('<!-- End Google Tag Manager -->', '')
    page.write_text(s, encoding='utf-8', newline='\n')
    count += 1

path = ROOT/'consent.js'
s = path.read_text(encoding='utf-8')
translations = {
 'HubSpot et les balises de mesure gérées avec Google Tag Manager nous aident à comprendre l’usage du site.': 'Google Analytics 4, HubSpot et les balises de mesure gérées avec Google Tag Manager nous aident à comprendre l’usage du site. Ils sont chargés seulement après votre accord.',
 'HubSpot and measurement tags managed with Google Tag Manager help us understand how the site is used.': 'Google Analytics 4, HubSpot and measurement tags managed with Google Tag Manager help us understand how the site is used. They load only after your consent.',
 'HubSpot und über Google Tag Manager verwaltete Mess-Tags helfen uns, die Nutzung der Website zu verstehen.': 'Google Analytics 4, HubSpot und über Google Tag Manager verwaltete Mess-Tags helfen uns, die Nutzung der Website zu verstehen. Sie werden erst nach Ihrer Zustimmung geladen.',
 'HubSpot e i tag di misurazione gestiti con Google Tag Manager ci aiutano a capire come viene usato il sito.': 'Google Analytics 4, HubSpot e i tag di misurazione gestiti con Google Tag Manager ci aiutano a capire come viene usato il sito. Vengono caricati solo dopo il consenso.',
 'HubSpot 及通过 Google Tag Manager 管理的统计标签帮助我们了解网站的使用情况。': 'Google Analytics 4、HubSpot 及通过 Google Tag Manager 管理的统计标签帮助我们了解网站的使用情况。它们仅在您同意后加载。',
}
for old,new in translations.items():
    s=s.replace(old,new)
# À la racine et dans un dossier de langue, conserver le lien local actuel.
# L'espace développeurs renvoie à la politique générale, sans lien cassé.
if 'var politiqueCookies =' not in s:
    s=s.replace('  var HTML_BANNIERE =', "  var politiqueCookies = /^\\/(en|de|it|zh)\\//.test(location.pathname) ? 'politique-confidentialite.html' : '/politique-confidentialite.html';\n  var HTML_BANNIERE =",1)
    s=s.replace("'<a href=\"politique-confidentialite.html\">' + T.plus", "'<a href=\"' + politiqueCookies + '\">' + T.plus")
path.write_text(s,encoding='utf-8',newline='\n')

paragraph = '''<section id="google-analytics"><h2>Google Analytics 4 et votre choix de cookies</h2><p>Le site public utilise le flux Google Analytics 4 <strong>G-2VZ6WQSB52</strong> pour mesurer la fréquentation et la consultation des pages, sur la base de votre consentement à « Mesure d’audience ». Sans ce choix, la balise Google Analytics n’est pas chargée. Les autorisations publicitaires restent refusées par cette intégration.</p><p>Le chargement peut transmettre à Google des données techniques de connexion et de navigation. L’adresse de page configurée par le site exclut ses paramètres de recherche et son fragment. Les cookies de mesure peuvent comprendre <code>_ga</code> et <code>_ga_2VZ6WQSB52</code> ; cette intégration fixe leur durée maximale à 395 jours, sans prolongation automatique. Votre choix de consentement reste conservé six mois. Les durées de conservation des données dans la propriété Google Analytics dépendent de ses réglages et doivent être vérifiées auprès de l’équipe.</p><p>Vous pouvez refuser aussi facilement qu’accepter, ou retirer votre accord avec « Gérer mes cookies ». Le retrait désactive les envois de cette balise, efface les cookies Google Analytics accessibles au site et recharge la page pour arrêter les scripts déjà chargés. Les données déjà transmises restent soumises à vos droits et aux obligations du destinataire. Google peut impliquer des traitements hors de l’Espace économique européen ; <a href="https://policies.google.com/privacy?hl=fr">consultez sa politique de confidentialité</a> et contactez contact@monchai.fr pour les garanties et réglages applicables.</p></section>'''
for directory in ['', 'en', 'de', 'it', 'zh']:
    p=ROOT/directory/'politique-confidentialite.html'
    s=p.read_text(encoding='utf-8')
    if 'id="google-analytics"' not in s:
        s=s.replace('</main>',paragraph+'</main>',1)
    s=s.replace('HubSpot et, sur les pages concernées, Google Tag Manager sont chargés après votre accord à cette catégorie.', 'Google Analytics 4, HubSpot et, sur les pages concernées, Google Tag Manager sont chargés après votre accord à cette catégorie.')
    s=s.replace('HubSpot and measurement tags managed with Google Tag Manager load after audience consent.', 'Google Analytics 4, HubSpot and measurement tags managed with Google Tag Manager load after audience consent.')
    p.write_text(s,encoding='utf-8',newline='\n')
print(f'GA4 raccordé au consentement sur {count} pages ; paramètres et politiques mis à jour.')
