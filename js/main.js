/**
 * Mon Chai - Landing Page Scripts
 * Handles modals, form submission via iframe, and language switcher
 */

(function () {
  'use strict';

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
     Form Submission (iframe method - no CORS issues)
     ------------------------------------------------------------------ */
  function initForm() {
    var form = document.getElementById('waitlist-form');
    if (!form) return;

    var emailInput = document.getElementById('email');
    var consentCheckbox = document.getElementById('consent');
    var submitBtn = document.getElementById('submit-btn');
    var messageEl = document.getElementById('form-message');
    var formStartField = document.getElementById('form_start');
    var honeypotField = document.getElementById('website');
    var originalBtnText = submitBtn.textContent;

    // Initialize form_start timestamp (anti-bot: forms submitted too fast are suspicious)
    if (formStartField) {
      formStartField.value = Date.now().toString();
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

    form.addEventListener('submit', function (e) {
      hideMessage();

      // Anti-bot: check honeypot (should be empty)
      if (honeypotField && honeypotField.value) {
        e.preventDefault();
        return; // Silent fail for bots
      }

      // Anti-bot: check form_start (reject if submitted in < 2 seconds)
      if (formStartField && formStartField.value) {
        var elapsed = Date.now() - parseInt(formStartField.value, 10);
        if (elapsed < 2000) {
          e.preventDefault();
          return; // Silent fail for bots
        }
      }

      // Validate email
      var email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        showMessage('error', MonChaiI18n.t('msg_email_invalid'));
        emailInput.focus();
        return;
      }

      // Validate consent
      if (!consentCheckbox.checked) {
        e.preventDefault();
        showMessage('error', MonChaiI18n.t('msg_consent_required'));
        consentCheckbox.focus();
        return;
      }

      // Form is valid - let it submit to iframe
      submitBtn.disabled = true;
      submitBtn.textContent = MonChaiI18n.t('btn_sending');

      // Show success after delay (iframe submission is fire-and-forget)
      setTimeout(function () {
        showMessage('success', MonChaiI18n.t('msg_success'));
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        // Reset form_start for potential re-submission
        if (formStartField) {
          formStartField.value = Date.now().toString();
        }
      }, 1500);
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
