/* ============================================================
   interactions.js
   - Particle canvas
   - Baking mini-game (drag & drop + touch)
   - Post-bake pixel confetti & balloons
   - Scratch-to-reveal notes (FIXED: canvas sizing)
   - Flower garden (ORIGINAL: emoji flowers, cute & coquette)
   - CD music player (with pixel floating notes)
   - Replay + NEW: Celebrate button with falling flowers
   ============================================================ */

/* ============================================================
   PARTICLE CANVAS — drifting pixel dots
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const COLORS = ['#cbaacb','#ffffb5','#c6dbda','#8fcaca','#97c1a9','#fcb9aa'];
  const COUNT  = 55;
  let W, H, pts;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makePt() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * .35 + .08
    };
  }

  function init() { resize(); pts = Array.from({ length: COUNT }, makePt); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.r * 2), Math.ceil(p.r * 2));
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

/* ============================================================
   BAKING MINI-GAME
   ============================================================ */
(function initBakingGame() {
  const TOTAL       = 5;
  const bowlZone    = document.getElementById('bowl-zone');
  const bowlFills   = document.getElementById('bowl-fills');
  const bowlHint    = document.getElementById('bowl-hint');
  const cakeResult  = document.getElementById('cake-result');
  const continueBtn = document.getElementById('bake-continue-btn');
  const celebrate   = document.getElementById('bake-celebrate');

  const FILL_DATA = [
    { color:'#fffde0', label:'EGG'   },
    { color:'#5c3317', label:'CHOCO' },
    { color:'#c6dbda', label:'MILK'  },
    { color:'#f7f4d5', label:'FLOUR' },
    { color:'#8fcaca', label:'CHEF'  }
  ];

  let dropped = 0;

  document.querySelectorAll('.ingredient').forEach(el => {
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', el.dataset.id);
    });
  });

  document.querySelectorAll('.ingredient').forEach(el => {
    let clone = null;

    el.addEventListener('touchstart', e => {
      if (el.classList.contains('used')) return;
      const t = e.touches[0];
      clone = el.cloneNode(true);
      clone.style.cssText = `position:fixed;opacity:.8;pointer-events:none;z-index:9999;
        left:${t.clientX - 30}px;top:${t.clientY - 44}px;transform:scale(1.1)`;
      document.body.appendChild(clone);
      // Only preventDefault if event is cancelable
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    el.addEventListener('touchmove', e => {
      if (!clone) return;
      const t = e.touches[0];
      clone.style.left = t.clientX - 30 + 'px';
      clone.style.top  = t.clientY - 44 + 'px';
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    el.addEventListener('touchend', e => {
      if (!clone) return;
      const t      = e.changedTouches[0];
      const target = document.elementFromPoint(t.clientX, t.clientY);
      clone.remove(); clone = null;
      if (bowlZone && bowlZone.contains(target)) {
        handleDrop(el.dataset.id, el);
      }
    });
  });

  bowlZone.addEventListener('dragover',  e => { e.preventDefault(); bowlZone.classList.add('drag-over'); });
  bowlZone.addEventListener('dragleave', () => bowlZone.classList.remove('drag-over'));
  bowlZone.addEventListener('drop', e => {
    e.preventDefault();
    bowlZone.classList.remove('drag-over');
    const id  = e.dataTransfer.getData('text/plain');
    const src = document.querySelector(`.ingredient[data-id="${id}"]`);
    handleDrop(id, src);
  });

  function handleDrop(id, srcEl) {
    if (dropped >= TOTAL) return;
    if (srcEl && srcEl.classList.contains('used')) return;
    if (srcEl) srcEl.classList.add('used');

    const idx  = dropped;
    dropped++;

    const fillY  = 88 - idx * 9;
    const rect   = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x',      '66');
    rect.setAttribute('y',      String(Math.max(fillY, 44)));
    rect.setAttribute('width',  '48');
    rect.setAttribute('height', '7');
    rect.setAttribute('fill',   FILL_DATA[idx].color);
    rect.setAttribute('opacity','0.7');
    bowlFills.appendChild(rect);

    bowlHint.textContent = dropped + ' / ' + TOTAL;

    const svg = document.getElementById('bowl-svg');
    if (svg) { svg.style.transform = 'scale(1.1)'; setTimeout(() => { svg.style.transform = ''; }, 200); }

    if (dropped === TOTAL) setTimeout(showCakeResult, 500);
  }

  function showCakeResult() {
    cakeResult.classList.remove('hidden');
    cakeResult.classList.add('flex');
    cakeResult.style.opacity   = '0';
    cakeResult.style.transform = 'scale(.85)';
    cakeResult.style.transition = 'opacity .5s, transform .5s cubic-bezier(0.34,1.56,0.64,1)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cakeResult.style.opacity   = '1';
      cakeResult.style.transform = 'scale(1)';
    }));
    spawnBakeCelebration();
  }

  const CONF_COLS = ['#cbaacb','#ffffb5','#c6dbda','#8fcaca','#97c1a9','#fcb9aa'];
  const BALL_COLS = ['#cbaacb','#ffffb5','#8fcaca','#fcb9aa','#97c1a9'];

  function spawnBakeCelebration() {
    celebrate.classList.remove('hidden');
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.classList.add('px-confetti');
        el.style.left             = Math.random() * 100 + 'vw';
        el.style.top              = '-10px';
        el.style.background       = CONF_COLS[Math.floor(Math.random() * CONF_COLS.length)];
        el.style.animationDuration = (2.2 + Math.random() * 2) + 's';
        el.style.transform        = `rotate(${Math.random() * 360}deg)`;
        celebrate.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
      }, Math.random() * 1500);
    }
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnPixelBalloon(), Math.random() * 2000);
    }
  }

  function spawnPixelBalloon() {
    const color = BALL_COLS[Math.floor(Math.random() * BALL_COLS.length)];
    const x     = 10 + Math.random() * 80;
    const dur   = 4 + Math.random() * 3;
    const wrap = document.createElement('div');
    wrap.classList.add('px-balloon');
    wrap.style.left             = x + 'vw';
    wrap.style.bottom           = '-60px';
    wrap.style.animationDuration = dur + 's';
    wrap.innerHTML = `
      <svg width="36" height="52" viewBox="0 0 36 52" fill="none" style="image-rendering:pixelated">
        <rect x="10" y="4"  width="16" height="2"  fill="${color}"/>
        <rect x="6"  y="6"  width="24" height="2"  fill="${color}"/>
        <rect x="4"  y="8"  width="28" height="2"  fill="${color}"/>
        <rect x="2"  y="10" width="32" height="2"  fill="${color}"/>
        <rect x="2"  y="12" width="32" height="2"  fill="${color}"/>
        <rect x="2"  y="14" width="32" height="2"  fill="${color}"/>
        <rect x="2"  y="16" width="32" height="2"  fill="${color}"/>
        <rect x="2"  y="18" width="32" height="2"  fill="${color}"/>
        <rect x="4"  y="20" width="28" height="2"  fill="${color}"/>
        <rect x="6"  y="22" width="24" height="2"  fill="${color}"/>
        <rect x="8"  y="24" width="20" height="2"  fill="${color}"/>
        <rect x="10" y="26" width="16" height="2"  fill="${color}"/>
        <rect x="14" y="28" width="8"  height="2"  fill="${color}"/>
        <rect x="16" y="30" width="4"  height="2"  fill="${color}" opacity=".7"/>
        <rect x="18" y="32" width="2"  height="2"  fill="#f7f4d5" opacity=".5"/>
        <rect x="16" y="34" width="2"  height="2"  fill="#f7f4d5" opacity=".5"/>
        <rect x="18" y="36" width="2"  height="2"  fill="#f7f4d5" opacity=".5"/>
        <rect x="16" y="38" width="2"  height="2"  fill="#f7f4d5" opacity=".5"/>
        <rect x="18" y="40" width="2"  height="2"  fill="#f7f4d5" opacity=".5"/>
        <rect x="8"  y="10" width="6"  height="4"  fill="white"   opacity=".25"/>
      </svg>`;
    celebrate.appendChild(wrap);
    wrap.addEventListener('animationend', () => wrap.remove());
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (typeof window.onBakingComplete === 'function') window.onBakingComplete();
    });
  }
})();

