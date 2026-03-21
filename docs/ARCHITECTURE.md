# 项目架构说明

本文档面向参与本仓库开发与维护的协作者，概括技术栈、目录职责、路由约定与扩展方式。细节实现以代码为准。

## 1. 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3（Composition API、`script setup`） |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS v4（入口见 `src/styles/main.css`） |
| 路由 | Vue Router 4（`history` 模式） |
| 国际化 | vue-i18n（`src/i18n`，CSV 源文件） |

Node 版本需满足 Vite / 官方插件要求（见 `package.json` 与安装时的 engines 提示）。

## 2. 仓库目录结构（`src/`）

```
src/
├── app/                 # 应用壳：根组件 App.vue（全局导航 + RouterView）
├── assets/              # 静态资源（图片、音频、字体、SVG 等）
├── composables/         # 组合式函数（如 Compass 共享记录 useCompassRecords）
├── components/
│   ├── features/        # 按业务功能划分的区块组件（哈雷、Steam、社交等）
│   ├── layout/          # 页面级布局（BrowserVersion、Desktop/MobileLayout）
│   └── ui/              # 可复用 UI（侧边栏、路由导航 AppRouteNav 等）
├── config/              # 主题、外链等配置（非构建配置）
├── controllers/         # 与 Vue 解耦或弱耦合的状态与副作用（音乐、语言、解密逻辑等）
├── i18n/                # 国际化入口与 CSV 数据
├── router/              # 路由表与 router 实例（唯一出口：`export { router }`）
├── styles/              # 全局样式入口、字体定义
├── views/               # 路由级页面（按 URL 挂载，宜保持较薄）
│   └── compass/         # Compass 子布局与子页（星盘、时间线）
└── main.js              # 入口：初始化语言、注册 router、挂载应用
```

**约定简述**

- **`views/`**：只放「整页」组件，与 `path` 对应；内部可组合 `components/layout` 等。
- **`components/`**：可复用块；`layout` 与 `features` 区分「骨架」与「功能岛」。
- **`controllers/`**：历史命名沿用；存放控制器式模块，通过 `controllers/index.js` 聚合导出（便于调试时在 `window.Controllers` 查看）。

路径别名：**`@/`** 指向 `src/`，在 `vite.config.js` 的 `resolve.alias` 中配置。

## 3. 路由与页面

- 路由定义集中在 **`src/router/index.js`**，使用 `createWebHistory`（即 HTML5 History API）。
- 当前路由一览：

| 路径 | 名称 | 视图 | 说明 |
|------|------|------|------|
| `/` | — | — | 重定向至 `/homi` |
| `/homi` | `homi` | `HomeView.vue` | 原有单页体验（BrowserVersion + 桌面/移动布局） |
| `/compass` | — | `compass/CompassLayout.vue` | 个人知识库壳层，默认重定向至 `/compass/stars` |
| `/compass/stars` | `compass-stars` | `compass/CompassStarsView.vue` | 知识星盘（星座槽位 + 散星） |
| `/compass/timeline` | `compass-timeline` | `compass/CompassTimelineView.vue` | 知识时间线（新→旧） |

- 共享记录状态见 **`src/composables/useCompassRecords.js`**（演示用内存数据，后续可换持久化）。

- **`App.vue`** 中挂载 **`AppRouteNav`**（左上角固定）与 **`<RouterView />`**，因此在任意路由下均可切换页面；原有侧边功能按钮仍在 `/homi` 的布局内。

- **`router.afterEach`** 会取**最深层**匹配路由的 `meta.title` 更新 `document.title`。

### 3.1 新增一个页面（协作者 checklist）

1. 在 `src/views/` 新增 `XxxView.vue`。
2. 在 `src/router/index.js` 的 `routes` 中增加一项：`path`、`name`、`component`（建议懒加载：`() => import('@/views/XxxView.vue')`）、可选 `meta.title`。
3. 若需在**左上角全站导航**中增加入口：编辑 **`src/config/siteNav.js`** 的 `siteNavItems`（紧凑横排 `主页 | …`，样式见 `design-system.css` 中 `.app-route-nav--compact`）。
4. 本地执行 `npm run dev`，直接访问新路径验证；生产构建见下文「部署与 History 模式」。

