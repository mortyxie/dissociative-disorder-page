// 主题配置文件 - 统一管理应用的颜色、样式等设计系统

// 统一的宽高比配置 - 所有组件共享（图片、倒计时等）
export const aspectRatioConfigs = {
  // 桌面端宽高比配置
  desktop: {
    '16:9': {
      fontSizeAdjustment: 1.0,     // 字体大小调整（倒计时等文本元素）
      widthAdjustment: 1.0,        // 宽度调整（图片等）
      heightAdjustment: 1.0,       // 高度调整（图片等）
      positionAdjustment: { top: 0, left: 0 }
    },
    '16:10': {
      fontSizeAdjustment: 0.95,
      widthAdjustment: 0.9,
      heightAdjustment: 1.1,
      positionAdjustment: { top: '2%', left: 0 }
    },
    '21:9': {
      fontSizeAdjustment: 1.1,
      widthAdjustment: 1.2,
      heightAdjustment: 0.8,
      positionAdjustment: { top: '1%', left: '5%' }
    }
  },
  
  // 移动端宽高比配置
  mobile: {
    '9:16': {
      fontSizeAdjustment: 1.0,
      widthAdjustment: 1.0,
      heightAdjustment: 1.0,
      positionAdjustment: { top: 0, left: 0, right: 0 }
    },
    '9:18': {
      fontSizeAdjustment: 0.95,
      widthAdjustment: 0.9,
      heightAdjustment: 1.1,
      positionAdjustment: { top: '2%', left: '2%', right: '2%' }
    },
    '9:19.5': {
      fontSizeAdjustment: 0.9,
      widthAdjustment: 0.85,
      heightAdjustment: 1.15,
      positionAdjustment: { top: '3%', left: '3%', right: '3%' }
    },
    '3:4': {
      fontSizeAdjustment: 1.1,
      widthAdjustment: 1.2,
      heightAdjustment: 0.8,
      positionAdjustment: { top: '1%', left: '-2%', right: '-2%' }
    }
  }
};

// 获取宽高比配置的辅助函数
export const getAspectRatioConfig = (device = 'desktop', aspectRatio = null) => {
  const deviceConfig = aspectRatioConfigs[device];
  if (!deviceConfig) return null;
  
  if (aspectRatio) {
    return deviceConfig[aspectRatio];
  }
  
  // 如果没有指定宽高比，返回整个设备配置
  return deviceConfig;
};

