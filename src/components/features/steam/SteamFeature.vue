<template>
  <div class="steam-feature">
    <!-- Steam 触发按钮 -->
    <button
      v-show="!hidden"
      @click="openSteamModal"
      class="steam-trigger-button"
    >
      <img
        :src="steamIcon"
        alt="Steam"
        class="steam-icon"
        @error="handleImageError"
      />
    </button>

    <!-- Steam 模态窗口 -->
    <div v-if="isModalOpen" class="steam-modal" @click.self="closeSteamModal">
      <div class="steam-content">
        <!-- Steam 状态文本 -->
        <div class="steam-message">
          {{ steamTitle }}
        </div>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div
      v-if="isModalOpen"
      class="steam-backdrop"
      @click="closeSteamModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getColor, getFontConfig } from "/src/config/theme.js";
import steamIcon from "/src/assets/svg/steam_icon.svg";
import languageController from "/src/script/LanguageController.js";

// Props 定义
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
  targetUrl: {
    type: String,
    default: "https://www.bilibili.com", // 临时占位符 URL
  },
  openInNewTab: {
    type: Boolean,
    default: true, // 默认在新标签页打开
  },
});

// 响应式状态
const isModalOpen = ref(false);
const steamTitle = ref("Coming...soon...?"); // 使用英文作为默认值

// 获取主题配置
const backgroundColor = getColor("background", "secondary");
const fontConfig = getFontConfig("primary");
const textColor = getColor("text", "primary");

// 获取翻译文本的辅助函数
const getTranslation = async (key) => {
  try {
    const translations = await languageController.getTranslations("languages");
    return translations[key] || key;
  } catch (error) {
    console.error("Translation error:", error);
    return key;
  }
};

// 初始化翻译
const initTranslations = async () => {
  try {
    steamTitle.value = await getTranslation("web.steam.title");
  } catch (error) {
    console.error("初始化翻译失败:", error);
  }
};

// 语言变化事件处理器
const handleLanguageChange = async () => {
  await initTranslations();
};

// 打开Steam模态窗口
const openSteamModal = () => {
  console.log("Steam 模态窗口被打开");
  isModalOpen.value = true;
};

// 关闭Steam模态窗口
const closeSteamModal = () => {
  isModalOpen.value = false;
};

// 图片加载错误处理
const handleImageError = (event) => {
  console.error("Steam SVG 加载失败:", event);
  // 可以在这里添加备用图标或处理逻辑
};

// 生命周期钩子
onMounted(() => {
  initTranslations();
  // 监听语言变化事件
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<style scoped>
.steam-feature {
  position: relative;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

/* Steam 触发按钮样式 */
.steam-trigger-button {
  position: fixed;
  top: 186px; /* 在 rainoflove 按钮下方，更紧凑间距 (136px + 50px) */
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
  z-index: 1001;
  color: #ffffff;
}

.steam-trigger-button:hover {
  background: v-bind("backgroundColor");
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
}

.steam-trigger-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.steam-trigger-button:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Steam 图标样式 */
.steam-icon {
  width: 24px;
  height: 24px;
  object-fit: contain; /* 确保 SVG 按比例缩放 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 移除 filter，保持原始颜色 */
}

.steam-trigger-button:hover .steam-icon {
  transform: scale(1.1);
}

/* 模态窗口样式 */
.steam-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
}

/* Steam 内容容器 */
.steam-content {
  background: v-bind("backgroundColor");
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  min-width: 320px;
  max-width: 400px;
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Steam 消息样式 */
.steam-message {
  font-size: 24px;
  font-weight: bold;
  color: v-bind("textColor");
  text-align: center;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

/* 背景遮罩 */
.steam-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1005;
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .steam-trigger-button {
    width: 44px;
    height: 44px;
    top: 172px; /* 移动端更紧凑间距 (120px + 44px + 8px) */
    right: 16px;
  }

  .steam-icon {
    width: 20px;
    height: 20px;
  }

  .steam-content {
    margin: 20px;
    padding: 24px;
    min-width: auto;
    max-width: calc(100vw - 40px);
  }

  .steam-message {
    font-size: 20px;
  }
}

/* 聚焦样式 */
.steam-trigger-button:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* 禁用文本选择 */
.steam-trigger-button {
  user-select: none;
  -webkit-user-select: none;
}
</style>
