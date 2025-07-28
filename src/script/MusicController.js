// 此脚本控制音乐播放

// 音频实例
let audioInstance = null;
let isPlaying = false;

// 初始化音频
function initAudio() {
  if (!audioInstance) {
    audioInstance = new Audio('/src/assets/music/Roche_loop.mp3');
    audioInstance.loop = true; // 循环播放
    audioInstance.volume = 0.5; // 设置音量为50%
    
    audioInstance.addEventListener('ended', () => {
      isPlaying = false;
      console.log('音乐播放结束');
    });
    
    audioInstance.addEventListener('error', (error) => {
      console.error('音乐加载失败:', error);
    });
  }
  return audioInstance;
}

// 播放音乐
function playMusic() {
  try {
    const audio = initAudio();
    
    if (audio && !isPlaying) {
      audio.play()
        .then(() => {
          isPlaying = true;
          console.log('🎵 音乐开始播放: Roche_loop.mp3');
          
          // 保存播放状态到localStorage
          localStorage.setItem('musicPlaying', 'true');
        })
        .catch((error) => {
          console.error('音乐播放失败:', error);
        });
    }
  } catch (error) {
    console.error('音乐播放异常:', error);
  }
}

// 暂停音乐
function pauseMusic() {
  try {
    if (audioInstance && isPlaying) {
      audioInstance.pause();
      isPlaying = false;
      console.log('🔇 音乐已暂停');
      
      // 更新localStorage状态
      localStorage.setItem('musicPlaying', 'false');
    }
  } catch (error) {
    console.error('音乐暂停异常:', error);
  }
}

// 停止音乐
function stopMusic() {
  try {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0; // 重置到开头
      isPlaying = false;
      console.log('⏹️ 音乐已停止');
      
      // 清除localStorage状态
      localStorage.removeItem('musicPlaying');
    }
  } catch (error) {
    console.error('音乐停止异常:', error);
  }
}

// 检查音乐播放状态
function isMusicPlaying() {
  return isPlaying;
}

// 获取音频实例
function getAudioInstance() {
  return audioInstance;
}

// 页面刷新时检查是否应该播放音乐
function checkMusicPlayState() {
  // 页面刷新时总是停止音乐，不自动恢复播放
  // 只有重新解密成功才会播放音乐
  localStorage.removeItem('musicPlaying');
  
  if (audioInstance) {
    stopMusic();
  }
  
  console.log('🔄 页面刷新，音乐状态已重置');
}

// 页面卸载时停止音乐
function cleanupMusic() {
  if (audioInstance) {
    stopMusic();
    audioInstance = null;
  }
}

// 导出所有函数
export {
  playMusic,
  pauseMusic,
  stopMusic,
  isMusicPlaying,
  getAudioInstance,
  checkMusicPlayState,
  cleanupMusic
}

// document.addEventListener('DOMContentLoaded', function() {
//   const audio = document.getElementById('bgMusic');
//   const volumeBtn = document.getElementById('volumeBtn');
//   const volumeIcon = document.getElementById('volumeIcon');
//   const playHint = document.getElementById('playHint');
//   const loading = document.getElementById('loading');
//   const mainImage = document.getElementById('mainImage');
  
//   let isMuted = true; // 默认禁音
//   let isPlaying = false;
//   let hasStarted = false; // 标记是否已经开始过播放

//   // 音量控制状态
//   const updateVolumeIcon = () => {
//     if (!hasStarted) {
//       volumeIcon.textContent = '🔇';
//     } else if (isMuted) {
//       volumeIcon.textContent = '🔇';
//     } else {
//       volumeIcon.textContent = '🔊';
//     }
//   };

//   // 启动音乐的函数
//   const startMusic = () => {
//     if (audio) {
//       audio.volume = 0.3;
//       audio.muted = isMuted;
      
//       return audio.play().then(() => {
//         isPlaying = true;
//         updateVolumeIcon();
//         console.log('音乐开始播放');
//         return true;
//       }).catch((error) => {
//         console.error('播放失败:', error);
//         return false;
//       });
//     }
//     return Promise.resolve(false);
//   };

//   // 音量按钮点击事件 - 只用于静音控制
//   volumeBtn.addEventListener('click', (e) => {
//     e.stopPropagation();
    
//     if (hasStarted) {
//       // 只有在已经开始播放后才能控制静音
//       isMuted = !isMuted;
//       if (audio) {
//         audio.muted = isMuted;
//       }
//       updateVolumeIcon();
//     }
//   });

//   // 屏幕任意位置点击事件 - 用于首次启动音乐
//   document.addEventListener('click', (e) => {
//     if (!hasStarted) {
//       // 第一次点击屏幕任意位置：开始播放音乐
//       hasStarted = true;
//       isMuted = false;
//       startMusic();
//       updateVolumeIcon();
//     }
//   });

//   // 图片加载完成后隐藏loading
//   mainImage.addEventListener('load', () => {
//     setTimeout(() => {
//       loading.style.opacity = '0';
//       setTimeout(() => {
//         loading.style.display = 'none';
//       }, 500);
//     }, 500);
//   });

//   // 如果图片已经缓存，立即隐藏loading
//   if (mainImage.complete) {
//     loading.style.display = 'none';
//   }

//   // 音频事件监听
//   if (audio) {
//     // 音频播放事件
//     audio.addEventListener('play', () => {
//       isPlaying = true;
//       updateVolumeIcon();
//     });

//     // 音频暂停事件
//     audio.addEventListener('pause', () => {
//       isPlaying = false;
//       // 如果已经开始过但暂停了，尝试重新播放（除非是用户主动静音）
//       if (hasStarted && !isMuted) {
//         setTimeout(() => {
//           startMusic();
//         }, 100);
//       }
//     });

//     // 音频结束事件（循环播放）
//     audio.addEventListener('ended', () => {
//       if (hasStarted && !isMuted) {
//         startMusic();
//       }
//     });

//     // 音频错误事件
//     audio.addEventListener('error', (e) => {
//       console.error('音频加载错误:', e);
//     });

//     // 确保音频循环播放
//     audio.loop = true;
//   }

//   // 初始化状态
//   updateVolumeIcon();

//   // 页面失去焦点时保持播放状态（如果已经开始且未静音）
//   document.addEventListener('visibilitychange', () => {
//     if (!document.hidden && hasStarted && !isMuted && !isPlaying) {
//       setTimeout(() => {
//         startMusic();
//       }, 200);
//     }
//   });
// });