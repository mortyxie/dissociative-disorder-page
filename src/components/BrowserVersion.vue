<template>
  <div class="w-full h-screen flex items-center justify-center">
    <!-- PC端界面 -->
    <div v-if="isDesktop" class="p-10 max-w-4xl text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-5">PC端界面</h1>
      <p class="text-lg text-gray-600 mb-5">这是为桌面端设计的界面</p>
      <div class="mt-5 p-5 bg-gray-100 rounded-lg">
        <p class="my-2 text-gray-600">当前屏幕宽度: {{ screenWidth }}px</p>
        <p class="my-2 text-gray-600">设备类型: {{ deviceType }}</p>
      </div>
      <HalleyCometCountDown class="mt-8" />
      <ClickPopText class="mt-8" />
    </div>

    <!-- 移动端界面 -->
    <div v-else class="p-5 text-center w-full">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">移动端界面</h1>
      <p class="text-base text-gray-600 mb-4">这是为移动端设计的界面</p>
      <div class="mt-5 p-5 bg-gray-100 rounded-lg">
        <p class="my-2 text-gray-600">屏幕宽度: {{ screenWidth }}px</p>
        <p class="my-2 text-gray-600">设备: {{ deviceType }}</p>
      </div>
      <HalleyCometCountDown class="mt-6" />
      <ClickPopText class="mt-6" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import ClickPopText from "/src/components/ClickPopText.vue";
import HalleyCometCountDown from "/src/components/HalleyCometCountDown.vue";
import browserVersionController from "/src/script/BrowserVersionController.js";

// 直接从控制器获取响应式数据
const { isDesktop, deviceType, screenWidth } =
  browserVersionController.getReactiveData();

// 生命周期钩子（如果需要额外的初始化逻辑）
onMounted(() => {
  console.log("BrowserVersion 组件已挂载");
});

onUnmounted(() => {
  console.log("BrowserVersion 组件已卸载");
});
</script>
