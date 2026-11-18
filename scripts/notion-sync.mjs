// Pulls every page in content/pages.mjs from the public Notion site and stores:
//   content/notion/<id>.json   simplified block tree + page facts
//   public/v2/media/<slug>/NN.(jpg|gif)   images, resized to at most 1600px (GIFs kept as-is)
// Usage: NODE_USE_ENV_PROXY=1 node scripts/notion-sync.mjs [slug ...]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pages } from "../content/pages.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOTION = "https://jefferyho.notion.site";
const OUT = join(ROOT, "content", "notion");
const MEDIA = join(ROOT, "public", "v2", "media");
const TMP = join(ROOT, ".cache", "notion-images");

const only = process.argv.slice(2);
const targets = only.length ? pages.filter((p) => only.includes(p.slug)) : pages;

const unwrap = (rec) => rec?.value?.value ?? rec?.value;

async function post(path, body) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(NOTION + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    if (attempt >= 3) throw new Error(`${path} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

async function loadBlocks(pageId) {
  const blocks = {};
  let cursor = { stack: [] };
  let chunkNumber = 0;
  do {
    const data = await post("/api/v3/loadCachedPageChunkV2", {
      page: { id: pageId }, limit: 500, cursor, chunkNumber, verticalColumns: false,
    });
    for (const [id, rec] of Object.entries(data.recordMap?.block ?? {})) {
      const v = unwrap(rec);
      if (v) blocks[id] = v;
    }
    cursor = data.cursor;
    chunkNumber++;
  } while (cursor?.stack?.length);

  // Fetch any referenced child blocks the chunk API left out.
  for (let round = 0; round < 5; round++) {
    const missing = Object.values(blocks)
      .filter((b) => b.type !== "page" || b.id === pageId)
      .flatMap((b) => b.content ?? [])
      .filter((id) => !blocks[id]);
    if (!missing.length) break;
    const data = await post("/api/v3/syncRecordValuesMain", {
      requests: missing.map((id) => ({ pointer: { table: "block", id }, version: -1 })),
    });
    for (const [id, rec] of Object.entries(data.recordMap?.block ?? {})) {
      const v = unwrap(rec);
      if (v) blocks[id] = v;
    }
  }
  return blocks;
}

function sh(cmd, args) {
  return execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();
}

function imageSize(file) {
  const out = sh("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]);
  return { w: Number(/pixelWidth: (\d+)/.exec(out)[1]), h: Number(/pixelHeight: (\d+)/.exec(out)[1]) };
}

async function downloadImage(block, slug, index) {
  const src = block.properties?.source?.[0]?.[0] || block.format?.display_source;
  if (!src) return null;
  const url = `${NOTION}/image/${encodeURIComponent(src)}?table=block&id=${block.id}&cache=v2`;
  let res, buf;
  for (let attempt = 1; ; attempt++) {
    try {
      res = await fetch(url);
      if (!res.ok) {
        console.warn(`  ! image ${block.id} ${res.status}`);
        return null;
      }
      buf = Buffer.from(await res.arrayBuffer());
      break;
    } catch (err) {
      if (attempt >= 4) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  const type = res.headers.get("content-type") || "";
  const name = String(index).padStart(2, "0");
  const dir = join(MEDIA, slug);
  mkdirSync(dir, { recursive: true });
  if (type.includes("gif")) {
    const file = join(dir, `${name}.gif`);
    writeFileSync(file, buf);
    return { file: `${slug}/${name}.gif`, ...imageSize(file) };
  }
  mkdirSync(TMP, { recursive: true });
  const raw = join(TMP, `${block.id}`);
  writeFileSync(raw, buf);
  const file = join(dir, `${name}.jpg`);
  sh("sips", ["-Z", "1600", "-s", "format", "jpeg", "-s", "formatOptions", "78", raw, "--out", file]);
  return { file: `${slug}/${name}.jpg`, ...imageSize(file) };
}

// Simplified node: { t: type, r?: rich text, c?: children, ...type specific }
async function convert(blocks, ids, ctx) {
  const out = [];
  for (const id of ids ?? []) {
    const b = blocks[id];
    if (!b || b.alive === false) continue;
    const p = b.properties ?? {};
    const f = b.format ?? {};
    const node = { t: b.type, id: b.id };
    if (p.title) node.r = p.title;
    if (f.block_color) node.color = f.block_color;
    switch (b.type) {
      case "image": {
        const img = await downloadImage(b, ctx.slug, ++ctx.images);
        if (!img) continue;
        Object.assign(node, img, { caption: p.caption });
        break;
      }
      case "callout":
        node.icon = f.page_icon && !f.page_icon.startsWith("http") ? f.page_icon : undefined;
        break;
      case "bookmark":
        Object.assign(node, { href: p.link?.[0]?.[0], title: p.title?.[0]?.[0], desc: p.description?.[0]?.[0] });
        delete node.r;
        break;
      case "embed":
      case "video":
      case "file":
      case "pdf":
        node.href = p.source?.[0]?.[0] || f.display_source;
        node.caption = p.caption;
        break;
      case "to_do":
        node.checked = p.checked?.[0]?.[0] === "Yes";
        break;
      case "code":
        node.lang = p.language?.[0]?.[0];
        break;
      case "column":
        node.ratio = f.column_ratio;
        break;
      case "table":
        node.header = !!f.table_block_column_header;
        node.cols = f.table_block_column_order ?? [];
        break;
      case "table_row":
        node.cells = p;
        delete node.r;
        break;
      case "page":
      case "link_to_page":
      case "alias":
      case "collection_view":
      case "collection_view_page":
        node.ref = b.type === "alias" ? f.alias_pointer?.id : b.type === "link_to_page" ? p.page?.[0]?.[0] ?? b.id : b.id;
        node.title = p.title ? p.title.map((s) => s[0]).join("") : undefined;
        out.push(node);
        continue; // never descend into other pages
    }
    if (b.content?.length && b.type !== "page") node.c = await convert(blocks, b.content, ctx);
    out.push(node);
  }
  return out;
}

const report = [];
for (const page of targets) {
  process.stdout.write(`${page.slug} ... `);
  const blocks = await loadBlocks(page.id);
  const root = blocks[page.id];
  if (!root) throw new Error(`page ${page.id} not found`);
  rmSync(join(MEDIA, page.slug), { recursive: true, force: true });
  const ctx = { slug: page.slug, images: 0 };
  const body = await convert(blocks, root.content, ctx);
  const titles = Object.fromEntries(
    Object.values(blocks).filter((b) => b.type === "page" && b.properties?.title).map((b) => [b.id, b.properties.title.map((s) => s[0]).join("")])
  );
  const data = {
    id: page.id,
    title: (root.properties?.title ?? []).map((s) => s[0]).join(""),
    icon: root.format?.page_icon && !root.format.page_icon.startsWith("http") ? root.format.page_icon : undefined,
    created: new Date(root.created_time).toISOString(),
    edited: new Date(root.last_edited_time).toISOString(),
    titles,
    body,
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${page.id}.json`), JSON.stringify(data, null, 1) + "\n");
  const types = {};
  (function walk(ns) { for (const n of ns) { types[n.t] = (types[n.t] ?? 0) + 1; if (n.c) walk(n.c); } })(body);
  report.push({ slug: page.slug, images: ctx.images, types });
  console.log(`${ctx.images} images, ${Object.entries(types).map(([k, v]) => `${k}:${v}`).join(" ")}`);
}

if (!existsSync(join(ROOT, ".cache"))) mkdirSync(join(ROOT, ".cache"));
writeFileSync(join(ROOT, ".cache", "notion-sync-report.json"), JSON.stringify(report, null, 1));
