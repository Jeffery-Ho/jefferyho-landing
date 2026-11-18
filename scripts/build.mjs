// Generates the v2 site: public/v2/index.html (zh), public/v2/en/index.html (en), one page per
// migrated Notion page (content/pages.mjs + content/notion/*.json), and public/v2/sitemap.xml.
// Everything this site serves lives under /v2/; all other paths belong to the Notion site.
// Usage: node scripts/build.mjs
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pagePath, pages } from "../content/pages.mjs";
import { esc, firstImage, renderBlocks, textOf } from "./render-notion.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://jefferyho.com";
const BASE = "/v2/";
const OUT = join(ROOT, "public", "v2");

// ---------- content ----------

// Notion bodies; pages whose Notion body is empty fall back to an imported original (content/external/).
const data = Object.fromEntries(
  pages.map((p) => {
    const d = JSON.parse(readFileSync(join(ROOT, "content", "notion", `${p.id}.json`), "utf8"));
    const extFile = join(ROOT, "content", "external", `${p.id}.json`);
    if (!d.body.length && existsSync(extFile)) {
      const ext = JSON.parse(readFileSync(extFile, "utf8"));
      d.body = ext.body;
      d.published = ext.created;
      d.imported = true;
    }
    return [p.id, d];
  })
);
const hex = (id) => id.replace(/-/g, "");
const byHex = Object.fromEntries(pages.map((p) => [hex(p.id), p]));
const bySlug = Object.fromEntries(pages.filter((p) => !p.parent).map((p) => [p.slug, p]));
const shDate = (iso) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
const dateOf = (p) => p.date ?? data[p.id].published ?? shDate(data[p.id].created);
const urlOf = (p) => `${BASE}${p.alias ?? pagePath(p).replace(/\/$/, "")}/`;
const rendered = pages.filter((p) => !p.alias); // alias entries point at another page
const chapters = pages.filter((p) => p.parent === "rereading-hig");

const byDateDesc = (a, b) => dateOf(b).localeCompare(dateOf(a));
const home = {
  thoughts: pages.filter((p) => p.group === "thoughts").sort(byDateDesc),
  public: pages.filter((p) => p.group === "public").sort(byDateDesc),
  projects: pages.filter((p) => p.section === "projects" && !p.parent),
  photography: pages.filter((p) => p.section === "photography"),
  about: pages.filter((p) => p.section === "about"),
};

const follow = [
  { zh: "Newsletter", en: "Newsletter", url: "https://quaily.com/jefferystudio" },
  { zh: "小红书 @杰_弗里", en: "Xiaohongshu @杰_弗里", url: "https://xhslink.com/m/3wXO9kRBrLO" },
  { zh: "小红书 @24PX", en: "Xiaohongshu @24PX", url: "https://xhslink.com/m/893LNqEQ8SC" },
  { zh: "邮箱", en: "Email", url: "mailto:Hexianji@outlook.com" },
];

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

// ---------- shared chrome ----------

const ICONS = `
      <svg class="icon icon-system" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.5"/><path d="M5.5 13.5h5"/></svg>
      <svg class="icon icon-light" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/></svg>
      <svg class="icon icon-dark" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/></svg>`;

const PERSON = { "@type": "Person", name: "Jeffery Ho", url: SITE + BASE };

