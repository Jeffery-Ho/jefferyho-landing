// Generates public/v2/index.html (zh), public/v2/en/index.html (en) and public/v2/sitemap.xml.
// Everything this site serves lives under /v2/; all other paths belong to the Notion site.
// Usage: node scripts/build.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://jefferyho.com";
const BASE = "/v2/"; // new homepage lives here; "/" stays on the Notion homepage
const N = (path) => `${SITE}/${path}`; // Notion page on the canonical domain

const content = {
  thoughts: [
    { zh: "离冥想最近的一次“接触”", en: "My closest brush with meditation", date: "2026-05-19", url: N("3652fd95f55e801cb2b6f57db7801d93") },
    { zh: "写在 30 岁前夕", en: "On the eve of turning 30", date: "2025-10-17", url: N("30-28d2fd95f55e80b1ab13e579c40e5339") },
    { zh: "Weekly 26 重读 HIG（七）/ Motion、Right to left", en: "Weekly 26 · Revisiting HIG (7): Motion, Right to left", date: "2025-10-16", url: N("Weekly-26-HIG-Motion-Right-to-left-3d2d5f4aa24f4177a6d234877021e1c9") },
    { zh: "Weekly 24 重读 HIG（四）/ Dark Mode、Icons", en: "Weekly 24 · Revisiting HIG (4): Dark Mode, Icons", date: "2025-10-16", url: N("Weekly-24-HIG-Dark-Mode-Icons-3ae962f9ba324447be07e31335005d13") },
    { zh: "Weekly 23 重读 HIG（三）/ App icons、Brand、Color", en: "Weekly 23 · Revisiting HIG (3): App icons, Brand, Color", date: "2025-10-16", url: N("Weekly-23-HIG-App-icons-Brand-Color-2de134c9086442ff9f883f8bf52eb393") },
    { zh: "Weekly 22 重读 HIG（二）/ Accessibility", en: "Weekly 22 · Revisiting HIG (2): Accessibility", date: "2025-10-16", url: N("Weekly-22-HIG-Accessibility-c4b1a0df1f2e4e9191f6188e98e0ad0f") },
    { zh: "Weekly 20 从内容分发到工具体验", en: "Weekly 20 · From content distribution to tool experience", date: "2025-10-16", url: N("Weekly-20-f4429ca7155f4998ae8e41eb97793607") },
    { zh: "Weekly 19 设计师的面试官心得", en: "Weekly 19 · Notes from interviewing designers", date: "2025-10-16", url: N("Weekly-19-7474754524664e188a0e5bd36428d652") },
  ],
  public: [
    { zh: "WWDC26 观后感（设计吐槽 & 期待）", en: "WWDC26 takeaways: design gripes & hopes", date: "2026-06-18", url: N("WWDC26-37b2fd95f55e80089bffe84844983b1a") },
    { zh: "我的 flomo 心得，及 Notion、语雀、flomo 如何搭配使用", en: "My flomo notes, and how I pair Notion, Yuque and flomo", date: "2025-10-16", url: N("JefferyHo_-flomo-Notion-flomo-qq-com-acd099843f3545c7914d67c1c5b6de72"), src: { zh: "微信公众号", en: "WeChat" } },
    { zh: "我的记录战队：flomo + 语雀 + Notion", en: "My note-taking stack: flomo + Yuque + Notion", date: "2025-10-16", url: N("flomo-Notion-xiaohongshu-com-6141acf31e7f42b4b22cabda734d5a66"), src: { zh: "小红书", en: "Xiaohongshu" } },
  ],
  projects: [
    { zh: "重读 HIG", en: "Revisiting HIG", glyph: "HIG", url: N("HIG-34a8557f73f44a98a93182959147364b"), d: { zh: "系列文章", en: "Article series" } },
    { zh: "小报童付费专栏", en: "Paid column on Xiaobaotong", glyph: "Col", url: N("7e3db60d0af749b2954718c2f08fc2c6"), d: { zh: "专栏", en: "Column" } },
    { zh: "Telegram 设计分享频道", en: "Telegram design channel", glyph: "TG", url: N("Telegram-ef52ccb06311414cb9bf72c77bb64173"), d: { zh: "频道", en: "Channel" } },
    { zh: "物联网开放平台", en: "IoT open platform", glyph: "IoT", url: N("da64dd8a09b44880b288616044a57c6e"), d: { zh: "平台设计", en: "Platform design" } },
    { zh: "室内网关中控屏", en: "Indoor gateway control panel", glyph: "Hub", url: N("32202039af8845289ef58f382b237888"), d: { zh: "智能硬件", en: "Smart hardware" } },
    { zh: "招商银行 · 天工设计平台的设计探索", en: "China Merchants Bank · Tiangong design platform exploration", glyph: "CMB", url: N("57db2dc82f3e484e8bec0c766a3654d6"), d: { zh: "设计探索", en: "Design exploration" } },
    { zh: "OPPO ColorOS 社区设计", en: "OPPO ColorOS community design", glyph: "OS", url: N("OPPO-ColorOS-411044885ef54e41ad70b5eed9068935"), d: { zh: "社区设计", en: "Community design" } },
    { zh: "招商证券 · 交易大师交互体验优化提案", en: "China Merchants Securities · Trading app UX proposal", glyph: "CMS", url: N("b83ed0d1c2224018ae1e593e73c1f023"), d: { zh: "提案", en: "Proposal" } },
    { zh: "腾讯 · 医疗健康官网设计策略提案", en: "Tencent · Healthcare website design strategy", glyph: "TX", url: N("af7a191d32f14aec98025e9dd2254082"), d: { zh: "提案", en: "Proposal" } },
    { zh: "招商银行 · 天工设计平台提案", en: "China Merchants Bank · Tiangong design platform proposal", glyph: "CMB", url: N("4de2c03058264efe8fff23a75b8f901a"), d: { zh: "提案", en: "Proposal" } },
  ],
  photography: [
    { zh: "Nothing ear (1)", en: "Nothing ear (1)", glyph: "ear", url: N("Nothing-ear-1-28e2fd95f55e80afb98ee5103baee850"), d: { zh: "收获了 Nothing CEO 的点赞", en: "Got a like from the Nothing CEO" } },
    { zh: "Unsplash 2020", en: "Unsplash 2020", glyph: "2020", url: N("Unsplash-2020-28e2fd95f55e8092a653faf72b6db165"), d: { zh: "Interiors 类别入围", en: "Finalist, Interiors category" } },
  ],
  about: [
    { zh: "个人说明书", en: "A user manual for me", date: "2022-09-23", url: N("90008a05eb1c4c1aa077b126993d6b0a") },
    { zh: "基于 SWOT 分析自己", en: "A SWOT analysis of myself", date: "2022-09-23", url: N("SWOT-6cc3629e5d224463bd8a723a29237028") },
    { zh: "和创造力有关的 6 个问题", en: "6 questions about creativity", date: "2022-09-23", url: N("6-12a7ce80d37d4d7fa7570135c495d1f9") },
  ],
  follow: [
    { zh: "Newsletter", en: "Newsletter", url: "https://quaily.com/jefferystudio" },
    { zh: "杰_弗里", en: "杰_弗里", url: N("_-28c2fd95f55e80868ebdc40102cd1db7") },
    { zh: "24PX", en: "24PX", url: N("24PX-28c2fd95f55e80639e22fe1e4533fa0c") },
    { zh: "邮箱", en: "Email", url: "mailto:Hexianji@outlook.com" },
  ],
};

