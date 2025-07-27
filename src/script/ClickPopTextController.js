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
      console.log("ClickPopTextController: 检测到语言变化", event.detail.locale);
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
    
    console.log("为语言加载文本:", locale);
    
    // 获取指定语言的翻译数据
    const translations = this.csvData[locale] || {};
    console.log("指定语言的翻译数据:", translations);
    
    // 按 key 的顺序提取所有以 'pop.' 开头的文本
    this.texts.value = Object.keys(translations)
      .filter(key => key.startsWith('pop.'))
      .sort() // 确保按 pop.1, pop.2, pop.3... 的顺序排列
      .map(key => translations[key])
      .filter(text => text && text.trim() !== '');
    
    console.log("切换语言后的文本数组:", this.texts.value);
    
    // 设置随机起始索引（只在首次加载或文本数组变化时设置）
    if (this.startIndex === null || this.startIndex >= this.texts.value.length) {
      this.startIndex = this.texts.value.length > 0 ? Math.floor(Math.random() * this.texts.value.length) : 0;
      console.log("设置随机起始索引:", this.startIndex);
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
      console.log("初始化 ClickPopTextController");
      console.log("导入的CSV内容:", popTextCSV);
      console.log("CSV内容类型:", typeof popTextCSV);
      console.log("CSV内容长度:", popTextCSV ? popTextCSV.length : 'undefined');
      
      // 如果 CSV 导入失败，尝试通过 fetch 获取
      let csvContent = popTextCSV;
      if (!csvContent || typeof csvContent !== 'string') {
        console.log("CSV 导入失败，尝试通过 fetch 获取");
        try {
          const response = await fetch('/src/i18n/csv/ClickPopText.csv');
          csvContent = await response.text();
          console.log("通过 fetch 获取的 CSV 内容:", csvContent);
        } catch (fetchError) {
          console.error("fetch CSV 失败:", fetchError);
          throw new Error("无法获取 CSV 文件");
        }
      }
      
      // 解析导入的 CSV 文本并缓存
      this.csvData = parseCSV(csvContent);
      console.log("解析后的数据:", this.csvData);
      
      // 获取当前语言
      const currentLocale = languageController.getCurrentLocale();
      console.log("当前语言:", currentLocale);
      
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
    
    // 计算下一个要显示的索引
    // 如果是第一次点击（currentIndex.value < startIndex），从起始索引开始
    if (this.currentIndex.value < this.startIndex) {
      this.currentIndex.value = this.startIndex;
    } else {
      // 否则按顺序递增
      this.currentIndex.value = (this.currentIndex.value + 1) % this.texts.value.length;
    }
    
    this.currentText.value = this.texts.value[this.currentIndex.value];
    
    // 计算这是从起始索引开始的第几条显示
    let displayOrder;
    if (this.currentIndex.value >= this.startIndex) {
      displayOrder = this.currentIndex.value - this.startIndex + 1;
    } else {
      displayOrder = (this.texts.value.length - this.startIndex) + this.currentIndex.value + 1;
    }
    
    console.log(`显示第 ${displayOrder} 条文本 (数组索引: ${this.currentIndex.value}, 起始索引: ${this.startIndex}, 总共: ${this.texts.value.length}):`, this.currentText.value);
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