export const themeConfig = {
  // 通用配置 - 所有设备共享
  common: {
    // 颜色系统
    colors: {
      // 主背景色
      background: {
        primary: '#312F40',      // 主背景色
        secondary: '#201E28',    // 次要背景色（如果需要层级）
        accent: '#3D3A4F'        // 强调背景色
      },
      
      // 文本颜色
      text: {
        primary: '#FFFFFF',      // 主要文本色
        secondary: '#1F2937',    // 次要文本色
        high_light: '#92D4B8',   // 第三文本色
        muted: '#9CA3AF'         // 静音文本色
      },
      
      // 界面元素颜色
      ui: {
        white: '#FFFFFF',
        border: '#D1D5DB',       // gray-300
        focus: '#3B82F6',        // blue-500
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      
      // 半透明层
      overlay: {
        light: 'rgba(255, 255, 255, 0.8)',      // 亮色半透明
        medium: 'rgba(255, 255, 255, 0.9)',     // 中等半透明
        background: 'rgba(255, 255, 255, 0.7)'  // 背景半透明
      },
      
      // 像素风对话框颜色
      dialog: {
        background: 'rgba(49, 47, 64, 0.95)',   // 深色背景，与主背景色接近
        border: '#D1D5DB',                      // 亮色边框
        shadow: 'rgba(0, 0, 0, 0.4)',          // 深色阴影
        text: '#FFFFFF'                         // 白色文字
      }
    },
    
    // 通用布局配置
    layout: {
      borderRadius: {
        small: '0.375rem',       // rounded-md
        medium: '0.5rem',        // rounded-lg
        large: '0.75rem'         // rounded-xl
      }
    },
    
    // 通用组件样式
    components: {
      // 主容器样式
      container: 'relative min-h-screen w-full overflow-hidden',
      
      // 信息框样式
      infoBox: 'mt-5 p-5 bg-gray-100 bg-opacity-70 rounded-lg'
    },
    
    // 字体配置
    fonts: {
      primary: {
        family: 'BoutiqueBitmap9x9',
        fallback: '"Courier New", "Consolas", "Monaco", monospace',
        weights: {
          normal: 'normal',
          bold: 'bold'
        }
      }
    }
  },

  // 设备特定配置
  devices: {
    // 桌面端配置
    desktop: {
      layout: {
        maxWidth: '64rem',        // max-w-4xl
        padding: '2.5rem'         // p-10
      },
      
      components: {
        // 内容区域样式
        contentArea: 'relative z-10 p-10 max-w-4xl text-center mx-auto min-h-screen flex flex-col justify-center',
        
        // 语言选择器样式
        languageSelector: 'px-3 py-2 border border-gray-300 rounded-md bg-white bg-opacity-90 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg',
        
        // 主要内容卡片样式
        contentCard: 'bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-8 shadow-2xl',
        
        // ClickPopText 组件样式
        clickPopText: {
          container: 'fixed inset-0 w-screen h-screen pointer-events-auto z-[500]',
          popText: 'fixed pointer-events-none z-[501] select-none font-medium leading-relaxed break-words whitespace-pre-wrap',
          // 像素风边框样式通过自定义类实现
          pixelBorder: 'border-2 border-solid rounded-none shadow-pixel',
          // 响应式字体大小
          fontSize: {
            desktop: 'text-base', // 16px
            tablet: 'text-sm',    // 14px  
            mobile: 'text-xs'     // 12px
          },
          // 响应式内边距
          padding: {
            desktop: 'px-5 py-4', // 20px 16px
            tablet: 'px-4 py-3',  // 16px 12px
            mobile: 'px-3 py-2'   // 12px 8px
          },
          // 响应式最大宽度
          maxWidth: {
            desktop: 'max-w-xs',  // 20rem / 320px
            tablet: 'max-w-48',   // 12rem / 192px  
            mobile: 'max-w-44'    // 11rem / 176px
          }
        }
      },
      
      typography: {
        heading: 'text-4xl font-bold text-gray-800 mb-5',
        subtitle: 'text-lg text-gray-600 mb-5',
        body: 'my-2 text-gray-600'
      },
      
      spacing: {
        component: 'mt-8',
        languageSelector: 'absolute top-4 right-4'
      },
      
      // 倒计时组件配置
      countdown: {
        fontSize: '3vw',           // 使用视口宽度单位，响应式字体大小
        fontWeight: 'bold',        // 字体粗细
        color: '#FFFFFF',          // 字体颜色
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)', // 文字阴影
        minFontSize: '1.5rem',     // 最小字体大小
        maxFontSize: '4rem',       // 最大字体大小
        position: {
          top: '10%',
          left: '24%'
        },
        transform: 'translateX(-50%)', // 水平居中
        zIndex: 20
        // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.desktop
      },

      // 桌面端PNG图片配置 - 使用响应式尺寸和宽高比适配
      images: {
        logo:{
          // 基础尺寸配置
          width: '15vw',           // 视口宽度的15%
          scale: 1.4,              // logo保持原始大小
          minWidth: '200px',       // 最小宽度
          maxWidth: '400px',       // 最大宽度
          rotation: 0,
          zIndex: 10,
          position: {
            top: '32%',
            left: '17%'
          }
          // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.desktop
        },
        muyang: {
          width: '25vw',           // 基础响应式宽度
          scale: 4.5,              // 额外的缩放倍数
          minWidth: '300px',       
          maxWidth: '600px',       
          rotation: 20,
          zIndex: 1,
          position: {
            top: '70%',
            left: '45%'
          }
          // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.desktop
        },
        xingyu: {
          width: '25vw',           // 基础响应式宽度
          scale: 4.5,              // 额外的缩放倍数
          minWidth: '300px',       
          maxWidth: '600px',       
          rotation: 20,
          zIndex: 1,
          position: {
            top: '70%',
            left: '45%'
          }
          // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.desktop
        }
      }
    },

    // 移动端配置
    mobile: {
      layout: {
        maxWidth: '100%',
        padding: '1.25rem'        // p-5
      },
      
      components: {
        // 内容区域样式
        contentArea: 'relative z-10 p-5 text-center w-full min-h-screen flex flex-col justify-center',
        
        // 语言选择器样式
        languageSelector: 'px-2 py-1 border border-gray-300 rounded bg-white bg-opacity-90 backdrop-blur-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent shadow-lg',
        
        // 主要内容卡片样式
        contentCard: 'bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-2xl mx-2',
        
        // ClickPopText 组件样式 - 移动端
        clickPopText: {
          container: 'fixed inset-0 w-screen h-screen pointer-events-auto z-[500]',
          popText: 'fixed pointer-events-none z-[501] select-none font-medium leading-relaxed break-words whitespace-pre-wrap',
          pixelBorder: 'border border-solid rounded-none shadow-pixel-mobile',
          fontSize: {
            desktop: 'text-sm',   // 14px - 移动端用较小字体  
            tablet: 'text-sm',    // 14px
            mobile: 'text-xs'     // 12px
          },
          padding: {
            desktop: 'px-4 py-3', // 16px 12px - 移动端用较小内边距
            tablet: 'px-4 py-3',
            mobile: 'px-3 py-2'
          },
          maxWidth: {
            desktop: 'max-w-48',  // 12rem / 192px - 移动端用较小宽度
            tablet: 'max-w-48', 
            mobile: 'max-w-44'
          }
        }
      },
      
      typography: {
        heading: 'text-3xl font-bold text-gray-800 mb-4',
        subtitle: 'text-base text-gray-600 mb-4',
        body: 'my-2 text-gray-600'
      },
      
      spacing: {
        component: 'mt-6',
        languageSelector: 'absolute top-2 right-2'
      },
      
      // 移动端倒计时组件配置
      countdown: {
        fontSize: '6vw',           // 移动端使用更大的视口宽度单位
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
        minFontSize: '1rem',       // 移动端最小字体大小
        maxFontSize: '2.5rem',     // 移动端最大字体大小
        position: {
          top: '20%',
          left: '50%'
        },
        transform: 'translateX(-50%)',
        zIndex: 20
        // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.mobile
      },

      // 移动端PNG图片配置 - 使用响应式尺寸和宽高比适配
      images: {
        muyang: {
          width: '40vw',           
          minWidth: '150px',       
          maxWidth: '300px',       
          rotation: 10,
          zIndex: 1,
          position: {
            top: '5%',
            left: '5%'
          }
          // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.mobile
        },
        xingyu: {
          width: '35vw',           
          minWidth: '120px',       
          maxWidth: '250px',       
          rotation: -8,
          zIndex: 1,
          position: {
            top: '15%',
            right: '5%'
          }
          // 注意：aspectRatioConfig 现在使用共享配置 aspectRatioConfigs.mobile
        }
      }
    }
  }
};

