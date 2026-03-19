/**
 * Mon Chai - Landing Page Scripts
 * Handles modals, form submission to Google Apps Script, and language switcher
 */

(function () {
  'use strict';

  // Google Apps Script Web App URL
  var WEBAPP_URL = 'https://script.googleusercontent.com/a/macros/monchai.fr/echo?user_content_key=AWDtjMViYjNJ8n5EHTESViOB3IIztXN0_GzUOysHf5vkkKYp6iL0wVTyhOdtMsjvXdOkaDrhRGgnxWX7vlokApxE3n_RtBQU9tTFPz6JQjXiralPr_AV-1NklhC17JQw_81dUzpZJKaQ-02n6haq32aBsHzDIp1UQpyu2lYqA5fPuNcUwoPHdaqhrNtlvviuFN2-iKmaOnUpguh8PnGTyCWGVN1KyiIBpVCBGuKXbF201bSwvdcjDqjQLpgFVYWdSYfIXZzt0BF-hTkoLFANtWVtVCTF4kCUycms_W-txd4XO73OC4rUxs8&lib=MorG0R2f9YHO_jRYuzf9Mg4dJM3AxR5R6';
  var FORM_SOURCE = 'monchai-coming-soon';

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
     Form Feedback
     ------------------------------------------------------------------ */
  function showFeedback(form, type, message) {
    // Remove existing feedback
    var existing = form.querySelector('.form-feedback');
    if (existing) existing.remove();

    // Create feedback element
    var feedback = document.createElement('div');
    feedback.className = 'form-feedback form-feedback--' + type;
    feedback.setAttribute('role', 'alert');
    feedback.textContent = message;

    // Insert before button
    var btn = form.querySelector('.btn');
    if (btn) {
      btn.parentNode.insertBefore(feedback, btn);
    } else {
      form.appendChild(feedback);
    }

    // Auto-hide success after 5s
    if (type === 'success') {
      setTimeout(function () {
        feedback.classList.add('form-feedback--fade');
        setTimeout(function () { feedback.remove(); }, 300);
      }, 5000);
    }
  }

  function clearFeedback(form) {
    var existing = form.querySelector('.form-feedback');
    if (existing) existing.remove();
  }

  /* ------------------------------------------------------------------
     Form Submission
     ------------------------------------------------------------------ */
  function initForm() {
    var form = document.querySelector('.form-wrap');
    if (!form) return;

    var emailInput = form.querySelector('input[type="email"]');
    var consentCheckbox = form.querySelector('input[type="checkbox"]');
    var submitBtn = form.querySelector('.btn');
    var originalBtnText = '';

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearFeedback(form);

      // Validate email
      var email = emailInput.value.trim().toLowerCase();
      if (!email || !isValidEmail(email)) {
        showFeedback(form, 'error', MonChaiI18n.t('msg_email_invalid'));
        emailInput.focus();
        return;
      }

      // Validate consent
      if (!consentCheckbox.checked) {
        showFeedback(form, 'error', MonChaiI18n.t('msg_consent_required'));
        consentCheckbox.focus();
        return;
      }

      // Disable button and show loading
      originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = MonChaiI18n.t('btn_sending');

      // Prepare payload
      var payload = {
        email: email,
        consentement: true,
        source: FORM_SOURCE
      };

      // Send to Google Apps Script
      fetch(WEBAPP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (data.ok) {
          if (data.duplicate) {
            showFeedback(form, 'info', MonChaiI18n.t('msg_duplicate'));
          } else {
            showFeedback(form, 'success', MonChaiI18n.t('msg_success'));
            form.reset();
          }
        } else {
          showFeedback(form, 'error', data.error || MonChaiI18n.t('msg_error'));
        }
      })
      .catch(function (err) {
        console.error('Form submission error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        showFeedback(form, 'error', MonChaiI18n.t('msg_error'));
      });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
