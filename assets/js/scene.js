/* ============================================================================
   scene.js — MacBook 3D com código sendo digitado (Three.js r128)
   ----------------------------------------------------------------------------
   · Notebook modelado com primitivas: chassi, deck com teclado e trackpad
     (textura de canvas), dobradiça e tela.
   · A tela é uma CanvasTexture redesenhada conforme o código é "digitado",
     com realce de sintaxe e cursor piscando. Os trechos são de projetos reais.
   · Interativo: arrastar gira o notebook, o ponteiro faz parallax, clicar
     troca o trecho de código e a roda do mouse dá zoom sutil.
   · Sem WebGL ou com prefers-reduced-motion, cai para um gradiente estático.
   ========================================================================== */

window.Scene3D = (function () {
  'use strict';

  const canvas = document.getElementById('scene');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function paintFallback() {
    if (!canvas) return;
    canvas.style.background =
      'radial-gradient(58% 48% at 68% 30%, rgba(34,211,238,.13), transparent 62%),' +
      'radial-gradient(46% 42% at 22% 72%, rgba(168,85,247,.10), transparent 62%),' +
      '#05060a';
  }

  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (!canvas || typeof THREE === 'undefined' || !hasWebGL() || reduced) {
    paintFallback();
    return { ready: false, setSectionAccent: function () {}, nextSnippet: function () {} };
  }

  /* ==========================================================================
     TRECHOS DE CÓDIGO — dos projetos reais do portfólio
     ======================================================================== */
  const SNIPPETS = [
    {
      file: 'talentmatch/matching.py',
      lang: 'py',
      code: [
        '# Score ponderado candidato x vaga',
        'PESOS = {',
        '    "skills": 0.50,',
        '    "experiencia": 0.25,',
        '    "localizacao": 0.15,',
        '    "salario": 0.10,',
        '}',
        '',
        'def calcular_match(candidato, vaga):',
        '    skills = similaridade_tfidf(',
        '        candidato.skills, vaga.skills',
        '    )',
        '    score = skills * PESOS["skills"]',
        '    for campo, peso in PESOS.items():',
        '        score += avaliar(campo) * peso',
        '    return round(score * 100, 1)'
      ]
    },
    {
      file: 'chargegrid/rag.py',
      lang: 'py',
      code: [
        '# Pipeline RAG — P50 de ~800ms',
        'async def responder(pergunta: str):',
        '    vetor = embed(pergunta)',
        '    contextos = faiss_index.search(',
        '        vetor, k=8',
        '    )',
        '',
        '    resposta = await groq.chat(',
        '        model="llama-3.3-70b-versatile",',
        '        context=contextos,',
        '        temperature=0.1,',
        '    )',
        '    return {',
        '        "texto": resposta,',
        '        "fontes": [c.origem for c in contextos],',
        '    }'
      ]
    },
    {
      file: 'questly/scoring.py',
      lang: 'py',
      code: [
        '# Desafio igual para os dois jogadores',
        'def desafio_do_dia(data, categoria):',
        '    semente = int(data.strftime("%Y%m%d"))',
        '    pool = DESAFIOS[categoria]',
        '    return pool[semente % len(pool)]',
        '',
        'def pontuar(dia):',
        '    pontos = 10 * dia.habitos_feitos',
        '    if dia.desafio_ok:',
        '        pontos += 30',
        '    if dia.surpresa_ok:',
        '        pontos += 20',
        '    if dia.tudo_completo():',
        '        pontos += 20  # bonus',
        '    return pontos  # sem valor negativo'
      ]
    },
    {
      file: 'canhotos/leitura.py',
      lang: 'py',
      code: [
        '# OCR -> barcode -> IA, nessa ordem',
        'def extrair_nf(pagina):',
        '    numero = ocr_tesseract(pagina)',
        '    if confianca(numero) > 0.85:',
        '        return numero',
        '',
        '    numero = ler_codigo_barras(pagina)',
        '    if numero:',
        '        return numero',
        '',
        '    # ultimo recurso: modelo de linguagem',
        '    return groq_extrair(pagina) or None',
        '',
        '# 24h de conferencia manual -> ~1h'
      ]
    },
    {
      file: 'multitelas/player.js',
      lang: 'js',
      code: [
        '// Um item quebrado nao derruba a TV',
        'async function exibir(zona, itens) {',
        '  for (const item of ciclo(itens)) {',
        '    try {',
        '      await render(zona, item);',
        '    } catch (erro) {',
        '      console.warn("pulando", item.id);',
        '      continue;',
        '    }',
        '  }',
        '}',
        '',
        'fonte.addEventListener("message", (ev) => {',
        '  aplicarConfig(JSON.parse(ev.data));',
        '});'
      ]
    }
  ];

  /* ==========================================================================
     TELA — canvas com realce de sintaxe e digitação
     ======================================================================== */
  const SCREEN_W = 1024, SCREEN_H = 640;
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = SCREEN_W;
  screenCanvas.height = SCREEN_H;
  const sctx = screenCanvas.getContext('2d');

  const COLORS = {
    bg:      '#0b0e14',
    bar:     '#11151d',
    gutter:  '#39414f',
    text:    '#c8d3e0',
    keyword: '#c084fc',
    string:  '#34d399',
    number:  '#f59e0b',
    comment: '#4d5768',
    func:    '#22d3ee',
    cursor:  '#22d3ee'
  };

  const KEYWORDS = {
    py: ['def', 'return', 'if', 'for', 'in', 'import', 'from', 'async', 'await',
         'class', 'and', 'or', 'not', 'None', 'True', 'False', 'else', 'elif', 'try', 'except'],
    js: ['async', 'function', 'const', 'let', 'for', 'of', 'try', 'catch', 'await',
         'return', 'if', 'else', 'continue', 'new', 'null', 'true', 'false']
  };

  /** Quebra a linha em tokens coloridos — realce simples, suficiente para a tela. */
  function tokenize(line, lang) {
    const out = [];
    const commentAt = lang === 'js' ? line.indexOf('//') : line.indexOf('#');
    let body = line, tail = '';
    if (commentAt >= 0) { body = line.slice(0, commentAt); tail = line.slice(commentAt); }

    const re = /("[^"]*"|'[^']*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$0-9"'`]+)/g;
    let m;
    while ((m = re.exec(body)) !== null) {
      const t = m[0];
      if (m[1]) out.push({ t: t, c: COLORS.string });
      else if (m[2]) out.push({ t: t, c: COLORS.number });
      else if (m[3]) {
        const isKw = (KEYWORDS[lang] || []).indexOf(t) >= 0;
        const isCall = body[re.lastIndex] === '(';
        out.push({ t: t, c: isKw ? COLORS.keyword : (isCall ? COLORS.func : COLORS.text) });
      }
      else out.push({ t: t, c: COLORS.text });
    }
    if (tail) out.push({ t: tail, c: COLORS.comment });
    return out;
  }

  const FONT = '22px "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace';
  const LINE_H = 31;
  const PAD_X = 80;
  const PAD_TOP = 60;

  const typer = {
    index: 0,      // trecho atual
    line: 0,       // linha em digitação
    col: 0,        // coluna em digitação
    acc: 0,        // acumulador de tempo
    hold: 0,       // pausa ao terminar o trecho
    caretOn: true,
    caretAcc: 0
  };

  function drawScreen() {
    const snip = SNIPPETS[typer.index];

    sctx.fillStyle = COLORS.bg;
    sctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // barra do editor
    sctx.fillStyle = COLORS.bar;
    sctx.fillRect(0, 0, SCREEN_W, 40);
    const dots = ['#ff5f57', '#febc2e', '#28c840'];
    for (let i = 0; i < 3; i++) {
      sctx.beginPath();
      sctx.arc(24 + i * 22, 20, 6, 0, Math.PI * 2);
      sctx.fillStyle = dots[i];
      sctx.fill();
    }
    sctx.font = '15px "JetBrains Mono", monospace';
    sctx.fillStyle = '#6b7688';
    sctx.textAlign = 'center';
    sctx.fillText(snip.file, SCREEN_W / 2, 25);
    sctx.textAlign = 'left';

    sctx.font = FONT;
    sctx.textBaseline = 'top';

    for (let i = 0; i <= typer.line && i < snip.code.length; i++) {
      const y = PAD_TOP + i * LINE_H;
      if (y > SCREEN_H - LINE_H) break;

      // numeração
      sctx.fillStyle = COLORS.gutter;
      sctx.fillText(String(i + 1).padStart(2, ' '), 24, y);

      const full = snip.code[i];
      const visible = i < typer.line ? full : full.slice(0, typer.col);

      let x = PAD_X;
      tokenize(visible, snip.lang).forEach(function (tok) {
        sctx.fillStyle = tok.c;
        sctx.fillText(tok.t, x, y);
        x += sctx.measureText(tok.t).width;
      });

      // cursor na linha corrente
      if (i === typer.line && typer.caretOn) {
        sctx.fillStyle = COLORS.cursor;
        sctx.fillRect(x + 1, y + 2, 10, 24);
      }
    }

    screenTexture.needsUpdate = true;
  }

  function advanceTyping(dt) {
    const snip = SNIPPETS[typer.index];

    // cursor pisca ~2x por segundo
    typer.caretAcc += dt;
    let dirty = false;
    if (typer.caretAcc > 0.5) {
      typer.caretAcc = 0;
      typer.caretOn = !typer.caretOn;
      dirty = true;
    }

    if (typer.hold > 0) {
      typer.hold -= dt;
      if (typer.hold <= 0) nextSnippet();
      if (dirty) drawScreen();
      return;
    }

    typer.acc += dt;
    const step = 0.032;
    while (typer.acc >= step) {
      typer.acc -= step;
      const linha = snip.code[typer.line];

      if (typer.col < linha.length) {
        typer.col++;
        dirty = true;
      } else if (typer.line < snip.code.length - 1) {
        typer.line++;
        typer.col = 0;
        typer.acc -= 0.09; // respiro entre linhas
        dirty = true;
      } else {
        typer.hold = 2.6;  // trecho pronto: segura antes de trocar
        break;
      }
    }

    if (dirty) drawScreen();
  }

  function nextSnippet() {
    typer.index = (typer.index + 1) % SNIPPETS.length;
    typer.line = 0; typer.col = 0; typer.acc = 0; typer.hold = 0;
    drawScreen();
  }

  /* ==========================================================================
     TEXTURA DO DECK — teclado e trackpad
     ======================================================================== */
  function buildDeckTexture() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 700;
    const g = c.getContext('2d');

    g.fillStyle = '#2f333a';
    g.fillRect(0, 0, 1024, 700);

    function key(x, y, w, h) {
      const r = 6;
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
      g.fillStyle = '#15181e';
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,.06)';
      g.lineWidth = 1.5;
      g.stroke();
    }

    // teclado: 6 fileiras
    const left = 92, top = 60, kw = 56, kh = 50, gap = 9;
    const rows = [
      { n: 14, w: kw },
      { n: 14, w: kw },
      { n: 13, w: kw },
      { n: 13, w: kw },
      { n: 12, w: kw },
      { n: 8,  w: kw }
    ];
    rows.forEach(function (row, ri) {
      const total = row.n * row.w + (row.n - 1) * gap;
      let x = left + (840 - total) / 2;
      const y = top + ri * (kh + gap);
      for (let i = 0; i < row.n; i++) {
        // última fileira: barra de espaço no centro
        const isSpace = ri === 5 && i === 4;
        const w = isSpace ? row.w * 3.4 : row.w;
        key(x, y, w, kh);
        x += w + gap;
      }
    });

    // trackpad
    const tw = 300, th = 200, tx = (1024 - tw) / 2, ty = 452;
    g.beginPath();
    const r = 12;
    g.moveTo(tx + r, ty);
    g.arcTo(tx + tw, ty, tx + tw, ty + th, r);
    g.arcTo(tx + tw, ty + th, tx, ty + th, r);
    g.arcTo(tx, ty + th, tx, ty, r);
    g.arcTo(tx, ty, tx + tw, ty, r);
    g.closePath();
    g.fillStyle = '#33373f';
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)';
    g.lineWidth = 2;
    g.stroke();

    return new THREE.CanvasTexture(c);
  }

  /* ==========================================================================
     CENA
     ======================================================================== */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    38, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.set(0, 1.35, 6.4);
  camera.lookAt(0, 0.75, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
  } catch (e) {
    paintFallback();
    return { ready: false, setSectionAccent: function () {}, nextSnippet: function () {} };
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  if (THREE.sRGBEncoding !== undefined) screenTexture.encoding = THREE.sRGBEncoding;
  screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const deckTexture = buildDeckTexture();
  if (THREE.sRGBEncoding !== undefined) deckTexture.encoding = THREE.sRGBEncoding;
  deckTexture.anisotropy = screenTexture.anisotropy;

  /* --- luzes --------------------------------------------------------------- */
  scene.add(new THREE.AmbientLight(0x5f6a80, 0.75));

  const key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(2.5, 4, 3.5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xa855f7, 0.5);
  rim.position.set(-3.5, 1.5, -2.5);
  scene.add(rim);

  // brilho da tela batendo no teclado
  const glow = new THREE.PointLight(0x22d3ee, 1.15, 7, 2);
  glow.position.set(0, 1.2, 0.55);
  scene.add(glow);

  /* --- notebook ------------------------------------------------------------ */
  const laptop = new THREE.Group();
  scene.add(laptop);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x3a3f47, metalness: 0.82, roughness: 0.42, transparent: true
  });
  const deckMat = new THREE.MeshStandardMaterial({
    map: deckTexture, metalness: 0.45, roughness: 0.62, transparent: true
  });
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x121418, metalness: 0.5, roughness: 0.55, transparent: true
  });

  const W = 3.5, D = 2.42, H = 0.13;

  // base — a face de cima (índice 2) leva a textura do teclado
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(W, H, D),
    [bodyMat, bodyMat, deckMat, bodyMat, bodyMat, bodyMat]
  );
  base.position.y = H / 2;
  laptop.add(base);

  // "pé" fino, dá espessura de alumínio ao chassi
  const foot = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.985, 0.05, D * 0.985), bodyMat
  );
  foot.position.y = -0.02;
  laptop.add(foot);

  // dobradiça
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, W * 0.86, 18), bezelMat
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, H, -D / 2 + 0.05);
  laptop.add(hinge);

  // tampa (gira na dobradiça)
  const lid = new THREE.Group();
  lid.position.set(0, H, -D / 2 + 0.05);
  laptop.add(lid);

  const LID_H = 2.32;
  const lidShell = new THREE.Mesh(
    new THREE.BoxGeometry(W, LID_H, 0.075), bodyMat
  );
  lidShell.position.set(0, LID_H / 2, -0.04);
  lid.add(lidShell);

  const lidFace = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.985, LID_H * 0.985, 0.02), bezelMat
  );
  lidFace.position.set(0, LID_H / 2, 0.002);
  lid.add(lidFace);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.9, LID_H * 0.88),
    new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true })
  );
  screen.position.set(0, LID_H / 2, 0.016);
  lid.add(screen);

  // câmera no topo do bezel
  const cam = new THREE.Mesh(
    new THREE.CircleGeometry(0.022, 16),
    new THREE.MeshBasicMaterial({ color: 0x2b313c, transparent: true })
  );
  cam.position.set(0, LID_H - 0.07, 0.016);
  lid.add(cam);

  const LID_OPEN = -0.20;          // ~11° para trás, como uma tela aberta
  lid.rotation.x = LID_OPEN;

  // materiais que participam do fade ao sair do hero
  const fadeMats = [bodyMat, deckMat, bezelMat, screen.material, cam.material];

  /* --- poeira estelar sutil (profundidade, sem roubar a cena) --------------- */
  const dustGeo = new THREE.BufferGeometry();
  const DUST = window.innerWidth < 768 ? 700 : 1400;
  const dpos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dpos[i * 3]     = (Math.random() - 0.5) * 26;
    dpos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    dpos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 5;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.018, color: 0x8fa3c0, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(dust);

  /* ==========================================================================
     POSICIONAMENTO RESPONSIVO
     ======================================================================== */
  let baseY = -0.3;
  let mobileDim = 1;   // no celular o notebook recua para o texto respirar
  function layout() {
    const w = window.innerWidth;
    if (w < 760) {
      laptop.position.set(0, -1.75, -1.6);
      laptop.scale.setScalar(0.55);
      baseY = -1.75;
      mobileDim = 0.5;
    } else if (w < 1100) {
      laptop.position.set(0.75, -0.55, -0.4);
      laptop.scale.setScalar(0.62);
      baseY = -0.55;
      mobileDim = 0.85;
    } else {
      laptop.position.set(1.55, -0.45, 0);
      laptop.scale.setScalar(0.72);
      baseY = -0.45;
      mobileDim = 1;
    }
  }
  layout();

  /* ==========================================================================
     INTERAÇÃO — arrastar gira, ponteiro faz parallax, clique troca o código
     ======================================================================== */
  const BASE_ROT_Y = -0.42, BASE_ROT_X = 0.06;
  let rotY = BASE_ROT_Y, rotX = BASE_ROT_X;
  let targetY = BASE_ROT_Y, targetX = BASE_ROT_X;
  let velY = 0, velX = 0;

  let dragging = false, dragged = false;
  let lastX = 0, lastY = 0, idle = 0;
  let pointerX = 0, pointerY = 0;
  let zoom = 0, zoomTarget = 0;
  let scrollNorm = 0, scrollTarget = 0;

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function interactive(target) {
    return target && target.closest &&
      target.closest('a, button, input, textarea, .dossier, .card, .mobilemenu');
  }

  const CAN_DRAG = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  window.addEventListener('pointerdown', function (e) {
    if (!CAN_DRAG || interactive(e.target)) return;
    dragging = true; dragged = false;
    lastX = e.clientX; lastY = e.clientY;
    document.body.classList.add('is-dragging-3d');
  });

  window.addEventListener('pointermove', function (e) {
    pointerX = (e.clientX / window.innerWidth) - 0.5;
    pointerY = (e.clientY / window.innerHeight) - 0.5;

    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
    lastX = e.clientX; lastY = e.clientY;

    velY = dx * 0.005;
    velX = dy * 0.004;
    targetY += velY;
    targetX = Math.max(-0.5, Math.min(0.6, targetX + velX));
    idle = 0;
  }, { passive: true });

  window.addEventListener('pointerup', function (e) {
    if (CAN_DRAG && dragging && !dragged && !interactive(e.target)) {
      // clique limpo: se acertou o notebook, pula para o próximo trecho
      ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.intersectObject(laptop, true).length > 0) nextSnippet();
    }
    dragging = false;
    document.body.classList.remove('is-dragging-3d');
  });

  window.addEventListener('wheel', function (e) {
    // zoom sutil, apenas enquanto o notebook está em cena
    if (scrollTarget > 0.25) return;
    zoomTarget = Math.max(-0.6, Math.min(0.9, zoomTarget - e.deltaY * 0.0006));
  }, { passive: true });

  window.addEventListener('scroll', function () {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    layout();
  });

  let paused = false;
  document.addEventListener('visibilitychange', function () { paused = document.hidden; });

  /* ==========================================================================
     LOOP
     ======================================================================== */
  const clock = new THREE.Clock();
  drawScreen();

  function tick() {
    requestAnimationFrame(tick);
    if (paused) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    advanceTyping(dt);

    if (!dragging) {
      // inércia após soltar, depois volta devagar à pose base
      targetY += velY;
      targetX += velX;
      velY *= 0.94;
      velX *= 0.94;

      idle += dt;
      if (idle > 1.2) {
        const pull = Math.min((idle - 1.2) * 0.02, 0.035);
        targetY += (BASE_ROT_Y + pointerX * 0.35 - targetY) * pull;
        targetX += (BASE_ROT_X + pointerY * 0.18 - targetX) * pull;
      }
    }

    rotY += (targetY - rotY) * 0.09;
    rotX += (targetX - rotX) * 0.09;

    laptop.rotation.y = rotY;
    laptop.rotation.x = rotX;
    laptop.position.y += (baseY + Math.sin(t * 0.7) * 0.035 - laptop.position.y) * 0.06;

    // a tampa fecha um pouco conforme a página desce
    scrollNorm += (scrollTarget - scrollNorm) * 0.06;
    lid.rotation.x = LID_OPEN - scrollNorm * 0.55;

    // o notebook é peça do hero: sai de cena assim que a página avança,
    // para não competir com os cards de projeto
    const fade = (1 - Math.min(Math.max((scrollNorm - 0.04) / 0.10, 0), 1)) * mobileDim;
    laptop.visible = fade > 0.01;
    for (let i = 0; i < fadeMats.length; i++) fadeMats[i].opacity = fade;

    zoom += (zoomTarget - zoom) * 0.07;
    camera.position.z = 6.4 - zoom + scrollNorm * 2.2;
    camera.position.y = 1.35 + scrollNorm * 0.6;
    camera.lookAt(0, 0.75, 0);

    glow.intensity = 1.15 * fade;
    dust.rotation.y = t * 0.012;

    renderer.render(scene, camera);
  }
  tick();

  /* ==========================================================================
     API PÚBLICA
     ======================================================================== */
  return {
    ready: true,
    /** Tinge o brilho da tela com a cor do projeto em foco (null volta ao padrão). */
    setSectionAccent: function (hex) {
      glow.color.set(hex || 0x22d3ee);
    },
    nextSnippet: nextSnippet
  };
})();
