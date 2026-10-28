"""Prévisualise la lettre ; création explicite d'un brouillon Brevo, aucun envoi."""
from __future__ import annotations
import argparse
from datetime import date, datetime, timedelta, timezone
from html import escape
import json
import os
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

OFFICIELS = ('legifrance.gouv.fr', 'eur-lex.europa.eu', 'consilium.europa.eu',
             'agriculture.gouv.fr', 'douane.gouv.fr', 'impots.gouv.fr',
             'economie.gouv.fr', 'service-public.gouv.fr', 'service-public.fr',
             'franceagrimer.fr', 'inao.gouv.fr', 'anses.fr', 'cnil.fr',
             'msa.fr', 'ec.europa.eu')
STATUTS = {'adopte': 'Texte adopté', 'en_vigueur': 'En vigueur',
           'echeance': 'Échéance à venir', 'projet': 'Projet — pas une obligation',
           'rappel': 'Rappel — pas une nouvelle règle'}

def texte(valeur, nom, maximum=2000):
    if not isinstance(valeur, str) or not valeur.strip() or len(valeur) > maximum:
        raise ValueError(f'Champ {nom} absent ou trop long')
    # Les accolades sont réservées au moteur de template du fournisseur.
    if any(x in valeur for x in ('{{', '}}', '{%', '%}', '\r', '\x00')):
        raise ValueError(f'Champ {nom} : syntaxe réservée')
    return valeur.strip()

