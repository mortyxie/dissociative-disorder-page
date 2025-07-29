<template>
  <div class="language-slide-panel">
    <!-- 触发按钮 - 右上角贴边 -->
    <button
      @click="togglePanel"
      class="trigger-button"
      :class="{ active: isPanelOpen }"
      aria-label="语言切换"
    >
      <span class="language-icon">文A</span>
    </button>

    <!-- 滑出面板 -->
    <div class="slide-panel" :class="{ open: isPanelOpen }" @click.stop>
      <div class="panel-content">
        <div class="language-options">
          <button
            v-for="language in languages"
            :key="language.code"
            @click="selectLanguage(language.code)"
            class="language-option"
            :class="{ active: currentLanguage === language.code }"
          >
            <span class="language-name">{{ language.name }}</span>
            <span class="language-native">{{ language.native }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="isPanelOpen" class="backdrop" @click="closePanel"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import languageController from "/src/script/LanguageController.js";
import { getColor, getFontConfig } from "/src/config/theme.js";

// 响应式状态
const isPanelOpen = ref(false);
const currentLanguage = ref(languageController.getCurrentLocale());

// 获取主题颜色
const backgroundColor = getColor("background", "secondary");
const fontConfig = getFontConfig("primary");

// 语言选项配置
const languages = [
  {
    code: "zh-cn",
    name: "简体中文",
    native: "简体中文",
  },
  {
    code: "zh-mo",
    name: "繁體中文",
    native: "繁體中文",
  },
  {
    code: "en",
    name: "English",
    native: "English",
  },
];

// 切换面板显示/隐藏
const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value;

  // 触发面板状态变化事件
  const event = new CustomEvent("languagePanelToggle", {
    detail: { isOpen: isPanelOpen.value },
  });
  window.dispatchEvent(event);
};

// 关闭面板
const closePanel = () => {
  isPanelOpen.value = false;

  // 触发面板状态变化事件
  const event = new CustomEvent("languagePanelToggle", {
    detail: { isOpen: false },
  });
  window.dispatchEvent(event);
};

// 选择语言
const selectLanguage = async (languageCode) => {
  if (languageCode !== currentLanguage.value) {
    currentLanguage.value = languageCode;
    await languageController.switchLanguage(languageCode);
  }
  closePanel();
};

// 监听语言变化事件
const handleLanguageChanged = (event) => {
  currentLanguage.value = event.detail.locale;
};

// 监听ESC键关闭面板
const handleKeyDown = (event) => {
  if (event.key === "Escape" && isPanelOpen.value) {
    closePanel();
  }
};

// 生命周期
onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChanged);
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChanged);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.language-slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

/* 触发按钮样式 */
.trigger-button {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: v-bind("backgroundColor");
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 1150;
  color: #ffffff;
}

.trigger-button:hover {
  background: v-bind("backgroundColor");
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
}

.trigger-button.active {
  background: rgba(59, 130, 246, 0.9);
  border-color: rgba(59, 130, 246, 0.5);
  color: white;
}

.trigger-button.active:hover {
  background: rgba(59, 130, 246, 1);
}

/* 语言图标样式 */
.language-icon {
  font-size: 16px;
  font-weight: bold;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.trigger-button.active .language-icon {
  transform: rotate(180deg);
}

/* 滑出面板样式 */
.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: v-bind("backgroundColor");
  backdrop-filter: blur(20px);
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1100;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.slide-panel.open {
  transform: translateX(0);
}

/* 面板内容 */
.panel-content {
  padding: 80px 24px 24px;
  height: 100%;
  overflow-y: auto;
}

/* 语言选项 */
.language-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  color: #ffffff;
}

.language-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.language-option.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  color: #ffffff;
}

.language-name {
  font-weight: 600;
  color: #ffffff;
  flex: 1;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

.language-native {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

.language-option.active .language-name,
.language-option.active .language-native {
  color: #ffffff;
}

/* 背景遮罩 */
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .slide-panel {
    width: 280px;
  }

  .trigger-button {
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
  }

  .language-icon {
    font-size: 14px;
  }

  .panel-content {
    padding: 70px 20px 20px;
  }

  .language-option {
    padding: 14px;
  }
}

/* 平滑滚动 */
.panel-content {
  scroll-behavior: smooth;
}

/* 聚焦样式 */
.trigger-button:focus,
.language-option:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* 禁用文本选择 */
.trigger-button,
.language-option {
  user-select: none;
  -webkit-user-select: none;
}
</style>
