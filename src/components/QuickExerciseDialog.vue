<template>
  <el-dialog
    v-model="visible"
    title="快速记录运动"
    width="600px"
    @close="handleClose"
    class="overflow-hidden rounded-3xl border border-white/20 shadow-2xl backdrop-blur-sm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="bg-white/98 p-8">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="记录日期" prop="recordDate">
            <el-date-picker
              v-model="form.recordDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="运动时长" prop="durationMinutes">
            <div class="relative flex w-full items-center">
              <el-input-number
                v-model="form.durationMinutes"
                :min="1"
                :max="600"
                :precision="0"
                style="width: 100%"
                placeholder="运动时长"
                controls-position="right"
                @change="calculateCalories"
              />
              <span
                class="pointer-events-none absolute top-1/2 right-10 z-10 -translate-y-1/2 transform bg-white px-1 text-sm text-gray-400"
                >min</span
              >
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="运动类型" prop="exerciseType">
        <el-select
          v-model="form.exerciseType"
          placeholder="选择运动类型"
          style="width: 100%"
          filterable
          allow-create
          @change="handleExerciseTypeChange"
        >
          <el-option-group label="有氧运动">
            <el-option label="🏃‍♂️ 跑步" value="跑步" />
            <el-option label="🏊‍♂️ 游泳" value="游泳" />
            <el-option label="🚴‍♂️ 骑行" value="骑行" />
            <el-option label="🥾 徒步" value="徒步" />
            <el-option label="🏔️ 爬山" value="爬山" />
            <el-option label="🤸‍♀️ 跳绳" value="跳绳" />
          </el-option-group>
          <el-option-group label="球类运动">
            <el-option label="🏀 篮球" value="篮球" />
            <el-option label="⚽ 足球" value="足球" />
            <el-option label="🏸 羽毛球" value="羽毛球" />
            <el-option label="🏓 乒乓球" value="乒乓球" />
            <el-option label="🎾 网球" value="网球" />
          </el-option-group>
          <el-option-group label="健身训练">
            <el-option label="💪 健身房训练" value="健身房训练" />
            <el-option label="🧘‍♀️ 瑜伽" value="瑜伽" />
            <el-option label="🤸‍♀️ 普拉提" value="普拉提" />
            <el-option label="🏋️‍♂️ 力量训练" value="力量训练" />
          </el-option-group>
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>

      <el-form-item label="运动强度" prop="intensity">
        <el-radio-group v-model="form.intensity" @change="calculateCalories">
          <el-radio-button label="低强度">😌 低强度</el-radio-button>
          <el-radio-button label="中等强度">😊 中等强度</el-radio-button>
          <el-radio-button label="高强度">😤 高强度</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="消耗热量" prop="estimatedCaloriesBurned">
        <div class="relative flex w-full items-center">
          <el-input-number
            v-model="form.estimatedCaloriesBurned"
            :min="0"
            :precision="0"
            style="width: 100%"
            placeholder="消耗热量"
            controls-position="right"
          />
          <span
            class="pointer-events-none absolute top-1/2 right-10 z-10 -translate-y-1/2 transform bg-white px-1 text-sm text-gray-400"
            >kcal</span
          >
        </div>
      </el-form-item>

      <!-- 运动效果预览 -->
      <div
        v-if="form.exerciseType && form.durationMinutes && form.estimatedCaloriesBurned"
        class="mt-5"
      >
        <el-card
          class="rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50/30 to-red-50/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div class="p-4">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-lg font-bold text-gray-700">🏃‍♂️ 运动效果预览</span>
              <el-tag :type="getIntensityTagType()" size="small">
                {{ getExerciseIntensity() }}
              </el-tag>
            </div>
            <div class="mb-4 grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3">
                <div class="text-xl">🏃‍♂️</div>
                <div>
                  <div class="text-xs text-gray-500">运动类型</div>
                  <div class="font-semibold">{{ form.exerciseType }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-xl">⏱️</div>
                <div>
                  <div class="text-xs text-gray-500">运动时长</div>
                  <div class="font-semibold">{{ form.durationMinutes }} 分钟</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-xl">🔥</div>
                <div>
                  <div class="text-xs text-gray-500">消耗热量</div>
                  <div class="font-semibold text-red-600">
                    {{ form.estimatedCaloriesBurned }} kcal
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-xl">💪</div>
                <div>
                  <div class="text-xs text-gray-500">运动强度</div>
                  <div class="font-semibold">
                    {{ form.intensity || '未设置' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-gray-600">
                <span>热量消耗率: {{ getCalorieRate() }} kcal/min</span>
                <span>健康指数: {{ getHealthScore() }}%</span>
              </div>
              <el-progress
                :percentage="getHealthScore()"
                :color="getProgressColor()"
                :stroke-width="8"
                :show-text="false"
              />
            </div>
          </div>
        </el-card>
      </div>

      <!-- 健康提示 -->
      <div v-if="healthTip" class="mt-5">
        <el-alert
          :title="healthTip"
          type="info"
          :closable="false"
          show-icon
          class="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/50"
        />
      </div>
    </el-form>

    <template #footer>
      <div
        class="flex justify-end border-t border-orange-100 bg-gradient-to-br from-orange-50/50 to-red-50/50 p-5"
      >
        <el-button
          @click="handleClose"
          size="large"
          class="rounded-2xl border-2 border-orange-200 bg-white/80 px-8 py-3 font-semibold text-orange-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-sm"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          size="large"
          class="relative overflow-hidden rounded-2xl border-none bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-red-600 hover:to-orange-500 hover:shadow-lg"
        >
          <el-icon><Check /></el-icon>
          <span>
            {{ submitting ? '记录中...' : '确认记录' }}
          </span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { exerciseApi } from '@/api'
import type { ExerciseRequest } from '@/types'
import { ElMessage, type FormInstance } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { getLocalToday } from '@/utils/dateUtils'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = ref<ExerciseRequest>({
  userID: '',
  exerciseType: '',
  durationMinutes: 0,
  estimatedCaloriesBurned: undefined,
  recordDate: getLocalToday(),
})

const rules = {
  exerciseType: [{ required: true, message: '请选择或输入运动类型', trigger: 'change' }],
  recordDate: [{ required: true, message: '请选择记录日期', trigger: 'change' }],
  durationMinutes: [
    { required: true, message: '请输入运动时长', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      max: 600,
      message: '运动时长应在 1-600 min 之间',
      trigger: 'blur',
    },
  ],
  estimatedCaloriesBurned: [
    { required: true, message: '请输入估计消耗热量', trigger: 'blur' },
    { type: 'number', min: 1, message: '消耗热量必须大于 0', trigger: 'blur' },
  ],
}

// 日期快捷选择
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      return date
    },
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - 1)
      return date
    },
  },
  {
    text: '一周前',
    value: () => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - 7)
      return date
    },
  },
]

