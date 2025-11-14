import {createHiddenValuesFromLetterCount, drillDownNestedValue} from 'src/cm/lib/value-handler'
import {cl, toJson} from 'src/cm/lib/methods/common'

import React from 'react'

import SlateEditor from 'src/cm/components/SlateEditor/SlateEditor'
import {MarkDownDisplay} from 'src/cm/components/utils/texts/MarkdownDisplay'
import {CssString} from 'src/cm/components/styles/cssString'
import JsonFormatter from 'react-json-formatter'
import {formatDate, TimeFormatType} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'

export const getValue = ({col, record, dataModelName, mutateRecords, tdStyle}) => {
  /**基本的な変換 */
  const convertValueBasic = () => {
    const timeFormat = Days.time.getTimeFormat(col?.type ?? '').timeFormatForDaysJs as TimeFormatType
    let value = drillDownNestedValue(col, record)

    value = value ?? ''

    if (col?.format) {
      value = col?.format(value, record, col)
    } else if (col.type === 'password') {
      value = createHiddenValuesFromLetterCount(`password`)
    } else if (timeFormat) {
      const format = col?.type === 'date' ? 'short' : timeFormat

      value = value ? formatDate(value, format) : ''
    } else if (col?.type === 'price') {
      value = [null, undefined].includes(value)
        ? undefined
        : !isNaN(Number(value))
          ? '￥' + Number(value).toLocaleString()
          : value
    } else if (col?.type === 'boolean') {
      value = <input type="checkbox" checked={value === true} onChange={e => undefined} />
    } else if (col?.type === `slate` && toJson(value) && value) {
      const initialValue = JSON.parse(value)

      value = (
        <div className={` pointer-events-none `}>
          <SlateEditor {...{initialValue, readOnly: true}} />
        </div>
      )
    } else if (col?.type === `textarea`) {
      value = typeof value === `string` ? <MarkDownDisplay>{value}</MarkDownDisplay> : value
    } else if (col.type === 'json') {
      return String(JSON.stringify(value))
      return <JsonFormatter json={value} />
    }

    if (typeof value === `function`) {
      return value({record, dataModelName, mutateRecords, tdStyle})
    }

    return <div className={cl(CssString.border.dottedBottom)}>{value}</div>
  }

  const value = convertValueBasic()

  return value
}
