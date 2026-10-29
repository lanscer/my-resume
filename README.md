# site/ 共享地基使用说明（foundation）

给 index / about / works 三个页面的作者。本目录只负责**设计令牌 + 基础样式 + 动效引擎 + 图片资产**，
不含任何页面。规范原文见仓库根目录 `DESIGN-SPEC.md`。

> 只用这一层，不要另造同类类名；需要新的视觉，优先在页面里组合已提供的类 + 少量局部样式。

---

## 1. 文件清单与用途

| 文件 | 用途 |
| --- | --- |
| `assets/css/tokens.css` | 设计令牌：颜色、字体栈、字号、间距、网格宽、圆角、动效时长/缓动。**页面里不写死色值和字号**，一律引用变量。 |
| `assets/css/base.css` | reset + 8 栏网格竖线层 + 顶栏/菜单按钮 + 导航 + 章节 + 卡片 + 标签 + 数据行 + 页脚 + 揭示动效类 + 响应式 + `prefers-reduced-motion` 兜底。 |
| `assets/js/motion.js` | 动效引擎（经典脚本，零依赖）：滚动揭示、hero 入场 stagger、3D 倾斜、视差、导航激活态、数字递增、深色块入场。 |
| `assets/img/*.png` | 从设计稿裁出的位图资产，清单见 §7。 |
| `README.md` | 本文件。 |

引入方式（**经典脚本，`file://` 双击可用**）：

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<script src="assets/js/motion.js" defer></script>
```

> 注意：不要改成 `<script type="module">`。ES module 在 `file://`（origin 为 null）下会被 Chrome / Edge
> 以 CORS 拦掉，脚本根本不执行，动效全废。motion.js 已改为经典脚本，`defer` 载入后自动初始化。
> 需要手动再跑一次时用 `window.Motion.init()`。

### 页面骨架（每个页面都照这个顺序）

```html
<body>
  <div class="grid-lines" aria-hidden="true"></div>  <!-- 8 栏竖线，放 body 第一个子元素 -->

  <header class="topbar">…导航…</header>

  <main class="page">
    <section class="section">…</section>
    <section class="section section--dark">…</section>
  </main>

  <footer class="footer">…</footer>

  <script src="assets/js/motion.js" defer></script>
</body>
```

---

## 2. 可直接复用的类名清单

### 布局
| 类名 | 说明 |
| --- | --- |
| `.shell` | 内容容器：`max-width: 1440px` + 左右留白 `--pad-x`。所有内容都套一层。 |
| `.grid-lines` | 固定定位的 8 栏竖线层（`pointer-events: none`，`z-index: 0`）。 |
| `.page` | `main` 容器，把内容压在网格层之上（`z-index: 1`）。 |

### 顶栏 / 导航（硬性契约）
`.topbar` `.topbar__inner` `.menu-btn` `.nav` `.nav__item` `.nav__num` `.nav__label` `.is-active`

### 章节
`.section` `.section--dark` `.section--flush` `.section__body` `.section__rail` `.rail__en` `.rail` `.rail__back` `.hairline`

### 卡片
`.card-grid`（`--2` `--3` `--4`）`.card` `.card__media`（`--square` `--wide` `--free` `--glow`）`.card__body`
`.card__eyebrow` `.card__title` `.card__desc` `.card__meta` `.card__tags` `.tag`
`.card--wide` `.card--media-left` `.card--hero`

### 排版
`.eyebrow`（+`.eyebrow__cn`）`.display-hero` `.hero-sub` `.section__title` `.block-title` `.lede` `.body` `.meta`
`.serif` `.link-underline` `.link-arrow` `.vertical`

### 数据 / 页脚
`.stats` `.stat` `.stat__num` `.stat__unit` `.stat__label`
`.footer` `.footer__title` `.footer__note` `.footer__bottom`

---

## 3. 导航整段（直接抄，三页都要有）

编号在上、文字在下；当前页加 `.is-active` + `aria-current="page"`。
**动效引擎会按当前文件名自动点亮对应项**（`index.html` → 01，`about.html` → 02，`works.html` → 03），
所以三页可以原样复制这一段，不用手改 —— 但仍建议保留手写的 `is-active`/`aria-current` 作为无 JS 时的兜底。

```html
<header class="topbar">
  <div class="shell topbar__inner">
    <button class="menu-btn" type="button" aria-label="打开菜单" aria-expanded="false">
      <span></span><span></span>
    </button>

    <nav class="nav" aria-label="主导航">
      <a class="nav__item is-active" href="index.html" aria-current="page">
        <span class="nav__num">01</span><span class="nav__label">首页</span>
      </a>
      <a class="nav__item" href="about.html">
        <span class="nav__num">02</span><span class="nav__label">关于我</span>
      </a>
      <a class="nav__item" href="works.html">
        <span class="nav__num">03</span><span class="nav__label">作品</span>
      </a>
    </nav>
  </div>
</header>
```

