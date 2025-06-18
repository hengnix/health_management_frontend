<template>
  <el-dialog
    v-model="visible"
    title="快速记录饮食"
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
          <el-form-item label="餐次" prop="mealType">
            <el-select
              v-model="form.mealType"
              placeholder="选择餐次"
              style="width: 100%"
              @change="handleMealTypeChange"
            >
              <el-option label="🌅 早餐" value="早餐" />
              <el-option label="🌞 午餐" value="午餐" />
              <el-option label="🌆 晚餐" value="晚餐" />
              <el-option label="🍎 加餐" value="加餐" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="食物名称" prop="foodName">
        <el-autocomplete
          v-model="form.foodName"
          :fetch-suggestions="querySearch"
          placeholder="请输入食物名称（如：苹果、鸡胸肉等）"
          style="width: 100%"
          @select="handleFoodSelect"
          clearable
        >
          <template #default="{ item }">
            <div class="food-suggestion">
              <span class="food-name">{{ item.name }}</span>
              <span class="food-calories">{{ item.calories }}kcal/100g</span>
            </div>
          </template>
        </el-autocomplete>
      </el-form-item>

      <el-form-item label="估计热量" prop="estimatedCalories">
        <div class="relative flex w-full items-center">
          <el-input-number
            v-model="form.estimatedCalories"
            :min="0"
            :precision="0"
            style="width: 100%"
            placeholder="热量值"
            controls-position="right"
          />
          <span
            class="pointer-events-none absolute top-1/2 right-10 z-10 -translate-y-1/2 transform bg-white px-1 text-sm text-gray-400"
            >kcal</span
          >
        </div>
      </el-form-item>

      <!-- 营养成分预览 -->
      <div
        v-if="form.foodName && form.estimatedCalories"
        class="animate-fade-in-up mt-5"
      >
        <el-card
          class="relative overflow-hidden rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div
            class="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"
          ></div>
          <div class="flex flex-col gap-3 p-5">
            <div class="flex items-center justify-between">
              <span
                class="flex items-center gap-2 text-base font-bold text-gray-700"
              >
                📊 营养摄入预览
              </span>
              <el-tag :type="getCalorieTagType()" size="small">
                {{ getCalorieLevel() }}
              </el-tag>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-semibold text-gray-700">🍽️ 食物</span>
                <span
                  class="rounded-2xl bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800"
                  >{{ form.foodName }}</span
                >
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-semibold text-gray-700">🔥 热量</span>
                <span
                  class="rounded-2xl border border-red-200 bg-red-100 px-3 py-1 text-sm font-semibold text-red-600"
                  >{{ form.estimatedCalories }} kcal</span
                >
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-semibold text-gray-700">🕐 餐次</span>
                <span
                  class="rounded-2xl border border-emerald-200 bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-600"
                  >{{ form.mealType }}</span
                >
              </div>
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
          class="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"
        />
      </div>
    </el-form>

    <template #footer>
      <div
        class="flex justify-end border-t border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-5"
      >
        <el-button
          @click="handleClose"
          size="large"
          class="rounded-2xl border-2 border-emerald-200 bg-white/80 px-8 py-3 font-semibold text-emerald-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-sm"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          size="large"
          class="relative overflow-hidden rounded-2xl border-none bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-600 hover:to-emerald-500 hover:shadow-lg"
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
import { dietApi } from '@/api'
import type { DietRequest } from '@/types'
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

// 工具函数：获取本地日期字符串（YYYY-MM-DD 格式）
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  mealType: '',
  foodName: '',
  recordDate: getLocalDateString(), // 修复时区问题
  estimatedCalories: undefined as number | undefined,
})

const rules = {
  mealType: [{ required: true, message: '请选择餐次', trigger: 'change' }],
  foodName: [{ required: true, message: '请输入食物名称', trigger: 'blur' }],
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' },
  ],
  estimatedCalories: [
    { required: true, message: '请输入估计热量', trigger: 'blur' },
    { type: 'number', min: 1, message: '热量必须大于 0', trigger: 'blur' },
  ],
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      resetForm()
    }
  },
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  const currentHour = new Date().getHours()
  let defaultMealType = '早餐'

  if (currentHour >= 6 && currentHour < 10) {
    defaultMealType = '早餐'
  } else if (currentHour >= 11 && currentHour < 14) {
    defaultMealType = '午餐'
  } else if (currentHour >= 17 && currentHour < 21) {
    defaultMealType = '晚餐'
  } else {
    defaultMealType = '加餐'
  }

  Object.assign(form, {
    mealType: defaultMealType,
    foodName: '',
    recordDate: getLocalDateString(), // 修复时区问题
    estimatedCalories: undefined,
  })
  formRef.value?.clearValidate()
}

