/**
 * 統合時間処理ユーティリティクラス
 * 24時間超え対応（25時、26時等）、基本的な時間計算、請求処理ロジック
 * 旧Timeクラスの機能も統合
 */
export class TimeHandler {
  /**
   * 4桁文字列時刻（HHMM）を正規化
   * @param timeStr - "0800", "2530"等の4桁文字列
   * @returns 正規化された時刻情報
   */
  static parseTimeString(timeStr: string | null | undefined): ParsedTime | null {
    if (!timeStr || timeStr.length !== 4) return null

    const hour = parseInt(timeStr.substring(0, 2))
    const minute = parseInt(timeStr.substring(2, 4))

    if (isNaN(hour) || isNaN(minute) || minute >= 60) return null

    return {
      originalHour: hour,
      originalMinute: minute,
      normalizedHour: hour % 24,
      dayOffset: Math.floor(hour / 24),
      totalMinutes: hour * 60 + minute,
      timeString: timeStr,
    }
  }

  /**
   * 時刻文字列をソート用の数値に変換
   * 24時間超えを考慮した順序（例: 0800 < 2400 < 2530）
   */
  static getTimeOrderValue(timeStr: string | null | undefined): number {
    const parsed = this.parseTimeString(timeStr)
    return parsed ? parsed.totalMinutes : 9999 // nullは最後にソート
  }

  /**
   * 2つの時刻文字列を比較（ソート用）
   * @param a - 時刻文字列1
   * @param b - 時刻文字列2
   * @returns -1, 0, 1
   */
  static compareTimeStrings(a: string | null | undefined, b: string | null | undefined): number {
    const valueA = this.getTimeOrderValue(a)
    const valueB = this.getTimeOrderValue(b)

    return valueA - valueB
  }

  /**
   * 時刻文字列を表示用にフォーマット
   * @param timeStr - 4桁時刻文字列
   * @param format - 'HH:MM' | 'H時M分' | 'display'
   */
  static formatTimeString(timeStr: string | null | undefined, format: TimeFormat = 'HH:MM'): string {
    const parsed = this.parseTimeString(timeStr)
    if (!parsed) return ''

    const {originalHour, originalMinute} = parsed

    switch (format) {
      case 'HH:MM':
        return `${originalHour.toString().padStart(2, '0')}:${originalMinute.toString().padStart(2, '0')}`
      case 'H時M分':
        return `${originalHour}時${originalMinute.toString().padStart(2, '0')}分`
      case 'display':
        // 24時間超えの場合は特別表示
        if (originalHour >= 24) {
          const nextDayHour = originalHour - 24
          return `翌${nextDayHour.toString().padStart(2, '0')}:${originalMinute.toString().padStart(2, '0')}`
        }
        return this.formatTimeString(timeStr, 'HH:MM')
      default:
        return this.formatTimeString(timeStr, 'HH:MM')
    }
  }

  /**
   * 日付と時刻文字列から実際のDatetimeを生成
   * 24時間超えの場合は翌日に調整
   */
  static createDateTimeFromTimeString(baseDate: Date, timeStr: string | null | undefined): Date | null {
    const parsed = this.parseTimeString(timeStr)
    if (!parsed) return null

    const result = new Date(baseDate)
    result.setHours(parsed.normalizedHour, parsed.originalMinute, 0, 0)

    // 日跨ぎの場合は日付を調整
    if (parsed.dayOffset > 0) {
      result.setDate(result.getDate() + parsed.dayOffset)
    }

    return result
  }

  /**
   * 時刻文字列のバリデーション
   * @param timeStr - 検証する時刻文字列
   * @returns バリデーション結果
   */
  static validateTimeString(timeStr: string): TimeValidationResult {
    if (!timeStr) {
      return {isValid: false, error: '時刻が入力されていません'}
    }

    if (!/^\d{4}$/.test(timeStr)) {
      return {isValid: false, error: '4桁の数字で入力してください（例: 0800）'}
    }

    const hour = parseInt(timeStr.substring(0, 2))
    const minute = parseInt(timeStr.substring(2, 4))

    if (minute >= 60) {
      return {isValid: false, error: '分は00-59の範囲で入力してください'}
    }

    if (hour > 48) {
      return {isValid: false, error: '時刻は48時までの範囲で入力してください'}
    }

    return {isValid: true}
  }

  // ======== 旧Timeクラスから統合した機能 ========

  /**
   * HH:MM形式の時間文字列を分単位に変換
   * @param timeString - "12:00", "15:30"等の時間文字列
   * @returns 分単位の時間
   */
  static timeStringToMinutes(timeString: string | null | undefined): number {
    if (!timeString) return 0

    const [hours, minutes] = timeString.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0

    return hours * 60 + minutes
  }