样式行为：未激活 `--muted`、激活 `--ink` + 2px 下划线（宽度=文字宽，从左向右 240ms 展开）；
hover 时编号上移 2px；菜单按钮 48×48、`--chip` 底、圆角 10px、两条 22px 横线，hover 时横线宽度变化。

---

## 4. 章节 + 卡片片段（直接抄）

### 章节（左栏小标 + 右栏内容，白/深两种）

```html
<!-- 白色章节 -->
<section class="section">
  <div class="shell section__body">
    <div class="section__rail">
      <span>工作介绍</span>
      <span class="rail__en">Intro</span>
    </div>
    <div>
      <h2 class="section__title reveal">我用设计语言和技术工具说话。</h2>
      <p class="body reveal" style="--i:1">从视觉表达，到实际落地。</p>
    </div>
  </div>
</section>

<!-- 深色章节：加 section--dark，硬边无圆角，文字自动切到 --panel-ink -->
<section class="section section--dark">
  <div class="shell section__body">
    <div class="section__rail"><span>工作经历</span><span class="rail__en">Experience</span></div>
    <div class="body">…4 条经历，逐条用 <hr class="hairline"> 分隔…</div>
  </div>
</section>
```

### 卡片

```html
<div class="card-grid card-grid--3" data-stagger>
  <article class="card reveal" data-tilt>
    <div class="card__media">
      <img src="assets/img/work-qiaqiaolang.png" alt="跨境采购 App 界面" loading="lazy">
    </div>
    <div class="card__body">
      <span class="card__eyebrow">2019.12</span>
      <h3 class="card__title">跨境采购 App · 巧巧郎 UI</h3>
      <p class="card__desc">前端 UI 页面设计 · 二楼功能及子页面</p>
      <div class="card__tags"><span class="tag">电商</span><span class="tag">App UI</span></div>
      <div class="card__meta"><span>长期维护开发</span></div>
    </div>
  </article>
</div>
```

横卡（左右各半；`.card--media-left` 把图放左边）：

```html
<article class="card card--wide reveal" data-tilt>
  <div class="card__media"><img src="assets/img/work-guoyuan.png" alt="国元期货 App 界面"></div>
  <div class="card__body">
    <span class="card__eyebrow">2018.06 – 2019.01</span>
    <h3 class="card__title">国元期货 App UI</h3>
    <p class="card__desc">App 初次界面设计及后续迭代</p>
    <div class="card__tags"><span class="tag">金融科技</span></div>
  </div>
</article>
```

没有图片的项目用纯 CSS 面板底（设计稿里这类卡片本来就只有渐变光斑）：

```html
<div class="card__media card__media--glow"></div>
```

### 数据行（数字递增）

```html
<div class="stats reveal">
  <span class="stat"><span class="stat__num" data-count="636">0</span><span class="stat__unit">commits</span></span>
  <span class="stat"><span class="stat__num" data-count="376">0</span><span class="stat__unit">单元测试</span></span>
</div>
```

---

## 5. 动效触发方式（加 class 或 data 属性即可）

| 效果 | 怎么触发 | 说明 |
| --- | --- | --- |
| 滚动揭示 | `class="reveal"` | 进入视口后自动加 `.is-in`；同组用 `data-stagger` 包一层父元素，子项自动分配 `--i`（80ms 阶梯）。也可手写 `style="--i:2"`。变体：`.reveal--left` `.reveal--right` `.reveal--fade` `.reveal--zoom`。 |
| Hero 入场 stagger | 父元素 `data-hero` + 子元素 `class="hero__seg"` | 子项按 `--i` 每段 120ms 依次上浮；照片再套 `.hero__seg--media`（额外 `scale(1.04)` 回落）。 |
| 3D 倾斜 | 卡片加 `data-tilt` | 需 `.card` 同在（transform 由 `.card[data-tilt]` 提供）。指针移动写 `--rx/--ry/--mx/--my`（±6deg），离开 320ms 回正；光斑跟随 `--mx/--my`。触屏 / 无 hover / reduced-motion 下自动关闭。 |
| 视差 | 元素加 `data-parallax`（值=像素幅度，默认 20） | 随滚动写 `--py`，`transform: translate3d`。适合 hero 人像、深色块内实拍图。 |
| 导航激活态 | 无需手动 | 按当前文件名点亮，写 `.is-active` + `aria-current="page"`；对不上任何项时保留手写标记。 |
| 下划线展开 | 纯 CSS | `.nav__item` 的 `::after`，hover / 激活 `scaleX(1)`，240ms 从左展开。 |
| 数字递增 | `data-count="636"` | 进入视口从 0 递增到目标（默认 1s）；`data-decimals="1"` 保留小数；reduced-motion 下直接显示终值。 |
| 深色块入场 | 自动 | `.section--dark` 进入视口加 `.is-in`，可自行挂过渡。 |

