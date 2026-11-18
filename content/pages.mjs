// Every page migrated from Notion, with the editorial metadata Notion does not hold.
// `id` is the Notion page ID; the body comes from content/notion/<id>.json (scripts/notion-sync.mjs).
// section: projects | writing | photography | about. Writing entries carry `group` (thoughts | public).

const QUAILY = "https://quaily.com/jefferystudio/p/";
const dashed = (h) => `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

export const pages = [
  // Projects
  {
    id: "34a8557f-73f4-4a98-a931-82959147364b", section: "projects", slug: "rereading-hig",
    zh: "重读 HIG", en: "Revisiting HIG", cover: "hig.jpg", d: { zh: "系列文章", en: "Article series" },
    summary: "持续重读 Apple Human Interface Guidelines，把设计原则整理成一组公开写作。",
    meta: { 状态: "进行中", 类型: "个人研究" },
  },
  {
    id: "7e3db60d-0af7-49b2-9547-18c2f08fc2c6", section: "projects", slug: "xiaobot-column",
    zh: "小报童付费专栏", en: "Paid column on Xiaobaotong", cover: "column.jpg", d: { zh: "专栏", en: "Column" },
    summary: "围绕产品设计、记录与个人成长建立的付费内容专栏。",
    meta: { 状态: "已上线", 类型: "个人项目" },
  },
  {
    id: "ef52ccb0-6311-414c-b9bf-72c77bb64173", section: "projects", slug: "telegram-design-channel",
    zh: "Telegram 设计分享频道", en: "Telegram design channel", cover: "telegram.jpg", d: { zh: "频道", en: "Channel" },
    summary: "在 Telegram 持续整理和分享设计、产品与工具信息。",
    meta: { 状态: "已上线", 入口: "24PX's Channel" },
  },
  {
    id: "da64dd8a-09b4-4880-b288-616044a57c6e", section: "projects", slug: "iot-open-platform",
    zh: "物联网开放平台", en: "IoT open platform", cover: "iot.jpg", d: { zh: "平台设计", en: "Platform design" },
    summary: "公司年度重点项目，通过把握设计调性、规则和引导、简化复杂任务构成第一版，已上线，个人职级获得晋级。",
    meta: { 状态: "已上线", 公司: "中海物业", 团队: "500+", 周期: "2022.03 — 2022.08", 类型: "B 端 · Web · UX" },
  },
  {
    id: "32202039-af88-4528-9ef5-8f382b237888", section: "projects", slug: "indoor-gateway-control-panel",
    zh: "室内网关中控屏", en: "Indoor gateway control panel", cover: "gateway.jpg", d: { zh: "智能硬件", en: "Smart hardware" },
    summary: "10 寸中控屏交互设计，侧重点在补全功能和主页改版。",
    meta: { 状态: "已完成", 公司: "中海物业", 团队: "500+", 周期: "2022.01 — 2022.07", 类型: "B 端 · 硬件 · UX" },
  },
  {
    id: "57db2dc8-2f3e-484e-8bec-0c766a3654d6", section: "projects", slug: "cmb-tiangong-design-exploration",
    zh: "招商银行 · 天工设计平台的设计探索", en: "China Merchants Bank · Tiangong design platform exploration", cover: "cmb-exploration.jpg", d: { zh: "设计探索", en: "Design exploration" },
    summary: "面向招商银行活动运营场景，探索一款提升设计效率、释放运营资源的智能设计工具。",
    meta: { 状态: "已完成", 团队: "50+", 周期: "2019.08 — 2020.04", 类型: "C 端 · Web · UX" },
  },
  {
    id: "41104488-5ef5-4e41-ad70-b5eed9068935", section: "projects", slug: "oppo-coloros-community",
    zh: "OPPO ColorOS 社区设计", en: "OPPO ColorOS community design", cover: "coloros.jpg", d: { zh: "社区设计", en: "Community design" },
    summary: "为 ColorOS 团队打造新版社区，负责整体视觉设计、视觉走查与项目交付。",
    meta: { 状态: "已完成", 团队: "50+", 周期: "2020.04 — 2020.09", 类型: "C 端 · Web · UI" },
  },
  {
    id: "b83ed0d1-c222-4018-ae1e-593e73c1f023", section: "projects", slug: "cms-trading-master",
    zh: "招商证券 · 交易大师交互体验优化提案", en: "China Merchants Securities · Trading app UX proposal", cover: "cms-trading.jpg", d: { zh: "提案", en: "Proposal" },
    summary: "为招商证券交易大师平台提供改版方案，在与竞争公司比稿中讲述方案并赢得合作。",
    meta: { 状态: "已完成", 团队: "50+", 周期: "2019.12 — 2020.05", 类型: "C 端 · 设计提案 · Windows" },
  },
  {
    id: "af7a191d-32f1-4aec-9802-5e9dd2254082", section: "projects", slug: "tencent-healthcare-website",
    zh: "腾讯 · 医疗健康官网设计策略提案", en: "Tencent · Healthcare website design strategy", cover: "tencent-health.jpg", d: { zh: "提案", en: "Proposal" },
    summary: "为腾讯医疗健康官网提出视觉与信息策略，在咨询项目中形成可落地的设计方向。",
    meta: { 状态: "已完成", 团队: "50+", 日期: "2019.05", 类型: "设计提案 · Web · UI" },
  },
  {
    id: "4de2c030-5826-4efe-8fff-23a75b8f901a", section: "projects", slug: "cmb-tiangong-proposal",
    zh: "招商银行 · 天工设计平台提案", en: "China Merchants Bank · Tiangong design platform proposal", cover: "cmb-proposal.jpg", d: { zh: "提案", en: "Proposal" },
    summary: "在设计咨询公司期间完成的代表性提案，为客户与团队带来方法和设计沉淀。",
    meta: { 状态: "已完成", 团队: "50+", 日期: "2019.05", 类型: "C 端 · 设计提案 · 产品策划" },
  },

  // Revisiting HIG chapters (rows of the inline database on the Revisiting HIG page)
  ...[
    ["978c89f265cb40f3a3c36f8a55d6f4f4", "intro", "写在开头", "Introduction"],
    ["1d2b004aa6db48f485b5181ae043e45c", "new-architecture", "新的 HIG 架构", "The new HIG structure"],
    ["452b1756619442cbbdbe84091dde5d29", "platforms", "（一）Platforms", "(1) Platforms"],
    ["1f423762cf874793bdee39014f5c1807", "accessibility", "（二）Foundations / Accessibility", "(2) Foundations / Accessibility", "weekly-22-revisit-hig-2-accessibility"],
    ["41b6b7f24e7043d8833ea439048379f0", "app-icons-brand-color", "（三）Foundations / App icons、Brand、Color", "(3) Foundations / App icons, Brand, Color", "weekly-23-revisiting-hig-3-app-icons-brand-color"],
    ["94efbbc9865e45d5a6a59fdb889892bb", "dark-mode-icons", "（四）Foundations / Dark Mode、Icons", "(4) Foundations / Dark Mode, Icons", "weekly-24-revisit-hig-4-dark-mode-icons"],
    ["6d5fc46e1b214f7f96c5287c35782abe", "images-inclusion", "（五）Foundations / Images、Inclusion", "(5) Foundations / Images, Inclusion"],
    ["7ce4bcd3c6d740bda9a4f0e5c9ceff87", "layout-materials", "（六）Foundations / Layout、Materials", "(6) Foundations / Layout, Materials"],
    ["af3e46523cc64d60a7dbcec684c5b0da", "motion-right-to-left", "（七）Foundations / Motion、Right to left", "(7) Foundations / Motion, Right to left", "weekly-26-hig-revisit-motion-right-to-left"],
    // （八）SF Symbols、Typography (a689d724…) is still a draft that mostly duplicates chapter 7 — not migrated.
  ].map(([hex, slug, zh, en, quaily]) => ({
    id: dashed(hex), section: "projects", parent: "rereading-hig", slug, zh, en,
    external: quaily ? { href: QUAILY + quaily, label: "Quaily Newsletter" } : undefined,
  })),

  // Writing · Thoughts
  { id: "3652fd95-f55e-801c-b2b6-f57db7801d93", section: "writing", group: "thoughts", slug: "meditation", zh: "离冥想最近的一次“接触”", en: "My closest brush with meditation" },
  { id: "28d2fd95-f55e-80b1-ab13-e579c40e5339", section: "writing", group: "thoughts", slug: "before-turning-thirty", zh: "写在 30 岁前夕", en: "On the eve of turning 30" },
  { id: "3d2d5f4a-a24f-4177-a6d2-34877021e1c9", section: "writing", group: "thoughts", slug: "weekly-26", zh: "Weekly 26 重读 HIG（七）/ Motion、Right to left", en: "Weekly 26 · Revisiting HIG (7): Motion, Right to left", alias: "projects/rereading-hig/motion-right-to-left" },
  { id: "3ae962f9-ba32-4447-be07-e31335005d13", section: "writing", group: "thoughts", slug: "weekly-24", zh: "Weekly 24 重读 HIG（四）/ Dark Mode、Icons", en: "Weekly 24 · Revisiting HIG (4): Dark Mode, Icons", alias: "projects/rereading-hig/dark-mode-icons" },
  { id: "2de134c9-0864-42ff-9f88-3f8bf52eb393", section: "writing", group: "thoughts", slug: "weekly-23", zh: "Weekly 23 重读 HIG（三）/ App icons、Brand、Color", en: "Weekly 23 · Revisiting HIG (3): App icons, Brand, Color", alias: "projects/rereading-hig/app-icons-brand-color" },
  { id: "c4b1a0df-1f2e-4e91-91f6-188e98e0ad0f", section: "writing", group: "thoughts", slug: "weekly-22", zh: "Weekly 22 重读 HIG（二）/ Accessibility", en: "Weekly 22 · Revisiting HIG (2): Accessibility", alias: "projects/rereading-hig/accessibility" },
  {
    id: "f4429ca7-155f-4998-ae8e-41eb97793607", section: "writing", group: "thoughts", slug: "weekly-20",
    zh: "Weekly 20 从内容分发到工具体验", en: "Weekly 20 · From content distribution to tool experience",
    external: { href: QUAILY + "weekly-20-from-content-distribution-to-tool-experience", label: "Quaily Newsletter" },
  },
  {
    id: "74747545-2466-4e18-8a0e-5bd36428d652", section: "writing", group: "thoughts", slug: "weekly-19",
    zh: "Weekly 19 设计师的面试官心得", en: "Weekly 19 · Notes from interviewing designers",
    external: { href: QUAILY + "weekly-19-designer-interview-tips", label: "Quaily Newsletter" },
  },

  // Writing · In public
  { id: "37b2fd95-f55e-8008-9bff-e84844983b1a", section: "writing", group: "public", slug: "wwdc26", zh: "WWDC26 观后感（设计吐槽 & 期待）", en: "WWDC26 takeaways: design gripes & hopes" },
  {
    id: "acd09984-3f35-45c7-914d-67c1c5b6de72", section: "writing", group: "public", slug: "flomo-notion-yuque",
    zh: "我的 flomo 心得，及 Notion、语雀、flomo 如何搭配使用", en: "My flomo notes, and how I pair Notion, Yuque and flomo",
    src: { zh: "微信公众号", en: "WeChat" },
    external: { href: "https://mp.weixin.qq.com/s/gye5hmJsBTA2ZdWDW39gpw", label: "微信公众号「flomo浮墨笔记」" },
  },
  {
    id: "6141acf3-1e7f-42b4-b22c-abda734d5a66", section: "writing", group: "public", slug: "my-recording-stack",
    zh: "我的记录战队：flomo + 语雀 + Notion", en: "My note-taking stack: flomo + Yuque + Notion",
    src: { zh: "小红书", en: "Xiaohongshu" },
    external: { href: "https://www.xiaohongshu.com/discovery/item/62f4c1b400000000090079d9", label: "小红书" },
  },

  // Photography
  {
    id: "28e2fd95-f55e-80af-b98e-e5103baee850", section: "photography", slug: "nothing-ear-1",
    zh: "Nothing ear (1)", en: "Nothing ear (1)", cover: "nothing-ear.jpg", d: { zh: "收获了 Nothing CEO 的点赞", en: "Got a like from the Nothing CEO" },
    summary: "一组 Nothing ear (1) 产品摄影，收获了 Nothing CEO 的点赞。",
  },
  {
    id: "28e2fd95-f55e-8092-a653-faf72b6db165", section: "photography", slug: "unsplash-2020",
    zh: "Unsplash 2020", en: "Unsplash 2020", cover: "unsplash-2020.jpg", d: { zh: "Interiors 类别入围", en: "Finalist, Interiors category" },
    summary: "Unsplash Awards 2020 Interiors 类别入围作品。",
    external: { href: "https://awards.unsplash.com/2020/#/interiors", label: "Unsplash Awards 2020", verb: "入围页面" },
  },

  // About
  { id: "90008a05-eb1c-4c1a-a077-b126993d6b0a", section: "about", slug: "personal-manual", zh: "个人说明书", en: "A user manual for me", date: "2022-09-23" },
  { id: "6cc3629e-5d22-4463-bd8a-723a29237028", section: "about", slug: "personal-swot", zh: "基于 SWOT 分析自己", en: "A SWOT analysis of myself", date: "2022-09-23" },
  { id: "12a7ce80-d37d-4d7f-a757-0135c495d1f9", section: "about", slug: "creativity-questions", zh: "和创造力有关的 6 个问题", en: "6 questions about creativity", date: "2022-09-23" },
];

export const pagePath = (p) => (p.parent ? `${p.section}/${p.parent}/${p.slug}/` : `${p.section}/${p.slug}/`);
