<template>
  <div class="body-data">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><DataAnalysis /></el-icon>
            身体数据
          </h1>
          <p class="subtitle">记录并追踪您的身体健康指标</p>
        </div>
        <el-button
          type="primary"
          size="large"
          @click="openAddDialog"
          class="add-btn"
        >
          <el-icon><Plus /></el-icon>
          <span> 添加身体数据 </span>
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card weight-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Platform /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ latestWeight || '--' }}</div>
            <div class="stat-label">当前体重（kg）</div>
            <div class="stat-trend">
              <div v-if="latestBodyData?.recordDate" class="latest-date">
                记录日期: {{ formatDate(latestBodyData.recordDate) }}
              </div>
              <div>
                目标体重: {{ healthGoals.targetWeight || '未设置' }}
                {{ healthGoals.targetWeight ? 'kg' : '' }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card height-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ latestHeight || '--' }}</div>
            <div class="stat-label">当前身高（cm）</div>
            <div v-if="latestBodyData?.recordDate" class="stat-trend">
              记录日期: {{ formatDate(latestBodyData.recordDate) }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card bmi-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ latestBMI || '--' }}</div>
            <div class="stat-label">BMI 指数</div>
            <div class="bmi-status" :class="bmiStatusClass">
              {{ bmiStatus }}
            </div>
            <div v-if="latestBodyData?.recordDate" class="stat-trend">
              记录日期: {{ formatDate(latestBodyData.recordDate) }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <div class="filter-header">
        <h3>
          <el-icon><Filter /></el-icon> 数据筛选
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
        <el-form-item>
          <el-button @click="resetFilter" class="reset-btn">
            <el-icon><RefreshLeft /></el-icon>
            <span> 重置 </span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <h3>
          <el-icon><List /></el-icon> 记录列表
        </h3>
        <div class="table-actions">
          <el-button size="small" @click="loadData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            <span> 刷新 </span>
          </el-button>
        </div>
      </div>

      <el-table
        :data="bodyDataList"
        v-loading="loading"
        class="data-table"
        stripe
        :default-sort="{ prop: 'recordDate', order: 'descending' }"
      >
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
        <el-table-column
          prop="heightCM"
          label="身高（cm）"
          min-width="100"
          sortable
        />
        <el-table-column
          prop="weightKG"
          label="体重（kg）"
          min-width="100"
          sortable
        />
        <el-table-column prop="bmi" label="BMI 指数" min-width="120" sortable>
          <template #default="{ row }">
            <el-tag
              :type="getBMITagType(row.heightCM, row.weightKG)"
              effect="light"
            >
              {{
                row.bmi
                  ? row.bmi.toFixed(2)
                  : calculateBMI(row.heightCM, row.weightKG)
              }}
            </el-tag>
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
                @click="deleteRecord(row.bodyMetricID || row.id)"
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
      :title="editingRecord ? '编辑身体数据' : '添加身体数据'"
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
        <el-form-item label="身高" prop="heightCM">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.heightCM"
              :min="100"
              :max="250"
              :precision="1"
              :placeholder="
                latestHeight ? `当前: ${latestHeight}cm` : '请输入身高'
              "
              style="width: 100%"
              controls-position="right"
            />
            <span class="unit-text-number">cm</span>
          </div>
        </el-form-item>
        <el-form-item label="体重" prop="weightKG">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.weightKG"
              :min="30"
              :max="300"
              :precision="1"
              :placeholder="
                latestWeight ? `当前: ${latestWeight}kg` : '请输入体重'
              "
              style="width: 100%"
              controls-position="right"
            />
            <span class="unit-text-number">kg</span>
          </div>
        </el-form-item>
        <div v-if="form.heightCM > 0 && form.weightKG > 0" class="bmi-preview">
          <el-card class="bmi-card-preview">
            <div class="bmi-preview-content">
              <span class="bmi-label">预览 BMI:</span>
              <el-tag
                :type="getBMITagType(form.heightCM, form.weightKG)"
                size="large"
              >
                {{ calculateBMI(form.heightCM, form.weightKG) }}
              </el-tag>
              <span class="bmi-status-preview">{{
                getBMIStatus(form.heightCM, form.weightKG)
              }}</span>
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
import { bodyDataApi } from '@/api'
import type {
  BodyData,
  BodyDataRequest,
  ApiBodyDataRow,
  ApiError,
} from '@/types'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  TrendCharts,
  Platform,
  DataAnalysis,
  Filter,
  RefreshLeft,
  List,
  Refresh,
  Check,
} from '@element-plus/icons-vue'
import { formatDisplayDate } from '@/utils/dateUtils'

const bodyDataList = ref<BodyData[]>([])
const latestBodyData = ref<BodyData | null>(null) // 专门存储最新的身体数据
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const editingRecord = ref<BodyData | null>(null)
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
})

const form = reactive({
  recordDate: '',
  heightCM: 170,
  weightKG: 65,
})

