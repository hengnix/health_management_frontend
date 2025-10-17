import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest, ApiError } from '@/types'
import { userApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const avatarUrl = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  // 解析 JWT token 获取 payload
  const parseJwt = (token: string) => {
    try {
      // JWT 的结构是: header.payload.signature
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join(''),
      )
      return JSON.parse(jsonPayload)
    } catch (e) {
      console.error('JWT parsing error:', e)
      return null
    }
  }

  // 登录
  const login = async (loginData: LoginRequest) => {
    try {
      const response = await userApi.login(loginData)

      if (response.success) {
        if (response.data) {
          const jwtToken = response.data as string
          token.value = jwtToken
          localStorage.setItem('token', jwtToken)

          const payload = parseJwt(jwtToken)

          if (payload) {
            const userIDFromToken =
              payload.userId || payload.userID || payload.sub || payload.id || payload.user_id

            if (userIDFromToken) {
              localStorage.setItem('userID', userIDFromToken)
            } else {
              console.warn('User ID not found in JWT, available fields:', Object.keys(payload))
            }
          } else {
            console.error('JWT parsing failed')
            ElMessage.warning('登录成功，但用户信息解析失败')
          }
        } else {
          console.error('Missing data field in login response')
          ElMessage.error('登录响应格式错误')
          return false
        }

        ElMessage.success(response.message || '登录成功')

        try {
          await fetchUserProfile()
        } catch (e) {
          console.warn('Failed to fetch user profile after login:', e)
        }

        return true
      } else {
        ElMessage.error(response.message || '登录失败')
        return false
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Login request failed:', apiError)
      ElMessage.error(apiError.response?.data?.message || '登录失败')
      return false
    }
  }

  // 注册
  const register = async (registerData: RegisterRequest) => {
    try {
      const response = await userApi.register(registerData)
      if (response.success && response.data) {
        ElMessage.success(response.message || '注册成功，请登录')
        return true
      } else {
        ElMessage.error(response.message || '注册失败')
        return false
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      ElMessage.error(apiError.response?.data?.message || '注册失败')
      return false
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    if (!token.value) {
      return false
    }

    try {
      const response = await userApi.getProfile()
      if (response.success && response.data) {
        user.value = response.data

        try {
          await fetchAvatar()
        } catch (e) {
          console.warn('Failed to fetch avatar:', e)
        }

        return true
      } else {
        return false
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch user profile:', apiError)

      if (apiError.response?.status === 404) {
        console.warn('User profile API returned 404, using mock user info')
        const userID = localStorage.getItem('userID')
        if (userID) {
          user.value = {
            userID: userID,
            email: 'user@example.com',
            nickname: '用户',
            gender: '未知',
            dateOfBirth: '1990-01-01',
          } as User
          return true
        }
      }

      if (apiError.response?.status === 401) {
        console.warn('Token invalid, clearing login state')
        logout()
        ElMessage.warning('登录已过期，请重新登录')
        return false
      }

      console.warn('Failed to fetch user profile, but keeping login state:', apiError.message)
      return false
    }
  }

  // 获取用户头像
  const fetchAvatar = async () => {
    if (!token.value) {
      return false
    }

    try {
      const response = await userApi.getAvatar()
      if (response && response.avatarUrl) {
        if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl.value)
        }
        avatarUrl.value = response.avatarUrl
        return true
      } else {
        if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl.value)
        }
        avatarUrl.value = null
        return false
      }
    } catch (error: unknown) {
      console.warn('Failed to fetch avatar:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } }
        if (apiError.response?.status === 404) {
          if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
            URL.revokeObjectURL(avatarUrl.value)
          }
          avatarUrl.value = null
          return false
        }
      }
      return false
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await userApi.updateProfile(profileData)
      if (response.success && response.data) {
        user.value = response.data
        ElMessage.success(response.message || '更新成功')
        return true
      } else {
        ElMessage.error(response.message || '更新失败')
        return false
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      ElMessage.error(apiError.response?.data?.message || '更新失败')
      return false
    }
  }

  // 退出登录
  const logout = () => {
    user.value = null
    token.value = null

    // 清理头像 blob URL
    if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl.value)
    }
    avatarUrl.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('userID')
    ElMessage.success('已退出登录')
  }

  // 检查当前登录状态
  const checkLoginStatus = () => {
    const savedToken = localStorage.getItem('token')
    const savedUserID = localStorage.getItem('userID')

    if (savedToken) {
      token.value = savedToken

      if (!savedUserID && savedToken.includes('.')) {
        try {
          const base64Url = savedToken.split('.')[1]
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
            )
            const payload = JSON.parse(jsonPayload)
            const userIDFromToken =
              payload.userId || payload.userID || payload.sub || payload.id || payload.user_id
            if (userIDFromToken) {
              localStorage.setItem('userID', userIDFromToken)
            }
          }
        } catch (e) {
          console.error('JWT parsing failed:', e)
        }
      }

      return true
    }

    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userID')
    return false
  }

  // 初始化时如果有 token 则获取用户信息
  const init = async () => {
    if (checkLoginStatus() && token.value) {
      try {
        await fetchUserProfile()
      } catch (error) {
        console.warn('Failed to fetch user profile during init:', error)
      }
    }
  }

  const updateAvatar = async () => {
    return await fetchAvatar()
  }

  return {
    user,
    token,
    avatarUrl,
    isLoggedIn,
    login,
    register,
    fetchUserProfile,
    fetchAvatar,
    updateAvatar,
    updateProfile,
    logout,
    init,
  }
})
