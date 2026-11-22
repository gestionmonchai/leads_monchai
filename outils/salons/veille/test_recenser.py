"""Contrats de collecte : dates, provenance, reprises et absence de publication."""
import argparse
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError

import recenser as v


def source(**kwargs):
    return dict(url='https://example.org/salons', racine='https://example.org/salons',
                type='officielle', parseur='generique', **kwargs)


def evidence(name='Salon de Tours', url='https://example.org/tours', start='2027-03-02', end='2027-03-03',
             city='Tours', kind='officielle', page='https://example.org/tours', **kwargs):
    return dict(v.item(name, url, start, end, city, official=url if kind == 'officielle' else '', methode='jsonld'),
                type_source=kind, source=page, **kwargs)


def observe(*rows):
    return {str(i): dict(vu_le='2026-11-22T12:00:00+00:00', evenements=[r]) for i, r in enumerate(rows)}


class Dates(unittest.TestCase):
    def test_french_explicit_dates(self):
        cases = {
            'du 27 au 29 novembre 2026': [('2026-11-27', '2026-11-29')],
            'Samedi 3 et dimanche 4 avril 2027': [('2027-04-03', '2027-04-04')],
            '2 / 3 / 4 Avril 2027': [('2027-04-02', '2027-04-04')],
            '30 octobre au 2 novembre 2026': [('2026-10-30', '2026-11-02')],
            '30 / 31 Oct. / 1 / 2 Novembre 2026': [('2026-10-30', '2026-11-02')],
            '31 décembre 2026 au 2 janvier 2027': [('2026-12-31', '2027-01-02')],
            'Samedi 28 novembre 2026': [('2026-11-28', '2026-11-28')],
            'édition 2027 en construction ; copyright 2026': [],
            '30 février 2027': [],
        }
        for text, expected in cases.items():
            with self.subTest(text=text):
                self.assertEqual(v.french_ranges(text), expected)

    def test_never_roll_an_edition_forward(self):
        known = dict(id='local-2027', nom='Salon local', ville='Blois', edition=2027)
        rows, _ = v.parse_page('<main>Édition 2027 en préparation. Ancienne édition du 2 au 3 mars 2026.</main>',
                               'https://example.org/local', source(connu=known))
        self.assertIsNone(rows[0]['debut'])
        self.assertEqual(rows[0]['dates_reperees'], [['2026-03-02', '2026-03-03']])


class Parsers(unittest.TestCase):
    def test_vinabox_facts_and_official_follow(self):
        text = '''<table><tr data-public="grand_public" data-region="Bretagne">
        <td><strong>Du 30 octobre au 2 novembre 2026</strong></td>
        <td><span class="sdv-nom">Aux Vignobles! Rennes</span><span class="sdv-sous">Parc Expo</span></td>
        <td>Bruz (Rennes)<span class="sdv-sous">Bretagne</span></td><td>Prix visiteur</td>
        <td><a href="https://example.org/rennes">Site officiel</a></td></tr></table>'''
        rows, follow = v.parse_page(text, 'https://example.net/salons', dict(source(), parseur='vinabox', type='annuaire'))
        self.assertEqual(rows[0]['debut'], '2026-10-30')
        self.assertEqual(rows[0]['ville'], 'Bruz (Rennes)')
        self.assertEqual(rows[0]['type_source'], 'annuaire')
        self.assertEqual(follow[0]['type'], 'officielle')
        self.assertNotIn('prix', rows[0])

    def test_nsalons_ignores_bad_itemprop_enddate(self):
        text = '''<article class="card card-tradeShow" data-href="https://example.net/local/">
        <a href="/local/">Salon Local 2027</a><time itemprop="startDate" datetime="2027-03-02T00:00:00Z">2</time>
        <time itemprop="startDate" datetime="2027-03-03T00:00:00Z">3</time>
        <div class="mb-3">Salle locale<br>Tours, France</div></article>'''
        rows, _ = v.parse_page(text, 'https://example.net/vin/france/', dict(source(), parseur='nsalons', type='annuaire'))
        self.assertEqual((rows[0]['debut'], rows[0]['fin']), ('2027-03-02', '2027-03-03'))
        self.assertEqual(rows[0]['ville'], 'Tours')

    def test_jsonld_graph_multiple_country_and_cancellation(self):
        events = {'@graph': [
            {'@type': 'Event', 'name': 'Salon français', 'startDate': '2027-03-02T11:00:00+01:00',
             'endDate': '2027-03-03', 'eventStatus': 'https://schema.org/EventCancelled',
             'location': {'name': 'Salle', 'address': {'addressCountry': 'FR', 'addressLocality': 'Tours'}}},
            {'@type': 'Event', 'name': 'Étranger', 'location': {'address': {'addressCountry': 'US'}}},
        ]}
        rows, _ = v.parse_page('<script type="application/ld+json">' + json.dumps(events) + '</script>',
                               'https://example.org/tours', source())
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['statut_evenement'], 'EventCancelled')
        self.assertEqual(rows[0]['ville'], 'Tours')

    def test_source_layout_failure_is_an_error(self):
        with self.assertRaisesRegex(ValueError, 'structure'):
            v.parse_page('<p>Plus de tableau</p>', 'https://example.org/', dict(source(), parseur='vinabox'))