const handleClose = () => {
  visible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true

  try {
    // 根据 API 文档使用正确的字段名
    const formData: DietRequest = {
      userID: '', // 在 API 调用时会自动添加
      recordDate: form.recordDate,
      foodName: form.foodName,
      mealType: form.mealType,
      estimatedCalories: form.estimatedCalories,
    }

    const response = await dietApi.create(formData)
    if (response.success) {
      ElMessage.success('记录成功')
      emit('success')
      handleClose()
    }
  } catch (error: Error | unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    ElMessage.error(err.response?.data?.message || '记录失败')
  } finally {
    submitting.value = false
  }
}

// 计算卡路里等级
const getCalorieLevel = () => {
  if (form.estimatedCalories === undefined) return ''
  if (form.estimatedCalories < 200) {
    return '低热量'
  } else if (form.estimatedCalories < 500) {
    return '中热量'
  } else {
    return '高热量'
  }
}

// 获取卡路里标签类型
const getCalorieTagType = () => {
  const level = getCalorieLevel()
  if (level === '低热量') return 'success'
  if (level === '中热量') return 'warning'
  if (level === '高热量') return 'danger'
  return ''
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
    text: '最近一周',
    value: () => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - 7)
      return date
    },
  },
]

// 餐次变化处理
const handleMealTypeChange = (value: string) => {
  // 根据选择的餐次调整默认食物
  if (value === '早餐') {
    form.foodName = '燕麦片'
    form.estimatedCalories = 150
  } else if (value === '午餐') {
    form.foodName = '鸡胸肉'
    form.estimatedCalories = 250
  } else if (value === '晚餐') {
    form.foodName = '三文鱼'
    form.estimatedCalories = 350
  } else {
    form.foodName = ''
    form.estimatedCalories = undefined
  }
}

// 查询食物建议
const querySearch = async (
  queryString: string,
  cb: (arg0: { value: string; calories: number }[]) => void,
) => {
  if (!queryString) {
    cb([])
    return
  }

  try {
    // 模拟 API 请求
    const response = await new Promise<{ value: string; calories: number }[]>(
      (resolve) => {
        setTimeout(() => {
          resolve([
            { value: queryString + '1', calories: 100 },
            { value: queryString + '2', calories: 200 },
            { value: queryString + '3', calories: 300 },
          ])
        }, 500)
      },
    )
    cb(response)
  } catch {
    cb([])
  }
}

// 食物选择处理
const handleFoodSelect = (item: { value: string; calories: number }) => {
  form.foodName = item.value
  form.estimatedCalories = item.calories
}

// 健康提示
const healthTip = computed(() => {
  if (form.estimatedCalories === undefined) return ''

  if (form.estimatedCalories < 200) {
    return '适量摄入，注意营养均衡'
  } else if (form.estimatedCalories >= 200 && form.estimatedCalories < 500) {
    return '合理的热量摄入，保持良好饮食习惯'
  } else {
    return '热量较高，建议适量食用并增加运动'
  }
})
</script>

<style scoped>
/* Dialog 头部样式 */
:deep(.el-dialog__header) {
  border: none;
  background: linear-gradient(to right, rgb(16 185 129), rgb(20 184 166));
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
  border: 2px solid rgb(209 250 229);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  transform: translateY(-1px);
  border-color: rgb(110 231 183);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.el-input-number .el-input__wrapper.is-focus) {
  border-color: rgb(16 185 129);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  border-radius: 0.5rem;
  border: none;
  background: rgb(209 250 229);
  color: rgb(16 185 129);
  transition: all 0.3s ease;
  margin: 2px;
}

:deep(.el-input-number__increase:hover),
:deep(.el-input-number__decrease:hover) {
  background: rgb(187 247 208);
  color: rgb(20 184 166);
}

/* 日期选择器和下拉框样式 */
:deep(.el-date-editor .el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 2px solid rgb(209 250 229);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-date-editor .el-input__wrapper:hover),
:deep(.el-select .el-input__wrapper:hover) {
  transform: translateY(-1px);
  border-color: rgb(110 231 183);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.el-date-editor .el-input__wrapper.is-focus),
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: rgb(16 185 129);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* 自动完成输入框样式 */
:deep(.el-autocomplete .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 2px solid rgb(209 250 229);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-autocomplete .el-input__wrapper:hover) {
  transform: translateY(-1px);
  border-color: rgb(110 231 183);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.el-autocomplete .el-input__wrapper.is-focus) {
  border-color: rgb(16 185 129);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* 健康提示样式 */
:deep(.el-alert__icon) {
  color: rgb(16 185 129);
}

:deep(.el-alert__title) {
  font-size: 0.875rem;
  line-height: 1.625;
  color: rgb(55 65 81);
}

/* 食物建议样式 */
.food-suggestion {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgb(229 231 235);
}

.food-name {
  font-weight: 500;
  color: rgb(51 51 51);
}

.food-calories {
  font-size: 0.75rem;
  color: rgb(153 153 153);
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

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 0 1.25rem;
    width: 95%;
  }
}
</style>
