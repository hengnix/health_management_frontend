<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><TrendCharts /></el-icon>
            健康数据概览
          </h1>
          <p class="subtitle">全面了解您的健康状况，追踪每日进展</p>
        </div>
        <el-dropdown @command="handleQuickRecord" class="quick-record-dropdown">
          <el-button type="primary" class="add-btn">
            <el-icon><Plus /></el-icon>
            <span>快速记录</span>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="body">
                <el-icon><Platform /></el-icon>
                <span>记录体重</span>
              </el-dropdown-item>
              <el-dropdown-item command="diet">
                <el-icon><Bowl /></el-icon>
                <span>记录饮食</span>
              </el-dropdown-item>
              <el-dropdown-item command="exercise">
                <el-icon><Bicycle /></el-icon>
                <span>记录运动</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card weight-card-enhanced">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ statistics.averageWeight.toFixed(1) }}
            </div>
            <div class="stat-label">当前体重 (kg)</div>
            <div class="stat-trend">
              目标体重: {{ healthGoals.targetWeight || '未设置' }}
              {{ healthGoals.targetWeight ? 'kg' : '' }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card calories-in-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Food /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalCaloriesConsumed }}</div>
            <div class="stat-label">今日摄入卡路里</div>
            <div class="stat-trend">
              目标摄入: {{ healthGoals.dailyCaloriesIntake || '未设置' }}
              {{ healthGoals.dailyCaloriesIntake ? 'kcal' : '' }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card calories-out-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Bicycle /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalCaloriesBurned }}</div>
            <div class="stat-label">今日消耗卡路里</div>
            <div class="stat-trend">
              目标消耗: {{ healthGoals.dailyCaloriesBurn || '未设置' }}
              {{ healthGoals.dailyCaloriesBurn ? 'kcal' : '' }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据趋势图表 -->
    <div class="charts-grid">
      <!-- 卡路里趋势图 -->
      <el-card class="chart-card calories-chart-card">
        <div class="chart-header">
          <h3>
            <el-icon><TrendCharts /></el-icon> 卡路里趋势
          </h3>
          <div class="calories-average-info">
            <div class="average-item">
              <span class="label">平均摄入:</span>
              <span class="value green"
                >{{ averageCaloriesIntake.toFixed(0) }} kcal</span
              >
            </div>
            <div class="average-item">
              <span class="label">平均消耗:</span>
              <span class="value red"
                >{{ averageCaloriesBurn.toFixed(0) }} kcal</span
              >
            </div>
            <div class="average-item">
              <span class="label">平均净摄入:</span>
              <span class="value yellow"
                >{{ averageNetCalories.toFixed(0) }} kcal</span
              >
            </div>
          </div>
          <div class="chart-controls">
            <el-button-group>
              <el-button
                :type="caloriesTimePeriod === '7d' ? 'primary' : ''"
                size="small"
                @click="caloriesTimePeriod = '7d'"
              >
                7 天
              </el-button>
              <el-button
                :type="caloriesTimePeriod === '30d' ? 'primary' : ''"
                size="small"
                @click="caloriesTimePeriod = '30d'"
              >
                30 天
              </el-button>
              <el-button
                :type="caloriesTimePeriod === '90d' ? 'primary' : ''"
                size="small"
                @click="caloriesTimePeriod = '90d'"
              >
                90 天
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="chart-container" ref="caloriesChartRef">
          <!-- ECharts 图表容器 -->
        </div>
      </el-card>

      <!-- 体重趋势图 -->
      <el-card class="chart-card weight-chart-card">
        <div class="chart-header">
          <h3>
            <el-icon><DataAnalysis /></el-icon> 体重趋势
          </h3>
          <div class="average-weight-info">
            平均体重:
            <span class="average-weight-value"
              >{{ averageWeightForPeriod.toFixed(1) }} kg</span
            >
          </div>
          <div class="chart-controls">
            <el-button-group>
              <el-button
                :type="weightTimePeriod === '7d' ? 'primary' : ''"
                size="small"
                @click="weightTimePeriod = '7d'"
              >
                7 天
              </el-button>
              <el-button
                :type="weightTimePeriod === '30d' ? 'primary' : ''"
                size="small"
                @click="weightTimePeriod = '30d'"
              >
                30 天
              </el-button>
              <el-button
                :type="weightTimePeriod === '90d' ? 'primary' : ''"
                size="small"
                @click="weightTimePeriod = '90d'"
              >
                90 天
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="chart-container" ref="weightChartRef">
          <!-- ECharts 图表容器 -->
        </div>
      </el-card>
    </div>

    <!-- 快速记录对话框 -->
    <QuickBodyDataDialog v-model="showBodyDataDialog" @success="refreshData" />
    <QuickDietDialog v-model="showDietDialog" @success="refreshData" />
    <QuickExerciseDialog v-model="showExerciseDialog" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  computed,
} from 'vue'
import * as echarts from 'echarts'
import QuickBodyDataDialog from '@/components/QuickBodyDataDialog.vue'
import QuickDietDialog from '@/components/QuickDietDialog.vue'
import QuickExerciseDialog from '@/components/QuickExerciseDialog.vue'
import { bodyDataApi, dietApi, exerciseApi } from '@/api'
import {
  TrendCharts,
  Food,
  Bicycle,
  DataAnalysis,
  Platform,
  Bowl,
  Plus,
  ArrowDown,
} from '@element-plus/icons-vue'

