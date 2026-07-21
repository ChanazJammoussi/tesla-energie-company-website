'use strict';

// ── Preloader ─────────────────────────────────────────────────
(function () {
  var preloader = document.getElementById('preloader');
  var fill      = document.getElementById('preloaderFill');
  if (!preloader) return;

  var criticals = Array.from(document.querySelectorAll('[data-critical]'));
  var total     = criticals.length;
  var loaded    = 0;
  var done      = false;

  function progress() {
    if (done) return;
    loaded++;
    fill.style.transform = 'scaleX(' + Math.min(1, loaded / total) + ')';
    if (loaded >= total) hide();
  }

  function hide() {
    if (done) return;
    done = true;
    fill.style.transform = 'scaleX(1)';
    setTimeout(function () {
      preloader.classList.add('hidden');
      setTimeout(function () { preloader.remove(); }, 750);
    }, 100);
  }

  criticals.forEach(function (el) {
    var tag = el.tagName.toLowerCase();

    if (tag === 'video') {
      if (el.readyState >= 2) { progress(); return; }
      el.addEventListener('loadeddata', progress, { once: true });
      el.addEventListener('canplay',    progress, { once: true });
      el.addEventListener('error',      progress, { once: true });
    } else {
      if (el.complete && el.naturalWidth > 0) { progress(); return; }
      el.addEventListener('load',  progress, { once: true });
      el.addEventListener('error', progress, { once: true });
    }
  });

  // Fallback — masquer après 1.5s maximum
  setTimeout(hide, 1500);
})();

// Hamburger menu
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');
const menuClose    = document.getElementById('menuClose');

let _menuScrollY = 0;
const openMenu  = () => {
  _menuScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top      = `-${_menuScrollY}px`;
  document.body.style.width    = '100%';
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('visible');
  hamburger.classList.add('open');
};
const closeMenu = () => {
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('visible');
  hamburger.classList.remove('open');
  document.body.style.position = '';
  document.body.style.top      = '';
  document.body.style.width    = '';
  window.scrollTo(0, _menuScrollY);
};

hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
menuClose.addEventListener('click', closeMenu);
mobileOverlay.addEventListener('click', closeMenu);
document.querySelectorAll('.close-menu').forEach(l => l.addEventListener('click', closeMenu));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  });
});

// ── Carousel infini ──────────────────────────────────────────
(function () {
  const track   = document.getElementById('projTrack');
  const btnPrev = document.getElementById('projPrev');
  const btnNext = document.getElementById('projNext');
  if (!track) return;

  const SPEED = 0.5; // px par frame (~30 px/s à 60 fps)
  let pos         = 0;
  let hovered     = false;
  let animating   = false; // navigation manuelle en cours

  // Largeur d'un set complet (5 cartes originales)
  function halfWidth() {
    return [...track.querySelectorAll('.project-card:not([aria-hidden])')].reduce((s, c) => {
      return s + c.offsetWidth + parseFloat(getComputedStyle(c).marginRight);
    }, 0);
  }

  function cardWidth() {
    const c = track.querySelector('.project-card');
    return c.offsetWidth + parseFloat(getComputedStyle(c).marginRight);
  }

  function setPos(p, withTransition) {
    track.style.transition = withTransition ? 'transform .45s cubic-bezier(.25,.1,.25,1)' : 'none';
    track.style.transform  = `translateX(${-p}px)`;
  }

  // Boucle RAF
  (function loop() {
    if (!hovered && !animating) {
      pos += SPEED;
      if (pos >= halfWidth()) pos -= halfWidth();
      setPos(pos, false);
    }
    requestAnimationFrame(loop);
  })();

  // Pause au survol de la zone carrousel
  track.addEventListener('mouseenter', () => { hovered = true; });
  track.addEventListener('mouseleave', () => { hovered = false; });

  // Navigation manuelle — transition douce sans saut visuel
  function jumpBy(delta) {
    if (animating) return;
    animating = true;
    const half = halfWidth();

    // Marche arrière : on se téléporte en fin de boucle pour éviter un saut négatif
    if (delta < 0 && pos + delta < 0) {
      setPos(pos + half, false);
      track.getBoundingClientRect(); // forcer reflow
      pos += half;
    }

    pos += delta;
    setPos(pos, true);

    // Après la transition, normaliser pos dans [0, half) sans effet visuel
    setTimeout(() => {
      if (pos >= half) {
        pos -= half;
        setPos(pos, false);
      }
      animating = false;
    }, 460);
  }

  btnPrev && btnPrev.addEventListener('click', () => jumpBy(-cardWidth()));
  btnNext && btnNext.addEventListener('click', () => jumpBy( cardWidth()));
})();

