<template>
  <div
    :class="getStyles('container', 'desktop')"
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

    <!-- Logo PNG 背景图层 -->
    <div class="absolute pointer-events-none" :style="logoStyle">
      <img
        src="/src/assets/img/DissociativeDisorderLogo.png"
        alt="Logo"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- MuYang PNG 背景图层 -->
    <div class="absolute pointer-events-none" :style="muyangStyle">
      <img
        src="/src/assets/img/MuYang.png"
        alt="MuYang"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- 解密后显示的内容层 - 包含 XingYu PNG 和未来更新 -->
    <div v-show="isUnlocked" class="unlocked-content">
      <!-- XingYu PNG 背景图层 -->
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
    <div :class="getStyles('contentArea', 'desktop')">
      <!-- 内容区域预留给未来的内容 -->
    </div>

    <!-- 哈雷彗星倒计时组件 -->
    <HalleysCometCountDown />

    <!-- 侧边栏组件 - 包含语言切换和解密功能 -->
    <SideBar />

    <!-- 点击弹出文本组件 - 全屏交互 -->
    <ClickPopText />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ClickPopText from "/src/components/ui/ClickPopText.vue";
import HalleysCometCountDown from "/src/components/features/halley/HalleysCometCountDown.vue";
import SideBar from "/src/components/ui/SideBar.vue";
import browserVersionController from "/src/script/BrowserVersionController.js";
import languageController from "/src/script/LanguageController.js";
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
  createAspectRatioAwareImageStyle,
} from "/src/config/theme.js";

// 直接从控制器获取响应式数据
const { deviceType, screenWidth } = browserVersionController.getReactiveData();

// 解密成功状态控制
const isUnlocked = ref(false);

// 星星背景数据
const stars = ref([]);

// 生成随机星星
const generateStars = () => {
  const starCount = 120; // 星星数量
  const newStars = [];

  for (let i = 0; i < starCount; i++) {
    newStars.push({
      id: i,
      x: Math.random() * 100, // 0-100% 横向位置
      y: Math.random() * 100, // 0-100% 纵向位置
      size: Math.random() * 3 + 1, // 1-4px 大小
      delay: Math.random() * 4, // 0-4s 动画延迟
      duration: Math.random() * 2 + 2, // 2-4s 动画持续时间
    });
  }

  stars.value = newStars;
};

// 检查解密状态
const checkUnlockStatus = () => {
  // 每次浏览器刷新后都重置为 false，不从 localStorage 读取
  isUnlocked.value = false;
  console.log("解密状态重置为:", isUnlocked.value);
};

// 监听解密成功事件
const handlePuzzleSolved = (event) => {
  console.log("收到解密成功事件", event.detail);
  isUnlocked.value = true;
  console.log("解密状态已更新为:", isUnlocked.value);
};

// 创建通用的PNG图片样式计算函数 - 使用宽高比适配
const createImageStyle = (imageName) => {
  return createAspectRatioAwareImageStyle(imageName, "desktop");
};

// 为不同的PNG图片创建样式
const logoStyle = computed(() => createImageStyle("logo"));
const muyangStyle = computed(() => createImageStyle("muyang"));
const xingyuStyle = computed(() => createImageStyle("xingyu"));

// 监听解密状态变化
watch(isUnlocked, (newValue, oldValue) => {
  console.log(`解密状态变化: ${oldValue} -> ${newValue}`);
  if (newValue) {
    console.log("XingYu PNG 应该显示了");
  } else {
    console.log("XingYu PNG 应该隐藏了");
  }
});

// 生命周期钩子
onMounted(() => {
  console.log("DesktopWeb 组件已挂载");

  // 生成星星背景
  generateStars();

  // 在浏览器刷新后检查解密状态
  checkUnlockStatus();

  // 检查音乐播放状态
  checkMusicPlayState();

  // 监听解密成功事件（事件在 window 上触发）
  window.addEventListener("halleysCometSolved", handlePuzzleSolved);
});

onUnmounted(() => {
  console.log("DesktopWeb 组件已卸载");
  // 清理事件监听器
  window.removeEventListener("halleysCometSolved", handlePuzzleSolved);

  // 清理音乐资源
  cleanupMusic();
});
</script>

<style scoped>
/* 星星背景层 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1; /* 在UI层之下，但在主背景之上 */
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
</style>
