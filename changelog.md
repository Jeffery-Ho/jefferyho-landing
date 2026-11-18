# Changelog

## 2026-11-18 · 站内链接打开加速

- 预渲染：每页加入 Speculation Rules，悬停站内 `/v2/` 链接约 200ms 即在后台预渲染目标页（Chrome / Edge），点击后几乎立即显示。
- 兜底预取：不支持 Speculation Rules 的浏览器（Safari、Firefox）在悬停或触摸链接时用 `<link rel="prefetch">` 预取页面，每个地址只取一次。
- 缓存：`site.css` / `site.js` 引用带内容哈希 `?v=`，Worker 对其返回一年 immutable 缓存；图片缓存 7 天（另加 1 天 stale-while-revalidate），跳转时不再逐个回源校验。HTML 仍每次校验，改动即时生效。

验证方式：本地 `wrangler dev` curl 核对页面、带版本 CSS、图片、404 的缓存头；内置浏览器确认规则存在、控制台无错误，模拟不支持 Speculation Rules 时悬停会插入预取且去重。内置浏览器（Electron）不执行预渲染，Chrome 中的预渲染效果未实测。

## 2026-11-18 · 外部原文搬到站内

- Weekly 19、Weekly 20（Quaily）与《我的 flomo 心得》（微信公众号「flomo浮墨笔记」）的原文正文与图片导入站内，存于 `content/external/`；Notion 正文为空时构建自动使用导入正文，日期改为原文发布日期，页尾保留「原文发布于」链接。
- 去掉了 Quaily 页面组件（PREMIUM、上一篇/下一篇）和 flomo 编辑的开头征稿语，保留作者自己的结尾。
- 《我的记录战队》（小红书）需要登录才能查看，暂时仍为原文链接。

验证方式：本地 `wrangler dev` 浏览器检查三篇渲染；本地逐个请求 290 个站内资源均 200；部署前后核对路由不变；线上三篇页面及图片 200，`/` 仍为 Notion 首页。

## 2026-11-18 · Notion 内容迁移到站内

- 首页所有条目改为站内页面，不再跳转 Notion：31 个页面，包括 10 个项目、9 篇「重读 HIG」章节、想法与公开分享、摄影、关于。
- 新增 `scripts/notion-sync.mjs`：从公开 Notion 站点拉取页面块与图片，图片缩到 1600px（GIF 原样），存入 `content/notion/` 与 `public/v2/media/`（约 35MB）。
- 新增 `scripts/render-notion.mjs`：渲染标题、段落、列表、引用、标注框、分栏、图片、书签、表格、Notion 颜色等；指向其他已迁移页面的链接改为站内链接。
- 文章页：面包屑、项目信息表、HIG 章节列表与上一章 / 下一章导航；每页独立 title、description、canonical、OG 图（正文首图）与 JSON-LD；sitemap 收录全部页面（33 个 URL）。
- Weekly 22/23/24/26 即「重读 HIG」第二、三、四、七章，首页条目直接指向章节页，并在章节页附 Quaily 原文链接。
- Weekly 19/20、两篇公开分享在 Notion 中只有外部链接，站内页面提供原文链接卡片。
- 首页关注入口改为直达小红书链接。
- 「重读 HIG」第八章仍是草稿且与第七章大部分重复，暂不迁移。

验证方式：本地 `wrangler dev` 浏览器检查项目页、HIG 章节、个人说明书、WWDC26、外链页的渲染与手机宽度；本地与线上逐个请求全部 282 个站内图片与链接均 200；产物中无残留 Notion 链接；部署前后核对路由不变，`/` 仍为 Notion 首页。

## 2026-11-18 · 卡片封面与原图存档

- 项目与摄影的 12 张卡片改用 Notion 页面图片作封面（1000px JPEG，共约 1MB，`public/v2/covers/`），替换原文字占位；悬停轻微放大。
- Notion 页面原图 170 张（141MB）存档到 `archive/notion-media/`，不部署。

验证方式：本地 `wrangler dev` 浏览器检查 12 张封面全部加载、无失败；部署前后核对 zone 路由不变（全站仍为 notion2）；线上 curl `/v2/`、`/v2/en/`、封面与样式均 200，`/` 仍 302 到 Notion 首页。

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
