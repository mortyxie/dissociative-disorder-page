// 此脚本控制音乐播放
import musicUrl from '/src/assets/music/Roche_loop.mp3'

// 音频实例
let audioInstance = null;
let isPlaying = false;

// 初始化音频
function initAudio() {
  if (!audioInstance) {
    audioInstance = new Audio(musicUrl);
    audioInstance.loop = true; // 循环播放
    audioInstance.volume = 0.5; // 设置音量为50%
    
    audioInstance.addEventListener('ended', () => {
      isPlaying = false;
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