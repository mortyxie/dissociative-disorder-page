<template>
  <div
    :class="getStyles('container', 'mobile')"
    :style="{ backgroundColor: getColor('background', 'primary') }"
  >
    <!-- 星星背景层 -->
    <div v-show="isUnlocked" class="stars-background">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          animationDelay: star.delay + 's',
          animationDuration: star.duration + 's',
        }"
      ></div>
    </div>

    <!-- Logo PNG 背景图层 - 移动端 -->
    <div class="absolute pointer-events-none" :style="logoStyle">
      <img
        src="/src/assets/img/DissociativeDisorderLogo.png"
        alt="Logo"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- MuYang PNG 背景图层 - 移动端 -->
    <div class="absolute pointer-events-none" :style="muyangStyle">
      <img
        src="/src/assets/img/MuYang.png"
        alt="MuYang"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- 解密后显示的内容层 - 包含 XingYu PNG 和未来更新 -->
    <div v-show="isUnlocked" class="unlocked-content">
      <!-- XingYu PNG 背景图层 - 移动端 -->
      <div class="absolute pointer-events-none" :style="xingyuStyle">
        <img
          src="/src/assets/img/XingYu.png"
          alt="XingYu"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- 这里可以放置未来的解密后内容 -->
      <!-- 例如：新的角色、特效、UI元素等 -->
    </div>

    <!-- 内容层 -->
    <div :class="getStyles('contentArea', 'mobile')">
      <!-- 内容区域预留给未来的内容 -->
    </div>

    <!-- 语言切换滑动面板 - 右上角 -->
    <LanguageSlidePanel />

    <!-- Rain of Love 功能 - 移动端 -->
    <RainOfLoveFeature :hidden="isLanguagePanelOpen" />

    <!-- Steam 功能 - 移动端 -->
    <SteamFeature :hidden="isLanguagePanelOpen" />

    <!-- 社交媒体功能 - 移动端 -->
    <SocialMediaFeature :hidden="isLanguagePanelOpen" />

    <!-- 哈雷彗星倒计时组件 -->
    <HalleysCometCountDown />

    <!-- 哈雷彗星解密组件 -->
    <HalleysCometPuzzle :hidden="isLanguagePanelOpen" />

    <!-- 点击弹出文本组件 - 全屏交互 -->
    <ClickPopText />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import ClickPopText from "/src/components/ui/ClickPopText.vue";
import HalleysCometPuzzle from "/src/components/features/halley/HalleysCometPuzzle.vue";
import HalleysCometCountDown from "/src/components/features/halley/HalleysCometCountDown.vue";
import LanguageSlidePanel from "/src/components/features/language/LanguageSlidePanel.vue";
import RainOfLoveFeature from "/src/components/features/rainoflove/RainOfLoveFeature.vue";
import SteamFeature from "/src/components/features/steam/SteamFeature.vue";
import SocialMediaFeature from "/src/components/features/socialmedia/SocialMediaFeature.vue";
import browserVersionController from "/src/script/BrowserVersionController.js";
import {
  checkMusicPlayState,
  cleanupMusic,
} from "/src/script/MusicController.js";
import {
  getStyles,
  getColor,
  getTypography,
  getSpacing,
  getImageConfig,
  createResponsiveImageStyle,
  createAspectRatioAwareImageStyle,
} from "/src/config/theme.js";

// 直接从控制器获取响应式数据
const { deviceType, screenWidth } = browserVersionController.getReactiveData();

// 解密成功状态控制
const isUnlocked = ref(false);

// 语言面板开关状态
const isLanguagePanelOpen = ref(false);

// 星星背景数据
const stars = ref([]);

// 创建通用的PNG图片样式计算函数 - 使用宽高比适配（移动端）
const createImageStyle = (imageName) => {
  return createAspectRatioAwareImageStyle(imageName, "mobile");
};

// 为不同的PNG图片创建样式
const logoStyle = computed(() => createImageStyle("logo"));
const muyangStyle = computed(() => createImageStyle("muyang"));
const xingyuStyle = computed(() => createImageStyle("xingyu"));

