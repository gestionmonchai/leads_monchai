import copy
from datetime import date, timedelta
import unittest
from unittest.mock import patch
import lettre

def edition():
    today=date.today()
    lundi=today+timedelta(days=(7-today.weekday())%7 or 7)
    jour=today.isoformat()
    return {'demonstration':False,'statut':'relue','date_envoi':lundi.isoformat(),
            'periode':{'debut':jour,'fin':jour},'objet':'Les repères du lundi',
            'introduction':'Un récapitulatif vérifié.','relecture':{'par':'Équipe test','le':jour},
            'sources_consultees':[{'nom':'Douane','url':'https://www.douane.gouv.fr/','verifie_le':jour}],
            'points':[{'titre':'Sujet de test <script>','resume':'Résumé & limites',
                       'statut':'projet','perimetre':'France, périmètre de test',
                       'application':'Non adoptée','action':'Vérifier le texte définitif',
                       'publication':jour,'verification':jour,
                       'sources':['https://www.douane.gouv.fr/']} ]}

class LettreTests(unittest.TestCase):
    env={'BREVO_API_KEY':'cle-fictive','BREVO_LIST_ID':'12','BREVO_SENDER_EMAIL':'contact@monchai.fr'}
    def test_rendu_accessible_echappe_et_desinscription(self):
        html,plain=lettre.rendre(edition())
        self.assertIn('&lt;script&gt;',html)
        self.assertNotIn('<script>',html)
        self.assertIn('Projet — pas une obligation',html)
        self.assertIn('{{ unsubscribe }}',html)
        self.assertIn('{{ unsubscribe }}',plain)
        self.assertNotIn('<img',html)
        self.assertIn('role="presentation"',html)

    def test_sources_non_officielles_et_dates_futures_refusees(self):
        for url in ('https://douane.gouv.fr.exemple.org/','http://www.douane.gouv.fr/',
                    'https://utilisateur@www.douane.gouv.fr/', 'https://www.douane.gouv.fr/{{contact.EMAIL}}'):
            e=edition();e['points'][0]['sources']=[url]
            with self.subTest(url=url),self.assertRaises(ValueError):lettre.valider(e)
        e=edition();e['points'][0]['verification']=(date.today()+timedelta(days=20)).isoformat()
        with self.assertRaises(ValueError):lettre.valider(e)

    def test_preparation_sans_relecture_ou_perimee_refusee(self):
        for cle,valeur in (('demonstration',True),('statut','brouillon')):
            e=edition();e[cle]=valeur
            with self.subTest(cle=cle),self.assertRaises(ValueError):lettre.valider(e,True)
        e=edition();e['relecture']['le']=(date.today()+timedelta(days=2)).isoformat()
        with self.assertRaises(ValueError):lettre.valider(e,True)
        e=edition();e['points']=[]
        with self.assertRaises(ValueError):lettre.valider(e,True)
        e['aucun_changement']='Aucun changement notable dans les seules sources citées.'
        lettre.valider(e,True)

    def test_brouillon_uniquement_et_quota_avant_creation(self):
        for count in (0,271,None):
            appels=[]
            def transport(method,path,key,payload=None):
                appels.append((method,path,payload))
                return {'campaigns':[]} if 'emailCampaigns' in path else {'uniqueSubscribers':count}
            with self.subTest(count=count),self.assertRaises(ValueError):
                lettre.creer_brouillon(edition(),self.env,transport)
            self.assertTrue(all(x[0]=='GET' for x in appels))
        appels=[]
        def transport(method,path,key,payload=None):
            appels.append((method,path,payload))
            if method=='POST':return {'id':17}
            return {'campaigns':[]} if 'emailCampaigns' in path else {'uniqueSubscribers':270}
        resultat=lettre.creer_brouillon(edition(),self.env,transport)
        self.assertEqual(resultat['resultat'],'brouillon')
        payload=appels[-1][2]
        self.assertEqual(payload['recipients'],{'listIds':[12]})
        self.assertNotIn('scheduledAt',payload)
        self.assertFalse(any('sendNow' in x[1] for x in appels))

    def test_doublon_dans_une_page_suivante(self):
        e=edition();appels=[]
        def transport(method,path,key,payload=None):
            appels.append((method,path))
            if 'offset=0' in path:return {'campaigns':[{'name':'autre'}]*100}
            return {'campaigns':[{'name':'veille-vignerons-'+e['date_envoi'],'id':42}]}
        resultat=lettre.creer_brouillon(e,self.env,transport)
        self.assertEqual(resultat['resultat'],'existant')
        self.assertEqual(len(appels),2)
        self.assertTrue(all(x[0]=='GET' for x in appels))

    def test_secret_absent_aucun_acces_reseau(self):
        with patch.object(lettre,'api') as api:
            with self.assertRaises(ValueError):lettre.creer_brouillon(edition(),{},api)
            api.assert_not_called()

if __name__=='__main__':unittest.main()
