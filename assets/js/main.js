/* ============================================================================
   main.js — interações, renderização dos projetos e dossiê
   ========================================================================== */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_GSAP = typeof gsap !== 'undefined';
  const FINE_POINTER = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* Escapa texto vindo dos dados antes de injetar como HTML. */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Sem GSAP (falha de rede) ou com menos movimento pedido, os elementos .reveal
  // precisam nascer visíveis — nunca deixar conteúdo preso em opacity:0.
  if (REDUCED || !HAS_GSAP) document.body.classList.add('no-anim');
  if (FINE_POINTER) document.body.classList.add('has-cursor');
  if (HAS_GSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ==========================================================================
     PRELOADER
     ======================================================================== */
  (function preloader() {
    const el = $('#preloader');
    const fill = $('#preloader-fill');
    const count = $('#preloader-count');
    if (!el) return;

    let pct = 0;
    const timer = setInterval(function () {
      pct = Math.min(pct + Math.random() * 18, 100);
      fill.style.width = pct + '%';
      count.textContent = Math.round(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          el.classList.add('is-done');
          document.body.classList.remove('is-locked');
          introAnimation();
        }, 260);
      }
    }, 120);

    document.body.classList.add('is-locked');
  })();

  /* ==========================================================================
     CURSOR CUSTOMIZADO
     ======================================================================== */
  (function cursor() {
    if (!FINE_POINTER) return;
    const root = $('#cursor');
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    const label = $('#cursor-label');
    if (!root) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    // delegação: funciona também para os cards criados depois
    document.addEventListener('pointerover', function (e) {
      const t = e.target.closest('a, button, [data-cursor], .card');
      if (!t) return;
      root.classList.add('is-hover');
      label.textContent = t.getAttribute('data-cursor') || '';
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('a, button, [data-cursor], .card')) {
        root.classList.remove('is-hover');
        label.textContent = '';
      }
    });
  })();

  /* ==========================================================================
     BOTÕES MAGNÉTICOS
     ======================================================================== */
  (function magnetic() {
    if (!HAS_GSAP || !FINE_POINTER || REDUCED) return;
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.28,
          y: (e.clientY - r.top - r.height / 2) * 0.35,
          duration: 0.4, ease: 'power3.out'
        });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.35)' });
      });
    });
  })();

  /* ==========================================================================
     NAV — estado, progresso, menu mobile, seção ativa
     ======================================================================== */
  (function nav() {
    const bar = $('#nav');
    const fill = $('#nav-progress-fill');
    const burger = $('#burger');
    const menu = $('#mobilemenu');
    const links = $$('[data-nav]');

    function onScroll() {
      bar.classList.toggle('is-stuck', window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.classList.toggle('is-locked', open);
    });

    links.forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-locked');
      });
    });

    // seção ativa
    const sections = ['projetos', 'stack', 'sobre', 'contato']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          $$('.nav__links a').forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }
  })();

  /* ==========================================================================
     MARQUEE
     ======================================================================== */
  (function marquee() {
    const track = $('#marquee-track');
    if (!track || typeof MARQUEE_WORDS === 'undefined') return;
    const words = MARQUEE_WORDS.concat(MARQUEE_WORDS); // duplicado p/ loop contínuo
    track.innerHTML = words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('');
  })();

  /* ==========================================================================
     SLOT DE MÍDIA — GIF do projeto (ou placeholder)
     ======================================================================== */
  function mediaMarkup(p, big) {
    if (p.media) {
      if (p.mediaType === 'video') {
        return '<video src="' + esc(p.media) + '" autoplay muted loop playsinline></video>';
      }
      return '<img src="' + esc(p.media) + '" alt="Demonstração de ' + esc(p.name) + ' em execução" loading="lazy">';
    }
    return '' +
      '<div class="media-slot">' +
        '<svg viewBox="0 0 24 24" width="' + (big ? 30 : 22) + '" height="' + (big ? 30 : 22) + '" fill="none" stroke="currentColor" stroke-width="1.3">' +
          '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/>' +
        '</svg>' +
        '<span>Espaço reservado para o GIF</span>' +
        '<code>assets/media/' + esc(p.slug) + '.gif</code>' +
      '</div>';
  }

  /* ==========================================================================
     CARDS
     ======================================================================== */
  (function renderCards() {
    const track = $('#projects-grid');
    if (!track || typeof PROJECTS === 'undefined') return;

    track.innerHTML = PROJECTS.map(function (p, i) {
      const chips = p.stack[0].i.slice(0, 3);
      const extra = p.stack.reduce(function (n, g) { return n + g.i.length; }, 0) - chips.length;

      return '' +
      '<article class="card" role="button" tabindex="0" data-index="' + i + '"' +
        ' data-cursor="Abrir dossiê" style="--card-accent:' + esc(p.accent) + '"' +
        ' aria-label="Abrir dossiê do projeto ' + esc(p.name) + '">' +
        '<div class="card__top">' +
          '<span class="card__index">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="card__status">' + esc(p.status) + '</span>' +
        '</div>' +
        '<div class="card__media">' + mediaMarkup(p, false) + '</div>' +
        '<div class="card__body">' +
          '<h3 class="card__name">' + esc(p.name) + '</h3>' +
          '<p class="card__tagline">' + esc(p.tagline) + '</p>' +
          '<div class="card__chips">' +
            chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') +
            (extra > 0 ? '<span class="chip chip--more">+' + extra + '</span>' : '') +
          '</div>' +
          '<div class="card__foot"><span>Ver dossiê</span>' +
            '<span class="arrow"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    $$('.card', track).forEach(function (card) {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      card.addEventListener('click', function () { Dossier.open(idx); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Dossier.open(idx); }
      });

      // tilt 3D no hover
      if (FINE_POINTER && HAS_GSAP && !REDUCED) {
        card.addEventListener('pointermove', function (e) {
          const r = card.getBoundingClientRect();
          gsap.to(card, {
            rotateY: ((e.clientX - r.left) / r.width - 0.5) * 9,
            rotateX: -((e.clientY - r.top) / r.height - 0.5) * 9,
            duration: 0.5, ease: 'power2.out', transformPerspective: 900
          });
        });
        card.addEventListener('pointerleave', function () {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
        });
      }

      // a cena 3D assume a cor do projeto em foco
      card.addEventListener('pointerenter', function () {
        const p = PROJECTS[idx];
        if (window.Scene3D && p) Scene3D.setSectionAccent(p.accent);
        document.documentElement.style.setProperty('--accent', p.accent);
      });
      card.addEventListener('pointerleave', function () {
        if (window.Scene3D) Scene3D.setSectionAccent(null);
        document.documentElement.style.setProperty('--accent', 'var(--cyan)');
      });
    });
  })();

  /* ==========================================================================
     STACK
     ======================================================================== */
  (function renderStack() {
    const grid = $('#stack-grid');
    if (!grid || typeof STACK_GROUPS === 'undefined') return;
    grid.innerHTML = STACK_GROUPS.map(function (g) {
      return '' +
      '<div class="stack__cell reveal">' +
        '<h3>' + esc(g.title) + '</h3>' +
        '<ul>' + g.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }).join('');
  })();

  /* ==========================================================================
     DOSSIÊ
     ======================================================================== */
  const Dossier = (function () {
    const root = $('#dossier');
    const scroll = $('#dossier-scroll');
    const panel = $('#dossier-panel');
    let current = -1;
    let lastFocus = null;

    function build(p, i) {
      const links = p.links.map(function (l) {
        const icon = l.type === 'live'
          ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
          : '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53v-1.9c-3.06.66-3.71-1.3-3.71-1.3-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.1.08 1.69 1.14 1.69 1.14.98 1.69 2.58 1.2 3.21.92.1-.71.39-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.45 0-1.2.43-2.19 1.14-2.96-.12-.28-.5-1.4.1-2.92 0 0 .93-.3 3.05 1.13a10.5 10.5 0 0 1 5.55 0c2.12-1.43 3.05-1.13 3.05-1.13.6 1.52.22 2.64.11 2.92.71.77 1.13 1.76 1.13 2.96 0 4.24-2.58 5.17-5.03 5.44.4.34.75 1.01.75 2.04v3.03c0 .3.2.64.76.53A11.02 11.02 0 0 0 23 11.5C23 5.24 18.27.5 12 .5Z"/></svg>';
        return '<a class="d-link d-link--' + esc(l.type) + '" href="' + esc(l.url) + '" target="_blank" rel="noopener" data-cursor="Abrir">' +
          icon + esc(l.label) + '</a>';
      }).join('');

      return '' +
      '<header class="d-head">' +
        '<div class="d-meta">' +
          '<span>' + String(i + 1).padStart(2, '0') + ' / ' + String(PROJECTS.length).padStart(2, '0') + '</span>' +
          '<span class="card__status" style="--card-accent:' + esc(p.accent) + '">' + esc(p.status) + '</span>' +
          '<span>' + esc(p.year) + '</span>' +
        '</div>' +
        '<h2 class="d-title" id="dossier-title">' + esc(p.name) + '</h2>' +
        '<p class="d-tagline">' + esc(p.tagline) + '</p>' +
      '</header>' +

      /* Duas colunas: mídia à esquerda (fixa enquanto o texto rola),
         dossiê à direita. Vira coluna única em telas estreitas. */
      '<div class="d-grid">' +

      '<aside class="d-grid__media">' +
        '<div class="d-media">' + mediaMarkup(p, true) + '</div>' +
        /* Os links acompanham a mídia: repositório e demo ficam sempre à vista
           enquanto o dossiê é lido na coluna da direita. */
        '<div class="d-links">' + links + '</div>' +
      '</aside>' +

      '<div class="d-grid__content">' +

      '<section class="d-section">' +
        '<div class="d-section__label">Propósito</div>' +
        '<p>' + esc(p.purpose) + '</p>' +
      '</section>' +

      '<section class="d-section">' +
        '<div class="d-section__label">Como funciona</div>' +
        '<ol class="d-steps">' + p.how.map(function (s) {
          return '<li><h4>' + esc(s.t) + '</h4><p>' + esc(s.d) + '</p></li>';
        }).join('') + '</ol>' +
      '</section>' +

      '<section class="d-section">' +
        '<div class="d-section__label">Destaques</div>' +
        '<ul class="d-highlights">' + p.highlights.map(function (h) {
          return '<li>' + esc(h) + '</li>';
        }).join('') + '</ul>' +
      '</section>' +

      '<section class="d-section">' +
        '<div class="d-section__label">Stack</div>' +
        '<div class="d-stack">' + p.stack.map(function (g) {
          return '<div class="d-stack__group"><h5>' + esc(g.g) + '</h5><div class="d-stack__items">' +
            g.i.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') +
            '</div></div>';
        }).join('') + '</div>' +
      '</section>' +

      '</div>' +   /* /.d-grid__content */
      '</div>' +   /* /.d-grid */

      '<nav class="d-nav">' +
        '<button data-go="prev"' + (i === 0 ? ' disabled' : '') + '>← ' +
          (i === 0 ? 'Início' : esc(PROJECTS[i - 1].name)) + '</button>' +
        '<button data-go="next"' + (i === PROJECTS.length - 1 ? ' disabled' : '') + '>' +
          (i === PROJECTS.length - 1 ? 'Fim' : esc(PROJECTS[i + 1].name)) + ' →</button>' +
      '</nav>';
    }

    function open(i) {
      const p = PROJECTS[i];
      if (!p) return;
      current = i;
      lastFocus = lastFocus || document.activeElement;

      scroll.innerHTML = build(p, i);
      scroll.scrollTop = 0;
      panel.style.setProperty('--accent', p.accent);
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      if (window.Scene3D) Scene3D.setSectionAccent(p.accent);

      history.replaceState(null, '', '#p-' + p.slug);

      $$('[data-go]', scroll).forEach(function (b) {
        b.addEventListener('click', function () {
          const dir = b.getAttribute('data-go');
          open(dir === 'next' ? current + 1 : current - 1);
        });
      });

      $('.dossier__close').focus();

      if (HAS_GSAP && !REDUCED) {
        gsap.from(scroll.children, {
          y: 26, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.15
        });
      }
    }

    function close() {
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (window.Scene3D) Scene3D.setSectionAccent(null);
      history.replaceState(null, '', window.location.pathname);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
      current = -1;
    }

    $$('[data-close]').forEach(function (el) { el.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (!root.classList.contains('is-open')) return;

      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowRight' && current < PROJECTS.length - 1) { open(current + 1); return; }
      if (e.key === 'ArrowLeft' && current > 0) { open(current - 1); return; }

      if (e.key === 'Tab') { // foco preso no painel
        const items = $$('a[href], button:not([disabled])', panel);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    return { open: open, close: close };
  })();

  /* Abre direto o projeto quando a URL traz #p-slug */
  (function deepLink() {
    const m = window.location.hash.match(/^#p-(.+)$/);
    if (!m) return;
    const i = PROJECTS.findIndex(function (p) { return p.slug === m[1]; });
    if (i >= 0) setTimeout(function () { Dossier.open(i); }, 1400);
  })();

  /* ==========================================================================
     ANIMAÇÕES DE SCROLL
     ======================================================================== */
  function introAnimation() {
    if (!HAS_GSAP || REDUCED) return;

    gsap.from('.hero__title .word', {
      yPercent: 118, duration: 1.15, stagger: 0.1, ease: 'power4.out'
    });
    // fromTo (e não from): os .reveal já nascem em opacity:0 pelo CSS,
    // então um gsap.from animaria de 0 para 0 e o conteúdo nunca apareceria.
    gsap.fromTo('.hero .reveal',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.11, ease: 'power3.out', delay: 0.35 }
    );
    gsap.from('.nav', { y: -24, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 });
  }

  (function scrollAnimations() {
    if (!HAS_GSAP || typeof ScrollTrigger === 'undefined' || REDUCED) return;

    // revelações genéricas (fora do hero, já animado na intro)
    $$('.reveal').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.to(el, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // títulos por palavra
    $$('.contact__title .word').forEach(function (w) {
      gsap.from(w, {
        yPercent: 118, duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: w, start: 'top 92%' }
      });
    });

    // cards da grade entram escalonados, por linha
    gsap.from('.card', {
      y: 46, opacity: 0, duration: 0.75, ease: 'power3.out',
      stagger: { each: 0.07, from: 'start' },
      scrollTrigger: { trigger: '#projects-grid', start: 'top 80%' }
    });

    // recalcula quando as fontes carregam (evita gatilhos em posição errada)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  })();

  /* ==========================================================================
     SCROLL SUAVE PARA ÂNCORAS
     ======================================================================== */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });
  });

})();
