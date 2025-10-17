<template>
  <div class="profile">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><User /></el-icon> 个人资料
          </h1>
          <p class="subtitle">管理您的个人信息，设立您的个人目标</p>
        </div>
        <el-button type="danger" class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span> 退出登录 </span>
        </el-button>
      </div>
    </div>
    <!-- 个人信息卡片 -->
    <div class="profile-grid">
      <!-- 基本信息卡片 -->
      <el-card class="info-card basic-info-card" v-loading="loading || avatarLoading">
        <div class="card-header">
          <h3>
            <el-icon><UserFilled /></el-icon> 基本信息
          </h3>
          <el-button type="primary" size="small" @click="editBasicInfo" class="edit-btn">
            <el-icon><Edit /></el-icon> <span>编辑</span>
          </el-button>
        </div>
        <div class="info-content">
          <!-- 头像和基本信息部分 -->
          <div class="avatar-info-section">
            <!-- 头像部分 -->
            <el-tooltip content="点击更换头像" placement="top" :disabled="avatarLoading">
              <div class="avatar-container" @click="triggerAvatarUpload">
                <div class="avatar-display" :class="{ loading: avatarLoading }">
                  <img
                    v-if="userInfo.avatarUrl"
                    :src="userInfo.avatarUrl"
                    alt="用户头像"
                    class="avatar-image"
                    @error="handleProfileAvatarError"
                  />
                  <div v-else class="avatar-placeholder">
                    <el-icon size="50"><User /></el-icon>
                  </div>
                  <!-- hover 时显示的编辑提示 -->
                  <div class="avatar-overlay">
                    <el-icon size="24"><Edit /></el-icon>
                    <span>更换头像</span>
                  </div>
                  <!-- 上传中的加载指示器 -->
                  <div v-if="avatarLoading" class="avatar-loading">
                    <el-icon class="rotating"><Loading /></el-icon>
                    <span>上传中...</span>
                  </div>
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  @change="handleAvatarChange"
                  style="display: none"
                />
              </div>
            </el-tooltip>

            <!-- 昵称和性别信息 -->
            <div class="user-basic-info">
              <div class="user-name">
                {{ userInfo.nickname || '未设置昵称' }}
              </div>
              <div class="user-gender">
                <el-icon><Male /></el-icon>
                {{ userInfo.gender || '未设置性别' }}
              </div>
            </div>
          </div>

          <!-- 其他信息项 -->
          <div class="info-item">
            <div class="info-label">
              <el-icon><Message /></el-icon> 邮箱地址
            </div>
            <div class="info-value">{{ userInfo.email || '未设置' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <el-icon><Calendar /></el-icon> 出生日期
            </div>
            <div class="info-value">
              {{ formatDate(userInfo.dateOfBirth) || '未设置' }}
            </div>
          </div>
        </div>
      </el-card>
      <!-- 健康统计卡片 -->
      <el-card class="info-card health-stats-card" v-loading="statsLoading">
        <div class="card-header">
          <h3>
            <el-icon><TrendCharts /></el-icon> 健康统计
          </h3>
        </div>
        <div class="stats-content">
          <div class="stat-row">
            <div class="stat-item">
              <div class="stat-icon weight-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">
                  {{ healthStats.totalRecords.body }}
                </div>
                <div class="stat-label">体重记录</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon days-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ healthStats.activeDays }}</div>
                <div class="stat-label">活跃天数</div>
              </div>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-item">
              <div class="stat-icon calories-icon">
                <el-icon><Food /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">
                  {{ healthStats.totalRecords.diet }}
                </div>
                <div class="stat-label">饮食记录</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon exercise-icon">
                <el-icon><Bicycle /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">
                  {{ healthStats.totalRecords.exercise }}
                </div>
                <div class="stat-label">运动记录</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <!-- 健康目标设置 -->
    <div class="goals-section">
      <el-card class="goals-card">
        <div class="card-header">
          <h3>
            <el-icon><Flag /></el-icon> 健康目标
          </h3>
          <el-button type="success" size="small" @click="editGoals" class="edit-btn">
            <el-icon><Setting /></el-icon> <span>设置目标</span>
          </el-button>
        </div>
        <div class="goals-content">
          <div class="goal-item">
            <div class="goal-icon">
              <el-icon><Food /></el-icon>
            </div>
            <div class="goal-info">
              <div class="goal-title">每日卡路里摄入目标</div>
              <div class="goal-value">{{ goals.dailyCaloriesIntake || '未设置' }} kcal</div>
            </div>
            <div class="goal-progress">
              <el-progress
                :percentage="calculateCaloriesIntakeProgress()"
                :color="getProgressColor(calculateCaloriesIntakeProgress())"
                :stroke-width="8"
              />
            </div>
          </div>
          <div class="goal-item">
            <div class="goal-icon">
              <el-icon><Bicycle /></el-icon>
            </div>
            <div class="goal-info">
              <div class="goal-title">每日卡路里消耗目标</div>
              <div class="goal-value">{{ goals.dailyCaloriesBurn || '未设置' }} kcal</div>
            </div>
            <div class="goal-progress">
              <el-progress
                :percentage="calculateCaloriesBurnProgress()"
                :color="getProgressColor(calculateCaloriesBurnProgress())"
                :stroke-width="8"
              />
            </div>
          </div>
          <div class="goal-item">
            <div class="goal-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="goal-info">
              <div class="goal-title">目标体重</div>
              <div class="goal-value weight-ratio">
                <span class="current-weight" :style="{ color: getWeightColor() }">
                  {{ currentWeight?.toFixed(1) || '未知' }}
                </span>
                <span class="separator">/</span>
                <span class="target-weight">
                  {{ goals.targetWeight?.toFixed(1) || '未设置' }} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <!-- 编辑基本信息对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑基本信息" width="600px" class="edit-dialog">
      <el-form :model="editForm" label-width="100px" class="edit-form">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="editForm.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
            v-model="editForm.dateOfBirth"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="editForm.newPassword"
            type="password"
            placeholder="请输入新密码（不修改请留空）"
            clearable
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" v-if="editForm.newPassword">
          <el-input
            v-model="editForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            clearable
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveBasicInfo" :loading="loading"> 保存 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="showGoalsDialog" title="设置健康目标" width="600px" class="edit-dialog">
      <el-form :model="goalsForm" label-width="140px" class="edit-form">
        <el-form-item label="每日卡路里摄入目标">
          <el-input-number
            v-model="goalsForm.dailyCaloriesIntake"
            :min="800"
            :max="5000"
            :step="50"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="每日卡路里消耗目标">
          <el-input-number
            v-model="goalsForm.dailyCaloriesBurn"
            :min="200"
            :max="3000"
            :step="50"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="目标体重 (kg)">
          <el-input-number
            v-model="goalsForm.targetWeight"
            :min="30"
            :max="200"
            :precision="1"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showGoalsDialog = false">取消</el-button>
          <el-button type="primary" @click="saveGoals">保存目标</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userApi, statisticsApi, bodyDataApi, dietApi, exerciseApi } from '@/api'