const i18n = {
  zh: {
    lang: "zh-CN",
    path: BASE,
    locale: "zh_CN",
    altLocale: "en_US",
    title: "Jeffery Ho · 产品设计师",
    description:
      "Jeffery Ho，深圳的高级产品设计师，做智能猫砂机、喂食器、扫地机器人、割草机等智能硬件的软件体验。这里记录设计、科技与阅读。",
    og: "og.png",
    ogAlt: "Jeffery Ho · 高级产品设计师 · 深圳",
    role: "高级产品设计师 · 深圳",
    bio: [
      "你好，我是 Jeffery，现居深圳，喜欢电影、阅读和咖啡。",
      "2017 年大学毕业，从平面设计起步，一路走到产品与产品设计。目前是一名高级产品设计师，负责过智能猫砂机、喂食器、扫地机器人、割草机的软件需求。",
      "喜欢创造和整理。如果你有好的软件机会，欢迎找我喝杯咖啡。",
    ],
    sections: { thoughts: "想法", public: "公开分享", projects: "项目", photography: "摄影", about: "关于" },
    all: "全部",
    filterLabel: "按类别筛选",
    other: { href: `${BASE}en/`, label: "EN", lang: "en", aria: "Switch to English" },
    theme: { system: "主题：跟随系统", light: "主题：浅色", dark: "主题：深色" },
    avatarAlt: "Jeffery 的插画头像",
    jobTitle: "高级产品设计师",
    city: "深圳",
    date: (d) => d.replaceAll("-", "."),
  },
  en: {
    lang: "en",
    path: `${BASE}en/`,
    locale: "en_US",
    altLocale: "zh_CN",
    title: "Jeffery Ho · Product Designer",
    description:
      "Jeffery Ho is a senior product designer in Shenzhen, shaping software for smart devices — litter boxes, feeders, robot vacuums and mowers. Notes on design, technology and reading.",
    og: "og-en.png",
    ogAlt: "Jeffery Ho · Senior Product Designer · Shenzhen",
    role: "Senior Product Designer · Shenzhen",
    bio: [
      "Hi, I’m Jeffery. I live in Shenzhen and I’m into films, books and coffee.",
      "I graduated in 2017 and moved from graphic design to product, then to product design. Today I’m a senior product designer, and I’ve owned the software experience for smart litter boxes, pet feeders, robot vacuums and lawn mowers.",
      "I love making and organizing things. If you have an interesting software opportunity, let’s grab a coffee.",
    ],
    sections: { thoughts: "Thoughts", public: "In public", projects: "Projects", photography: "Photography", about: "About" },
    all: "All",
    filterLabel: "Filter by category",
    other: { href: BASE, label: "中文", lang: "zh-CN", aria: "切换到中文" },
    theme: { system: "Theme: system", light: "Theme: light", dark: "Theme: dark" },
    avatarAlt: "Illustrated portrait of Jeffery",
    jobTitle: "Senior Product Designer",
    city: "Shenzhen",
    date: (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ICONS = `
      <svg class="icon icon-system" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.5"/><path d="M5.5 13.5h5"/></svg>
      <svg class="icon icon-light" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/></svg>
      <svg class="icon icon-dark" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/></svg>`;

function list(items, t, lang) {
  return `<ul class="list">
${items
  .map(
    (it) => `          <li><a href="${esc(it.url)}"><span class="item-title">${esc(it[lang])}</span><span class="item-meta">${it.src ? esc(it.src[lang]) + " · " : ""}<time datetime="${it.date}">${esc(t.date(it.date))}</time></span></a></li>`
  )
  .join("\n")}
        </ul>`;
}

function grid(items, lang) {
  return `<div class="grid">
${items
  .map(
    (it, i) => `          <a class="card" href="${esc(it.url)}">
            <div class="card-visual" aria-hidden="true"><span class="card-index">${String(i + 1).padStart(2, "0")}</span><span class="card-glyph">${esc(it.glyph)}</span></div>
            <h3>${esc(it[lang])}</h3>
            <p>${esc(it.d[lang])}</p>
          </a>`
  )
  .join("\n")}
        </div>`;
}

function page(lang) {
  const t = i18n[lang];
  const url = SITE + t.path;
  const order = ["thoughts", "public", "projects", "photography", "about"];
  const body = {
    thoughts: list(content.thoughts, t, lang),
    public: list(content.public, t, lang),
    projects: grid(content.projects, lang),
    photography: grid(content.photography, lang),
    about: list(content.about, t, lang),
  };
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jeffery Ho",
    alternateName: "Jeffery",
    url: SITE + BASE,
    image: `${SITE}${BASE}avatar.png`,
    jobTitle: t.jobTitle,
    description: t.description,
    address: { "@type": "PostalAddress", addressLocality: t.city, addressCountry: "CN" },
    sameAs: ["https://quaily.com/jefferystudio"],
  };

  return `<!doctype html>
<html lang="${t.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.description)}">
  <meta name="author" content="Jeffery Ho">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="zh-CN" href="${SITE}${BASE}">
  <link rel="alternate" hreflang="en" href="${SITE}${BASE}en/">
  <link rel="alternate" hreflang="x-default" href="${SITE}${BASE}">

  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="Jeffery Ho">
  <meta property="og:title" content="${esc(t.title)}">
  <meta property="og:description" content="${esc(t.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}${BASE}${t.og}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(t.ogAlt)}">
  <meta property="og:locale" content="${t.locale}">
  <meta property="og:locale:alternate" content="${t.altLocale}">
  <meta property="profile:first_name" content="Jeffery">
  <meta property="profile:last_name" content="Ho">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(t.title)}">
  <meta name="twitter:description" content="${esc(t.description)}">
  <meta name="twitter:image" content="${SITE}${BASE}${t.og}">
  <meta name="twitter:image:alt" content="${esc(t.ogAlt)}">

  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#08090a">
  <link rel="icon" href="${BASE}favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png">
  <script>(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
  <link rel="stylesheet" href="${BASE}assets/site.css">
  <script type="application/ld+json">${JSON.stringify(person)}</script>
</head>
<body>
  <header class="top">
    <div class="wrap">
      <a class="brand" href="${t.path}"><img class="brand-mark" src="${BASE}favicon.png" width="24" height="24" alt="">Jeffery Ho</a>
      <div class="tools">
        <a class="tool" href="${t.other.href}" hreflang="${t.other.lang}" lang="${t.other.lang}" aria-label="${esc(t.other.aria)}">${t.other.label}</a>
        <button class="tool" type="button" data-theme-toggle data-label-system="${esc(t.theme.system)}" data-label-light="${esc(t.theme.light)}" data-label-dark="${esc(t.theme.dark)}" aria-label="${esc(t.theme.system)}">${ICONS}
        </button>
      </div>
    </div>
  </header>

  <main class="wrap">
    <section class="hero">
      <img class="avatar" src="${BASE}avatar.png" width="96" height="96" alt="${esc(t.avatarAlt)}">
      <h1>Jeffery Ho</h1>
      <p class="role">${esc(t.role)}</p>
      <div class="bio">
${t.bio.map((p) => `        <p>${esc(p)}</p>`).join("\n")}
      </div>
      <div class="links">
${content.follow.map((f) => `        <a class="chip" href="${esc(f.url)}">${esc(f[lang])}</a>`).join("\n")}
      </div>
    </section>

    <div class="filters" role="group" aria-label="${esc(t.filterLabel)}">
      <button class="filter" type="button" data-filter="all" aria-pressed="true">${esc(t.all)}</button>
${order.map((k) => `      <button class="filter" type="button" data-filter="${k}" aria-pressed="false">${esc(t.sections[k])}</button>`).join("\n")}
    </div>

${order
  .map(
    (k) => `    <section class="section" id="${k}" data-cat="${k}" aria-labelledby="h-${k}">
        <h2 id="h-${k}">${esc(t.sections[k])}</h2>
        ${body[k]}
    </section>`
  )
  .join("\n\n")}
  </main>

  <footer class="foot">
    <div class="wrap">
      <span>© 2026 Jeffery Ho</span>
      <nav>
${content.follow.map((f) => `        <a href="${esc(f.url)}">${esc(f[lang])}</a>`).join("\n")}
      </nav>
    </div>
  </footer>
  <script src="${BASE}assets/site.js" defer></script>
</body>
</html>
`;
}

for (const lang of ["zh", "en"]) {
  const out = join(ROOT, "public", "v2", lang === "zh" ? "index.html" : "en/index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(lang));
  console.log("wrote", out);
}

// sitemap.xml for the v2 pages only (final, directly indexable URLs).
const today = new Date().toISOString().slice(0, 10);
const entry = (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE}${BASE}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${BASE}en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${BASE}"/>
  </url>`;
const sitemap = join(ROOT, "public", "v2", "sitemap.xml");
writeFileSync(
  sitemap,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(`${SITE}${BASE}`)}
${entry(`${SITE}${BASE}en/`)}
</urlset>
`
);
console.log("wrote", sitemap);