// ── CTA Form ─────────────────────────────────────────────────
(function () {
  const intro     = document.getElementById('ctaIntro');
  const formWrap  = document.getElementById('ctaFormWrap');
  const openBtn   = document.getElementById('ctaOpenForm');
  const form      = document.getElementById('ctaForm');
  const successEl = document.getElementById('ctaSuccess');
  const submitBtn = document.getElementById('cfSubmit');
  if (!intro || !formWrap) return;

  // Ouvrir le formulaire
  openBtn.addEventListener('click', () => {
    intro.style.opacity   = '0';
    intro.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      intro.style.display     = 'none';
      formWrap.style.display  = 'block';
      formWrap.getBoundingClientRect(); // force reflow
      formWrap.style.opacity  = '1';
      formWrap.style.transform = 'translateY(0)';
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 280);
  });

  // Références champs
  const fields = {
    name:  { el: document.getElementById('cf-name'),  err: document.getElementById('err-name') },
    phone: { el: document.getElementById('cf-phone'), err: document.getElementById('err-phone') },
    email: { el: document.getElementById('cf-email'), err: document.getElementById('err-email') },
    type:  { el: document.getElementById('cf-type'),  err: document.getElementById('err-type') },
  };

  function showErr(k, msg) { fields[k].el.classList.add('invalid'); fields[k].err.textContent = msg; }
  function clearErr(k)     { fields[k].el.classList.remove('invalid'); fields[k].err.textContent = ''; }

  Object.keys(fields).forEach(k => {
    fields[k].el.addEventListener('input',  () => clearErr(k));
    fields[k].el.addEventListener('change', () => clearErr(k));
  });

  function validate() {
    let ok = true;
    if (!fields.name.el.value.trim())
      { showErr('name', 'Veuillez entrer votre nom.'); ok = false; } else clearErr('name');

    const ph = fields.phone.el.value.trim();
    if (!ph)
      { showErr('phone', 'Numéro requis.'); ok = false; }
    else if (!/^[\d\s\+\-\(\)]{8,}$/.test(ph))
      { showErr('phone', 'Numéro invalide.'); ok = false; }
    else clearErr('phone');

    const em = fields.email.el.value.trim();
    if (!em)
      { showErr('email', 'Email requis.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
      { showErr('email', 'Email invalide.'); ok = false; }
    else clearErr('email');

    if (!fields.type.el.value)
      { showErr('type', 'Veuillez choisir un type de projet.'); ok = false; } else clearErr('type');

    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    await new Promise(r => setTimeout(r, 900));
    const section = document.getElementById('contact');
    section.style.height = section.offsetHeight + 'px';
    form.hidden       = true;
    successEl.hidden  = false;
    submitBtn.style.display = 'none';
    document.querySelector('.cta-banner__form-title').hidden = true;
  });
})();

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    const top = s.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY >= top - 120) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.remove('nav__link--active');
    if (l.getAttribute('href') === `#${current}`) l.classList.add('nav__link--active');
  });
}, { passive: true });

