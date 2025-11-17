import {formatDate} from '@cm/class/Days/date-utils/formatters'

/**
 * 文字列をDateオブジェクトに変換
 * @param dateStr 日付文字列（YYYY-MM-DD形式）
 * @returns Dateオブジェクト
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/**
 * 今日の日付を文字列で取得
 * @returns YYYY-MM-DD形式の文字列
 */
export function getTodayString(): string {
  const today = new Date()
  return formatDate(today, 'YYYY-MM-DD')
}

/**
 * 指定月の開始日と終了日を取得
 * @param date 基準となる日付
 * @returns 開始日と終了日のオブジェクト
 */
export function getMonthRange(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)

  // UTC時間で日付のみを設定（時刻は00:00:00）
  startOfMonth.setUTCHours(0, 0, 0, 0)
  endOfMonth.setUTCHours(23, 59, 59, 999)

  return {startOfMonth, endOfMonth}
}

/**
 * 2つの日付が同じ日かどうかを判定
 * @param date1 日付1
 * @param date2 日付2
 * @returns 同じ日の場合true
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  )
}

/**
 * UTC時間で日付のみのDateオブジェクトを作成
 * @param year 年
 * @param month 月（1-12）
 * @param day 日（1-31）
 * @returns UTC時間で時刻00:00:00のDateオブジェクト
 */
export function createUTCDate(year: number, month: number, day: number): Date {
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  return date
}

/**
 * 日付文字列からUTC時間のDateオブジェクトを作成
 * @param dateStr YYYY-MM-DD形式の日付文字列
 * @returns UTC時間で時刻00:00:00のDateオブジェクト
 */
export function createUTCDateFromString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return createUTCDate(year, month, day)
}

/**
 * 現在の日付をUTC時間で取得
 * @returns UTC時間で時刻00:00:00の今日のDateオブジェクト
 */
export function getTodayUTCDate(): Date {
  const today = new Date()
  return createUTCDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
}
