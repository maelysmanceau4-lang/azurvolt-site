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
  const heroCall = document.querySelector('.hero-price-card .button');
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
  // Consentement : la mesure d'audience (Cloudflare Web Analytics) n'est chargée qu'après « Accepter ».
  const CONSENT_KEY = 'av-consent';
  const CONSENT_MS = 182 * 24 * 60 * 60 * 1000;
  const readChoice = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      return saved && Date.now() - saved.t < CONSENT_MS ? saved.choice : null;
    } catch (error) { return null; }
  };
  const saveChoice = choice => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, t: Date.now() })); } catch (error) {}
  };
  const loadAnalytics = () => {
    if (document.getElementById('cf-analytics')) return;
    const tag = document.createElement('script');
    tag.id = 'cf-analytics';
    tag.defer = true;
    tag.src = '../static.cloudflareinsights.com/beacon.min.js';
    tag.setAttribute('data-cf-beacon', '{"token": "7fdee28fe9224031834a1c987e848f77"}');
    document.body.appendChild(tag);
  };
  const statusText = () => {
    const choice = readChoice();
    return choice === 'accept' ? 'Votre choix actuel : mesure d’audience acceptée.'
      : choice === 'refuse' ? 'Votre choix actuel : mesure d’audience refusée.'
      : 'Vous n’avez pas encore fait de choix.';
  };
  const refreshStatus = () => document.querySelectorAll('[data-consent-status]').forEach(node => { node.textContent = statusText(); });
  let banner = null;
  const closeBanner = () => {
    if (banner) { banner.remove(); banner = null; }
    document.body.classList.remove('consent-open');
  };
  const openBanner = focus => {
    if (!banner) {
      banner = document.createElement('section');
      banner.className = 'cookie-consent';
      banner.setAttribute('aria-labelledby', 'cookie-title');
      banner.innerHTML = '<h2 id="cookie-title" class="cookie-title">Mesure d’audience</h2>'
        + '<p>Avec votre accord, nous mesurons la fréquentation du site avec Cloudflare Web Analytics, sans cookie publicitaire. Vous pouvez changer d’avis à tout moment. <a href="/cookies/">En savoir plus</a></p>'
        + '<div class="cookie-actions"><button type="button" class="cookie-btn" data-choice="refuse">Refuser</button>'
        + '<button type="button" class="cookie-btn" data-choice="accept">Accepter</button></div>';
      document.body.appendChild(banner);
      document.body.classList.add('consent-open');
      banner.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
        const choice = button.dataset.choice;
        saveChoice(choice);
        closeBanner();
        refreshStatus();
        if (choice === 'accept') loadAnalytics();
      }));
    }
    if (focus) banner.querySelector('button').focus();
  };
  const initialChoice = readChoice();
  if (initialChoice === 'accept') loadAnalytics();
  else if (!initialChoice) openBanner(false);
  refreshStatus();
  document.querySelectorAll('[data-consent-open]').forEach(button => button.addEventListener('click', () => openBanner(true)));
})();
