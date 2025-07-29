import { createI18n } from 'vue-i18n'
import LanguagesCSV from '/src/i18n/csv/Languages.csv?raw'
import ClickPopTextCSV from '/src/i18n/csv/ClickPopText.csv?raw'

// 可用的 CSV 文件列表
const CSV_FILES = {
  languages: LanguagesCSV,
  ClickPopText: ClickPopTextCSV
}

// 解析 CSV 内容为 JSON 对象
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) return {}
  
  // 解析 CSV 行，支持双引号包围的字段
  function parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 转义的双引号 ("") -> 单个双引号
          current += '"'
          i += 2
        } else {
          // 开始或结束引号
          inQuotes = !inQuotes
          i++
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符（不在引号内）
        result.push(current.trim())
        current = ''
        i++
      } else {
        // 普通字符
        current += char
        i++
      }
    }
    
    // 添加最后一个字段
    result.push(current.trim())
    
    return result
  }
  
  // 解析头部
  const headers = parseCSVLine(lines[0])
  
  // 初始化语言对象
  const languages = {}
  headers.slice(1).forEach(lang => {
    if (lang) { // 忽略空的语言列
      languages[lang] = {}
    }
  })
  
  // 处理数据行
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue // 跳过空行
    
    const values = parseCSVLine(lines[i])
    const key = values[0]
    
    if (key) { // 确保 key 不为空
      // 为每种语言添加翻译
      headers.slice(1).forEach((lang, index) => {
        if (lang && languages[lang] !== undefined) { // 确保语言列存在
          const value = values[index + 1] || ''
          // 处理换行符：将 \n 替换为实际的换行符，同时移除回车符
          const processedValue = value.replace(/\r/g, '').replace(/\\n/g, '\n')
          languages[lang][key] = processedValue
        }
      })
    }
  }
  
  return languages
}

// 加载指定的 CSV 文件
async function loadCSV(csvFileName) {
  try {
    const csvText = CSV_FILES[csvFileName]
    if (!csvText) throw new Error(`CSV file '${csvFileName}' not found`)
    const result = parseCSV(csvText)
    return result
  } catch (error) {
    return {
      'zh-cn': {},
      'zh-mo': {},
      'en': {}
    }
  }
}

// 加载所有 CSV 文件并合并
function loadAllLanguages() {
  try {
    const csvFiles = Object.keys(CSV_FILES)
    const results = csvFiles.map(fileName => parseCSV(CSV_FILES[fileName]))
    // 合并所有语言数据
    const mergedLanguages = {
      'zh-cn': {},
      'zh-mo': {},
      'en': {}
    }
    results.forEach(langData => {
      Object.keys(langData).forEach(lang => {
        if (mergedLanguages[lang]) {
          Object.assign(mergedLanguages[lang], langData[lang])
        }
      })
    })
    return mergedLanguages
  } catch (error) {
    console.error('Error loading all languages:', error)
    return {
      'zh-cn': {},
      'zh-mo': {},
      'en': {}
    }
  }
}

// 创建 i18n 实例（使用所有 CSV 文件）
async function createI18nInstance() {
  const messages = await loadAllLanguages()
  
  return createI18n({
    legacy: false,
    locale: 'zh-cn', // 默认语言
    fallbackLocale: 'en', // 回退语言
    messages
  })
}

// 创建特定 CSV 文件的 i18n 实例
async function createI18nInstanceFromCSV(csvFileName) {
  const messages = await loadCSV(csvFileName)
  
  return createI18n({
    legacy: false,
    locale: 'zh-cn',
    fallbackLocale: 'en',
    messages
  })
}

// 获取特定 CSV 文件的翻译数据
async function getTranslations(csvFileName, locale = 'zh-cn') {
  const languages = await loadCSV(csvFileName)
  return languages[locale] || {}
}

// 导出函数
export { 
  createI18nInstance, 
  createI18nInstanceFromCSV,
  loadCSV, 
  loadAllLanguages,
  getTranslations,
  parseCSV,
  CSV_FILES 
}

// 默认导出
export default createI18nInstance
