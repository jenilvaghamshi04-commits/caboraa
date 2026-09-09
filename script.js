const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const form = $('#bookingForm');
const destination = $('#destination');
const suggestions = $('#suggestions');
const modal = $('#rideModal');
let selectedRide = { name: 'Hatchback', price: 10 };
let tripType = 'One way';

$$('.trip-tabs button').forEach(btn => btn.addEventListener('click', () => {
  $$('.trip-tabs button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tripType = btn.textContent.trim();
  $('#returnDateLabel').hidden = btn.dataset.trip !== 'round-trip';
  destination.placeholder = btn.dataset.trip === 'airport' ? 'Select airport or terminal' : btn.dataset.trip === 'local' ? 'Where would you like to visit?' : 'Enter destination';
}));

$('#swapRoute').addEventListener('click', () => {
  const pickup = $('#pickup');
  const current = pickup.value;
  pickup.value = destination.value || 'Enter pickup location';
  destination.value = current === 'Current location' ? '' : current;
});

destination.addEventListener('focus', () => suggestions.hidden = false);
destination.addEventListener('input', () => suggestions.hidden = false);
$$('#suggestions button').forEach(btn => btn.addEventListener('click', () => {
  destination.value = btn.dataset.place;
  suggestions.hidden = true;
}));
document.addEventListener('click', e => {
  if (!e.target.closest('.destination') && !e.target.closest('.suggestions')) suggestions.hidden = true;
});

function selectRide(name, price) {
  selectedRide = { name, price: Number(price) };
  $$('.ride-card').forEach(card => card.classList.toggle('active', card.dataset.ride === name));
  $$('.cab-option').forEach(option => option.classList.toggle('active', option.dataset.ride === name));
}

$$('.ride-card').forEach(card => card.addEventListener('click', () => selectRide(card.dataset.ride, card.dataset.price)));
$$('.cab-option').forEach(option => option.addEventListener('click', () => selectRide(option.dataset.ride, option.dataset.price)));
$$('.book-car').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  const card = button.closest('.ride-card');
  selectRide(card.dataset.ride, card.dataset.price);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => destination.focus(), 550);
}));

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!destination.value.trim()) { destination.focus(); suggestions.hidden = false; return; }
  $('#routeSummary').textContent = `${tripType} · ${$('#pickup').value} → ${destination.value}`;
  $('#selectedName').textContent = selectedRide.name;
  $('#selectedPrice').textContent = `₹${selectedRide.price}/km`;
  const bookingMessage = `Hi caboraa, I want to book a ${selectedRide.name}. ${tripType}: ${$('#pickup').value} to ${destination.value}. Pickup date: ${$('#rideDate').value}, time: ${$('#rideTime').value}.`;
  $('.wa-confirm').href = `https://wa.me/918866305165?text=${encodeURIComponent(bookingMessage)}`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
});

$$('[data-close]').forEach(el => el.addEventListener('click', () => {
  modal.hidden = true; document.body.style.overflow = '';
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.hidden = true; document.body.style.overflow = ''; } });

const today = new Date();
$('#rideDate').min = today.toISOString().slice(0,10);
$('#rideDate').value = today.toISOString().slice(0,10);
$('#returnDate').min = today.toISOString().slice(0,10);
$('#returnDate').value = today.toISOString().slice(0,10);
$('#rideTime').value = `${String(today.getHours()).padStart(2,'0')}:${String((today.getMinutes()+15)%60).padStart(2,'0')}`;

// caboraa motion: reveal content progressively without blocking interaction.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  document.body.classList.add('motion-ready');

  const revealSingles = [
    ['.section-heading', 'reveal'],
    ['.safety-visual', 'reveal from-left'],
    ['.safety-copy', 'reveal from-right'],
    ['.route-copy', 'reveal from-left'],
    ['.route-list', 'reveal from-right'],
    ['.driver-cta>div:first-child', 'reveal from-left'],
    ['.earn-card', 'reveal from-right'],
    ['.business>div', 'reveal'],
    ['.faq-section>div', 'reveal'],
    ['.footer-main', 'reveal']
  ];
  revealSingles.forEach(([selector, classes]) => $$(selector).forEach(el => el.classList.add(...classes.split(' '))));
  ['.quick-strip', '.ride-grid', '.step-grid'].forEach(selector => $(selector)?.classList.add('reveal-group'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -40px' });
  $$('.reveal, .reveal-group').forEach(el => observer.observe(el));

  const earning = $('.earn-card strong');
  if (earning) {
    const earningObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 1200;
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        earning.textContent = `₹${Math.round(18420 * eased).toLocaleString('en-IN')}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      earningObserver.disconnect();
    }, { threshold: .5 });
    earningObserver.observe(earning);
  }

  $$('.ride-card').forEach(card => card.addEventListener('pointermove', event => {
    if (window.innerWidth < 901) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.querySelector('.fleet-photo').style.transform = `scale(1.04) translate(${x * 7}px, ${y * 7}px)`;
  }));
  $$('.ride-card').forEach(card => card.addEventListener('pointerleave', () => {
    card.querySelector('.fleet-photo').style.transform = '';
  }));
}

$$('.primary-cta, .book-car, .call-confirm, .wa-confirm').forEach(button => button.addEventListener('pointerdown', event => {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  ripple.className = 'tap-ripple';
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}));