import MD5 from 'crypto-js/md5'
import { getLocalToday } from '@/utils/dateUtils'

import {
  User,
  UserFilled,
  Edit,
  Message,
  Male,
  Calendar,
  TrendCharts,
  Food,
  Bicycle,
  DataAnalysis,
  Clock,
  Flag,
  Setting,
  Aim,
  Loading,
  SwitchButton,
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const userInfo = reactive({
  userID: '',
  email: '',
  nickname: '',
  gender: '',
  dateOfBirth: '',
  avatarUrl: '',
})

const healthStats = reactive({
  totalRecords: {
    diet: 0,
    exercise: 0,
    body: 0,
  },
  activeDays: 0,
})

const goals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null,
})

const showEditDialog = ref(false)
const showGoalsDialog = ref(false)

const loading = ref(false)
const statsLoading = ref(false)
const avatarLoading = ref(false)

// 头像相关
const avatarInput = ref<HTMLInputElement>()

// 头像加载错误处理
const handleProfileAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Profile page avatar failed to load:', img.src)
  userInfo.avatarUrl = ''
}

const currentWeight = ref<number | null>(null)
const todayCalories = ref<number>(0)
const todayCaloriesBurned = ref<number>(0)

const editForm = reactive({
  nickname: '',
  gender: '',
  dateOfBirth: '',
  newPassword: '',
  confirmPassword: '',
})

