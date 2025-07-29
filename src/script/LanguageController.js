// 语言控制器 - 统一管理语言相关功能
import { createI18nInstance, getTranslations } from '/src/i18n'

class LanguageController {
  constructor() {
    this.currentLocale = localStorage.getItem('locale') || 'zh-cn'
    this.i18n = null
  }

  // 支持的语言列表
  static SUPPORTED_LOCALES = {
    'zh-cn': '简体中文',
    'zh-mo': '繁體中文',
    'en': 'English'
  }

  // 获取当前语言
  getCurrentLocale() {
    return this.currentLocale
  }

  // 设置当前语言
  setCurrentLocale(locale) {
    this.currentLocale = locale
    localStorage.setItem('locale', locale)
  }

  // 初始化i18n实例
  async initializeI18n() {
    if (!this.i18n) {
      this.i18n = await createI18nInstance()
    }
    return this.i18n
  }

  // 更新页面标题
  async updatePageTitle(locale = null) {
    try {
      const targetLocale = locale || this.currentLocale
      const translations = await getTranslations('languages', targetLocale)
      
      if (translations['web.title']) {
        document.title = translations['web.title']
      }
    } catch (error) {
      console.error('Failed to update page title:', error)
    }
  }

  // 切换语言
  async switchLanguage(locale) {
    if (!LanguageController.SUPPORTED_LOCALES[locale]) {
      console.warn(`Unsupported locale: ${locale}`)
      return
    }

    this.setCurrentLocale(locale)
    
    // 更新 Vue i18n 实例的 locale
    if (this.i18n && this.i18n.global) {
      this.i18n.global.locale.value = locale
    }
    
    await this.updatePageTitle(locale)
    
    // 触发自定义事件通知其他组件语言已更改
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { locale, controller: this } 
    }))
  }

  // 初始化语言环境（页面标题等）
  async initialize() {
    await this.updatePageTitle()
    const i18n = await this.initializeI18n()
    
    // 设置 Vue i18n 的初始语言
    if (i18n && i18n.global) {
      i18n.global.locale.value = this.currentLocale
    }
    
    return i18n
  }

  // 获取特定 CSV 文件的翻译数据
  async getTranslations(csvFileName, locale = null) {
    const targetLocale = locale || this.currentLocale
    return await getTranslations(csvFileName, targetLocale)
  }

  // 等待控制器初始化完成
  async waitForReady() {
    if (!this.i18n) {
      await this.initialize()
    }
    return this.i18n
  }
}

// 创建全局实例
const languageController = new LanguageController()

// 向全局暴露控制器
window.LanguageController = languageController

// 导出控制器实例
export default languageController