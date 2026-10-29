/* ==========================================================================
   motion.js — 动效引擎（经典脚本，零依赖，file:// 可直接运行）
   用法：<script src="assets/js/motion.js" defer></script>
   载入后自动执行 init()；需要手动重跑时调用 window.Motion.init()。
   尊重 prefers-reduced-motion: reduce —— 该状态下不位移、不倾斜，直接显示终态。
   ========================================================================== */

const SELECTOR = {
  reveal: '.reveal',
  stagger: '[data-stagger]',
  hero: '[data-hero]',
  tilt: '[data-tilt]',
  parallax: '[data-parallax]',
  counter: '[data-count]',
  nav: '.nav',
  navItem: '.nav__item',
};

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const state = {
  reduce: reduceQuery.matches,
  teardown: [],
  started: false,
};

/* --------------------------------------------------------------- 工具 */
function assignStagger(root) {
  const groups = root.querySelectorAll(SELECTOR.stagger);
  groups.forEach((group) => {
    const items = Array.from(group.children);
    items.forEach((item, index) => {
      if (!item.style.getPropertyValue('--i')) {
        item.style.setProperty('--i', String(index));
      }
    });
  });
}

function prefersReduced() {
  return state.reduce;
}

/* --------------------------------------------------------- 1. 滚动揭示 */
function initReveal() {
  const nodes = Array.from(document.querySelectorAll(SELECTOR.reveal));
  if (!nodes.length) return;

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  nodes.forEach((node) => {
    // 首屏内已经可见的元素直接显示，避免闪一下
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      node.classList.add('is-in');
      return;
    }
    io.observe(node);
  });

  state.teardown.push(() => io.disconnect());
}

/* ------------------------------------------------------------ 2. Hero */
function initHero() {
  const heroes = document.querySelectorAll(SELECTOR.hero);
  if (!heroes.length) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroes.forEach((hero) => hero.classList.add('is-in'));
    });
  });
}

/* -------------------------------------------------------- 3. 3D 倾斜 */
function initTilt() {
  const cards = Array.from(document.querySelectorAll(SELECTOR.tilt));
  if (!cards.length) return;
  if (prefersReduced() || !finePointer.matches) return;

  const maxDeg = 6;

  cards.forEach((card) => {
    let inside = false;

    // pointermove 本身已按帧节流，直接写 CSS 变量，保证指针一动就有反馈
    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const ry = ((px - 0.5) * 2 * maxDeg).toFixed(2);
      const rx = ((0.5 - py) * 2 * maxDeg).toFixed(2);
      card.style.setProperty('--ry', ry + 'deg');
      card.style.setProperty('--rx', rx + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    };

    const reset = () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
      card.style.willChange = 'auto';
    };

    const onEnter = () => {
      if (inside) return;
      inside = true;
      card.style.willChange = 'transform';
    };

    const onLeave = () => {
      inside = false;
      reset();
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    card.addEventListener('blur', onLeave);

    state.teardown.push(() => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('blur', onLeave);
      reset();
    });
  });
}

/* ------------------------------------------------------------ 4. 视差 */
function initParallax() {
  const nodes = Array.from(document.querySelectorAll(SELECTOR.parallax));
  if (!nodes.length || prefersReduced()) return;

  const items = nodes.map((node) => ({
    node,
    max: Number(node.dataset.parallax) || 20,
    offset: 0,
  }));

  let ticking = false;

  const update = () => {
    ticking = false;
    const viewport = window.innerHeight;

    items.forEach((item) => {
      const rect = item.node.getBoundingClientRect();
      if (rect.bottom < -viewport || rect.top > viewport * 2) return;
      // 元素中心相对视口中心的归一化位移 [-1, 1]
      const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2 + rect.height / 2);
      const y = Math.max(-1, Math.min(1, progress)) * item.max;
      item.node.style.setProperty('--py', (-y).toFixed(2) + 'px');
      item.offset = y;
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  state.teardown.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    items.forEach((item) => item.node.style.removeProperty('--py'));
  });
}

/* ------------------------------------------------ 5. 导航激活态标记 */
function currentPage() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  return file.replace(/\.html?$/i, '') || 'index';
}

function initNav() {
  const navs = document.querySelectorAll(SELECTOR.nav);
  if (!navs.length) return;

  const here = currentPage();

  const idOf = (item) => {
    const href = (item.getAttribute('href') || '').split('#')[0];
    if (!href || /^(https?:|mailto:|tel:)/i.test(href)) return null;
    return href.split('/').pop().replace(/\.html?$/i, '');
  };

  navs.forEach((nav) => {
    const items = Array.from(nav.querySelectorAll(SELECTOR.navItem));
    const hasMatch = items.some((item) => idOf(item) === here);

    // 当前文件名对不上任何一项（例如临时页 / file:// 下没有 .html 后缀）时，
    // 保留作者写好的 is-active + aria-current，不擅自改动。
    if (!hasMatch) {
      if (!nav.querySelector('.nav__item.is-active') && items[0]) {
        items[0].classList.add('is-active');
        items[0].setAttribute('aria-current', 'page');
      }
      return;
    }

    items.forEach((item) => {
      const isHere = idOf(item) === here;
      item.classList.toggle('is-active', isHere);
      if (isHere) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  });
}

/* ------------------------------------------------------ 6. 数字递增 */
function initCounters() {
  const nodes = Array.from(document.querySelectorAll(SELECTOR.counter));
  if (!nodes.length) return;

  const render = (node, value) => {
    const digits = Number(node.dataset.decimals || 0);
    const text = digits > 0 ? value.toFixed(digits) : String(Math.round(value));
    node.textContent = text;
  };

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => render(node, Number(node.dataset.count) || 0));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        io.unobserve(node);

        const target = Number(node.dataset.count) || 0;
        const duration = Number(node.dataset.duration) || 1000;
        const start = performance.now();

        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          render(node, target * eased);
          if (t < 1) requestAnimationFrame(tick);
          else render(node, target);
        };

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );

  nodes.forEach((node) => {
    node.textContent = '0';
    io.observe(node);
  });

  state.teardown.push(() => io.disconnect());
}

/* ------------------------------------------------------- 7. 深色块切换 */
function initDarkSections() {
  const sections = document.querySelectorAll('.section--dark');
  if (!sections.length || prefersReduced() || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '-12% 0px -12% 0px', threshold: 0.08 }
  );

  sections.forEach((section) => io.observe(section));
  state.teardown.push(() => io.disconnect());
}

/* ------------------------------------------------------------- 入口 */
function init(root = document) {
  if (state.started) return;
  state.started = true;
  state.reduce = reduceQuery.matches;

  document.documentElement.classList.add('js');
  assignStagger(root);
  initNav();
  initHero();
  initReveal();
  initTilt();
  initParallax();
  initCounters();
  initDarkSections();

  const onPrefChange = (event) => {
    state.reduce = event.matches;
    if (event.matches) {
      document.querySelectorAll(SELECTOR.tilt).forEach((card) => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    }
  };

  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', onPrefChange);
  }
}

function destroy() {
  state.teardown.forEach((fn) => fn());
  state.teardown.length = 0;
  state.started = false;
}

/* 对外暴露（经典脚本没有 export，用命名空间挂载；
   页面正常情况不需要调用，defer 载入后会自动初始化） */
window.Motion = { init, destroy };

// 脚本在 DOMContentLoaded 之前执行（defer 语义），
// 立刻打上 js 类避免首屏闪烁；随后在 DOMContentLoaded 自动初始化。
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.classList.add('js');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
}