## 4. 国际化（i18n）

- 入口：`src/i18n/index.js`，在 **`main.js`** 挂载应用前会 **`await languageController.initialize()`**，请勿在未完成初始化前假设文案已就绪。
- 语言与点击弹层等 CSV 位于 `src/i18n/csv/`；新增词条时需同步更新 CSV 与使用处。

## 5. 主题、设计令牌与样式

### 5.1 单一数据源（`src/config/theme.js`）

- **`colorTokens`**：主站深色背景、文本、对话框等与 `getColor()` 使用的结构一致（`themeConfig.common.colors` 由此展开）。
- **`compassColorTokens`**：历史浅色示意用令牌；当前 Compass 界面与 homi 一致采用 **`getColor('background','primary')` 深色底 + 白字白线**，若后续再做浅色主题可继续用该组令牌。
- **`navChromeTokens`**：全局左上角 `AppRouteNav` 的玻璃条颜色。
- **`fontTokens`**：`boutiqueStack`（像素字体栈）、`uiStack`（无衬线正文栈）。

### 5.2 CSS 变量注入

- **`applyDesignTokensToDocument()`** 在 **`main.js`** 入口同步执行，将上述令牌写入 `document.documentElement`（例如 `--color-bg-primary`、`--font-ui`、`--compass-page-bg` 等）。
- 全局语义类定义在 **`src/styles/design-system.css`**（由 `main.css` 引入），例如 `.app-route-nav`、`.compass-root`、`.compass-panel`。新页面应优先使用已有类或 `var(--…)`，避免再写一套互不相干的色值。
- **Tailwind**：仍可用于布局与间距；与颜色相关的 utility 若与品牌冲突，请改为令牌或 `design-system.css` 中的类。
- **`fonts.css`**：保留 `@font-face` 与工具类；`.font-boutique-*`、`.font-ui-sans` 使用 `var(--font-boutique)` / `var(--font-ui)`，与 JS 侧一致。

### 5.3 其他配置

- 间距、响应式图片、倒计时等布局细节：仍在 `theme.js` 的 `themeConfig.devices` 中。
- 社交媒体链接与图标：`src/config/socialMediaConfig.js`。

## 6. 构建与本地运行

```bash
npm install
npm run dev      # 开发，默认端口见 vite.config.js（当前为 5174）
npm run build    # 产出 dist/
npm run preview  # 本地预览构建结果
```

## 7. 部署与 History 模式

本应用为 **SPA**：所有前端路由由浏览器端处理。部署到静态托管或自建 Nginx 时，需将 **任意路径** 回退到 **`index.html`**（或由 CDN 配置等价规则），否则用户直接打开或刷新 `/homi`、`/compass` 等深链可能得到 **404**。

开发环境下 Vite 已处理该行为；上线前请与运维确认服务器或平台的 SPA 回退配置。

## 8. 与「个人知识库 / Compass」相关

- 已使用 **`CompassLayout.vue` + `children`**：`/compass/stars`（星盘）、`/compass/timeline`（时间线）；记录数据在 **`useCompassRecords`** 中共享。
- 新增子页：在 `router/index.js` 的 `children` 注册路径，并在 **`CompassLayout.vue`** 侧栏增加 `RouterLink`。

## 9. 协作建议

- 小步提交；路由、i18n、主题变更尽量在 PR 描述中写明，便于评审。
- 避免在 `views` 中堆积复杂业务逻辑；可抽到 **`composables/`** 或 `controllers/`。
- 保持 **`@/`** 别名导入一致，避免再引入新的绝对路径风格混用。

---

文档版本随仓库演进更新；若发现与代码不一致，以代码为准并欢迎更新本文档。
