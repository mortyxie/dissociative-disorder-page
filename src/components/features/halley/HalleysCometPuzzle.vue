<template>
  <div class="halley-comet-puzzle">
    <!-- 解密触发按钮 - 位置在语言切换下面 -->
    <button v-show="!hidden" @click="openPuzzle" class="puzzle-trigger-button">
      <span class="puzzle-icon">☄️</span>
    </button>

    <!-- 解密输入框模态窗口 -->
    <div v-if="isPuzzleOpen" class="puzzle-modal" @click.self="closePuzzle">
      <div class="puzzle-content">
        <!-- 提示文本 -->
        <div class="puzzle-hint">
          <span class="hint-text">B42L</span>
          <span class="hint-number" :style="{ color: hintNumberColor }">8</span>
        </div>

        <!-- 输入框 -->
        <input
          ref="puzzleInput"
          v-model="inputValue"
          @input="onInputChange"
          type="text"
          class="puzzle-input"
          :placeholder="placeholderText"
          autocomplete="off"
        />

        <!-- 尝试次数显示 -->
        <div v-if="attemptsText" class="attempts-display">
          {{ attemptsText }}
        </div>

        <!-- 状态提示 -->
        <div v-if="statusMessage" class="status-message" :class="statusClass">
          {{ statusMessage }}
        </div>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="isPuzzleOpen" class="puzzle-backdrop" @click="closePuzzle"></div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { getColor, getFontConfig } from "/src/config/theme.js";
import {
  validateAnswer,
  solveHalleysPuzzle,
  initHalleysCometPuzzle,
  getPuzzleState,
} from "/src/script/HalleysCometPuzzle.js";
import languageController from "/src/script/LanguageController.js";

// Props 定义
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
});

// 解密相关状态
const isPuzzleOpen = ref(false);
const inputValue = ref("");
const statusMessage = ref("");
const statusClass = ref("");
const puzzleInput = ref(null);
const placeholderText = ref("");
const attemptsText = ref("");
const hintNumberColor = ref("");

// 防止在清空输入框期间触发检测的标志
const isClearing = ref(false);
// 防止重复检测的标志 - 失败后清空之前不允许重复检测
const isProcessingValidation = ref(false);

// 获取翻译文本的辅助函数
const getTranslation = async (key) => {
  try {
    const translations = await languageController.getTranslations("languages");
    return translations[key] || key;
  } catch (error) {
    console.error("Translation error:", error);
    return key;
  }
};

// 更新尝试次数显示
const updateAttemptsDisplay = async () => {
  const state = getPuzzleState();
  const template = await getTranslation("web.halley.attempts");
  attemptsText.value = template.replace("{count}", state.attempts.toString());
};

