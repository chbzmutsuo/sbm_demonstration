import {isServer} from 'src/cm/lib/methods/common'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/ja'

import {colTypeStr} from '@cm/types/types'

import {getColorStyles} from '@cm/lib/methods/colors'
import {Calendar} from '@prisma/client'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {DateInput} from '@cm/class/Days/date-utils/date-utils-type'
import {toJst, toUtc} from '@cm/class/Days/date-utils/calculations'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')
dayjs.tz.setDefault('Asia/Tokyo')

//
export class Days {
  value: Date

  constructor(date: Date | string) {
    let dateObj
    if (!date) {
      // dateObj = new Date();
    } else if (typeof date === 'string' && date.length === 6) {
      // YYYYMM表記の時
      const year = date.substring(0, 4)
      const month = date.substring(4, 6)
      dateObj = new Date(Number(year), Number(month) - 1, 1)
    } else if (typeof date === 'string' && date.length === 8) {
      // YYYYMMDD表記の時
      const year = date.substring(0, 4)
      const month = date.substring(4, 6)
      const day = date.substring(6, 8)
      dateObj = new Date(Number(year), Number(month) - 1, Number(day))
    } else if (typeof date === 'string' && date.length === 14) {
      //YYYYMMDDHHMMSSの場合
      const year = date.substring(0, 4)
      const month = date.substring(4, 6)
      const day = date.substring(6, 8)
      const hour = date.substring(8, 10)
      const minute = date.substring(10, 12)
      const second = date.substring(12, 14)
      dateObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    } else {
      const tryParseDate = new Date(date)
      dateObj = new Date(date)
    }

    this.value = dateObj
  }

  ymd(): string | null {
    if (!this.value) return null

    return Days.parser.getDate(this.value).ymd ?? null
  }
  hms(): string | null {
    if (!this.value) return null
    return Days.parser.getDate(this.value).hms ?? null
  }
  ymdHms(): string | null {
    if (!this.value) return null
    return Days.parser.getDate(this.value).ymd + ' ' + Days.parser.getDate(this.value).hms
  }

  localeYmd(): string | null {
    if (!this.value) return null
    return [
      //
      this.value.getFullYear(),
      String(this.value.getMonth() + 1).padStart(2, '0'),
      String(this.value.getDate()).padStart(2, '0'),
    ].join('-')
  }

  localeHms(): string | null {
    if (!this.value) return null
    return [
      String(this.value.getHours()).padStart(2, '0'),
      String(this.value.getMinutes()).padStart(2, '0'),
      String(this.value.getSeconds()).padStart(2, '0'),
    ].join(':')
  }

  localeYmdHms(): string | null {
    if (!this.value) return null
    return this.localeYmd() + ' ' + this.localeHms()
  }

  static parser = {
    // 日付オブジェクトから年月日時分秒の文字列を生成する。
    getDate: (
      date: DateInput = new Date()
    ): {
      ymd: string | undefined
      hms: string | undefined
      templateCreate: {
        createYmd: string | undefined
        createHms: string | undefined
        updateYmd: string | undefined
        updateHms: string | undefined
      }
      templateUpdate: {
        updateYmd: string | undefined
        updateHms: string | undefined
      }
    } => {
      if (!date) {
        return {
          ymd: undefined,
          hms: undefined,
          templateCreate: {createYmd: undefined, createHms: undefined, updateYmd: undefined, updateHms: undefined},
          templateUpdate: {updateYmd: undefined, updateHms: undefined},
        }
      }
      const toDateObj = new Date(date)

      // 無効な日付の場合の処理を追加すべき
      if (isNaN(toDateObj.getTime())) {
        return {
          ymd: undefined,
          hms: undefined,
          templateCreate: {createYmd: undefined, createHms: undefined, updateYmd: undefined, updateHms: undefined},
          templateUpdate: {updateYmd: undefined, updateHms: undefined},
        }
      }

      // YYYYMMDD形式の文字列を生成
      const ymd =
        String(toDateObj.getFullYear()) + //
        String(toDateObj.getMonth() + 1).padStart(2, '0') +
        String(toDateObj.getDate()).padStart(2, '0')

      // HHMMSS形式の文字列を生成
      const hms =
        String(toDateObj.getHours()).padStart(2, '0') +
        String(toDateObj.getMinutes()).padStart(2, '0') +
        String(toDateObj.getSeconds()).padStart(2, '0')

      return {
        ymd,
        hms,
        templateCreate: {createYmd: ymd, createHms: hms, updateYmd: ymd, updateHms: hms},
        templateUpdate: {updateYmd: ymd, updateHms: hms},
      }
    },

    // YYYYMMDD形式とHHMMSS形式の文字列からDateオブジェクトを生成
    YmdToDate: (ymd?: string, hms?: string): Date | undefined => {
      // YYYYMMDD形式とHHMMSS形式の文字列を YYYY-MM-DD HH:MM:SS 形式に整形
      const parseDateStr = (ymd?: string, hms?: string) => {
        // 入力値の形式チェックを追加すべき
        if (ymd && !/^\d{8}$/.test(ymd)) {
          return ''
        }
        if (hms && !/^\d{6}$/.test(hms)) {
          return ''
        }

        const YMD = ymd ? ymd.slice(0, 4) + '-' + ymd.slice(4, 6) + '-' + ymd.slice(6, 8) : ''
        const HMS = hms ? hms.slice(0, 2) + ':' + hms.slice(2, 4) + ':' + hms.slice(4, 6) : ''
        const str = YMD + ' ' + HMS

        return str.trim() // 片方のパラメータのみの場合の余分なスペース除去
      }

      const str = parseDateStr(ymd, hms)
      if (str) {
        const date = new Date(str)
        // 無効な日付の場合はundefinedを返すべき
        return isNaN(date.getTime()) ? undefined : date
      }
      return undefined // 明示的にundefinedを返す
    },
  }

