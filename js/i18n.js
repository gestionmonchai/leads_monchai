/**
 * Mon Chai - Internationalization (i18n) System
 * Stores all translations and handles language switching + browser detection
 */

var MonChaiI18n = (function () {
  'use strict';

  var STORAGE_KEY = 'monchai_lang';
  var DEFAULT_LANG = 'fr';

  var translations = {
    fr: {
      lang_label: 'FR',
      lang_name: 'Français',
      page_title: 'Mon Chai - Ouverture prochaine',
      meta_description: 'Mon Chai, le futur de la gestion viticole. Logiciel SaaS pour la gestion de chai, DRM, intrants, appellations. Inscrivez-vous pour le lancement.',
      h1: 'Le futur de votre gestion viticole arrive.',
      lead: 'Toutes vos données, centralisées, de la vigne à la vente. Inscrivez-vous pour découvrir gratuitement Mon Chai en avant-première.',
      email_placeholder: 'Votre adresse e-mail',
      consent: 'J\'accepte que mon adresse e-mail soit utilisée par Mon Chai pour me recontacter au sujet du lancement. Je peux demander l\'accès, la rectification ou la suppression de mes données à tout moment à <a href="mailto:info@monchai.fr">info@monchai.fr</a>.',
      micro_copy: 'Les données collectées sont utilisées uniquement pour vous informer du lancement de Mon Chai. Pour en savoir plus, consultez notre politique de confidentialité.',
      btn_submit: 'Me prévenir du lancement',
      btn_sending: 'Envoi en cours...',
      msg_success: 'Merci ! Vous serez informé du lancement.',
      msg_duplicate: 'Cette adresse est déjà inscrite.',
      msg_error: 'Une erreur est survenue. Veuillez réessayer.',
      msg_consent_required: 'Veuillez accepter les conditions.',
      msg_email_invalid: 'Veuillez entrer une adresse e-mail valide.',
      msg_rate_limit: 'Veuillez patienter {seconds} secondes avant de réessayer.',
      msg_too_many_attempts: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
      closing: 'À très bientôt.',
      link_legal: 'Mentions légales',
      link_privacy: 'Politique de confidentialité'
    },
    en: {
      lang_label: 'EN',
      lang_name: 'English',
      page_title: 'Mon Chai - Coming Soon',
      meta_description: 'Mon Chai, the future of wine cellar management. SaaS software for cellar management, DRM, inputs, appellations. Sign up for launch.',
      h1: 'The future of wine cellar management is coming.',
      lead: 'All your data, centralized, from vine to sale. Sign up to discover Mon Chai for free before anyone else.',
      email_placeholder: 'Your email address',
      consent: 'I agree that my email address may be used by Mon Chai to contact me about the launch. I can request access, rectification or deletion of my data at any time at <a href="mailto:info@monchai.fr">info@monchai.fr</a>.',
      micro_copy: 'The data collected is used solely to inform you of the launch of Mon Chai. For more information, see our privacy policy.',
      btn_submit: 'Notify me at launch',
      btn_sending: 'Sending...',
      msg_success: 'Thank you! You will be notified at launch.',
      msg_duplicate: 'This email is already registered.',
      msg_error: 'An error occurred. Please try again.',
      msg_consent_required: 'Please accept the terms.',
      msg_email_invalid: 'Please enter a valid email address.',
      msg_rate_limit: 'Please wait {seconds} seconds before trying again.',
      msg_too_many_attempts: 'Too many attempts. Please try again in a few minutes.',
      closing: 'See you soon.',
      link_legal: 'Legal notice',
      link_privacy: 'Privacy policy'
    },
    it: {
      lang_label: 'IT',
      lang_name: 'Italiano',
      page_title: 'Mon Chai - Apertura imminente',
      meta_description: 'Mon Chai, il futuro della gestione vinicola. Software SaaS per la gestione della cantina, DRM, input, denominazioni. Iscriviti per il lancio.',
      h1: 'Il futuro della gestione vinicola sta arrivando.',
      lead: 'Tutti i vostri dati, centralizzati, dalla vigna alla vendita. Iscrivetevi per scoprire gratuitamente Mon Chai in anteprima.',
      email_placeholder: 'Il vostro indirizzo e-mail',
      consent: 'Accetto che il mio indirizzo e-mail venga utilizzato da Mon Chai per ricontattarmi in merito al lancio. Posso richiedere l\'accesso, la rettifica o la cancellazione dei miei dati in qualsiasi momento a <a href="mailto:info@monchai.fr">info@monchai.fr</a>.',
      micro_copy: 'I dati raccolti vengono utilizzati esclusivamente per informarvi del lancio di Mon Chai. Per saperne di più, consultate la nostra politica sulla privacy.',
      btn_submit: 'Avvisami al lancio',
      btn_sending: 'Invio in corso...',
      msg_success: 'Grazie! Sarete informati al lancio.',
      msg_duplicate: 'Questo indirizzo è già registrato.',
      msg_error: 'Si è verificato un errore. Riprova.',
      msg_consent_required: 'Si prega di accettare i termini.',
      msg_email_invalid: 'Inserisci un indirizzo e-mail valido.',
      msg_rate_limit: 'Attendere {seconds} secondi prima di riprovare.',
      msg_too_many_attempts: 'Troppi tentativi. Riprova tra qualche minuto.',
      closing: 'A presto.',
      link_legal: 'Note legali',
      link_privacy: 'Politica sulla privacy'
    },
    es: {
      lang_label: 'ES',
      lang_name: 'Español',
      page_title: 'Mon Chai - Próxima apertura',
      meta_description: 'Mon Chai, el futuro de la gestión vitícola. Software SaaS para gestión de bodega, DRM, insumos, denominaciones. Regístrate para el lanzamiento.',
      h1: 'El futuro de la gestión vitícola está llegando.',
      lead: 'Todos sus datos, centralizados, de la viña a la venta. Regístrese para descubrir Mon Chai gratis en primicia.',
      email_placeholder: 'Su dirección de correo electrónico',
      consent: 'Acepto que Mon Chai utilice mi dirección de correo electrónico para contactarme sobre el lanzamiento. Puedo solicitar el acceso, la rectificación o la supresión de mis datos en cualquier momento en <a href="mailto:info@monchai.fr">info@monchai.fr</a>.',
      micro_copy: 'Los datos recopilados se utilizan únicamente para informarle del lanzamiento de Mon Chai. Para más información, consulte nuestra política de privacidad.',
      btn_submit: 'Avisarme del lanzamiento',
      btn_sending: 'Enviando...',
      msg_success: '¡Gracias! Le avisaremos del lanzamiento.',
      msg_duplicate: 'Esta dirección ya está registrada.',
      msg_error: 'Se produjo un error. Inténtelo de nuevo.',
      msg_consent_required: 'Por favor, acepte los términos.',
      msg_email_invalid: 'Introduzca una dirección de correo válida.',
      msg_rate_limit: 'Espere {seconds} segundos antes de volver a intentarlo.',
      msg_too_many_attempts: 'Demasiados intentos. Inténtelo de nuevo en unos minutos.',
      closing: 'Hasta pronto.',
      link_legal: 'Aviso legal',
      link_privacy: 'Política de privacidad'
    },
    zh: {
      lang_label: 'ZH',
      lang_name: '中文',
      page_title: 'Mon Chai - 即将开业',
      meta_description: 'Mon Chai，葡萄酒管理的未来。用于酒窖管理、DRM、投入品、产区的SaaS软件。注册获取发布信息。',
      h1: '葡萄酒管理的未来即将到来。',
      lead: '所有数据集中管理，从葡萄园到销售。免费注册，抢先体验 Mon Chai。',
      email_placeholder: '您的电子邮件地址',
      consent: '我同意 Mon Chai 使用我的电子邮件地址就产品上线事宜与我联系。我可以随时通过 <a href="mailto:info@monchai.fr">info@monchai.fr</a> 请求访问、更正或删除我的数据。',
      micro_copy: '所收集的数据仅用于通知您 Mon Chai 的上线信息。如需了解更多，请查阅我们的隐私政策。',
      btn_submit: '通知我上线',
      btn_sending: '发送中...',
      msg_success: '谢谢！我们将在上线时通知您。',
      msg_duplicate: '此邮箱已注册。',
      msg_error: '发生错误，请重试。',
      msg_consent_required: '请接受条款。',
      msg_email_invalid: '请输入有效的电子邮件地址。',
      msg_rate_limit: '请等待 {seconds} 秒后再试。',
      msg_too_many_attempts: '尝试次数过多。请稍后再试。',
      closing: '期待与您相见。',
      link_legal: '法律声明',
      link_privacy: '隐私政策'
    }
  };

  var SUPPORTED_LANGS = ['fr', 'en', 'it', 'es', 'zh'];

  /**
   * Detect best language from browser
   */
  function detectLanguage() {
    // Check localStorage first
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;

    // Check browser language
    var navLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (var i = 0; i < navLangs.length; i++) {
      var code = navLangs[i].toLowerCase().split('-')[0];
      if (translations[code]) return code;
    }

    return DEFAULT_LANG;
  }

  /**
   * Apply translations to the DOM
   */
  function applyLanguage(lang) {
    if (!translations[lang]) lang = DEFAULT_LANG;
    var t = translations[lang];

    // Save preference
    localStorage.setItem(STORAGE_KEY, lang);

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
    var h1 = document.querySelector('[data-i18n="h1"]');
    if (h1) h1.textContent = t.h1;

    var lead = document.querySelector('[data-i18n="lead"]');
    if (lead) lead.textContent = t.lead;

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
    return localStorage.getItem(STORAGE_KEY) || detectLanguage();
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