// 计算提示数字的颜色（从白色渐变到绿色）
const calculateHintNumberColor = (attempts) => {
  if (attempts < 3) {
    // 少于3次尝试，保持白色
    return textColor;
  } else if (attempts >= 6) {
    // 6次或以上尝试，完全绿色
    return highlightColor;
  } else {
    // 3-5次尝试，从白色渐变到绿色
    const progress = (attempts - 3) / 3; // 0 到 1 的进度

    // 从白色 (#ffffff) 渐变到绿色 (highlightColor)
    // 这里使用简单的RGB插值
    const whiteRGB = { r: 255, g: 255, b: 255 };

    // 提取绿色值（假设highlightColor是十六进制格式）
    const greenHex = highlightColor.replace("#", "");
    const greenRGB = {
      r: parseInt(greenHex.substr(0, 2), 16),
      g: parseInt(greenHex.substr(2, 2), 16),
      b: parseInt(greenHex.substr(4, 2), 16),
    };

    // 计算插值
    const r = Math.round(whiteRGB.r + (greenRGB.r - whiteRGB.r) * progress);
    const g = Math.round(whiteRGB.g + (greenRGB.g - whiteRGB.g) * progress);
    const b = Math.round(whiteRGB.b + (greenRGB.b - whiteRGB.b) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  }
};

// 更新提示数字颜色
const updateHintNumberColor = () => {
  const state = getPuzzleState();
  hintNumberColor.value = calculateHintNumberColor(state.attempts);
};

// 获取主题颜色
const backgroundColor = getColor("background", "secondary");
const textColor = getColor("text", "primary");
const highlightColor = getColor("text", "high_light");
const fontConfig = getFontConfig("primary");

// 打开解密界面
const openPuzzle = async () => {
  isPuzzleOpen.value = true;
  inputValue.value = "";
  statusMessage.value = "";
  statusClass.value = "";

  // 获取提示文本
  placeholderText.value = await getTranslation("web.halley.hint");

  // 更新尝试次数显示
  await updateAttemptsDisplay();

  // 更新提示数字颜色
  updateHintNumberColor();

  // 等待DOM更新后聚焦输入框
  await nextTick();
  if (puzzleInput.value) {
    puzzleInput.value.focus();
  }
}; // 关闭解密界面
const closePuzzle = () => {
  isPuzzleOpen.value = false;
  inputValue.value = "";
  statusMessage.value = "";
  statusClass.value = "";
  // 重置所有标志
  isClearing.value = false;
  isProcessingValidation.value = false;
};

// 输入变化处理
const onInputChange = async () => {
  // 如果正在清空输入框，跳过检测
  if (isClearing.value) {
    return;
  }

  // 如果正在处理验证（失败后等待清空），跳过检测避免重复
  if (isProcessingValidation.value) {
    return;
  }

  // 只清除成功状态，保留失败状态的提示信息
  // 这样用户在失败后重新输入时，失败提示不会消失
  if (statusClass.value === "success") {
    statusMessage.value = "";
    statusClass.value = "";
  }

  // 当输入达到8位或以上字符时自动触发判定（检测所有字符，不只是数字）
  if (inputValue.value.length >= 8) {
    // 设置验证处理标志，防止重复检测
    isProcessingValidation.value = true;

    const isValid = validateAnswer(inputValue.value);

    // 更新尝试次数显示
    await updateAttemptsDisplay();

    if (isValid) {
      statusMessage.value = await getTranslation("web.halley.success");
      statusClass.value = "success";

      // 调用解密成功处理函数
      solveHalleysPuzzle();

      // 成功时重置验证标志
      isProcessingValidation.value = false;

      // 缩短成功界面自动关闭时间为1秒
      setTimeout(() => {
        closePuzzle();
      }, 1000);
    } else {
      // 随机选择一个失败消息（1-5）
      const randomIndex = Math.floor(Math.random() * 5) + 1;
      statusMessage.value = await getTranslation(
        `web.halley.failure.${randomIndex}`
      );
      statusClass.value = "error";

      // 更新提示数字颜色
      updateHintNumberColor();

      // 延迟0.5秒清空输入框，避免突兀感，同时防止用户删除字符时重复触发判断
      setTimeout(() => {
        isClearing.value = true; // 设置清空标志
        inputValue.value = "";
        // 清空完成后，等待一个短暂时间再重置所有标志
        setTimeout(() => {
          isClearing.value = false;
          isProcessingValidation.value = false; // 重置验证标志，允许下次检测
        }, 50); // 50ms 后重置标志
      }, 500);

      // 失败时保留hint提示信息，不自动清除，只有关闭组件再打开时才重置
      // 注释掉自动清除错误状态的逻辑
      // setTimeout(() => {
      //   statusMessage.value = "";
      //   statusClass.value = "";
      // }, 2000);
    }
  }
};

// 监听ESC键关闭窗口
const handleKeyDown = (event) => {
  if (event.key === "Escape" && isPuzzleOpen.value) {
    closePuzzle();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  // 初始化解密系统
  initHalleysCometPuzzle();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.halley-comet-puzzle {
  position: relative;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

/* 解密触发按钮样式 - 位置在语言切换按钮下面 */
.puzzle-trigger-button {
  position: fixed;
  top: 78px; /* 语言切换按钮下方 (20px + 48px + 10px) */
  right: 20px;
  width: 48px;
  height: 48px;
  background: v-bind("backgroundColor");
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  color: #ffffff;
}

.puzzle-trigger-button:hover {
  background: v-bind("backgroundColor");
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 解密图标样式 */
.puzzle-icon {
  font-size: 20px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.puzzle-trigger-button:hover .puzzle-icon {
  transform: rotate(15deg) scale(1.1);
}

/* 模态窗口样式 */
.puzzle-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
}

/* 解密内容容器 */
.puzzle-content {
  background: v-bind("backgroundColor");
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  min-width: 320px;
  max-width: 400px;
}

/* 提示文本样式 */
.puzzle-hint {
  font-size: 24px;
  font-weight: bold;
  color: v-bind("textColor");
  text-align: center;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

.hint-text {
  color: v-bind("textColor");
}

.hint-number {
  color: v-bind("highlightColor");
}

/* 输入框样式 */
.puzzle-input {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: v-bind("textColor");
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.puzzle-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.puzzle-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  letter-spacing: 1px;
}

/* 尝试次数显示样式 */
.attempts-display {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  margin-top: -8px;
  margin-bottom: 8px;
}

/* 状态消息样式 */
.status-message {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  transition: all 0.3s ease;
}

.status-message.success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-message.error {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* 背景遮罩 */
.puzzle-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1005;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .puzzle-trigger-button {
    top: 70px; /* 移动端调整位置 */
    right: 16px;
    width: 44px;
    height: 44px;
  }

  .puzzle-icon {
    font-size: 18px;
  }

  .puzzle-content {
    margin: 20px;
    padding: 24px;
    min-width: auto;
    max-width: calc(100vw - 40px);
  }

  .puzzle-hint {
    font-size: 20px;
  }

  .puzzle-input {
    font-size: 16px;
    padding: 14px;
  }
}

/* 聚焦样式 */
.puzzle-trigger-button:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* 禁用文本选择 */
.puzzle-trigger-button {
  user-select: none;
  -webkit-user-select: none;
}

/* 输入框动画效果 */
.puzzle-input {
  animation: slideInUp 0.4s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 内容容器动画 */
.puzzle-content {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