const showBodyDataDialog = ref(false)
const showDietDialog = ref(false)
const showExerciseDialog = ref(false)

// 图表相关
const caloriesChartRef = ref<HTMLDivElement>()
const weightChartRef = ref<HTMLDivElement>()
const caloriesTimePeriod = ref<string>('7d')
const weightTimePeriod = ref<string>('7d')

// 图表实例
let weightChart: echarts.ECharts | null = null
let caloriesChart: echarts.ECharts | null = null

// 体重数据
const weightData = ref<{ date: string; weight: number }[]>([])

// 卡路里数据
const caloriesData = ref<
  { date: string; intake: number; burn: number; net: number }[]
>([])

// 计算当前时间段的平均体重
const averageWeightForPeriod = computed(() => {
  if (weightData.value.length === 0) return 0
  const totalWeight = weightData.value.reduce(
    (sum, item) => sum + item.weight,
    0,
  )
  return totalWeight / weightData.value.length
})

// 计算当前时间段的平均卡路里
const averageCaloriesIntake = computed(() => {
  if (caloriesData.value.length === 0) return 0
  const totalIntake = caloriesData.value.reduce(
    (sum, item) => sum + item.intake,
    0,
  )
  return totalIntake / caloriesData.value.length
})

const averageCaloriesBurn = computed(() => {
  if (caloriesData.value.length === 0) return 0
  const totalBurn = caloriesData.value.reduce((sum, item) => sum + item.burn, 0)
  return totalBurn / caloriesData.value.length
})

const averageNetCalories = computed(() => {
  if (caloriesData.value.length === 0) return 0
  const totalNet = caloriesData.value.reduce((sum, item) => sum + item.net, 0)
  return totalNet / caloriesData.value.length
})