  /**
   * 分を HH:MM 形式の時間文字列に変換
   * @param minutes - 分単位の時間
   * @returns 時間文字列 (例: "12:00", "15:30")
   */
  static minutesToTimeString(minutes: number): string {
    if (minutes === 0) return '00:00'

    const isNegative = minutes < 0
    const absMinutes = Math.abs(minutes)

    const hours = Math.floor(absMinutes / 60)
    const mins = absMinutes % 60

    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    return isNegative ? `-${timeStr}` : timeStr
  }

  /**
   * HH:MM形式の時間文字列間の時間差を分単位で計算
   * 終了時間が開始時間より小さい場合は、終了時間を翌日として計算
   * @param startTime - 開始時間 (例: "08:00", "15:30")
   * @param endTime - 終了時間 (例: "17:00", "00:30")
   * @returns 時間差（分）
   * @example
   * calcTimeDifferenceInMinutes("08:00", "17:00") // 540分 (9時間)
   * calcTimeDifferenceInMinutes("08:00", "00:30") // 990分 (16時間30分) ※翌日の00:30として計算
   * calcTimeDifferenceInMinutes("23:00", "01:00") // 120分 (2時間) ※翌日の01:00として計算
   */
  static calcTimeDifferenceInMinutes(startTime: string | null | undefined, endTime: string | null | undefined): number {
    if (!startTime || !endTime) return 0

    const startMinutes = this.timeStringToMinutes(startTime)
    const endMinutes = this.timeStringToMinutes(endTime)

    let diff = endMinutes - startMinutes

    // 終了時間が開始時間より小さい場合は翌日とみなして24時間を加算
    if (diff < 0) {
      diff += 24 * 60 // 1440分（24時間）を加算
    }

    return diff
  }

  /**
   * 4桁時刻文字列（HHMM）をHH:MM形式に変換
   * @param timeStr - "0800", "1530"等の4桁文字列
   * @returns "08:00", "15:30"等のHH:MM形式文字列
   */
  static formatTimeStringToHHMM(timeStr: string | null | undefined): string {
    const parsed = this.parseTimeString(timeStr)
    if (!parsed) return ''

    return `${parsed.originalHour.toString().padStart(2, '0')}:${parsed.originalMinute.toString().padStart(2, '0')}`
  }

  /**
   * HH:MM形式文字列を4桁時刻文字列（HHMM）に変換
   * @param timeString - "08:00", "15:30"等のHH:MM形式
   * @returns "0800", "1530"等の4桁文字列
   */
  static parseHHMMToTimeString(timeString: string | null | undefined): string {
    if (!timeString) return ''

    const cleaned = timeString.replace(/[^0-9]/g, '')
    if (cleaned.length === 4) return cleaned

    const [hours, minutes] = timeString.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return ''

    return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`
  }
}

/**
 * 請求処理関連のユーティリティ
 */
export class BillingHandler {
  /**
   * 月末日跨ぎ運行の請求月を判定
   * @param operationDate - 運行日
   * @param departureTime - 出発時刻（4桁文字列）
   * @returns 請求対象月の年月
   */
  static getBillingMonth(operationDate: Date, departureTime: string | null | undefined): Date {
    let result: Date
    const parsed = TimeHandler.parseTimeString(departureTime)

    if (!parsed) {
      // 出発時刻が不明な場合は運行日の月を使用
      result = new Date(operationDate.getFullYear(), operationDate.getMonth(), 1)
      return result
    }

    // 24:00以降（翌日扱い）の場合
    if (parsed.originalHour >= 24) {
      const billingDate = new Date(operationDate)
      billingDate.setDate(billingDate.getDate() + 1)

      return billingDate
    }

    // 24:00未満の場合は運行日の月
    result = new Date(operationDate.getFullYear(), operationDate.getMonth(), 1)

    return result
  }

  /**
   * 月末日判定
   * @param date - 判定する日付
   * @returns 月末日かどうか
   */
  static isLastDayOfMonth(date: Date): boolean {
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)
    return nextDay.getMonth() !== date.getMonth()
  }
}

// 型定義
export interface ParsedTime {
  originalHour: number // 元の時刻（25, 26等も含む）
  originalMinute: number
  normalizedHour: number // 24時間内に正規化した時刻
  dayOffset: number // 日跨ぎ日数
  totalMinutes: number // 0時からの総分数（ソート用）
  timeString: string // 元の文字列
}

export type TimeFormat = 'HH:MM' | 'H時M分' | 'display'

export interface TimeValidationResult {
  isValid: boolean
  error?: string
}
