"""Génère des pages statiques ; aucun appel réseau ni formulaire de droit.

Usage : python generer.py CHEMIN_SITE
Le fichier contenus.py constitue le registre éditorial ; conserver les deux
dans outils/aides pour une mise à jour datée puis régénération explicite.
"""
import html
import json
import math
import re
import sys
from pathlib import Path
from contenus import AIDES, DATE, ETAPES, REGIONS, STATUTS, TYPES

ROOT=Path(sys.argv[1]).resolve()
AIDES.sort(key=lambda a:list(ETAPES).index(a['etape']))
def e(t): return html.escape(str(t),quote=True)
def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s):
 p=ROOT/p
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(s,encoding='utf-8',newline='\n')
REG=dict((r[0],r[1]) for r in REGIONS)
def territoire(a):
 if a['territoire']==['fr']: return 'France — conditions locales et statut à vérifier'
 if a['territoire']==['metropole']: return 'Métropole — cadre territorial à vérifier, Corse comprise selon dispositif'
 return ', '.join(REG[r] for r in a['territoire'])

# Ajouter une porte d'entrée à tous les footers, en conservant leur identité par langue.
for directory in ['', 'en', 'de', 'it', 'zh']:
 for p in (ROOT/directory).glob('*.html'):
  s=p.read_text(encoding='utf-8-sig')
  rel='../' if directory else ''
  link=f'<a href="{rel}aides-vignerons.html"'+(' lang="fr" hreflang="fr"' if directory else '')+'>Aides aux vignerons'+(' · France (FR)' if directory else '')+'</a>'
  def update_footer(m):
   f=m[0]
   if 'aides-vignerons.html' not in f:
    f=re.sub(r'(<a href="(?:\.\./)?(?:ressources|actualites-reglementaires).html">[^<]+</a>)',lambda x:x[0]+link,f,count=1)
   return f
  s=re.sub(r'<footer\b[^>]*>[\s\S]*?</footer>',update_footer,s)
  # Accès direct depuis le menu Ressources français, sans transformer les liens de texte.
  cut=s.find('<main')
  if not directory and cut>=0:
   before=s[:cut]
   if 'aides-vignerons.html' not in before:
    before=before.replace('<a href="s-installer-en-viticulture.html">S’installer en viticulture</a>', '<a href="s-installer-en-viticulture.html">S’installer en viticulture</a>'+link,1)
   s=before+s[cut:]
  p.write_text(s,encoding='utf-8',newline='\n')

template=read('s-installer-en-viticulture.html')
body_header=template[template.index('<body'):template.index('<main')]
footer=re.search(r'<footer\b[^>]*>[\s\S]*?</footer>',template)[0]
scripts='<script src="assets/js/header.js"></script><script src="consent.js?v=20261028-footer"></script><script src="assets/js/documents-legaux.js?v=20261028-footer" defer></script>'

def page(slug,title,description,content,collection=False):
 header=body_header.replace('href="s-installer-en-viticulture.html" aria-current="page"',f'href="{slug}" aria-current="page"')
 schema={'@context':'https://schema.org','@type':'CollectionPage' if collection else 'Article','name':title,'headline':title,'description':description,'url':'https://monchai.fr/'+slug,'inLanguage':'fr','datePublished':DATE,'dateModified':DATE,'author':{'@type':'Organization','name':'Mon Chai'}}
 if collection:
  schema['mainEntity']={'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':a['titre'],'url':'https://monchai.fr/'+a['article']} for i,a in enumerate(AIDES)]}
 else: schema['wordCount']=len(re.sub('<[^>]+>',' ',content).split())
 head=f'''<!DOCTYPE html><html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)} | Mon Chai</title><meta name="description" content="{e(description)}">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="https://monchai.fr/{slug}">
<meta property="og:type" content="{'website' if collection else 'article'}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="https://monchai.fr/{slug}"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="Mon Chai"><meta property="og:image" content="https://monchai.fr/assets/img/pages/vigne-vendanges.jpg"><meta property="og:image:alt" content="Vignes du domaine">
<link rel="icon" type="image/png" href="assets/img/logo_mon_chai.png"><meta name="theme-color" content="#7B1E22">
<link rel="stylesheet" href="assets/css/polices.css"><link rel="stylesheet" href="assets/css/header.css"><link rel="stylesheet" href="assets/css/actus.css"><link rel="stylesheet" href="assets/css/couts-editorial.css"><link rel="stylesheet" href="assets/css/footer-commun.css?v=20261028-footer"><link rel="stylesheet" href="assets/css/aides.css?v=20261028">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace('</','< /')}</script></head>'''
 return head+header+content+footer+scripts+('<script src="assets/js/aides.js?v=20261028" defer></script>' if collection else '')+'</body></html>\n'

