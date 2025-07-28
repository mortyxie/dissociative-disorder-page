@echo off
echo 🚀 开始准备GitHub Pages部署...

REM 检查当前分支
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="dev" (
    echo ❌ 请在dev分支上运行此脚本
    pause
    exit /b 1
)

REM 检查是否有未提交的更改
git status --porcelain > temp_status.txt
for /f %%i in ("temp_status.txt") do set size=%%~zi
del temp_status.txt
if not %size%==0 (
    echo ❌ 请先提交所有更改到dev分支
    pause
    exit /b 1
)

REM 确认部署
echo 📋 即将将dev分支的更改部署到GitHub Pages
echo 🌐 部署地址: https://mortyxie.github.io/dissociative-disorder-page/
echo.
set /p confirm=确认部署? (y/N): 

if /i not "%confirm%"=="y" (
    echo ❌ 部署已取消
    pause
    exit /b 1
)

REM 切换到main分支
echo 🔄 切换到main分支...
git checkout main

REM 合并dev分支的更改
echo 🔀 合并dev分支...
git merge dev --no-ff -m "Deploy: merge dev branch for GitHub Pages"

REM 推送到远程main分支
echo 📤 推送到GitHub...
git push origin main

REM 切换回dev分支
echo 🔄 切换回dev分支...
git checkout dev

echo ✅ 部署完成!
echo 🌐 请等待几分钟，然后访问: https://mortyxie.github.io/dissociative-disorder-page/
echo 📊 GitHub Actions状态: https://github.com/mortyxie/dissociative-disorder-page/actions
pause
