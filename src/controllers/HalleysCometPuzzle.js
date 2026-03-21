// 此脚本控制哈雷彗星解密

// 导入音乐控制器
import { playMusic } from './MusicController.js';

// 解密状态管理
let puzzleState = {
  isInitialized: false,
  isSolved: false,
  attempts: 0,
  startTime: null,
  solveTime: null
};

// 正确答案
const CORRECT_ANSWER = "20710729";

// 初始化哈雷彗星解密功能
function initHalleysCometPuzzle() {
  
  puzzleState.isInitialized = true;
  puzzleState.startTime = Date.now();
  
  // 从本地存储加载尝试次数
  try {
    const saved = localStorage.getItem('halleysCometAttempts');
    if (saved) {
      puzzleState.attempts = parseInt(saved, 10) || 0;
    } else {
      puzzleState.attempts = 0;
    }
  } catch (error) {
    puzzleState.attempts = 0;
  }
  
  puzzleState.isSolved = false;
  
  return true;
}

// 验证答案
function validateAnswer(inputAnswer) {
  if (!puzzleState.isInitialized) {
    console.warn("解密系统未初始化");
    return false;
  }
  
  puzzleState.attempts++;
  
  // 持久化尝试次数
  localStorage.setItem('halleysCometAttempts', puzzleState.attempts.toString());
  
  if (inputAnswer === CORRECT_ANSWER) {
    return true;
  }
  
  return false;
}

// 解密成功处理
function solveHalleysPuzzle() {
  if (puzzleState.isSolved) {
    return;
  }
  
  puzzleState.isSolved = true;
  puzzleState.solveTime = Date.now();
  
  const solveTimeSeconds = Math.round((puzzleState.solveTime - puzzleState.startTime) / 1000);
  // 🎵 播放庆祝音乐
  try {
    playMusic();
  } catch (error) {
    console.error("音乐播放失败:", error);
  }
  
  // 触发解密成功事件
  const event = new CustomEvent('halleysCometSolved', {
    detail: {
      answer: CORRECT_ANSWER,
      attempts: puzzleState.attempts,
      solveTime: solveTimeSeconds,
      timestamp: puzzleState.solveTime
    }
  });
  
  window.dispatchEvent(event);
  
  // 保存解密状态到本地存储
  localStorage.setItem('halleysCometPuzzleSolved', JSON.stringify({
    solved: true,
    solveTime: puzzleState.solveTime,
    attempts: puzzleState.attempts
  }));
  
  // 清除尝试次数记录
  localStorage.removeItem('halleysCometAttempts');
  
  return {
    success: true,
    attempts: puzzleState.attempts,
    solveTime: solveTimeSeconds
  };
}

// 获取解密状态
function getPuzzleState() {
  return { ...puzzleState };
}

// 检查是否已经解密过
function isPuzzleSolved() {
  // 检查内存状态
  if (puzzleState.isSolved) {
    return true;
  }
  
  // 检查本地存储
  try {
    const saved = localStorage.getItem('halleysCometPuzzleSolved');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.solved) {
        puzzleState.isSolved = true;
        return true;
      }
    }
  } catch (error) {
    console.warn("读取解密状态失败:", error);
  }
  
  return false;
}

// 重置解密状态（调试用）
function resetPuzzle() {
  puzzleState = {
    isInitialized: false,
    isSolved: false,
    attempts: 0,
    startTime: null,
    solveTime: null
  };
  
  localStorage.removeItem('halleysCometPuzzleSolved');
  localStorage.removeItem('halleysCometAttempts');
}

// 获取提示信息
function getHint(attemptCount = 0) {
  const index = Math.min(attemptCount, hints.length - 1);
  return hints[index];
}

// 导出所有函数
export {
  initHalleysCometPuzzle,
  solveHalleysPuzzle,
  validateAnswer,
  getPuzzleState,
  isPuzzleSolved,
  resetPuzzle,
  getHint,
  CORRECT_ANSWER
}