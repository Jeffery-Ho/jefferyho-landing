// Renders the simplified Notion block tree (content/notion/*.json) to HTML.
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const COLORS = new Set(["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red", "teal"]);
const colorClass = (c) => {
  if (!c || c === "default") return "";
  const [name, bg] = c.split("_");
  return COLORS.has(name) ? `${bg ? "bg" : "fg"}-${name}` : "";
};

const plain = (rich) => (rich ?? []).map((s) => s[0]).join("");

/**
 * ctx: {
 *   media: string (base URL for media files),
 *   resolveLink(href): { href } | { self: true } | null,  // null = drop the link, keep the text
 *   collection(node): string | null,                      // HTML for inline databases
 * }
 */
export function rich(segments, ctx) {
  return (segments ?? [])
    .map(([text, anns = []]) => {
      if (anns.some((a) => a[0] === "u")) return ""; // user mentions
      let html = esc(text).replace(/\n/g, "<br>");
      for (const [k, v] of anns) {
        if (k === "b") html = `<strong>${html}</strong>`;
        else if (k === "i") html = `<em>${html}</em>`;
        else if (k === "s") html = `<s>${html}</s>`;
        else if (k === "_") html = `<u>${html}</u>`;
        else if (k === "c") html = `<code>${html}</code>`;
        else if (k === "h") {
          const cls = colorClass(v);
          if (cls) html = `<span class="${cls}">${html}</span>`;
        }
      }
      const link = anns.find((a) => a[0] === "a");
      if (link) {
        const target = ctx.resolveLink(link[1]);
        if (target?.href) {
          const external = /^https?:/.test(target.href);
          html = `<a href="${esc(target.href)}"${external ? ' rel="noopener" target="_blank"' : ""}>${html}</a>`;
        }
      }
      return html;
    })
    .join("");
}

function image(n, ctx) {
  const alt = plain(n.caption);
  const cap = n.caption?.length ? `<figcaption>${rich(n.caption, ctx)}</figcaption>` : "";
  return `<figure class="n-image"><img src="${ctx.media}${esc(n.file)}" width="${n.w}" height="${n.h}" alt="${esc(alt)}" loading="lazy" decoding="async">${cap}</figure>`;
}

