"""Construit le moteur et les cinq guides depuis des sources éditoriales locales.

python outils/salons/generer.py CHEMIN_SITE
Puis python outils/header/generer.py CHEMIN_SITE
"""
import argparse
from datetime import date
import html
import json
from pathlib import Path
import re

DATE = '2026-11-22'
GOALS = {'particuliers': 'Vendre aux particuliers', 'pros': 'Rencontrer des acheteurs pros', 'equipement': 'Visiter pour s’équiper'}
REGIONS = {'ara': 'Auvergne-Rhône-Alpes', 'bre': 'Bretagne', 'cvl': 'Centre-Val de Loire', 'ges': 'Grand Est', 'hdf': 'Hauts-de-France', 'idf': 'Île-de-France', 'nor': 'Normandie', 'naq': 'Nouvelle-Aquitaine', 'occ': 'Occitanie', 'pdl': 'Pays de la Loire', 'pac': 'Provence-Alpes-Côte d’Azur'}
STATUS = {'annoncees': 'Dates annoncées', 'a_reconfirmer': 'Dates à reconfirmer', 'non_publiees': 'Jours à confirmer'}
VI = 'https://www.vignerons-independants.com/'
e = html.escape


def date_fr(value):
    d = date.fromisoformat(value)
    months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
    return f'{d.day} {months[d.month - 1]} {d.year}'


def load_events(root):
    data = json.loads((root/'outils/salons/evenements.json').read_text(encoding='utf-8'))
    local = json.loads((root/'outils/salons/evenements-locaux.json').read_text(encoding='utf-8'))
    for event in data['evenements']:
        event['verifie'] = data['verifie']
    for event in local['evenements']:
        event.update(local=True, verifie=local['verifie'], objectif='particuliers',
            public='Visiteurs et amateurs de vin ; horaires et modalités d’accès dans la source officielle.',
            preparer='Avant de candidater, demandez le public visé, les conditions de stand et les possibilités de vente. Préparez ensuite vos références, vos quantités et le suivi des commandes.',
            inscription='Admission, disponibilité, tarif et échéance exposant à demander à l’organisateur. Aucun stand n’est réservé depuis Mon Chai.',
            exposant=event['sources'][0][1])
    data['evenements'].extend(local['evenements'])
    for event in data['evenements']:
        if event['id'].startswith('vi-'):
            event.update(
                resume=f'Une piste de vente directe aux particuliers à {event["ville"]}, dans le réseau des Vignerons Indépendants.',
                public='Rencontre avec les consommateurs et vente directe. Participation du domaine soumise aux modalités de l’organisateur.',
                participation='Pour exposer, vérifier les conditions du réseau et la procédure d’admission. Les nouveaux participants disposent d’une démarche de demande dédiée.',
                preparer='Préparez vos références, les quantités destinées à la dégustation et à la vente, puis le suivi des commandes.',
                inscription='Conditions, disponibilité et prix de participation à vérifier auprès de l’organisateur ; aucune date limite exposant n’est déduite ici.',
                exposant=VI+'services-et-avantages/exposez-sur-les-salons',
                sources=[['Page officielle de l’édition', VI+'agenda-des-salons/'+event['page']], ['Modalités exposants', VI+'services-et-avantages/exposez-sur-les-salons']],
                mots='vente directe grand public consommateurs exposer vignerons independants '+event['ville'])
            if event.get('conflit'):
                event['sources'].append(['Agenda général présentant un décalage', VI+'agenda-des-salons'])
                event['date_note']='Les jours ci-dessus reprennent les horaires de la page de l’édition. L’agenda général présente un décalage : faites reconfirmer les dates avant réservation.'
            elif event['id']=='vi-ponts-ce-2027':
                event['sources'].append(['Dates annoncées dans les événements', VI+'nos-evenements'])
        if event['debut']:
            assert date.fromisoformat(event['debut']) <= date.fromisoformat(event['fin'])
        assert event['objectif'] in GOALS and event['region'] in REGIONS
        assert event['statut_dates'] in STATUS
        assert bool(event['debut']) == bool(event['fin'])
        assert event['sources'] and all(url.startswith('https://') for _,url in event['sources'])
        if event.get('local'):
            assert event['departement'] and event['organisateur'] and event['participation']
    assert len({a['id'] for a in data['evenements']})==len(data['evenements'])
    return data


