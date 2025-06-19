// 用户相关类型
export interface User {
  userID: string // 对应 API 的 36 位 UUID
  email: string
  nickname?: string
  gender?: string // 支持中文（"男"、"女"）
  dateOfBirth?: string // 格式 YYYY-MM-DD
  avatarUrl?: string
  // 兼容字段
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
  // 兼容字段
  username?: string
  password?: string
  age?: number
  height?: number
  weight?: number
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH'
}

// 身体数据相关类型
export interface BodyData {
  bodyMetricID?: number // API 返回的 ID 字段
  userID: string
  heightCM: number // 身高（cm），精确到 2 位小数
  weightKG: number // 体重（kg），精确到 2 位小数
  bmi?: number
  recordDate: string // 记录日期 YYYY-MM-DD
  createdAt?: string
  updatedAt?: string
  // 兼容字段
  id?: number
  userId?: number
  weight?: number
  bodyFat?: number
  muscleMass?: number
}

// 兼容性别名
export type BodyDataRecord = BodyData
export type Diet = DietRecord
export type Exercise = ExerciseRecord

export interface BodyDataRequest {
  userID: string
  heightCM: number // 身高（cm）
  weightKG: number // 体重（kg）
  recordDate?: string // 记录日期，可选（默认今日）
  // 兼容字段
  weight?: number
  bodyFat?: number
  muscleMass?: number
}

// 饮食相关类型
export interface DietRecord {
  dietItemID?: number // API 返回的 ID 字段
  userID: string
  recordDate: string // 记录日期 YYYY-MM-DD
  foodName: string
  mealType: string // 餐型（早餐/午餐/晚餐/加餐）
  estimatedCalories?: number // 估计热量（kcal）
  createdAt?: string
  updatedAt?: string
  // 兼容字段
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
  userID: string
  recordDate: string // 记录日期 YYYY-MM-DD
  foodName: string
  mealType: string // 餐型（早餐/午餐/晚餐/加餐）
  estimatedCalories?: number // 估计热量（kcal）
  // 兼容字段
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
  userID: string
  exerciseType: string // 运动类型（如跑步/游泳）
  durationMinutes: number // 持续时间（分钟）
  estimatedCaloriesBurned?: number // 消耗热量（kcal）
  recordDate: string // 记录日期 YYYY-MM-DD
  createdAt?: string
  updatedAt?: string
  // 兼容字段
  id?: number
  userId?: number
  exerciseName?: string
  duration?: number
  caloriesBurned?: number
  intensity?: string
}

export interface ExerciseRequest {
  userID: string
  exerciseType: string // 运动类型
  durationMinutes: number // 持续时间（分钟）
  estimatedCaloriesBurned?: number // 消耗热量（kcal）
  recordDate?: string // 记录日期，可选（默认今日）
  // 兼容字段
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

// API 原始响应数据类型（处理字段名大小写不一致）
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

// API 错误类型
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