def source(a,index=0):
 nom,url=a['sources'][min(index,len(a['sources'])-1)]
 return f'<a href="{e(url)}">{e(nom)}</a>'

def detail(a):
 sections=[('beneficiaires','Qui peut examiner ce dispositif ?',a['beneficiaires'],0),('soutien','Quel soutien et quel effet financier ?',a['soutien'],0),('demarche','Comment préparer la démarche ?',a['demarche'],None),('vigilance','Cumul, calendrier et points de vigilance',a['vigilance'],1),('cas-domaine','L’appliquer au projet du domaine',a['exemple'],None)]
 text=' '.join(a[k] for k in ('resume','beneficiaires','soutien','demarche','vigilance','exemple'))
 minutes=max(3,math.ceil((len(text.split())+180)/220))
 c=f'''<main class="article article-couts aide-detail" id="contenu" tabindex="-1">
<nav class="article__ariane" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a> › <a href="aides-vignerons.html">Aides aux vignerons</a> › {e(ETAPES[a['etape']][1])}</nav>
<p class="aide-kicker">{e(ETAPES[a['etape']][1])} · {e(TYPES[a['type']])}</p>
<h1>{e(a['titre'])}</h1><p class="aide-meta">Par Mon Chai · Publié et vérifié le <time datetime="{DATE}">28 octobre 2026</time> · {minutes} min de lecture</p><p class="article__chapo">{e(a['resume'])}</p>
<aside class="aide-repere" aria-label="Situation vérifiée du dispositif"><p class="aide-statut aide-statut--{a['statut']}">{e(STATUTS[a['statut']])}</p><p><strong>Calendrier :</strong> {e(a['calendrier'])}</p><p><strong>Territoire :</strong> {e(territoire(a))}</p><p><strong>Financeur / gestionnaire :</strong> {e(a['financeur'])}</p><p>Situation au 28 octobre 2026. Confirmez l’ouverture et les règles actuelles auprès de l’instructeur avant toute démarche. <a href="#sources">Lire les sources primaires</a>.</p></aside>
<nav class="article-sommaire" aria-label="Sommaire de la fiche"><strong>Dans cette fiche</strong><ol>'''+''.join(f'<li><a href="#{i}">{e(t)}</a></li>' for i,t,_,_ in sections)+'''<li><a href="#preparer">Les questions à emporter</a></li><li><a href="#sources">Sources et date de contrôle</a></li></ol></nav>'''
 for ident,titre,par,index in sections:
  c+=f'<section aria-labelledby="{ident}"><h2 id="{ident}">{e(titre)}</h2><p>{e(par)}</p>'
  if index is not None: c+=f'<p class="aide-reference">Référence : {source(a,index)}. Le texte applicable et la décision individuelle précisent les conditions.</p>'
  else: c+='<p class="aide-reference">Méthode de préparation proposée par Mon Chai ; elle ne remplace pas la notice du dispositif.</p>'
  c+='</section>'
 c+='''<section aria-labelledby="preparer"><h2 id="preparer">Les questions à emporter au rendez-vous</h2>
<ul><li>Mon statut, mon activité et la localisation du projet entrent-ils dans ce dispositif et cette campagne ?</li><li>Quelle démarche doit précéder la signature d’un devis, la réalisation d’une prestation ou une modification de mon activité ?</li><li>Quels montants sont admissibles, quelles pièces faut-il produire et quel financement restera à ma charge ?</li><li>Comment déclarer mes autres aides et vérifier le cumul, y compris le de minimis si ce régime s’applique ?</li><li>Quelles obligations, échéances et possibilités de contrôle subsistent après la décision ou le paiement ?</li></ul>
<p>Conservez le règlement daté, les réponses de l’instructeur et l’accusé de dépôt. Distinguez toujours montant envisagé, montant accordé et somme effectivement encaissée. Un accord de principe ou un dossier commencé ne suffit pas à constater un droit.</p></section>'''
 c+=f'<section class="article__sources" aria-labelledby="sources"><h2 id="sources">Sources et date de contrôle</h2><p>Sources primaires consultées le 28 octobre 2026. Les dates et conditions peuvent évoluer ; les liens ci-dessous permettent de vérifier la version actuelle.</p><ul>'
 c+=''.join(f'<li><a href="{e(u)}">{e(n)}</a></li>' for n,u in a['sources'])
 c+='</ul><p>Cette fiche fournit des repères généraux pour une exploitation viticole. Elle ne constitue ni une simulation individuelle ni une garantie d’attribution. Les propositions de préparation et de gestion sont celles de Mon Chai.</p></section>'
 c+=f'<nav class="aide-suite" aria-label="Continuer le dossier"><a href="aides-vignerons.html#{a["etape"]}">← Revenir à l’étape « {e(ETAPES[a["etape"]][1])} »</a><a href="aides-vignerons.html#recherche">Rechercher une autre aide</a></nav></main>'
 return page(a['article'],a['titre'],a['resume'],c)

