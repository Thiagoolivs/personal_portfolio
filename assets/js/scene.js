/* ============================================================================
   scene.js — fundo 3D (Three.js r128)
   ----------------------------------------------------------------------------
   Composição:
     · Nebulosa de ~7.000 partículas em casca esférica, com shader próprio
       (swirl por ruído barato, atenuação de tamanho, gradiente ciano→violeta)
     · Núcleo icosaédrico em wireframe com deslocamento de vértices
     · Anel orbital fino que reage ao scroll
   Comportamento:
     · Parallax suave do mouse (lerp), avanço da câmera conforme o scroll
     · Pausa quando a aba não está visível (economia de bateria)
     · Se não houver WebGL ou o usuário pedir menos movimento, desenha um
       gradiente estático e sai sem erro
   ========================================================================== */

window.Scene3D = (function () {
  'use strict';

  const canvas = document.getElementById('scene');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- fallback estático ------------------------------------------------- */
  function paintFallback() {
    if (!canvas) return;
    canvas.style.background =
      'radial-gradient(60% 50% at 70% 25%, rgba(168,85,247,.16), transparent 60%),' +
      'radial-gradient(50% 45% at 20% 70%, rgba(34,211,238,.13), transparent 60%),' +
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
    return { ready: false, setSectionAccent: function () {} };
  }

  /* ---- setup ------------------------------------------------------------- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.055);

  const camera = new THREE.PerspectiveCamera(
    62, window.innerWidth / window.innerHeight, 0.1, 120
  );
  camera.position.set(0, 0, 12);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
  } catch (e) {
    paintFallback();
    return { ready: false, setSectionAccent: function () {} };
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const group = new THREE.Group();
  scene.add(group);

  /* ---- 1. nebulosa de partículas ----------------------------------------- */
  const COUNT = window.innerWidth < 768 ? 3200 : 7000;
  const positions = new Float32Array(COUNT * 3);
  const seeds     = new Float32Array(COUNT);
  const scales    = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // distribuição em casca esférica (raio 4→14), levemente achatada em Y
    const r = 4 + Math.pow(Math.random(), 0.65) * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.62;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    seeds[i]  = Math.random();
    scales[i] = 0.5 + Math.random() * 1.6;
  }

  const nebulaGeo = new THREE.BufferGeometry();
  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  nebulaGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  nebulaGeo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  const nebulaMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime:      { value: 0 },
      uScroll:    { value: 0 },
      uPixel:     { value: Math.min(window.devicePixelRatio, 2) },
      uColorA:    { value: new THREE.Color(0x22d3ee) },
      uColorB:    { value: new THREE.Color(0xa855f7) },
      uAccent:    { value: new THREE.Color(0x22d3ee) },
      uAccentMix: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uScroll;
      uniform float uPixel;
      attribute float aSeed;
      attribute float aScale;
      varying float vSeed;
      varying float vDepth;

      void main() {
        vSeed = aSeed;
        vec3 p = position;

        // swirl: rotação em Y proporcional à distância do centro
        float d = length(p.xz);
        float a = uTime * 0.045 + d * 0.035 + aSeed * 0.4;
        float s = sin(a), c = cos(a);
        p.xz = mat2(c, -s, s, c) * p.xz;

        // respiração vertical
        p.y += sin(uTime * 0.5 + aSeed * 12.0) * 0.35;

        // o scroll comprime o campo levemente
        p *= 1.0 - uScroll * 0.12;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        gl_PointSize = aScale * uPixel * (26.0 / max(vDepth, 0.1));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uAccent;
      uniform float uAccentMix;
      varying float vSeed;
      varying float vDepth;

      void main() {
        // ponto circular com bordas suaves
        vec2 uv = gl_PointCoord - 0.5;
        float dist = length(uv);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.05, dist);

        vec3 col = mix(uColorA, uColorB, vSeed);
        col = mix(col, uAccent, uAccentMix * 0.55);

        // partículas distantes desaparecem
        alpha *= smoothstep(26.0, 5.0, vDepth) * (0.35 + vSeed * 0.5);

        gl_FragColor = vec4(col, alpha);
      }
    `
  });

  const nebula = new THREE.Points(nebulaGeo, nebulaMat);
  group.add(nebula);

  /* ---- 2. núcleo icosaédrico --------------------------------------------- */
  const coreGeo = new THREE.IcosahedronGeometry(2.6, 3);

  const coreMat = new THREE.ShaderMaterial({
    wireframe: true,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime:      { value: 0 },
      uScroll:    { value: 0 },
      uColorA:    { value: new THREE.Color(0x22d3ee) },
      uColorB:    { value: new THREE.Color(0xa855f7) },
      uAccent:    { value: new THREE.Color(0x22d3ee) },
      uAccentMix: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uScroll;
      varying float vNoise;

      // ruído barato por soma de senos — suficiente para deformar a casca
      float wob(vec3 p, float t) {
        return sin(p.x * 1.7 + t) * 0.5
             + sin(p.y * 2.1 - t * 0.8) * 0.35
             + sin(p.z * 1.4 + t * 1.3) * 0.4;
      }

      void main() {
        float n = wob(normalize(position) * 2.2, uTime * 0.55);
        vNoise = n;
        // durante o scroll o núcleo se dilata e se agita mais
        vec3 p = position * (1.0 + n * (0.055 + uScroll * 0.16) + uScroll * 0.18);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uAccent;
      uniform float uAccentMix;
      uniform float uScroll;
      varying float vNoise;

      void main() {
        vec3 col = mix(uColorA, uColorB, clamp(vNoise * 0.5 + 0.5, 0.0, 1.0));
        col = mix(col, uAccent, uAccentMix * 0.7);
        float alpha = (0.16 + abs(vNoise) * 0.1) * (1.0 - uScroll * 0.45);
        gl_FragColor = vec4(col, max(alpha, 0.0));
      }
    `
  });

  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(3.4, 0.4, -1.2);
  group.add(core);

  /* ---- 3. anel orbital ---------------------------------------------------- */
  const ringGeo = new THREE.TorusGeometry(4.6, 0.006, 3, 220);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee, transparent: true, opacity: 0.28
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(core.position);
  ring.rotation.x = Math.PI * 0.42;
  group.add(ring);

  const ring2 = ring.clone();
  ring2.material = new THREE.MeshBasicMaterial({
    color: 0xa855f7, transparent: true, opacity: 0.2
  });
  ring2.scale.setScalar(0.74);
  ring2.rotation.set(Math.PI * 0.18, Math.PI * 0.3, 0);
  group.add(ring2);

  /* ---- interação ---------------------------------------------------------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollNorm = 0, scrollTarget = 0;
  let accentMixTarget = 0;

  window.addEventListener('pointermove', function (e) {
    pointer.tx = (e.clientX / window.innerWidth) - 0.5;
    pointer.ty = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const px = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(px);
    nebulaMat.uniforms.uPixel.value = px;
  });

  let paused = false;
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });

  /* ---- loop --------------------------------------------------------------- */
  const clock = new THREE.Clock();

  function tick() {
    requestAnimationFrame(tick);
    if (paused) return;

    const t = clock.getElapsedTime();

    // lerp de ponteiro e scroll → nada se move em degrau
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    scrollNorm += (scrollTarget - scrollNorm) * 0.06;

    nebulaMat.uniforms.uTime.value = t;
    nebulaMat.uniforms.uScroll.value = scrollNorm;
    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uScroll.value = scrollNorm;

    const mix = nebulaMat.uniforms.uAccentMix.value;
    const next = mix + (accentMixTarget - mix) * 0.05;
    nebulaMat.uniforms.uAccentMix.value = next;
    coreMat.uniforms.uAccentMix.value = next;

    // parallax do conjunto
    group.rotation.y += ((pointer.x * 0.55) - group.rotation.y) * 0.035;
    group.rotation.x += ((pointer.y * 0.32) - group.rotation.x) * 0.035;

    core.rotation.y = t * 0.14;
    core.rotation.x = t * 0.09;

    ring.rotation.z = t * 0.16;
    ring2.rotation.z = -t * 0.22;

    // a câmera recua conforme a página avança
    camera.position.z = 12 + scrollNorm * 5.5;
    camera.position.y = -scrollNorm * 1.8;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  tick();

  /* ---- API pública -------------------------------------------------------- */
  return {
    ready: true,
    /** Tinge a cena com a cor do projeto em foco. Passe null para voltar ao padrão. */
    setSectionAccent: function (hex) {
      if (!hex) { accentMixTarget = 0; return; }
      const c = new THREE.Color(hex);
      nebulaMat.uniforms.uAccent.value.copy(c);
      coreMat.uniforms.uAccent.value.copy(c);
      accentMixTarget = 1;
    }
  };
})();
