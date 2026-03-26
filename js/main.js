/**
 * Mon Chai - Landing Page Scripts
 * Handles modals, form submission via EmailJS, and language switcher
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     EmailJS Configuration
     ------------------------------------------------------------------ */
  var EMAILJS_PUBLIC_KEY = 'SW76TlsTwVd5Z8v8y';
  var EMAILJS_SERVICE_ID = 'service_dmflavl';
  var EMAILJS_TEMPLATE_ID = 'template_yajlaes';

  /* ------------------------------------------------------------------
     Rate Limiting (localStorage)
     ------------------------------------------------------------------ */
  var RATE_LIMIT_KEY = 'monchai_form_submissions';
  var RATE_LIMIT_COOLDOWN = 30000; // 30 seconds between submissions
  var RATE_LIMIT_MAX_ATTEMPTS = 5; // Max attempts in window
  var RATE_LIMIT_WINDOW = 300000; // 5 minutes window

  function getRateLimitData() {
    try {
      var data = localStorage.getItem(RATE_LIMIT_KEY);
      return data ? JSON.parse(data) : { attempts: [], blocked_until: 0 };
    } catch (e) {
      return { attempts: [], blocked_until: 0 };
    }
  }

  function saveRateLimitData(data) {
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage not available, continue without rate limiting
    }
  }

  function checkRateLimit() {
    var data = getRateLimitData();
    var now = Date.now();

    // Check if blocked
    if (data.blocked_until > now) {
      return { allowed: false, reason: 'blocked', wait: Math.ceil((data.blocked_until - now) / 1000) };
    }

    // Clean old attempts
    data.attempts = data.attempts.filter(function (t) { return now - t < RATE_LIMIT_WINDOW; });

    // Check cooldown (last submission)
    if (data.attempts.length > 0) {
      var lastAttempt = data.attempts[data.attempts.length - 1];
      if (now - lastAttempt < RATE_LIMIT_COOLDOWN) {
        return { allowed: false, reason: 'cooldown', wait: Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastAttempt)) / 1000) };
      }
    }

    // Check max attempts
    if (data.attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
      data.blocked_until = now + RATE_LIMIT_WINDOW;
      saveRateLimitData(data);
      return { allowed: false, reason: 'too_many', wait: Math.ceil(RATE_LIMIT_WINDOW / 1000) };
    }

    return { allowed: true };
  }

  function recordSubmission() {
    var data = getRateLimitData();
    data.attempts.push(Date.now());
    saveRateLimitData(data);
  }

  /* ------------------------------------------------------------------
     Anti-Abuse: Basic Geographic Filter (best-effort, NOT security)
     ------------------------------------------------------------------ */
  function checkGeographicHints() {
    var validTimezones = [
      'Europe/', 'Atlantic/', 'Africa/Casablanca', 'Africa/Algiers',
      'America/New_York', 'America/Chicago', 'America/Los_Angeles',
      'Asia/Shanghai', 'Asia/Hong_Kong'
    ];

    var validLangPrefixes = ['fr', 'en', 'it', 'es', 'de', 'pt', 'nl', 'zh'];

    var tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {
      return true;
    }

    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase().substring(0, 2);

    var tzOk = validTimezones.some(function (prefix) {
      return tz.indexOf(prefix) === 0;
    });

    var langOk = validLangPrefixes.indexOf(lang) !== -1;

    return tzOk || langOk;
  }

  /* ------------------------------------------------------------------
     Modal System
     ------------------------------------------------------------------ */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    var closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.focus();
    trapFocus(modal);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    var openerId = modal.id;
    var opener = document.querySelector('[data-open="' + openerId + '"]');
    if (opener) opener.focus();
  }

  function trapFocus(modal) {
    var focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ------------------------------------------------------------------
     Language Switcher
     ------------------------------------------------------------------ */
  function initLangSwitcher() {
    var switcher = document.querySelector('.lang-switcher');
    if (!switcher) return;

    var toggleBtn = switcher.querySelector('.lang-btn');
    var dropdown = switcher.querySelector('.lang-dropdown');

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });

    document.addEventListener('click', function () {
      switcher.classList.remove('open');
    });

    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    var langButtons = dropdown.querySelectorAll('button[data-lang]');
    langButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        MonChaiI18n.applyLanguage(lang);
        switcher.classList.remove('open');
      });
    });
  }

  /* ------------------------------------------------------------------
     Form Submission via EmailJS
     ------------------------------------------------------------------ */
  function initForm() {
    var form = document.getElementById('waitlist-form');
    if (!form) return;

    var emailInput = document.getElementById('email');
    var consentCheckbox = document.getElementById('consent');
    var submitBtn = document.getElementById('submit-btn');
    var messageEl = document.getElementById('form-message');
    var honeypotField = document.getElementById('website');
    var originalBtnText = submitBtn.textContent;

    // Record page load time for timing check
    var pageLoadTime = Date.now();

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
      console.error('[MonChai] EmailJS SDK not loaded');
    }

    function showMessage(type, text) {
      messageEl.textContent = text;
      messageEl.className = 'form-feedback form-feedback--' + type;
      messageEl.style.display = 'block';
    }

    function hideMessage() {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }

    function setButtonState(disabled, text) {
      submitBtn.disabled = disabled;
      submitBtn.textContent = text || originalBtnText;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMessage();

      // 1. Honeypot check (silent fail)
      if (honeypotField && honeypotField.value) {
        console.error('[MonChai] Honeypot triggered');
        return;
      }

      // 2. Timing check: reject if < 2 seconds since page load (silent fail)
      if (Date.now() - pageLoadTime < 2000) {
        console.error('[MonChai] Submission too fast');
        return;
      }

      // 3. Geographic hints check (soft filter, silent fail)
      if (!checkGeographicHints()) {
        console.error('[MonChai] Geographic filter triggered');
        return;
      }

      // 4. Rate limit check
      var rateCheck = checkRateLimit();
      if (!rateCheck.allowed) {
        if (rateCheck.reason === 'cooldown') {
          showMessage('error', MonChaiI18n.t('msg_rate_limit').replace('{seconds}', rateCheck.wait));
        } else {
          showMessage('error', MonChaiI18n.t('msg_too_many_attempts'));
        }
        console.error('[MonChai] Rate limit: ' + rateCheck.reason);
        return;
      }

      // 5. Get and validate email
      var email = emailInput.value.trim().toLowerCase();

      if (!email) {
        showMessage('error', MonChaiI18n.t('msg_email_invalid'));
        emailInput.focus();
        return;
      }

      if (email.length > 100) {
        showMessage('error', MonChaiI18n.t('msg_email_invalid'));
        emailInput.focus();
        return;
      }

      // Strict email regex
      var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(email)) {
        showMessage('error', MonChaiI18n.t('msg_email_invalid'));
        emailInput.focus();
        return;
      }

      // 6. Validate consent
      if (!consentCheckbox.checked) {
        showMessage('error', MonChaiI18n.t('msg_consent_required'));
        consentCheckbox.focus();
        return;
      }

      // 7. Check EmailJS is available
      if (typeof emailjs === 'undefined') {
        showMessage('error', MonChaiI18n.t('msg_error'));
        console.error('[MonChai] EmailJS not available');
        return;
      }

      // 8. Disable button, show sending state
      setButtonState(true, MonChaiI18n.t('btn_sending'));

      // 9. Prepare template parameters
      var templateParams = {
        from_email: email,
        consentement: 'oui',
        source: 'monchai-landing-v2',
        sent_at: new Date().toISOString()
      };

      // 10. Send via EmailJS
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function (response) {
          console.log('[MonChai] Email sent:', response.status);
          recordSubmission();
          showMessage('success', MonChaiI18n.t('msg_success'));
          form.reset();
          setButtonState(false);
        })
        .catch(function (error) {
          console.error('[MonChai] EmailJS error:', error);
          showMessage('error', MonChaiI18n.t('msg_error'));
          setButtonState(false);
        });
    });
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    // Modals
    document.querySelectorAll('[data-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-open');
        var modal = document.getElementById(id);
        if (modal) openModal(modal);
      });
    });

    document.querySelectorAll('[data-close]').forEach(function (button) {
      button.addEventListener('click', function () {
        var modal = button.closest('.modal');
        if (modal) closeModal(modal);
      });
    });

    document.querySelectorAll('.modal').forEach(function (modal) {
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal(modal);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach(function (modal) {
          closeModal(modal);
        });
      }
    });

    // Language
    initLangSwitcher();
    var detectedLang = MonChaiI18n.detectLanguage();
    MonChaiI18n.applyLanguage(detectedLang);

    // Form
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