for a in AIDES:
 if a['id']!='dja': write(a['article'],detail(a))

def option(values): return ''.join(f'<option value="{e(k)}">{e(v)}</option>' for k,v in values)
n=len(AIDES)
content=f'''<main id="contenu" tabindex="-1" class="aides-catalogue">
<section class="aides-hero"><div class="aides-largeur"><nav class="article__ariane" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a> › <a href="ressources.html">Ressources</a> › Aides aux vignerons</nav>
<p class="aide-kicker">Le financement, à chaque étape du domaine</p><h1>Aides aux vignerons :<br>de l’installation à l’arrachage</h1>
<p class="aides-chapo">S’installer, planter, investir, employer, changer de pratiques, traverser une crise ou transmettre : retrouvez les soutiens publics dans l’ordre de vie du domaine.</p>
<p class="aide-meta">Dossier publié et vérifié le <time datetime="{DATE}">28 octobre 2026</time> · France entière · {n} fiches et portes d’entrée · Sources officielles</p>
<nav class="aides-parcours" aria-label="Les étapes du domaine">'''+''.join(f'<a href="#{k}"><span>{v[0]}</span> {e(v[1])}</a>' for k,v in ETAPES.items())+'''</nav></div></section>
<div class="aides-largeur aides-intro"><p><strong>Le bon réflexe :</strong> une aide annoncée, une demande ouverte et un paiement réservé à des bénéficiaires acceptés sont trois situations différentes. Les fiches distinguent subventions, prêts, exonérations, accompagnement et indemnisation.</p><p>Ce panorama couvre les principaux dispositifs nationaux, européens et régionaux utiles à la viticulture, avec des exemples locaux et les portes d’entrée des 18 régions. Il ne garantit pas l’inventaire de tous les appels communaux ni votre éligibilité. <a href="#mode-emploi">Lire les règles de cumul et de dépôt</a> · <a href="#territoires">Consulter les portails régionaux</a>.</p></div>
<section class="aides-recherche" id="recherche" aria-label="Rechercher une aide" hidden><form class="aides-largeur" id="form-aides" role="search" aria-label="Recherche dans les aides viticoles">
<div class="aides-recherche__ligne"><div class="aides-champ"><label for="q-aides">Rechercher une aide</label><input type="search" id="q-aides" name="q" placeholder="DJA, bio, gel, arrachage…" autocomplete="off" maxlength="160" aria-describedby="recherche-conseil"></div><button type="reset">Réinitialiser</button></div>
<details class="aides-filtres"><summary>Affiner les résultats <span id="filtres-actifs"></span></summary><div class="aides-filtres__grille">
<div class="aides-champ"><label for="etape-aides">Étape du domaine</label><select id="etape-aides" name="etape"><option value="">Toutes les étapes</option>'''+option((k,v[1]) for k,v in ETAPES.items())+'''</select></div>
<div class="aides-champ"><label for="territoire-aides">Territoire</label><select id="territoire-aides" name="territoire"><option value="">Toute la France</option><option value="national">Dispositifs nationaux</option>'''+option((k,v) for k,v,_ in REGIONS)+'''</select></div>
<div class="aides-champ"><label for="type-aides">Type de soutien</label><select id="type-aides" name="type"><option value="">Tous les types</option>'''+option(TYPES.items())+'''</select></div>
<div class="aides-champ"><label for="statut-aides">Situation du guichet</label><select id="statut-aides" name="statut"><option value="">Toutes les situations</option>'''+option(STATUTS.items())+'''</select></div></div></details>
<p class="aides-resultat" id="nombre-aides" role="status" aria-live="polite" aria-atomic="true"></p><p id="recherche-conseil">Recherche sur cette page, sans transmission de vos mots. Les résultats indiquent des pistes, pas un droit. Situations datées du 28 octobre 2026.</p></form></section>
<noscript><p class="aides-largeur aide-repere">La recherche nécessite JavaScript. Toutes les fiches restent consultables ci-dessous par étape, ainsi que les portails régionaux.</p></noscript>
<div class="aides-largeur aides-liste"><div id="aides-vide" class="aide-repere" hidden><h2>Aucune fiche ne correspond à ces critères</h2><p>Essayez un mot plus court, élargissez les filtres ou utilisez « Réinitialiser ». Les <a href="#territoires">portails régionaux</a> complètent ce panorama.</p></div>'''
for key,(num,title,desc) in ETAPES.items():
 content+=f'<section class="aides-etape" id="{key}" aria-labelledby="titre-{key}"><header class="aides-etape__titre"><span>{num}</span><div><h2 id="titre-{key}">{e(title)}</h2><p>{e(desc)}</p></div></header><div class="aides-cartes">'
 for a in (x for x in AIDES if x['etape']==key):
  data=' '.join(a[k] for k in ('titre','resume','mots','financeur','calendrier'))+' '+territoire(a)
  content+=f'''<article class="aide-carte" data-aide="{a['id']}" data-texte="{e(data)}" data-etape="{key}" data-territoire="{' '.join(a['territoire'])}" data-type="{a['type']}" data-statut="{a['statut']}"><p class="aide-type">{e(TYPES[a['type']])}</p><h3><a href="{a['article']}">{e(a['titre'])}</a></h3><p>{e(a['resume'])}</p><p class="aide-statut aide-statut--{a['statut']}">{e(STATUTS[a['statut']])}</p><p class="aide-calendrier">{e(a['calendrier'])}</p><p class="aide-territoire">{e(territoire(a))}</p><p class="aide-financeur">{e(a['financeur'])}</p><div class="aide-carte__bas"><a class="aide-lire" href="{a['article']}" aria-label="Lire la fiche : {e(a['titre'])}">Fiche détaillée →</a><a href="{e(a['sources'][0][1])}" class="aide-source">Source officielle ↗</a></div><p class="aide-date">Vérifié le 28 octobre 2026</p></article>'''
 content+='</div></section>'