class Dedupe(unittest.TestCase):
    def test_deduplicate_official_url_alias_and_flag_conflict(self):
        first = evidence()
        second = evidence(name='Tours Mer & Vigne', start='2027-03-03', end='2027-03-04', kind='annuaire',
                          page='https://example.net/list')
        rows = v.group_records(observe(first, second), {}, [], '2026-11-22T12:00:00+00:00')
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['statut'], 'dates_en_conflit')
        self.assertEqual(len(rows[0]['preuves']), 2)

    def test_distinct_seasons_and_years(self):
        a = evidence()
        b = evidence(start='2027-11-02', end='2027-11-03')
        c = evidence(start='2028-03-02', end='2028-03-03')
        self.assertEqual(len(v.group_records(observe(a, b, c), {}, [], '2026-11-22')), 3)

    def test_root_url_does_not_collapse_local_fairs(self):
        a = evidence(url='https://example.org/', name='Salon A')
        b = evidence(url='https://example.org/', name='Salon B')
        self.assertEqual(len(v.group_records(observe(a, b), {}, [], '2026-11-22')), 2)

    def test_shared_network_calendar_does_not_merge_different_cities(self):
        a = evidence(city='Nancy', name='Vignerons Nancy')
        b = evidence(city='Les Ponts-de-Cé', name='Vignerons Ponts-de-Cé', start='2027-04-02', end='2027-04-04')
        self.assertEqual(len(v.group_records(observe(a, b), {}, [], '2026-11-22')), 2)

    def test_alias_without_shared_url_is_a_possible_duplicate(self):
        a = evidence(name='Le Grand Tasting', city='Paris')
        b = evidence(name='Le Grand Tasting Paris Bettane Desseauve', city='Paris', url='https://other.org/tasting')
        rows = v.group_records(observe(a, b), {}, [], '2026-11-22')
        self.assertEqual(len(rows), 2)
        self.assertEqual(v.possible_duplicates(rows), 1)
        self.assertEqual(rows[0]['doublons_possibles'], [rows[1]['id']])

    def test_stable_id_and_detect_venue_change(self):
        a = evidence()
        first = v.group_records(observe(a), {}, [], '2026-11-22')
        a['lieu'] = 'Nouvelle salle'
        second = v.group_records(observe(a), {'candidats': first}, [], '2026-11-23')
        self.assertEqual(first[0]['id'], second[0]['id'])
        self.assertNotEqual(first[0]['empreinte'], second[0]['empreinte'])
        self.assertEqual(first[0]['premiere_observation'], second[0]['premiere_observation'])

    def test_compare_published_without_writing_it(self):
        event = dict(id='tours-2027', nom='Salon de Tours', ville='Tours', edition=2027,
                     debut='2027-03-01', fin='2027-03-03', sources=[['Officiel', 'https://example.org/tours']])
        rows = v.group_records(observe(evidence()), {}, [event], '2026-11-22')
        self.assertEqual(rows[0]['deja_publie'], ['tours-2027'])
        self.assertTrue(rows[0]['ecart_catalogue'])
        self.assertEqual(event['debut'], '2027-03-01')


class Network(unittest.TestCase):
    def test_public_url_refuses_local_and_credentials(self):
        with patch.object(v.socket, 'getaddrinfo', return_value=[(2, 1, 6, '', ('127.0.0.1', 80))]):
            with self.assertRaises(ValueError):
                v.public_url('http://localhost/private')
        with self.assertRaises(ValueError):
            v.canonical('https://user:password@example.org/')
        with self.assertRaises(ValueError):
            v.canonical('javascript:alert(1)')

    def test_cache_304_and_offline(self):
        with tempfile.TemporaryDirectory() as temp:
            fetcher = v.Fetcher(Path(temp))
            with patch.object(fetcher, 'allowed', return_value=True), patch.object(fetcher, 'raw') as raw:
                raw.return_value = (200, {'Content-Type': 'text/html; charset=utf-8', 'ETag': 'abc'}, b'<main>salon</main>')
                fetcher.get('https://example.org/')
                raw.return_value = (304, {}, b'')
                body, status, _ = fetcher.get('https://example.org/')
                self.assertEqual(body, '<main>salon</main>')
                self.assertIn('304', status)
                self.assertEqual(raw.call_args.args[1], {'If-None-Match': 'abc'})
            fetcher.offline = True
            with patch.object(fetcher, 'raw', side_effect=AssertionError('Aucun réseau hors ligne')):
                self.assertEqual(fetcher.get('https://example.org/')[0], body)

    def test_redirect_rechecks_robots_and_private_target(self):
        with tempfile.TemporaryDirectory() as temp:
            fetcher = v.Fetcher(Path(temp))
            with patch.object(fetcher, 'allowed', side_effect=[True, False]) as allowed, patch.object(fetcher, 'raw', return_value=(302, {'Location': 'https://elsewhere.org/'}, b'')):
                with self.assertRaisesRegex(ValueError, 'robots'):
                    fetcher.get('https://example.org/')
                self.assertEqual(allowed.call_args.args[0], 'https://elsewhere.org/')

    def test_long_crawl_delay_is_not_shortened_or_applied_elsewhere(self):
        with tempfile.TemporaryDirectory() as temp:
            fetcher = v.Fetcher(Path(temp))
            with patch.object(fetcher, 'raw', return_value=(200, {}, b'User-agent: *\nCrawl-delay: 600\n')) as raw:
                with self.assertRaisesRegex(ValueError, '600'):
                    fetcher.allowed('https://example.org/page')
                with self.assertRaisesRegex(ValueError, '600'):
                    fetcher.allowed('https://example.org/autre')
                self.assertEqual(raw.call_count, 1)
                self.assertEqual(fetcher.delay, 0.8)


