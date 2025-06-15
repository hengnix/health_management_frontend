<template>
  <div id="app">
    <template v-if="!isLoginPage">
      <el-container class="layout-container">
        <!-- 统一的顶部导航栏 -->
        <el-header
          class="header relative z-[1000] h-[70px] flex-shrink-0 border border-violet-200/30"
          style="
            background: linear-gradient(
              135deg,
              rgba(143, 80, 222, 0.7) 0%,
              rgba(168, 146, 224, 0.65) 50%,
              rgba(201, 213, 244, 0.6) 100%
            );
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow:
              0 1px 0 rgba(255, 255, 255, 0.1),
              0 8px 32px rgba(143, 80, 222, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.05);
          "
        >
          <div
            class="header-content flex h-full items-center justify-center px-7"
          >
            <div class="logo-section flex items-center justify-center gap-4">
              <el-icon
                class="logo-icon animate-float text-4xl text-white drop-shadow-lg"
                ><DataBoard
              /></el-icon>
              <h2
                class="text-3xl font-bold tracking-wide text-white drop-shadow-lg"
              >
                健康生活管理系统
              </h2>
            </div>
            <div class="header-right absolute right-7 flex items-center">
              <el-dropdown
                @command="handleCommand"
                trigger="hover"
                class="user-dropdown cursor-pointer"
              >
                <div
                  class="user-info flex items-center gap-3 rounded-full border border-white/20 px-5 py-2.5 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30"
                  style="
                    background: linear-gradient(
                      135deg,
                      rgba(255, 255, 255, 0.1) 0%,
                      rgba(255, 255, 255, 0.08) 50%,
                      rgba(255, 255, 255, 0.05) 100%
                    );
                    backdrop-filter: blur(10px) saturate(150%);
                    -webkit-backdrop-filter: blur(10px) saturate(150%);
                    box-shadow:
                      0 1px 0 rgba(255, 255, 255, 0.1),
                      0 4px 12px rgba(0, 0, 0, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
                  "
                >
                  <el-avatar size="small" class="user-avatar">
                    <img
                      v-if="userStore.avatarUrl"
                      :src="userStore.avatarUrl"
                      alt="用户头像"
                      class="avatar-image"
                    />
                    <el-icon v-else><User /></el-icon>
                  </el-avatar>
                  <span class="username">{{
                    userStore.user?.nickname || '用户'
                  }}</span>
                  <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu class="custom-dropdown">
                    <el-dropdown-item command="profile" class="dropdown-item">
                      <el-icon><User /></el-icon>
                      <span>个人资料</span>
                    </el-dropdown-item>
                    <el-dropdown-item
                      command="logout"
                      divided
                      class="dropdown-item logout-item"
                    >
                      <el-icon><SwitchButton /></el-icon>
                      <span>退出登录</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主体容器 -->
        <el-container class="main-container">
          <!-- 左侧菜单栏 -->
          <el-aside class="sidebar">
            <div class="sidebar-content">
              <div class="nav-title">
                <el-icon><Menu /></el-icon>
                <span class="nav-title-text">导航菜单</span>
              </div>
              <el-menu
                :default-active="$route.path"
                router
                class="nav-menu"
                background-color="transparent"
                text-color="rgba(255, 255, 255, 0.6)"
                active-text-color="#fff"
              >
                <el-menu-item index="/dashboard" class="menu-item">
                  <el-icon><Odometer /></el-icon>
                  <template #title>
                    <span class="menu-text">数据概览</span>
                  </template>
                </el-menu-item>

                <el-menu-item index="/body-data" class="menu-item">
                  <el-icon><DataAnalysis /></el-icon>
                  <template #title>
                    <span class="menu-text">身体数据</span>
                  </template>
                </el-menu-item>

                <el-menu-item index="/diet" class="menu-item">
                  <el-icon><Food /></el-icon>
                  <template #title>
                    <span class="menu-text">饮食管理</span>
                  </template>
                </el-menu-item>

                <el-menu-item index="/exercise" class="menu-item">
                  <el-icon><Bicycle /></el-icon>
                  <template #title>
                    <span class="menu-text">运动管理</span>
                  </template>
                </el-menu-item>

                <el-menu-item index="/chat" class="menu-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <template #title>
                    <span class="menu-text">AI 聊天</span>
                  </template>
                </el-menu-item>
              </el-menu>
            </div>
          </el-aside>

          <!-- 主内容区 -->
          <el-main class="main-content">
            <div class="content-wrapper">
              <router-view v-slot="{ Component, route }">
                <transition name="fade-slide" mode="out-in">
                  <component :is="Component" :key="route.path" />
                </transition>
              </router-view>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </template>

    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  User,
  ArrowDown,
  SwitchButton,
  DataBoard,
  Menu,
  Odometer,
  DataAnalysis,
  Food,
  Bicycle,
  ChatDotRound,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoginPage = computed(() => route.path === '/login')

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Element Plus 强制重置 */
.el-container,
.el-header,
.el-aside,
.el-main {
  border: none !important;
  box-shadow: none !important;
}

.el-main {
  --el-main-padding: 0 !important;
  padding: 0 !important;
}

html,
body {
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}

#app {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}

/* 主布局容器 */
.layout-container {
  height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(74, 144, 226, 0.2) 0%,
    rgba(129, 140, 248, 0.25) 50%,
    rgba(167, 139, 250, 0.3) 100%
  );
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; /* 确保子元素的 z-index 生效 */
}

