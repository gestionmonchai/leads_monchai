/* Progressive enhancement: all steps and links remain available without JS. */
(function () {
  'use strict';
  // The shared desktop header must fit the space left by the scrollbar.
  function fitHeader() {
    document.documentElement.style.setProperty('--echelle', document.documentElement.clientWidth / 1920);
  }
  fitHeader();
  window.addEventListener('resize', fitHeader);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var journeys = [];
  document.querySelectorAll('[data-journey]').forEach(function (card) {
    var buttons = Array.from(card.querySelectorAll('.ch-step'));
    var scenes = Array.from(card.querySelectorAll('[data-scene]'));
    var play = card.querySelector('.ch-play');
    var count = card.querySelector('.ch-demo__count');
    var index = 0, timer = null, playing = false, visible = false, started = false;
    var label = card.classList.contains('ch-journey--solo') ? 'autonome' : 'accompagné';
    card.querySelector('.ch-demo-controls').hidden = false;

    function show(next) {
      index = next;
      card.dataset.step = String(index);
      buttons.forEach(function (button, i) {
        button.setAttribute('aria-pressed', String(i === index));
        button.parentElement.classList.toggle('is-current', i === index);
        button.parentElement.classList.toggle('is-done', i < index);
      });
      scenes.forEach(function (scene, i) {
        scene.hidden = i !== index;
        scene.classList.toggle('is-current', i === index);
      });
      count.textContent = '0' + (index + 1) + ' / 04';
    }
    function updateControl() {
      var text = playing ? 'Mettre en pause' : (index === 3 ? 'Rejouer l’animation' : 'Lire l’animation');
      play.innerHTML = '<span aria-hidden="true">' + (playing ? 'Ⅱ' : '▷') + '</span> ' + text;
      play.setAttribute('aria-label', text + ' du parcours ' + label);
    }
    function stop() {
      clearTimeout(timer);
      timer = null;
      playing = false;
      updateControl();
    }
    function tick() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!visible || document.hidden) { stop(); return; }
        if (index >= 3) { stop(); return; }
        show(index + 1);
        if (index === 3) stop(); else tick();
      }, 4200);
    }
    function start() {
      started = true;
      if (index === 3) show(0);
      playing = true;
      updateControl();
      tick();
    }
    play.addEventListener('click', function () { if (playing) stop(); else start(); });
    buttons.forEach(function (button, i) {
      button.addEventListener('click', function () { started = true; stop(); show(i); updateControl(); });
    });
    // Stop automatic progression while a visitor reads with a keyboard.
    card.addEventListener('focusin', function (event) {
      if (playing && !play.contains(event.target)) stop();
    });
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (!visible) stop();
          else if (!started && !reduced.matches && !document.hidden) start();
        });
      }, { threshold: .45 });
      // Observe the illustration, not the tall card: works on small screens too.
      observer.observe(card.querySelector('.ch-demo'));
    } else { visible = true; }
    journeys.push(stop);
  });
  function stopAll() { journeys.forEach(function (stop) { stop(); }); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAll(); });
  if (reduced.addEventListener) reduced.addEventListener('change', function () { if (reduced.matches) stopAll(); });

  if ('IntersectionObserver' in window && !reduced.matches) {
    var reveals = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveals.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(function (element) { reveals.observe(element); });
    document.documentElement.classList.add('ch-reveal-ready');
  }
})();
