# Dissociative Disorder Page

一个互动式网页项目，展示分离性身份障碍的体验。

## 开发环境

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 路由与主要页面

| 路径 | 说明 |
|------|------|
| `/`、`/homi` | 主页 |
| `/compass` | 重定向到 `/compass/stars` |
| `/compass/stars` | 个人知识库 · 星盘（取景器、星点、缩放条） |
| `/compass/timeline` | 个人知识库 · 时间线 |

全站顶栏「个人知识库」链接指向 `/compass/stars`。路由定义见 `src/router/index.js`。

## Compass（个人知识库）模块 — 后续维护速查

### 目录与职责

| 路径 | 职责 |
|------|------|
| `src/views/compass/CompassLayout.vue` | Compass 壳层：顶栏子导航、右下角操作（添加记录、星盘手势开关、BGM 静音）、`provide` 编辑器与手势开关、**BGM**（`BGM_Enemy.mp3` + 自动播放策略 + `localStorage` `compass_bgm_muted_v1`） |
| `src/views/compass/CompassStarsView.vue` | 星盘画布、缩放刻度、星线/拖拽、`openPreview` |
| `src/views/compass/CompassTimelineView.vue` | 时间线分组与搜索 |
| `src/components/compass/CompassRecordEditorModal.vue` | 新建/编辑/只读预览、Markdown 与富文本 |
| `src/components/compass/CompassTimelineRecordItem.vue` | 单条时间线卡片，点击 `openPreview` |
| `src/components/compass/CompassAuthPanel.vue` | 登录/注册（`Teleport` 到 `body`） |
| `src/composables/useCompassRecords.js` | 记录、标签、星位、本地持久化（登录用户）；访客示例数据 |
| `src/composables/useCompassAuth.js` | 会话与本地用户存储 |

### `inject` / `provide`（Layout 提供）

- `compassRecordEditor`：`openNew`、`openPreview`、`openEdit`
- `compassShowViewfinderHands`：星盘两侧手势图开关

### 设计令牌与字体

- 主题与 Compass 颜色：`src/config/theme.js`（含 `applyDesignTokensToDocument`）
- 点阵字体与工具类：`src/styles/fonts.css`（`.font-boutique-primary` 等）
- Compass 内根节点已统一使用预设字体；弹层在 `Teleport` 内需单独加类（见各组件）

### 静态资源

- BGM：`src/assets/music/BGM_Enemy.mp3`
- 星盘音效/素材：`src/assets/music/`、`src/assets/img/`（取景器与手型图等）

### 行为说明（易踩坑）

- **BGM 自动播放**：浏览器通常禁止无用户手势的有声自动播放。实现上先尝试有声 `play()`，失败则静音 `play()`，再在首次 `pointerdown`/`keydown` 后恢复音量（见 `CompassLayout.vue`）。
- **记录预览**：星盘/时间线点击记录默认 `openPreview`；新建仍为直接编辑。

## 部署到 GitHub Pages

### 自动部署（推荐）

仓库内 `deploy.sh` 设计为：在 **`dev`** 分支、工作区干净时，合并 `dev` → `main` 并 `git push origin main`。

```bash
npm run deploy
```

（Windows 会调用 `deploy.bat`，若存在；否则可在 Git Bash 中执行 `bash deploy.sh`。）

若你实际在 **`framework`** 等分支开发，发布前请手动合并到 `main` 再推送，或把脚本里的分支名改成当前主开发分支。

### 访问网站

部署完成后：https://mortyxie.github.io/dissociative-disorder-page/

### 分支说明

- **`main`**：生产分支，对接 GitHub Pages / Actions 构建部署。
- **`dev`**（脚本约定）：历史文档中的主开发分支名。
- **`framework`**：若仓库中实际使用该分支开发，合并到 `main` 的流程与 `dev` 相同：`git checkout main && git merge <你的开发分支> && git push origin main`。

### 注意事项

- 发布前尽量在 `npm run build` 无报错后再合并 `main`。
- 合并 `main` 后推送会触发远端构建；可在仓库 Actions 中查看进度。

## 技术栈

- Vue 3（`<script setup>`、Composition API）
- Vue Router 4
- Vite 7
- Tailwind CSS 4
- Vue I18n

## 项目结构（节选）

```
src/
├── app/                 # 应用根壳
├── assets/              # 图片、音频等
├── components/
│   ├── compass/         # 个人知识库专用组件
│   ├── features/        # 各功能区块
│   ├── layout/
│   └── ui/
├── composables/         # useCompassRecords、useCompassAuth 等
├── config/              # theme、siteNav
├── i18n/
├── router/
├── styles/              # main.css、fonts.css、design-system.css
├── utils/               # Markdown、富文本同步等
└── views/
    └── compass/         # Compass 页面
```