/* 保留浮动动画 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.user-avatar {
  background: linear-gradient(180deg, #4a5568 0%, #2d3748 50%, #1a202c 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.username {
  font-size: 14px;
  font-weight: 600;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 主容器 */
.main-container {
  display: flex;
  height: calc(100vh - 70px); /* 减去导航栏高度 */
  width: 100%; /* 确保占满全屏宽度 */
  position: relative; /* 确保子元素的 z-index 生效 */
  flex: 1; /* 占据剩余空间 */
  overflow: hidden;
}

/* 左侧边栏 */
.sidebar {
  width: 202px; /* 固定宽度，缩减 10% */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  box-shadow:
    4px 0 20px rgba(0, 0, 0, 0.15),
    8px 0 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10; /* 高于主内容区但低于导航栏 */
  border: none;
  overflow: hidden;
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 40px; /* 调整内边距以适应缩小的侧边栏 */
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-title .el-icon {
  font-size: 20px;
  color: #74b9ff;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 12px; /* 调整内边距以适应缩小的侧边栏 */
}

.menu-item {
  margin: 8px 0;
  border-radius: 12px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* 更平滑的缓动函数和时长 */
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.6);
  will-change: transform, background, box-shadow; /* 优化动画性能 */
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 12px 16px; /* 调整内边距以适应缩小的侧边栏 */
  min-height: 48px;
  gap: 12px; /* 图标和文字之间的间距 */
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1); /* 更平滑的光效过渡 */
  will-change: left; /* 优化动画性能 */
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: rgba(255, 255, 255, 0.9); /* hover 状态下文字稍微亮一些 */
  transform: translateX(6px); /* 减少移动距离，更平缓 */
  box-shadow:
    0 6px 20px rgba(102, 126, 234, 0.3),
    0 0 30px rgba(102, 126, 234, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.menu-item:hover .menu-text {
  color: rgba(255, 255, 255, 0.9); /* hover 状态下菜单文字稍微亮一些 */
}

.menu-item.is-active {
  background: linear-gradient(45deg, #fa709a 0%, #fee140 100%);
  color: #fff; /* active 状态下文字为纯白色，最亮 */
  transform: translateX(8px); /* 减少移动距离，更平缓 */
  box-shadow:
    0 8px 25px rgba(250, 112, 154, 0.4),
    0 0 35px rgba(254, 225, 64, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.menu-item.is-active .menu-text {
  color: #fff; /* active 状态下菜单文字为纯白色，最亮 */
}

.menu-item .el-icon {
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: rgba(255, 255, 255, 0.6);
  will-change: transform, color; /* 优化动画性能 */
}

.menu-item:hover .el-icon,
.menu-item.is-active .el-icon {
  transform: scale(1.2);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.menu-item:hover .el-icon {
  color: rgba(255, 255, 255, 0.9);
}

.menu-item.is-active .el-icon {
  color: #fff;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 强制重置 Element Plus el-main 默认样式 */
.main-content.el-main {
  --el-main-padding: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  background: transparent !important;
}

/* 主内容区 */
.main-content {
  flex: 1; /* 占据剩余所有空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%; /* 确保占满剩余宽度 */
  max-width: none; /* 移除最大宽度限制 */
  position: relative;
  z-index: 1; /* 确保低于导航栏 */
  padding: 0; /* 移除 Element Plus 默认内边距 */
  margin: 0; /* 移除默认外边距 */
  border: none; /* 移除任何可能的边框 */
  background: transparent; /* 确保背景透明 */
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* 防止水平滚动 */
  background: linear-gradient(
    135deg,
    rgba(74, 144, 226, 0.08) 0%,
    rgba(56, 178, 172, 0.12) 25%,
    rgba(129, 140, 248, 0.15) 50%,
    rgba(167, 139, 250, 0.18) 75%,
    rgba(196, 181, 253, 0.22) 100%
  );
  position: relative;
  width: 100%; /* 确保内容区域占满宽度 */
  z-index: 1; /* 确保低于导航栏 */
  border: none; /* 确保没有边框 */
  outline: none; /* 确保没有轮廓 */
  margin: 0; /* 确保没有外边距 */
  padding: 0; /* 确保没有内边距 */
}

/* 自定义滚动条 */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
}

/* 页面过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden; /* 防止过渡期间出现滚动条或其他视觉问题 */
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px) translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px) translateY(-10px);
}

/* 下拉菜单样式 - 深色以确保可读性 */
.custom-dropdown {
  border-radius: 8px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1),
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  padding: 8px;
  min-width: 160px;
}

.dropdown-item {
  border-radius: 6px;
  margin: 2px 0;
  padding: 12px 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
}

.dropdown-item:hover {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  color: #fff;
  transform: translateX(2px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.logout-item:hover {
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.3) 0%,
    rgba(185, 28, 28, 0.4) 100%
  );
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 160px !important;
  }

  .main-content {
    max-width: calc(100vw - 160px);
  }

  .header-content {
    padding: 0 20px;
  }

  .header-left h2 {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 56px !important;
  }

  .main-content {
    max-width: calc(100vw - 56px);
  }

  .content-wrapper {
    padding: 15px;
  }
}

/* 布局网格对齐 */
.layout-container,
.main-container,
.sidebar,
.main-content {
  display: flex;
  align-items: stretch;
}

/* 确保所有组件都完美对齐 */
.header,
.sidebar,
.main-content {
  position: relative;
}

/* 添加微妙的连接线条 */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
}
</style>
