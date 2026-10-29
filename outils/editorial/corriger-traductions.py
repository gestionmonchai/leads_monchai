"""Répercute les corrections réglementaires dans les quatre versions existantes."""
from pathlib import Path
import re
import sys
from bs4 import BeautifulSoup
ROOT=Path(sys.argv[1]).resolve()
data={
'en': {
 'title':'EU wine package: rules and dates for winegrowers',
 'intro':'Regulation (EU) 2026/471 entered into force on 18 March 2026. Some measures apply later: check the provision and the circumstances of your authorisation or product before acting.',
 'h1':'Planting authorisations',
 'p1':'The regime becomes permanent and the validity of the replanting authorisations concerned extends to eight years. The waiver without penalties for qualifying authorisations granted before 1 January 2025 must be notified before the authorisation expires, and no later than 31 December 2026. The year-end deadline does not revive an expired authorisation.',
 'h2':'Dealcoholised wines: two different thresholds',
 'p2':'The new “alcohol-free” wording covers the relevant categories at no more than 0.5% vol.; the additional “0.0%” wording uses a 0.05% vol. ceiling. “Reduced alcohol” requires more than 0.5% vol. and at least a 30% reduction from the minimum strength of the category before dealcoholisation.',
 'p3':'These new labelling provisions apply from 19 September 2027 under Article 1(10)(a), as corrected on 22 May 2026. Transitional stock rules also apply. Check the exact product and production date for ingredient and nutrition obligations; vintage alone is insufficient.',
 'action':'Check each authorisation’s grant and expiry dates with the competent body. For a label, distinguish the current rules from the future framework and have the exact product and destination reviewed.',
 'fields':'The content already changes in 2026. Record the product and authorisation identifiers, quantity, dose, date, geographical identification and area treated, crop or use of the area, and organic status. Where required, add growth stage, start and end times and early re-entry information. Adjuvants and work by contractors also have specific rules. Use the annexes of the French order of 24 December 2025 to check required fields and data formats. A file extension alone does not demonstrate compliance.',
 'sources':'Official sources', 'updated':'Updated 29 October 2026'},
'de': {
 'title':'EU-Weinpaket: Regeln und Fristen für Weinbaubetriebe',
 'intro':'Die Verordnung (EU) 2026/471 trat am 18. März 2026 in Kraft. Einzelne Bestimmungen gelten später. Prüfen Sie vor einer Entscheidung die konkrete Vorschrift und Ihre Genehmigung oder Ihr Erzeugnis.',
 'h1':'Pflanzungsgenehmigungen',
 'p1':'Das Genehmigungssystem wird dauerhaft fortgeführt; für die betroffenen Wiederbepflanzungsgenehmigungen verlängert sich die Gültigkeit auf acht Jahre. Ein sanktionsfreier Verzicht auf die erfassten, vor dem 1. Januar 2025 erteilten Genehmigungen muss vor deren Ablauf und spätestens am 31. Dezember 2026 mitgeteilt werden. Bereits abgelaufene Genehmigungen leben dadurch nicht wieder auf.',
 'h2':'Entalkoholisierter Wein: zwei unterschiedliche Grenzwerte',
 'p2':'Die neue Angabe „alkoholfrei“ betrifft die erfassten Kategorien bis 0,5 % vol.; die zusätzliche Angabe „0,0 %“ setzt höchstens 0,05 % vol. voraus. „Alkoholreduziert“ erfordert mehr als 0,5 % vol. und mindestens 30 % weniger Alkohol als der Mindestalkoholgehalt der Kategorie vor der Entalkoholisierung.',
 'p3':'Diese neuen Kennzeichnungsvorgaben gelten nach Artikel 1 Nummer 10 Buchstabe a ab dem 19. September 2027; maßgeblich ist auch die Berichtigung vom 22. Mai 2026. Übergangsregeln für Bestände beachten. Für Zutaten- und Nährwertangaben müssen Erzeugnis und Herstellungsdatum geprüft werden; der Jahrgang allein genügt nicht.',
 'action':'Prüfen Sie Erteilungs- und Ablaufdatum jeder Genehmigung mit der zuständigen Stelle. Lassen Sie Etiketten anhand des konkreten Erzeugnisses und Absatzmarkts prüfen und unterscheiden Sie geltendes und künftiges Recht.',
 'fields':'Der Inhalt ändert sich bereits 2026. Erfassen Sie Produkt- und Zulassungskennungen, Menge, Aufwandmenge, Datum, geografische Kennzeichnung und behandelte Fläche, Kultur beziehungsweise Flächennutzung sowie den ökologischen Status. Je nach Vorgabe kommen Entwicklungsstadium, Beginn und Ende der Anwendung sowie Angaben zum vorzeitigen Wiederbetreten hinzu. Für Zusatzstoffe und Dienstleistungen gelten ebenfalls Regeln. Die Anhänge der französischen Verordnung vom 24. Dezember 2025 bestimmen Felder und Datenformate. Eine Dateiendung allein belegt keine Konformität.',
 'sources':'Amtliche Quellen', 'updated':'Aktualisiert am 29. Oktober 2026'},
'it': {
 'title':'Pacchetto vino UE: regole e scadenze per i viticoltori',
 'intro':'Il regolamento (UE) 2026/471 è entrato in vigore il 18 marzo 2026. Alcune disposizioni si applicano più tardi: prima di decidere, verificare la norma specifica e la situazione della propria autorizzazione o del prodotto.',
 'h1':'Autorizzazioni di impianto',
 'p1':'Il regime diventa permanente e la validità delle autorizzazioni di reimpianto interessate passa a otto anni. La rinuncia senza sanzioni alle autorizzazioni ammesse, concesse prima del 1° gennaio 2025, deve essere comunicata prima della loro scadenza e comunque entro il 31 dicembre 2026. Quest’ultima data non riattiva un’autorizzazione già scaduta.',
 'h2':'Vini dealcolizzati: due soglie diverse',
 'p2':'La nuova indicazione «zero alcol» riguarda le categorie interessate fino allo 0,5 % vol.; l’indicazione aggiuntiva «0,0 %» richiede un massimo dello 0,05 % vol. «A tenore alcolico ridotto» richiede più dello 0,5 % vol. e una riduzione di almeno il 30 % rispetto al minimo della categoria prima della dealcolizzazione.',
 'p3':'Queste nuove disposizioni di etichettatura si applicano dal 19 settembre 2027 ai sensi dell’articolo 1, punto 10, lettera a), rettificato il 22 maggio 2026. Esistono anche regole transitorie per le scorte. Per ingredienti e valori nutrizionali occorre verificare prodotto e data di produzione: la sola annata non basta.',
 'action':'Controllare le date di rilascio e scadenza di ogni autorizzazione con l’ente competente. Per l’etichetta, distinguere le regole attuali da quelle future e far verificare il prodotto preciso e il mercato di destinazione.',
 'fields':'Il contenuto cambia già nel 2026. Registrare identificativi del prodotto e dell’autorizzazione, quantità, dose, data, identificazione geografica e superficie trattata, coltura o uso della zona e carattere biologico. Quando richiesti, aggiungere stadio fenologico, orari di inizio e fine e informazioni sul rientro anticipato. Coadiuvanti e prestazioni di terzi seguono regole specifiche. Usare gli allegati del decreto francese del 24 dicembre 2025 per verificare campi e formati: la sola estensione del file non dimostra la conformità.',
 'sources':'Fonti ufficiali', 'updated':'Aggiornato il 29 ottobre 2026'},
'zh': {
 'title':'欧盟葡萄酒改革：酒庄应核对的规则与日期',
 'intro':'欧盟第2026/471号条例于2026年3月18日生效，但部分条款在更晚的日期适用。采取行动前，应核对具体条款及本酒庄的许可或产品情况。',
 'h1':'种植许可',
 'p1':'许可制度改为长期实行，相关重新种植许可的有效期延长至八年。符合条件、在2025年1月1日前签发的许可，可依规定免罚放弃；须在许可到期前通知主管机构，且最迟不得晚于2026年12月31日。该年末日期不会恢复已经失效的许可。',
 'h2':'脱醇葡萄酒：两个不同的界限',
 'p2':'新“无酒精”标示适用于相关类别、酒精度不超过0.5% vol.的产品；附加“0.0%”标示的上限为0.05% vol.。“低酒精”要求酒精度高于0.5% vol.，并且比脱醇前该类别的最低酒精度至少降低30%。',
 'p3':'根据2026年5月22日的勘误，第1条第10项a款的新标签规定自2027年9月19日起适用，同时存在库存过渡条款。核对配料和营养申报义务时，应审查具体产品及生产日期，不能只依据年份。',
 'action':'请向主管机构核对每份许可的签发日和到期日。制作标签时，应区分现行规则与未来规则，并按具体产品和销售目的地复核。',
 'fields':'记录内容从2026年起已经变化。应记录产品及许可标识、数量、剂量、日期、处理地块的地理标识与面积、作物或区域用途，以及有机生产情况。在规定要求时，还需记录生育阶段、开始和结束时间及提前重新进入地块的信息。助剂和承包作业也有专门要求。请以法国2025年12月24日法令附件核对字段和数据格式；仅有Excel或CSV扩展名不能证明合规。',
 'sources':'官方来源', 'updated':'更新于2026年10月29日'}
}
for lang,d in data.items():
    path=ROOT/lang/'paquet-vin-europeen-2027.html'
    s=path.read_text(encoding='utf-8')
    s=s.replace(' · '+d['updated'],'')
    body=f'''<h1>{d['title']}</h1><p class="article__chapo">{d['intro']}</p><h2>{d['h1']}</h2><p>{d['p1']}</p><h2>{d['h2']}</h2><p>{d['p2']}</p><p>{d['p3']}</p><p>{d['action']}</p><p><strong>{d['sources']} :</strong> <a href="https://eur-lex.europa.eu/eli/reg/2026/471/oj/{lang if lang!='zh' else 'fr'}">UE 2026/471</a> · <a href="https://eur-lex.europa.eu/eli/reg/2026/471/corrigendum/2026-05-22/oj/{lang if lang!='zh' else 'fr'}">22/05/2026</a></p>'''
    s=re.sub(r'<h1>[\s\S]*?(?=<div class="article-cta">)',lambda m:body+'\n',s,count=1)
    # Synchroniser les résumés et le schéma plutôt que laisser les anciens seuils.
    for prop in ['description','og:description']:
        s=re.sub(r'(<meta[^>]*(?:name|property)="'+prop+r'"[^>]*content=")[^"]*',lambda m:m[1]+d['intro'],s)
    s=re.sub(r'("description"\s*:\s*")[^"]*',lambda m:m[1]+d['intro'],s)
    s=re.sub(r'("dateModified"\s*:\s*")[^"]*',r'\g<1>2026-10-29',s)
    s=re.sub(r'(<span class="actu-date">[\s\S]*?)(</span>)',lambda m:m[1]+' · '+d['updated']+m[2],s,count=1)
    path.write_text(s,encoding='utf-8',newline='\n')
    path=ROOT/lang/'registre-phyto-numerique-2027.html'
    s=path.read_text(encoding='utf-8')
    s=s.replace(' · '+d['updated'],'')
    soup=BeautifulSoup(s,'html.parser')
    heading=str(soup.select('main h2')[2])
    new=heading+f'<p>{d["fields"]}</p><p><a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053228465">{d["sources"]} : 24/12/2025</a></p>'
    s=re.sub(re.escape(heading)+r'[\s\S]*?(?=<h2>)',lambda m:new+'\n',s,count=1)
    s=re.sub(r'("dateModified"\s*:\s*")[^"]*',r'\g<1>2026-10-29',s)
    s=re.sub(r'(<span class="actu-date">[\s\S]*?)(</span>)',lambda m:m[1]+' · '+d['updated']+m[2],s,count=1)
    path.write_text(s,encoding='utf-8',newline='\n')
print('Corrections répercutées sur les 8 versions traduites existantes.')