/* ============================================================
   SCRATCH-TO-REVEAL NOTES — FIXED CANVAS SIZING
   ============================================================ */
(function initScratchNotes() {
  document.querySelectorAll('.scratch-note').forEach(note => {
    const canvas = note.querySelector('.scratch-canvas');
    const cursor = note.querySelector('.eraser-cursor');
    if (!canvas) return;

    function resize() {
      const w = note.offsetWidth || note.clientWidth;
      const h = note.offsetHeight || note.clientHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
        drawScratchLayer(canvas);
      }
    }

    function drawScratchLayer(c) {
      const ctx = c.getContext('2d');
      const fillColor = c.dataset.color || '#cbaacb';
      
      // SOLID base layer - ensures full coverage
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, c.width, c.height);
      
      // Semi-transparent overlay for scratch effect
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, c.width, c.height);
      
      // Pixel checkerboard deco on top
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let x = 0; x < c.width; x += 8) {
        for (let y = 0; y < c.height; y += 8) {
          if ((x + y) % 16 === 0) ctx.fillRect(x, y, 8, 8);
        }
      }

      ctx.fillStyle   = 'rgba(10,51,35,0.55)';
      ctx.font        = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCRATCH ME', c.width / 2, c.height / 2);
    }

    let painting = false;
    const ERASER_R = 24;

    function erase(x, y) {
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.rect(x - ERASER_R, y - ERASER_R, ERASER_R * 2, ERASER_R * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    function getPos(e) {
      const r = canvas.getBoundingClientRect();
      if (e.touches) {
        return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
      }
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function moveCursor(e) {
      const { x, y } = getPos(e);
      if (cursor) {
        cursor.style.display = 'block';
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      }
    }

    canvas.addEventListener('mouseenter', () => { if (cursor) cursor.style.display = 'block'; });
    canvas.addEventListener('mouseleave', () => { painting = false; if (cursor) cursor.style.display = 'none'; });
    canvas.addEventListener('mousemove', e => { moveCursor(e); if (painting) erase(getPos(e).x, getPos(e).y); });
    canvas.addEventListener('mousedown', e => { painting = true; erase(getPos(e).x, getPos(e).y); });
    canvas.addEventListener('mouseup', () => { painting = false; });
    
    // Touch events with proper cancelable check
    canvas.addEventListener('touchstart', e => { 
      painting = true; 
      erase(getPos(e).x, getPos(e).y); 
      if (e.cancelable) e.preventDefault(); 
    }, { passive: false });
    
    canvas.addEventListener('touchmove', e => { 
      if (painting) { 
        moveCursor(e); 
        erase(getPos(e).x, getPos(e).y); 
      }
      if (e.cancelable) e.preventDefault(); 
    }, { passive: false });
    
    canvas.addEventListener('touchend', () => { painting = false; });

    // Use ResizeObserver for reliable sizing when element renders
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => resize());
      ro.observe(note);
    } else {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            setTimeout(resize, 50);
            obs.unobserve(note);
          }
        });
      }, { threshold: 0.1 });
      obs.observe(note);
    }

    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
  });
})();