content+='''</div><section class="aides-largeur aides-mode" id="mode-emploi" aria-labelledby="titre-mode"><p class="aide-kicker">Avant le dossier</p><h2 id="titre-mode">Quatre vérifications avant de compter sur une aide</h2>
<div class="aides-regles"><section><h3>01 · Identifier le bon bénéficiaire</h3><p>Domaine, associé, propriétaire, CUMA, prestataire ou distillateur : celui qui bénéficie économiquement d’un soutien n’est pas toujours celui qui dépose. Vérifiez aussi le territoire, l’activité, la campagne et le statut.</p></section>
<section><h3>02 · Lire le calendrier réel</h3><p>Une date de paiement ne rouvre pas les candidatures. Vérifiez le début autorisé des dépenses avant de signer, de verser un acompte ou de commencer. Les exceptions et dates d’admissibilité sont propres au règlement concerné.</p></section>
<section><h3>03 · Contrôler les cumuls</h3><p>Les mêmes coûts ne doivent pas être financés deux fois. Pour le de minimis agricole, le plafond est de 50 000 € par entreprise unique sur trois ans glissants dans le cadre du règlement modifié. Toutes les aides ne relèvent pas du de minimis ; le régime général est distinct. <a href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R3118">Règlement européen 2024/3118</a>.</p></section>
<section><h3>04 · Financer le reste et l’attente</h3><p>Assiette admissible, taux et montant versé sont différents. Prévoyez les dépenses exclues, la TVA selon votre régime, le coût du crédit et le délai de paiement. Conservez règlement, accusé de dépôt, décision, factures et preuves exigées.</p></section></div>
<p>Les fiches expliquent les engagements. Pour un dossier individuel, faites confirmer les réponses par l’organisme instructeur ; une simulation commerciale ou le cas d’un voisin ne vaut pas décision pour votre exploitation.</p></section>
<section class="aides-largeur aides-territoires" id="territoires" aria-labelledby="titre-territoires"><p class="aide-kicker">France entière</p><h2 id="titre-territoires">Les portes d’entrée des 18 régions</h2><p>Ces portails complètent les fiches et permettent de rechercher les appels locaux. Un portail européen peut réunir plusieurs fonds : sa présence ne prouve pas qu’un appel est ouvert à la vigne. Pour les aides agricoles, vérifiez aussi la Région, la DRAAF ou DAAF et la DDT(M). En Corse, rapprochez-vous de l’ODARC. À La Réunion, consultez également le <a href="https://www.departement974.fr/aides-feader">FEADER du Département</a>.</p><ul class="aides-portails">'''+''.join(f'<li><a href="{e(url)}">{e(name)} ↗</a></li>' for _,name,url in REGIONS)+'''</ul><p class="aide-reference">Références : <a href="https://france.representation.ec.europa.eu/collectivites-territoriales-programmes-europeens-2021-2027_fr">Commission européenne, programmes territoriaux</a> et <a href="https://agriculture.gouv.fr/les-aides-des-regions">ministère de l’Agriculture, répartition du FEADER</a>. Les soutiens FEAGA au secteur du vin, le FEADER et les fonds FEDER ne sont pas interchangeables.</p></section>
<section class="aides-largeur aides-methodo" aria-labelledby="methode"><h2 id="methode">Périmètre et méthode</h2><p>Publication supplémentaire du 28 octobre 2026. Le dossier comprend des dispositifs, familles de soutiens et portes d’entrée utiles à la vie d’un domaine. Il conserve certains appels clos pour éviter de les présenter à tort comme disponibles et pour préparer une éventuelle campagne suivante, sans en promettre la reconduction.</p><p>Priorité aux règlements, notices, téléservices et pages des administrations ou organismes gestionnaires. En cas d’écart entre une ancienne présentation et un appel daté, le dossier précise la campagne retenue. Les rubriques « calendrier territorial à vérifier » ne sont pas déclarées ouvertes. Les méthodes de préparation sont proposées par Mon Chai ; elles ne remplacent pas l’instruction administrative.</p></section></main>'''
write('aides-vignerons.html',page('aides-vignerons.html','Aides aux vignerons : de l’installation à l’arrachage',f'{n} fiches sourcées : installation, investissement, PAC, bio, emploi, risques, transmission et arrachage. Recherche par étape, territoire et situation du guichet.',content,True))