// 生成随机星星
const generateStars = () => {
  const starCount = 120; // 和桌面端保持一致的星星数量
  const newStars = [];

  for (let i = 0; i < starCount; i++) {
    newStars.push({
      id: i,
      x: Math.random() * 100, // 0-100% 横向位置
      y: Math.random() * 100, // 0-100% 纵向位置
      size: Math.random() * 2 + 1, // 1-3px 大小（移动端稍小）
      delay: Math.random() * 4, // 0-4s 动画延迟
      duration: Math.random() * 2 + 2, // 2-4s 动画持续时间
    });
  }

  stars.value = newStars;
};

// 检查解密状态
const checkUnlockStatus = () => {
  const solved = localStorage.getItem("halleysCometSolved");
  if (solved === "true") {
    isUnlocked.value = true;
    console.log("检测到解密状态: 已解密");
  }
};

// 监听解密成功事件
const handlePuzzleSolved = (event) => {
  console.log("收到解密成功事件", event.detail);
  isUnlocked.value = true;
  console.log("解密状态已更新为:", isUnlocked.value);
};

// 生命周期钩子
onMounted(() => {
  console.log("MobileWeb 组件已挂载");

  // 生成星星背景
  generateStars();

  // 检查解密状态
  checkUnlockStatus();

  // 检查音乐播放状态
  checkMusicPlayState();

  // 监听解密成功事件
  window.addEventListener("halleysCometSolved", handlePuzzleSolved);

  // 监听语言面板状态变化事件
  window.addEventListener("languagePanelToggle", handleLanguagePanelToggle);
});

// 监听语言面板全局事件
const handleLanguagePanelToggle = (event) => {
  isLanguagePanelOpen.value = event.detail.isOpen;
  console.log(
    "移动端布局接收到语言面板状态变化:",
    event.detail.isOpen ? "打开" : "关闭"
  );
};

onUnmounted(() => {
  console.log("MobileWeb 组件已卸载");

  // 清理事件监听器
  window.removeEventListener("halleysCometSolved", handlePuzzleSolved);
  window.removeEventListener("languagePanelToggle", handleLanguagePanelToggle);

  // 清理音乐资源
  cleanupMusic();
});
</script>

<style scoped>
/* 移动端防止横向滑动，但保留下拉刷新 */
:deep(html),
:deep(body) {
  overflow-x: hidden; /* 只禁用横向滚动 */
  width: 100vw;
  touch-action: pan-y; /* 只允许垂直滑动（包括下拉刷新） */
  -webkit-touch-callout: none; /* 禁用长按菜单 */
  -webkit-user-select: none; /* 禁用文本选择 */
  user-select: none; /* 标准属性 */
  -webkit-tap-highlight-color: transparent; /* 禁用点击高亮 */
}

/* 主容器防横向滚动样式 */
.container {
  touch-action: pan-y; /* 只允许垂直滑动 */
  overflow-x: hidden; /* 禁用横向滚动 */
  overflow-y: auto; /* 允许纵向滚动 */
  width: 100vw;
  min-height: 100vh;
}

/* 星星背景层 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1; /* 在UI层之下，但在主背景之上 */
  touch-action: none; /* 背景层不需要交互 */
}

/* 单个星星样式 */
.star {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: twinkle infinite ease-in-out;
}

/* 星星闪烁动画 */
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 解锁内容层 */
.unlocked-content {
  touch-action: pan-y; /* 允许垂直滑动 */
  overflow-x: hidden; /* 禁用横向滚动 */
}

/* 支持overscroll-behavior的浏览器 - 只禁用横向过度滚动 */
@supports (overscroll-behavior: none) {
  .container,
  .unlocked-content {
    overscroll-behavior-x: none; /* 禁用横向过度滚动 */
    overscroll-behavior-y: auto; /* 保留纵向过度滚动（下拉刷新） */
  }
}
</style>
