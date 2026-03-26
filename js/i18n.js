/**
 * Mon Chai - Internationalization (i18n) System
 * Handles all translations for FR, EN, ES, IT, DE, ZH (Simplified Chinese)
 * All texts written from scratch for landing_mail_2
 */

var MonChaiI18n = (function () {
  'use strict';

  var DEFAULT_LANG = 'fr';

  var translations = {
    fr: {
      lang_label: 'FR',
      lang_name: 'Français',
      page_title: 'Mon Chai - Logiciel de gestion viticole | De la vigne à la vente',
      meta_description: 'Mon Chai simplifie votre gestion viticole : traçabilité, production, stocks, ventes et registres réglementaires centralisés. Inscrivez-vous pour un accès anticipé.',
      h1_line1: 'De la vigne à la vente,',
      h1_line2: 'un seul outil.',
      lead: 'Traçabilité, production, stock, ventes et registres au même endroit. Découvrez Mon Chai en avant-première et bénéficiez d\'<strong>un mois offert</strong> au lancement.',
      email_placeholder: 'Votre adresse e-mail',
      consent: 'J\'accepte que mon adresse e-mail soit utilisée par Mon Chai pour être recontacté. Je peux demander l\'accès, la rectification ou la suppression de mes données à tout moment à <a href="mailto:contact@monchai.fr">contact@monchai.fr</a>.',
      micro_copy: 'Vos données sont utilisées uniquement pour vous informer du lancement. Consultez notre politique de confidentialité pour en savoir plus.',
      btn_submit: 'Me prévenir du lancement',
      btn_sending: 'Envoi en cours...',
      msg_success: 'Parfait ! Vous serez parmi les premiers informés.',
      msg_duplicate: 'Cette adresse e-mail est déjà enregistrée.',
      msg_error: 'Une erreur s\'est produite. Merci de réessayer.',
      msg_consent_required: 'Merci de cocher la case pour continuer.',
      msg_email_invalid: 'Merci de saisir une adresse e-mail valide.',
      msg_rate_limit: 'Veuillez patienter {seconds} secondes.',
      msg_too_many_attempts: 'Trop de tentatives. Réessayez dans quelques minutes.',
      closing: 'À très bientôt.',
      link_legal: 'Mentions légales',
      link_privacy: 'Politique de confidentialité'
    },
    en: {
      lang_label: 'EN',
      lang_name: 'English',
      page_title: 'Mon Chai - Wine Management Software | From Vineyard to Sale',
      meta_description: 'Mon Chai streamlines your winery operations: traceability, production, inventory, sales and regulatory records in one place. Sign up for early access.',
      h1_line1: 'From vineyard to sale,',
      h1_line2: 'one single tool.',
      lead: 'Traceability, production, inventory, sales and records all in one place.<br />Get early access to Mon Chai and receive <strong>one free month</strong> at launch.',
      email_placeholder: 'Your email address',
      consent: 'I agree that my email address may be used by Mon Chai to contact me. I can request access, correction or deletion of my data at any time at <a href="mailto:contact@monchai.fr">contact@monchai.fr</a>.',
      micro_copy: 'Your data is used solely to notify you of the launch. See our privacy policy for details.',
      btn_submit: 'Notify me at launch',
      btn_sending: 'Sending...',
      msg_success: 'Great! You\'ll be among the first to know.',
      msg_duplicate: 'This email address is already registered.',
      msg_error: 'Something went wrong. Please try again.',
      msg_consent_required: 'Please check the box to continue.',
      msg_email_invalid: 'Please enter a valid email address.',
      msg_rate_limit: 'Please wait {seconds} seconds.',
      msg_too_many_attempts: 'Too many attempts. Please try again later.',
      closing: 'See you soon.',
      link_legal: 'Legal notice',
      link_privacy: 'Privacy policy'
    },
    es: {
      lang_label: 'ES',
      lang_name: 'Español',
      page_title: 'Mon Chai - Software de gestión vitivinícola | De la viña a la venta',
      meta_description: 'Mon Chai optimiza la gestión de su bodega: trazabilidad, producción, inventario, ventas y registros reglamentarios en un solo lugar. Regístrese para acceso anticipado.',
      h1_line1: 'De la viña a la venta,',
      h1_line2: 'una sola herramienta.',
      lead: 'Trazabilidad, producción, inventario, ventas y registros en un solo lugar.<br />Acceda a Mon Chai en primicia y obtenga <strong>un mes gratis</strong> en el lanzamiento.',
      email_placeholder: 'Su dirección de correo electrónico',
      consent: 'Acepto que Mon Chai utilice mi correo electrónico para contactarme. Puedo solicitar acceso, rectificación o eliminación de mis datos en cualquier momento en <a href="mailto:contact@monchai.fr">contact@monchai.fr</a>.',
      micro_copy: 'Sus datos se utilizan únicamente para informarle del lanzamiento. Consulte nuestra política de privacidad.',
      btn_submit: 'Avisarme del lanzamiento',
      btn_sending: 'Enviando...',
      msg_success: '¡Perfecto! Será de los primeros en saberlo.',
      msg_duplicate: 'Este correo electrónico ya está registrado.',
      msg_error: 'Ha ocurrido un error. Por favor, inténtelo de nuevo.',
      msg_consent_required: 'Por favor, marque la casilla para continuar.',
      msg_email_invalid: 'Por favor, introduzca un correo electrónico válido.',
      msg_rate_limit: 'Por favor, espere {seconds} segundos.',
      msg_too_many_attempts: 'Demasiados intentos. Inténtelo más tarde.',
      closing: 'Hasta pronto.',
      link_legal: 'Aviso legal',
      link_privacy: 'Política de privacidad'
    },
    it: {
      lang_label: 'IT',
      lang_name: 'Italiano',
      page_title: 'Mon Chai - Software gestione vinicola | Dalla vigna alla vendita',
      meta_description: 'Mon Chai semplifica la gestione della tua cantina: tracciabilità, produzione, magazzino, vendite e registri normativi in un unico posto. Iscriviti per l\'accesso anticipato.',
      h1_line1: 'Dalla vigna alla vendita,',
      h1_line2: 'un unico strumento.',
      lead: 'Tracciabilità, produzione, magazzino, vendite e registri in un unico posto.<br />Scopri Mon Chai in anteprima e ricevi <strong>un mese gratis</strong> al lancio.',
      email_placeholder: 'Il tuo indirizzo e-mail',
      consent: 'Accetto che il mio indirizzo e-mail venga utilizzato da Mon Chai per contattarmi. Posso richiedere accesso, rettifica o cancellazione dei miei dati in qualsiasi momento a <a href="mailto:contact@monchai.fr">contact@monchai.fr</a>.',
      micro_copy: 'I tuoi dati vengono utilizzati esclusivamente per informarti del lancio. Consulta la nostra politica sulla privacy.',
      btn_submit: 'Avvisami al lancio',
      btn_sending: 'Invio in corso...',
      msg_success: 'Perfetto! Sarai tra i primi a saperlo.',
      msg_duplicate: 'Questo indirizzo e-mail è già registrato.',
      msg_error: 'Si è verificato un errore. Riprova.',
      msg_consent_required: 'Seleziona la casella per continuare.',
      msg_email_invalid: 'Inserisci un indirizzo e-mail valido.',
      msg_rate_limit: 'Attendi {seconds} secondi.',
      msg_too_many_attempts: 'Troppi tentativi. Riprova più tardi.',
      closing: 'A presto.',
      link_legal: 'Note legali',
      link_privacy: 'Informativa sulla privacy'
    },
    de: {
      lang_label: 'DE',
      lang_name: 'Deutsch',
      page_title: 'Mon Chai - Weinbau-Management-Software | Vom Weinberg zum Verkauf',
      meta_description: 'Mon Chai vereinfacht Ihre Weingutsverwaltung: Rückverfolgbarkeit, Produktion, Lager, Verkauf und behördliche Aufzeichnungen an einem Ort. Registrieren Sie sich für den frühen Zugang.',
      h1_line1: 'Vom Weinberg zum Verkauf,',
      h1_line2: 'ein einziges Werkzeug.',
      lead: 'Rückverfolgbarkeit, Produktion, Lager, Verkauf und Aufzeichnungen an einem Ort.<br />Erhalten Sie frühen Zugang zu Mon Chai und <strong>einen Monat gratis</strong> zum Start.',
      email_placeholder: 'Ihre E-Mail-Adresse',
      consent: 'Ich stimme zu, dass meine E-Mail-Adresse von Mon Chai verwendet werden darf, um mich zu kontaktieren. Ich kann jederzeit Zugang, Berichtigung oder Löschung meiner Daten unter <a href="mailto:contact@monchai.fr">contact@monchai.fr</a> anfordern.',
      micro_copy: 'Ihre Daten werden ausschließlich verwendet, um Sie über den Start zu informieren. Siehe unsere Datenschutzrichtlinie.',
      btn_submit: 'Benachrichtigen Sie mich',
      btn_sending: 'Wird gesendet...',
      msg_success: 'Perfekt! Sie gehören zu den Ersten, die es erfahren.',
      msg_duplicate: 'Diese E-Mail-Adresse ist bereits registriert.',
      msg_error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      msg_consent_required: 'Bitte aktivieren Sie das Kontrollkästchen.',
      msg_email_invalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      msg_rate_limit: 'Bitte warten Sie {seconds} Sekunden.',
      msg_too_many_attempts: 'Zu viele Versuche. Bitte später erneut versuchen.',
      closing: 'Bis bald.',
      link_legal: 'Impressum',
      link_privacy: 'Datenschutz'
    },
    zh: {
      lang_label: '中文',
      lang_name: '简体中文',
      page_title: 'Mon Chai - 葡萄酒管理软件 | 从葡萄园到销售',
      meta_description: 'Mon Chai 简化您的酒庄管理：追溯、生产、库存、销售和法规记录集于一处。立即注册获取抢先体验。',
      h1_line1: '从葡萄园到销售，',
      h1_line2: '一个工具搞定。',
      lead: '追溯、生产、库存、销售和记录集于一处。<br />抢先体验 Mon Chai，上线即享<strong>一个月免费</strong>。',
      email_placeholder: '您的电子邮箱',
      consent: '我同意 Mon Chai 使用我的电子邮箱与我联系。我可以随时通过 <a href="mailto:contact@monchai.fr">contact@monchai.fr</a> 请求访问、更正或删除我的数据。',
      micro_copy: '您的数据仅用于通知您产品上线。详情请参阅我们的隐私政策。',
      btn_submit: '上线时通知我',
      btn_sending: '发送中...',
      msg_success: '太好了！您将是第一批获知的用户。',
      msg_duplicate: '此邮箱已注册。',
      msg_error: '出现错误，请重试。',
      msg_consent_required: '请勾选复选框以继续。',
      msg_email_invalid: '请输入有效的电子邮箱地址。',
      msg_rate_limit: '请等待 {seconds} 秒。',
      msg_too_many_attempts: '尝试次数过多，请稍后再试。',
      closing: '期待与您相见。',
      link_legal: '法律声明',
      link_privacy: '隐私政策'
    }
  };

  var SUPPORTED_LANGS = ['fr', 'en', 'es', 'it', 'de', 'zh'];

  /**
   * Detect best language from URL parameter
   */
  function detectLanguage() {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var urlLang = urlParams.get('lang');
      if (urlLang && translations[urlLang]) return urlLang;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  /**
   * Apply translations to the DOM
   */
  function applyLanguage(lang) {
    if (!translations[lang]) lang = DEFAULT_LANG;
    var t = translations[lang];

    // Update URL to match language
    try {
      var url = new URL(window.location);
      if (lang === DEFAULT_LANG) {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', lang);
      }
      history.replaceState(null, '', url);
    } catch (e) {}

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update page title and meta
    document.title = t.page_title;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.meta_description);

    // Update OG tags
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', t.page_title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', t.meta_description);

    // Update visible content
    var h1Line1 = document.querySelector('[data-i18n="h1_line1"]');
    if (h1Line1) h1Line1.textContent = t.h1_line1;

    var h1Line2 = document.querySelector('[data-i18n="h1_line2"]');
    if (h1Line2) h1Line2.textContent = t.h1_line2;

    var lead = document.querySelector('[data-i18n="lead"]');
    if (lead) lead.innerHTML = t.lead;

    var emailInput = document.querySelector('[data-i18n="email_placeholder"]');
    if (emailInput) emailInput.setAttribute('placeholder', t.email_placeholder);

    var consentSpan = document.querySelector('[data-i18n="consent"]');
    if (consentSpan) consentSpan.innerHTML = t.consent;

    var microCopy = document.querySelector('[data-i18n="micro_copy"]');
    if (microCopy) microCopy.textContent = t.micro_copy;

    var btnSubmit = document.querySelector('[data-i18n="btn_submit"]');
    if (btnSubmit) btnSubmit.textContent = t.btn_submit;

    var closing = document.querySelector('[data-i18n="closing"]');
    if (closing) closing.textContent = t.closing;

    var linkLegal = document.querySelector('[data-i18n="link_legal"]');
    if (linkLegal) linkLegal.textContent = t.link_legal;

    var linkPrivacy = document.querySelector('[data-i18n="link_privacy"]');
    if (linkPrivacy) linkPrivacy.textContent = t.link_privacy;

    // Update language switcher button label
    var langLabel = document.querySelector('.lang-label');
    if (langLabel) langLabel.textContent = t.lang_label;

    // Update active state in dropdown
    var allBtns = document.querySelectorAll('.lang-dropdown button');
    allBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  /**
   * Get current language
   */
  function getCurrentLang() {
    return detectLanguage();
  }

  /**
   * Get a specific translation string
   */
  function t(key) {
    var lang = getCurrentLang();
    return (translations[lang] && translations[lang][key]) || translations[DEFAULT_LANG][key] || key;
  }

  return {
    translations: translations,
    supportedLangs: SUPPORTED_LANGS,
    detectLanguage: detectLanguage,
    applyLanguage: applyLanguage,
    getCurrentLang: getCurrentLang,
    t: t
  };
})();
