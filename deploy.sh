#!/bin/bash

# GitHub Pages 部署脚本
# 此脚本将dev分支的更改合并到main分支并触发GitHub Pages部署

echo "🚀 开始准备GitHub Pages部署..."

# 检查当前分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "dev" ]; then
    echo "❌ 请在dev分支上运行此脚本"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 请先提交所有更改到dev分支"
    exit 1
fi

# 确认部署
echo "📋 即将将dev分支的更改部署到GitHub Pages"
echo "🌐 部署地址: https://mortyxie.github.io/dissociative-disorder-page/"
echo ""
read -p "确认部署? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ 部署已取消"
    exit 1
fi

# 切换到main分支
echo "🔄 切换到main分支..."
git checkout main

# 合并dev分支的更改
echo "🔀 合并dev分支..."
git merge dev --no-ff -m "Deploy: merge dev branch for GitHub Pages"

# 推送到远程main分支
echo "📤 推送到GitHub..."
git push origin main

# 切换回dev分支
echo "🔄 切换回dev分支..."
git checkout dev

echo "✅ 部署完成!"
echo "🌐 请等待几分钟，然后访问: https://mortyxie.github.io/dissociative-disorder-page/"
echo "📊 GitHub Actions状态: https://github.com/mortyxie/dissociative-disorder-page/actions"
