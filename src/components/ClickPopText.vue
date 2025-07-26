<template>
  <div
    class="click-area-container relative w-full h-full"
    @click="handleAreaClick"
  >
    <!-- 可点击的碰撞箱区域 -->
    <div
      class="collision-box absolute border-2 border-dashed border-gray-400 bg-gray-100 bg-opacity-30 hover:bg-opacity-50 transition-all duration-200"
      :style="collisionBoxStyle"
    >
      <span class="absolute top-1 left-1 text-xs text-gray-500">点击区域</span>
    </div>

    <!-- 动态弹出的文本，根据点击位置显示 -->
    <div
      v-if="showPopText"
      :class="textClass"
      class="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 pointer-events-none z-10 transition-all duration-300"
      :style="popTextStyle"
    >
      {{ currentText }}
      <!-- 小三角箭头指向点击位置 -->
      <div
        class="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"
        :style="arrowStyle"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import clickPopTextController from "/src/script/ClickPopTextController.js";

// 获取响应式数据
const { currentText, textClass } = clickPopTextController.getReactiveData();

// 弹出文本的显示状态和位置
const showPopText = ref(false);
const popTextPosition = ref({ x: 0, y: 0 });
const clickPosition = ref({ x: 0, y: 0 });
const hideTimeout = ref(null); // 存储自动隐藏的定时器

// 碰撞箱的配置（可以根据需要调整）
const collisionBox = ref({
  x: 50, // 距离左边的像素
  y: 100, // 距离顶部的像素
  width: 300, // 宽度
  height: 200, // 高度
});

// 碰撞箱的样式
const collisionBoxStyle = computed(() => ({
  left: `${collisionBox.value.x}px`,
  top: `${collisionBox.value.y}px`,
  width: `${collisionBox.value.width}px`,
  height: `${collisionBox.value.height}px`,
}));

// 弹出文本的样式
const popTextStyle = computed(() => ({
  left: `${popTextPosition.value.x}px`,
  top: `${popTextPosition.value.y}px`,
  maxWidth: "200px",
}));

// 箭头的样式
const arrowStyle = computed(() => ({
  left: "50%",
  bottom: "-8px",
  transform: "translateX(-50%)",
}));

// 检查点击是否在碰撞箱内
const isClickInCollisionBox = (clickX, clickY) => {
  const box = collisionBox.value;
  return (
    clickX >= box.x &&
    clickX <= box.x + box.width &&
    clickY >= box.y &&
    clickY <= box.y + box.height
  );
};

// 根据点击位置计算弹出文本的显示位置
const calculatePopTextPosition = (clickX, clickY) => {
  const offset = 20; // 文本框距离点击位置的偏移

  // 基本位置：点击位置上方
  let x = clickX - 100; // 减去文本框宽度的一半
  let y = clickY - 60; // 在点击位置上方

  // 边界检查，确保文本框不会超出屏幕
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;

  if (x < 10) x = 10;
  if (x > containerWidth - 210) x = containerWidth - 210;
  if (y < 10) y = clickY + offset; // 如果上方空间不够，显示在下方

  return { x, y };
};

// 处理区域点击事件
const handleAreaClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  console.log(`点击位置: (${clickX}, ${clickY})`);

  // 检查是否在碰撞箱内
  if (isClickInCollisionBox(clickX, clickY)) {
    console.log("点击在碰撞箱内，触发文本显示");

    // 如果有正在运行的隐藏定时器，清除它
    if (hideTimeout.value) {
      clearTimeout(hideTimeout.value);
      console.log("清除之前的自动隐藏定时器");
    }

    // 保存点击位置
    clickPosition.value = { x: clickX, y: clickY };

    // 触发文本更新
    clickPopTextController.handleClick();

    // 计算弹出文本位置
    popTextPosition.value = calculatePopTextPosition(clickX, clickY);

    // 显示弹出文本
    showPopText.value = true;

    // 设置新的3秒自动隐藏定时器
    hideTimeout.value = setTimeout(() => {
      showPopText.value = false;
      hideTimeout.value = null;
      console.log("文本自动隐藏");
    }, 3000);

    console.log("设置新的5秒自动隐藏定时器");
  } else {
    console.log("点击在碰撞箱外，不触发");

    // 点击在碰撞箱外，立即隐藏文本并清除定时器
    if (hideTimeout.value) {
      clearTimeout(hideTimeout.value);
      hideTimeout.value = null;
    }
    showPopText.value = false;
  }
};

// 组件挂载时初始化
onMounted(async () => {
  await clickPopTextController.initialize();
});
</script>
