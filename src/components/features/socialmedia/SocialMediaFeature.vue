<template>
  <div class="social-media-feature">
    <!-- 社交媒体折叠按钮 -->
    <button
      v-show="!hidden"
      @click="toggleSocialPanel"
      class="social-trigger-button"
    >
      <div class="social-icon" :class="{ expanded: isExpanded }">SNS</div>
    </button>

    <!-- 社交媒体面板 -->
    <transition name="social-panel">
      <div v-if="isExpanded" class="social-panel">
        <button
          v-for="(platform, key) in socialMediaConfig.socialMediaLinks"
          :key="key"
          @click="openSocialLink(platform.url)"
          class="social-item-button"
        >
          <div class="social-item-icon" :class="`${key}-icon`">
            <img :src="platform.icon" :alt="key" class="social-svg-icon" />
          </div>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getColor, getFontConfig } from "/src/config/theme.js";
import socialMediaConfig from "/src/config/socialMediaConfig.json";
import languageController from "/src/script/LanguageController.js";

// Props 定义
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
  openInNewTab: {
    type: Boolean,
    default: true, // 默认在新标签页打开
  },
});

// 响应式状态
const isExpanded = ref(false);
const socialMediaTitle = ref("社交媒体");

// 获取主题配置
const backgroundColor = getColor("background", "secondary");
const textColor = getColor("text", "primary");
const fontConfig = getFontConfig("primary");

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
    socialMediaTitle.value = await getTranslation("web.socialmedia.title");
  } catch (error) {
    console.error("初始化翻译失败:", error);
  }
};

// 切换社交媒体面板
const toggleSocialPanel = () => {
  isExpanded.value = !isExpanded.value;
  console.log("社交媒体面板", isExpanded.value ? "展开" : "收起");
};

// 打开社交媒体链接
const openSocialLink = (url) => {
  console.log(`打开社交媒体链接: ${url}`);

  try {
    if (props.openInNewTab) {
      // 在新标签页中打开链接
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // 在当前页面跳转
      window.location.href = url;
    }
  } catch (error) {
    console.error("打开社交媒体链接失败:", error);
    // 备用方案：使用 location.href
    window.location.href = url;
  }
};

// 点击外部区域关闭面板
const handleClickOutside = (event) => {
  const socialFeature = event.target.closest(".social-media-feature");
  if (!socialFeature && isExpanded.value) {
    isExpanded.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  initTranslations();
  document.addEventListener("click", handleClickOutside);

  // 监听语言变化
  window.addEventListener("languageChanged", () => {
    initTranslations();
  });
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("languageChanged", () => {
    initTranslations();
  });
});
</script>

<style scoped>
.social-media-feature {
  position: relative;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

/* 社交媒体触发按钮样式 */
.social-trigger-button {
  position: fixed;
  top: 236px; /* 在 steam 按钮下方，更紧凑间距 (186px + 50px) */
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
  padding: 0;
  text-align: center;
}

.social-trigger-button:hover {
  background: v-bind("backgroundColor");
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
}

.social-trigger-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.social-trigger-button:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 社交媒体图标样式 */
.social-icon {
  font-size: 14px;
  font-weight: bold;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.social-icon.expanded {
  transform: rotate(180deg);
}

.social-trigger-button:hover .social-icon {
  transform: scale(1.1);
  filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

.social-trigger-button:hover .social-icon.expanded {
  transform: rotate(180deg) scale(1.1);
}

/* 社交媒体面板样式 */
.social-panel {
  position: fixed;
  top: 292px; /* 触发按钮下方 8px (236px + 48px + 8px) */
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

/* 社交媒体项目按钮样式 */
.social-item-button {
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
  color: #ffffff;
}

.social-item-button:hover {
  background: v-bind("backgroundColor");
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px) scale(1.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.social-item-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.social-item-button:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 社交媒体图标样式 */
.social-item-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-svg-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 特定平台颜色 */
.bilibili-icon .social-svg-icon {
  filter: brightness(0) saturate(100%) invert(64%) sepia(33%) saturate(6411%)
    hue-rotate(179deg) brightness(95%) contrast(94%);
}

.xiaohongshu-icon .social-svg-icon {
  filter: brightness(0) saturate(100%) invert(16%) sepia(100%) saturate(6417%)
    hue-rotate(347deg) brightness(102%) contrast(110%);
}

.weibo-icon .social-svg-icon {
  filter: brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(5942%)
    hue-rotate(347deg) brightness(98%) contrast(99%);
}

.instagram-icon .social-svg-icon {
  filter: brightness(0) saturate(100%) invert(29%) sepia(96%) saturate(3048%)
    hue-rotate(324deg) brightness(91%) contrast(97%);
}

.twitter-icon .social-svg-icon {
  filter: brightness(0) saturate(100%) invert(51%) sepia(95%) saturate(1850%)
    hue-rotate(178deg) brightness(97%) contrast(101%);
}

/* 面板动画 */
.social-panel-enter-active,
.social-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-panel-enter-from,
.social-panel-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.social-panel-enter-to,
.social-panel-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .social-trigger-button {
    width: 44px;
    height: 44px;
    top: 224px; /* 移动端更紧凑间距 (172px + 44px + 8px) */
    right: 16px;
  }

  .social-icon {
    font-size: 12px;
  }

  .social-panel {
    top: 276px; /* 移动端面板位置调整 (224px + 44px + 8px) */
    right: 16px;
  }

  .social-item-button {
    width: 44px;
    height: 44px;
  }

  .social-item-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
