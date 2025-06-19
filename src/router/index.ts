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
      if (import.meta.env.DEV) {
        return '/dashboard'
      }
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

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (import.meta.env.DEV) {
    console.log('Dev mode: Skip auth check, allow access to', to.path)
    next()
    return
  }

  const hasToken = !!localStorage.getItem('token')
  const hasUserID = !!localStorage.getItem('userID')

  if (to.meta.requiresAuth) {
    if (!hasToken) {
      console.log('No token found, redirect to login')
      next('/login')
      return
    }

    if (!hasUserID) {
      console.log('Attempting to recover userID from token')
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
              console.log('UserID recovered successfully:', userIDFromToken)
            } else {
              console.warn(
                'Unable to parse userID from token, redirect to login',
              )
              next('/login')
              return
            }
          }
        } catch (e) {
          console.error('JWT parsing failed in route guard:', e)
          next('/login')
          return
        }
      } else {
        console.log('Invalid token, redirect to login')
        next('/login')
        return
      }
    }

    next()
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    console.log('Logged in user accessing login page, redirect to dashboard')
    next('/dashboard')
  } else {
    next()
  }
})

export default router
