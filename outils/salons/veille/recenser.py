"""Veille quotidienne des salons. Python 3.10+, bibliothèque standard uniquement.

La collecte n'écrit jamais dans le catalogue éditorial ni sur le site public.
Les annuaires découvrent des pistes ; les sources officielles restent identifiées.
"""
from __future__ import annotations

import argparse
import csv
from datetime import date, datetime, timezone
import hashlib
import html
from html.parser import HTMLParser
import io
import ipaddress
import json
import os
from pathlib import Path
import re
import socket
import sys
import time
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit, parse_qsl, urlencode
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.robotparser import RobotFileParser
import webbrowser

HERE = Path(__file__).resolve().parent
UA = 'MonChaiSalons/1.0 (+https://monchai.fr/contact.html)'
MAX_BYTES = 5_000_000
MONTHS = {m: i for i, m in enumerate(
    'janvier fevrier mars avril mai juin juillet aout septembre octobre novembre decembre'.split(), 1)}
MONTHS.update(jan=1, fev=2, avr=4, juil=7, sept=9, oct=10, nov=11, dec=12)
WINE = re.compile(r'\b(vins?|vigne|wine|viticol\w*|viticultur\w*|vigneron\w*|vignoble\w*|vinitech|sitevi|viteff|sival|vinidome|millesime|vitisaveurs|grand tasting)\b')


def norm(value):
    return re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFKD', str(value)).lower()
                                     if not unicodedata.combining(c))).strip()


def clean(value):
    return re.sub(r'\s+', ' ', html.unescape(str(value or ''))).strip()


def digest(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()[:20]


def canonical(url):
    p = urlsplit(url)
    if p.scheme not in ('http', 'https') or not p.hostname or p.username or p.password:
        raise ValueError('URL HTTP(S) publique attendue')
    query = [(k, v) for k, v in parse_qsl(p.query) if not k.startswith('utm_') and k not in ('fbclid', 'gclid')]
    return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path or '/', urlencode(query), ''))


def host(url):
    return (urlsplit(url).hostname or '').lower().removeprefix('www.')


def url_key(url):
    p = urlsplit(canonical(url))
    return host(url) + p.path.rstrip('/') + ('?' + p.query if p.query else '')


def public_url(url):
    """Les liens récoltés ne doivent pas atteindre des services locaux ou privés."""
    url = canonical(url)
    p = urlsplit(url)
    if p.port not in (None, 80, 443):
        raise ValueError('Port non public refusé')
    addresses = socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == 'https' else 80), type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
        raise ValueError('Adresse locale ou privée refusée')
    return url


def iso(value):
    try:
        return date.fromisoformat(str(value)[:10]).isoformat()
    except (ValueError, TypeError):
        return None


def french_ranges(text):
    """Dates complètes explicites seulement. Pas de mois/année déduits d'une édition."""
    text = norm(text).replace('1er', '1')
    month = '|'.join(sorted(MONTHS, key=len, reverse=True))
    ranges = []
    # 30 octobre au 2 novembre 2026 ; 31 décembre 2026 au 2 janvier 2027.
    cross = rf'\b(\d{{1,2}})\s+({month})\.?\s*(\d{{4}})?\s*(?:au|a|[-–])\s*(\d{{1,2}})\s+({month})\.?\s+(\d{{4}})\b'
    same = rf'\b(\d{{1,2}})(?:\s*(?:/|,|&|et|au|a|[-–])\s*(?:(?:samedi|dimanche|lundi|mardi|mercredi|jeudi|vendredi)\s+)?\d{{1,2}})+\s+({month})\.?\s+(\d{{4}})\b'
    occupied = []
    listed = rf'\b(\d{{1,2}}(?:\s*/\s*\d{{1,2}})*)\s+({month})\.?\s*/\s*(\d{{1,2}}(?:\s*/\s*\d{{1,2}})*)\s+({month})\.?\s+(\d{{4}})\b'
    for m in re.finditer(listed, text):
        days1, mo1, days2, mo2, year = m.groups()
        y2 = int(year)
        try:
            ranges.append((date(y2 - (MONTHS[mo1] > MONTHS[mo2]), MONTHS[mo1], int(days1.split('/')[0])).isoformat(),
                           date(y2, MONTHS[mo2], int(days2.split('/')[-1])).isoformat()))
            occupied.append(m.span())
        except ValueError:
            pass
    for m in re.finditer(cross, text):
        if any(a <= m.start() < b for a, b in occupied):
            continue
        d1, mo1, y1, d2, mo2, y2 = m.groups()
        year2 = int(y2)
        year1 = int(y1) if y1 else year2 - (MONTHS[mo1] > MONTHS[mo2])
        try:
            ranges.append((date(year1, MONTHS[mo1], int(d1)).isoformat(), date(year2, MONTHS[mo2], int(d2)).isoformat()))
            occupied.append(m.span())
        except ValueError:
            pass
    for m in re.finditer(same, text):
        if any(a <= m.start() < b for a, b in occupied):
            continue
        days = [int(x) for x in re.findall(r'\d{1,2}', m[0].split(m[2])[0])]
        try:
            ranges.append((date(int(m[3]), MONTHS[m[2]], days[0]).isoformat(), date(int(m[3]), MONTHS[m[2]], days[-1]).isoformat()))
            occupied.append(m.span())
        except ValueError:
            pass
    # Une journée isolée ne devient pas une plage si elle est dans une plage déjà lue.
    for m in re.finditer(rf'\b(\d{{1,2}})\s+({month})\.?\s+(\d{{4}})\b', text):
        if any(a <= m.start() < b for a, b in occupied):
            continue
        try:
            d = date(int(m[3]), MONTHS[m[2]], int(m[1])).isoformat()
            ranges.append((d, d))
        except ValueError:
            pass
    return sorted(set((a, b) for a, b in ranges if a <= b))


