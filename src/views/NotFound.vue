<template>
  <div class="not-found-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <!-- 主要内容 -->
    <div class="content-wrapper">
      <!-- 404 数字显示 -->
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit animated">0</span>
        <span class="digit">4</span>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1 class="error-title">页面走丢了</h1>
        <p class="error-description">抱歉，您访问的页面不存在或已被移动到其他位置</p>
        <p class="error-suggestion">请检查 URL 是否正确，或返回首页继续您的健康管理之旅</p>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          @click="goToDashboard"
          class="action-btn primary-btn"
        >
          <el-icon><House /></el-icon>
          <span>返回首页</span>
        </el-button>
        <el-button size="large" @click="goBack" class="action-btn secondary-btn">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回上页</span>
        </el-button>
      </div>

      <!-- 快速导航 -->
      <div class="quick-nav">
        <h3 class="nav-title">或者访问其他页面</h3>
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link">
            <el-icon><TrendCharts /></el-icon>
            <span>数据概览</span>
          </router-link>
          <router-link to="/body-data" class="nav-link">
            <el-icon><DataAnalysis /></el-icon>
            <span>身体数据</span>
          </router-link>
          <router-link to="/diet" class="nav-link">
            <el-icon><Food /></el-icon>
            <span>饮食管理</span>
          </router-link>
          <router-link to="/exercise" class="nav-link">
            <el-icon><Bicycle /></el-icon>
            <span>运动管理</span>
          </router-link>
          <router-link to="/chat" class="nav-link">
            <el-icon><ChatDotRound /></el-icon>
            <span>健康咨询</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="bottom-decoration">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  House,
  ArrowLeft,
  TrendCharts,
  DataAnalysis,
  Food,
  Bicycle,
  ChatDotRound,
} from '@element-plus/icons-vue'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #4ecdc4 50%,
    #44a08d 75%,
    #667eea 100%
  );
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: floating 4s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.5;
  }
}

.content-wrapper {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  width: 90%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.2),
    0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.digit {
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  animation: slideInDown 0.5s ease-out;
}

.digit.animated {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.error-info {
  margin-bottom: 50px;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-description {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 15px;
  font-weight: 500;
  line-height: 1.6;
}

.error-suggestion {
  font-size: 1rem;
  color: #718096;
  font-weight: 400;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 50px;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.action-btn {
  height: 55px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.25s ease;
  border: none;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 0 30px;
  min-width: 160px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.3s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.secondary-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.quick-nav {
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.nav-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 15px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.1);
  color: #667eea;
  text-decoration: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  min-width: 100px;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.15);
  color: #667eea;
  text-decoration: none;
}

.nav-link .el-icon {
  font-size: 1.5rem;
}

.nav-link span {
  font-size: 0.9rem;
}

.bottom-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  pointer-events: none;
  z-index: 2;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  clip-path: polygon(0 50%, 100% 80%, 100% 100%, 0 100%);
  animation: waveAnimation 3s ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
  opacity: 0.7;
}

.wave-2 {
  animation-delay: 1s;
  opacity: 0.5;
  clip-path: polygon(0 60%, 100% 40%, 100% 100%, 0 100%);
}

.wave-3 {
  animation-delay: 2s;
  opacity: 0.3;
  clip-path: polygon(0 70%, 100% 60%, 100% 100%, 0 100%);
}

@keyframes waveAnimation {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-15px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 30px 20px;
    margin: 20px;
  }

  .digit {
    font-size: 5rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 300px;
  }

  .nav-links {
    gap: 10px;
  }

  .nav-link {
    min-width: 85px;
    padding: 15px 10px;
  }

  .nav-link .el-icon {
    font-size: 1.3rem;
  }

  .nav-link span {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .digit {
    font-size: 4rem;
    gap: 10px;
  }

  .error-title {
    font-size: 1.8rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .nav-links {
    justify-content: center;
    gap: 8px;
  }

  .nav-link {
    min-width: 75px;
    padding: 12px 8px;
  }
}
</style>
