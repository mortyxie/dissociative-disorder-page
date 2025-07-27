<template>
  <div :style="countdownStyle">
    {{ formattedTime }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { createAspectRatioAwareCountdownStyle } from "/src/config/theme.js";
import browserVersionController from "/src/script/BrowserVersionController.js";

// 获取设备类型
const { deviceType } = browserVersionController.getReactiveData();

// 计算倒计时样式
const countdownStyle = computed(() => {
  const device = deviceType.value === "mobile" ? "mobile" : "desktop";
  return createAspectRatioAwareCountdownStyle(device);
});

// 目标时间戳: 2071年7月29日 00:00:00 (本地时间)
const targetTimestamp = new Date("2071-07-29T00:00:00").getTime();

// 响应式时间显示
const formattedTime = ref("0000:00:00:00");

// 定时器引用
let countdownInterval = null;

// 计算并格式化剩余时间
const updateCountdown = () => {
  const currentTimestamp = Date.now();
  const timeDiff = targetTimestamp - currentTimestamp;

  if (timeDiff <= 0) {
    formattedTime.value = "0000:00:00:00";
    return;
  }

  // 计算天、时、分、秒
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  // 格式化为 DDDD:HH:MM:SS
  formattedTime.value = `${String(days).padStart(4, "0")}:${String(
    hours
  ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
};

// 组件挂载时启动倒计时
onMounted(() => {
  // 立即更新一次
  updateCountdown();

  // 每秒更新一次
  countdownInterval = setInterval(updateCountdown, 1000);
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>