/* ============================================================
   FLOWER GARDEN — ORIGINAL EMOJI FLOWERS (cute, not pixelated)
   ============================================================ */
(function initFlowerGarden() {
  const garden = document.getElementById('flower-garden');
  if (!garden) return;

  const FLOWERS = [
    { emoji: '🌸', label: 'SAKURA'    },
    { emoji: '🌼', label: 'DAISY'     },
    { emoji: '🌺', label: 'HIBISCUS'  },
    { emoji: '🌻', label: 'SUNFLOWER' },
    { emoji: '🌷', label: 'TULIP'     },
    { emoji: '💐', label: 'BOUQUET'   },
  ];

  FLOWERS.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'garden-flower reveal-item';
    div.style.animationDelay = (i * 0.12) + 's';
    div.innerHTML = `
      <span class="f-emoji" style="-webkit-font-smoothing:antialiased;image-rendering:auto">${f.emoji}</span>
      <span class="f-label">${f.label}</span>`;

    div.addEventListener('click', () => {
      div.classList.add('bloomed');
      spawnSparkles(div);
      div.addEventListener('animationend', () => div.classList.remove('bloomed'), { once: true });
    });

    garden.appendChild(div);
  });

  /* Sparkle burst (pixel squares) */
  function spawnSparkles(parent) {
    const COLS = ['#ffffb5','#cbaacb','#fcb9aa','#c6dbda','#f7f4d5'];
    for (let i = 0; i < 8; i++) {
      const s     = document.createElement('div');
      s.className = 'sparkle';
      const angle = (i / 8) * Math.PI * 2;
      const dist  = 32 + Math.random() * 18;
      s.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
      s.style.background = COLS[Math.floor(Math.random() * COLS.length)];
      s.style.left = '50%'; s.style.top = '50%';
      parent.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  }
})();

/* ============================================================
   CD MUSIC PLAYER
   ============================================================ */