  // 日付操作の基本単位
  static day = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'day').toDate()
    },

    addBusinessDays: (startDate: Date, n: number, nonWorkingDays: Date[] = []): Date => {
      // 日付を操作するために基準日をDateオブジェクトに変換
      const currentDate = new Date(startDate)

      // 非稼働日をセットに変換して効率的に検索できるようにする
      const nonWorkingDaysSet = new Set(nonWorkingDays.map(day => formatDate(new Date(day))))
      let roopCount = 0

      // 進む方向を決定（n が正なら先の日付、負なら過去の日付へ）
      const step = n >= 0 ? 1 : -1

      while (n !== 0) {
        // 翌日または前日へ進める
        currentDate.setDate(currentDate.getDate() + step)
        const dateString = formatDate(currentDate)

        if (!nonWorkingDaysSet.has(dateString)) {
          // 稼働日ならnを減らす (nが負の場合も絶対値で減らす)
          n -= step
        }

        roopCount++
      }

      return currentDate
    },
    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'day').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'day')
    },

    // 既存のdayプロパティがあればそれに追加
    isHoliday: (date: Date, holidays?: Calendar[]) => {
      const isShukujitsu = holidays?.some(h => Days.validate.isSameDate(h.date, date))

      if (isShukujitsu) {
        return {style: {...getColorStyles('#fbeb8e')}}
      } else if (formatDate(date, 'ddd') === '土') {
        return {style: {...getColorStyles('#c6eeff')}}
      } else if (formatDate(date, 'ddd') === '日') {
        return {style: {...getColorStyles('#ffd7d7')}}
      }
    },

    generate30MinuteIntervals: (): string[] => {
      const intervals: any[] = []
      const intervalInMinutes = 30
      const minutesInADay = 24 * 60

      for (let i = 0; i < minutesInADay; i += intervalInMinutes) {
        const hours = Math.floor(i / 60)
        const minutes = i % 60

        const hoursString = hours.toString().padStart(2, '0')
        const minutesString = minutes.toString().padStart(2, '0')

        intervals.push(`${hoursString}:${minutesString}`)
      }

      return intervals
    },

    getIntervalDatum: (start: Date, end: Date) => {
      const daysInInterval = Days.day.difference(new Date(end), new Date(start))

      /**今月日数 */
      const days: any[] = []
      for (let i = 0; i <= daysInInterval; i++) {
        const dt = new Date(start)
        const newDate = dt.setDate(dt.getDate() + i)
        days.push(new Date(newDate))
      }

      return {days}
    },

    getDaysBetweenDates: (startDate: Date, endDate: Date): Date[] => {
      const start = new Date(startDate)
      const end = new Date(endDate)

      // 時間部分をリセットして、日付単位での比較にする
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)

      const days: Date[] = []

      let convertToUtc = false
      while (start <= end) {
        let nextDate = new Date(start.getTime())
        if (nextDate.toISOString().includes('15:00:00') === false) {
          convertToUtc = true
          nextDate = Days.hour.add(nextDate, 15)
        }

        days.push(nextDate)
        start.setDate(start.getDate() + 1)
      }

      if (days.some(d => !d.toISOString().includes('15:00:00'))) {
        throw new Error(`getDaysBetweenDates: UTC ではありません。`)
      }
      // if (convertToUtc) {
      //   console.warn(`getDaysBetweenDates: convert to UTC`)
      // }

      return days
    },
  }

  static week = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'week').toDate()
    },
    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'week').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'week')
    },
  }

  static month = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'month').toDate()
    },

    addMonthWithAdjustment: (date: Date, amount: number): Date => {
      const originalDate = dayjs(date)
      const isEndOfMonth = originalDate.endOf('month').isSame(originalDate, 'day')

      const addedDate = originalDate.add(amount, 'month')

      if (isEndOfMonth) {
        // 元の日付が月末の場合、追加後も月末に調整
        return getMidnight(addedDate.endOf('month').toDate())
      } else {
        return addedDate.toDate()
      }
    },

    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'month').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'month')
    },
    isLastDay: (date: Date): boolean => {
      return dayjs(date).endOf('month').isSame(dayjs(date), 'day')
    },

    getEndOfMonth: (date: Date): Date => {
      return toUtc(dayjs(date).endOf('month').toDate())
    },

    getMonthDatum: (
      monthDt: Date,
      options?: {
        getFrom: (monthDt: Date) => Date
        getTo: (monthDt: Date) => Date
      }
    ) => {
      const dateConverter = isServer ? toUtc : val => val
      const year = toJst(monthDt).getFullYear()
      const month = toJst(monthDt).getMonth() //月よりも-1
      const date = 1

      const getFromTo = () => {
        if (options) {
          return {
            firstDayOfMonth: options.getFrom(monthDt),
            lastDayOfMonth: options.getTo(monthDt),
          }
        } else {
          return {
            firstDayOfMonth: dateConverter(new Date(year, month, 1)),
            lastDayOfMonth: dateConverter(new Date(year, month + 1, 0)),
          }
        }
      }

      const {firstDayOfMonth, lastDayOfMonth} = getFromTo()

      const days = Days.day.getDaysBetweenDates(firstDayOfMonth, lastDayOfMonth)

      const getWeeks = (
        startDateString: '月' | '火' | '水' | '木' | '金' | '土' | '日',
        options?: {
          showPrevAndNextMonth?: boolean
        }
      ) => {
        const weekDayStart = startDateString
        const weekdayMaster = [`日`, '月', '火', '水', '木', '金', '土']
        const weekdays = weekdayMaster
          .slice(weekdayMaster.indexOf(weekDayStart), 7)
          .concat(weekdayMaster.slice(0, weekdayMaster.indexOf(weekDayStart)))

        let weeks: Date[][] = [[]]

        const firstWeekOffset = getDayIndexOfWeek(firstDayOfMonth, weekdays)
        const prevMonthDays = new Array(firstWeekOffset)
          .fill(0)
          .map((_, i) => Days.day.subtract(firstDayOfMonth, firstWeekOffset - i))

        const lastWeekOffset = 6 - getDayIndexOfWeek(lastDayOfMonth, weekdays)
        const nextMonthDays = new Array(lastWeekOffset).fill(0).map((_, i) => Days.day.add(lastDayOfMonth, i + 1))

        const daysShownOnCalendar = [...prevMonthDays, ...days, ...nextMonthDays]

        for (let i = 0; i < daysShownOnCalendar.length; i += 7) {
          weeks.push(daysShownOnCalendar.slice(i, i + 7))
        }
        const remainingDayCount = 7 - weeks[weeks.length - 1].length

        for (let i = 0; i < remainingDayCount; i++) {
          weeks[weeks.length - 1].push(nextMonthDays[i])
        }

        weeks = weeks.filter(week => week.length === 7)

        return weeks
      }

      // 曜日のインデックスを取得するヘルパー関数 (0: 日, 1: 月, ..., 6: 土)
      function getDayIndexOfWeek(date: Date, weekdays): number {
        const currentWeekdayIndex = weekdays.indexOf(date.toLocaleDateString('ja', {weekday: 'short'}).slice(0, 1))

        // offsetを常に正の値にする
        return currentWeekdayIndex
      }
      const BASICS = {
        year,
        month: month + 1,
        date,
        firstDayOfMonth,
        lastDayOfMonth,
      }

      return {
        ...BASICS,
        getWeeks,
        days,
      }
    },
    getMonthsBetweenDates: (startDate: Date, endDate: Date): Date[] => {
      const start = toUtc(startDate)
      const end = toUtc(endDate)

      const firstDate = start
      const lastDate = end

      let theDate = firstDate

      const months: Date[] = []
      let roop = 0

      while (theDate <= lastDate) {
        months.push(theDate)
        theDate = Days.month.getNextMonthLastDate(theDate, 1)

        roop++
        if (roop > 50) {
          console.error(`getMonthsBetweenDates: roop over`)
          break
        }
      }

      return months
    },

    getNextMonthLastDate: (date: Date, add: number): Date => {
      date = Days.month.add(date, add ?? 1)
      if (Days.month.isLastDay(date) === false) {
        date.setMonth(date.getMonth() + 1)
        date.setDate(0)
      }

      return date
    },
  }

  static year = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'year').toDate()
    },
    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'year').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'year')
    },

    getYearDatum: (year: number) => {
      const firstDateOfYear = new Date(year, 0, 1)
      const lastDateOfYear = new Date(year, 11, 31)

      const getSpecifiedMonthOnThisYear = month => {
        return {first: toUtc(new Date(year, month - 1, 1)), last: Days.day.add(toUtc(new Date(year, month, 1)), -1)}
      }

      const getAllMonthsInYear = () => {
        const months: Date[] = []
        for (let month = 0; month < 12; month++) {
          months.push(new Date(year, month, 1))
        }
        return months
      }

      return {firstDateOfYear, lastDateOfYear, getSpecifiedMonthOnThisYear, getAllMonthsInYear}
    },
  }

  static hour = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'hour').toDate()
    },
    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'hour').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'hour')
    },
  }

  static minute = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'minute').toDate()
    },
    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'minute').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'minute')
    },
  }

  static time = {
    add: (date: Date, amount: number): Date => {
      return dayjs(date).add(amount, 'hour').toDate()
    },
    subtract: (date: Date, amount: number): Date => {
      return dayjs(date).subtract(amount, 'hour').toDate()
    },
    difference: (futureDate: Date, pastDate: Date): number => {
      return dayjs(futureDate).diff(dayjs(pastDate), 'hour')
    },

    calculateOverlappingTimeRange: (props: {
      range1: {
        start: Date
        end: Date
      }
      range2: {
        start: Date
        end: Date
      }
    }) => {
      const {range1, range2} = props
      // 入力値がDateオブジェクトであることを確認します。
      const range1Start = new Date(range1.start)
      const range1End = new Date(range1.end)
      const range2Start = new Date(range2.start)
      const range2End = new Date(range2.end)

      const latestStart = range1Start > range2Start ? range1Start : range2Start
      const earliestEnd = range1End < range2End ? range1End : range2End

      if (latestStart < earliestEnd) {
        return {
          start: latestStart,
          end: earliestEnd,
          mins: (earliestEnd.getTime() - latestStart.getTime()) / 1000 / 60,
        }
      } else {
        return null // 重複部分がない場合
      }
    },

    getTimeFormat: (
      type: colTypeStr
    ): {
      timeFormatForDaysJs: string
      timeFormatForDateFns: string
    } => {
      let timeFormat = ''

      switch (type) {
        case 'date':
        case 'datetime':
          timeFormat = `yyyy-MM-dd`
          break
        case 'month':
          timeFormat = 'yyyy-MM'
          break
        case 'year':
          timeFormat = `yyyy`
        // case 'datetime':
        //   timeFormat = 'yyyy-MM-dd HH:mm'
        //   break
      }

      const timeFormatForDaysJs = timeFormat.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
      const timeFormatForDateFns = timeFormat.replace(/yyyy/g, 'yyyy').replace(/dd/g, 'dd')

      return {timeFormatForDaysJs, timeFormatForDateFns}
    },
  }

  static validate = {
    isDate: (value: any): boolean => {
      return value && dayjs(value).isValid()
    },

    isSameDate: (dt1: Date, dt2: Date): boolean => {
      return dayjs(dt1).startOf('day').isSame(dayjs(dt2).startOf('day'))
    },

    isSameMonth: (dt1: Date, dt2: Date): boolean => {
      return dayjs(dt1).startOf('month').isSame(dayjs(dt2).startOf('month'))
    },

    isUtc: (date: Date): boolean => {
      return date.toISOString().includes('Z')
    },
  }

  static helper = {
    minus9HoursOnServer: (date: Date): Date => {
      if (isServer) {
        return toUtc(date)
      }
      return date
    },
  }

  static calcAge = (birthday: DateInput): number => {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }
}

export const localeDateOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  weekday: 'short',
}
