<template>
  <div class="exercise">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Bicycle /></el-icon>
            运动管理
          </h1>
          <p class="subtitle">记录您的运动数据，保持健康活力</p>
        </div>
        <el-button
          type="primary"
          size="large"
          @click="showDialog = true"
          class="add-btn"
        >
          <el-icon><Plus /></el-icon>
          添加运动记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card calories-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Lightning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayStats.totalCalories }}</div>
            <div class="stat-label">今日消耗卡路里</div>
            <div class="stat-trend">
              目标消耗: {{ healthGoals.dailyCaloriesBurn || '未设置' }}
              {{ healthGoals.dailyCaloriesBurn ? 'kcal' : '' }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card duration-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayStats.totalDuration }}</div>
            <div class="stat-label">今日运动时长 (分钟)</div>
            <div class="stat-trend">累计锻炼</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card count-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayStats.exerciseCount }}</div>
            <div class="stat-label">今日运动次数</div>
            <div class="stat-trend">坚持锻炼</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card avg-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><DataBoard /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayStats.averageDuration }}</div>
            <div class="stat-label">平均时长 (分钟)</div>
            <div class="stat-trend">运动强度</div>
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
        <el-form-item label="运动类型">
          <el-select
            v-model="filterForm.exerciseType"
            placeholder="选择运动类型"
            @change="handleFilterChange"
            clearable
            style="min-width: 150px"
          >
            <el-option label="跑步" value="跑步" />
            <el-option label="游泳" value="游泳" />
            <el-option label="篮球" value="篮球" />
            <el-option label="足球" value="足球" />
            <el-option label="健身" value="健身" />
            <el-option label="瑜伽" value="瑜伽" />
            <el-option label="骑行" value="骑行" />
            <el-option label="网球" value="网球" />
            <el-option label="羽毛球" value="羽毛球" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter" class="reset-btn">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <h3>
          <el-icon><List /></el-icon> 运动记录
        </h3>
        <div class="table-actions">
          <el-button size="small" @click="loadData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        :data="exerciseList"
        v-loading="loading"
        class="data-table"
        :header-cell-style="{ background: '#f8f9fa', color: '#495057' }"
        stripe
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
        <el-table-column prop="exerciseType" label="运动类型" min-width="130">
          <template #default="{ row }">
            <el-tag
              :type="getExerciseTypeColor(row.exerciseType)"
              effect="light"
            >
              {{ row.exerciseType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="durationMinutes"
          label="时长(分钟)"
          min-width="120"
          sortable
        >
          <template #default="{ row }">
            <span class="duration-text">{{ row.durationMinutes }} 分钟</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="estimatedCaloriesBurned"
          label="消耗热量"
          min-width="120"
          sortable
        >
          <template #default="{ row }">
            <span class="calories-text"
              >{{ row.estimatedCaloriesBurned || '-' }} kcal</span
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
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
                @click="deleteRecord(row.exerciseItemID || row.id)"
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
      :title="editingRecord ? '编辑运动记录' : '添加运动记录'"
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

        <el-form-item label="运动类型" prop="exerciseType">
          <el-select
            v-model="form.exerciseType"
            placeholder="选择运动类型"
            style="width: 100%"
          >
            <el-option label="跑步" value="跑步" />
            <el-option label="游泳" value="游泳" />
            <el-option label="篮球" value="篮球" />
            <el-option label="足球" value="足球" />
            <el-option label="健身" value="健身" />
            <el-option label="瑜伽" value="瑜伽" />
            <el-option label="骑行" value="骑行" />
            <el-option label="网球" value="网球" />
            <el-option label="羽毛球" value="羽毛球" />
          </el-select>
        </el-form-item>

        <el-form-item label="运动时长" prop="durationMinutes">
          <el-input-number
            v-model="form.durationMinutes"
            :min="1"
            :max="600"
            placeholder="分钟数"
            style="width: 100%"
            controls-position="right"
          />
          <span class="unit-text">分钟</span>
        </el-form-item>

        <el-form-item label="消耗热量" prop="estimatedCaloriesBurned">
          <el-input-number
            v-model="form.estimatedCaloriesBurned"
            :min="0"
            :max="2000"
            placeholder="卡路里"
            style="width: 100%"
            controls-position="right"
          />
          <span class="unit-text">大卡</span>
        </el-form-item>

        <!-- 运动强度提示 -->
        <div
          v-if="form.durationMinutes && form.durationMinutes > 0"
          class="intensity-tip"
        >
          <el-card class="tip-card">
            <div class="tip-content">
              <span class="tip-label">运动强度:</span>
              <el-tag :type="getIntensityTagType()" size="large">
                {{ getIntensityLevel() }}
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
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { exerciseApi } from '@/api'
import type { ExerciseRecord, ExerciseRequest } from '@/types'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Bicycle,
  Lightning,
  Timer,
  Trophy,
  DataBoard,
  Filter,
  RefreshLeft,
  List,
  Refresh,
  Check,
} from '@element-plus/icons-vue'

const exerciseList = ref<ExerciseRecord[]>([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const editingRecord = ref<ExerciseRecord | null>(null)
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
  exerciseType: '',
})

const form = reactive({
  recordDate: '',
  exerciseType: '',
  durationMinutes: 0,
  estimatedCaloriesBurned: undefined as number | undefined,
})

const rules = {
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' },
  ],
  exerciseType: [
    { required: true, message: '请输入运动类型', trigger: 'blur' },
  ],
  durationMinutes: [
    { required: true, message: '请输入运动时长', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      max: 600,
      message: '运动时长应在1-600分钟之间',
      trigger: 'blur',
    },
  ],
}

