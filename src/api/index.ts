import axios from 'axios'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  BodyData,
  BodyDataRequest,
  DietRecord,
  DietRequest,
  ExerciseRecord,
  ExerciseRequest,
  ApiResponse,
  Statistics,
} from '@/types'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    console.log('请求配置:', { url: config.url, headers: config.headers })
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('原始 API 响应:', response)
    const data = response.data
    console.log('响应数据:', data)

    // 处理不同的响应格式
    if (data) {
      let result

      // 检查是否是标准的 { code, msg, data } 格式
      if (typeof data === 'object' && data.hasOwnProperty('code')) {
        result = {
          success: data.code === 1, // code=1 表示成功
          message: data.msg || data.message || '',
          data: data.data,
        }
      }
      // 检查是否是简单的成功响应（比如直接返回 JWT token）
      else if (typeof data === 'string') {
        // 如果响应是字符串，可能是 JWT token
        result = {
          success: true,
          message: '操作成功',
          data: data,
        }
      }
      // 检查是否是对象但没有 code 字段（可能是其他格式）
      else if (typeof data === 'object') {
        // 如果有 success 字段，直接使用
        if (data.hasOwnProperty('success')) {
          result = data
        } else {
          // 假设是成功响应
          result = {
            success: true,
            message: data.message || data.msg || '操作成功',
            data: data,
          }
        }
      }
      // 其他情况，假设成功
      else {
        result = {
          success: true,
          message: '操作成功',
          data: data,
        }
      }

      console.log('转换后的响应:', result)
      return result
    }

    // 如果没有 data，返回默认成功响应
    return {
      success: true,
      message: '操作成功',
      data: null,
    }
  },
  (error) => {
    console.error('API 请求错误:', error)

    // 处理错误响应
    if (error.response?.data) {
      const errorData = error.response.data

      // 检查是否是标准错误格式
      if (errorData.code === -1 || errorData.code === 401) {
        // 未登录
        localStorage.removeItem('token')
        localStorage.removeItem('userID')
        window.location.href = '/login'
      }

      // 返回格式化的错误响应而不是直接抛出
      return Promise.resolve({
        success: false,
        message: errorData.message || errorData.msg || `请求失败 (${error.response.status})`,
        data: null,
        error: errorData,
      })
    }

    // 网络错误或其他错误
    return Promise.resolve({
      success: false,
      message: error.message || '网络请求失败',
      data: null,
      error: error,
    })
  },
)

// 创建一个通用的 userID 获取函数
const getUserID = (): string | null => {
  let userID = localStorage.getItem('userID')

  console.log('getUserID: 从 localStorage 获取的 userID:', userID)

  // 如果 userID 不存在，尝试从 token 中解析
  if (!userID) {
    const token = localStorage.getItem('token')
    console.log('getUserID: token 存在:', !!token)

    if (token && typeof token === 'string' && token.includes('.')) {
      try {
        const base64Url = token.split('.')[1]
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''),
          )
          const payload = JSON.parse(jsonPayload)
          console.log('getUserID: JWT payload:', payload)

          userID =
            payload.userId || // 注意：根据实际 JWT，字段是 userId
            payload.userID ||
            payload.sub ||
            payload.id ||
            payload.user_id

          console.log('getUserID: 从 JWT 解析的 userID:', userID)

          if (userID) {
            localStorage.setItem('userID', userID)
            console.log('getUserID: 已保存 userID 到 localStorage')
          } else {
            console.warn(
              'getUserID: JWT 中没有找到有效的 userID 字段，可用字段:',
              Object.keys(payload),
            )
          }
        }
      } catch (e) {
        console.error('getUserID: 从 token 解析 userID 失败:', e)
      }
    } else {
      console.warn('getUserID: token 无效或格式错误')
    }
  }

  // 验证 userID 的有效性
  if (userID && (userID === 'null' || userID === 'undefined' || userID.trim() === '')) {
    console.warn('getUserID: 检测到无效的 userID，清除缓存')
    localStorage.removeItem('userID')
    userID = null
  }

  console.log('getUserID: 最终返回的 userID:', userID)
  return userID
}