// 导出便捷的样式获取函数
export const getStyles = (component, device = 'desktop') => {
  // 优先从设备特定配置获取，否则从通用配置获取
  return themeConfig.devices[device]?.components[component] || 
         themeConfig.common.components[component];
};

export const getColor = (category, name) => {
  return themeConfig.common.colors[category]?.[name];
};

export const getTypography = (type, device = 'desktop') => {
  return themeConfig.devices[device]?.typography[type];
};

export const getSpacing = (type, device = 'desktop') => {
  return themeConfig.devices[device]?.spacing[type];
};

// 字体配置获取函数
export const getFontConfig = (fontType = 'primary') => {
  return themeConfig.common.fonts[fontType];
};

// 倒计时配置获取函数
export const getCountdownConfig = (device = 'desktop') => {
  return themeConfig.devices[device]?.countdown;
};

// PNG图片配置获取函数
export const getImageConfig = (name, device = 'desktop') => {
  return themeConfig.devices[device]?.images[name];
};

// 创建响应式图片样式函数
export const createResponsiveImageStyle = (imageName, device = 'desktop') => {
  const config = getImageConfig(imageName, device);
  if (!config) return {};

  // 构建基础变换字符串
  let transforms = [];
  
  // 添加旋转
  if (config.rotation) {
    transforms.push(`rotate(${config.rotation}deg)`);
  }
  
  // 添加缩放
  if (config.scale) {
    transforms.push(`scale(${config.scale})`);
  }

  const style = {
    zIndex: config.zIndex,
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    width: config.width,
    height: 'auto', // 保持宽高比
  };

  // 添加最小和最大宽度限制
  if (config.minWidth) {
    style.minWidth = config.minWidth;
  }
  if (config.maxWidth) {
    style.maxWidth = config.maxWidth;
  }

  // 处理位置属性
  Object.keys(config.position).forEach(key => {
    style[key] = config.position[key];
  });

  return style;
};

