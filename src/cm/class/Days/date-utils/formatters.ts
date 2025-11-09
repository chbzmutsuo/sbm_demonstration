import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/ja'
import {breakLines} from 'src/cm/lib/value-handler'
import {arrToLines} from 'src/cm/components/utils/texts/MarkdownDisplay'
import {DateInput} from '@cm/class/Days/date-utils/date-utils-type'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')
dayjs.tz.setDefault('Asia/Tokyo')

export type TimeFormatType =
  | string
  | 'YYYY'
  | 'MM'
  | 'YYYYMM'
  | 'YYYYMMDDHHmmss'
  | 'YYYY-MM'
  | 'YYYY-MM-DD(ddd)'
  | 'YYYY-MM-DD(ddd) HH:mm:ss'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD(ddd) HH:mm'
  | 'HH:mm'
  | 'M/D(ddd)'
  | 'MM-DD(ddd)'
  | 'MM-DD HH:mm'
  | 'M-D'
  | 'D'
  | 'YYYY/MM/DD'
  | 'YY/MM/DD'
  | 'YY-MM-DD'
  | 'YY-MM-DD(ddd)'
  | 'YY-M-D(ddd)'
  | 'MM-DD'
  | 'YYYY-MM-DD'
  | 'ddd'
  | '(ddd)'
  | 'iso'
  | 'short'
  | 'japan'
  | 'japan-iso'
  | 'D(ddd)'
  | 'YY年M月'
  | 'YYYY年'
  | 'YYYY年MM月'
  | 'YYYY年mm月'
  | 'M月D日(ddd)'
  | 'MM月DD日(ddd)'
  | 'DD日(ddd)'
  | 'YYYY年M月D日(ddd)'
  | 'YY年M月D日'
  | 'YY年M月D日(ddd)'
  | 'YYYY年MM月DD日(ddd)'
  | 'M'
  | `YY/M/D(ddd)`

export const formatDate = (
  dateObject?: Date | string | number | undefined | null,
  format?: TimeFormatType | TimeFormatType[],
  log = false
) => {
  const originalValue = dateObject
  format = format ?? 'YYYY-MM-DD'

  // dateObject = dateObject ? new Date(dateObject ?? '') : ``
  if (dateObject) {
    dateObject = new Date(dateObject)
  }

  if (!isValidDate(dateObject)) {
    return originalValue ? String(originalValue) : null
  }

  const FORMATTER = (value: Date, f: TimeFormatType): string => {
    const dateObj = new Date(value)
    try {
      const result = dayjs(dateObj).tz('Asia/Tokyo').format(f)
      return result
    } catch (error) {
      throw new Error(`formatDate: ${error}`)
    }
  }

  let result
  if (format === 'iso') {
    result = dayjs(dateObject).format() as unknown as Date
  } else if (format === 'short') {
    result = dayjs(dateObject).format(`.YY/MM/DD(ddd)`) as string
  } else {
    if (Array.isArray(format)) {
      const toMarkDown = arrToLines(format.map(f => FORMATTER(dateObject, f)))
      const toElementsArr = breakLines(toMarkDown)
      result = toElementsArr
    } else {
      result = FORMATTER(dateObject, format)
    }
  }

  if (result === 'Invalid Date') return originalValue ? String(originalValue) : null

  return result
}

export const formatDateTimeOrDate = (date: Date) => {
  if (!date) return undefined
  const toMinutes = formatDate(date, `YYYY/MM/DD(ddd) HH:mm`)
  if (toMinutes && toMinutes.includes(`00:00`)) {
    return formatDate(date, `YYYY/MM/DD(ddd)`) || ''
  } else {
    return toMinutes || ''
  }
}

export const displayDateInTwoLine = (value: string = '2023-01-01'): string => {
  const numberMatch = String(value).match(/\d*\d/g)

  const [year, month, day] = numberMatch ?? []
  const date = String(value).match(/\(.+\)/)?.[0]

  let displayValue = ``

  if (year && month && !day) {
    displayValue = `${year}年${month}月`
  } else if (!year && month && day) {
    displayValue = `${month}月${day}日`
  } else if (year && month && day) {
    displayValue = `${year}年\n${month}月${day}日`
  }

  if (date) {
    displayValue += `${date}`
  }

  return displayValue
}

export const toIsoDateIfExist = (value: DateInput) => {
  return value && isValidDate(value) ? formatDate(value, `iso`) || null : null
}

// バリデーション関数（他のファイルから移動）
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}
