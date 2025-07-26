// 浏览器版本检测控制器
import { ref } from 'vue'

class BrowserVersionController {
  constructor() {
    // Vue 响应式数据
    this.isDesktop = ref(true)
    this.deviceType = ref('desktop')
    this.screenWidth = ref(window.innerWidth)
    
    this.callbacks = []
    this.init()
  }

  // 初始化
  init() {
    this.detectDevice()
    window.addEventListener('resize', () => this.handleResize())
  }

  // 设备检测核心逻辑
  detectDevice() {
    const width = window.innerWidth
    this.screenWidth.value = width
    
    // 基于屏幕宽度和用户代理的综合判断
    const isMobileWidth = width <= 768
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent) && width >= 768
    
    let newDeviceType
    let newIsDesktop
    
    if (isMobileUA && !isTablet) {
      newDeviceType = 'mobile'
      newIsDesktop = false
    } else if (isTablet) {
      newDeviceType = 'tablet'
      newIsDesktop = false
    } else if (isMobileWidth) {
      newDeviceType = 'mobile'
      newIsDesktop = false
    } else {
      newDeviceType = 'desktop'
      newIsDesktop = true
    }
    
    // 更新响应式数据
    this.deviceType.value = newDeviceType
    this.isDesktop.value = newIsDesktop
    
    // 如果设备类型发生变化，触发回调
    this.notifyCallbacks()
    
    console.log(`设备检测结果: ${newDeviceType}, 屏幕宽度: ${width}px`)
  }

  // 窗口大小变化处理
  handleResize() {
    this.detectDevice()
  }

  // 注册设备变化回调
  onDeviceChange(callback) {
    this.callbacks.push(callback)
  }

  // 移除回调
  offDeviceChange(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  // 通知所有回调
  notifyCallbacks() {
    this.callbacks.forEach(callback => {
      callback(this.deviceType.value, this.isDesktop.value)
    })
  }

  // 获取响应式数据的方法
  getReactiveData() {
    return {
      isDesktop: this.isDesktop,
      deviceType: this.deviceType,
      screenWidth: this.screenWidth
    }
  }

  // 公共方法（向后兼容）
  isDesktopBrowser() {
    return this.isDesktop.value
  }

  isMobileBrowser() {
    return !this.isDesktop.value
  }

  getDeviceType() {
    return this.deviceType.value
  }

  getScreenWidth() {
    return this.screenWidth.value
  }
}

// 创建全局实例
const browserVersionController = new BrowserVersionController()

// 向全局暴露
window.BrowserVersionController = browserVersionController

// 导出函数
export {
  browserVersionController as default,
  browserVersionController
}

// 向后兼容的导出
export function isDesktopBrowser() {
  return browserVersionController.isDesktopBrowser()
}

export function isMobileBrowser() {
  return browserVersionController.isMobileBrowser()
}