// 用户 API
export const userApi = {
  // 登录，返回的 data 字段直接是 JWT token 字符串
  login: (data: LoginRequest): Promise<ApiResponse<string>> => api.post('/users/login', data),

  // 注册
  register: (data: RegisterRequest): Promise<ApiResponse<{ userID: string }>> =>
    api.post('/users/register', data),

  // 获取用户信息
  getProfile: (): Promise<ApiResponse<User>> => {
    const userID = getUserID()
    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }
    return api.get(`/users/${userID}`)
  },

  // 更新用户信息
  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => {
    const userID = getUserID()
    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    // 确保请求体中包含 userID
    const requestData = {
      ...data,
      userID: userID,
    }

    console.log('更新用户信息 - userID:', userID, '完整数据:', requestData)
    return api.put(`/users/${userID}`, requestData)
  },

  // 上传头像
  uploadAvatar: (avatar: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const token = localStorage.getItem('token')
    if (!token) {
      return Promise.reject(new Error('未登录'))
    }

    const formData = new FormData()
    formData.append('avatar', avatar)
    formData.append('token', token)

    return api.post('/uploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 获取头像
  getAvatar: async (): Promise<{ avatarUrl: string }> => {
    const token = localStorage.getItem('token')
    if (!token) {
      return Promise.reject(new Error('未登录'))
    }

    try {
      // 获取二进制图片数据并转换为 blob URL
      const response = await api.get('/getAvatar', {
        headers: { token },
        responseType: 'blob', // 指定响应类型为 blob
      })

      // 检查响应是否有效
      if (!response.data || response.data.size === 0) {
        throw new Error('头像数据为空')
      }

      // 创建 blob URL
      const blob = new Blob([response.data], { type: 'image/jpeg' })
      const avatarUrl = URL.createObjectURL(blob)
      return { avatarUrl }
    } catch (error: unknown) {
      // 重新抛出错误，保持原始的错误信息
      throw error
    }
  },
}

// 身体数据 API
export const bodyDataApi = {
  // 获取身体数据列表
  getList: (params?: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse<{ total: number; rows: BodyData[] }>> => {
    const queryParams = new URLSearchParams()
    const userID = getUserID()

    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    queryParams.append('userID', userID)

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.size) queryParams.append('pageSize', params.size.toString())
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    return api.get(`/bodyMetrics?${queryParams.toString()}`)
  },

  // 添加身体数据
  create: (data: BodyDataRequest): Promise<ApiResponse<{ bodyMetricID: number }>> => {
    const userID = getUserID()

    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    return api.post('/bodyMetrics', {
      ...data,
      userID,
    })
  },

  // 更新身体数据
  update: (id: number, data: Partial<BodyDataRequest>): Promise<ApiResponse<BodyData>> =>
    api.put(`/bodyMetrics/${id}`, data),

  // 删除身体数据
  delete: (id: number): Promise<ApiResponse<void>> => api.delete(`/bodyMetrics/${id}`),
}

// 饮食记录 API
export const dietApi = {
  // 获取饮食记录列表
  getList: (params?: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    mealType?: string
  }): Promise<ApiResponse<{ total: number; rows: DietRecord[] }>> => {
    const queryParams = new URLSearchParams()
    const userID = getUserID()

    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    queryParams.append('userID', userID)

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.size) queryParams.append('pageSize', params.size.toString())
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.mealType) queryParams.append('mealType', params.mealType)

    return api.get(`/dietItems?${queryParams.toString()}`)
  },

  // 添加饮食记录
  create: (data: DietRequest): Promise<ApiResponse<{ dietItemID: number }>> => {
    const userID = getUserID()

    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    return api.post('/dietItems', {
      ...data,
      userID,
    })
  },

  // 更新饮食记录
  update: (id: number, data: Partial<DietRequest>): Promise<ApiResponse<DietRecord>> =>
    api.put(`/dietItems/${id}`, data),

  // 删除饮食记录
  delete: (id: number): Promise<ApiResponse<void>> => api.delete(`/dietItems/${id}`),
}

// 运动记录 API
export const exerciseApi = {
  // 获取运动记录列表
  getList: (params?: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    exerciseType?: string
  }): Promise<ApiResponse<{ total: number; rows: ExerciseRecord[] }>> => {
    const queryParams = new URLSearchParams()
    const userID = getUserID()

    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    queryParams.append('userID', userID)

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.size) queryParams.append('pageSize', params.size.toString())
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.exerciseType) queryParams.append('exerciseType', params.exerciseType)

    return api.get(`/exerciseItems?${queryParams.toString()}`)
  },

  // 添加运动记录
  create: (data: ExerciseRequest): Promise<ApiResponse<{ exerciseItemID: number }>> => {
    const userID = getUserID()

    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }

    return api.post('/exerciseItems', {
      ...data,
      userID,
    })
  },

  // 更新运动记录
  update: (id: number, data: Partial<ExerciseRequest>): Promise<ApiResponse<ExerciseRecord>> =>
    api.put(`/exerciseItems/${id}`, data),

  // 删除运动记录
  delete: (id: number): Promise<ApiResponse<void>> => api.delete(`/exerciseItems/${id}`),
}