// 运动类型与热量系数的映射
const exerciseCalorieMap = {
  跑步: 12,
  游泳: 14,
  骑行: 8,
  篮球: 10,
  足球: 11,
  羽毛球: 9,
  乒乓球: 7,
  网球: 9,
  健身房训练: 10,
  瑜伽: 4,
  普拉提: 5,
  爬山: 13,
  徒步: 6,
  跳绳: 15,
  力量训练: 8,
  其他: 8,
}

// 强度系数
const intensityMultiplier = {
  低强度: 0.8,
  中等强度: 1.0,
  高强度: 1.3,
}

// 处理运动类型变化
const handleExerciseTypeChange = () => {
  calculateCalories()
}

// 智能计算热量消耗
const calculateCalories = () => {
  if (form.value.durationMinutes && form.value.exerciseType && form.value.intensity) {
    const baseCalorie =
      exerciseCalorieMap[form.value.exerciseType as keyof typeof exerciseCalorieMap] || 8
    const multiplier =
      intensityMultiplier[form.value.intensity as keyof typeof intensityMultiplier] || 1.0

    form.value.estimatedCaloriesBurned = Math.round(
      baseCalorie * form.value.durationMinutes * multiplier,
    )
  }
}

// 健康提示
const healthTip = computed(() => {
  if (form.value.durationMinutes && form.value.estimatedCaloriesBurned) {
    const rate = form.value.estimatedCaloriesBurned / form.value.durationMinutes
    if (rate > 12) {
      return '🔥 高强度运动，注意适量，避免过度疲劳'
    } else if (rate < 5) {
      return '😌 轻度运动，建议适当增加运动强度以获得更好效果'
    } else {
      return '👍 运动强度适中，继续保持！'
    }
  }
  return ''
})

// 获取运动强度
const getExerciseIntensity = () => {
  if (form.value.intensity) {
    return form.value.intensity
  }

  // 默认根据运动类型返回一个大致的强度
  const typeIntensityMap = {
    跑步: '中等强度',
    游泳: '中等强度',
    骑行: '中等强度',
    瑜伽: '低强度',
    力量训练: '高强度',
    其他: '中等强度',
  }

  return typeIntensityMap[form.value.exerciseType as keyof typeof typeIntensityMap] || '未设置'
}

