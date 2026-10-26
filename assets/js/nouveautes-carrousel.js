(function () {
  'use strict';
  var carousel = document.querySelector('.nouveautes-carrousel');
  if (!carousel) return;
  var slides = Array.from(carousel.querySelectorAll('.nouveautes-carrousel__diapo'));
  var navigation = carousel.querySelector('.nouveautes-carrousel__navigation');
  var selectors = Array.from(navigation.querySelectorAll('[data-diapo]'));
  var counter = carousel.querySelector('.nouveautes-carrousel__compteur');
  var status = carousel.querySelector('[data-carrousel-statut]');
  var current = 0;

  function show(index) {
    var next = (index + slides.length) % slides.length;
    if (next === current) return;
    slides[current].querySelectorAll('video').forEach(function (video) { video.pause(); });
    slides[current].hidden = true;
    slides[next].hidden = false;
    selectors[current].setAttribute('aria-pressed', 'false');
    selectors[next].setAttribute('aria-pressed', 'true');
    current = next;
    counter.textContent = '0' + (current + 1) + ' / 0' + slides.length;
    status.textContent = 'Nouveauté ' + (current + 1) + ' sur ' + slides.length + ' : ' + slides[current].querySelector('h2').textContent;
  }

  navigation.addEventListener('click', function (event) {
    var button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-diapo')) show(Number(button.dataset.diapo));
    else show(current + Number(button.dataset.direction));
  });
  navigation.addEventListener('keydown', function (event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') show(0);
    else if (event.key === 'End') show(slides.length - 1);
    else show(current + (event.key === 'ArrowRight' ? 1 : -1));
    selectors[current].focus();
  });
  navigation.hidden = false;
})();