// ── Plus de Projets — toggle extra categories ───────────────
(function () {
  const cta = document.querySelector('.projects__cta');
  const ctaText = document.querySelector('.projects__cta-text');
  const ctaArrow = document.querySelector('.projects__cta-arrow');
  const section = document.getElementById('projects');
  if (!cta || !ctaText || !section) return;

  let expanded = false;
  let container = null;
  const sliderWrap = document.querySelector('.projects__slider-wrap');

  const categories = [
    {
      title: 'Nos Projets Résidentiels',
      cards: [
        { img: '', name: 'Villa solaire — Sfax', overlayTitle: 'Villa solaire', overlayDesc: 'Sfax — 12 kWc installés. Autonomie énergétique de 85 % pour cette villa.' },
        { img: '', name: 'Maison individuelle — Sousse', overlayTitle: 'Maison individuelle', overlayDesc: 'Sousse — 8 kWc sur toiture. Économie annuelle de 4 200 TND.' },
        { img: '', name: 'Résidence — Tunis', overlayTitle: 'Résidence', overlayDesc: 'Tunis — 20 kWc en autoconsommation. Retour sur investissement en 4 ans.' },
      ]
    },
    {
      title: 'Nos Projets Industriels',
      cards: [
        { img: '', name: 'Usine textile — Monastir', overlayTitle: 'Usine textile', overlayDesc: 'Monastir — 300 kWc raccordés. Réduction de 60 % de la facture énergétique.' },
        { img: '', name: 'Zone industrielle — Gabès', overlayTitle: 'Zone industrielle', overlayDesc: 'Gabès — 500 kWc en toiture. Production annuelle estimée à 800 MWh.' },
        { img: '', name: 'Entrepôt logistique — Bizerte', overlayTitle: 'Entrepôt logistique', overlayDesc: 'Bizerte — 150 kWc installés. Alimentation complète des équipements de stockage.' },
      ]
    },
    {
      title: 'Nos Projets Agriculture',
      cards: [
        { img: '', name: 'Pompage solaire — Kairouan', overlayTitle: 'Pompage solaire', overlayDesc: 'Kairouan — 22 kWc off-grid. Irrigation de 30 hectares d\'oliviers.' },
        { img: '', name: 'Ferme agricole — Médenine', overlayTitle: 'Ferme agricole', overlayDesc: 'Médenine — 18 kWc pour alimentation de 4 pompes immergées.' },
        { img: '', name: 'Exploitation — Sidi Bouzid', overlayTitle: 'Exploitation agricole', overlayDesc: 'Sidi Bouzid — 35 kWc. Système hybride solaire-diesel pour 50 hectares.' },
      ]
    },
    {
      title: 'Nos Projets à l\'ENIS',
      cards: [
        { img: '', name: 'Laboratoire ENIS — Sfax', overlayTitle: 'Laboratoire ENIS', overlayDesc: 'Sfax — 25 kWc sur toiture du laboratoire. Projet de recherche en énergie renouvelable.' },
        { img: '', name: 'Campus ENIS — Sfax', overlayTitle: 'Campus ENIS', overlayDesc: 'Sfax — 40 kWc raccordés au réseau. Alimentation des bâtiments administratifs.' },
        { img: '', name: 'Atelier ENIS — Sfax', overlayTitle: 'Atelier ENIS', overlayDesc: 'Sfax — 15 kWc pour l\'atelier de génie électrique. Projet pédagogique et opérationnel.' },
      ]
    }
  ];

  function buildCard(card) {
    return '<div class="project-card" style="flex:0 0 clamp(320px,36vw,480px);margin-right:1.4rem;overflow:hidden">' +
      '<div class="project-card__img" style="width:100%;aspect-ratio:4/3;background:url(\'' + card.img + '\') center/cover no-repeat;margin-bottom:.8rem;position:relative;overflow:hidden">' +
        '<div class="project-card__overlay">' +
          '<h3 class="project-card__overlay-title">' + card.overlayTitle + '</h3>' +
          '<p class="project-card__overlay-desc">' + card.overlayDesc + '</p>' +
        '</div>' +
      '</div>' +
      '<p class="project-card__name">' + card.name + '</p>' +
    '</div>';
  }

  function buildContainer() {
    const el = document.createElement('div');
    el.id = 'extraProjects';
    el.style.cssText = 'display:none;opacity:0;';

    let html = '';
    categories.forEach(function (cat, i) {
      html += '<div style="padding:0 clamp(1.5rem,5vw,3.5rem);margin-top:3rem">';
      html += '<h3 style="font-size:clamp(1.4rem,3vw,2rem);font-weight:800;color:#1c1c1c;letter-spacing:-.02em;line-height:1.1;margin-bottom:1.5rem;text-align:center">' + cat.title + '</h3>';
      html += '<div style="position:relative">';
      html += '<button class="projects__nav projects__nav--prev" data-cat-prev="' + i + '" aria-label="Précédent" style="top:42%;left:.2rem">&#8249;</button>';
      html += '<div class="projects__carousel-outer" data-cat-track="' + i + '">';
      html += '<div style="display:flex;gap:1.4rem;transition:transform .45s cubic-bezier(.25,.1,.25,1)">';
      cat.cards.forEach(function (card) {
        html += buildCard(card);
      });
      html += '</div></div>';
      html += '<button class="projects__nav projects__nav--next" data-cat-next="' + i + '" aria-label="Suivant" style="top:42%;right:.2rem">&#8250;</button>';
      html += '</div></div>';
    });

    el.innerHTML = html;

    categories.forEach(function (cat, i) {
      var outer = el.querySelector('[data-cat-track="' + i + '"]');
      var track = outer.querySelector('div');
      var prev = el.querySelector('[data-cat-prev="' + i + '"]');
      var next = el.querySelector('[data-cat-next="' + i + '"]');
      var offset = 0;

      function getCardW() {
        var c = track.querySelector('.project-card');
        return c ? c.offsetWidth + parseFloat(getComputedStyle(c).marginRight || 0) : 0;
      }

      function maxOffset() {
        return Math.max(0, track.scrollWidth - outer.offsetWidth);
      }

      function apply() {
        track.style.transform = 'translateX(' + (-offset) + 'px)';
      }

      prev.addEventListener('click', function () {
        offset = Math.max(0, offset - getCardW());
        apply();
      });

      next.addEventListener('click', function () {
        offset = Math.min(maxOffset(), offset + getCardW());
        apply();
      });
    });

    return el;
  }

  cta.addEventListener('click', function (e) {
    e.preventDefault();

    if (!container) {
      container = buildContainer();
      section.appendChild(container);
    }

    if (!expanded) {
      sliderWrap.style.display = 'none';
      container.style.display = 'block';
      container.style.opacity = '0';
      container.offsetHeight;
      container.style.transition = 'opacity .5s ease';
      container.style.opacity = '1';
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ctaText.textContent = 'MOINS DE PROJETS';
      ctaArrow.textContent = '↑';
      expanded = true;
    } else {
      container.style.display = 'none';
      container.style.opacity = '0';
      sliderWrap.style.display = '';
      sliderWrap.style.opacity = '0';
      sliderWrap.offsetHeight;
      sliderWrap.style.transition = 'opacity .5s ease';
      sliderWrap.style.opacity = '1';
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ctaText.textContent = 'PLUS DE PROJETS';
      ctaArrow.textContent = '→';
      expanded = false;
    }
  });
})();