class Node:
    def __init__(self, tag='', attrs=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), []

    def text(self):
        if self.tag in ('script', 'style', 'noscript'):
            return ''
        return clean(' '.join(x.text() if isinstance(x, Node) else x for x in self.children))

    def walk(self, tag=None, cls=None):
        for child in self.children:
            if isinstance(child, Node):
                if (not tag or child.tag == tag) and (not cls or cls in child.attrs.get('class', '').split()):
                    yield child
                yield from child.walk(tag, cls)

    def first(self, tag=None, cls=None):
        return next(self.walk(tag, cls), Node())


class Document(HTMLParser):
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].children.append(n)
        if tag not in self.VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def item(name, url, start=None, end=None, city='', venue='', official='', **extra):
    return dict(nom=clean(name)[:220], url=canonical(url), debut=iso(start), fin=iso(end),
                ville=clean(city)[:180], lieu=clean(venue)[:250], officiel=official, **extra)


def json_events(doc, url):
    result = []

    def visit(obj):
        if isinstance(obj, list):
            for child in obj:
                visit(child)
        elif isinstance(obj, dict):
            types = obj.get('@type', [])
            types = [types] if isinstance(types, str) else types
            if any(str(t).split('/')[-1].endswith('Event') for t in types):
                location = obj.get('location') or {}
                if isinstance(location, list):
                    location = next((x for x in location if isinstance(x, dict)), {})
                if isinstance(location, str):
                    location = {'name': location}
                address = location.get('address') or {}
                if not isinstance(address, dict):
                    address = {}
                country = address.get('addressCountry', '')
                if isinstance(country, dict):
                    country = country.get('name', '')
                if norm(country) not in ('', 'fr', 'france'):
                    return
                name = obj.get('name') or ''
                if name:
                    target = obj.get('url') or url
                    if not isinstance(target, str):
                        target = url
                    result.append(item(name, urljoin(url, target), obj.get('startDate'), obj.get('endDate'),
                                       address.get('addressLocality', ''), location.get('name', ''),
                                       code_postal=address.get('postalCode', ''), methode='jsonld',
                                       statut_evenement=str(obj.get('eventStatus', '')).split('/')[-1]))
            for value in obj.values():
                if isinstance(value, (dict, list)):
                    visit(value)
    for script in doc.root.walk('script'):
        if script.attrs.get('type', '').lower() == 'application/ld+json':
            try:
                visit(json.loads(''.join(x for x in script.children if isinstance(x, str))))
            except (ValueError, TypeError, AttributeError):
                continue
    return result