function host(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function linkCard(href, title, desc) {
  if (!href) return "";
  const d = desc ? `<span class="n-card-desc">${esc(desc.length > 120 ? desc.slice(0, 120) + "…" : desc)}</span>` : "";
  return `<a class="n-card" href="${esc(href)}" rel="noopener" target="_blank"><span class="n-card-title">${esc(title || host(href))}</span>${d}<span class="n-card-host">${esc(host(href))}</span></a>`;
}

export function renderBlocks(nodes, ctx) {
  const out = [];
  for (let i = 0; i < (nodes ?? []).length; i++) {
    const n = nodes[i];
    // Group consecutive list items.
    if (n.t === "bulleted_list" || n.t === "numbered_list" || n.t === "to_do") {
      const tag = n.t === "numbered_list" ? "ol" : "ul";
      const items = [];
      while (i < nodes.length && nodes[i].t === n.t) {
        const it = nodes[i];
        const box = it.t === "to_do" ? `<input type="checkbox" disabled${it.checked ? " checked" : ""}> ` : "";
        items.push(`<li>${box}${rich(it.r, ctx)}${it.c ? renderBlocks(it.c, ctx) : ""}</li>`);
        i++;
      }
      i--;
      out.push(`<${tag}${n.t === "to_do" ? ' class="n-todo"' : ""}>${items.join("")}</${tag}>`);
      continue;
    }
    const cls = colorClass(n.color);
    const kids = n.c ? renderBlocks(n.c, ctx) : "";
    switch (n.t) {
      case "text": {
        const html = rich(n.r, ctx);
        if (html.trim()) out.push(`<p${cls ? ` class="${cls}"` : ""}>${html}</p>`);
        if (kids) out.push(`<div class="n-indent">${kids}</div>`);
        break;
      }
      case "header":
      case "sub_header":
        out.push(`<h2${cls ? ` class="${cls}"` : ""}>${rich(n.r, ctx)}</h2>`);
        break;
      case "sub_sub_header":
        out.push(`<h3${cls ? ` class="${cls}"` : ""}>${rich(n.r, ctx)}</h3>`);
        break;
      case "header_4":
        out.push(`<h4${cls ? ` class="${cls}"` : ""}>${rich(n.r, ctx)}</h4>`);
        break;
      case "quote":
        out.push(`<blockquote>${n.r ? `<p>${rich(n.r, ctx)}</p>` : ""}${kids}</blockquote>`);
        break;
      case "callout":
        out.push(
          `<div class="n-callout${cls ? " " + cls : ""}">${n.icon ? `<span class="n-callout-icon" aria-hidden="true">${esc(n.icon)}</span>` : ""}<div>${n.r ? `<p>${rich(n.r, ctx)}</p>` : ""}${kids}</div></div>`
        );
        break;
      case "toggle":
        out.push(`<details class="n-toggle"><summary>${rich(n.r, ctx)}</summary>${kids}</details>`);
        break;
      case "divider":
        out.push("<hr>");
        break;
      case "image":
        out.push(image(n, ctx));
        break;
      case "bookmark":
        out.push(linkCard(n.href, n.title, n.desc));
        break;
      case "embed":
      case "video":
      case "file":
      case "pdf":
        if (n.href) out.push(linkCard(n.href, plain(n.caption) || null));
        break;
      case "code":
        out.push(`<pre class="n-code"><code>${esc(plain(n.r))}</code></pre>`);
        break;
      case "column_list": {
        const cols = (n.c ?? []).filter((c) => c.t === "column");
        const total = cols.reduce((s, c) => s + (c.ratio ?? 1 / cols.length), 0);
        const tmpl = cols.map((c) => `${(((c.ratio ?? 1 / cols.length) / total) * 100).toFixed(2)}fr`).join(" ");
        out.push(
          `<div class="n-columns" style="--cols:${tmpl}">${cols.map((c) => `<div class="n-column">${renderBlocks(c.c, ctx)}</div>`).join("")}</div>`
        );
        break;
      }
      case "column":
        out.push(`<div class="n-column">${kids}</div>`);
        break;
      case "table": {
        const rows = (n.c ?? []).filter((r) => r.t === "table_row");
        const cell = (r, col, tag) => `<${tag}>${rich(r.cells?.[col], ctx)}</${tag}>`;
        const body = rows
          .map((r, ri) => `<tr>${n.cols.map((col) => cell(r, col, n.header && ri === 0 ? "th" : "td")).join("")}</tr>`)
          .join("");
        out.push(`<div class="n-table"><table>${body}</table></div>`);
        break;
      }
      case "collection_view":
      case "collection_view_page": {
        const html = ctx.collection?.(n);
        if (html) out.push(html);
        break;
      }
      case "page":
      case "link_to_page":
      case "alias": {
        const target = ctx.resolveLink(`/${String(n.ref).replace(/-/g, "")}`);
        if (target?.href) out.push(`<a class="n-card n-card-page" href="${esc(target.href)}"><span class="n-card-title">${esc(n.title || "")}</span></a>`);
        break;
      }
      default:
        if (n.r) out.push(`<p>${rich(n.r, ctx)}</p>`);
        if (kids) out.push(kids);
    }
  }
  return out.join("\n");
}

export function textOf(nodes) {
  const parts = [];
  (function walk(ns) {
    for (const n of ns ?? []) {
      if (n.r && n.t !== "image") parts.push(plain(n.r));
      if (n.c) walk(n.c);
    }
  })(nodes);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function firstImage(nodes) {
  let found = null;
  (function walk(ns) {
    for (const n of ns ?? []) {
      if (found) return;
      if (n.t === "image" && !n.file.endsWith(".gif")) found = n;
      else if (n.c) walk(n.c);
    }
  })(nodes);
  return found;
}
