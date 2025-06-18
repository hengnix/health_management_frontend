<template>
  <div class="diet-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Food /></el-icon>
            饮食管理
          </h1>
          <p class="subtitle">记录和管理您的每日饮食，保持健康营养</p>
        </div>
        <el-button
          type="primary"
          size="large"
          @click="openAddDialog"
          class="add-btn"
        >
          <el-icon><Plus /></el-icon>
          <span> 添加饮食记录 </span>
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card calories-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Dish /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayCalories }}</div>
            <div class="stat-label">今日摄入卡路里（kcal）</div>
            <div class="stat-trend">
              目标摄入: {{ healthGoals.dailyCaloriesIntake || '未设置' }}
              {{ healthGoals.dailyCaloriesIntake ? 'kcal' : '' }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card meals-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Bowl /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayMealsTotal }}</div>
            <div class="stat-label">今日三餐</div>
            <div class="stat-detail">
              早餐 {{ todayBreakfast }} | 午餐 {{ todayLunch }} | 晚餐
              {{ todayDinner }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card snack-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Food /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todaySnack }}</div>
            <div class="stat-label">今日加餐</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <div class="filter-header">
        <h3>
          <el-icon><Filter /></el-icon> 记录筛选
        </h3>
      </div>
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filterForm.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleFilterChange"
            class="filter-input"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="filterForm.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleFilterChange"
            class="filter-input"
          />
        </el-form-item>
        <el-form-item label="用餐类型">
          <el-select
            v-model="filterForm.mealType"
            placeholder="选择用餐类型"
            @change="handleFilterChange"
            clearable
            style="min-width: 150px"
          >
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
            <el-option label="加餐" value="加餐" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter" class="reset-btn">
            <el-icon><RefreshLeft /></el-icon>
            <span>重置</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <h3>
          <el-icon><List /></el-icon> 饮食记录
        </h3>
        <div class="table-actions">
          <el-button size="small" @click="loadData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            <span> 刷新 </span>
          </el-button>
        </div>
      </div>

      <el-table :data="dietList" v-loading="loading" class="data-table" stripe>
        <el-table-column
          prop="recordDate"
          label="记录日期"
          min-width="120"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="info" effect="plain">
              {{ formatDate(row.recordDate) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mealType" label="用餐类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getMealTypeColor(row.mealType)" effect="light">
              {{ getMealTypeName(row.mealType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="foodName" label="食物名称" min-width="150" />
        <el-table-column
          prop="estimatedCalories"
          label="摄入热量（kcal）"
          min-width="100"
          sortable
        >
          <template #default="{ row }">
            <span class="calories-text"
              >{{ row.estimatedCalories || row.calories }} kcal</span
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="editRecord(row)"
                class="action-btn edit-btn"
                plain
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="
                  deleteRecord(row.dietItemID || row.DietItemID || row.id)
                "
                class="action-btn delete-btn"
                plain
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingRecord ? '编辑饮食记录' : '添加饮食记录'"
      width="500px"
      class="form-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="记录日期" prop="recordDate">
          <el-date-picker
            v-model="form.recordDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="用餐类型" prop="mealType">
          <el-select
            v-model="form.mealType"
            placeholder="选择用餐类型"
            style="width: 100%"
          >
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
            <el-option label="加餐" value="加餐" />
          </el-select>
        </el-form-item>

        <el-form-item label="食物名称" prop="foodName">
          <el-input v-model="form.foodName" placeholder="请输入食物名称" />
        </el-form-item>

        <el-form-item label="估计热量" prop="estimatedCalories">
          <el-input-number
            v-model="form.estimatedCalories"
            :min="0"
            :max="2000"
            placeholder="卡路里"
            style="width: 100%"
            controls-position="right"
          />
          <span class="unit-text">kcal</span>
        </el-form-item>

        <!-- 热量等级提示 -->
        <div
          v-if="form.estimatedCalories && form.estimatedCalories > 0"
          class="calorie-tip"
        >
          <el-card class="tip-card">
            <div class="tip-content">
              <span class="tip-label">热量等级:</span>
              <el-tag :type="getCalorieTagType()" size="large">
                {{ getCalorieLevel() }}
              </el-tag>
            </div>
          </el-card>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDialog = false" size="large">取消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            size="large"
          >
            <el-icon><Check /></el-icon>
            <span> 确认 </span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { dietApi } from '@/api'
import type { Diet } from '@/types'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Food,
  Dish,
  Bowl,
  Filter,
  RefreshLeft,
  List,
  Refresh,
  Check,
} from '@element-plus/icons-vue'
import { formatDisplayDate } from '@/utils/dateUtils'

const dietList = ref<Diet[]>([])
const todayDietList = ref<Diet[]>([]) // 专门存储今日数据，不受分页影响
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const editingRecord = ref<Diet | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
})

const filterForm = reactive({
  startDate: '',
  endDate: '',
  mealType: '',
})

const form = reactive({
  recordDate: '',
  mealType: '',
  foodName: '',
  estimatedCalories: 0,
})

// 计算属性 - 今日统计（基于专门的今日数据）
const todayCalories = computed(() => {
  return todayDietList.value.reduce(
    (sum, diet) => sum + (diet.estimatedCalories || diet.calories || 0),
    0,
  )
})

// 今日各餐类型统计
const todayBreakfast = computed(() => {
  return todayDietList.value.filter(
    (diet) => diet.mealType === 'breakfast' || diet.mealType === '早餐',
  ).length
})

const todayLunch = computed(() => {
  return todayDietList.value.filter(
    (diet) => diet.mealType === 'lunch' || diet.mealType === '午餐',
  ).length
})

const todayDinner = computed(() => {
  return todayDietList.value.filter(
    (diet) => diet.mealType === 'dinner' || diet.mealType === '晚餐',
  ).length
})

const todaySnack = computed(() => {
  return todayDietList.value.filter(
    (diet) => diet.mealType === 'snack' || diet.mealType === '加餐',
  ).length
})

// 今日三餐总数
const todayMealsTotal = computed(() => {
  return todayBreakfast.value + todayLunch.value + todayDinner.value
})

// 健康目标数据
const healthGoals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null,
})

