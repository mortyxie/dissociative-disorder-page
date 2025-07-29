<template>
  <div class="sidebar">
    <!-- 1. 语言切换面板 -->
    <LanguageSlidePanel />

    <!-- 2. 哈雷彗星解密组件 -->
    <HalleysCometPuzzle :hidden="isLanguagePanelOpen" />

    <!-- 3. Rain of Love 功能 -->
    <RainOfLoveFeature :hidden="isLanguagePanelOpen" />

    <!-- 4. Steam 功能 -->
    <SteamFeature :hidden="isLanguagePanelOpen" />

    <!-- 5. 社交媒体功能 -->
    <SocialMediaFeature :hidden="isLanguagePanelOpen" />

    <!-- 未来可以继续添加更多功能组件 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import LanguageSlidePanel from "/src/components/features/language/LanguageSlidePanel.vue";
import HalleysCometPuzzle from "/src/components/features/halley/HalleysCometPuzzle.vue";
import RainOfLoveFeature from "/src/components/features/rainoflove/RainOfLoveFeature.vue";
import SteamFeature from "/src/components/features/steam/SteamFeature.vue";
import SocialMediaFeature from "/src/components/features/socialmedia/SocialMediaFeature.vue";

// 语言面板开关状态
const isLanguagePanelOpen = ref(false);

// 监听语言面板全局事件
const handleLanguagePanelToggle = (event) => {
  isLanguagePanelOpen.value = event.detail.isOpen;
};

// 生命周期
onMounted(() => {
  // 监听全局语言面板状态变化事件
  window.addEventListener("languagePanelToggle", handleLanguagePanelToggle);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener("languagePanelToggle", handleLanguagePanelToggle);
});
</script>

<style scoped>
.sidebar {
  /* 侧边栏容器样式 */
  position: relative;
  z-index: 1000;
}

/* 侧边栏功能组件布局说明:
 * 1. 语言切换面板 - top: 20px (固定在右上角)
 * 2. 哈雷彗星解密按钮 - top: 78px (语言按钮下方)
 * 3. Rain of Love 按钮 - top: 136px (哈雷按钮下方，58px间距)
 * 4. Steam 按钮 - top: 186px (Rain of Love 按钮下方，50px间距)
 * 5. Social Media 按钮 - top: 236px (Steam 按钮下方，50px间距)
 * 
 * 桌面端按钮间距: 50px (48px按钮高度 + 2px紧凑间距)
 * 移动端按钮间距: 52px (44px按钮高度 + 8px间距)
 * 未来添加新按钮: 下一个位置 = 236px + 50px = 286px
 */
</style>
