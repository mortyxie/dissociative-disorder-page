// 响应式Hook - 处理屏幕尺寸变化和动态缩放配置
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { calculateResponsiveScale, getDynamicImageConfig, getDynamicSpacing } from '/src/config/theme.js';

export function useResponsive() {
  // 屏幕尺寸
  const screenWidth = ref(window.innerWidth);
  const screenHeight = ref(window.innerHeight);

  // 更新屏幕尺寸
  const updateScreenSize = () => {
    screenWidth.value = window.innerWidth;
    screenHeight.value = window.innerHeight;
  };

  // 响应式的动态图片配置获取函数
  const getImageConfig = (name, device = 'desktop') => {
    return computed(() => {
      // 触发响应式依赖
      const width = screenWidth.value;
      const height = screenHeight.value;
      const config = getDynamicImageConfig(name, device);
      
      if (!config) return {};

      return {
        top: config.position?.top || "0px",
        left: config.position?.left || "0px",
        right: config.position?.right || "auto",
        transform: `scale(${config.scale}) rotate(${config.rotation || 0}deg)`,
        zIndex: config.zIndex || 1,
      };
    });
  };

  // 响应式的动态spacing配置获取函数
  const getSpacingConfig = (type, device = 'desktop') => {
    return computed(() => {
      // 触发响应式依赖
      const width = screenWidth.value;
      const height = screenHeight.value;
      const config = getDynamicSpacing(type, device);
      
      if (!config) return {};

      // 为倒计时组件返回像素定位
      if (type === 'countdownPosition') {
        return {
          top: config.top || "0px",
          left: config.left || "0px", 
          transform: config.transform || "scale(1)",
          zIndex: config.zIndex || 1,
        };
      }

      // 其他spacing配置的原有逻辑
      return {
        transform: config.transform || "scale(1)",
        zIndex: config.zIndex || 1,
      };
    });
  };

  // 获取动态缩放值
  const getScale = (baseScale) => {
    return computed(() => {
      // 触发响应式依赖
      const width = screenWidth.value;
      const height = screenHeight.value;
      return calculateResponsiveScale(baseScale);
    });
  };

  // 监听窗口大小变化
  let resizeTimeout = null;
  const handleResize = () => {
    // 防抖处理，避免频繁更新
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateScreenSize, 100);
  };

  onMounted(() => {
    updateScreenSize();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });

  return {
    screenWidth,
    screenHeight,
    getImageConfig,
    getSpacingConfig,
    getScale,
    updateScreenSize
  };
}
