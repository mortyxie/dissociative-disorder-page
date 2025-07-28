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
    console.log('语言控制器初始化完成')
    
    // 创建并挂载Vue应用
    const app = createApp(App)
    app.mount('#app')
    
    // 向全局暴露所有控制器，方便调试
    window.Controllers = Controllers
    
    console.log('应用初始化完成')
    console.log('可用的控制器:', Object.keys(Controllers))
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 启动应用
initApp()