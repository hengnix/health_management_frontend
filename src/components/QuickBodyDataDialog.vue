<template>
  <el-dialog
    v-model="visible"
    title="快速记录身体数据"
    width="600px"
    @close="handleClose"
    class="overflow-hidden rounded-3xl border border-white/20 shadow-2xl backdrop-blur-sm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="bg-white/98 p-8"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="身高" prop="heightCM">
            <div class="relative flex w-full items-center">
              <el-input-number
                v-model="form.heightCM"
                :min="100"
                :max="250"
                :precision="1"
                :step="0.5"
                style="width: 100%"
                placeholder="请输入身高"
                controls-position="right"
                @change="handleHeightChange"
              />
              <span
                class="pointer-events-none absolute top-1/2 right-10 z-10 -translate-y-1/2 transform bg-white px-1 text-sm text-gray-400"
                >cm</span
              >
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="体重" prop="weightKG">
            <div class="relative flex w-full items-center">
              <el-input-number
                v-model="form.weightKG"
                :min="0"
                :max="500"
                :precision="1"
                :step="0.1"
                style="width: 100%"
                controls-position="right"
              />
              <span
                class="pointer-events-none absolute top-1/2 right-10 z-10 -translate-y-1/2 transform bg-white px-1 text-sm text-gray-400"
                >kg</span
              >
            </div>
          </el-form-item>
        </el-col>
      </el-row>

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

      <!-- BMI 预览 -->
      <div
        v-if="form.heightCM && form.weightKG"
        class="animate-fade-in-up mt-6"
      >
        <el-card
          class="w-full rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <span
                class="flex items-center gap-2 text-base font-bold text-gray-700"
              >
                📊 BMI 指数
              </span>
              <el-tag
                :type="getBMITagType()"
                size="large"
                class="rounded-2xl px-4 py-2 text-lg font-bold"
              >
                {{ calculateBMI() }}
              </el-tag>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span
                class="bmi-status-badge border border-indigo-200 bg-indigo-100 text-sm font-semibold text-indigo-600"
              >
                {{ getBMIStatus() }}
              </span>
              <span class="text-xs text-gray-500 italic">
                {{ getBMIRange() }}
              </span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 健康提示 -->
      <div v-if="healthTip" class="animate-fade-in-up animation-delay-200 mt-5">
        <el-alert
          :title="healthTip"
          type="info"
          :closable="false"
          show-icon
          class="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
        />
      </div>
    </el-form>

    <template #footer>
      <div
        class="flex justify-end border-t border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5"
      >
        <el-button
          @click="handleClose"
          size="large"
          class="rounded-2xl border-2 border-indigo-200 bg-white/80 px-8 py-3 font-semibold text-indigo-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-sm"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          size="large"
          class="relative overflow-hidden rounded-2xl border-none bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-purple-600 hover:to-indigo-500 hover:shadow-lg"
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
import { ref, reactive, watch, computed } from 'vue'
import { bodyDataApi } from '@/api'
import type { BodyDataRequest } from '@/types'
import { ElMessage, type FormInstance } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

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

const form = reactive({
  heightCM: 170,
  weightKG: 65,
  recordDate: new Date().toISOString().split('T')[0],
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '一周前',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
]

const rules = {
  heightCM: [
    { required: true, message: '请输入身高', trigger: 'blur' },
    {
      type: 'number',
      min: 100,
      max: 250,
      message: '身高应在 100-250 cm 之间',
      trigger: 'blur',
    },
  ],
  weightKG: [
    { required: true, message: '请输入体重', trigger: 'blur' },
    {
      type: 'number',
      min: 30,
      max: 300,
      message: '体重应在 30-300 kg 之间',
      trigger: 'blur',
    },
  ],
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' },
  ],
}

const calculateBMI = () => {
  if (form.heightCM && form.weightKG) {
    const heightM = form.heightCM / 100
    const bmi = form.weightKG / (heightM * heightM)
    return bmi.toFixed(1)
  }
  return '0.0'
}

const getBMIStatus = () => {
  const bmi = parseFloat(calculateBMI())
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '超重'
  return '肥胖'
}

const getBMITagType = () => {
  const bmi = parseFloat(calculateBMI())
  if (bmi < 18.5) return 'warning'
  if (bmi < 24) return 'success'
  if (bmi < 28) return 'warning'
  return 'danger'
}

const getBMIRange = () => {
  const bmi = parseFloat(calculateBMI())
  if (bmi < 18.5) return '正常范围: 18.5-23.9'
  if (bmi < 24) return '您的 BMI 很健康！'
  if (bmi < 28) return '正常范围: 18.5-23.9'
  return '建议咨询医生'
}

// 健康提示
const healthTip = computed(() => {
  const bmi = parseFloat(calculateBMI())
  if (bmi < 18.5) {
    return '您的 BMI 偏低，建议您适当增加营养摄入，进行力量训练'
  }
  if (bmi >= 24 && bmi < 28) {
    return '您的 BMI 偏高，建议您控制饮食，增加有氧运动'
  }
  if (bmi >= 28) {
    return '您的 BMI 过高，建议您制定减重计划，必要时咨询专业医生'
  }
  return ''
})

