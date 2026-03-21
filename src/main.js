import { createApp } from 'vue'
import App from '@/app/App.vue'
import { router } from '@/router'
import * as Controllers from '@/controllers'
import languageController from '@/controllers/LanguageController.js'
import { applyDesignTokensToDocument } from '@/config/theme.js'
import '@/styles/main.css'
import '@/styles/fonts.css'

applyDesignTokensToDocument()

// 简化的应用初始化
async function initApp() {
  try {
    // 首先初始化语言控制器
    await languageController.initialize()

    // 创建并挂载Vue应用
    const app = createApp(App)
    app.use(router)
    app.mount('#app')

    // 向全局暴露所有控制器，方便调试
    window.Controllers = Controllers
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 启动应用
initApp()