// 获取强度标签类型
const getIntensityTagType = () => {
  const intensity = getExerciseIntensity()
  if (intensity === '低强度') return 'success'
  if (intensity === '中等强度') return 'warning'
  if (intensity === '高强度') return 'danger'
  return ''
}

// 获取卡路里消耗率
const getCalorieRate = () => {
  if (form.value.durationMinutes && form.value.estimatedCaloriesBurned) {
    return (form.value.estimatedCaloriesBurned / form.value.durationMinutes).toFixed(1)
  }
  return '0'
}

// 获取健康指数
const getHealthScore = () => {
  if (form.value.durationMinutes && form.value.estimatedCaloriesBurned) {
    // 假设健康指数 = (消耗热量 / 运动时长) * 10
    const score = (form.value.estimatedCaloriesBurned / form.value.durationMinutes) * 10
    return Math.min(Math.round(score), 100)
  }
  return 0
}

// 获取进度条颜色
const getProgressColor = () => {
  const score = getHealthScore()
  if (score >= 80) return '#67c23a' // green
  if (score >= 50) return '#e6a23c' // orange
  return '#f56c6c' // red
}

// 提交数据
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    const exerciseData: ExerciseRequest = {
      userID: form.value.userID, // 添加userID字段
      exerciseType: form.value.exerciseType,
      recordDate: form.value.recordDate,
      durationMinutes: form.value.durationMinutes!,
      estimatedCaloriesBurned: form.value.estimatedCaloriesBurned!,
      intensity: form.value.intensity,
    }

    await exerciseApi.create(exerciseData)

    ElMessage.success('运动记录添加成功！')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('添加运动记录失败:', error)
    ElMessage.error('添加运动记录失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
  visible.value = false

  // 重置表单
  const resetForm = () => {
    form.value = {
      userID: '',
      exerciseType: '',
      durationMinutes: 0,
      estimatedCaloriesBurned: undefined,
      recordDate: getLocalToday(),
    }
  }
  resetForm()

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 监听 props.modelValue 的变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
  },
)
</script>

<style scoped>
/* Dialog 头部样式 */
:deep(.el-dialog__header) {
  border: none;
  background: linear-gradient(to right, rgb(249 115 22), rgb(239 68 68));
  padding: 1.5rem;
  margin: 0;
}

:deep(.el-dialog__title) {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__headerbtn) {
  top: 1.5rem;
  right: 2rem;
  height: 2.25rem;
  width: 2.25rem;
}

:deep(.el-dialog__close) {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

:deep(.el-dialog__close:hover) {
  transform: rotate(90deg);
  color: white;
}

:deep(.el-dialog__body) {
  padding: 0;
}

/* 表单样式 */
:deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

:deep(.el-form-item__label) {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(55 65 81);
}

/* 输入框样式 */
:deep(.el-input-number .el-input__wrapper),
:deep(.el-select .el-input__wrapper),
:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 2px solid rgb(254 215 170);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-input-number .el-input__wrapper:hover),
:deep(.el-select .el-input__wrapper:hover),
:deep(.el-date-editor .el-input__wrapper:hover) {
  transform: translateY(-1px);
  border-color: rgb(251 146 60);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.el-input-number .el-input__wrapper.is-focus),
:deep(.el-select .el-input__wrapper.is-focus),
:deep(.el-date-editor .el-input__wrapper.is-focus) {
  border-color: rgb(249 115 22);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  border-radius: 0.5rem;
  border: none;
  background: rgb(254 215 170);
  color: rgb(249 115 22);
  transition: all 0.3s ease;
  margin: 2px;
}

:deep(.el-input-number__increase:hover),
:deep(.el-input-number__decrease:hover) {
  background: rgb(253 186 116);
  color: rgb(239 68 68);
}

/* 单选按钮组样式 */
:deep(.el-radio-button__inner) {
  border-radius: 0;
  border: 2px solid rgb(254 215 170);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

/* 第一个按钮 - 左侧圆角 */
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 0.75rem 0 0 0.75rem;
}

/* 最后一个按钮 - 右侧圆角 */
:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 0.75rem 0.75rem 0;
}

/* 中间按钮保持矩形 - 已经通过上面的 border-radius: 0 实现 */

:deep(.el-radio-button__inner:hover) {
  border-color: rgb(251 146 60);
  background: rgb(254 215 170);
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: rgb(249 115 22);
  border-color: rgb(249 115 22);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 0 1.25rem;
    width: 95%;
  }
}
</style>
