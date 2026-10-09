(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---- menú móvil ---- */
  var burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  });

  /* ---- slider del hero ---- */
  var slides = $$('.hero__slide'), dotsBox = $('#dots'), cur = 0, timer;
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Imagen ' + (i + 1));
    b.addEventListener('click', function () { go(i); play(); });
    dotsBox.appendChild(b);
  });
  var dots = $$('button', dotsBox);
  function go(n) {
    cur = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i === cur); });
  }
  function play() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(cur + 1); }, 6000); }
  $('#prev').addEventListener('click', function () { go(cur - 1); play(); });
  $('#next').addEventListener('click', function () { go(cur + 1); play(); });
  go(0); play();

  /* ---- burbujas del hero ---- */
  var bb = $('.bubbles');
  if (!reduce) {
    for (var i = 0; i < 16; i++) {
      var el = document.createElement('i'), s = 8 + Math.random() * 34;
      el.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;' +
        'animation-duration:' + (9 + Math.random() * 12) + 's;animation-delay:-' + (Math.random() * 18) + 's;' +
        '--dx:' + (Math.random() * 80 - 40) + 'px;opacity:' + (0.35 + Math.random() * 0.5);
      bb.appendChild(el);
    }
  }

  /* ---- contador ---- */
  function countUp(el) {
    var t = +el.dataset.count, n = 0, step = Math.max(1, Math.round(t / 40));
    var iv = setInterval(function () { n += step; if (n >= t) { n = t; clearInterval(iv); } el.textContent = n; }, 35);
  }

  /* ---- reveal ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(function (el) { io.observe(el); });
  var cIo = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cIo.unobserve(e.target); } });
  });
  $$('[data-count]').forEach(function (el) { if (reduce) el.textContent = el.dataset.count; else cIo.observe(el); });

  /* ---- animación de scroll: nivel de agua + nadadores + parallax ---- */
  var water = $('#levelWater'), pct = $('#levelPct'), header = $('#header');
  var swimmers = $$('[data-swimmer]'), heroSlides = $('#slides'), ticking = false;
  var links = $$('.nav a[href^="#"]:not(.nav__cta)');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); });

  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    water.style.height = (p * 100) + '%';
    pct.textContent = Math.round(p * 100);
    header.classList.toggle('is-stuck', scrollY > 10);

    swimmers.forEach(function (sw) {
      var lane = sw.parentNode, r = lane.getBoundingClientRect();
      var t = (innerHeight - r.top) / (innerHeight + r.height);
      t = Math.min(1, Math.max(0, t));
      sw.style.transform = 'translateX(' + (t * (lane.clientWidth + 140) - 140) + 'px)';
    });

    if (!reduce && scrollY < innerHeight) heroSlides.style.transform = 'translateY(' + (scrollY * 0.25) + 'px)';

    var pos = scrollY + 140, active = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= pos) active = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-on', i === active); });
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---- tooltip del widget de WhatsApp ---- */
  var wa = $('.wa');
  setTimeout(function () { wa.classList.add('show-tip'); setTimeout(function () { wa.classList.remove('show-tip'); }, 6000); }, 3500);

  /* ---- filtros de galería ---- */
  $$('#filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#filters button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      $$('#gallery .g-item').forEach(function (it) {
        it.classList.toggle('is-hide', b.dataset.f !== 'all' && it.dataset.cat !== b.dataset.f);
      });
    });
  });

  /* ---- lightbox ---- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbC = $('#lbC'), list = [], idx = 0;
  function show() {
    var a = list[idx];
    lbImg.src = a.href;
    lbImg.alt = $('img', a).alt;
    lbC.textContent = (idx + 1) + ' / ' + list.length;
  }
  function open(a) {
    list = $$('.g-item[data-group="' + a.dataset.group + '"]').filter(function (x) { return !x.classList.contains('is-hide'); });
    idx = list.indexOf(a); show();
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  function step(d) { idx = (idx + d + list.length) % list.length; show(); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.g-item');
    if (a) { e.preventDefault(); open(a); }
  });
  $('#lbX').addEventListener('click', close);
  $('#lbP').addEventListener('click', function () { step(-1); });
  $('#lbN').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 50) step(d < 0 ? 1 : -1);
  });

  /* ---- formulario -> WhatsApp ---- */
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, nombre = f.nombre.value.trim();
    if (!nombre) { f.nombre.focus(); return; }
    var txt = 'Hola, soy ' + nombre + '. Consulta sobre: ' + f.servicio.value + '.' +
      (f.mensaje.value.trim() ? '\n' + f.mensaje.value.trim() : '');
    window.open('https://wa.me/5491125170055?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });
})();