// 初始化体重图表
const initWeightChart = async () => {
  if (!weightChartRef.value) return

  // 销毁现有图表
  if (weightChart) {
    weightChart.dispose()
  }

  // 创建新图表
  weightChart = echarts.init(weightChartRef.value)

  // 检查是否有数据
  const hasData = weightData.value.length > 0

  // 图表配置
  const option = {
    title: {
      show: !hasData,
      text: '暂无体重数据',
      textStyle: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'normal',
      },
      left: 'center',
      top: 'middle',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#667eea',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0]
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.axisValueLabel}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${data.color}; border-radius: 50%;"></span>
              <span>体重: ${data.value} kg</span>
            </div>
          </div>
        `
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true,
      show: hasData,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: weightData.value.map((item) => item.date),
      show: hasData,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      show: hasData,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        formatter: '{value} kg',
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed',
        },
      },
    },
    series: hasData
      ? [
          {
            name: '体重',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' },
              ]),
            },
            itemStyle: {
              color: '#667eea',
              borderColor: '#fff',
              borderWidth: 2,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' },
              ]),
            },
            data: weightData.value.map((item) => item.weight),
            emphasis: {
              focus: 'series',
              itemStyle: {
                borderWidth: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(102, 126, 234, 0.5)',
              },
            },
          },
        ]
      : [],
  }

  weightChart.setOption(option)

  // 响应式调整
  const handleResize = () => {
    weightChart?.resize()
  }
  window.addEventListener('resize', handleResize)
}

// 初始化卡路里图表
const initCaloriesChart = async () => {
  if (!caloriesChartRef.value) return

  // 销毁现有图表
  if (caloriesChart) {
    caloriesChart.dispose()
  }

  // 创建新图表
  caloriesChart = echarts.init(caloriesChartRef.value)

  // 检查是否有数据
  const hasData =
    caloriesData.value.length > 0 &&
    caloriesData.value.some((item) => item.intake > 0 || item.burn > 0)

  // 图表配置
  const option = {
    title: {
      show: !hasData,
      text: '暂无卡路里数据',
      textStyle: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'normal',
      },
      left: 'center',
      top: 'middle',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#667eea',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const date = params[0].axisValueLabel
        let content = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 8px;">${date}</div>`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params.forEach((param: any) => {
          const color = param.color
          const seriesName = param.seriesName
          const value = param.value
          content += `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%;"></span>
              <span>${seriesName}: ${value} kcal</span>
            </div>
          `
        })

        content += '</div>'
        return content
      },
    },
    legend: {
      data: hasData ? ['摄入', '消耗', '净摄入'] : [],
      show: hasData,
      top: '5%',
      textStyle: {
        color: '#64748b',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
      show: hasData,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: caloriesData.value.map((item) => item.date),
      show: hasData,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      show: hasData,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        formatter: '{value} kcal',
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed',
        },
      },
    },
    series: hasData
      ? [
          {
            name: '摄入',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#10b981',
            },
            itemStyle: {
              color: '#10b981',
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: caloriesData.value.map((item) => item.intake),
          },
          {
            name: '消耗',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#dc2626',
            },
            itemStyle: {
              color: '#dc2626',
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: caloriesData.value.map((item) => item.burn),
          },
          {
            name: '净摄入',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#ea580c',
            },
            itemStyle: {
              color: '#ea580c',
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: caloriesData.value.map((item) => item.net),
          },
        ]
      : [],
  }

  caloriesChart.setOption(option)

  // 响应式调整
  const handleCaloriesResize = () => {
    caloriesChart?.resize()
  }
  window.addEventListener('resize', handleCaloriesResize)
}

// 获取体重数据
const loadWeightData = async () => {
  try {
    const days = parseInt(weightTimePeriod.value.replace('d', ''))
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days + 1)

    const response = await bodyDataApi.getList({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    })

    if (response.success && response.data) {
      // 处理数据，按日期分组取最新记录
      const dataMap = new Map<string, number>()
      const timeMap = new Map<string, string>()
      response.data.rows.forEach(
        (item: { recordDate: string; weightKG: number }) => {
          const date = new Date(item.recordDate).toISOString().split('T')[0]
          const existingTime = timeMap.get(date)
          if (!existingTime || item.recordDate > existingTime) {
            dataMap.set(date, item.weightKG)
            timeMap.set(date, item.recordDate)
          }
        },
      )

      // 生成连续日期的数据
      const result: { date: string; weight: number }[] = []
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        const dateStr = currentDate.toISOString().split('T')[0]
        const formattedDate = currentDate
          .toLocaleDateString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
          })
          .replace('月', '/')
          .replace('日', '')

        if (dataMap.has(dateStr)) {
          result.push({
            date: formattedDate,
            weight: dataMap.get(dateStr)!,
          })
        }
      }

      weightData.value = result
      await nextTick()
      initWeightChart()
    }
  } catch (error) {
    console.error('加载体重数据失败:', error)
    // 加载失败时显示空数据
    weightData.value = []
    await nextTick()
    initWeightChart()
  }
}

