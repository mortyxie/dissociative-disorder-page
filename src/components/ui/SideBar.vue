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
  console.log(
    "侧边栏接收到语言面板状态变化:",
    event.detail.isOpen ? "打开" : "关闭"
  );
};

// 生命周期
onMounted(() => {
  console.log("SideBar 组件已挂载");
  // 监听全局语言面板状态变化事件
  window.addEventListener("languagePanelToggle", handleLanguagePanelToggle);
});

onUnmounted(() => {
  console.log("SideBar 组件已卸载");
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
 * 3. Rain of Love 按钮 - top: 136px (哈雷按钮下方，统一58px间距)
 * 4. Steam 按钮 - top: 194px (Rain of Love 按钮下方，统一58px间距)
 * 
 * 按钮间距: 58px (48px按钮高度 + 10px间距)
 * 未来添加新按钮: 下一个位置 = 194px + 58px = 252px
 */
</style>