// 高级响应式图片样式函数 - 支持屏幕密度调整
export const createAdvancedResponsiveImageStyle = (imageName, device = 'desktop', options = {}) => {
  const baseStyle = createResponsiveImageStyle(imageName, device);
  if (!baseStyle.width) return baseStyle;

  // 获取屏幕密度比（devicePixelRatio）
  const pixelRatio = window.devicePixelRatio || 1;
  
  // 获取实际屏幕宽度
  const screenWidth = window.innerWidth;
  
  // 根据屏幕密度和分辨率进行调整
  let adjustmentFactor = 1;
  
  // 高密度屏幕（如Retina）调整
  if (pixelRatio >= 2) {
    adjustmentFactor *= 0.8; // 在高密度屏幕上稍微缩小
  } else if (pixelRatio <= 1.25) {
    adjustmentFactor *= 1.1; // 在低密度屏幕上稍微放大
  }
  
  // 超宽屏幕调整
  if (screenWidth >= 2560) {
    adjustmentFactor *= 0.9;
  } else if (screenWidth >= 1920) {
    adjustmentFactor *= 0.95;
  }
  
  // 应用用户自定义调整
  if (options.scaleFactor) {
    adjustmentFactor *= options.scaleFactor;
  }
  
  // 修改宽度
  const vwMatch = baseStyle.width.match(/(\d+(?:\.\d+)?)vw/);
  if (vwMatch) {
    const vwValue = parseFloat(vwMatch[1]) * adjustmentFactor;
    baseStyle.width = `${vwValue}vw`;
  }
  
  return baseStyle;
};

// 屏幕宽高比检测函数
export const detectAspectRatio = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / height;
  
  // 判断是否为移动端（通常竖屏）
  if (ratio < 1) {
    // 移动端竖屏模式 - 使用 宽:高 的比例表示
    const mobileRatio = width / height;
    
    if (mobileRatio >= 0.45 && mobileRatio < 0.52) return '9:19.5';  // 刘海屏手机 (约0.46)
    if (mobileRatio >= 0.5 && mobileRatio < 0.57) return '9:18';     // 长屏手机 (约0.5)
    if (mobileRatio >= 0.56 && mobileRatio < 0.64) return '9:16';    // 标准手机 (约0.5625)
    if (mobileRatio >= 0.7 && mobileRatio < 0.8) return '3:4';       // 平板竖屏 (0.75)
    
    // 默认移动端比例
    return '9:16';
  }
  
  // 桌面端横屏模式
  if (ratio >= 2.3) return '21:9';              // 超宽屏
  if (ratio >= 1.77 && ratio < 1.79) return '16:9';     // 标准宽屏
  if (ratio >= 1.59 && ratio < 1.61) return '16:10';    // 宽屏显示器
  if (ratio >= 1.5 && ratio < 1.7) return '3:2';        // Surface等
  if (ratio >= 1.3 && ratio < 1.4) return '4:3';        // 传统显示器
  
  // 默认返回16:9
  return '16:9';
};

// 获取宽高比调整因子
export const getAspectRatioAdjustment = (imageName, device = 'desktop') => {
  const currentAspectRatio = detectAspectRatio();
  
  // 使用统一的宽高比配置
  const deviceAspectRatioConfig = getAspectRatioConfig(device);
  if (!deviceAspectRatioConfig) return null;
  
  // 根据设备类型设置默认宽高比
  const defaultRatio = device === 'mobile' ? '9:16' : '16:9';
  
  return deviceAspectRatioConfig[currentAspectRatio] || deviceAspectRatioConfig[defaultRatio];
};