# Mettre le dossier au premier plan des portes d'entrée existantes, une fois.
promo='<section class="serie-carte" id="dossier-aides"><p class="actu-date"><time datetime="2026-10-28">28 octobre 2026</time> · Nouveau dossier</p><h2><a href="aides-vignerons.html">Aides aux vignerons : de l’installation à l’arrachage</a></h2><p>'+str(n)+' fiches sourcées, classées par étape de vie du domaine. Recherchez par territoire, type de soutien et situation réelle du guichet.</p></section>'
for name in ['ressources.html','s-installer-en-viticulture.html','dja-installation-vigneron.html']:
 s=read(name)
 if 'id="dossier-aides"' not in s:
  end=s.index('</p>',s.index('class="article__chapo"'))+4
  s=s[:end]+promo+s[end:]
  write(name,s)
name='actualites-reglementaires.html'
s=read(name)
if 'id="dossier-aides"' not in s:
 marker=re.search(r'<!-- FILE-ATTENTE : les nouvelles cartes[^>]*-->',s)[0]
 card=f'<article class="actu-fiche" id="dossier-aides" data-categorie="vigne-phyto"><div class="actu-fiche__corps"><p class="actu-date"><time datetime="2026-10-28">28 octobre 2026</time> · Dossier transversal</p><h2 class="actu-fiche__titre"><a href="aides-vignerons.html">Aides aux vignerons : de l’installation à l’arrachage</a></h2><p class="actu-fiche__resume">{n} fiches sourcées : installation, investissements, PAC, bio, emploi, risques et transmission. Recherche dédiée par étape et territoire.</p><a class="actu-fiche__lire" href="aides-vignerons.html">Explorer les aides →</a></div></article>'
 write(name,s.replace(marker,marker+'\n'+card,1))