// 加载健康目标
const loadHealthGoals = () => {
  const savedGoals = localStorage.getItem('healthGoals')
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals)
    healthGoals.targetWeight = parsed.targetWeight
    healthGoals.dailyCaloriesIntake = parsed.dailyCaloriesIntake
    healthGoals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
  }
}

// 辅助函数
const formatDate = (dateStr: string) => {
  return formatDisplayDate(dateStr)
}

// 获取用餐类型名称
const getMealTypeName = (type: string) => {
  const types: { [key: string]: string } = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
    早餐: '早餐',
    午餐: '午餐',
    晚餐: '晚餐',
    加餐: '加餐',
  }
  return types[type] || type
}

// 获取用餐类型颜色
const getMealTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    breakfast: 'success',
    lunch: 'primary',
    dinner: 'warning',
    snack: 'info',
    早餐: 'success',
    午餐: 'primary',
    晚餐: 'warning',
    加餐: 'info',
  }
  return colors[type] || 'info'
}

// 计算热量等级
const getCalorieLevel = () => {
  if (!form.estimatedCalories || form.estimatedCalories <= 0) return ''
  if (form.estimatedCalories < 200) {
    return '低热量'
  } else if (form.estimatedCalories < 500) {
    return '中热量'
  } else {
    return '高热量'
  }
}

// 获取热量等级标签类型
const getCalorieTagType = () => {
  if (!form.estimatedCalories || form.estimatedCalories <= 0) return 'info'
  if (form.estimatedCalories < 200) {
    return 'success'
  } else if (form.estimatedCalories < 500) {
    return 'warning'
  } else {
    return 'danger'
  }
}

// 工具函数：获取本地日期字符串（YYYY-MM-DD 格式）
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 专门加载今日数据的函数，不受分页影响
const loadTodayData = async () => {
  try {
    // 修复时区问题：使用本地时间而不是 UTC 时间
    const todayLocal = getLocalDateString()

    const params = {
      startDate: todayLocal,
      endDate: todayLocal,
      page: 1,
      pageSize: 1000, // 设置足够大的数量确保获取今日所有数据
    }

    console.log('Loading today data for date (local time):', todayLocal) // 添加调试日志
    const response = await dietApi.getList(params)
    if (response.success && response.data) {
      todayDietList.value = response.data.rows || []
      console.log('Today diet data loaded:', todayDietList.value) // 添加调试日志
    }
  } catch (error: unknown) {
    console.error('加载今日数据失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      startDate: filterForm.startDate || undefined,
      endDate: filterForm.endDate || undefined,
      mealType: filterForm.mealType || undefined,
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    }

    const response = await dietApi.getList(params)
    if (response.success && response.data) {
      // 后端已经排序好了，不需要前端再次排序
      dietList.value = response.data.rows
      total.value = response.data.total || response.data.rows.length
      console.log('Diet data loaded (backend sorted):', dietList.value) // 添加调试日志
    }
  } catch (error: unknown) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  Object.assign(filterForm, {
    startDate: '',
    endDate: '',
    mealType: '',
  })
  pagination.currentPage = 1
  loadData()
  loadTodayData() // 重新加载今日数据
}

