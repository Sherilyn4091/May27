/* ============================================================
   animations.js
   Sequence: Loading (3s) → Daisy bloom → Baking game → Main
   ============================================================ */

/* ---- DOM refs ---- */
const loadingScreen   = document.getElementById('loading-screen');
const loadingPercent  = document.querySelector('.loading-percent');
const daisyTransition = document.getElementById('daisy-transition');
const bakeScene       = document.getElementById('bake-scene');
const mainContent     = document.getElementById('main-content');
const floatDeco       = document.getElementById('float-deco');

/* ---- Live percent counter: 0→100 in 3000ms ---- */
function startPercentCounter() {
  let pct = 0;
  const tick = () => {
    pct = Math.min(100, pct + 1);
    if (loadingPercent) loadingPercent.textContent = pct + '%';
    if (pct < 100) setTimeout(tick, 30);
  };
  tick();
}

/* ============================================================
   ENTRY POINT
   ============================================================ */
window.addEventListener('load', () => {
  startPercentCounter();

  /* Step 1 — after 3s CSS bar finishes */
  setTimeout(() => {
    loadingScreen.style.transition = 'opacity .5s ease';
    loadingScreen.style.opacity    = '0';
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      showDaisyTransition();
    }, 500);
  }, 3000);
});

/* ============================================================
   STEP 2 — DAISY BLOOM
   ============================================================ */
function showDaisyTransition() {
  daisyTransition.classList.remove('hidden');
  daisyTransition.classList.add('flex');

  /* CSS animation is 2.2s; we wait 2.4s then cut to baking */
  setTimeout(() => {
    daisyTransition.classList.add('hidden');
    daisyTransition.classList.remove('flex');
    showBakeScene();
  }, 2400);
}

/* ============================================================
   STEP 3 — BAKING SCENE (logic in interactions.js)
   ============================================================ */
function showBakeScene() {
  bakeScene.classList.remove('hidden');
  bakeScene.classList.add('flex');
}

/* Called by interactions.js when player clicks CONTINUE */
window.onBakingComplete = function () {
  bakeScene.style.transition = 'opacity .9s ease';
  bakeScene.style.opacity    = '0';
  setTimeout(() => {
    bakeScene.classList.add('hidden');
    bakeScene.classList.remove('flex');
    revealMainContent();
  }, 900);
};

/* ============================================================
   STEP 4 — MAIN CONTENT
   ============================================================ */
function revealMainContent() {
  floatDeco.classList.remove('hidden');
  mainContent.style.transition = 'opacity 1.2s ease';
  mainContent.style.opacity    = '1';
  mainContent.classList.remove('opacity-0');

  initScrollReveal();
  launchConfetti();
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

/* ============================================================
   CONFETTI (pixel squares)
   ============================================================ */
const CONF_COLORS = ['#cbaacb','#ffffb5','#c6dbda','#8fcaca','#97c1a9','#fcb9aa','#f7f4d5'];

function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    setTimeout(spawnConfetti, Math.random() * 2200);
  }
}

function spawnConfetti() {
  const el = document.createElement('div');
  el.classList.add('px-confetti');
  el.style.left             = Math.random() * 100 + 'vw';
  el.style.top              = '-10px';
  el.style.background       = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];
  el.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
  el.style.transform        = `rotate(${Math.random() * 360}deg)`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}