const goalsForm = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null,
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']

  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

  // 同时检查 MIME 类型和文件扩展名
  const isValidMimeType = allowedTypes.includes(file.type)
  const isValidExtension = allowedExtensions.includes(fileExtension)

  if (!isValidMimeType || !isValidExtension) {
    if (!isValidExtension) {
      ElMessage.error(`不支持的文件扩展名！请选择 ${allowedExtensions.join('、')} 格式的图片文件`)
    } else {
      ElMessage.error(
        `不支持的图片格式！当前格式为 ${file.type}，请选择 ${allowedExtensions.join('、')} 格式的图片文件`,
      )
    }
    if (target) {
      target.value = ''
    }
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    ElMessage.error(`图片文件过大！当前大小为 ${fileSizeMB}MB，请选择小于 ${maxSizeMB}MB 的图片`)
    if (target) {
      target.value = ''
    }
    return
  }

  const img = new Image()
  img.onload = async () => {
    const { width, height } = img

    const maxDimension = 2000

    if (width > maxDimension || height > maxDimension) {
      ElMessage.error(
        `图片尺寸过大！当前尺寸为 ${width}×${height}，请选择 ${maxDimension}×${maxDimension} 以下的图片`,
      )
      // 清空文件输入框
      if (target) {
        target.value = ''
      }
      // 释放创建的 URL
      URL.revokeObjectURL(img.src)
      return
    }

    // 如果图片尺寸较大但在允许范围内，给出建议
    if (width > 800 || height > 800) {
      ElMessage.warning(
        `图片尺寸较大（${width}×${height}），建议使用 800×800 以下的图片以获得更好的显示效果`,
      )
    }

    // 继续上传流程
    await performUpload(file, target)

    // 释放创建的 URL
    URL.revokeObjectURL(img.src)
  }

  img.onerror = async () => {
    ElMessage.error('无法读取图片文件，请确保选择的是有效的图片文件')
    // 清空文件输入框
    if (target) {
      target.value = ''
    }
    // 释放创建的 URL
    URL.revokeObjectURL(img.src)
  }

  // 创建图片预览 URL 用于尺寸检查
  img.src = URL.createObjectURL(file)
}

// 执行上传的函数
const performUpload = async (file: File, target: HTMLInputElement) => {
  try {
    avatarLoading.value = true
    const response = await userApi.uploadAvatar(file)

    if (response.success && response.data) {
      ElMessage.success('头像上传成功！')
      // 重新加载头像并更新 store
      await loadAvatar()
      // 同时更新 userStore 中的头像
      await userStore.updateAvatar()
    } else {
      // 根据服务器返回的错误信息显示更具体的错误
      const errorMessage = response.message || '头像上传失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
  } catch (error: unknown) {
    console.error('Avatar upload failed:', error)

    // 根据不同的错误类型显示不同的错误信息
    let errorMessage = '头像上传失败，请稍后重试'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number
          data?: { message?: string }
        }
        message?: string
      }
      const status = axiosError.response?.status
      const serverMessage = axiosError.response?.data?.message

      switch (status) {
        case 400:
          errorMessage = serverMessage || '请求参数错误，请检查图片格式和大小'
          break
        case 401:
          errorMessage = '登录已过期，请重新登录后再试'
          break
        case 413:
          errorMessage = '图片文件过大，服务器拒绝接收'
          break
        case 415:
          errorMessage = '不支持的图片格式，请使用 JPG、PNG 或 GIF 格式'
          break
        case 500:
          errorMessage = '服务器内部错误，请稍后重试'
          break
        case 503:
          errorMessage = '服务器暂时不可用，请稍后重试'
          break
        default:
          if (serverMessage) {
            errorMessage = serverMessage
          } else if (axiosError.message) {
            if (axiosError.message.includes('Network Error')) {
              errorMessage = '网络连接失败，请检查网络后重试'
            } else if (axiosError.message.includes('timeout')) {
              errorMessage = '上传超时，请检查网络连接或选择更小的图片'
            }
          }
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      const genericError = error as { message: string }
      if (genericError.message.includes('未登录')) {
        errorMessage = '登录状态已失效，请重新登录后再试'
      }
    }

    ElMessage.error(errorMessage)
  } finally {
    avatarLoading.value = false
    // 清空文件输入框
    if (target) {
      target.value = ''
    }
  }
}