const resetForm = () => {
  // 修复时区问题：使用本地时间而不是 UTC 时间
  const todayLocal = getLocalDateString()

  Object.assign(form, {
    recordDate: todayLocal,
    mealType: '',
    foodName: '',
    estimatedCalories: 0,
  })
  editingRecord.value = null
  formRef.value?.clearValidate()
}

// 打开新增对话框
const openAddDialog = () => {
  resetForm()
  showDialog.value = true
}

const editRecord = (record: Diet) => {
  editingRecord.value = record
  console.log('正在编辑的记录:', record) // 添加调试日志
  console.log('记录的所有属性:', Object.keys(record)) // 查看所有可用属性
  console.log('可能的ID字段:', {
    dietItemID: record.dietItemID,
    // DietItemID: record.DietItemID,
    id: record.id,
    // ID: record.ID,
  }) // 检查所有可能的ID字段

  Object.assign(form, {
    recordDate: record.recordDate,
    mealType: record.mealType,
    foodName: record.foodName,
    estimatedCalories: record.estimatedCalories || record.calories, // 支持两种字段名
  })
  showDialog.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true

  try {
    const formData = {
      userID: '', // 在API调用时会自动添加
      recordDate: form.recordDate,
      foodName: form.foodName,
      mealType: form.mealType,
      estimatedCalories: form.estimatedCalories,
    }

    if (editingRecord.value) {
      const response = await dietApi.update(
        editingRecord.value.dietItemID ||
          // editingRecord.value.DietItemID ||
          editingRecord.value.id!,
        formData,
      )
      if (response.success) {
        ElMessage.success('更新成功')
        showDialog.value = false
        resetForm()
        loadData()
        loadTodayData() // 更新今日数据
      }
    } else {
      const response = await dietApi.create(formData)
      if (response.success) {
        ElMessage.success('添加成功')
        showDialog.value = false
        resetForm()
        // 添加新记录后，跳转到第一页以查看最新记录
        pagination.currentPage = 1
        loadData()
        loadTodayData() // 更新今日数据
      }
    }
  } catch (error: unknown) {
    const apiError = error as import('@/types').ApiError
    ElMessage.error(apiError.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认删除', {
      type: 'warning',
    })

    const response = await dietApi.delete(id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadData()
      loadTodayData() // 更新今日数据
    }
  } catch (error: unknown) {
    const apiError = error as import('@/types').ApiError
    if (error !== 'cancel') {
      ElMessage.error(apiError.response?.data?.message || '删除失败')
    }
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

const handleFilterChange = () => {
  pagination.currentPage = 1
  loadData()
  // 如果筛选条件会影响今日数据显示，也需要重新加载今日数据
  // 但通常筛选不应该影响今日统计，所以这里可以不调用 loadTodayData()
}

const rules = {
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' },
  ],
  mealType: [{ required: true, message: '请选择用餐类型', trigger: 'change' }],
  foodName: [{ required: true, message: '请输入食物名称', trigger: 'blur' }],
  estimatedCalories: [
    { required: true, message: '请输入估计热量', trigger: 'blur' },
    {
      type: 'number',
      min: 0,
      max: 2000,
      message: '热量范围应在 0 到 2000 大卡之间',
      trigger: 'blur',
    },
  ],
}

// 页面可见性监听器，用于同步健康目标的更新
const handleVisibilityChange = () => {
  if (!document.hidden) {
    loadHealthGoals()
    loadTodayData() // 当页面重新可见时，刷新今日数据
  }
}

