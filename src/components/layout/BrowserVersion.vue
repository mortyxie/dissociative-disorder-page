<template>
  <div class="w-full min-h-screen">
    <!-- PC端界面 -->
    <DesktopLayout v-if="isDesktop" />

    <!-- 移动端界面 -->
    <MobileLayout v-else />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import DesktopLayout from "/src/components/layout/DesktopLayout.vue";
import MobileLayout from "/src/components/layout/MobileLayout.vue";
import browserVersionController from "/src/script/BrowserVersionController.js";

// 直接从控制器获取响应式数据
const { isDesktop } = browserVersionController.getReactiveData();

// 生命周期钩子（如果需要额外的初始化逻辑）
onMounted(() => {});

onUnmounted(() => {});
</script>