class DailyRun(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.config = self.root / 'sources.json'
        self.config.write_text(json.dumps({'version': 1, 'sources': [source()]}))
        self.args = argparse.Namespace(sources=self.config, catalogue=self.root, source=[],
                                       max_pages=10, delai=0.8, timeout=2, hors_ligne=False, ouvrir=False,
                                       sortie=self.root / 'resultats')
        self.body = '<script type="application/ld+json">' + json.dumps({
            '@type': 'Event', 'name': 'Salon vins', 'startDate': '2027-03-02', 'endDate': '2027-03-03',
            'location': {'address': {'addressLocality': 'Tours', 'addressCountry': 'FR'}}}) + '</script>'

    def run_fake(self, body=None, error=None):
        with patch.object(v.Fetcher, 'get', side_effect=error, return_value=(body or self.body, 'chargée', 'https://example.org/salons')), redirect_stdout(io.StringIO()):
            return v.run(self.args)

    def report(self):
        return json.loads((self.args.sortie / 'rapport.json').read_text('utf-8'))

    def test_first_repeat_failure_and_recovery(self):
        self.assertEqual(self.run_fake(), 0)
        self.assertEqual(self.report()['bilan']['nouveaux'], 1)
        self.assertEqual(self.run_fake(), 0)
        self.assertEqual(self.report()['bilan']['nouveaux'], 0)
        self.assertEqual(self.report()['bilan']['modifies'], 0)
        previous = self.report()['candidats'][0]['derniere_observation']
        self.assertEqual(self.run_fake(error=URLError('indisponible')), 1)
        failed = self.report()
        self.assertEqual(failed['bilan']['candidats'], 1)
        self.assertTrue(failed['sources'][0]['observations_conservees'])
        self.assertEqual(failed['candidats'][0]['derniere_observation'], previous)
        self.assertEqual(self.run_fake(self.body.replace('2027-03-03', '2027-03-04')), 0)
        self.assertEqual(self.report()['bilan']['modifies'], 1)
        self.assertFalse((self.root / 'evenements.json').exists())

    def test_locked_and_offline_never_updates_state(self):
        self.run_fake()
        state = (self.args.sortie / 'etat.json').read_bytes()
        self.args.hors_ligne = True
        self.run_fake()
        self.assertEqual((self.args.sortie / 'etat.json').read_bytes(), state)
        (self.args.sortie / 'collecte.lock').touch()
        self.assertEqual(self.run_fake(), 3)
        self.assertEqual((self.args.sortie / 'etat.json').read_bytes(), state)

    def test_budget_queue_survives_and_next_day_catches_up(self):
        config = {'version': 1, 'sources': [source(suivre='/fiche/')]}
        self.config.write_text(json.dumps(config))
        self.args.max_pages = 1
        first_body = '<a href="https://example.org/fiche/salon-vins">Salon vins</a>'
        with patch.object(v.Fetcher, 'get', return_value=(first_body, 'chargée', 'https://example.org/salons')), redirect_stdout(io.StringIO()):
            self.assertEqual(v.run(self.args), 2)
        self.assertEqual(self.report()['bilan']['en_attente'], 1)
        self.args.max_pages = 2
        with patch.object(v.Fetcher, 'get', side_effect=[(first_body, 'chargée', 'https://example.org/salons'),
                                                     (self.body, 'chargée', 'https://example.org/fiche/salon-vins')]), redirect_stdout(io.StringIO()):
            self.assertEqual(v.run(self.args), 0)
        self.assertEqual(self.report()['bilan']['en_attente'], 0)
        self.assertEqual(self.report()['bilan']['candidats'], 1)

    def test_injection_escaped_in_report_and_spreadsheet(self):
        body = self.body.replace('Salon vins', '=1+1 <img src=x onerror=alert(1)>')
        self.run_fake(body)
        rendered = (self.args.sortie / 'rapport.html').read_text('utf-8')
        self.assertNotIn('<img src=x', rendered)
        self.assertIn('&lt;img', rendered)
        self.assertIn("'=1+1", (self.args.sortie / 'candidats.csv').read_text('utf-8'))


if __name__ == '__main__':
    unittest.main()