onMounted(() => {
  loadData()
  loadTodayData() // 初始加载今日数据
  resetForm()
  loadHealthGoals()

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.diet-management {
  padding: 20px;
  background: transparent;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 15px 35px rgba(255, 154, 158, 0.3);
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

.add-btn {
  background: linear-gradient(45deg, #fa709a 0%, #fee140 100%);
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(250, 112, 154, 0.4);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(250, 112, 154, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  border: none;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.2),
    0 15px 35px rgba(0, 0, 0, 0.1);
}

.calories-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}

.meals-card {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.snack-card {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 25px;
  color: white;
}

.stat-icon {
  font-size: 3rem;
  margin-right: 20px;
  opacity: 0.9;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 0.9rem;
  opacity: 0.8;
}

.stat-detail {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 5px;
}

.filter-card,
.table-card {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 20px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.filter-header,
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.filter-header h3,
.table-header h3 {
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-input {
  min-width: 200px;
}

.reset-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 20px;
}

/* 表格美化样式 */
.data-table {
  margin-bottom: 25px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  background: white;
}

.data-table :deep(.el-table) {
  border-radius: 20px;
  overflow: hidden;
}

.data-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.data-table :deep(.el-table__header th) {
  background: transparent !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  border: none !important;
  padding: 18px 12px !important;
  text-align: center !important;
}

.data-table :deep(.el-table__header th .cell) {
  color: #000000 !important;
  font-weight: 600 !important;
}

.data-table :deep(.el-table__body tr) {
  transition: all 0.3s ease;
  border: none;
}

.data-table :deep(.el-table__body tr:hover) {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  ) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.data-table :deep(.el-table__body tr td) {
  border: none;
  padding: 16px 12px;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.data-table :deep(.el-table__body tr:last-child td) {
  border-bottom: none;
}

.data-table :deep(.el-table__body tr.el-table__row--striped td) {
  background: rgba(248, 249, 250, 0.5);
}

/* 表格内容美化 */
.data-table .el-tag {
  border-radius: 15px;
  font-weight: 500;
  padding: 8px 16px;
  border: none;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-table .el-button {
  border-radius: 15px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.data-table .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.data-table .el-button.is-plain {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.data-table .el-button--primary.is-plain {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.data-table .el-button--primary.is-plain:hover {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.data-table .el-button--danger.is-plain {
  background: rgba(245, 101, 101, 0.1);
  border-color: rgba(245, 101, 101, 0.3);
  color: #f56565;
}

.data-table .el-button--danger.is-plain:hover {
  background: linear-gradient(45deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border-color: transparent;
}

/* 数值样式美化 */
.calories-text {
  color: #ff6b6b;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 14px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
}

.carbs-text {
  color: #ffa500;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 14px;
  background: rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.2);
}

.fat-text {
  color: #a8edea;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 14px;
  background: rgba(168, 237, 234, 0.15);
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(168, 237, 234, 0.2);
}

.duration-text {
  color: #667eea;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 14px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.text-gray {
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
  background: rgba(142, 142, 147, 0.08);
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
}

/* 分页样式美化 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 30px 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.03) 0%,
    rgba(118, 75, 162, 0.03) 100%
  );
  border-radius: 0 0 20px 20px;
}

.pagination {
  background: white;
  border-radius: 25px;
  padding: 15px 25px;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.pagination :deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination :deep(.el-pagination .btn-prev),
.pagination :deep(.el-pagination .btn-next) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 12px;
  width: 36px;
  height: 36px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.pagination :deep(.el-pagination .btn-prev:hover),
.pagination :deep(.el-pagination .btn-next:hover) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.pagination :deep(.el-pagination .el-pager li) {
  background: transparent;
  border: 2px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 12px;
  margin: 0 2px;
  min-width: 36px;
  height: 36px;
  line-height: 32px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pagination :deep(.el-pagination .el-pager li:hover) {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  border-color: #667eea;
}

.pagination :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  background: white;
  box-shadow: none;
  transition: all 0.3s ease;
}

.pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.pagination :deep(.el-pagination__jump .el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  background: white;
  box-shadow: none;
  width: 60px;
  transition: all 0.3s ease;
}

.pagination :deep(.el-pagination__jump .el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

/* 对话框美化样式 */
:deep(.form-dialog) {
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

:deep(.form-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px 30px;
  margin: 0;
  border-bottom: none;
  position: relative;
  border-radius: 25px 25px 0 0;
}

:deep(.form-dialog .el-dialog__header::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.3) 100%
  );
}

:deep(.form-dialog .el-dialog__title) {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.form-dialog .el-dialog__title::before) {
  content: '🍽️';
  font-size: 1.3rem;
}

:deep(.form-dialog .el-dialog__headerbtn) {
  top: 20px;
  right: 25px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.form-dialog .el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: none;
}

:deep(.form-dialog .el-dialog__close) {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

:deep(.form-dialog .el-dialog__body) {
  padding: 30px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.95) 100%
  );
  backdrop-filter: blur(20px);
}

.dialog-form {
  margin: 0;
}

.dialog-form :deep(.el-form-item) {
  margin-bottom: 24px;
  position: relative;
  display: flex;
  align-items: center;
}

.dialog-form :deep(.el-form-item__label) {
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  height: 44px;
  min-height: 44px;
}

.dialog-form :deep(.el-form-item__content) {
  flex: 1;
  display: flex;
  align-items: center;
}

.dialog-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  min-height: 44px;
}

.dialog-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.dialog-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dialog-form :deep(.el-input__inner) {
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
}

.dialog-form :deep(.el-input-number) {
  width: 100%;
}

.dialog-form :deep(.el-input-number .el-input__wrapper) {
  position: relative;
  padding-right: 70px; /* 为单位文本留出空间 */
}

.dialog-form :deep(.el-input-number__increase),
.dialog-form :deep(.el-input-number__decrease) {
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  width: 32px;
  height: 20px;
  right: 8px;
  transition: all 0.3s ease;
}

.dialog-form :deep(.el-input-number__increase) {
  top: 6px;
}

.dialog-form :deep(.el-input-number__decrease) {
  bottom: 6px;
}

.dialog-form :deep(.el-input-number__increase:hover),
.dialog-form :deep(.el-input-number__decrease:hover) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: scale(1.1);
}

.dialog-form :deep(.el-select .el-select__wrapper) {
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  min-height: 44px;
}

.dialog-form :deep(.el-select .el-select__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.dialog-form :deep(.el-select .el-select__wrapper.is-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dialog-form :deep(.el-date-picker) {
  width: 100%;
}

.dialog-form :deep(.el-date-picker .el-input__wrapper) {
  width: 100%;
}

.unit-text {
  position: absolute;
  right: 55px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  font-size: 12px;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  z-index: 10;
}

.calories-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.calories-input-wrapper .unit-text {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #999;
  pointer-events: none;
  z-index: 10;
  background: white;
  padding: 0 4px;
}

/* 对话框底部按钮美化 */
:deep(.form-dialog .el-dialog__footer) {
  padding: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px;
  background: transparent;
}

.dialog-footer .el-button {
  border-radius: 20px;
  padding: 12px 30px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 2px solid transparent;
  min-width: 100px;
  position: relative;
  overflow: hidden;
}

.dialog-footer .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.dialog-footer .el-button:hover::before {
  left: 100%;
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.dialog-footer .el-button:not(.el-button--primary) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.2);
  color: #667eea;
  backdrop-filter: blur(10px);
}

.dialog-footer .el-button:not(.el-button--primary):hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  color: #667eea;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.dialog-footer .el-button--primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.dialog-footer .el-button--primary.is-loading {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.7) 0%,
    rgba(118, 75, 162, 0.7) 100%
  );
}

/* 操作按钮组美化 */
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  padding: 4px 8px;
}

.action-buttons .el-button {
  border-radius: 18px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 2px solid transparent;
  min-width: 80px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.action-buttons .el-button:hover::before {
  left: 100%;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.action-buttons .el-button.is-plain {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
}

.action-buttons .el-button--primary.is-plain {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border-color: rgba(102, 126, 234, 0.4);
  color: #667eea;
}

.action-buttons .el-button--primary.is-plain:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.action-buttons .el-button--danger.is-plain {
  background: linear-gradient(
    135deg,
    rgba(245, 101, 101, 0.1) 0%,
    rgba(229, 62, 62, 0.1) 100%
  );
  border-color: rgba(245, 101, 101, 0.4);
  color: #f56565;
}

.action-buttons .el-button--danger.is-plain:hover {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(245, 101, 101, 0.4);
}

/* 确保按钮内图标和文字对齐 */
.action-buttons .el-button .el-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.action-buttons .el-button span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 热量等级提示样式 */
.calorie-tip {
  margin-top: 15px;
}

.tip-card {
  border: none;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.tip-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px;
}

.tip-label {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.tip-content .el-tag {
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式优化 */
@media (max-width: 768px) {
  :deep(.form-dialog) {
    width: 95% !important;
    margin: 20px auto;
  }

  :deep(.form-dialog .el-dialog__body) {
    padding: 20px;
  }

  .dialog-footer {
    padding: 20px;
    flex-direction: column;
  }

  .dialog-footer .el-button {
    width: 100%;
    margin: 0;
  }
}
</style>
