<template>
  <!-- 全屏点击区域 -->
  <div :class="containerClasses" @click="handleClick">
    <!-- 动态弹出的文本 -->
    <transition name="pop-text-fade" @enter="onEnter" @leave="onLeave">
      <div v-if="showPopText" :class="popTextClasses" :style="popTextStyle">
        {{ currentText }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import clickPopTextController from "/src/script/ClickPopTextController.js";
import {
  getColor,
  getFontConfig,
  getClickPopTextConfig,
} from "/src/config/theme.js";
import browserVersionController from "/src/script/BrowserVersionController.js";

// 获取响应式数据
const { currentText } = clickPopTextController.getReactiveData();
const { deviceType } = browserVersionController.getReactiveData();

// 获取主题配置
const backgroundColor = getColor("dialog", "background");
const textColor = getColor("dialog", "text");
const borderColor = getColor("dialog", "border");
const shadowColor = getColor("dialog", "shadow");
const fontConfig = getFontConfig("primary");

// 获取设备类型并确定配置
const currentDevice = computed(() => {
  if (deviceType.value === "mobile") return "mobile";
  if (window.innerWidth <= 768) return "tablet";
  return "desktop";
});

// 获取 ClickPopText 配置
const clickPopTextConfig = computed(() =>
  getClickPopTextConfig(currentDevice.value)
);

// 计算容器样式类
const containerClasses = computed(() => {
  const config = clickPopTextConfig.value;
  return `${
    config?.container ||
    "fixed inset-0 w-screen h-screen pointer-events-auto z-[500]"
  } cursor-default`;
});

// 计算弹出文本样式类
const popTextClasses = computed(() => {
  const config = clickPopTextConfig.value;
  if (!config) return "fixed pointer-events-none z-[501]";

  const baseClasses = config.popText;
  const pixelBorder = config.pixelBorder;
  const fontSize =
    config.fontSize[currentDevice.value] || config.fontSize.desktop;
  const padding = config.padding[currentDevice.value] || config.padding.desktop;
  const maxWidth =
    config.maxWidth[currentDevice.value] || config.maxWidth.desktop;

  return `${baseClasses} ${pixelBorder} ${fontSize} ${padding} ${maxWidth}`;
});

// 弹出文本的显示状态和位置
const showPopText = ref(false);
const popTextPosition = ref({ x: 0, y: 0 });
const hideTimeout = ref(null);

// 页面边距配置（避免文字出现在页面边缘）
const margins = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

// 文本框尺寸配置
const textBoxConfig = computed(() => {
  const device = currentDevice.value;
  return {
    maxWidth: device === "mobile" ? 180 : device === "tablet" ? 200 : 250,
    minHeight: device === "mobile" ? 40 : device === "tablet" ? 45 : 50,
    padding: device === "mobile" ? 12 : device === "tablet" ? 14 : 16,
  };
});

// 计算弹出文本样式（仅包含位置和主题颜色）
const popTextStyle = computed(() => ({
  left: `${popTextPosition.value.x}px`,
  top: `${popTextPosition.value.y}px`,
  backgroundColor: backgroundColor,
  color: textColor,
  borderColor: borderColor,
  fontFamily: `"${fontConfig.family}", ${fontConfig.fallback}`,
}));

// 计算安全的文本显示位置
const calculateSafePosition = (clickX, clickY) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const config = textBoxConfig.value;

  // 初始位置：点击位置附近
  let x = clickX;
  let y = clickY - config.minHeight - 10; // 默认在点击位置上方

  // 水平位置调整
  if (x < margins.left) {
    x = margins.left;
  } else if (x + config.maxWidth > viewportWidth - margins.right) {
    x = viewportWidth - margins.right - config.maxWidth;
  }

  // 垂直位置调整
  if (y < margins.top) {
    // 上方空间不够，显示在点击位置下方
    y = clickY + 10;
  }

  if (y + config.minHeight > viewportHeight - margins.bottom) {
    // 下方空间也不够，显示在可见区域内
    y = viewportHeight - margins.bottom - config.minHeight;
  }

  return { x, y };
};

// 处理点击事件
const handleClick = (event) => {
  // 获取相对于页面的点击坐标
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 如果有正在运行的隐藏定时器，清除它
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
  }

  // 触发文本更新
  clickPopTextController.handleClick();

  // 计算安全的显示位置
  popTextPosition.value = calculateSafePosition(clickX, clickY);

  // 显示弹出文本
  showPopText.value = true;

  // 设置2秒自动隐藏定时器
  hideTimeout.value = setTimeout(() => {
    showPopText.value = false;
    hideTimeout.value = null;
  }, 3000);
};

// 动画钩子函数
const onEnter = (el) => {
  el.style.opacity = "0";
  el.style.transform = "scale(0.8) translateY(10px)";

  // 强制重绘
  el.offsetHeight;

  el.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  el.style.opacity = "1";
  el.style.transform = "scale(1) translateY(0)";
};

const onLeave = (el) => {
  el.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
  el.style.opacity = "0";
  el.style.transform = "scale(0.9) translateY(-5px)";
};

// 组件挂载和卸载处理
onMounted(async () => {
  await clickPopTextController.initialize();
});

onUnmounted(() => {
  // 清理定时器
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
  }
});
</script>

<style scoped>
/* 淡入淡出动画 - 使用 CSS 变量配合 Tailwind */
.pop-text-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pop-text-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.pop-text-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.pop-text-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-5px);
}

/* 像素风格渲染 - 无法用 Tailwind 实现的特殊效果 */
.shadow-pixel,
.shadow-pixel-mobile {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  image-rendering: -webkit-optimize-contrast;
}
</style>