// 通用的宽高比适配样式函数 - 可用于任何组件
export const createAspectRatioAwareStyle = (baseStyle, device = 'desktop', options = {}) => {
  const deviceAspectRatioConfig = getAspectRatioConfig(device);
  if (!deviceAspectRatioConfig) return baseStyle;
  
  const currentAspectRatio = detectAspectRatio();
  const defaultRatio = device === 'mobile' ? '9:16' : '16:9';
  const adjustment = deviceAspectRatioConfig[currentAspectRatio] || deviceAspectRatioConfig[defaultRatio];
  
  if (!adjustment) return baseStyle;
  
  const adjustedStyle = { ...baseStyle };
  
  // 调整字体大小（如果是文本元素）
  if (options.adjustFontSize !== false && baseStyle.fontSize && adjustment.fontSizeAdjustment && adjustment.fontSizeAdjustment !== 1.0) {
    // 检查是否使用了 clamp() 函数
    const clampMatch = baseStyle.fontSize.match(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    if (clampMatch) {
      // 解析 clamp(min, preferred, max) 中的 preferred 值
      const minSize = clampMatch[1].trim();
      const preferredSize = clampMatch[2].trim();
      const maxSize = clampMatch[3].trim();
      
      // 调整 preferred 值
      let adjustedPreferred = preferredSize;
      const vwMatch = preferredSize.match(/(\d+(?:\.\d+)?)vw/);
      if (vwMatch) {
        const vwValue = parseFloat(vwMatch[1]) * adjustment.fontSizeAdjustment;
        adjustedPreferred = `${vwValue}vw`;
      }
      
      adjustedStyle.fontSize = `clamp(${minSize}, ${adjustedPreferred}, ${maxSize})`;
    } else {
      // 处理普通的字体大小值
      const currentSize = parseFloat(baseStyle.fontSize);
      const unit = baseStyle.fontSize.replace(currentSize.toString(), '');
      adjustedStyle.fontSize = `${currentSize * adjustment.fontSizeAdjustment}${unit}`;
    }
  }
  
  // 调整宽度（如果是图片等元素）
  if (options.adjustWidth !== false && baseStyle.width && adjustment.widthAdjustment !== 1.0) {
    const vwMatch = baseStyle.width.match(/(\d+(?:\.\d+)?)vw/);
    if (vwMatch) {
      const vwValue = parseFloat(vwMatch[1]) * adjustment.widthAdjustment;
      adjustedStyle.width = `${vwValue}vw`;
    }
  }
  
  // 调整高度（如果需要拉伸或压缩）
  if (options.adjustHeight !== false && adjustment.heightAdjustment !== 1.0) {
    const existingTransform = adjustedStyle.transform || '';
    const scaleY = `scaleY(${adjustment.heightAdjustment})`;
    
    if (existingTransform) {
      adjustedStyle.transform = `${existingTransform} ${scaleY}`;
    } else {
      adjustedStyle.transform = scaleY;
    }
    
    // 为16:10屏幕添加特殊的object-fit策略
    const currentRatio = detectAspectRatio();
    if (currentRatio === '16:10' && device === 'desktop') {
      adjustedStyle.objectFit = 'contain';
      adjustedStyle.objectPosition = 'center';
    }
  }
  
  // 调整位置
  if (adjustment.positionAdjustment) {
    Object.keys(adjustment.positionAdjustment).forEach(key => {
      const value = adjustment.positionAdjustment[key];
      if (value !== 0) {
        if (adjustedStyle[key] && typeof adjustedStyle[key] === 'string' && adjustedStyle[key].includes('%')) {
          const originalValue = parseFloat(adjustedStyle[key]);
          const adjustmentValue = typeof value === 'string' ? parseFloat(value) : value;
          adjustedStyle[key] = `${originalValue + adjustmentValue}%`;
        } else if (typeof value === 'string') {
          adjustedStyle[key] = value;
        }
      }
    });
  }
  
  return adjustedStyle;
};

// 创建倒计时组件样式函数
export const createCountdownStyle = (device = 'desktop') => {
  const config = getCountdownConfig(device);
  if (!config) return {};

  const fontConfig = getFontConfig('primary');
  
  const style = {
    position: 'absolute',
    top: config.position.top,
    left: config.position.left,
    transform: config.transform,
    zIndex: config.zIndex,
    fontSize: `clamp(${config.minFontSize}, ${config.fontSize}, ${config.maxFontSize})`, // 响应式字体大小，带最小最大限制
    fontWeight: config.fontWeight,
    color: config.color,
    textShadow: config.textShadow,
    fontFamily: `"${fontConfig.family}", ${fontConfig.fallback}`,
    userSelect: 'none',
    pointerEvents: 'none'
  };

  return style;
};

// 应用宽高比调整的样式函数
export const createAspectRatioAwareImageStyle = (imageName, device = 'desktop') => {
  const baseStyle = createResponsiveImageStyle(imageName, device);
  return createAspectRatioAwareStyle(baseStyle, device, {
    adjustFontSize: false,  // 图片不需要调整字体大小
    adjustWidth: true,      // 需要调整宽度
    adjustHeight: true      // 需要调整高度
  });
};

// 创建宽高比适配的倒计时样式函数
export const createAspectRatioAwareCountdownStyle = (device = 'desktop') => {
  const baseStyle = createCountdownStyle(device);
  return createAspectRatioAwareStyle(baseStyle, device, {
    adjustFontSize: true,   // 需要调整字体大小
    adjustWidth: false,     // 倒计时不需要调整宽度
    adjustHeight: false     // 倒计时不需要调整高度
  });
};

// 获取 ClickPopText 组件样式
export const getClickPopTextConfig = (device = 'desktop') => {
  return themeConfig.devices[device]?.components?.clickPopText;
};

export const getLayout = (property, device = 'desktop') => {
  return themeConfig.devices[device]?.layout[property] || 
         themeConfig.common.layout[property];
};

// 导出默认配置
export default themeConfig;