def iso(valeur):
    if not isinstance(valeur, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', valeur):
        raise ValueError('Date ISO attendue')
    return date.fromisoformat(valeur)

def source(valeur):
    url = urlsplit(texte(valeur, 'source', 2000))
    if url.scheme != 'https' or url.username or url.password or url.port:
        raise ValueError('Source HTTPS officielle attendue')
    if not any(url.hostname == h or (url.hostname or '').endswith('.' + h) for h in OFFICIELS):
        raise ValueError('Source hors liste officielle : vérifier et compléter la liste en revue')
    return valeur

def valider(edition, pour_brevo=False, aujourd_hui=None):
    maintenant = aujourd_hui or datetime.now(timezone.utc).date()
    envoi = iso(edition['date_envoi'])
    if envoi.weekday() != 0:
        raise ValueError('La date cible doit être un lundi')
    debut, fin = iso(edition['periode']['debut']), iso(edition['periode']['fin'])
    if not debut <= fin < envoi or (fin - debut).days > 7 or (envoi - fin).days > 7:
        raise ValueError('Période de veille incohérente')
    texte(edition['objet'], 'objet', 160)
    texte(edition['introduction'], 'introduction', 1500)
    points = edition['points']
    if not isinstance(points, list) or len(points) > 10:
        raise ValueError('Au plus dix points par lettre')
    consultations = edition['sources_consultees']
    if not isinstance(consultations, list):
        raise ValueError('Sources consultées attendues')
    for s in consultations:
        texte(s['nom'], 'nom de source', 180)
        source(s['url'])
        if not debut <= iso(s['verifie_le']) <= fin:
            raise ValueError('Vérification hors période de veille')
    for point in points:
        for champ in ('titre', 'resume', 'perimetre', 'action', 'application'):
            texte(point[champ], champ, 1200)
        if point['statut'] not in STATUTS:
            raise ValueError('Statut juridique inconnu')
        for champ in ('publication', 'verification'):
            if iso(point[champ]) > fin:
                raise ValueError('Date de source postérieure à la veille')
        if iso(point['verification']) < debut or iso(point['publication']) > iso(point['verification']):
            raise ValueError('Source non vérifiée pendant cette veille')
        if not isinstance(point['sources'], list) or not point['sources']:
            raise ValueError('Chaque point doit citer une source officielle')
        for lien in point['sources']:
            source(lien)
    if pour_brevo:
        if edition.get('demonstration') is not False or edition.get('statut') != 'relue':
            raise ValueError('Édition de démonstration ou non relue : création refusée')
        texte(edition['relecture']['par'], 'responsable de relecture', 120)
        relecture = iso(edition['relecture']['le'])
        if not fin <= relecture <= maintenant or not maintenant < envoi <= maintenant + timedelta(days=7):
            raise ValueError('Relecture ou date cible périmée / future incohérente')
        if not consultations or fin > maintenant:
            raise ValueError('Veille non documentée ou future')
        if not points:
            texte(edition.get('aucun_changement'), 'bilan du périmètre vérifié', 1000)
    return edition

def rendre(e):
    valider(e)
    titre = f'La lettre réglementaire · {iso(e["date_envoi"]).strftime("%d/%m/%Y")}'
    avertissement = 'DÉMONSTRATION DE FORMAT — ne pas diffuser.\n\n' if e.get('demonstration', True) else ''
    corps = f'<p style="color:#7b1e22">{escape(avertissement)}</p>' if avertissement else ''
    corps += f'<h1 style="font:500 32px/1.25 Georgia,serif;color:#471d29">{escape(titre)}</h1><p>{escape(e["introduction"])}</p>'
    plain = [avertissement + titre, e['introduction'],
             f'Période vérifiée : {e["periode"]["debut"]} au {e["periode"]["fin"]}.']
    corps += f'<p style="font-size:14px;color:#605259">{escape(plain[-1])}</p>'
    if not e['points']:
        bilan = e.get('aucun_changement') or 'Édition en préparation : aucun bilan de veille validé.'
        corps += f'<p>{escape(bilan)}</p>'
        plain.append(bilan)
    for p in e['points']:
        corps += f'<hr style="border:0;border-top:1px solid #decfbe"><p style="color:#7b1e22;font-size:13px">{escape(STATUTS[p["statut"]])}</p><h2 style="font:500 24px/1.3 Georgia,serif">{escape(p["titre"])}</h2><p>{escape(p["resume"])}</p>'
        plain.extend([STATUTS[p['statut']], p['titre'], p['resume']])
        for champ, libelle in (('perimetre','Qui / où'),('application','Application'),('action','À faire'),('publication','Texte publié le'),('verification','Vérifié le')):
            corps += f'<p><strong>{libelle} :</strong> {escape(p[champ])}</p>'
            plain.append(f'{libelle} : {p[champ]}')
        for lien in p['sources']:
            corps += f'<p><a style="color:#7b1e22" href="{escape(lien,quote=True)}">Source officielle : {escape(urlsplit(lien).hostname)}</a></p>'
            plain.append(lien)
    corps += '<h2 style="font:500 22px Georgia,serif">Périmètre de cette veille</h2><ul>'
    for s in e['sources_consultees']:
        corps += f'<li><a style="color:#7b1e22" href="{escape(s["url"],quote=True)}">{escape(s["nom"])}</a> — vérifié le {escape(s["verifie_le"])}</li>'
        plain.append(f'{s["nom"]} — {s["url"]} — {s["verifie_le"]}')
    corps += '</ul><p>Une sélection de repères pour les vignerons, à vérifier selon votre domaine, votre territoire et votre appellation. Les projets ne constituent pas des obligations adoptées.</p>'
    pied = 'HALLAIS & BERTHELOT · 5 rue Pierre-Joseph Colin, 35000 Rennes · contact@monchai.fr'
    corps += '<hr style="border:0;border-top:1px solid #decfbe"><p style="font-size:13px">Vous recevez cette lettre après confirmation de votre inscription à la veille réglementaire Mon Chai.</p>'
    corps += f'<p style="font-size:13px">{escape(pied)}</p><p><a style="color:#7b1e22" href="{{{{ unsubscribe }}}}">Me désinscrire de la lettre</a> · <a style="color:#7b1e22" href="https://monchai.fr/politique-confidentialite.html#lettre-reglementaire">Mes données personnelles</a></p>'
    html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(titre)+'</title></head><body style="margin:0;background:#f7f1e8;color:#34272b;font:16px/1.65 Arial,sans-serif"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:24px 12px"><table role="presentation" style="width:100%;max-width:640px;margin:auto;background:#fff"><tr><td style="padding:28px">'+corps+'</td></tr></table></td></tr></table></body></html>'
    plain += [pied, 'Me désinscrire : {{ unsubscribe }}', 'Mes données : https://monchai.fr/politique-confidentialite.html#lettre-reglementaire']
    return html, '\n\n'.join(plain)

def api(methode, chemin, cle, payload=None):
    data = json.dumps(payload).encode('utf8') if payload is not None else None
    request = Request('https://api.brevo.com/v3' + chemin, data=data, method=methode,
                      headers={'api-key': cle, 'Content-Type': 'application/json', 'Accept': 'application/json'})
    try:
        with urlopen(request, timeout=25) as response:
            return json.load(response)
    except HTTPError as exc:
        raise ValueError(f'Brevo HTTP {exc.code} : consulter le compte ; aucune relance automatique') from None
    except (URLError, TimeoutError):
        raise ValueError('Résultat réseau indéterminé : vérifier les brouillons Brevo avant toute relance') from None

def creer_brouillon(e, env=None, transport=api):
    env = os.environ if env is None else env
    valider(e, pour_brevo=True)
    cle, liste, expediteur = (env.get(k, '') for k in ('BREVO_API_KEY','BREVO_LIST_ID','BREVO_SENDER_EMAIL'))
    if not cle or not re.fullmatch(r'[1-9]\d*', liste) or not re.fullmatch(r'[A-Za-z0-9._+%-]+@monchai\.fr', expediteur):
        raise ValueError('Secret API, liste positive et expéditeur @monchai.fr validé requis')
    nom = 'veille-vignerons-' + e['date_envoi']
    # Recherche paginée sans exporter les contacts, y compris après une réponse POST perdue.
    for offset in range(0, 10100, 100):
        campagnes = transport('GET', f'/emailCampaigns?limit=100&offset={offset}', cle).get('campaigns')
        if not isinstance(campagnes, list):
            raise ValueError('Réponse campagnes illisible : arrêt')
        for campagne in campagnes:
            if campagne.get('name') == nom:
                return {'resultat':'existant', 'id':campagne['id'], 'nom':nom}
        if len(campagnes) < 100:
            break
    else:
        raise ValueError('Trop de campagnes : contrôle des doublons incomplet')
    details = transport('GET', '/contacts/lists/' + liste, cle)
    nombre = details.get('uniqueSubscribers')
    if type(nombre) is not int or not 1 <= nombre <= 270:
        raise ValueError('Liste vide, quota inconnu ou plus de 270 contacts : contrôler le compte gratuit')
    html, _ = rendre(e)
    payload = {'name':nom, 'sender':{'email':expediteur,'name':'Mon Chai'},
               'replyTo':expediteur, 'subject':e['objet'], 'htmlContent':html,
               'recipients':{'listIds':[int(liste)]}, 'tag':'veille-reglementaire'}
    # Pas de scheduledAt ni d'appel sendNow : programmation dans Brevo après recette.
    resultat = transport('POST','/emailCampaigns',cle,payload)
    if type(resultat.get('id')) is not int:
        raise ValueError('Résultat indéterminé : vérifier les brouillons Brevo avant de relancer')
    return {'resultat':'brouillon', 'id':resultat['id'], 'nom':nom, 'contacts_max':nombre}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('edition',type=Path)
    parser.add_argument('--sortie',type=Path,required=True)
    parser.add_argument('--creer-brouillon',action='store_true')
    args=parser.parse_args()
    try:
        e=json.loads(args.edition.read_text(encoding='utf8'))
        html, plain=rendre(e)
        args.sortie.mkdir(parents=True,exist_ok=True)
        (args.sortie/'lettre.html').write_text(html,encoding='utf8')
        (args.sortie/'lettre.txt').write_text(plain,encoding='utf8')
        print(json.dumps(creer_brouillon(e) if args.creer_brouillon else {'resultat':'apercu_local','date':e['date_envoi']},ensure_ascii=False))
    except (ValueError, KeyError, TypeError) as exc:
        parser.exit(1,f'Édition refusée : {exc}\n')

if __name__=='__main__':
    main()
