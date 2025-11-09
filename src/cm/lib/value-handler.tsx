import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {TimeFormatType} from '@cm/class/Days/date-utils/formatters'
import {CSSProperties} from 'react'
import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'

export const breakLines = (
  text: any,
  options?: {
    style?: CSSProperties
  }
) => {
  if (typeof text === 'string' || typeof text === 'number') {
    return String(text)
      .split(/\n|\r/)
      .map((str, i) => {
        return (
          <div className={` text-start leading-6`} style={{...options?.style}} key={i}>
            {str}
          </div>
        )
      })
  } else {
    return text
  }
}

export const drillDownNestedValue = (col: colType, row: anyObject) => {
  /**通常処理（〜Idを持たない） */
  const split = col?.id?.split('Id')

  if (split) {
    if (split?.length === 1) {
      return row[col?.id]
    }
  }
}

export const createHiddenValuesFromLetterCount = (value: any) => {
  let hiddenValues = ''
  for (let i = 0; i < value?.length; i++) {
    hiddenValues += '*'
  }

  return hiddenValues
}
export const switchValueByType = ({col, value, record}) => {
  value = drillDownNestedValue(col, record)
  const formatFunction = col?.td?.format ?? col?.format
  const timeFormat = Days.time.getTimeFormat(col.type).timeFormatForDaysJs as TimeFormatType
  // const formatFunction = col?.format

  if (col.type === 'password') {
    value = createHiddenValuesFromLetterCount(value)
  } else if (timeFormat) {
    value = value ? formatDate(value, timeFormat) : ''
  } else if (col?.type === 'price') {
    value = [null, undefined].includes(value) ? undefined : '￥' + Number(value).toLocaleString()
  } else if (col?.type === 'boolean') {
    value = <input type="checkbox" checked={value} onChange={e => undefined} />
  }

  value = breakLines(value)
  return value
}
