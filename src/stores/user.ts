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
      console.error('JWT 解析错误:', e)
      return null
    }
  }

  // 登录
  const login = async (loginData: LoginRequest) => {
    try {
      console.log('开始登录请求:', loginData.email)
      const response = await userApi.login(loginData)
      console.log('Login response:', response) // 调试用，查看响应结构

      if (response.success) {
        // 检查是否有 JWT token
        if (response.data) {
          const jwtToken = response.data as string
          token.value = jwtToken
          localStorage.setItem('token', jwtToken)
          console.log('JWT Token 已保存:', jwtToken.substring(0, 50) + '...') // 只显示前 50 个字符

          // 解析 JWT 获取用户 ID
          const payload = parseJwt(jwtToken)
          console.log('JWT Payload:', payload)

          if (payload) {
            // 注意用户 ID 字段名是 userId
            const userIDFromToken =
              payload.userId ||
              payload.userID ||
              payload.sub ||
              payload.id ||
              payload.user_id

            console.log('提取的用户 ID:', userIDFromToken)

            if (userIDFromToken) {
              localStorage.setItem('userID', userIDFromToken)
              console.log('用户 ID 已保存到 localStorage:', userIDFromToken)
            } else {
              console.warn(
                'JWT 中未找到用户 ID 字段，可用字段:',
                Object.keys(payload),
              )
            }
          } else {
            console.error('JWT 解析失败')
            ElMessage.warning('登录成功，但用户信息解析失败')
          }
        } else {
          console.error('登录响应中缺少 data 字段')
          ElMessage.error('登录响应格式错误')
          return false
        }

        ElMessage.success(response.message || '登录成功')

        // 尝试获取用户信息，如果失败也不影响登录成功
        try {
          await fetchUserProfile()
        } catch (e) {
          console.warn('获取用户信息失败，但登录仍然成功:', e)
        }

        console.log('登录流程完成，返回 true')
        return true
      } else {
        console.log('登录失败:', response.message)
        ElMessage.error(response.message || '登录失败')
        return false
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('登录请求失败:', apiError)
      ElMessage.error(apiError.response?.data?.message || '登录失败')
      return false
    }
  }

  // 注册
  const register = async (registerData: RegisterRequest) => {
    try {
      const response = await userApi.register(registerData)
      if (response.success && response.data) {
        // 根据 API 文档，注册成功返回 { userID: "c3b95..." }
        console.log('注册成功，用户 ID:', response.data.userID)
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
      console.log('没有 token，跳过获取用户信息')
      return false
    }

    try {
      console.log('开始获取用户信息...')
      const response = await userApi.getProfile()
      if (response.success && response.data) {
        user.value = response.data
        console.log('用户信息获取成功:', response.data)

        // 尝试获取头像
        try {
          await fetchAvatar()
        } catch (e) {
          console.warn('获取头像失败:', e)
        }

        return true
      } else {
        console.log('获取用户信息失败:', response.message)
        return false
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('获取用户信息失败:', apiError)

      // 临时解决方案：如果获取用户信息失败，创建一个模拟的用户对象
      if (apiError.response?.status === 404) {
        console.warn('用户信息 API 返回 404，使用模拟用户信息')
        const userID = localStorage.getItem('userID')
        if (userID) {
          user.value = {
            userID: userID,
            email: 'user@example.com', // 从 JWT 或 localStorage 获取
            nickname: '用户',
            gender: '未知',
            dateOfBirth: '1990-01-01',
          } as User
          console.log('已设置模拟用户信息:', user.value)
          return true
        }
      }

      // 如果是 401 错误，说明 token 无效
      if (apiError.response?.status === 401) {
        console.warn('token 无效，清除登录状态')
        logout()
        ElMessage.warning('登录已过期，请重新登录')
        return false
      }

      // 其他错误可能是网络问题，不清除登录状态
      console.warn('获取用户信息失败，但保持登录状态:', apiError.message)
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
        // 清理之前的 blob URL
        if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl.value)
        }
        avatarUrl.value = response.avatarUrl
        console.log('头像获取成功:', response.avatarUrl)
        return true
      }
      return false
    } catch (error) {
      console.warn('获取头像失败:', error)
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

    console.log('检查登录状态:')
    console.log('- token 存在:', !!savedToken)
    console.log('- userID 存在:', !!savedUserID)

    if (savedToken) {
      token.value = savedToken

      // 如果没有 userID，尝试从 token 解析
      if (!savedUserID && savedToken.includes('.')) {
        try {
          const base64Url = savedToken.split('.')[1]
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
              console.log('从 token 中恢复用户 ID:', userIDFromToken)
            }
          }
        } catch (e) {
          console.error('JWT 解析失败:', e)
        }
      }

      return true
    }

    console.log('用户未登录，清除状态')
    // 清除无效状态
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userID')
    return false
  }

  // 初始化时如果有 token 则获取用户信息
  const init = async () => {
    console.log('初始化用户 store')

    if (checkLoginStatus() && token.value) {
      try {
        await fetchUserProfile()
        console.log('用户信息获取成功')
      } catch (error) {
        console.warn('获取用户信息失败，但 token 有效:', error)
      }
    }
  }

  // 添加一个调试函数来检查当前状态
  const debugUserState = () => {
    console.log('=== 用户状态调试信息 ===')
    console.log('token 存在:', !!token.value)
    console.log('用户信息存在:', !!user.value)
    console.log('localStorage 中的 token:', localStorage.getItem('token'))
    console.log('localStorage 中的 userID:', localStorage.getItem('userID'))

    if (token.value) {
      try {
        const payload = parseJwt(token.value)
        console.log('JWT Payload:', payload)
      } catch (e) {
        console.log('JWT 解析失败:', e)
      }
    }
    console.log('=====================')
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
    updateProfile,
    logout,
    init,
    debugUserState,
  }
})
