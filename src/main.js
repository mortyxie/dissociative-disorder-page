import { createApp } from 'vue'
import App from '/src/App.vue'
import * as Controllers from '/src/script'
import '/src/style.css'

// 简化的应用初始化
function initApp() {
  try {
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