def parse_page(body, url, source):
    doc = Document(body)
    records, follows = [], []
    parser = source.get('parseur', 'generique')
    if parser == 'vinabox':
        for row in doc.root.walk('tr'):
            if 'data-public' not in row.attrs:
                continue
            cells = list(row.walk('td'))
            if len(cells) != 5:
                continue
            name = cells[1].first(cls='sdv-nom').text()
            official = next((urljoin(url, a.attrs['href']) for a in cells[4].walk('a')
                             if 'officiel' in norm(a.text()) and a.attrs.get('href')), '')
            ranges = french_ranges(cells[0].first('strong').text())
            start, end = ranges[0] if len(ranges) == 1 else (None, None)
            city = clean(' '.join(x for x in cells[2].children if isinstance(x, str)))
            records.append(item(name, official or url, start, end, city, cells[1].first(cls='sdv-sous').text(), official,
                                region=row.attrs.get('data-region', ''), public=row.attrs['data-public'], methode='table'))
            if official:
                follows.append(dict(url=official, type='officielle', parseur='generique', nom=name, ville=city, fiche=True))
        if not records:
            raise ValueError('Table de salons introuvable : structure Vinabox à contrôler')
    elif parser == 'nsalons':
        for card in doc.root.walk('article', 'card-tradeShow'):
            times = list(card.walk('time'))
            title = card.first('a')
            places = [n for n in card.walk('div', 'mb-3') if n.text().endswith('France')]
            place = places[0] if places else Node()
            # Le dernier segment après <br> porte la ville et le pays.
            segments, current = [], []
            for child in place.children:
                if isinstance(child, Node) and child.tag == 'br':
                    segments.append(clean(' '.join(current)))
                    current = []
                else:
                    current.append(child.text() if isinstance(child, Node) else child)
            segments.append(clean(' '.join(current)))
            city = re.sub(r',\s*France$', '', segments[-1])
            records.append(item(title.text(), card.attrs.get('data-href') or urljoin(url, title.attrs.get('href', '')),
                                times[0].attrs.get('datetime') if times else None,
                                times[-1].attrs.get('datetime') if times else None,
                                city, segments[0] if len(segments) > 1 else '', methode='carte'))
        if not records:
            raise ValueError('Cartes de salons introuvables : structure nSalons à contrôler')
        for a in doc.root.walk('a'):
            link = urljoin(url, a.attrs.get('href', ''))
            p = urlsplit(link)
            page = dict(parse_qsl(p.query)).get('page', '')
            if host(link) == host(url) and p.path.rstrip('/') == urlsplit(source['racine']).path.rstrip('/') and page.isdigit() and int(page) <= 4:
                follows.append(dict(source, url=link))
    else:
        # Une commune peut publier dans le même agenda un salon, un don du sang
        # et une fête scolaire. Le balisage Event seul ne prouve pas la pertinence.
        records.extend(r for r in json_events(doc, url)
                       if WINE.search(norm(r['nom'])) or source.get('reseau_viticole'))
        if parser == 'auxvignobles':
            for a in doc.root.walk('a'):
                link = urljoin(url, a.attrs.get('href', ''))
                if host(link) != host(url) or not urlsplit(link).path.startswith('/salon/'):
                    continue
                text = a.text()
                ranges = french_ranges(text)
                if len(ranges) == 1:
                    slug = urlsplit(link).path.rstrip('/').split('/')[-1].replace('-', ' ').title()
                    records.append(item('Aux Vignobles! ' + slug, link, *ranges[0], city=slug, official=link, methode='reseau'))
        # La fiche locale connue fournit l'identité, jamais les jours de l'année suivante.
        if not records and source.get('connu'):
            known = source['connu']
            main = doc.root.first('main')
            text = (main if main.tag else doc.root).text()
            pairs = french_ranges(text)
            year_pairs = [p for p in pairs if p[0][:4] == str(known['edition'])]
            unique = len(year_pairs) == 1
            records.append(item(known['nom'], url, *(year_pairs[0] if unique else (None, None)),
                                city=known['ville'], official=url, methode='texte' if unique else 'surveillance',
                                dates_reperees=[list(p) for p in pairs[:20]], catalogue_id=known['id']))
        # Une fiche de réseau non structurée : signaler toutes les possibilités au lieu d'en choisir une.
        if not records and source.get('nom') and source.get('fiche'):
            main = doc.root.first('main')
            text = (main if main.tag else doc.root).text()
            pairs = french_ranges(text)
            records.append(item(source['nom'], url, *(pairs[0] if len(pairs) == 1 else (None, None)),
                                city=source.get('ville', ''), official=url, methode='texte' if len(pairs) == 1 else 'surveillance',
                                dates_reperees=[list(p) for p in pairs[:20]]))
        for a in doc.root.walk('a'):
            target = urljoin(url, a.attrs.get('href', ''))
            if source.get('suivre') and host(target) == host(url) and urlsplit(target).path.startswith(source['suivre']):
                follows.append(dict(source, url=target, fiche=True,
                                    nom=clean(a.text())[:160] or source.get('nom', 'Salon à identifier')))
    for r in records:
        r.update(source=url, type_source=source['type'])
        if source['type'] == 'officielle':
            r['officiel'] = r['officiel'] or r['url']
        if r['debut'] and r['fin'] and r['fin'] < r['debut']:
            r.update(debut=None, fin=None, erreur_dates='Fin antérieure au début')
    # Ne pas aspirer les articles, les descriptions, les prix ou les coordonnées personnelles.
    return records, follows


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Fetcher:
    def __init__(self, folder, delay=0.8, timeout=18, offline=False):
        self.folder, self.delay, self.timeout, self.offline = folder, delay, timeout, offline
        self.folder.mkdir(parents=True, exist_ok=True)
        self.opener = build_opener(NoRedirect())
        self.robots, self.last, self.host_delays, self.robots_errors = {}, {}, {}, {}

    def paths(self, url):
        prefix = self.folder / digest(canonical(url))
        return prefix.with_suffix('.json'), prefix.with_suffix('.body')

    def raw(self, url, headers):
        public_url(url)
        domain = host(url)
        pause = self.host_delays.get(domain, self.delay) - (time.monotonic() - self.last.get(domain, 0))
        if pause > 0:
            time.sleep(pause)
        self.last[domain] = time.monotonic()
        req = Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'identity', **headers})
        try:
            response = self.opener.open(req, timeout=self.timeout)
        except HTTPError as exc:
            if exc.code in (301, 302, 303, 307, 308):
                return exc.code, dict(exc.headers), b''
            if exc.code == 304:
                return 304, dict(exc.headers), b''
            raise
        with response:
            body = response.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                raise ValueError('Page trop volumineuse (limite 5 Mo)')
            return response.status, dict(response.headers), body

    def allowed(self, url):
        p = urlsplit(url)
        origin = f'{p.scheme}://{p.netloc}'
        if origin in self.robots_errors:
            raise ValueError(self.robots_errors[origin])
        if origin not in self.robots:
            try:
                status, headers, body = self.raw(origin + '/robots.txt', {})
                for _ in range(4):
                    if status not in (301, 302, 303, 307, 308):
                        break
                    target = canonical(urljoin(origin + '/robots.txt', headers.get('Location', headers.get('location', ''))))
                    if host(target) != host(url) or urlsplit(target).path != '/robots.txt':
                        raise ValueError('Redirection robots.txt hors origine attendue')
                    status, headers, body = self.raw(target, {})
                if status != 200:
                    raise ValueError('robots.txt indisponible')
                parser = RobotFileParser()
                parser.parse(body.decode('utf-8', errors='replace').splitlines())
                self.robots[origin] = parser
                crawl_delay = parser.crawl_delay(UA)
                if crawl_delay:
                    if crawl_delay > 30:
                        raise ValueError(f'Crawl-delay de {crawl_delay} s : source laissée en vérification manuelle')
                    self.host_delays[host(url)] = max(self.delay, float(crawl_delay))
            except HTTPError as exc:
                if exc.code not in (404, 410):
                    message = f'robots.txt inaccessible : HTTP {exc.code}'
                    self.robots_errors[origin] = message
                    raise ValueError(message) from exc
                self.robots[origin] = None
            except (ValueError, OSError, URLError) as exc:
                self.robots_errors[origin] = str(exc)
                raise
        parser = self.robots[origin]
        return parser is None or parser.can_fetch(UA, url)

    def get(self, url):
        url = canonical(url)
        meta_path, body_path = self.paths(url)
        meta = json.loads(meta_path.read_text('utf-8')) if meta_path.exists() else {}
        if self.offline:
            if not body_path.exists():
                raise ValueError('Aucune copie locale disponible')
            return body_path.read_text('utf-8'), 'cache hors ligne', meta.get('final', url)
        original = url
        for _ in range(6):
            if not self.allowed(url):
                raise ValueError('Accès refusé par robots.txt')
            headers = {}
            if body_path.exists() and url == meta.get('final', original):
                if meta.get('etag'):
                    headers['If-None-Match'] = meta['etag']
                if meta.get('modified'):
                    headers['If-Modified-Since'] = meta['modified']
            status, response_headers, body = self.raw(url, headers)
            h = {k.lower(): v for k, v in response_headers.items()}
            if status in (301, 302, 303, 307, 308):
                url = canonical(urljoin(url, h['location']))
                continue
            if status == 304:
                if not body_path.exists():
                    raise ValueError('Réponse 304 sans copie locale')
                return body_path.read_text('utf-8'), 'non modifiée (304)', url
            content_type = h.get('content-type', '')
            if not any(t in content_type.lower() for t in ('html', 'xml', 'text/plain')):
                raise ValueError('Format non pris en charge : ' + content_type[:100])
            charset = re.search(r'charset=["\x27]?([\w-]+)', content_type)
            text = body.decode(charset[1] if charset else 'utf-8', errors='replace')
            atomic(body_path, text)
            atomic(meta_path, json.dumps(dict(final=url, etag=h.get('etag'), modified=h.get('last-modified'))))
            return text, 'chargée', url
        raise ValueError('Trop de redirections')