const todayStats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = exerciseList.value.filter(
    (record: ExerciseRecord) => record.recordDate === today,
  )

  const totalCalories = todayRecords.reduce(
    (sum: number, record: ExerciseRecord) =>
      sum + (record.estimatedCaloriesBurned || 0),
    0,
  )
  const totalDuration = todayRecords.reduce(
    (sum: number, record: ExerciseRecord) => sum + record.durationMinutes,
    0,
  )
  const exerciseCount = todayRecords.length
  const averageDuration =
    exerciseCount > 0 ? Math.round(totalDuration / exerciseCount) : 0

  return {
    totalCalories,
    totalDuration,
    exerciseCount,
    averageDuration,
  }
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

// 获取运动类型对应的标签颜色
const getExerciseTypeColor = (exerciseType: string) => {
  const typeMap: { [key: string]: string } = {
    跑步: 'success',
    游泳: 'primary',
    篮球: 'warning',
    足球: 'danger',
    健身: 'info',
    瑜伽: '',
    骑行: 'success',
  }
  return typeMap[exerciseType] || ''
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 加载数据（支持分页和筛选）
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      startDate: filterForm.startDate || undefined,
      endDate: filterForm.endDate || undefined,
      exerciseType: filterForm.exerciseType || undefined,
    }

    const response = await exerciseApi.getList(params)
    if (response.success && response.data) {
      exerciseList.value = response.data.rows.sort(
        (a, b) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
      )
      total.value = response.data.total || response.data.rows.length
    }
  } catch (error: unknown) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadData()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

// 筛选条件变化
const handleFilterChange = () => {
  pagination.currentPage = 1
  loadData()
}

const resetFilter = () => {
  filterForm.startDate = ''
  filterForm.endDate = ''
  filterForm.exerciseType = ''
  pagination.currentPage = 1
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    recordDate: new Date().toISOString().split('T')[0],
    exerciseType: '',
    durationMinutes: 0,
    estimatedCaloriesBurned: undefined,
  })
  editingRecord.value = null
  formRef.value?.clearValidate()
}

const editRecord = (record: ExerciseRecord) => {
  editingRecord.value = record
  console.log('正在编辑的运动记录:', record) // 添加调试日志
  Object.assign(form, {
    recordDate: record.recordDate,
    exerciseType: record.exerciseType,
    durationMinutes: record.durationMinutes,
    estimatedCaloriesBurned:
      record.estimatedCaloriesBurned || record.caloriesBurned, // 支持两种字段名
  })
  showDialog.value = true
}

