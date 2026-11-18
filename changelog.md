# Changelog

## 2026-11-18 · v2 独立 Worker

- `jefferyho-landing` 只绑定 `jefferyho.com/v2*` 与 `www.jefferyho.com/v2*`；全站路由交还 `notion2`，`/`、Notion 页面、根目录 sitemap 与 robots 恢复原状。
- v2 的样式、脚本、头像、分享图、图标全部移到 `/v2/` 下；新增 `/v2/sitemap.xml`（仅列 `/v2/`、`/v2/en/`）；去掉根目录 robots.txt / sitemap.xml 与对 `notion2` 的 Service Binding。
- 部署时发生约 1 分钟中断：wrangler 部署删除了不在配置中的全站路由，已立即为 `notion2` 重建。

验证方式：线上 curl，`/` 302 到 Notion 首页、Notion 详情页 200、根 sitemap/robots 为 notion2 原版；`/v2/`、`/v2/en/`、`/v2/og.png`、`/v2/assets/site.css`、`/v2/sitemap.xml` 均 200，www/v2 301 到 apex；浏览器确认 `/v2/` 样式与图片加载无失败请求。

## 2026-11-18 · 新首页移到 /v2

- 新页面改为 `https://jefferyho.com/v2/`（英文 `/v2/en/`），`/` 恢复为 Notion 首页。
- canonical、hreflang、og:url、JSON-LD 与页内链接改为 `/v2/` 路径。
- sitemap 改列 Notion 首页最终地址（`/Jeffery-Studio-…`）、`/v2/`、`/v2/en/` 与 Notion 详情页；不再列会 302 的 `/`。

验证方式：部署后线上实测，`/` 302 到 Notion 首页且正常渲染，`/v2` 307 到 `/v2/` 返回 200，`/v2/en/` 200，www 301 到 apex，sitemap 通过 `xmllint` 校验。

## 2026-11-18 · v2

- 新首页：参考 Notion 首页重新整理内容（简介、想法、公开分享、项目、摄影、关于、联系方式），深色卡片风格，分类筛选。
- 中英双语：`/`（中文）与 `/en/`（英文），hreflang 互指。
- 深浅色模式：默认跟随系统，可手动切换并记住选择。
- 头像：使用插画头像（白底圆形），用于页头、首屏、favicon、apple-touch-icon 与分享图。
- 元信息：title、description、canonical、Open Graph、Twitter Card、JSON-LD Person、favicon、apple-touch-icon；中英各一张 1200x630 分享图。
- 规范域名统一为 `https://jefferyho.com`：Worker 将 www 301 到 apex。
- sitemap 只列最终可索引地址（首页中英版 + Notion 详情页，均直接 200，无查询参数）；robots.txt 指向 sitemap。
- Worker：首页与元信息文件由 v2 提供，其余路径通过 Service Binding 交给现有的 `notion2` Worker（代理 jefferyho.notion.site）。
- 已部署：两条路由从 `notion2` 切换到 `jefferyho-landing`。

验证方式：`wrangler dev` 本地预览 + 内置浏览器检查渲染、主题切换、语言切换、筛选与 `<head>` 元信息；`xmllint` 校验 sitemap；`sips` 核对分享图尺寸；curl 确认 sitemap 中 Notion 页面均返回 200；用模拟环境直接调用 Worker，确认 www 301、资源命中、其余路径透传。部署后线上实测：`/`、`/en/`、sitemap、robots、og.png 均 200；www 301 到 apex；Notion 首页与详情页 200 且在浏览器中正常渲染。
