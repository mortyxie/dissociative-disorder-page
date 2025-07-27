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

    <!-- MuYang PNG 背景图层 - 移动端 -->
    <div class="absolute pointer-events-none" :style="muyangStyle">
      <img
        src="/src/assets/img/MuYang.png"
        alt="MuYang"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- XingYu PNG 背景图层 - 移动端 -->
    <div
      v-show="isUnlocked"
      class="absolute pointer-events-none"
      :style="xingyuStyle"
    >
      <img
        src="/src/assets/img/XingYu.png"
        alt="XingYu"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- 内容层 -->
    <div :class="getStyles('contentArea', 'mobile')">
      <!-- 主要内容区域 -->
      <div :class="getStyles('contentCard', 'mobile')">
        <h1 :class="getTypography('heading', 'mobile')">移动端界面</h1>
        <p :class="getTypography('subtitle', 'mobile')">
          这是为移动端设计的界面
        </p>
        <div :class="getStyles('infoBox')">
          <p :class="getTypography('body')">屏幕宽度: {{ screenWidth }}px</p>
          <p :class="getTypography('body')">设备: {{ deviceType }}</p>
        </div>
      </div>
    </div>

    <!-- 语言切换滑动面板 - 右上角 -->
    <LanguageSlidePanel />

    <!-- 哈雷彗星倒计时组件 -->
    <HalleysCometCountDown />

    <!-- 哈雷彗星解密组件 -->
    <HalleysCometPuzzle />

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

// 星星背景数据
const stars = ref([]);

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

// 创建通用的PNG图片样式计算函数 - 使用宽高比适配
const createImageStyle = (imageName) => {
  return createAspectRatioAwareImageStyle(imageName, "mobile");
};

// 为不同的PNG图片创建样式
const muyangStyle = computed(() => createImageStyle("muyang"));
const xingyuStyle = computed(() => createImageStyle("xingyu"));

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
});

onUnmounted(() => {
  console.log("MobileWeb 组件已卸载");

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
