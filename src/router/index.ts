import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginData from '@/views/LoginData.vue'
import DashboardData from '@/views/DashboardData.vue'
import BodyData from '@/views/BodyData.vue'
import DietData from '@/views/DietData.vue'
import ExerciseData from '@/views/ExerciseData.vue'
import ProfileData from '@/views/ProfileData.vue'
import ChatData from '@/views/ChatData.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: () => {
      // 开发模式下直接跳转到 dashboard，生产模式下检查 token
      if (import.meta.env.DEV) {
        return '/dashboard'
      }

      // 检查是否有 token 来决定重定向目标
      const hasToken = !!localStorage.getItem('token')
      return hasToken ? '/dashboard' : '/login'
    },
  },
  {
    path: '/login',
    name: 'LoginData',
    component: LoginData,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'DashboardData',
    component: DashboardData,
    meta: { requiresAuth: true },
  },
  {
    path: '/body-data',
    name: 'BodyData',
    component: BodyData,
    meta: { requiresAuth: true },
  },
  {
    path: '/diet',
    name: 'DietData',
    component: DietData,
    meta: { requiresAuth: true },
  },
  {
    path: '/exercise',
    name: 'ExerciseData',
    component: ExerciseData,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'ProfileData',
    component: ProfileData,
    meta: { requiresAuth: true },
  },
  {
    path: '/chat',
    name: 'ChatData',
    component: ChatData,
    meta: { requiresAuth: true },
  },
  // 404 页面路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 开发模式下跳过认证检查
  if (import.meta.env.DEV) {
    console.log('开发模式：跳过认证检查，直接允许访问', to.path)
    next()
    return
  }

  // 检查登录状态，包括 token 和 userID
  const hasToken = !!localStorage.getItem('token')
  const hasUserID = !!localStorage.getItem('userID')

  console.log('路由守卫检查:', {
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    isLoggedIn: userStore.isLoggedIn,
    hasToken,
    hasUserID,
  })

  if (to.meta.requiresAuth) {
    if (!hasToken) {
      console.log('未找到 token，重定向到登录页')
      next('/login')
      return
    }

    // 如果有 token 但没有 userID，尝试恢复
    if (!hasUserID) {
      console.log('尝试从 token 恢复 userID')
      const token = localStorage.getItem('token')
      if (token && token.includes('.')) {
        try {
          const base64Url = token.split('.')[1]
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(
                  (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(''),
            )
            const payload = JSON.parse(jsonPayload)
            const userIDFromToken =
              payload.userId ||
              payload.userID ||
              payload.sub ||
              payload.id ||
              payload.user_id
            if (userIDFromToken) {
              localStorage.setItem('userID', userIDFromToken)
              console.log('路由守卫中恢复 userID 成功:', userIDFromToken)
            } else {
              console.warn('无法从 token 中解析 userID，重定向到登录页')
              next('/login')
              return
            }
          }
        } catch (e) {
          console.error('路由守卫中 JWT 解析失败:', e)
          next('/login')
          return
        }
      } else {
        console.log('无效 token，重定向到登录页')
        next('/login')
        return
      }
    }

    console.log('认证检查通过，允许访问')
    next()
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    console.log('已登录用户访问登录页，重定向到 dashboard')
    next('/dashboard')
  } else {
    next()
  }
})

export default router
