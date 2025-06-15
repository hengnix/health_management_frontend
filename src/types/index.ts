// 用户相关类型
export interface User {
  userID: string // 对应 API 的 36 位 UUID
  email: string
  nickname?: string // 添加 nickname 字段
  gender?: string // 改为 string 类型，支持中文（"男"、"女"）
  dateOfBirth?: string // 添加出生日期字段，格式 YYYY-MM-DD
  avatarUrl?: string // 头像 URL
  // 保留原有字段作为兼容
  id?: number
  username?: string
  age?: number
  height?: number
  weight?: number
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH'
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  passwordHash: string
}

export interface RegisterRequest {
  email: string
  passwordHash: string
  nickname?: string
  gender?: string
  dateOfBirth?: string // 格式 YYYY-MM-DD
  // 保留原有字段作为兼容
  username?: string
  password?: string
  age?: number
  height?: number
  weight?: number
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH'
}

// 身体数据相关类型 - 根据 API文档修正
export interface BodyData {
  bodyMetricID?: number // API 返回的 ID 字段
  userID: string // 用户 ID 为 string 类型
  heightCM: number // 身高（厘米），精确到 2 位小数
  weightKG: number // 体重（千克），精确到 2 位小数
  bmi?: number // BMI 值
  recordDate: string // 记录日期 YYYY-MM-DD
  createdAt?: string
  updatedAt?: string
  // 保留原有字段作为兼容
  id?: number
  userId?: number
  weight?: number
  bodyFat?: number
  muscleMass?: number
}

// 为了兼容性添加别名
export type BodyDataRecord = BodyData
export type Diet = DietRecord
export type Exercise = ExerciseRecord

export interface BodyDataRequest {
  userID: string // 用户 ID
  heightCM: number // 身高（厘米）
  weightKG: number // 体重（千克）
  recordDate?: string // 记录日期，可选（默认今日）
  // 保留原有字段作为兼容
  weight?: number
  bodyFat?: number
  muscleMass?: number
}

// 饮食相关类型 - 根据 API 文档修正
export interface DietRecord {
  dietItemID?: number // API 返回的 ID 字段
  userID: string // 用户 ID
  recordDate: string // 记录日期 YYYY-MM-DD
  foodName: string
  mealType: string // 餐型（早餐/午餐/晚餐/加餐）
  estimatedCalories?: number // 估计热量（大卡）- 可选
  createdAt?: string
  updatedAt?: string
  // 保留原有字段作为兼容
  id?: number
  userId?: number
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
  servingSize?: number
  servingUnit?: string
  carbs?: number
  quantity?: number
  unit?: string
}

export interface DietRequest {
  userID: string // 用户 ID
  recordDate: string // 记录日期 YYYY-MM-DD - 必须字段
  foodName: string
  mealType: string // 餐型（早餐/午餐/晚餐/加餐）
  estimatedCalories?: number // 估计热量（大卡）- 可选
  // 保留原有字段作为兼容
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
  servingSize?: number
  servingUnit?: string
  carbs?: number
  quantity?: number
  unit?: string
}

// 运动相关类型
export interface ExerciseRecord {
  exerciseItemID?: number // API 返回的 ID 字段
  userID: string // 用户 ID
  exerciseType: string // 运动类型（如跑步/游泳）
  durationMinutes: number // 持续时间（分钟）
  estimatedCaloriesBurned?: number // 消耗热量（大卡）- 可选
  recordDate: string // 记录日期 YYYY-MM-DD
  createdAt?: string
  updatedAt?: string
  // 保留原有字段作为兼容
  id?: number
  userId?: number
  exerciseName?: string
  duration?: number
  caloriesBurned?: number
  intensity?: string
}

export interface ExerciseRequest {
  userID: string // 用户 ID
  exerciseType: string // 运动类型
  durationMinutes: number // 持续时间（分钟）
  estimatedCaloriesBurned?: number // 消耗热量（大卡）- 可选
  recordDate?: string // 记录日期，可选（默认今日）
  // 保留原有字段作为兼容
  exerciseName?: string
  duration?: number
  caloriesBurned?: number
  intensity?: string
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// API 原始响应数据类型（处理字段名大小写不一致的问题）
export interface ApiBodyDataRow {
  BodyMetricID?: number
  bodyMetricID?: number
  UserID?: string
  userID?: string
  HeightCM?: number
  heightCM?: number
  WeightKG?: number
  weightKG?: number
  RecordDate?: string
  recordDate?: string
  createdAt?: string
  updatedAt?: string
}

// API 错误类型定义
export interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
      error?: string
    }
  }
  message?: string
  status?: number
}

// 统计数据类型
export interface Statistics {
  totalCaloriesConsumed: number
  totalCaloriesBurned: number
  netCalories: number
  averageWeight: number
  exerciseCount: number
  dietRecordCount: number
}