# Faire correspondre les données structurées des portes d'entrée au contenu visible.
for name in ['ressources.html','s-installer-en-viticulture.html','actualites-reglementaires.html']:
 def actualiser_collection(m):
  data=json.loads(m[1])
  if data.get('@type')!='CollectionPage': return m[0]
  data['dateModified']=DATE
  items=data.setdefault('mainEntity',{'@type':'ItemList','itemListElement':[]}).setdefault('itemListElement',[])
  if not any(x.get('url')=='https://monchai.fr/aides-vignerons.html' for x in items):
   items.insert(0,{'@type':'ListItem','position':1,'name':'Aides aux vignerons : de l’installation à l’arrachage','url':'https://monchai.fr/aides-vignerons.html'})
  for i,item in enumerate(items): item['position']=i+1
  return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False)+'</script>'
 write(name,re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>',actualiser_collection,read(name)))
# Ajouter au sitemap sans dates de publication inventées pour les autres pages.
s=read('sitemap.xml')
for slug in ['aides-vignerons.html']+[a['article'] for a in AIDES if a['id']!='dja']:
 if 'https://monchai.fr/'+slug not in s:
  s=s.replace('</urlset>',f'<url><loc>https://monchai.fr/{slug}</loc><lastmod>{DATE}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>')
write('sitemap.xml',s)
write('outils/aides/catalogue.json',json.dumps({'date':DATE,'perimetre':'France, principaux dispositifs et exemples territoriaux ; pas une garantie d’exhaustivité locale ni de droit','fiches':AIDES},ensure_ascii=False,indent=2)+'\n')
print(f'{n} fiches ; {n-1} nouveaux articles ; catalogue, navigation et sitemap générés.')
