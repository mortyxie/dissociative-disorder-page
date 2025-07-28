import { createApp } from 'vue'
import App from '/src/App.vue'
import * as Controllers from '/src/script'
import languageController from '/src/script/LanguageController.js'
import '/src/style.css'
import '/src/config/fonts.css'

// 简化的应用初始化
async function initApp() {
  try {
    // 首先初始化语言控制器
    await languageController.initialize()
    
    // 创建并挂载Vue应用
    const app = createApp(App)
    app.mount('#app')
    
    // 向全局暴露所有控制器，方便调试
    window.Controllers = Controllers

  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 启动应用
initApp()