const loadAvatar = async () => {
  try {
    const response = await userApi.getAvatar()
    if (response && response.avatarUrl) {
      userInfo.avatarUrl = response.avatarUrl
    } else {
      userInfo.avatarUrl = ''
    }
  } catch (error: unknown) {
    console.error('Failed to load avatar:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { status?: number } }
      if (apiError.response?.status === 404) {
        userInfo.avatarUrl = ''
        return
      }
    }
    userInfo.avatarUrl = ''
  }
}

const loadUserInfo = async () => {
  try {
    loading.value = true
    const response = await userApi.getProfile()
    if (response.success && response.data) {
      Object.assign(userInfo, response.data)
    }
  } catch (error) {
    console.error('Failed to load user info:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

const loadHealthStats = async () => {
  try {
    statsLoading.value = true
    const response = await statisticsApi.getHealthOverview()
    if (response.success && response.data) {
      Object.assign(healthStats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

// 获取当前体重、今日卡路里摄入和消耗
const loadCurrentData = async () => {
  try {
    const today = getLocalToday()

    const bodyResponse = await bodyDataApi.getList({
      page: 1,
      size: 1,
      endDate: today,
    })
    if (bodyResponse.success && bodyResponse.data?.rows && bodyResponse.data.rows.length > 0) {
      currentWeight.value = bodyResponse.data.rows[0].weightKG
    }

    // 获取今日卡路里摄入
    const dietResponse = await dietApi.getList({
      startDate: today,
      endDate: today,
    })
    if (dietResponse.success && dietResponse.data?.rows) {
      todayCalories.value = dietResponse.data.rows.reduce(
        (sum, item) => sum + (item.estimatedCalories || 0),
        0,
      )
    }

    // 获取今日卡路里消耗
    try {
      const exerciseResponse = await exerciseApi.getList({
        startDate: today,
        endDate: today,
      })
      if (exerciseResponse.success && exerciseResponse.data?.rows) {
        todayCaloriesBurned.value = exerciseResponse.data.rows.reduce(
          (sum, item) => sum + (item.caloriesBurned || 0),
          0,
        )
      }
    } catch (error) {
      console.error('获取运动数据失败:', error)
      todayCaloriesBurned.value = 0
    }
  } catch (error) {
    console.error('加载当前数据失败:', error)
  }
}

// 加载健康目标（从 localStorage）
const loadGoals = () => {
  const savedGoals = localStorage.getItem('healthGoals')
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals)
    goals.targetWeight = parsed.targetWeight
    // 向后兼容：如果有旧的 dailyCalories，拆分为摄入和消耗
    if (parsed.dailyCalories && !parsed.dailyCaloriesIntake && !parsed.dailyCaloriesBurn) {
      goals.dailyCaloriesIntake = parsed.dailyCalories
      goals.dailyCaloriesBurn = Math.round(parsed.dailyCalories * 0.3) // 默认消耗为摄入的 30%
    } else {
      goals.dailyCaloriesIntake = parsed.dailyCaloriesIntake
      goals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
    }
  }
}

// 编辑基本信息
const editBasicInfo = () => {
  editForm.nickname = userInfo.nickname || ''
  editForm.gender = userInfo.gender || ''
  editForm.dateOfBirth = userInfo.dateOfBirth || ''
  editForm.newPassword = ''
  editForm.confirmPassword = ''
  showEditDialog.value = true
}

// 保存基本信息
const saveBasicInfo = async () => {
  try {
    // 添加调试信息
    const currentToken = localStorage.getItem('token')
    const currentUserID = localStorage.getItem('userID')
    console.log('保存用户信息 - token存在:', !!currentToken)
    console.log('保存用户信息 - userID:', currentUserID)

    // 验证性别值
    if (editForm.gender && !['男', '女'].includes(editForm.gender)) {
      ElMessage.error('性别只能选择男或女')
      return
    }

    // 验证密码
    if (editForm.newPassword) {
      if (editForm.newPassword !== editForm.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
      if (editForm.newPassword.length < 6) {
        ElMessage.error('密码长度不能少于 6 位')
        return
      }
    }

    loading.value = true

    // 构建更新数据 - 发送全部数据
    const updateData: {
      email: string
      nickname: string
      gender: string
      dateOfBirth: string
      passwordHash?: string
    } = {
      email: userInfo.email, // 保持邮箱不变
      nickname: editForm.nickname || userInfo.nickname || '', // 使用编辑的值或原值
      gender: editForm.gender || userInfo.gender || '', // 使用编辑的值或原值
      dateOfBirth: editForm.dateOfBirth || userInfo.dateOfBirth || '', // 使用编辑的值或原值
    }

    // 如果需要修改密码，添加 MD5 哈希
    if (editForm.newPassword && editForm.newPassword.trim()) {
      updateData.passwordHash = MD5(editForm.newPassword.trim()).toString()
    }

    console.log('发送的更新数据:', updateData) // 添加调试信息

    const response = await userApi.updateProfile(updateData)

    if (response.success) {
      // 只更新基本信息到 userInfo，不包括密码
      userInfo.nickname = editForm.nickname
      userInfo.gender = editForm.gender
      userInfo.dateOfBirth = editForm.dateOfBirth

      showEditDialog.value = false
      ElMessage.success('基本信息保存成功！')
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存基本信息失败:', error)
    ElMessage.error('保存基本信息失败')
  } finally {
    loading.value = false
  }
}

// 编辑目标
const editGoals = () => {
  goalsForm.targetWeight = goals.targetWeight
  goalsForm.dailyCaloriesIntake = goals.dailyCaloriesIntake
  goalsForm.dailyCaloriesBurn = goals.dailyCaloriesBurn
  showGoalsDialog.value = true
}

// 保存目标
const saveGoals = () => {
  Object.assign(goals, goalsForm)

  // 保存到 localStorage
  localStorage.setItem(
    'healthGoals',
    JSON.stringify({
      targetWeight: goals.targetWeight,
      dailyCaloriesIntake: goals.dailyCaloriesIntake,
      dailyCaloriesBurn: goals.dailyCaloriesBurn,
    }),
  )

  showGoalsDialog.value = false
  ElMessage.success('健康目标设置成功！')
}

// 计算卡路里摄入进度
const calculateCaloriesIntakeProgress = () => {
  if (!goals.dailyCaloriesIntake) {
    return 0
  }

  const progress = (todayCalories.value / goals.dailyCaloriesIntake) * 100
  return Math.min(100, progress)
}

// 计算卡路里消耗进度
const calculateCaloriesBurnProgress = () => {
  if (!goals.dailyCaloriesBurn) {
    return 0
  }

  const progress = (todayCaloriesBurned.value / goals.dailyCaloriesBurn) * 100
  return Math.min(100, progress)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 85) return '#67c23a' // 绿色：误差在 5% 以内
  if (percentage >= 60) return '#e6a23c' // 黄色：误差在 5-15% 之间
  return '#f56c6c' // 红色：误差超过 15%
}

// 计算今日体重的显示颜色
const getWeightColor = () => {
  if (!currentWeight.value || !goals.targetWeight) {
    return '#333' // 默认黑色
  }

  // 计算误差百分比
  const difference = Math.abs(currentWeight.value - goals.targetWeight)
  const errorPercentage = (difference / goals.targetWeight) * 100

  if (errorPercentage <= 5) {
    return '#67c23a' // 绿色
  } else if (errorPercentage <= 40) {
    return '#e6a23c' // 黄色
  } else {
    return '#f56c6c' // 红色
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 初始化数据
const initData = async () => {
  loadGoals()
  await Promise.all([loadUserInfo(), loadHealthStats(), loadCurrentData(), loadAvatar()])
}

onMounted(() => {
  initData()
})

// 组件销毁时清理 blob URL 以避免内存泄漏
onUnmounted(() => {
  if (userInfo.avatarUrl && userInfo.avatarUrl.startsWith('blob:')) {
    URL.revokeObjectURL(userInfo.avatarUrl)
  }
})
</script>
<style scoped>
.profile {
  padding: 30px;
  background: transparent;
  min-height: calc(100vh - 70px);
  overflow-y: auto;
}
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow:
    0 15px 35px rgba(102, 126, 234, 0.25),
    0 8px 25px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shimmer 3s ease-in-out infinite;
}
@keyframes shimmer {
  0%,
  100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.title-section {
  flex: 1;
}
.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}
.title-icon {
  font-size: 3rem;
  color: #fff;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3));
  animation: pulse 2s ease-in-out infinite;
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
.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 35px;
}
.goals-section {
  margin-bottom: 50px;
}
.info-card,
.goals-card {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 20px;
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.1),
    0 6px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}
.info-card:hover,
.goals-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 10px 25px rgba(0, 0, 0, 0.1);
}
.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
}
.card-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 15px;
  transition: all 0.3s ease;
}
.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}
.info-content {
  padding: 30px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}
.info-item:last-child {
  border-bottom: none;
}
.info-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #667eea;
  font-size: 1rem;
}
.info-value {
  font-weight: 500;
  color: #2d3748;
  font-size: 1rem;
}
.stats-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.stat-row {
  display: flex;
  gap: 25px;
}
.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}
.stat-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.calories-icon {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}
.exercise-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}
.weight-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.days-icon {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}
.goals-content {
  padding: 30px;
}
.goal-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}
.goal-item:last-child {
  border-bottom: none;
}
.goal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
.goal-info {
  flex: 1;
  min-width: 0;
}
.goal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
}
.goal-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #667eea;
}
.goal-progress {
  width: 200px;
  flex-shrink: 0;
} /* 对话框样式 */
.edit-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}
.edit-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px 30px;
  margin: 0;
  border-bottom: none;
}
.edit-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.edit-dialog :deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 25px;
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}
.edit-dialog :deep(.el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.3);
}
.edit-dialog :deep(.el-dialog__close) {
  color: white;
  font-size: 16px;
}