// ── Stats — compteurs animés au scroll ───────────────────────
(function () {
  const section = document.querySelector('.stats');
  if (!section) return;

  const counters = section.querySelectorAll('.stats__number[data-target]');
  let triggered = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 3200;
    const start   = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value    = Math.round(easeOutCubic(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      section.classList.add('is-visible');
      counters.forEach(animateCounter);
      observer.disconnect();
    }
  }, { threshold: 0.35 });

  observer.observe(section);
})();

// ── Hero animated word ────────────────────────────────────────
(function () {
  const words  = ['expertise', 'excellence', 'référence', 'signature'];
  let idx      = 0;
  const wordEl = document.querySelector('.hero__word');
  if (!wordEl) return;

  wordEl.addEventListener('animationiteration', function () {
    idx = (idx + 1) % words.length;
    wordEl.textContent = words[idx];
  });
})();

// ── Hero poster: retire l'img quand la video demarre ─────────
(function () {
  var poster = document.querySelector('.hero__poster');
  var video  = document.querySelector('.hero__video');
  if (!poster || !video) return;
  function removePoster() { poster.style.display = 'none'; }
  if (video.readyState >= 3) { removePoster(); return; }
  video.addEventListener('playing', removePoster, { once: true });
})();

// ── Vidéo CTA ralentie ───────────────────────────────────────
(function () {
  var vid = document.querySelector('.cta-banner__video');
  if (!vid) return;
  vid.playbackRate = 1;
  vid.addEventListener('loadedmetadata', function () { vid.playbackRate = 1; });
})();

// ── Nav transparent / scrolled ───────────────────────────────
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  if (nav.hasAttribute('data-static')) return;
  function update() { nav.classList.toggle('nav--scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── Scroll reveal ────────────────────────────────────────────
(function () {
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { obs.observe(el); });
})();

// ── Scroll to top ───────────────────────────────────────────
(function () {
  var btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── Project overlay au tap (mobile tactile uniquement) ───────
(function () {
  if (!window.matchMedia('(hover: none)').matches) return;

  function closeAll() {
    document.querySelectorAll('.project-card.overlay-open').forEach(function (c) {
      c.classList.remove('overlay-open');
    });
  }

  // Délégation sur le track pour couvrir les cartes originales uniquement
  var track = document.getElementById('projTrack');
  if (!track) return;

  track.addEventListener('click', function (e) {
    var card = e.target.closest('.project-card');
    if (!card) return;

    var isOpen = card.classList.contains('overlay-open');
    closeAll();
    if (!isOpen) card.classList.add('overlay-open');
  });

  // Tap en dehors du carousel = fermer
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#projTrack')) closeAll();
  });
})();
