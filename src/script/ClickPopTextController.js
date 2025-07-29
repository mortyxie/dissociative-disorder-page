import { ref, computed } from "vue";
import languageController from "/src/script/LanguageController.js";
import browserVersionController from "/src/script/BrowserVersionController.js";
import { parseCSV } from "/src/i18n/index.js";
import popTextCSV from "/src/i18n/csv/ClickPopText.csv?raw";

class ClickPopTextController {
  constructor() {
    this.texts = ref([]);
    this.currentIndex = ref(-1);
    this.currentText = ref("点击开始");
    this.isDesktop = browserVersionController.getReactiveData().isDesktop;
    this.isInitialized = false;
    this.csvData = null; // 缓存解析的CSV数据
    this.startIndex = null; // 随机起始索引，页面加载时确定，刷新前不变
    
    // 监听语言变化事件
    this.setupLanguageListener();
  }

  // 设置语言变化监听器
  setupLanguageListener() {
    const handleLanguageChanged = async (event) => {
      await this.loadTextsForLanguage(event.detail.locale);
    };
    
    window.addEventListener('languageChanged', handleLanguageChanged);
  }

  // 为指定语言加载文本
  async loadTextsForLanguage(locale) {
    if (!this.csvData) {
      console.warn("CSV数据未初始化，无法切换语言");
      return;
    }
  
    
    // 获取指定语言的翻译数据
    const translations = this.csvData[locale] || {};
    
    // 按 key 的顺序提取所有以 'pop.' 开头的文本
    this.texts.value = Object.keys(translations)
      .filter(key => key.startsWith('pop.'))
      .sort() // 确保按 pop.1, pop.2, pop.3... 的顺序排列
      .map(key => translations[key])
      .filter(text => text && text.trim() !== '');
    
    
    // 设置随机起始索引（只在首次加载或文本数组变化时设置）
    if (this.startIndex === null || this.startIndex >= this.texts.value.length) {
      this.startIndex = this.texts.value.length > 0 ? Math.floor(Math.random() * this.texts.value.length) : 0;
    }
    
    // 重置当前索引为起始索引的前一位（这样第一次点击会显示起始索引的内容）
    this.currentIndex.value = this.startIndex - 1;
    if (this.texts.value.length > 0) {
      this.currentText.value = "点击开始探索";
    } else {
      this.currentText.value = "暂无内容";
    }
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // 如果 CSV 导入失败，尝试通过 fetch 获取
      let csvContent = popTextCSV;
      if (!csvContent || typeof csvContent !== 'string') {
        try {
          const response = await fetch('/src/i18n/csv/ClickPopText.csv');
          csvContent = await response.text();
        } catch (fetchError) {
          console.error("fetch CSV 失败:", fetchError);
          throw new Error("无法获取 CSV 文件");
        }
      }
      
      // 解析导入的 CSV 文本并缓存
      this.csvData = parseCSV(csvContent);
      
      // 获取当前语言
      const currentLocale = languageController.getCurrentLocale();
      
      // 为当前语言加载文本
      await this.loadTextsForLanguage(currentLocale);
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error("初始化失败:", error);
      this.currentText.value = "加载失败";
    }
  }

  handleClick() {
    if (!this.isInitialized) {
      this.initialize();
      return;
    }
    
    if (this.texts.value.length === 0) {
      this.currentText.value = "暂无内容";
      return;
    }
    
    // 只在第一次点击时用 startIndex，之后严格顺序循环
    if (this.currentIndex.value < 0) {
      this.currentIndex.value = this.startIndex;
    } else {
      this.currentIndex.value = (this.currentIndex.value + 1) % this.texts.value.length;
    }
    this.currentText.value = this.texts.value[this.currentIndex.value];
  }

  getReactiveData() {
    return {
      currentText: this.currentText,
      textClass: computed(() => {
        return this.isDesktop.value
          ? "text-lg md:text-2xl"
          : "text-base md:text-lg";
      }),
    };
  }
}

const clickPopTextController = new ClickPopTextController();

// 在全局暴露控制器用于调试
window.clickPopTextController = clickPopTextController;

export default clickPopTextController;
