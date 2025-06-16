# 健康管理系统

一个基于 Vue 3 的现代化健康管理 Web 应用，帮助用户全面追踪和管理个人健康数据。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite 6
- **UI 组件库**: Element Plus 2
- **样式框架**: Tailwind CSS 4
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **包管理器**: pnpm

## 核心功能

### 数据概览仪表板

- 健康数据统计汇总
- 可视化图表展示
- 快速记录入口
- 趋势分析展示

### 身体数据管理

- 体重、身高记录与追踪
- BMI 自动计算
- 历史数据图表展示
- 目标设置与进度监控

### 饮食管理

- 每日饮食记录
- 卡路里摄入统计
- 营养成分分析
- 三餐管理功能

### 运动管理

- 运动类型记录
- 卡路里消耗统计
- 运动时长追踪
- 运动强度分析

### 健康咨询

- AI 健康助手对话
- 智能健康建议
- 聊天记录管理
- 上下文记忆功能

### 个人中心

- 用户信息管理
- 健康目标设置
- 偏好配置
- 数据导出功能

## 项目结构

```
src/
├── api/           # API 接口封装
├── assets/        # 静态资源
├── components/    # 公共组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型定义
└── views/         # 页面组件
    ├── DashboardData.vue    # 数据概览
    ├── BodyData.vue         # 身体数据
    ├── DietData.vue         # 饮食管理
    ├── ExerciseData.vue     # 运动管理
    ├── ChatData.vue         # 健康咨询
    ├── ProfileData.vue      # 个人中心
    └── LoginData.vue        # 用户登录
```

## 快速开始

### 环境要求

- Node.js >= 22.0.0
- pnpm >= 10.0.0

### 安装依赖

```bash
pnpm install
```

### 开发环境启动

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 代码检查与格式化

```bash
# ESLint 检查并自动修复
pnpm lint

# Prettier 格式化代码
pnpm format

# TypeScript 类型检查
pnpm type-check
```

## 开发特性

### 响应式设计

采用 Tailwind CSS 4 实现完全响应式界面，适配桌面端、平板和移动设备。

### 类型安全

全面使用 TypeScript 开发，提供完整的类型定义和编译时检查。

### 组件化架构

基于 Vue 3 Composition API，采用模块化组件设计，提高代码复用性和维护性。

### 状态管理

使用 Pinia 进行集中化状态管理，支持 TypeScript 类型推导。

### 代码规范

集成 ESLint 和 Prettier，确保代码风格一致性和质量。

## API 配置

项目通过 Vite 代理配置连接后端服务：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://<your-backend-server-ip>:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

请将 `<your-backend-server-ip>` 替换为实际的后端服务器地址。