function head({ t, title, description, url, image, alternates, type, jsonld, extra = "" }) {
  const alt = alternates
    ? `
  <link rel="alternate" hreflang="zh-CN" href="${SITE}${BASE}">
  <link rel="alternate" hreflang="en" href="${SITE}${BASE}en/">
  <link rel="alternate" hreflang="x-default" href="${SITE}${BASE}">`
    : "";
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Jeffery Ho">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">${alt}

  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Jeffery Ho">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image.url}">
  <meta property="og:image:width" content="${image.w}">
  <meta property="og:image:height" content="${image.h}">
  <meta property="og:image:alt" content="${esc(image.alt)}">
  <meta property="og:locale" content="${t.locale}">${extra}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image.url}">
  <meta name="twitter:image:alt" content="${esc(image.alt)}">

  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#08090a">
  <link rel="icon" href="${BASE}favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png">
  <script>(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
  <link rel="stylesheet" href="${BASE}assets/site.css">
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>
</head>`;
}

function header(t, { langToggle }) {
  const toggle = langToggle
    ? `
        <a class="tool" href="${t.other.href}" hreflang="${t.other.lang}" lang="${t.other.lang}" aria-label="${esc(t.other.aria)}">${t.other.label}</a>`
    : "";
  return `  <header class="top">
    <div class="wrap">
      <a class="brand" href="${t.path}"><img class="brand-mark" src="${BASE}favicon.png" width="24" height="24" alt="">Jeffery Ho</a>
      <div class="tools">${toggle}
        <button class="tool" type="button" data-theme-toggle data-label-system="${esc(t.theme.system)}" data-label-light="${esc(t.theme.light)}" data-label-dark="${esc(t.theme.dark)}" aria-label="${esc(t.theme.system)}">${ICONS}
        </button>
      </div>
    </div>
  </header>`;
}

function footer(lang) {
  return `  <footer class="foot">
    <div class="wrap">
      <span>© 2026 Jeffery Ho</span>
      <nav>
${follow.map((f) => `        <a href="${esc(f.url)}">${esc(f[lang])}</a>`).join("\n")}
      </nav>
    </div>
  </footer>
  <script src="${BASE}assets/site.js" defer></script>`;
}

const siteImage = (t) => ({ url: `${SITE}${BASE}${t.og}`, w: 1200, h: 630, alt: t.ogAlt });

// ---------- homepage ----------

function list(items, t, lang) {
  return `<ul class="list">
${items
  .map(
    (p) =>
      `          <li><a href="${urlOf(p)}"><span class="item-title">${esc(p[lang])}</span><span class="item-meta">${p.src ? esc(p.src[lang]) + " · " : ""}<time datetime="${dateOf(p)}">${esc(t.date(dateOf(p)))}</time></span></a></li>`
  )
  .join("\n")}
        </ul>`;
}

function grid(items, lang) {
  return `<div class="grid">
${items
  .map(
    (p) => `          <a class="card" href="${urlOf(p)}">
            <div class="card-visual"><img src="${BASE}covers/${p.cover}" alt="" width="1000" height="562" loading="lazy" decoding="async"></div>
            <h3>${esc(p[lang])}</h3>
            <p>${esc(p.d[lang])}</p>
          </a>`
  )
  .join("\n")}
        </div>`;
}

function homePage(lang) {
  const t = i18n[lang];
  const order = ["thoughts", "public", "projects", "photography", "about"];
  const body = {
    thoughts: list(home.thoughts, t, lang),
    public: list(home.public, t, lang),
    projects: grid(home.projects, lang),
    photography: grid(home.photography, lang),
    about: list(home.about, t, lang),
  };
  const jsonld = {
    "@context": "https://schema.org",
    ...PERSON,
    alternateName: "Jeffery",
    image: `${SITE}${BASE}avatar.png`,
    jobTitle: t.jobTitle,
    description: t.description,
    address: { "@type": "PostalAddress", addressLocality: t.city, addressCountry: "CN" },
    sameAs: ["https://quaily.com/jefferystudio"],
  };
  const extra = `
  <meta property="og:locale:alternate" content="${t.altLocale}">
  <meta property="profile:first_name" content="Jeffery">
  <meta property="profile:last_name" content="Ho">`;

  return `<!doctype html>
<html lang="${t.lang}">
${head({ t, title: t.title, description: t.description, url: SITE + t.path, image: siteImage(t), alternates: true, type: "profile", jsonld, extra })}
<body>
${header(t, { langToggle: true })}

  <main class="wrap">
    <section class="hero">
      <img class="avatar" src="${BASE}avatar.png" width="96" height="96" alt="${esc(t.avatarAlt)}">
      <h1>Jeffery Ho</h1>
      <p class="role">${esc(t.role)}</p>
      <div class="bio">
${t.bio.map((p) => `        <p>${esc(p)}</p>`).join("\n")}
      </div>
      <div class="links">
${follow.map((f) => `        <a class="chip" href="${esc(f.url)}">${esc(f[lang])}</a>`).join("\n")}
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

${footer(lang)}
</body>
</html>
`;
}

// ---------- article pages ----------

function resolver(page) {
  return (href) => {
    if (!href) return null;
    const internal = href.startsWith("/") || /^https?:\/\/(www\.)?(jefferyho\.com|[\w-]+\.notion\.site|notion\.so)\//.test(href);
    if (!internal) return { href };
    const m = /([0-9a-f]{32})(?![0-9a-f])/.exec(href.replace(/-/g, ""));
    if (!m) return null;
    if (m[1] === hex(page.id)) return null; // table-of-contents links back to the same page
    const target = byHex[m[1]];
    return target ? { href: urlOf(target) } : null;
  };
}

function chapterList() {
  return `<ol class="chapters">
${chapters.map((c) => `  <li><a href="${urlOf(c)}"><span class="item-title">${esc(c.zh)}</span><span class="item-meta"><time datetime="${dateOf(c)}">${esc(i18n.zh.date(dateOf(c)))}</time></span></a></li>`).join("\n")}
</ol>`;
}

function crumbs(p) {
  const t = i18n.zh;
  const section = p.section === "writing" ? p.group : p.section;
  const parts = [`<a href="${BASE}#${section}">${esc(t.sections[section])}</a>`];
  if (p.parent) parts.push(`<a href="${urlOf(bySlug[p.parent])}">${esc(bySlug[p.parent].zh)}</a>`);
  return `<nav class="crumbs" aria-label="面包屑">${parts.join('<span aria-hidden="true">/</span>')}</nav>`;
}

function articlePage(p) {
  const t = i18n.zh;
  const d = data[p.id];
  const url = SITE + urlOf(p);
  const ctx = {
    media: `${BASE}media/`,
    resolveLink: resolver(p),
    collection: (n) => (p.slug === "rereading-hig" ? chapterList() : null),
  };
  const bodyHtml = renderBlocks(d.body, ctx);
  const text = textOf(d.body);
  const description = p.summary ?? (text ? text.slice(0, 110) + (text.length > 110 ? "…" : "") : `${p.zh} · Jeffery Ho`);
  const img = firstImage(d.body);
  const image = img
    ? { url: `${SITE}${BASE}media/${img.file}`, w: img.w, h: img.h, alt: p.zh }
    : p.cover
      ? { url: `${SITE}${BASE}covers/${p.cover}`, w: 1000, h: 562, alt: p.zh }
      : siteImage(t);
  const published = dateOf(p);
  const modified = shDate(d.edited);

  const metaBits = [];
  if (p.section !== "projects" || p.parent) metaBits.push(`<time datetime="${published}">${t.date(published)}</time>`);
  if (p.src) metaBits.push(esc(p.src.zh));
  const metaTable = p.meta
    ? `<dl class="facts">${Object.entries(p.meta).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`
    : "";
  const lead = p.summary && p.section === "projects" ? `<p class="lead">${esc(p.summary)}</p>` : "";
  const external = p.external
    ? `<a class="n-card n-card-source" href="${esc(p.external.href)}" rel="noopener" target="_blank"><span class="n-card-title">${p.external.verb ?? (d.imported ? "原文发布于" : bodyHtml ? "同步发布于" : "阅读原文")} · ${esc(p.external.label)}</span><span class="n-card-host">${esc(new URL(p.external.href).hostname.replace(/^www\./, ""))}</span></a>`
    : "";
  const emptyNote = !bodyHtml && p.external ? `<p class="lead">这篇文章首发于${/^[A-Za-z]/.test(p.external.label) ? " " : ""}${esc(p.external.label)}，正文请阅读原文。</p>` : "";

  let pager = "";
  if (p.parent) {
    const i = chapters.indexOf(p);
    const prev = chapters[i - 1];
    const next = chapters[i + 1];
    pager = `<nav class="pager" aria-label="章节导航">${prev ? `<a class="pager-prev" href="${urlOf(prev)}"><span>上一章</span>${esc(prev.zh)}</a>` : "<span></span>"}${next ? `<a class="pager-next" href="${urlOf(next)}"><span>下一章</span>${esc(next.zh)}</a>` : "<span></span>"}</nav>`;
  }

  const jsonld = {
    "@context": "https://schema.org",
    "@type": p.section === "writing" || p.parent ? "BlogPosting" : "CreativeWork",
    headline: p.zh,
    description,
    url,
    image: image.url,
    inLanguage: "zh-CN",
    datePublished: published,
    dateModified: modified,
    author: PERSON,
  };
  const extra = `
  <meta property="article:published_time" content="${published}">
  <meta property="article:modified_time" content="${modified}">
  <meta property="article:author" content="Jeffery Ho">`;

  return `<!doctype html>
<html lang="zh-CN">
${head({ t, title: `${p.zh} · Jeffery Ho`, description, url, image, alternates: false, type: "article", jsonld, extra })}
<body>
${header(t, { langToggle: false })}

  <main class="wrap article">
    ${crumbs(p)}
    <header class="article-head">
      <h1>${esc(p.zh)}</h1>
      ${metaBits.length ? `<p class="article-meta">${metaBits.join('<span aria-hidden="true">·</span>')}</p>` : ""}
    </header>
    ${metaTable}
    ${lead}
    <div class="prose">
${emptyNote}
${bodyHtml}
    </div>
    ${external}
    ${pager}
  </main>

${footer("zh")}
</body>
</html>
`;
}

// ---------- write ----------

for (const dir of ["projects", "writing", "photography", "about"]) rmSync(join(OUT, dir), { recursive: true, force: true });

const write = (rel, html) => {
  const file = join(OUT, rel, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

write("", homePage("zh"));
write("en", homePage("en"));
for (const p of rendered) write(pagePath(p), articlePage(p));
console.log(`wrote 2 home pages + ${rendered.length} article pages`);

const today = new Date().toISOString().slice(0, 10);
const homeEntry = (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE}${BASE}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${BASE}en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${BASE}"/>
  </url>`;
const articleEntries = rendered.map((p) => `  <url>\n    <loc>${SITE}${urlOf(p)}</loc>\n    <lastmod>${shDate(data[p.id].edited)}</lastmod>\n  </url>`);
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[homeEntry(`${SITE}${BASE}`), homeEntry(`${SITE}${BASE}en/`), ...articleEntries].join("\n")}
</urlset>
`
);
console.log(`wrote sitemap.xml (${2 + articleEntries.length} urls)`);