def render(root):
    data = load_events(root)
    events = sorted(data['evenements'], key=lambda a: (a['debut'] is None, a['debut'] or '', a['nom']))
    local_count = sum(bool(a.get('local')) for a in events)
    articles = json.loads((root/'outils/salons/articles.json').read_text(encoding='utf-8'))
    template = (root/'ressources.html').read_text(encoding='utf-8')
    header = re.sub(r' aria-current="page"', '', template[template.index('<body'):template.index('<main')])
    footer = re.search(r'<footer\b[^>]*>.*?</footer>',template,re.S)[0]
    scripts = template[template.index('</footer>')+len('</footer>'):template.index('</body>')]

    def page(slug,title,description,body,article=False,form=False):
        url='https://monchai.fr/'+slug
        schema={'@context':'https://schema.org','@type':'Article' if article else 'CollectionPage','name':title,'headline':title,'description':description,'url':url,'inLanguage':'fr','datePublished':DATE,'dateModified':DATE,'author':{'@type':'Organization','name':'Mon Chai','url':'https://monchai.fr/index.html#apropos'},'publisher':{'@type':'Organization','name':'Mon Chai','url':'https://monchai.fr/'},'mainEntityOfPage':url}
        if form:
            schema['@type']='WebPage'
        if not article and not form:
            schema['mainEntity']={'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':a['nom']+' '+str(a['edition']),'url':url+'#salon-'+a['id']} for i,a in enumerate(events)]}
        crumbs=[{'@type':'ListItem','position':1,'name':'Accueil','item':'https://monchai.fr/'},{'@type':'ListItem','position':2,'name':'Salons viticoles','item':'https://monchai.fr/salons-viticoles.html'}]
        if article: crumbs.append({'@type':'ListItem','position':3,'name':title,'item':url})
        if form: crumbs.append({'@type':'ListItem','position':3,'name':'Créer un salon','item':url})
        extra_styles='<link rel="stylesheet" href="assets/css/proposer-salon.css?v=20261122">' if form else ''
        head=f'''<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(title)} | Mon Chai</title><meta name="description" content="{e(description)}"><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="{url}">
<meta property="og:type" content="{'article' if article else 'website'}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{url}"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="Mon Chai"><meta property="og:image" content="https://monchai.fr/assets/img/pages/ventes-clients.jpg"><meta property="og:image:alt" content="Présentation Mon Chai, gestion du domaine viticole">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(description)}"><meta name="twitter:image" content="https://monchai.fr/assets/img/pages/ventes-clients.jpg">
<link rel="icon" type="image/png" href="assets/img/logo_mon_chai.png"><meta name="theme-color" content="#7B1E22"><link rel="stylesheet" href="assets/css/polices.css"><link rel="stylesheet" href="assets/css/header.css"><link rel="stylesheet" href="assets/css/actus.css"><link rel="stylesheet" href="assets/css/footer-commun.css?v=20261028-footer"><link rel="stylesheet" href="assets/css/subventions.css?v=20261121"><link rel="stylesheet" href="assets/css/salons.css?v=20261122-local">{extra_styles}
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':crumbs},ensure_ascii=False)}</script><script src="assets/js/analytics.js?v=20261029" defer></script></head>'''
        (root/slug).write_text(head+header+body+footer+scripts+('<script src="assets/js/antispam.js?v=20261122-honeypot" defer></script><script src="assets/js/proposer-salon.js?v=20261122" defer></script>' if form else ('' if article else '<script src="assets/js/salons.js?v=20261122-local" defer></script>'))+'</body></html>\n',encoding='utf-8',newline='\n')

    def guides(exclude=None):
        return '<div class="sl-guides">'+''.join(f'<a href="{a["slug"]}.html"><span>{e(a["categorie"])}</span><h3>{e(a["titre"])}</h3><p>{e(a["description"])}</p><strong>Lire le guide <span aria-hidden="true">→</span></strong></a>' for a in articles if a['slug']!=exclude)+'</div>'

    hub=f'''<main class="sv-page salons-page" id="contenu" tabindex="-1"><section class="sv-hero"><div class="sv-width"><nav class="sv-breadcrumb" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a><span aria-hidden="true">/</span><a href="ressources.html">Ressources</a><span aria-hidden="true">/</span><span>Salons viticoles</span></nav>
<div class="sl-hero"><div><p class="sv-kicker">Salons du vin · France · 2026–2027</p><h1>La bonne rencontre,<br><em>pour votre domaine.</em></h1><p class="sv-lead">Vendre vos vins, rencontrer des acheteurs ou comparer des équipements : choisissez votre objectif et explorez les salons viticoles, marchés de vignerons et rendez-vous associatifs avec leurs conditions et leurs sources.</p><div class="sv-actions"><a class="sv-button" href="#liste-salons" data-ouvrir-recherche>Trouver un salon <span aria-hidden="true">↓</span></a><a class="sv-text-link" href="proposer-salon.html">Créer un salon <span aria-hidden="true">＋</span></a><a class="sv-text-link" href="#guides-salons">Préparer ma participation</a></div><p class="sv-caption">{len(events)} éditions sélectionnées, dont {local_count} initiatives locales · Consultation libre · Sources officielles vérifiées le {date_fr(data['verifie'])}.</p></div><aside class="sl-hero-note" aria-label="Les trois objectifs"><p>Votre projet donne le cap.</p><ol><li><span>01</span> Vendre aux particuliers</li><li><span>02</span> Rencontrer des acheteurs pros</li><li><span>03</span> Visiter pour s’équiper</li></ol><p>Dates, public, admission : les repères utiles avant de vous engager.</p></aside></div></div></section>
<section class="sv-width sl-search" id="recherche-salons" aria-labelledby="titre-recherche-salons" hidden><form id="form-salons" role="search" aria-label="Rechercher un salon viticole"><p class="sv-kicker">Partons de votre objectif</p><h2 id="titre-recherche-salons">Que souhaitez-vous préparer ?</h2><fieldset class="sl-goals"><legend>Votre objectif</legend>'''
    for key,label in [('', 'Tout explorer'),*GOALS.items()]:
        hub+=f'<label><input type="radio" name="objectif" value="{key}"'+(' checked' if not key else '')+f'><span>{e(label)}</span></label>'
    hub+='''</fieldset><div class="sl-fields"><div><label for="region-salons">Dans quelle région ?</label><select id="region-salons"><option value="">Toutes les régions</option>'''+''.join(f'<option value="{k}">{e(v)}</option>' for k,v in REGIONS.items())+'''</select></div><div><label for="periode-salons">À quelle période ?</label><select id="periode-salons"><option value="">Toutes les périodes</option><option value="2026">Fin 2026</option><option value="2027-t1">Janvier à mars 2027</option><option value="2027-t2">Avril à juin 2027</option><option value="2027-s2">Juillet à décembre 2027</option><option value="incertain">Dates à confirmer</option></select></div><div class="sl-query"><label for="q-salons">Un nom, une ville, un département ?</label><input type="search" id="q-salons" maxlength="160" placeholder="Ex. : Morbihan, 56, Tours, bio…" autocomplete="off"></div></div><label class="sl-history"><input type="checkbox" id="locaux-salons" aria-describedby="aide-locaux-salons"> Événements locaux uniquement</label><p class="sv-caption" id="aide-locaux-salons">Salons associatifs et marchés portés par des vignerons. Cherchez aussi par département ou organisateur. Choisissez une région pour cibler votre déplacement.</p><label class="sl-history"><input type="checkbox" id="archives-salons"> Inclure les éditions passées</label><div id="criteres-salons" class="sl-chips" aria-label="Critères actifs" role="group" hidden></div><div class="sv-actions"><button type="submit" class="sv-button">Voir les salons <span id="quantite-salons" aria-hidden="true"></span><span aria-hidden="true">↓</span></button><button type="reset" class="sl-reset">Tout effacer</button></div><p class="sv-caption">Recherche sur cette page, sans envoi de vos mots. Une piste ne vaut ni admission ni réservation. Les prix et les disponibilités sont à vérifier auprès de l’organisateur.</p></form></section>
<noscript><p class="sv-width sl-noscript">Les filtres nécessitent JavaScript. Toutes les éditions et leurs sources restent consultables ci-dessous.</p></noscript>
<section class="sv-width sl-results" id="liste-salons" aria-labelledby="titre-resultats-salons"><div class="sl-results-title"><div><p class="sv-kicker">Votre sélection</p><h2 id="titre-resultats-salons" tabindex="-1">Les salons à explorer</h2></div><p id="nombre-salons" role="status" aria-live="polite" aria-atomic="true">'''+str(len(events))+''' éditions</p><a href="#recherche-salons" id="modifier-salons" hidden>Modifier ma recherche ↑</a></div><div id="salons-vide" class="sl-empty" hidden><h3>Aucune édition pour ces critères</h3><p>Retirez un critère ou élargissez la période. La sélection ne couvre pas tous les événements locaux.</p><p><a href="proposer-salon.html">Créer un salon</a> : envoyez votre proposition à notre équipe. Elle sera publiée ici après validation.</p><button type="reset" form="form-salons" class="sv-button">Effacer les critères</button><button type="button" id="inclure-archives-vides" class="sv-button" hidden>Inclure les éditions passées</button></div><div class="sl-cards">'''
    for a in events:
        ident=a['id']; dates=f'{date_fr(a["debut"])} au {date_fr(a["fin"])}' if a['debut'] else f'{a["edition"]} · jours à confirmer'
        text=' '.join([a['nom'],str(a['edition']),a['ville'],a['lieu'],REGIONS[a['region']],a['mots'],a.get('departement',''),a.get('organisateur',''),GOALS[a['objectif']]])
        note='<p class="sl-date-note">'+e(a['date_note'])+'</p>' if a.get('date_note') else ''
        location = ' · '.join(filter(None, [a['ville'], a.get('departement'), REGIONS[a['region']]]))
        organizer = f'<p class="sl-organizer"><strong>Organisation :</strong> {e(a["organisateur"])}</p>' if a.get('organisateur') else ''
        local_badge = '<p class="sl-local">Initiative locale</p>' if a.get('local') else ''
        hub+=f'''<article class="sl-card" id="salon-{ident}" data-salon="{ident}" data-local="{'oui' if a.get('local') else 'non'}" data-organisateur="{e(a.get('organisateur',''))}" data-annee="{a['edition']}" data-objectif="{a['objectif']}" data-region="{a['region']}" data-debut="{a['debut'] or ''}" data-fin="{a['fin'] or ''}" data-statut="{a['statut_dates']}" data-texte="{e(text)}"><p class="sl-goal">{e(GOALS[a['objectif']])}</p><h3>{e(a['nom'])} <span>{a['edition']}</span></h3><p class="sl-date">{e(dates)}</p><p class="sl-location">{e(location)}</p><p class="sl-badge sl-badge--{a['statut_dates']}">{e(STATUS[a['statut_dates']])}</p><p class="sl-past" hidden>Édition passée</p><p>{e(a['resume'])}</p>{local_badge}{organizer}<p class="sl-public"><strong>Public :</strong> {e(a['public'])}</p><details><summary>Préparer ma participation</summary><p><strong>Lieu :</strong> {e(a['lieu'])}</p><p><strong>Votre rôle :</strong> {e(a['participation'])}</p><p>{e(a['preparer'])}</p><p><strong>Inscription :</strong> {e(a['inscription'])}</p>{note}<p class="sv-caption">Tarif et éventuelle échéance exposant : à vérifier auprès de l’organisateur.</p><ul>'''+''.join(f'<li><a href="{e(url)}">{e(label)} ↗</a></li>' for label,url in a['sources'])+f'''</ul><a class="sl-official" href="{e(a['exposant'])}">Consulter les modalités officielles ↗</a></details><a class="sl-card-link" href="{e(a['sources'][0][1])}">Voir la source officielle <span aria-hidden="true">↗</span></a><p class="sl-checked">Vérifié le {date_fr(a['verifie'])}</p></article>'''
    hub+='''</div></section><section class="sv-width sv-section" id="guides-salons"><p class="sv-kicker">Du choix au retour au domaine</p><h2>Cinq guides pour préparer la suite.</h2>'''+guides()+'''</section><section class="sv-final"><div class="sv-width"><p class="sv-kicker">Les rencontres continuent dans la gestion</p><h2>Stocks, clients et ventes,<br>dans le quotidien du domaine.</h2><p>Découvrez comment Mon Chai accompagne la gestion viticole. Vos observations et vos besoins participent aux évolutions du logiciel.</p><a class="sv-button" href="visite-interactive/">Lancer la visite interactive <span aria-hidden="true">→</span></a></div></section><section class="sv-width sv-provenance" id="methode-salons"><h2>Sources et périmètre</h2><p>Première sélection française 2026–2027 publiée le 22 novembre 2026. La sélection comprend aussi des salons associatifs, marchés de vignerons et rencontres locales. Les sources sont celles des organisateurs, communes et offices de tourisme identifiés sur chaque fiche ; la sélection n’est pas exhaustive. « Initiative locale » décrit le porteur associatif ou viticole du rendez-vous, sans classement par taille. La région et le département correspondent au lieu de l’événement, y compris quand son nom évoque un autre territoire. Les dates à reconfirmer reprennent les horaires de la page de l’édition lorsqu’un agenda général présente un décalage. Les jours de SITEVI et d’INTERVIN restent à confirmer. Une contradiction dans l’annonce des Angles est également signalée. Une édition annuelle n’est jamais reconduite automatiquement au calendrier suivant. Consultez l’organisateur avant de réserver ou de candidater.</p><p>Les éditions terminées sont masquées par défaut dans le moteur et restent accessibles avec « Inclure les éditions passées ». Sans JavaScript, toutes les dates restent lisibles. Les fiches et les méthodes de préparation sont proposées par Mon Chai ; aucun formulaire d’inscription n’est envoyé depuis cette page.</p></section></main>'''
    page('salons-viticoles.html','Salons viticoles et événements locaux 2026–2027','Salons du vin, marchés de vignerons et événements associatifs locaux : recherchez par objectif, région, département et période. Dates, conditions et sources.',hub)

    proposal=(root/'outils/salons/formulaire.html').read_text(encoding='utf-8')
    page('proposer-salon.html','Créer un salon : proposer un événement viticole','Proposez votre salon du vin ou marché de vignerons à Mon Chai. Notre équipe vérifie votre proposition avant de la publier dans le moteur des salons.',proposal,form=True)

    for a in articles:
        content=(root/'outils/salons'/a['fichier']).read_text(encoding='utf-8')
        sections=re.findall(r'<section id="([^"]+)"><h2>(.*?)</h2>',content,re.S)
        toc='<nav class="sl-toc" aria-label="Sommaire du guide"><strong>Dans ce guide</strong><ol>'+''.join(f'<li><a href="#{i}">{t}</a></li>' for i,t in sections)+'</ol></nav>'
        body=f'''<main class="sv-page salons-article" id="contenu" tabindex="-1"><div class="sv-width sl-article"><nav class="sv-breadcrumb" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a><span aria-hidden="true">/</span><a href="salons-viticoles.html">Salons viticoles</a></nav><p class="sv-kicker">{e(a['categorie'])} · Guide pratique</p><h1>{e(a['titre']).replace(' :', chr(160)+':')}</h1><p class="sv-caption">Par <a href="index.html#apropos">Mon Chai</a> · Publié le <time datetime="{DATE}">{date_fr(DATE)}</time> · Méthode proposée, à adapter au domaine</p><p class="sv-lead">{e(a['description'])}</p>{toc}{content}<aside class="sl-article-next"><h2>Choisir votre prochaine rencontre</h2><p>Retrouvez les événements et leurs conditions dans notre sélection sourcée.</p><a class="sv-button" href="salons-viticoles.html#recherche-salons">Ouvrir le moteur de salons <span aria-hidden="true">→</span></a></aside><section class="sl-related"><h2>Pour poursuivre la préparation</h2>{guides(a['slug'])}</section></div></main>'''
        page(a['slug']+'.html',a['titre'],a['description'],body,True)

    paths=['salons-viticoles.html','proposer-salon.html']+[a['slug']+'.html' for a in articles]
    sitemap=(root/'sitemap.xml').read_text(encoding='utf-8')
    for path in paths:
        url='https://monchai.fr/'+path
        if f'<loc>{url}</loc>' not in sitemap: sitemap=sitemap.replace('</urlset>',f'<url><loc>{url}</loc><lastmod>{DATE}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>')
    resources=(root/'ressources.html').read_text(encoding='utf-8')
    card='<section class="serie-carte" id="dossier-salons"><p class="actu-date">Salons et préparation</p><h2><a href="salons-viticoles.html">Salons du vin et événements locaux : trouvez votre prochaine rencontre</a></h2><p>Explorez les salons associatifs et marchés de vignerons par département, région, période et objectif. Préparez ensuite votre participation avec nos cinq guides : visite, choix, budget, stocks et suivi des contacts.</p></section>\n'
    if 'id="dossier-salons"' not in resources:
        resources,count=re.subn(r'(?=<section\b[^>]*id="presentation-subventions")',lambda m:card,resources,count=1)
        assert count==1,'Emplacement de la carte des guides introuvable.'
    else:
        resources=re.sub(r'<section class="serie-carte" id="dossier-salons">.*?</section>\s*',lambda m:card,resources,count=1,flags=re.S)
    def collection(m):
        obj=json.loads(m[1])
        if obj.get('@type')!='CollectionPage': return m[0]
        items=obj.setdefault('mainEntity',{'@type':'ItemList','itemListElement':[]}).setdefault('itemListElement',[])
        if not any(x.get('url')=='https://monchai.fr/salons-viticoles.html' for x in items): items.insert(0,{'@type':'ListItem','name':'Salons viticoles et guides de préparation','url':'https://monchai.fr/salons-viticoles.html'})
        for i,item in enumerate(items): item['position']=i+1
        obj['dateModified']=DATE
        return '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False)+'</script>'
    resources=re.sub(r'<script type="application/ld\+json">(.*?)</script>',collection,resources,flags=re.S)
    (root/'ressources.html').write_text(resources,encoding='utf-8',newline='\n')
    sitemap=re.sub(r'(<url>\s*<loc>https://monchai.fr/ressources\.html</loc>.*?<lastmod>)[^<]+(</lastmod>)',lambda m:m[1]+DATE+m[2],sitemap,flags=re.S)
    (root/'sitemap.xml').write_text(sitemap,encoding='utf-8',newline='\n')
    print(f'{len(events)} éditions ; moteur et {len(articles)} guides générés.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site',type=Path)
    render(parser.parse_args().site.resolve())