// 计算属性（基于最新数据）
const latestWeight = computed(() => {
  return latestBodyData.value?.weightKG || null
})

const latestHeight = computed(() => {
  return latestBodyData.value?.heightCM || null
})

const latestBMI = computed(() => {
  if (latestHeight.value && latestWeight.value) {
    return calculateBMI(latestHeight.value, latestWeight.value)
  }
  return null
})

const bmiStatus = computed(() => {
  if (latestHeight.value && latestWeight.value) {
    return getBMIStatus(latestHeight.value, latestWeight.value)
  }
  return '--'
})

const bmiStatusClass = computed(() => {
  const bmi = parseFloat(latestBMI.value || '0')
  if (bmi < 18.5) return 'underweight'
  if (bmi < 24) return 'normal'
  if (bmi < 28) return 'overweight'
  return 'obese'
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

const formatDate = (dateStr: string) => {
  return formatDisplayDate(dateStr)
}

const calculateBMI = (height: number, weight: number) => {
  if (!height || !weight) return '-'
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  return bmi.toFixed(2)
}

// 添加安全的日期格式化函数
const formatDateForAPI = (dateStr: string) => {
  if (!dateStr) return undefined
  // 直接使用日期字符串，避免时区转换问题
  return dateStr
}

// 从当前数据列表中更新最新身体数据（当前页是第一页且数据已排序时）
const updateLatestDataFromList = () => {
  if (bodyDataList.value.length > 0 && pagination.currentPage === 1) {
    // 第一页的第一条数据就是最新的（后端已排序）
    latestBodyData.value = bodyDataList.value[0]
    console.log(
      'Latest body data updated from list (第一页第一条):',
      latestBodyData.value,
    )
  }
}

// 专门加载最新身体数据的函数
const loadLatestData = async () => {
  try {
    // 获取所有数据的第一页，但设置较大的 pageSize，并且不传筛选条件
    // 这样可以确保获取到全局最新的数据
    const response = await bodyDataApi.getList({
      page: 1,
      size: 50, // 获取足够多的数据确保包含最新记录
      // 不传 startDate 和 endDate，获取所有数据
    })

    if (response.success && response.data && response.data.rows.length > 0) {
      // 从所有数据中找到日期最新的记录
      const allData = response.data.rows
        .map(
          (item: ApiBodyDataRow): BodyData => ({
            bodyMetricID: item.BodyMetricID || item.bodyMetricID || 0,
            userID: item.UserID || item.userID || '',
            heightCM: item.HeightCM || item.heightCM || 0,
            weightKG: item.WeightKG || item.weightKG || 0,
            recordDate: item.RecordDate || item.recordDate || '',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }),
        )
        .filter((item) => item.recordDate)

      if (allData.length > 0) {
        // 按日期排序找到最新的
        const sortedData = allData.sort(
          (a, b) =>
            new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
        )
        latestBodyData.value = sortedData[0]
        console.log('Latest body data loaded (全局最新):', latestBodyData.value)
      } else {
        latestBodyData.value = null
      }
    } else {
      latestBodyData.value = null
    }
  } catch (error) {
    console.error('Failed to load latest data:', error)
    latestBodyData.value = null
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      startDate: formatDateForAPI(filterForm.startDate),
      endDate: formatDateForAPI(filterForm.endDate),
      page: pagination.currentPage,
      size: pagination.pageSize,
    }

    console.log('发送的参数:', params) // 添加调试日志

    const response = await bodyDataApi.getList(params)
    if (response.success && response.data) {
      // 处理字段名不匹配问题：将 API 返回的大写字段名转换为小写
      const normalizedData = response.data.rows
        .map(
          (item: ApiBodyDataRow): BodyData => ({
            bodyMetricID: item.BodyMetricID || item.bodyMetricID || 0,
            userID: item.UserID || item.userID || '',
            heightCM: item.HeightCM || item.heightCM || 0,
            weightKG: item.WeightKG || item.weightKG || 0,
            recordDate: item.RecordDate || item.recordDate || '',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }),
        )
        .filter((item) => item.recordDate) // 只过滤掉没有日期的记录

      bodyDataList.value = normalizedData
      total.value = response.data.total || response.data.rows.length

      // 只在第一页时更新最新数据（因为后端已按日期降序排序）
      updateLatestDataFromList()

      console.log('Loaded body data (后端已排序):', bodyDataList.value)
    }
  } catch (error) {
    console.error('Failed to load data:', error) // 添加错误日志
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.startDate = ''
  filterForm.endDate = ''

  // 重置到第一页
  pagination.currentPage = 1

  loadData()
  loadLatestData() // 重置筛选后需要重新加载最新数据
}

// 工具函数：获取本地日期字符串（YYYY-MM-DD 格式）
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const resetForm = () => {
  Object.assign(form, {
    recordDate: getLocalDateString(),
    heightCM: 0,
    weightKG: 0,
  })
  editingRecord.value = null
  formRef.value?.clearValidate()
}

// 打开新增对话框
const openAddDialog = () => {
  // 重置表单
  resetForm()

  // 使用统计卡片的最新数据作为默认值
  if (latestHeight.value && latestWeight.value) {
    form.heightCM = latestHeight.value
    form.weightKG = latestWeight.value
    console.log('使用统计卡片数据作为默认值:', {
      height: latestHeight.value,
      weight: latestWeight.value,
    })
  } else {
    // 如果没有最新数据，使用系统默认值
    form.heightCM = 170
    form.weightKG = 65
    console.log('使用系统默认值')
  }

  showDialog.value = true
}

const editRecord = (record: BodyData) => {
  editingRecord.value = record
  Object.assign(form, {
    recordDate: record.recordDate,
    heightCM: record.heightCM,
    weightKG: record.weightKG,
  })
  showDialog.value = true
}

const submitForm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true

  try {
    const formData: BodyDataRequest = {
      userID: '', // 在API调用时会自动添加
      recordDate: form.recordDate,
      heightCM: form.heightCM,
      weightKG: form.weightKG,
    }

    if (editingRecord.value) {
      const response = await bodyDataApi.update(
        editingRecord.value.bodyMetricID || editingRecord.value.id!,
        formData,
      )
      if (response.success) {
        ElMessage.success('更新成功')
        showDialog.value = false
        resetForm()
        loadData()
        await loadLatestData() // 更新后需要重新获取最新数据
      }
    } else {
      const response = await bodyDataApi.create(formData)
      if (response.success) {
        ElMessage.success('添加成功')
        showDialog.value = false
        resetForm()

        // 添加新记录后跳转到第一页以查看最新记录
        pagination.currentPage = 1

        // 重新加载数据
        await loadData()
        await loadLatestData() // 添加新记录后需要重新获取最新数据
      }
    }
  } catch (error: unknown) {
    const apiError = error as ApiError
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

    const response = await bodyDataApi.delete(id)
    if (response.success) {
      ElMessage.success('删除成功')

      // 检查当前页是否还有数据，如果没有则回到上一页
      if (bodyDataList.value.length === 1 && pagination.currentPage > 1) {
        pagination.currentPage = pagination.currentPage - 1
      }
      await loadData()
      await loadLatestData() // 删除后需要重新获取最新数据
    }
  } catch (error: unknown) {
    const apiError = error as ApiError
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
  // 筛选条件变化时回到第一页
  pagination.currentPage = 1
  loadData()
}

const rules = {
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' },
  ],
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
}

// BMI相关辅助函数
const getBMITagType = (height: number, weight: number) => {
  const bmi = parseFloat(calculateBMI(height, weight))
  if (bmi < 18.5) return 'info'
  if (bmi < 24) return 'success'
  if (bmi < 28) return 'warning'
  return 'danger'
}

const getBMIStatus = (height: number, weight: number) => {
  const bmi = parseFloat(calculateBMI(height, weight))
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏胖'
  return '肥胖'
}

// 页面可见性监听器，用于同步健康目标的更新
const handleVisibilityChange = () => {
  if (!document.hidden) {
    loadHealthGoals()
    loadData() // 当页面重新可见时，刷新数据
    loadLatestData() // 同时刷新最新数据
  }
}

onMounted(() => {
  loadData()
  loadLatestData() // 初始加载最新数据
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
.body-data {
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

.weight-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}

.height-card {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.bmi-card {
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

.bmi-status {
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  margin-top: 5px;
}

.bmi-status.normal {
  background: rgba(76, 175, 80, 0.3);
}

.bmi-status.underweight {
  background: rgba(33, 150, 243, 0.3);
}

.bmi-status.overweight {
  background: rgba(255, 152, 0, 0.3);
}

.bmi-status.obese {
  background: rgba(244, 67, 54, 0.3);
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
  padding: 20px 25px;
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
  padding: 0 25px 25px;
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

/* 表格美化样式 - 强化表头样式 */
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

.bmi-preview {
  margin-top: 20px;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bmi-card-preview {
  border: none;
  border-radius: 15px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
  overflow: hidden;
  position: relative;
}

.bmi-card-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.bmi-preview-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  gap: 15px;
}

.bmi-label {
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
}

.bmi-status-preview {
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.2);
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
  content: '⚖️';
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
  padding-right: 50px;
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

/* 数字输入框单位样式 */
.input-with-unit {
  position: relative;
}

.input-with-unit :deep(.el-input-number .el-input__wrapper) {
  padding-right: 250px !important; /* 为单位文本和控制按钮留出空间，覆盖默认样式 */
}

.unit-text-number {
  position: absolute;
  right: 50px; /* 调整位置以匹配新的 padding 值 */
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  font-size: 12px;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  z-index: 10;
  pointer-events: none; /* 防止单位文本阻挡输入框交互 */
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

/* 操作按钮美化样式 */
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

/* 强化表格内容区分 */
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

  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 100%;
    padding: 8px 12px !important;
  }
}
</style>
