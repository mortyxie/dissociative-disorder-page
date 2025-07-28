<template>
  <div
    :class="getStyles('container', 'mobile')"
    :style="{ backgroundColor: getColor('background', 'primary') }"
  >
    <!-- MuYang PNG 背景图层 - 移动端 -->
    <div class="absolute pointer-events-none" :style="muyangStyle">
      <img
        src="/src/assets/img/MuYang.png"
        alt="MuYang"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- XingYu PNG 背景图层 - 移动端 -->
    <div class="absolute pointer-events-none" :style="xingyuStyle">
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
import ClickPopText from "/src/components/ClickPopText.vue";
import HalleysCometPuzzle from "/src/components/HalleysCometPuzzle.vue";
import HalleysCometCountDown from "/src/components/HalleysCometCountDown.vue";
import LanguageSlidePanel from "/src/components/LanguageSlidePanel.vue";
import browserVersionController from "/src/script/BrowserVersionController.js";
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
});

onUnmounted(() => {
  console.log("MobileWeb 组件已卸载");
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

/* 支持overscroll-behavior的浏览器 - 只禁用横向过度滚动 */
@supports (overscroll-behavior: none) {
  .container {
    overscroll-behavior-x: none; /* 禁用横向过度滚动 */
    overscroll-behavior-y: auto; /* 保留纵向过度滚动（下拉刷新） */
  }
}
</style>
