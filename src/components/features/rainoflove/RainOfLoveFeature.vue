<template>
  <div class="rainoflove-feature">
    <!-- RainOfLove 触发按钮 -->
    <button
      v-show="!hidden"
      @click="openModal"
      class="rainoflove-trigger-button"
    >
      <img
        :src="rainOfLoveIcon"
        alt="Rain of Love"
        class="rainoflove-icon"
        @error="handleImageError"
      />
    </button>

    <!-- RainOfLove 信息模态窗口 -->
    <div v-if="isModalOpen" class="rainoflove-modal" @click.self="closeModal">
      <div class="rainoflove-content">
        <!-- 标题 -->
        <div class="rainoflove-title">
          {{ titleText }}
        </div>

        <!-- 介绍信息 -->
        <div class="rainoflove-intro">
          <p>{{ introText1 }}</p>
          <p>{{ introText2 }}</p>
        </div>

        <!-- 成员列表 -->
        <div class="rainoflove-members">
          <div class="members-label">{{ membersLabel }}</div>
          <div class="members-list">
            <div
              v-for="(member, index) in membersList"
              :key="index"
              class="member-item"
            >
              {{ member }}
            </div>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="rainoflove-contact">
          <p>{{ emailText }}</p>
          <div class="email-address">{{ emailAddress }}</div>
        </div>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div
      v-if="isModalOpen"
      class="rainoflove-backdrop"
      @click="closeModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getColor, getFontConfig } from "/src/config/theme.js";
import rainOfLoveIcon from "/src/assets/svg/rainoflove_icon.svg";
import languageController from "/src/script/LanguageController.js";

// Props 定义
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
});

// 响应式状态
const isModalOpen = ref(false);
const titleText = ref("雨爱戏剧社");
const introText1 = ref("我们是雨爱，一帮学生在一起用爱发电的小团队。");
const introText2 = ref("如果你对我们故事有兴趣，欢迎你的加入！");
const membersLabel = ref("成员:");
const membersList = ref(["牧阳", "叶星语", "第五律", "萱树落", "点点"]);
const emailText = ref("如果你想加入我们，欢迎发送邮件到:");
const emailAddress = ref("mortyestxie@gmail.com");

// 获取主题配置
const backgroundColor = getColor("background", "secondary");
const textColor = getColor("text", "primary");
const highlightColor = getColor("text", "high_light");
const fontConfig = getFontConfig("primary");

// 获取翻译文本的辅助函数
const getTranslation = async (key) => {
  try {
    const translations = await languageController.getTranslations("languages");
    return translations[key] || key;
  } catch (error) {
    console.error("Failed to get translation:", error);
    return key;
  }
};

// 更新翻译文本
const updateTexts = async () => {
  try {
    titleText.value = await getTranslation("web.rainoflove.title");
    introText1.value = await getTranslation("web.rainoflove.intro.1");
    introText2.value = await getTranslation("web.rainoflove.intro.2");
    membersLabel.value = await getTranslation("web.rainoflove.members");
    emailText.value = await getTranslation("web.rainoflove.email");
    emailAddress.value = await getTranslation("web.rainoflove.email.address");

    // 更新成员列表
    membersList.value = [
      await getTranslation("web.rainoflove.member.1"),
      await getTranslation("web.rainoflove.member.2"),
      await getTranslation("web.rainoflove.member.3"),
      await getTranslation("web.rainoflove.member.4"),
      await getTranslation("web.rainoflove.member.5"),
    ];
  } catch (error) {
    console.error("Failed to update texts:", error);
  }
};

// 打开模态窗口
const openModal = () => {
  isModalOpen.value = true;
  updateTexts();
};

// 关闭模态窗口
const closeModal = () => {
  isModalOpen.value = false;
};

// 图片加载错误处理
const handleImageError = (event) => {
  console.error("RainOfLove icon failed to load:", event);
  // 可以设置一个备用图标或文本
};

// 组件挂载时初始化
onMounted(() => {
  updateTexts();

  // 监听语言变化
  window.addEventListener("languageChanged", () => {
    updateTexts();
  });
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener("languageChanged", () => {
    updateTexts();
  });
});
</script>

<style scoped>
.rainoflove-feature {
  position: relative;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

/* RainOfLove 触发按钮样式 */
.rainoflove-trigger-button {
  position: fixed;
  top: 136px; /* 在 halley 按钮下方，统一间距 (78px + 58px) */
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

.rainoflove-trigger-button:hover {
  background: v-bind("backgroundColor");
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
}

/* RainOfLove 图标样式 */
.rainoflove-icon {
  width: 28px;
  height: 28px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rainoflove-trigger-button:hover .rainoflove-icon {
  transform: scale(1.1);
}

/* 模态窗口样式 */
.rainoflove-modal {
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

/* 内容容器 */
.rainoflove-content {
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
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

/* 标题样式 */
.rainoflove-title {
  font-size: 28px;
  font-weight: bold;
  color: v-bind("textColor");
  text-align: center;
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  margin-bottom: 8px;
}

/* 介绍文本样式 */
.rainoflove-intro {
  color: v-bind("textColor");
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  text-align: center;
  line-height: 1.6;
}

.rainoflove-intro p {
  margin: 0 0 12px 0;
  font-size: 16px;
}

/* 成员部分样式 */
.rainoflove-members {
  width: 100%;
  color: v-bind("textColor");
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
}

.members-label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
}

.members-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  justify-items: center;
  max-width: 300px;
  margin: 0 auto;
}

.member-item {
  font-size: 16px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  text-align: center;
  width: 120px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* 联系信息样式 */
.rainoflove-contact {
  width: 100%;
  color: v-bind("textColor");
  font-family: v-bind('`"${fontConfig.family}", ${fontConfig.fallback}`');
  text-align: center;
}

.rainoflove-contact p {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.email-address {
  font-size: 16px;
  font-weight: bold;
  color: v-bind("highlightColor");
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
}

/* 背景遮罩 */
.rainoflove-backdrop {
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

/* 内容容器动画 */
.rainoflove-content {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .rainoflove-trigger-button {
    top: 120px; /* 移动端调整位置 */
    right: 16px;
    width: 44px;
    height: 44px;
  }

  .rainoflove-icon {
    width: 24px;
    height: 24px;
  }

  .rainoflove-content {
    margin: 20px;
    padding: 24px;
    min-width: auto;
    max-width: calc(100vw - 40px);
  }

  .rainoflove-title {
    font-size: 24px;
  }

  .rainoflove-intro p {
    font-size: 14px;
  }

  .member-item {
    font-size: 14px;
    width: 100px;
    min-height: 32px;
    padding: 6px 8px;
  }

  .members-list {
    max-width: 220px;
  }

  .rainoflove-contact p {
    font-size: 14px;
  }

  .email-address {
    font-size: 14px;
  }
}

/* 聚焦样式 */
.rainoflove-trigger-button:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* 禁用文本选择 */
.rainoflove-trigger-button {
  user-select: none;
  -webkit-user-select: none;
}
</style>
