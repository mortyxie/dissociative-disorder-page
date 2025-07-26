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
      
      // 解析导入的 CSV 文本
      const parsedData = parseCSV(csvContent);
      console.log("解析后的数据:", parsedData);
      
      // 获取当前语言
      const currentLocale = languageController.getCurrentLocale();
      console.log("当前语言:", currentLocale);
      
      // 获取当前语言的翻译数据
      const translations = parsedData[currentLocale] || {};
      console.log("当前语言的翻译数据:", translations);
      
      // 按 key 的顺序提取所有以 'pop.' 开头的文本
      this.texts.value = Object.keys(translations)
        .filter(key => key.startsWith('pop.'))
        .sort() // 确保按 pop.1, pop.2, pop.3... 的顺序排列
        .map(key => translations[key])
        .filter(text => text && text.trim() !== '');
      
      console.log("提取的文本数组:", this.texts.value);
      console.log("文本数组长度:", this.texts.value.length);
      
      this.isInitialized = true;
      
      if (this.texts.value.length > 0) {
        this.currentText.value = "点击开始探索";
      } else {
        this.currentText.value = "暂无内容";
      }
      
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
    
    // 循环显示下一个文本
    this.currentIndex.value = (this.currentIndex.value + 1) % this.texts.value.length;
    this.currentText.value = this.texts.value[this.currentIndex.value];
    
    console.log(`显示第 ${this.currentIndex.value + 1} 条文本:`, this.currentText.value);
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
