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
  // « Clac » de disjoncteur : très court, volume bas, uniquement quand on clique (jamais au chargement)
  let audioCtx;
  const clack = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t = audioCtx.currentTime + 0.005;
      const master = audioCtx.createGain(); master.gain.value = 0.4; master.connect(audioCtx.destination);
      const hit = (when, gain, freq) => {
        const len = Math.floor(audioCtx.sampleRate * 0.03);
        const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
        const src = audioCtx.createBufferSource(); src.buffer = buf;
        const band = audioCtx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = freq; band.Q.value = 1.1;
        const g = audioCtx.createGain(); g.gain.value = gain;
        src.connect(band); band.connect(g); g.connect(master); src.start(when);
      };
      hit(t, 0.9, 2400); hit(t + 0.02, 0.55, 1300);
      const body = audioCtx.createOscillator(); const bg = audioCtx.createGain();
      body.frequency.setValueAtTime(150, t); body.frequency.exponentialRampToValueAtTime(65, t + 0.06);
      bg.gain.setValueAtTime(0.35, t); bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      body.connect(bg); bg.connect(master); body.start(t); body.stop(t + 0.09);
    } catch (error) {}
  };
  // Disjoncteur de l'accueil : la mise sous tension se joue une fois au chargement (CSS),
  // puis le visiteur peut couper et remettre le courant. Coupé : tout s'éteint sauf les boutons d'appel.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero-home');
  const breaker = document.getElementById('breaker');
  if (hero && breaker) {
    let powering = !reduceMotion;
    let pulse = 'pulse-b';
    hero.addEventListener('animationend', event => { if (event.animationName === 'power-on') powering = false; });
    breaker.addEventListener('click', () => {
      const turnOn = powering || hero.classList.contains('off');
      if (hero.style.animationName !== 'none') {
        hero.style.setProperty('--glow', getComputedStyle(hero).getPropertyValue('--glow').trim() || '1');
        hero.style.animationName = 'none';
        void hero.offsetWidth;
        powering = false;
      }
      hero.classList.add('booted');
      hero.style.setProperty('--glow', turnOn ? '1' : '0');
      hero.classList.toggle('off', !turnOn);
      breaker.setAttribute('aria-pressed', String(turnOn));
      if (turnOn) {
        // Étincelle + reflet sur les boutons d'appel (classes alternées pour relancer l'animation)
        hero.classList.remove(pulse);
        pulse = pulse === 'pulse-a' ? 'pulse-b' : 'pulse-a';
        hero.classList.add(pulse);
      }
      if (navigator.vibrate) navigator.vibrate(turnOn ? 14 : 22);
      clack();
    });
  }
  // Statut d'ouverture en direct (heure de Paris) : du lundi au samedi, 8 h à 18 h.
  // Masqué les jours fériés pour ne jamais afficher une information douteuse.
  const openStatus = document.getElementById('openStatus');
  const openText = document.getElementById('openText');
  if (openStatus && openText && window.Intl) {
    const easter = year => {
      const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
      const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
      return new Date(Date.UTC(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1));
    };
    const isHoliday = (year, month, day) => {
      const fixed = ['1-1', '5-1', '5-8', '7-14', '8-15', '11-1', '11-11', '12-25'];
      if (fixed.includes(month + '-' + day)) return true;
      const e = easter(year).getTime(), dayMs = 864e5, t = Date.UTC(year, month - 1, day);
      return [1, 39, 50].some(offset => t === e + offset * dayMs);
    };
    const updateStatus = () => {
      const parts = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(part => { parts[part.type] = part.value; });
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const wd = days.indexOf(parts.weekday);
      const minutes = Number(parts.hour) * 60 + Number(parts.minute);
      if (wd < 0 || isHoliday(Number(parts.year), Number(parts.month), Number(parts.day))) { openStatus.hidden = true; return; }
      const y = Number(parts.year), mo = Number(parts.month), da = Number(parts.day);
      const holidayIn = n => { const d = new Date(Date.UTC(y, mo - 1, da + n)); return isHoliday(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); };
      const workday = wd >= 1 && wd <= 6;
      const open = workday && minutes >= 480 && minutes < 1080;
      const closed = 'Fermé';
      let text;
      if (open) text = 'Ouvert, joignable jusqu’à 18 h';
      else if (workday && minutes < 480) text = closed + ', ouverture à 8 h';
      else if (wd >= 1 && wd <= 5) text = holidayIn(1) ? closed : closed + ', réouverture demain à 8 h';
      else text = holidayIn(wd === 6 ? 2 : 1) ? closed : closed + ', réouverture lundi à 8 h';
      openText.textContent = text;
      openStatus.classList.toggle('is-open', open);
      openStatus.hidden = false;
    };
    updateStatus();
    setInterval(updateStatus, 60000);
  }
  // Apparitions douces au défilement (le contenu reste visible si le script ne tourne pas)
  const revealItems = document.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      document.documentElement.classList.add('reveal-ready');
      const revealer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); revealer.unobserve(entry.target); }
      }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealItems.forEach(item => revealer.observe(item));
    } else revealItems.forEach(item => item.classList.add('in'));
  }
  // Diagnostic express : onglets accessibles (flèches du clavier), une situation affichée à la fois
  const tabs = Array.from(document.querySelectorAll('.diag-tabs [role="tab"]'));
  const stage = document.querySelector('.diag-stage');
  if (tabs.length && stage) {
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        panels[i].classList.toggle('enter', on && !reduceMotion);
      });
      if (focus) tabs[index].focus();
    };
    stage.classList.add('ready');
    select(0, false);
    panels[0].classList.remove('enter');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { if (tab.getAttribute('aria-selected') !== 'true') clack(); select(i, false); });
      tab.addEventListener('keydown', event => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (event.key in keys) { event.preventDefault(); select((i + keys[event.key] + tabs.length) % tabs.length, true); }
        else if (event.key === 'Home') { event.preventDefault(); select(0, true); }
        else if (event.key === 'End') { event.preventDefault(); select(tabs.length - 1, true); }
      });
    });
  }
  // Boutons « Décrire ma panne » : pré-remplissent le formulaire (sans écraser ce qui est déjà écrit)
  document.querySelectorAll('[data-prefill-service]').forEach(link => link.addEventListener('click', () => {
    const service = document.getElementById('serviceSelect');
    const message = document.querySelector('#contactForm textarea[name="message"]');
    if (service && Array.from(service.options).some(option => option.value === link.dataset.prefillService)) service.value = link.dataset.prefillService;
    if (message && !message.value.trim()) message.value = link.dataset.prefillMessage || '';
  }));
  // Carte de la côte : survol d'une ville, synchronisé avec la liste
  const mapInfo = document.getElementById('mapInfo');
  if (mapInfo) {
    const defaultInfo = mapInfo.textContent;
    const labels = { cannes: 'Cannes', 'le-cannet': 'Le Cannet', antibes: 'Antibes', mandelieu: 'Mandelieu-la-Napoule' };
    const prices = { cannes: '110', 'le-cannet': '110', antibes: '120', mandelieu: '120' };
    const items = document.querySelectorAll('.coast .pin, .zone-copy .city');
    const show = city => {
      items.forEach(el => el.classList.toggle('hl', el.dataset.city === city));
      mapInfo.innerHTML = labels[city] + ' : forfait dépannage <b>' + prices[city] + '&nbsp;€</b>';
    };
    const reset = () => { items.forEach(el => el.classList.remove('hl')); mapInfo.textContent = defaultInfo; };
    items.forEach(el => {
      el.addEventListener('mouseenter', () => show(el.dataset.city));
      el.addEventListener('focus', () => show(el.dataset.city));
      el.addEventListener('mouseleave', reset);
      el.addEventListener('blur', reset);
    });
  }
  // Fil de progression de lecture (en CSS quand le navigateur sait le faire, sinon ici)
  const wire = document.getElementById('wire');
  if (wire && !(window.CSS && CSS.supports('animation-timeline: scroll()'))) {
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
    tag.src = 'https://static.cloudflareinsights.com/beacon.min.js';
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