**prefers-reduced-motion: reduce**：`base.css` 末尾统一关闭 transition/transform，并把 `.reveal`/`.hero__seg`
强制为终态；motion.js 同时跳过揭示动画、倾斜、视差、计数动画（直接显示终值）。这条已实测（见交付回报）。

---

## 6. 响应式与断点

- 基准桌面 1440；≥1024 两列（左栏小标 17% + 内容）。
- ≤1024：`.section__body` 单列堆叠，卡片网格 3/4 栏降为 2 栏，`.card--wide` 变上下结构。
- ≤700：全部单列，导航间距收紧，网格竖线左右各留 16px。
- 全局 `overflow-x: hidden`，1280 / 1440 / 1920 三档不应出现横向溢出。

---

## 7. 图片资产清单（`assets/img/`）

全部从 `figma-ref/ref-home.png`、`figma-ref/ref-about.png` 用 PIL 裁切，已清掉设计稿的辅助网格发丝线。

| 文件 | 像素 | 内容 | 建议用法 |
| --- | --- | --- | --- |
| `hero-portrait.png` | 575 × 948 | 首页 Hero 人像（黑白，白底），**已含手写署名「柳斌」与签名笔迹** | Hero 右列，`data-parallax="20"`；底部是设计稿的硬切边，直接压在深色块上沿 |
| `hero-signer.png` | 252 × 94 | 衬线字标 `signer`（透明感白底、深墨字） | 只在**需要单独排版字标**时用；hero-portrait 里没有人像左侧的 `signer` 字样，二者不重复、不要同时塞进 Hero |
| `intro-desk.png` | 392 × 398 | 「工作介绍」右侧实拍（显示器 / 笔记本 / 键盘的工作台） | 深色块右列，近方形，`data-parallax` 可选 |
| `about-icons.png` | 519 × 463 | 关于我页右侧 3D 图标簇（Figma / OpenAI / Xd / Ps / Ai / ComfyUI 等，白底） | 关于我首屏右列，约 480px 宽；四周留白 20px |
| `work-qiaqiaolang.png` | 527 × 296 | 设计稿「App UI」深色占位面板（巧巧郎卡右侧） | 横卡 `.card__media`；也可当通用 App 类卡片底图 |
| `work-guoyuan.png` | 527 × 295 | 设计稿「Fin UI」深色占位面板（国元期货卡左侧） | 同上，金融类卡片 |
| `work-infinite-canvas.png` | 218 × 347 | 深色渐变光斑面板（首页大卡左侧视觉） | 竖版 `.card__media` 或做装饰底图 |
| `work-offline.png` | 218 × 233 | 深色渐变光斑面板（线下物料卡的视觉） | 方版 `.card__media` |

说明：设计稿里的作品卡**没有截图/照片 mockup**，用的是深色面板 + 大号灰色占位字（`App UI` / `Fin UI`）+ 柔和光斑。
所以 `work-*.png` 裁的就是这些面板本体（不含卡片文字）；需要别的观感时用 `.card__media--glow` 纯 CSS 版本。

---

## 8. 已知限制 / 取舍

1. **脚本必须是经典脚本**，不要改回 `type="module"`：`file://` 下 ES module 被 CORS 拦截（origin null），
   JS 完全不执行。若以后改用本地服务器（`python3 -m http.server`）部署，两种写法都行，但当前以 `file://` 双击为准。
2. 无 JS 时（脚本被拦 / 用户禁用 JS）页面**依然完整可读**：`.reveal` 的隐藏态只在 `html.js` 下生效，
   且脚本在解析阶段就加上 `js` 类，正常情况下不会闪。
3. 3D 倾斜与视差在 `prefers-reduced-motion: reduce`、触屏、无 hover 设备下自动禁用。
4. 字体全部用系统栈（PingFang SC / Didot / Songti SC 等），无外链字体；因此 Windows 上衬线字标会退化成
   `Playfair Display → Times New Roman`，属预期。
5. 图片是设计稿原生像素裁切，未做 2x 适配标注；`hero-portrait` 与 `about-icons` 在 2x 屏上略软，可接受。