const submitForm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true

  try {
    const formData: ExerciseRequest = {
      userID: '', // 在API调用时会自动添加
      recordDate: form.recordDate,
      exerciseType: form.exerciseType,
      durationMinutes: form.durationMinutes,
      estimatedCaloriesBurned: form.estimatedCaloriesBurned,
    }

    if (editingRecord.value) {
      // 使用多种可能的ID字段
      const recordId =
        editingRecord.value.exerciseItemID || editingRecord.value.id
      console.log('更新运动记录ID:', recordId) // 添加调试日志
      console.log('更新数据:', formData) // 添加调试日志

      if (!recordId) {
        throw new Error('记录ID不存在，无法更新')
      }

      const response = await exerciseApi.update(recordId, formData)
      if (response.success) {
        ElMessage.success('更新成功')
        showDialog.value = false
        resetForm()
        loadData()
      } else {
        throw new Error(response.message || '更新失败')
      }
    } else {
      const response = await exerciseApi.create(formData)
      if (response.success) {
        ElMessage.success('添加成功')
        showDialog.value = false
        resetForm()
        loadData()
      } else {
        throw new Error(response.message || '添加失败')
      }
    }
  } catch (error: unknown) {
    const apiError = error as import('@/types').ApiError
    console.error('提交失败:', apiError)
    ElMessage.error(
      apiError.message ||
        apiError.response?.data?.message ||
        '操作失败，请重试',
    )
  } finally {
    submitting.value = false
  }
}

const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认删除', {
      type: 'warning',
    })

    const response = await exerciseApi.delete(id)
    if (response.success) {
      ElMessage.success('删除成功')
      // 如果当前页没有数据了，回到上一页
      if (exerciseList.value.length === 1 && pagination.currentPage > 1) {
        pagination.currentPage--
      }
      loadData()
    }
  } catch (error: unknown) {
    const apiError = error as import('@/types').ApiError
    if (error !== 'cancel') {
      ElMessage.error(apiError.response?.data?.message || '删除失败')
    }
  }
}

// 计算运动强度等级
const getIntensityLevel = () => {
  if (!form.durationMinutes || form.durationMinutes <= 0) return ''
  if (form.durationMinutes < 15) {
    return '轻度运动'
  } else if (form.durationMinutes < 45) {
    return '中等强度'
  } else {
    return '高强度'
  }
}

// 获取运动强度标签类型
const getIntensityTagType = () => {
  if (!form.durationMinutes || form.durationMinutes <= 0) return 'info'
  if (form.durationMinutes < 15) {
    return 'success'
  } else if (form.durationMinutes < 45) {
    return 'warning'
  } else {
    return 'danger'
  }
}

// 页面可见性监听器，用于同步健康目标的更新
const handleVisibilityChange = () => {
  if (!document.hidden) {
    loadHealthGoals()
  }
}

onMounted(() => {
  loadData()
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
.exercise {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 15px 35px rgba(255, 154, 158, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.calories-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}

.duration-card {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.count-card {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.avg-card {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.protein-text {
  color: #4ecdc4;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 14px;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(78, 205, 196, 0.2);
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
  content: '🏃‍♂️';
  font-size: 1.3rem;
}

:deep(.form-dialog .el-dialog__headerbtn) {
  top: 20px;
  right: 25px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

:deep(.form-dialog .el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
  border-color: rgba(255, 255, 255, 0.5);
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
}

.dialog-form :deep(.el-form-item__label) {
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
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

/* 运动强度提示样式 */
.intensity-tip {
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
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .filter-form {
    flex-direction: column;
  }

  .filter-input {
    min-width: unset;
    width: 100%;
  }

  .page-title {
    font-size: 2rem;
  }

  .title-icon {
    font-size: 2.5rem;
  }

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