.edit-dialog :deep(.el-dialog__body) {
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
}

.edit-form :deep(.el-form-item__label) {
  color: #2d3748;
  font-weight: 600;
}

.edit-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
}

.edit-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
}

.edit-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px;
  background: rgba(102, 126, 234, 0.05);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  margin: 0;
  border-radius: 0 0 20px 20px;
}

.dialog-footer .el-button {
  border-radius: 15px;
  padding: 10px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:not(.el-button--primary) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
}

/* 头像和基本信息部分样式 */
.avatar-info-section {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 24px 0;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar-display {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.avatar-container:hover .avatar-display {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  border-color: #4c63d2;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-container:hover .avatar-image {
  filter: brightness(0.7);
}

.avatar-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a0aec0;
  transition: all 0.3s ease;
}

.avatar-container:hover .avatar-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #4c63d2 100%);
  color: white;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
  gap: 4px;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 12px;
  font-weight: 500;
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 50%;
  gap: 4px;
  z-index: 10;
}

.avatar-loading span {
  font-size: 12px;
  font-weight: 500;
}

.avatar-display.loading .avatar-overlay {
  opacity: 0 !important;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.user-basic-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
}

.user-gender {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.user-gender .el-icon {
  color: #667eea;
}

.weight-ratio {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.2rem;
  font-weight: 600;
}

.current-weight {
  font-weight: 700;
}

.separator {
  color: #666;
  font-weight: 400;
}

.target-weight {
  color: #667eea;
  font-weight: 600;
}

/* 退出登录按钮样式 */
.logout-btn {
  background: linear-gradient(45deg, #ef4444 0%, #f87171 50%, #fca5a5 100%);
  border: none;
  border-radius: 12px;
  padding: 18px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
  transition: all 0.3s ease;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 50px;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(239, 68, 68, 0.5);
  background: linear-gradient(45deg, #fca5a5 0%, #f87171 50%, #ef4444 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stat-row {
    flex-direction: column;
    gap: 15px;
  }

  .goal-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .goal-progress {
    width: 100%;
  }

  .avatar-info-section {
    flex-direction: column;
    text-align: center;
    gap: 32px;
    padding: 20px 0;
  }

  .avatar-display {
    width: 120px;
    height: 120px;
  }

  .user-name {
    font-size: 18px;
  }

  .user-basic-info {
    align-items: center;
  }
}
</style>