// 获取卡路里数据
const loadCaloriesData = async () => {
  try {
    const days = parseInt(caloriesTimePeriod.value.replace('d', ''))
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days + 1)

    const dateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }

    // 分别获取饮食和运动数据，避免并行请求导致服务器压力
    let dietResponse, exerciseResponse

    try {
      dietResponse = await dietApi.getList(dateRange)
    } catch (error) {
      console.error('获取饮食数据失败:', error)
      dietResponse = { success: false, data: null }
    }

    try {
      const noDateParams = {
        page: 1,
        size: 100,
        startDate: undefined,
        endDate: undefined,
        exerciseType: undefined,
      }

      exerciseResponse = await exerciseApi.getList(noDateParams)
    } catch (error) {
      console.error('获取运动数据失败:', error)
      exerciseResponse = { success: false, data: null }
    }

    // 处理饮食数据
    const dietMap = new Map<string, number>()
    if (dietResponse.success && dietResponse.data && dietResponse.data.rows) {
      dietResponse.data.rows.forEach((item) => {
        const date = new Date(item.recordDate).toISOString().split('T')[0]
        const existing = dietMap.get(date) || 0
        dietMap.set(date, existing + (item.estimatedCalories || 0))
      })
    }

    // 处理运动数据
    const exerciseMap = new Map<string, number>()
    if (
      exerciseResponse.success &&
      exerciseResponse.data &&
      exerciseResponse.data.rows
    ) {
      exerciseResponse.data.rows
        .filter((item) => {
          // 前端筛选日期范围（因为后端不支持日期筛选）
          const itemDate = new Date(item.recordDate).toISOString().split('T')[0]
          return (
            itemDate >= dateRange.startDate && itemDate <= dateRange.endDate
          )
        })
        .forEach((item) => {
          const date = new Date(item.recordDate).toISOString().split('T')[0]
          const existing = exerciseMap.get(date) || 0
          const calories =
            item.estimatedCaloriesBurned || item.caloriesBurned || 0
          exerciseMap.set(date, existing + calories)
        })
    }

    // 生成连续日期的数据
    const result: {
      date: string
      intake: number
      burn: number
      net: number
    }[] = []
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      const dateStr = currentDate.toISOString().split('T')[0]
      const formattedDate = currentDate
        .toLocaleDateString('zh-CN', {
          month: 'numeric',
          day: 'numeric',
        })
        .replace('月', '/')
        .replace('日', '')

      const intake = dietMap.get(dateStr) || 0
      const burn = exerciseMap.get(dateStr) || 0
      const net = intake - burn

      result.push({
        date: formattedDate,
        intake,
        burn,
        net,
      })
    }

    console.log('最终卡路里数据:', result)
    caloriesData.value = result
    await nextTick()
    initCaloriesChart()
  } catch (error) {
    console.error('加载卡路里数据失败:', error)
    // 加载失败时显示空数据
    caloriesData.value = []
    await nextTick()
    initCaloriesChart()
  }
}

const statistics = reactive({
  totalCaloriesConsumed: 0,
  totalCaloriesBurned: 0,
  averageWeight: 0,
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
    healthGoals.dailyCaloriesIntake =
      parsed.dailyCaloriesIntake || parsed.dailyCalories // 向后兼容
    healthGoals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
  }
}

const refreshData = async () => {
  try {
    // 初始化统计数据
    statistics.totalCaloriesConsumed = 0
    statistics.totalCaloriesBurned = 0
    statistics.averageWeight = 0

    // 获取今日数据
    const today = new Date().toISOString().split('T')[0]

    // 获取最近的身体数据
    const bodyDataResponse = await bodyDataApi.getList({
      startDate: today,
      endDate: today,
    })
    if (bodyDataResponse.success && bodyDataResponse.data) {
      if (bodyDataResponse.data.rows.length > 0) {
        // 显示今日最新体重，而不是平均值
        statistics.averageWeight = bodyDataResponse.data.rows[0].weightKG
      }
    }

    // 获取今日饮食数据
    const dietResponse = await dietApi.getList({
      startDate: today,
      endDate: today,
    })
    if (dietResponse.success && dietResponse.data && dietResponse.data.rows) {
      statistics.totalCaloriesConsumed = dietResponse.data.rows.reduce(
        (sum: number, item) =>
          sum + (item.estimatedCalories || item.calories || 0),
        0,
      )
    } else {
      statistics.totalCaloriesConsumed = 0
    }

    // 获取今日运动数据
    const exerciseResponse = await exerciseApi.getList({
      page: 1,
      size: 100,
      startDate: undefined,
      endDate: undefined,
      exerciseType: undefined,
    })
    if (
      exerciseResponse.success &&
      exerciseResponse.data &&
      exerciseResponse.data.rows
    ) {
      statistics.totalCaloriesBurned = exerciseResponse.data.rows
        .filter((item) => {
          // 前端筛选今日数据
          const itemDate = new Date(item.recordDate).toISOString().split('T')[0]
          return itemDate === today
        })
        .reduce((sum: number, item) => {
          const calories =
            item.estimatedCaloriesBurned || item.caloriesBurned || 0
          return sum + calories
        }, 0)
    } else {
      statistics.totalCaloriesBurned = 0
    }

    // 刷新图表数据
    loadWeightData()
    loadCaloriesData()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 添加缺少的快速记录方法
const handleQuickRecord = (command: string) => {
  switch (command) {
    case 'body':
      showBodyDataDialog.value = true
      break
    case 'diet':
      showDietDialog.value = true
      break
    case 'exercise':
      showExerciseDialog.value = true
      break
  }
}

// 页面可见性监听器，用于同步健康目标的更新
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 页面变为可见时重新加载健康目标
    loadHealthGoals()
  }
}

