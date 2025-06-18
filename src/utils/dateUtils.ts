/**
 * 日期工具函数 - 处理时区问题
 * 针对 UTC+8 时区（中国标准时间）的日期处理
 */

/**
 * 获取本地时区的今日日期字符串 (YYYY-MM-DD 格式)
 * @returns 本地时区的今日日期字符串
 */
export const getLocalToday = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将日期对象转换为本地时区的日期字符串 (YYYY-MM-DD 格式)
 * @param date 日期对象
 * @returns 本地时区的日期字符串
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将 ISO 字符串转换为本地时区的日期字符串 (YYYY-MM-DD 格式)
 * @param isoString ISO 日期字符串
 * @returns 本地时区的日期字符串
 */
export const isoToLocalDate = (isoString: string): string => {
  const date = new Date(isoString)
  return formatLocalDate(date)
}

/**
 * 获取指定天数前的本地日期字符串
 * @param days 天数（正数表示过去，负数表示未来）
 * @returns 本地时区的日期字符串
 */
export const getDaysAgoLocal = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatLocalDate(date)
}

/**
 * 格式化显示日期（中文格式）
 * @param dateStr 日期字符串 (YYYY-MM-DD 或 ISO 格式)
 * @returns 中文格式的日期字符串
 */
export const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

/**
 * 格式化简短日期（MM/DD 格式）
 * @param dateStr 日期字符串 (YYYY-MM-DD 或 ISO 格式)
 * @returns MM/DD 格式的日期字符串
 */
export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date
    .toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    })
    .replace('月', '/')
    .replace('日', '')
}

/**
 * 检查两个日期字符串是否为同一天（本地时区）
 * @param date1 日期字符串1
 * @param date2 日期字符串2
 * @returns 是否为同一天
 */
export const isSameLocalDate = (date1: string, date2: string): boolean => {
  return isoToLocalDate(date1) === isoToLocalDate(date2)
}

/**
 * 检查日期字符串是否为今天（本地时区）
 * @param dateStr 日期字符串
 * @returns 是否为今天
 */
export const isToday = (dateStr: string): boolean => {
  return isSameLocalDate(dateStr, new Date().toISOString())
}
