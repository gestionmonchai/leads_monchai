"""Corrections bornées issues de l'audit ; conserve CTA, navigation et URL."""
from pathlib import Path
import re
import sys

ROOT=Path(sys.argv[1]).resolve()
TELEPAC='https://www.telepac.agriculture.gouv.fr/telepac/aide/conditionnalite.action'
ARRETE='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053228465'
DRAAF='https://draaf.bourgogne-franche-comte.agriculture.gouv.fr/tenue-des-registres-d-utilisation-des-produits-phytopharmaceutiques-a3751.html'
REG='https://eur-lex.europa.eu/eli/reg/2026/471/oj/fra'
CORR='https://eur-lex.europa.eu/eli/reg/2026/471/corrigendum/2026-05-22/oj/fra'

def section(s,heading,body):
    return re.sub(r'<h2>'+re.escape(heading)+r'</h2>[\s\S]*?(?=<h2>|<div class="article-cta")', '<h2>'+heading+'</h2>\n'+body+'\n\n  ',s,count=1)

for directory in ['', 'en','de','it','zh']:
    for name in ['ift-viticulture-calcul.html','cahier-de-culture-vigne.html','registre-phyto-numerique-2027.html','paquet-vin-europeen-2027.html']:
        path=ROOT/directory/name
        if not path.exists():continue
        s=path.read_text(encoding='utf-8')
        original=s
        if name=='ift-viticulture-calcul.html':
            s=s.replace("à défaut de cible précise, c'est la <strong>dose homologuée minimale</strong> qui s'applique", "à défaut de cible renseignée, utilisez la <strong>dose de référence à la culture</strong> du référentiel de la campagne")
            s=s.replace("L'IFT de l'exploitation est la <strong>somme des IFT de tous les traitements</strong>", "L'IFT d'une parcelle est la somme des IFT de ses traitements. Pour plusieurs parcelles, calculez une <strong>moyenne pondérée par leurs surfaces</strong>")
            s=s.replace("Si vous ne traitez qu'une parcelle sur deux hectares d'un îlot de quatre", "Si vous traitez deux hectares d'un îlot de quatre")
            if 'id="ift-surfaces"' not in s:
                block='''<section id="ift-surfaces"><h2>Passer de la parcelle à un ensemble de vignes</h2><p>Calculez d’abord l’IFT de chaque parcelle. Multipliez chaque résultat par sa surface, additionnez ces produits puis divisez par la surface totale du périmètre retenu. Exemple pédagogique : 1 ha à IFT 4 et 3 ha à IFT 2 donnent (1 × 4 + 3 × 2) ÷ 4 = <strong>2,5</strong>. Additionner 4 et 2 donnerait un indicateur erroné.</p><p>Conservez le même périmètre de cultures et les mêmes catégories de produits pour comparer deux campagnes. Pour un engagement d’aide ou une certification, appliquez sa méthode particulière. <a href="https://agriculture.gouv.fr/indicateur-de-frequence-de-traitements-phytosanitaires-ift">Ministère : référentiels et guides IFT</a>.</p></section>'''
                s=s.replace('<h2>À quoi sert l\'IFT&nbsp;?</h2>',block+'\n<h2>À quoi sert l\'IFT&nbsp;?</h2>')
        if name=='cahier-de-culture-vigne.html':
            s=re.sub(r'<p class="article__chapo">[\s\S]*?</p>', '<p class="article__chapo">Le cahier de culture rassemble les preuves de vos interventions. Les obligations viennent de plusieurs textes : produits phytopharmaceutiques, hygiène des productions et, pour la fertilisation azotée, règles applicables à vos parcelles et à votre zone. La conditionnalité PAC contrôle certaines de ces exigences.</p>',s,count=1)
            s=s.replace('La conditionnalité PAC exige un <strong>registre phytosanitaire</strong> et un <strong>cahier d\'enregistrement de la fertilisation azotée</strong>.','Le registre phytopharmaceutique et les enregistrements de fertilisation répondent à des <strong>obligations distinctes</strong> ; vérifiez celles de votre exploitation et, notamment, les règles nitrates en zone vulnérable.')
            s=s.replace('Les enregistrements se conservent au moins <strong>5&nbsp;campagnes</strong>&nbsp;; tout format est admis (papier ou numérique)… jusqu\'à l\'obligation de registre phyto <strong>numérique</strong> au 1ᵉʳ&nbsp;janvier 2027.','Le registre phytopharmaceutique se conserve <strong>cinq ans</strong>. Son contenu évolue dès 2026 et sa conversion électronique devient obligatoire en 2027, avec le calendrier transitoire prévu par l’arrêté. Les autres pièces suivent leurs propres règles de conservation.')
            s=section(s,"Ce qu'un contrôle vérifie",f'<p>Les pièces et pratiques sont rapprochées selon les règles et la grille de contrôle applicables. Une anomalie peut entraîner des conséquences sur les aides ; le résultat dépend de sa qualification et des dispositions en vigueur. Saisir une intervention rapidement facilite la fiabilité et la vérification, sans rendre l’enregistrement incontestable. Conservez aussi les justificatifs et la trace des corrections. <a href="{TELEPAC}">Télépac : fiches et grilles de conditionnalité 2026</a>.</p>')
            s=section(s,'Préparer 2027 dès maintenant',f'<p>Pour le volet phytopharmaceutique, contrôlez dès maintenant les champs de l’arrêté du 24 décembre 2025 et la structure d’export. Un logiciel ou un tableur doit couvrir les données et le format requis ; son nom ne prouve pas la conformité. Le <a href="registre-phyto-numerique-2027.html">guide du registre numérique</a> précise le calendrier. <a href="{ARRETE}">Texte de référence</a>.</p>')
        if name=='registre-phyto-numerique-2027.html':
            s=section(s,'Ce que le registre doit contenir',f'''<p>Le contenu évolue dès 2026, avant l’obligation électronique. La liste dépend aussi du type d’utilisation. Pour les traitements de vignes, prévoyez les identifiants du produit et de son autorisation, la quantité et la dose, la date, l’identification géographique et la surface traitée, la culture et son caractère biologique. Ajoutez, lorsqu’ils sont requis, le stade de la culture, les heures de début et de fin et les informations de rentrée anticipée. Les adjuvants et les prestations font également l’objet de règles.</p><p>Utilisez les annexes de <a href="{ARRETE}">l’arrêté du 24 décembre 2025</a> comme liste de contrôle des champs et du format, plutôt que de limiter le registre au nom commercial, à la date et à la dose. La <a href="{DRAAF}">DRAAF explique les évolutions françaises</a>.</p>''')
            s=s.replace("L'entrée en vigueur était initialement fixée", "L'application du format électronique était initialement prévue")
            s=s.replace('1ᵉʳ janvier 2030</td>','2 janvier 2030</td>')
            s=s.replace('dans un <strong>tableur structuré</strong> (fichier Excel ou CSV conforme), à condition qu\'il contienne toutes les informations obligatoires.', 'dans un <strong>tableur structuré</strong>, si les données et leur format respectent les annexes du texte français ; la seule extension Excel ou CSV ne le démontre pas.')
        if name=='paquet-vin-europeen-2027.html' and '<h1>Paquet vin européen' in s:
            start=s.index('<h1>Paquet vin européen')
            end=s.index('<div class="article-cta">',start)
            s=s[:start]+f'''<h1>Paquet vin européen : quelles règles et quelles dates pour le domaine ?</h1>
<p class="article__chapo">Le règlement (UE) 2026/471 modifie plusieurs règles vitivinicoles. Pour prendre une décision, distinguez l’entrée en vigueur du texte des dates d’application de ses mesures, et vérifiez la situation de vos autorisations ou produits.</p>
<div class="essentiel"><p class="essentiel__titre">L’essentiel</p><ul><li>Le règlement est entré en vigueur le <strong>18 mars 2026</strong> ; certaines dispositions s’appliquent ultérieurement.</li><li>Les nouvelles mentions des vins désalcoolisés relèvent d’une application au <strong>19 septembre 2027</strong>.</li><li>Une renonciation sans sanction à certaines autorisations exige une <strong>notification avant leur expiration</strong>, au plus tard le 31 décembre 2026.</li></ul></div>
<h2>Plantations : vérifier l’autorisation avant d’agir</h2><p>Le texte pérennise le régime et allonge à huit ans la validité des autorisations de replantation concernées. L’article 62 modifié permet, sous ses conditions, de renoncer aux autorisations accordées avant le 1er janvier 2025. La date du 31 décembre 2026 ne prolonge pas une autorisation déjà expirée. <a href="{REG}">Règlement, article 1er</a>.</p>
<h2>Sans alcool : ne pas confondre les deux seuils</h2><p>Pour les catégories concernées après désalcoolisation, le nouveau cadre distingue « sans alcool » jusqu’à <strong>0,5 % vol.</strong> et la mention supplémentaire « 0,0 % » jusqu’à <strong>0,05 % vol.</strong>. « À teneur réduite en alcool » vise plus de 0,5 % vol. et une réduction d’au moins 30 % par rapport au minimum de la catégorie avant désalcoolisation.</p><p>L’application au 19 septembre 2027 concerne l’article 1er, point 10 a), selon <a href="{CORR}">le rectificatif du 22 mai 2026</a>. Le texte prévoit une transition pour les produits étiquetés avant cette date.</p>
<h2>Préparer vos décisions et vos étiquettes</h2><p>Classez vos autorisations avec leur date d’octroi et leur échéance. Faites confirmer le parcours de renonciation ou de replantation par l’organisme compétent avant de le lancer. Pour une étiquette, séparez le droit actuel du futur régime et faites relire le produit exact : catégorie, titre alcoométrique, traitement et marché de destination.</p><p>La réforme ne résume pas toutes les obligations d’étiquetage. N’utilisez pas le seul millésime comme preuve du régime des ingrédients et de la déclaration nutritionnelle ; la date de production et les dispositions transitoires doivent être examinées.</p>
''' +s[end:]
            description='Paquet vin 2026 : autorisations, seuils des vins désalcoolisés et dates d’application. Les nouvelles mentions s’appliquent en septembre 2027.'
            s=re.sub(r'(<meta[^>]*(?:name|property)="(?:description|og:description)"[^>]*content=")[^"]*',lambda m:m[1]+description,s)
            s=re.sub(r'("description"\s*:\s*")[^"]*',lambda m:m[1]+description,s)
        if s!=original:
            extra=[]
            if name=='cahier-de-culture-vigne.html':extra=[(TELEPAC,'Télépac : conditionnalité 2026'),(ARRETE,'Arrêté français du registre phytopharmaceutique')]
            if name=='registre-phyto-numerique-2027.html':extra=[(ARRETE,'Arrêté du 24 décembre 2025, annexes des données et formats'),(DRAAF,'DRAAF : contenu 2026 et calendrier du format électronique')]
            if name=='paquet-vin-europeen-2027.html':extra=[(REG,'Règlement (UE) 2026/471'),(CORR,'Rectificatif du 22 mai 2026, dates d’application')]
            for url,label in extra:
                pattern=r'(<section class="article__sources">[\s\S]*?<ul>)'
                if not re.search(r'<section class="article__sources">[\s\S]*?'+re.escape(url),s):
                    s=re.sub(pattern,lambda m:m[1]+f'<li><a href="{url}">{label}</a></li>',s,count=1)
            s=re.sub(r'("dateModified"\s*:\s*")[^"]+',r'\g<1>2026-10-29',s)
            if 'Mis à jour le 29 octobre 2026' not in s:
                s=re.sub(r'(<span class="actu-date">[\s\S]*?)(</span>)',r'\1 · Mis à jour le 29 octobre 2026\2',s,count=1)
            path.write_text(s,encoding='utf-8',newline='\n')
            print(path.relative_to(ROOT))