(function initCDPlayer() {
  const cards = document.querySelectorAll('.cd-card');
  let current = null;

  cards.forEach((card, idx) => {
    const audioEl  = document.getElementById('audio-' + idx);
    const cdSvg    = document.getElementById('cd-' + idx);
    const notesEl  = document.getElementById('notes-' + idx);
    const btnPlay  = card.querySelector('.btn-play');
    const btnPause = card.querySelector('.btn-pause');
    const btnStop  = card.querySelector('.btn-stop');

    if (!audioEl) return;

    btnPlay.addEventListener('click', () => {
      if (current && current.audio !== audioEl) stopTrack(current);
      current = { audio: audioEl, card, cdSvg, notesEl, noteTimer: null };
      audioEl.play().catch(() => {});
      card.classList.add('playing');
      if (cdSvg) cdSvg.classList.add('spinning');
      startNotes(current);
    });

    btnPause.addEventListener('click', () => {
      audioEl.pause();
      card.classList.remove('playing');
      if (cdSvg) cdSvg.classList.remove('spinning');
      if (current && current.audio === audioEl) stopNotes(current);
    });

    btnStop.addEventListener('click', () => {
      stopTrack({ audio: audioEl, card, cdSvg, notesEl,
        noteTimer: current && current.audio === audioEl ? current.noteTimer : null });
      if (current && current.audio === audioEl) current = null;
    });

    audioEl.addEventListener('ended', () => {
      card.classList.remove('playing');
      if (cdSvg) cdSvg.classList.remove('spinning');
      if (current && current.audio === audioEl) { stopNotes(current); current = null; }
    });
  });

  function stopTrack(t) {
    if (!t) return;
    t.audio.pause();
    t.audio.currentTime = 0;
    t.card.classList.remove('playing');
    if (t.cdSvg) t.cdSvg.classList.remove('spinning');
    stopNotes(t);
  }

  const NOTE_SYMS = ['J','JJ','d','b'];
  const NOTE_COLS = ['#ffffb5','#cbaacb','#c6dbda','#fcb9aa','#97c1a9'];

  function startNotes(t) {
    if (!t.notesEl) return;
    t.notesEl.classList.remove('hidden');
    t.noteTimer = setInterval(() => spawnNote(t.notesEl), 600);
  }

  function stopNotes(t) {
    if (!t || !t.noteTimer) return;
    clearInterval(t.noteTimer);
    t.noteTimer = null;
    if (t.notesEl) t.notesEl.classList.add('hidden');
  }

  function spawnNote(container) {
    const el = document.createElement('div');
    el.classList.add('px-note');
    el.textContent = '\u266A';
    el.innerHTML   = NOTE_SYMS[Math.floor(Math.random() * NOTE_SYMS.length)] === 'JJ'
      ? '\u266A\u266A' : '\u266A';
    el.style.color           = NOTE_COLS[Math.floor(Math.random() * NOTE_COLS.length)];
    el.style.left            = (20 + Math.random() * 60) + '%';
    el.style.top             = (30 + Math.random() * 40) + '%';
    el.style.animationDuration = (1.6 + Math.random() * 1) + 's';
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
})();

/* ============================================================
   REPLAY + CELEBRATE BUTTON
   ============================================================ */
(function initReplayAndCelebrate() {
  // Replay button
  const replayBtn = document.getElementById('replay-btn');
  if (replayBtn) replayBtn.addEventListener('click', () => location.reload());

  // Celebrate button - confetti + falling cute flowers
  const celebrateBtn = document.getElementById('celebrate-btn');
  const celebrateLayer = document.getElementById('celebrate-layer');
  
  if (celebrateBtn && celebrateLayer) {
    celebrateBtn.addEventListener('click', () => {
      // Show layer
      celebrateLayer.classList.remove('hidden');
      
      // Spawn pixel confetti
      const CONF_COLS = ['#ffffb5','#cbaacb','#fcb9aa','#c6dbda','#f7f4d5','#8fcaca','#97c1a9'];
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          const conf = document.createElement('div');
          conf.className = 'px-confetti';
          conf.style.left = Math.random() * 100 + 'vw';
          conf.style.top = '-10px';
          conf.style.background = CONF_COLS[Math.floor(Math.random() * CONF_COLS.length)];
          conf.style.animationDuration = (2 + Math.random() * 2) + 's';
          conf.style.transform = `rotate(${Math.random() * 360}deg)`;
          celebrateLayer.appendChild(conf);
          conf.addEventListener('animationend', () => conf.remove());
        }, i * 40);
      }
      
      // Spawn falling cute flowers (sunflowers 🌻 and daisies 🌼)
      const FLOWER_EMOJIS = ['🌻', '🌼', '🌸', '🌷', '💐'];
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          const flower = document.createElement('div');
          flower.className = 'falling-flower';
          flower.textContent = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];
          flower.style.left = Math.random() * 100 + 'vw';
          flower.style.animationDuration = (3 + Math.random() * 3) + 's';
          flower.style.animationDelay = Math.random() * 0.5 + 's';
          flower.style.fontSize = (0.9 + Math.random() * 0.8) + 'rem';
          celebrateLayer.appendChild(flower);
          flower.addEventListener('animationend', () => flower.remove());
        }, i * 120);
      }
      
      // Hide layer after animation completes
      setTimeout(() => {
        celebrateLayer.classList.add('hidden');
        // Clean up any remaining elements
        celebrateLayer.querySelectorAll('.px-confetti, .falling-flower').forEach(el => el.remove());
      }, 6000);
    });
  }
})();