def atomic(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_text(text, encoding='utf-8', newline='\n')
    os.replace(temporary, path)


def read_json(path, default):
    return json.loads(path.read_text('utf-8')) if path.exists() else default


def catalog(folder):
    records = []
    for filename in ('evenements.json', 'evenements-locaux.json'):
        data = read_json(folder / filename, {'evenements': []})
        for event in data['evenements']:
            event = dict(event)
            if event.get('page'):
                event['sources'] = [['Édition', 'https://www.vignerons-independants.com/agenda-des-salons/' + event['page']]]
            records.append(event)
    return records


def identity_name(value):
    text = norm(re.sub(r'\b20\d{2}\b', '', value))
    text = re.sub(r'\b\d+(?:e|eme)?\s+edition\b', '', text)
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def comparable_city(value):
    return identity_name(value)


def cities_compatible(a, b):
    a, b = comparable_city(a), comparable_city(b)
    return not a or not b or bool(re.search(r'\b' + re.escape(a) + r'\b', b)) or bool(re.search(r'\b' + re.escape(b) + r'\b', a))


def possible_duplicates(candidates):
    """Signaler les alias sans fusion incertaine des fiches de deux annuaires."""
    stop = {'salon', 'salons', 'vin', 'vins', 'du', 'de', 'des', 'le', 'la', 'les', 'et', 'a', 'en', 'edition'}
    pairs = 0
    for c in candidates:
        c['doublons_possibles'] = []
    for i, a in enumerate(candidates):
        if not a['dates'] or not a['ville']:
            continue
        tokens_a = set(identity_name(a['nom']).split()) - stop - set(comparable_city(a['ville']).split())
        for b in candidates[i + 1:]:
            if a['dates'] != b['dates'] or not b['ville'] or not cities_compatible(a['ville'], b['ville']):
                continue
            tokens_b = set(identity_name(b['nom']).split()) - stop - set(comparable_city(b['ville']).split())
            common = tokens_a & tokens_b
            if len(common) >= 2 and len(common) / min(len(tokens_a), len(tokens_b)) >= 0.65:
                a['doublons_possibles'].append(b['id'])
                b['doublons_possibles'].append(a['id'])
                pairs += 1
    return pairs


def group_records(observations, previous, published, today):
    """Regroupement prudent : URL de fiche + année, sinon nom/ville/dates identiques.

    Une page d'accueil ne constitue jamais l'identité d'une édition. Les deux
    sessions annuelles d'une même fiche restent séparées si les mois diffèrent.
    """
    rows = []
    old = previous.get('candidats', [])
    for observation in observations.values():
        for record in observation.get('evenements', []):
            record = dict(record, derniere_observation=observation['vu_le'])
            if record.get('nom'):
                rows.append(record)
    rows.sort(key=lambda r: (r['type_source'] != 'officielle', r['url'], r['nom']))
    groups = []
    for r in rows:
        year = r['debut'][:4] if r['debut'] else next(iter(re.findall(r'\b20\d{2}\b', r['nom'])), '')
        keys = {url_key(u) for u in (r.get('officiel'), r['url']) if u and urlsplit(u).path.strip('/')}
        match = None
        for g in groups:
            if year and g['annee'] and year != g['annee']:
                continue
            same_page = bool(keys & g['_urls'])
            # Un même organisateur peut réutiliser sa fiche pour deux saisons.
            far_apart = r['debut'] and any(abs((date.fromisoformat(r['debut']) - date.fromisoformat(x['debut'])).days) > 45
                                                   for x in g['preuves'] if x['debut'])
            same_name = identity_name(r['nom']) == identity_name(g['nom']) and comparable_city(r['ville']) == comparable_city(g['ville'])
            same_dates = any((r['debut'], r['fin']) == (p['debut'], p['fin']) for p in g['preuves'])
            if (same_page and not far_apart and cities_compatible(r['ville'], g['ville'])) or (same_name and same_dates and bool(r['ville'])):
                match = g
                break
        if match is None:
            match = dict(nom=r['nom'], ville=r['ville'], annee=year, _urls=set(), preuves=[])
            groups.append(match)
        match['_urls'].update(keys)
        match['preuves'].append(r)
        if not match['annee']:
            match['annee'] = year
        if not match['ville']:
            match['ville'] = r['ville']
    output = []
    used_ids = set()
    for g in groups:
        proofs = g['preuves']
        official = [p for p in proofs if p['type_source'] == 'officielle']
        pairs = sorted(set((p['debut'], p['fin']) for p in proofs if p['debut'] and p['fin']))
        official_pairs = sorted(set((p['debut'], p['fin']) for p in official if p['debut'] and p['fin']))
        cancelled = any(p.get('statut_evenement') in ('EventCancelled', 'EventPostponed') for p in official)
        status = ('annulation_ou_report' if cancelled else 'dates_en_conflit' if len(pairs) > 1 else
                  'dates_source_officielle' if len(official_pairs) == 1 else 'dates_annuaire' if pairs else 'dates_a_verifier')
        all_urls = g.pop('_urls')
        pub = []
        for event in published:
            ep = {url_key(u) for _, u in event.get('sources', []) if urlsplit(u).path.strip('/')}
            name_city = identity_name(event['nom']) == identity_name(g['nom']) and comparable_city(event['ville']) == comparable_city(g['ville'])
            explicit = any(p.get('catalogue_id') == event['id'] for p in proofs)
            if (explicit or bool(ep & all_urls) or name_city) and (not g['annee'] or str(event['edition']) == g['annee']):
                pub.append(event)
        prior = next((o for o in old if o['id'] not in used_ids and o.get('annee') == g['annee'] and cities_compatible(o['ville'], g['ville']) and
                      (any(url_key(p['url']) in all_urls for p in o['preuves'] if urlsplit(p['url']).path.strip('/')) or
                       (identity_name(o['nom']) == identity_name(g['nom']) and comparable_city(o['ville']) == comparable_city(g['ville']))) and
                      (not pairs or not o.get('dates') or min(abs((date.fromisoformat(pairs[0][0]) - date.fromisoformat(p[0])).days) for p in o['dates']) <= 45)), None)
        identifier = prior['id'] if prior else digest('|'.join([identity_name(g['nom']), comparable_city(g['ville']), g['annee'], pairs[0][0] if pairs else '', sorted(all_urls)[0] if all_urls else '']))
        used_ids.add(identifier)
        published_pairs = {(x.get('debut'), x.get('fin')) for x in pub}
        difference = bool(pub and pairs and (len(pairs) != 1 or pairs[0] not in published_pairs))
        # Les observations conservées après un échec gardent leur date d'observation.
        seen = max(p['derniere_observation'] for p in proofs)
        output.append(dict(g, id=identifier, statut=status, dates=[list(x) for x in pairs],
                           premiere_observation=prior['premiere_observation'] if prior else today,
                           derniere_observation=seen, deja_publie=[x['id'] for x in pub],
                           ecart_catalogue=difference,
                           edition_terminee=bool(pairs and all(b < today[:10] for _, b in pairs)),
                           empreinte=digest(json.dumps(sorted(json.dumps({k: v for k, v in p.items() if k != 'derniere_observation'},
                                                                         ensure_ascii=False, sort_keys=True) for p in proofs), ensure_ascii=False))))
    return sorted(output, key=lambda g: (g['edition_terminee'], g['dates'][0][0] if g['dates'] else '9999', norm(g['nom'])))


def report_html(report):
    esc = lambda x: html.escape(str(x), quote=True)
    rows = []
    previous = report['precedents']
    for c in report['candidats']:
        if c['edition_terminee']:
            continue
        change = 'Nouveau' if c['id'] not in previous else 'Modifié' if previous[c['id']] != c['empreinte'] else 'Inchangé'
        dates = ' / '.join(' → '.join(pair) for pair in c['dates']) or 'Dates non déterminées'
        sources = ''.join(f'<li><a href="{esc(p["source"])}" rel="noreferrer">{esc(host(p["source"]))}</a> · {esc(p["type_source"])} · {esc(p["methode"])} · observée {esc(p["derniere_observation"][:10])}</li>'
                          for p in c['preuves'])
        label = {'dates_en_conflit':'Dates contradictoires', 'dates_source_officielle':'Dates lues dans une source officielle',
                 'dates_annuaire':'Dates d’annuaire à confirmer', 'dates_a_verifier':'Lecture manuelle nécessaire',
                 'annulation_ou_report':'Annulation ou report annoncé'}[c['statut']]
        cat = 'Déjà dans Mon Chai' if c['deja_publie'] else 'Absent du catalogue'
        if c['ecart_catalogue']:
            cat += ' : calendrier à revoir'
        duplicates = ''
        if c.get('doublons_possibles'):
            duplicates = '<p>Doublon possible : ' + ', '.join(f'<a href="#{esc(i)}">comparer la fiche</a>' for i in c['doublons_possibles']) + '.</p>'
        rows.append(f'<article id="{esc(c["id"])}"><p class="tag">{change} · {cat}</p><h2>{esc(c["nom"])}</h2><p>{esc(c["ville"] or "Commune à vérifier")} · {esc(dates)}</p><p><strong>{label}</strong></p>{duplicates}<details><summary>Sources et identifiant de suivi</summary><p>{esc(c["id"])}</p><ul>{sources}</ul><p>Première observation : {esc(c["premiere_observation"][:10])}. Dernière observation : {esc(c["derniere_observation"][:10])}.</p></details></article>')
    errors = ''.join(f'<li><a href="{esc(s["url"])}" rel="noreferrer">{esc(s["url"])}</a> : {esc(s["erreur"])}</li>' for s in report['sources'] if s.get('erreur'))
    s = report['bilan']
    return f'''<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Veille des salons Mon Chai</title>
<style>body{{font:17px/1.6 system-ui,sans-serif;background:#faf7f1;color:#30262a;max-width:1050px;margin:0 auto;padding:24px}}h1{{font-size:clamp(1.7rem,5vw,2.8rem)}}a{{color:#761d38;overflow-wrap:anywhere}}a:focus-visible,summary:focus-visible{{outline:3px solid #761d38;outline-offset:4px}}article,aside{{background:white;padding:20px;border:1px solid #ded4d5;border-radius:12px;margin:18px 0}}h2{{font-size:1.25rem;margin:0}}summary{{cursor:pointer;min-height:44px}}.tag{{color:#74324a;font-weight:650}}li{{margin:10px 0}}code{{overflow-wrap:anywhere}}</style>
<main><h1>Veille des salons viticoles</h1><p>Collecte du {esc(report['date'])}. {esc(report['mode'])}.</p>
<p><strong>{s['nouveaux']} nouveaux · {s['modifies']} modifiés · {s['a_venir']} à venir ou sans dates</strong></p>
<p>{s['candidats']} éditions candidates après regroupement ; {s['absents_catalogue']} à venir ou sans dates absentes du catalogue ; {s['conflits']} conflits de calendrier, {s['doublons_possibles']} paires de doublons possibles à comparer. {s['pages_ok']} pages lues, dont {s['pages_modifiees']} modifiées ; {s['erreurs']} erreurs, {s['en_attente']} pages laissées au prochain passage. {s['non_retrouves']} anciennes fiches candidates ne sont plus retrouvées dans les pages lues (détail dans le JSON).</p>
<aside><h2>À faire après la collecte</h2><p>Ouvrir la source officielle, vérifier les jours, le lieu et l’admission des exposants, puis compléter la fiche éditoriale. Une date lue automatiquement ne constitue pas une validation de publication. Les erreurs de source conservent les observations antérieures. Aucun salon n’a été publié par ce script.</p><p>Les prix d’entrée et les prix des stands ne sont pas confondus : ils ne sont pas importés automatiquement.</p><p><a href="candidats.csv">Ouvrir le tableau CSV</a> · <a href="rapport.json">Consulter le rapport JSON</a></p></aside>
<details {'open' if errors else ''}><summary>Erreurs et couverture partielle ({s['erreurs']})</summary><ul>{errors or '<li>Aucune erreur signalée.</li>'}</ul><p>La couverture dépend des sources configurées. Les liens sortant des chemins autorisés, les PDF/images et les pages interdites par robots.txt ne sont pas explorés.</p></details>
{''.join(rows) or '<p>Aucune édition à venir repérée. Contrôlez les erreurs et la configuration des sources.</p>'}</main></html>'''


def save_reports(folder, report):
    payload = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    atomic(folder / 'rapport.json', payload)
    atomic(folder / 'rapport.html', report_html(report))
    buffer = io.StringIO(newline='')
    writer = csv.writer(buffer, delimiter=';')
    writer.writerow(['Identifiant', 'Nom', 'Commune', 'Dates', 'Statut', 'Déjà publié', 'Écart catalogue', 'Sources'])
    for c in report['candidats']:
        values = [c['id'], c['nom'], c['ville'], ' / '.join(' - '.join(x) for x in c['dates']), c['statut'],
                  ', '.join(c['deja_publie']), 'oui' if c['ecart_catalogue'] else '', ' '.join(sorted(set(p['source'] for p in c['preuves'])))]
        # Un nom trouvé sur le web ne devient pas une formule Excel.
        writer.writerow(["'" + str(x) if str(x).lstrip().startswith(('=', '+', '-', '@')) else x for x in values])
    atomic(folder / 'candidats.csv', '\ufeff' + buffer.getvalue())
    atomic(folder / 'historique' / (report['date'].replace(':', '-') + '.json'), payload)


def run(args):
    folder = args.sortie.resolve()
    folder.mkdir(parents=True, exist_ok=True)
    lock = folder / 'collecte.lock'
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        print(f'Une collecte est déjà active (ou interrompue). Verrou : {lock}', file=sys.stderr)
        return 3
    os.close(fd)
    try:
        return collect(args, folder)
    finally:
        lock.unlink()


def collect(args, folder):
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    today = datetime.now().date().isoformat()
    config = read_json(args.sources, {})
    if config.get('version') != 1 or not config.get('sources'):
        raise ValueError('Configuration de sources absente ou version non reconnue')
    published = catalog(args.catalogue)
    state = read_json(folder / 'etat.json', {'version': 1, 'observations': {}, 'candidats': []})
    if state.get('version') != 1:
        raise ValueError('Version d’historique non reconnue')
    previous = {c['id']: c['empreinte'] for c in state['candidats']}
    observations = state['observations']
    queue = [dict(s, racine=s['url'], profondeur=0) for s in config['sources']]
    # Réexaminer les pages qui n'avaient pas tenu dans le budget précédent.
    queue.extend(state.get('en_attente', []))
    for event in published:
        for _, url in event.get('sources', []):
            if urlsplit(url).path.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
                continue
            queue.append(dict(url=url, type='officielle', parseur='generique', nom=event['nom'], connu=event,
                              racine=url, profondeur=0))
    queue.extend(dict(url=u, racine=u, type='officielle', parseur='generique', profondeur=0) for u in args.source)
    fetcher = Fetcher(folder / 'cache', args.delai, args.timeout, args.hors_ligne)
    sources, seen = [], set()
    i, pages = 0, 0
    deadline = time.monotonic() + getattr(args, 'max_minutes', 20) * 60
    while i < len(queue) and pages < args.max_pages and time.monotonic() < deadline:
        source = queue[i]
        i += 1
        try:
            url = canonical(source['url'])
            key = url_key(url)
        except ValueError:
            continue
        if key in seen:
            continue
        seen.add(key)
        pages += 1
        result = dict(url=url, type=source['type'])
        print(f'[{pages}/{args.max_pages}] {url}', flush=True)
        try:
            body, cache_status, final = fetcher.get(url)
            records, follows = parse_page(body, final, dict(source, racine=source.get('racine', url)))
            # Des liens de catalogue sans parseur dédié doivent donner un signe observable.
            if not records and not follows:
                raise ValueError('Aucun événement exploitable : lecture manuelle ou parseur à compléter')
            stamp = observations.get(key, {}).get('vu_le', now) if args.hors_ligne else now
            observations[key] = dict(url=url, vu_le=stamp, evenements=records, empreinte=digest(body),
                                     empreinte_precedente=observations.get(key, {}).get('empreinte'))
            result.update(etat=cache_status, nombre=len(records),
                          page_modifiee=bool(observations[key]['empreinte_precedente'] and observations[key]['empreinte_precedente'] != digest(body)))
            if source.get('profondeur', 0) < 2:
                for follow in follows:
                    follow.setdefault('racine', source.get('racine', url))
                    follow['profondeur'] = source.get('profondeur', 0) + 1
                    queue.append(follow)
        except (HTTPError, URLError, OSError, ValueError, KeyError, UnicodeError, RecursionError) as exc:
            result.update(erreur=str(exc)[:350], observations_conservees=key in observations)
        sources.append(result)
    pending, pending_keys = [], set()
    for s in queue[i:]:
        try:
            key = url_key(s['url'])
            if key not in seen and key not in pending_keys:
                pending.append(s)
                pending_keys.add(key)
        except ValueError:
            pass
    candidates = group_records(observations, state, published, now)
    future = [c for c in candidates if not c['edition_terminee']]
    duplicate_count = possible_duplicates(future)
    errors = sum(bool(s.get('erreur')) for s in sources)
    missing = [c for c in state['candidats'] if c['id'] not in {x['id'] for x in candidates}]
    summary = dict(candidats=len(candidates), a_venir=len(future), absents_catalogue=sum(not c['deja_publie'] for c in future),
                   nouveaux=sum(c['id'] not in previous for c in future),
                   modifies=sum(c['id'] in previous and previous[c['id']] != c['empreinte'] for c in future),
                   conflits=sum(c['statut'] == 'dates_en_conflit' for c in future), pages_ok=len(sources) - errors,
                   erreurs=errors, en_attente=len(pending), pages_modifiees=sum(bool(s.get('page_modifiee')) for s in sources),
                   non_retrouves=len(missing), doublons_possibles=duplicate_count)
    report = dict(version=1, date=now, mode='Relecture hors ligne, fraîcheur non renouvelée' if args.hors_ligne else 'Collecte web',
                  bilan=summary, precedents=previous, sources=sources, candidats=candidates, en_attente=pending,
                  non_retrouves=missing)
    save_reports(folder, report)
    # Un rapport hors ligne permet de diagnostiquer sans avancer l'état de la veille.
    if not args.hors_ligne:
        atomic(folder / 'etat.json', json.dumps(dict(version=1, observations=observations, candidats=candidates,
                                                     en_attente=pending, derniere_collecte=now), ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(summary, ensure_ascii=False), flush=True)
    print(f'Rapport : {folder / "rapport.html"}', flush=True)
    if args.ouvrir:
        webbrowser.open((folder / 'rapport.html').as_uri())
    # 2 = rapport partiel ; 1 = aucune source lue ; 3 = verrou ; 0 = collecte complète.
    return 1 if not summary['pages_ok'] else 2 if errors or pending else 0


def main():
    default = Path(os.environ.get('LOCALAPPDATA', Path.home() / '.local' / 'share')) / 'MonChai' / 'VeilleSalons' / 'resultats'
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources', type=Path, default=HERE / 'sources.json')
    parser.add_argument('--catalogue', type=Path, default=HERE.parent)
    parser.add_argument('--sortie', type=Path, default=default)
    parser.add_argument('--source', action='append', default=[], help='Page officielle supplémentaire (JSON-LD Event)')
    parser.add_argument('--max-pages', type=int, default=220)
    parser.add_argument('--max-minutes', type=float, default=20, help='Budget global ; conserve les pages restantes pour la relance')
    parser.add_argument('--delai', type=float, default=0.8, help='Pause minimale entre requêtes au même domaine')
    parser.add_argument('--timeout', type=float, default=18)
    parser.add_argument('--hors-ligne', action='store_true')
    parser.add_argument('--ouvrir', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.max_pages <= 1000 or not 1 <= args.max_minutes <= 120 or args.delai < 0.5 or not 1 <= args.timeout <= 60:
        parser.error('max-pages : 1 à 1000 ; max-minutes : 1 à 120 ; delai >= 0.5 ; timeout : 1 à 60')
    try:
        return run(args)
    except (OSError, ValueError, KeyError) as exc:
        print('Collecte interrompue : ' + str(exc), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