onMounted(async () => {
  loadHealthGoals()
  await refreshData()

  // 等待 DOM 完全渲染后初始化图表
  await nextTick()
  setTimeout(() => {
    loadWeightData()
    loadCaloriesData()
  }, 100)

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 监听时间段变化
watch(weightTimePeriod, () => {
  loadWeightData() // 使用真实数据
})

watch(caloriesTimePeriod, () => {
  loadCaloriesData() // 使用真实数据
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // 销毁图表实例
  if (weightChart) {
    weightChart.dispose()
  }
  if (caloriesChart) {
    caloriesChart.dispose()
  }
})
</script>

<style scoped>
.dashboard {
  padding: 30px 30px 0 30px;
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.03) 0%,
    rgba(147, 112, 219, 0.05) 25%,
    rgba(186, 85, 211, 0.08) 50%,
    rgba(221, 160, 221, 0.1) 75%,
    rgba(238, 130, 238, 0.12) 100%
  );
  min-height: 100vh;
  overflow: visible;
  position: relative;
  margin: 0;
  border: none;
}

.page-header {
  background: linear-gradient(135deg, #4f80ff 0%, #6fb7ff 50%, #a8d5ff 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 15px 35px rgba(79, 128, 255, 0.3);
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 35px;
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

.calories-in-card {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.calories-out-card {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.weight-card-enhanced {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}

.weight-card {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 30px;
  color: white;
  position: relative;
  z-index: 1;
}

.stat-icon {
  font-size: 3.5rem;
  margin-right: 25px;
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
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: countUp 0.8s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value.negative {
  color: #ffebee;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 6px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.stat-trend {
  font-size: 0.95rem;
  opacity: 0.8;
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  margin-bottom: 50px;
}

.chart-card {
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
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 20px 45px rgba(0, 0, 0, 0.15),
    0 10px 30px rgba(0, 0, 0, 0.1);
}

.chart-header {
  background: linear-gradient(
    135deg,
    #ff9a56 0%,
    #ffb366 20%,
    #ffc658 40%,
    #ffbe7a 60%,
    #ffb7c5 80%,
    #ffa8b8 100%
  );
  color: white;
  padding: 20px 25px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-radius: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.average-weight-info {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

.average-weight-value {
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.calories-average-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  font-weight: 500;
  flex-wrap: wrap;
}

.average-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.average-item .label {
  color: rgba(255, 255, 255, 0.8);
}

.average-item .value {
  font-weight: 700;
  font-size: 0.9rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.average-item .value.green {
  color: #10b981;
}

.average-item .value.red {
  color: #dc2626;
}

.average-item .value.yellow {
  color: #ea580c;
}

.chart-controls .el-button-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.chart-controls .el-button-group .el-button {
  border: none !important;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px !important;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0 !important;
}

.chart-controls .el-button-group .el-button:first-child {
  border-radius: 20px !important;
}

.chart-controls .el-button-group .el-button:last-child {
  border-radius: 20px !important;
}

.chart-controls .el-button {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.chart-controls .el-button.is-active,
.chart-controls .el-button--primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chart-controls .el-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.chart-container {
  flex: 1;
  padding: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 300px;
  width: 100%;
}

.chart-container > div {
  width: 100% !important;
  height: 100% !important;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8a2be2;
  text-align: center;
  gap: 15px;
}

.chart-placeholder .chart-icon {
  font-size: 4rem;
  color: #8a2be2;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.chart-placeholder p {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: #2d3748;
}

.chart-placeholder span {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
  opacity: 0.8;
}

.calories-chart-card .chart-header {
  background: linear-gradient(
    135deg,
    #ff9a56 0%,
    #ffb366 20%,
    #ffc658 40%,
    #ffbe7a 60%,
    #ffb7c5 80%,
    #ffa8b8 100%
  );
}

.calories-chart-card .chart-placeholder .chart-icon {
  color: #ff9a56;
}

.weight-chart-card .chart-header {
  background: linear-gradient(
    135deg,
    #ff9a56 0%,
    #ffb366 20%,
    #ffc658 40%,
    #ffbe7a 60%,
    #ffb7c5 80%,
    #ffa8b8 100%
  );
}

.weight-chart-card .chart-placeholder .chart-icon {
  color: #ff9a56;
}

/* 响应式优化 */
@media (max-width: 1024px) and (min-width: 769px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .chart-card {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .chart-card {
    height: 300px;
  }

  .chart-header {
    padding: 15px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .chart-header h3 {
    font-size: 1.1rem;
  }

  .chart-controls .el-button {
    font-size: 11px;
    padding: 5px 10px;
    border-radius: 20px !important;
  }

  .chart-controls .el-button-group .el-button {
    border-radius: 20px !important;
  }

  .chart-container {
    padding: 20px;
    min-height: 200px;
  }

  .chart-placeholder .chart-icon {
    font-size: 3rem;
  }

  .chart-placeholder p {
    font-size: 1.1rem;
  }

  .chart-placeholder span {
    font-size: 0.85rem;
  }
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
  content: '✨';
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
  border: 2px solid rgba(138, 43, 226, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  min-height: 44px;
}

.dialog-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(138, 43, 226, 0.3);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.1);
  transform: translateY(-1px);
}

.dialog-form :deep(.el-input__wrapper.is-focus) {
  border-color: #8a2be2;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
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
  background: linear-gradient(135deg, #8a2be2 0%, #9370db 100%);
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
  background: linear-gradient(135deg, #9370db 0%, #ba55d3 100%);
  transform: scale(1.1);
}

.dialog-form :deep(.el-select .el-select__wrapper) {
  border-radius: 12px;
  border: 2px solid rgba(138, 43, 226, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  min-height: 44px;
}

.dialog-form :deep(.el-select .el-select__wrapper:hover) {
  border-color: rgba(138, 43, 226, 0.3);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.1);
  transform: translateY(-1px);
}

.dialog-form :deep(.el-select .el-select__wrapper.is-focused) {
  border-color: #8a2be2;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
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
  color: #8a2be2;
  font-size: 12px;
  font-weight: 600;
  background: rgba(138, 43, 226, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  z-index: 10;
}

/* BMI 预览卡片美化 */
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
    rgba(138, 43, 226, 0.05) 0%,
    rgba(147, 112, 219, 0.05) 100%
  );
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.1);
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
  background: linear-gradient(90deg, #8a2be2 0%, #9370db 100%);
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
  color: #8a2be2;
  font-size: 13px;
  font-weight: 600;
  background: rgba(138, 43, 226, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(138, 43, 226, 0.2);
}

/* 对话框底部按钮美化 */
:deep(.form-dialog .el-dialog__footer) {
  padding: 0;
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.05) 0%,
    rgba(147, 112, 219, 0.05) 100%
  );
  border-top: 1px solid rgba(138, 43, 226, 0.1);
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
  border-color: rgba(138, 43, 226, 0.2);
  color: #8a2be2;
  backdrop-filter: blur(10px);
}

.dialog-footer .el-button:not(.el-button--primary):hover {
  background: rgba(138, 43, 226, 0.1);
  border-color: #8a2be2;
  color: #8a2be2;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #8a2be2 0%, #9370db 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
}

.dialog-footer .el-button--primary:hover {
  background: linear-gradient(135deg, #9370db 0%, #ba55d3 100%);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
}

.dialog-footer .el-button--primary.is-loading {
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.7) 0%,
    rgba(147, 112, 219, 0.7) 100%
  );
}

/* 响应式优化 */
@media (max-width: 1024px) and (min-width: 769px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
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
}

.add-btn {
  background: linear-gradient(45deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
  border: none;
  border-radius: 12px;
  padding: 18px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 50px;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(139, 92, 246, 0.5);
  background: linear-gradient(45deg, #c084fc 0%, #a855f7 50%, #8b5cf6 100%);
}

.dropdown-arrow {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.quick-record-dropdown.is-active .dropdown-arrow {
  transform: rotate(180deg);
}

.quick-record-dropdown :deep(.el-dropdown-menu) {
  border-radius: 15px;
  border: none;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 0;
  margin-top: 8px;
}

.quick-record-dropdown :deep(.el-dropdown-menu__item) {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #333;
  border-radius: 8px;
  margin: 0 8px;
  transition: all 0.3s ease;
}

.quick-record-dropdown :deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  color: #667eea;
  transform: translateX(5px);
}

.quick-record-dropdown :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}
</style>
