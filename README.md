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

## 部署到 GitHub Pages

### 自动部署（推荐）

1. 确保所有更改都已提交到 `dev` 分支
2. 运行部署命令：
   ```bash
   npm run deploy
   ```
3. 脚本会自动：
   - 检查当前是否在 `dev` 分支
   - 检查是否有未提交的更改
   - 将 `dev` 分支合并到 `main` 分支
   - 推送到 GitHub 触发自动部署

### 访问网站

部署完成后，访问：https://mortyxie.github.io/dissociative-disorder-page/

### 分支管理

- `dev` - 开发分支，所有开发工作在此进行
- `main` - 生产分支，用于 GitHub Pages 部署

### 注意事项

- 请始终在 `dev` 分支进行开发
- 只有在准备发布时才合并到 `main` 分支
- GitHub Actions 会自动构建和部署 `main` 分支的更改

## 技术栈

- Vue 3
- Vite
- Tailwind CSS
- Vue I18n

## 项目结构

```
src/
├── components/           # Vue组件
│   ├── features/        # 功能组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI组件
├── config/              # 配置文件
├── i18n/                # 国际化文件
└── script/              # 脚本文件
```