const handleHeightChange = () => {
  // 身高变化时的处理逻辑
  if (form.heightCM && form.weightKG) {
    // 添加一些实时反馈
    console.log(`当前身高: ${form.heightCM} cm, 体重: ${form.weightKG} kg`)
    const bmi = calculateBMI()
    console.log(`当前 BMI: ${bmi}`)
    if (bmi) {
      console.log(`当前 BMI 状态: ${getBMIStatus()}`)
    }
    if (healthTip.value) {
      console.log(`健康提示: ${healthTip.value}`)
    }
  }
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      loadLatestData()
    }
  },
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载用户最新的身体数据
const loadLatestData = async () => {
  try {
    const userID = localStorage.getItem('userID')
    if (!userID) {
      resetFormWithDefaults()
      return
    }

    // 获取最近的 1 条记录
    const response = await bodyDataApi.getList({
      page: 1,
      size: 1,
    })

    if (
      response.success &&
      response.data?.rows &&
      response.data.rows.length > 0
    ) {
      const latestRecord = response.data.rows[0]
      console.log('加载最新记录:', latestRecord)

      // 使用历史记录的身高和体重作为默认值
      Object.assign(form, {
        heightCM: latestRecord.heightCM || 170,
        weightKG: latestRecord.weightKG || 65,
        recordDate: new Date().toISOString().split('T')[0],
      })
    } else {
      resetFormWithDefaults()
    }
  } catch (error) {
    console.error('加载历史数据失败:', error)
    resetFormWithDefaults()
  }

  formRef.value?.clearValidate()
}

const resetFormWithDefaults = () => {
  Object.assign(form, {
    heightCM: 170,
    weightKG: 65,
    recordDate: new Date().toISOString().split('T')[0],
  })
}

const handleClose = () => {
  visible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  // 检查用户是否已登录
  const userID = localStorage.getItem('userID')
  console.log('当前用户 ID:', userID)

  if (!userID) {
    ElMessage.error('请先登录')
    return
  }

  console.log('表单数据:', form)

  const valid = await formRef.value.validate().catch((err) => {
    console.log('表单验证失败:', err)
    return false
  })

  if (!valid) {
    console.log('表单验证不通过')
    return
  }

  submitting.value = true

  try {
    const formData: BodyDataRequest = {
      userID: userID,
      heightCM: form.heightCM,
      weightKG: form.weightKG,
      recordDate: form.recordDate,
    }

    console.log('发送的数据:', formData)

    // 先查询当日是否已有记录
    const todayRecords = await bodyDataApi.getList({
      startDate: form.recordDate,
      endDate: form.recordDate,
    })

    let response
    if (
      todayRecords.success &&
      todayRecords.data?.rows &&
      todayRecords.data.rows.length > 0
    ) {
      // 如果今日已有记录，更新第一条记录
      const existingRecord = todayRecords.data.rows[0]
      console.log('今日已有记录，更新记录:', existingRecord)

      // 确保 bodyMetricID 存在
      if (existingRecord.bodyMetricID) {
        response = await bodyDataApi.update(
          existingRecord.bodyMetricID,
          formData,
        )
        console.log('更新 API 响应:', response)
      } else {
        throw new Error('记录 ID 不存在，无法更新')
      }
    } else {
      // 如果今日没有记录，创建新记录
      console.log('今日没有记录，创建新记录')
      response = await bodyDataApi.create(formData)
      console.log('创建 API 响应:', response)
    }

    if (response.success) {
      ElMessage.success('记录成功')
      emit('success')
      handleClose()
    } else {
      console.log('API 返回失败:', response.message)
      ElMessage.error(response.message || '记录失败')
    }
  } catch (error: unknown) {
    console.error('API 调用异常:', error)
    const err = error as {
      response?: { data?: { message?: string } }
      message?: string
    }
    ElMessage.error(err.response?.data?.message || err.message || '记录失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Dialog 头部样式 */
:deep(.el-dialog__header) {
  border: none;
  background: linear-gradient(to right, rgb(99 102 241), rgb(147 51 234));
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

/* 数字输入框样式 */
:deep(.el-input-number .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 2px solid rgb(224 231 255);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  transform: translateY(-1px);
  border-color: rgb(165 180 252);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(102, 126, 234, 0.1);
}

:deep(.el-input-number .el-input__wrapper.is-focus) {
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  border-radius: 0.5rem;
  border: none;
  background: rgb(224 231 255);
  color: rgb(99 102 241);
  transition: all 0.3s ease;
  margin: 2px;
}

:deep(.el-input-number__increase:hover),
:deep(.el-input-number__decrease:hover) {
  background: rgb(199 210 254);
  color: rgb(147 51 234);
}

/* 日期选择器样式 */
:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 2px solid rgb(224 231 255);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-date-editor .el-input__wrapper:hover) {
  transform: translateY(-1px);
  border-color: rgb(165 180 252);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(102, 126, 234, 0.1);
}

:deep(.el-date-editor .el-input__wrapper.is-focus) {
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 健康提示样式 */
:deep(.el-alert__icon) {
  color: rgb(99 102 241);
}

:deep(.el-alert__title) {
  font-size: 0.875rem;
  line-height: 1.625;
  color: rgb(55 65 81);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

/* BMI 状态徽章椭圆形样式 */
.bmi-status-badge {
  border-radius: 50px;
  padding: 6px 16px;
  display: inline-block;
  white-space: nowrap;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 0 1.25rem;
    width: 95%;
  }
}
</style>
