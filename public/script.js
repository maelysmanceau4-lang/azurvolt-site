(() => {
  'use strict';
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
  }
  const desktopDropdowns = Array.from(document.querySelectorAll('.desktop .nav-dropdown'));
  desktopDropdowns.forEach(dropdown => dropdown.addEventListener('toggle', () => {
    if (dropdown.open) desktopDropdowns.forEach(other => { if (other !== dropdown) other.open = false; });
  }));
  document.addEventListener('click', event => {
    if (!event.target.closest('.desktop .nav-dropdown')) desktopDropdowns.forEach(dropdown => { dropdown.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') desktopDropdowns.forEach(dropdown => { dropdown.open = false; });
  });
  const select = document.getElementById('serviceSelect');
  const requested = new URLSearchParams(location.search).get('prestation');
  if (select && requested && Array.from(select.options).some(option => option.value === requested)) select.value = requested;
  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  const image = document.getElementById('previewImage');
  const status = document.getElementById('photoStatus');
  let objectUrl;
  function resetPhoto(message = '') {
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = undefined; }
    input.value = '';
    image.removeAttribute('src');
    preview.hidden = true;
    status.textContent = message;
  }
  if (input) {
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return resetPhoto();
      if (file.size > 10 * 1024 * 1024) return resetPhoto('Cette photo dépasse 10 Mo. Choisissez une image plus légère.');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return resetPhoto('Choisissez une photo JPG, PNG ou WebP.');
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(file);
      image.src = objectUrl;
      preview.hidden = false;
      status.textContent = 'Photo ajoutée : ' + file.name;
    });
    document.getElementById('removePhoto').addEventListener('click', () => { resetPhoto('Photo retirée.'); input.focus(); });
    image.addEventListener('error', () => resetPhoto('Cette image ne peut pas être lue. Choisissez une autre photo.'));
  }
  const form = document.getElementById('contactForm');
  if (form) {
    const submit = form.querySelector('[type="submit"]');
    const requestId = document.getElementById('requestId');
    if (requestId) requestId.value = crypto.randomUUID();
    const formStatus = document.getElementById('formStatus');
    form.addEventListener('submit', event => {
      if (input.files[0] && input.files[0].size > 10 * 1024 * 1024) {
        event.preventDefault(); resetPhoto('Cette photo dépasse 10 Mo. Choisissez une image plus légère.'); input.focus(); return;
      }
      // Native multipart POST to the existing Azur Volt Worker.
      formStatus.textContent = 'Envoi en cours…';
      submit.disabled = true;
      window.setTimeout(() => { submit.disabled = false; }, 12000);
    });
    window.addEventListener('pageshow', () => { submit.disabled = false; formStatus.textContent = ''; if (requestId) requestId.value = crypto.randomUUID(); });
  }
  const heroCall = document.querySelector('.hero-home .primary');
  if (heroCall && 'IntersectionObserver' in window) {
    const small = matchMedia('(max-width: 900px)');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => document.body.classList.toggle('bar-hidden', small.matches && entry.isIntersecting));
    });
    observer.observe(heroCall);
    small.addEventListener('change', () => { if (!small.matches) document.body.classList.remove('bar-hidden'); });
  }
  // Disjoncteur de l'accueil : la mise sous tension se joue une fois au chargement (CSS),
  // puis le visiteur peut couper et remettre le courant.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero-home');
  const breaker = document.getElementById('breaker');
  if (hero && breaker) {
    let powering = !reduceMotion;
    hero.addEventListener('animationend', () => { powering = false; });
    breaker.addEventListener('click', () => {
      const turnOn = powering || hero.classList.contains('off');
      if (hero.style.animationName !== 'none') {
        hero.style.setProperty('--glow', getComputedStyle(hero).getPropertyValue('--glow').trim() || '1');
        hero.style.animationName = 'none';
        void hero.offsetWidth;
        powering = false;
      }
      hero.style.setProperty('--glow', turnOn ? '1' : '0');
      hero.classList.toggle('off', !turnOn);
      breaker.setAttribute('aria-pressed', String(turnOn));
    });
  }
  // Interrupteur double : chaque bascule allume son ampoule
  const rig = document.querySelector('.rig');
  if (rig) {
    const room = rig.closest('.workshop');
    rig.querySelectorAll('.rocker').forEach(rocker => rocker.addEventListener('click', () => {
      const on = rocker.getAttribute('aria-pressed') !== 'true';
      rocker.setAttribute('aria-pressed', String(on));
      const bulb = rig.querySelector('.bulb[data-bulb="' + rocker.dataset.sw + '"]');
      if (bulb) bulb.classList.toggle('on', on);
      const lit = rig.querySelectorAll('.bulb.on').length;
      room.classList.toggle('lit-1', lit === 1);
      room.classList.toggle('lit-2', lit === 2);
    }));
  }
  // Fil de progression de lecture
  const wire = document.getElementById('wire');
  if (wire) {
    let queued = false;
    const draw = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      wire.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
    addEventListener('resize', draw);
    draw();
  }
  // Étapes : le fil s'allume quand la section arrive à l'écran
  const steps = document.querySelector('.steps-home');
  if (steps) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const seen = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { steps.classList.add('in'); seen.disconnect(); }
      }, { threshold: 0.35 });
      seen.observe(steps);
    } else steps.classList.add('in');
  }
  // Avis : carrousel (points de repère et flèches)
  document.querySelectorAll('[data-carousel]').forEach(track => {
    const items = Array.from(track.children);
    if (items.length < 2) return;
    const nav = document.createElement('div');
    nav.className = 'rev-nav';
    nav.innerHTML = '<div class="rev-dots" aria-hidden="true">' + items.map(() => '<span></span>').join('') + '</div>'
      + '<div class="rev-arrows"><button type="button" aria-label="Avis précédent" data-dir="-1">←</button><button type="button" aria-label="Avis suivant" data-dir="1">→</button></div>';
    track.insertAdjacentElement('afterend', nav);
    const dots = Array.from(nav.querySelectorAll('.rev-dots span'));
    const update = () => {
      const x = track.scrollLeft;
      let best = 0;
      items.forEach((item, i) => { if (Math.abs(item.offsetLeft - track.offsetLeft - x) < Math.abs(items[best].offsetLeft - track.offsetLeft - x)) best = i; });
      dots.forEach((dot, i) => dot.classList.toggle('on', i === best));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    nav.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      track.scrollBy({ left: Number(button.dataset.dir) * (items[0].offsetWidth + 16), behavior: 'smooth' });
    }));
    update();
  });
})();