// 统计 API
export const statisticsApi = {
  // 获取统计数据
  getStatistics: (startDate?: string, endDate?: string): Promise<ApiResponse<Statistics>> => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return api.get(`/statistics?${params.toString()}`)
  },

  // 获取用户健康统计概览
  getHealthOverview: async (): Promise<
    ApiResponse<{
      totalRecords: {
        diet: number
        exercise: number
        body: number
      }
      activeDays: number
    }>
  > => {
    const userID = getUserID()
    if (!userID) {
      return Promise.reject(new Error('用户 ID 不存在'))
    }
    // 这里使用现有的 API 组合来计算统计数据
    const [dietResponse, exerciseResponse, bodyResponse] = await Promise.all([
      dietApi.getList({}),
      exerciseApi.getList({}),
      bodyDataApi.getList({}),
    ])
    const dietTotal = dietResponse.data?.total || 0
    const exerciseTotal = exerciseResponse.data?.total || 0
    const bodyTotal = bodyResponse.data?.total || 0
    // 计算活跃天数（简化计算）
    const allRecords = [
      ...(dietResponse.data?.rows || []).map((r) => r.recordDate),
      ...(exerciseResponse.data?.rows || []).map((r_1) => r_1.recordDate),
      ...(bodyResponse.data?.rows || []).map((r_2) => r_2.recordDate),
    ]
    const uniqueDates = new Set(allRecords)
    const activeDays = uniqueDates.size
    return {
      success: true,
      message: '获取统计数据成功',
      data: {
        totalRecords: {
          diet: dietTotal,
          exercise: exerciseTotal,
          body: bodyTotal,
        },
        activeDays,
      },
    }
  },
}

// AI 助手
export const chatApi = {
  // 测试聊天接口 - GET 请求，需要 JWT 认证
  testChat: (msg: string): Promise<ApiResponse<unknown>> => {
    const params = new URLSearchParams()
    params.append('msg', msg)
    return api.get(`/chat?${params.toString()}`)
  },

  // 预热连接接口
  warmup: async (): Promise<void> => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // 使用 HEAD 请求进行预热，不获取响应体
      const response = await fetch('/api/chat?msg=test', {
        method: 'HEAD',
        headers: {
          token: token,
          Accept: 'text/html',
          'Cache-Control': 'no-cache',
        },
      })

      // 不需要读取响应体，仅建立连接
      if (response.ok) {
        console.log('连接预热成功')
      }
    } catch (error) {
      // 预热失败不影响正常功能
      console.debug('连接预热失败:', error)
    }
  },

  // 流式聊天接口
  streamChat: async (msg: string, onChunk: (chunk: string) => void): Promise<void> => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到 token')
    }

    const response = await fetch(`/api/chat?msg=${encodeURIComponent(msg)}`, {
      method: 'GET',
      headers: {
        token: token,
        Accept: 'text/html',
        'Cache-Control': 'no-cache', // 禁用缓存
        'X-Requested-With': 'XMLHttpRequest', // 标识为 AJAX 请求
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('响应体为空')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    try {
      let buffer = '' // 添加缓冲区处理不完整的字符
      let isFirstChunk = true // 标记是否为第一个数据块

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          // 处理剩余的缓冲区内容
          if (buffer.trim()) {
            onChunk(buffer)
          }
          break
        }

        // 解码数据并添加到缓冲区
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 如果是第一个数据块，立即触发回调以减少延迟感知
        if (isFirstChunk && buffer.length > 0) {
          isFirstChunk = false
          console.log('收到第一个数据块，长度:', buffer.length)
        }

        // 按字符处理数据，实现更平滑的流式效果
        while (buffer.length > 0) {
          // 每次取一小部分内容进行传输
          const chunkSize = Math.min(5, buffer.length) // 每次传输最多 5 个字符
          const currentChunk = buffer.substring(0, chunkSize)
          buffer = buffer.substring(chunkSize)

          if (currentChunk) {
            onChunk(currentChunk)
            // 添加小延迟，模拟打字效果
            await new Promise((resolve) => setTimeout(resolve, 20))
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },

  // 清除记忆接口
  clearMemory: (): Promise<ApiResponse<unknown>> => {
    return api.delete('/chat/clear')
  },
}
