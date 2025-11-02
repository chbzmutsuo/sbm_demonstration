import React, {useState} from 'react'
import DatePicker, {registerLocale} from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import {Days} from '@cm/class/Days/Days'

import {anyObject} from '@cm/types/utility-types'
import {cl} from 'src/cm/lib/methods/common'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {ja} from 'date-fns/locale' // import the Japanese locale
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
registerLocale('ja', ja)

const MainDatePicker = (props: anyObject) => {
  const {col, formProps, setIsOpen, field, useResetValue, selectedDate, handleDateChange} = props

  let varingProps: anyObject = {
    placeholderText: '日付を入力',
    showTimeSelect: false,
  }

  const {timeIntervals = 5} = col?.datePicker ?? {}

  const [isValid, setisValid] = useState(true)
  const [directInput, setDirectInput] = useState('')
  const [inputError, setInputError] = useState('')

  switch (col.type) {
    case 'month':
      {
        varingProps = {
          ...varingProps,
          placeholderText: '月を入力',
          showTimeSelect: false,
          showMonthYearPicker: true,
        }
      }
      break

    case 'year':
      {
        varingProps = {
          ...varingProps,
          placeholderText: '年を入力',
          showYearPicker: true,
        }
      }
      break
  }

  const timeFormat = Days.time.getTimeFormat(col.type).timeFormatForDateFns
  const displayProps = {
    showIcon: false,
    timeCaption: '時刻',
    locale: 'ja',
    minDate: new Date(1900, 0, 1),
    maxDate: new Date(2200, 11, 31),
    formatDate: timeFormat,
    timeFormat: 'HH:mm',
    timeIntervals,
    showMonthDropdown: true,
    showYearDropdown: true,

    withPortal: false, // ポータルを無効にして入力フィールドが操作可能にする
    fixedHeight: true,
  }

  const customStyleProps = {
    className: cl('custom-datepicker', formProps.className),
    dayClassName: (date: Date) => {
      let dateClass = `  text-[.9375rem] `
      Days.validate.isSameDate(date, getMidnight()) && (dateClass += `bg-yellow-400 `)
      formatDate(date, 'ddd') === '土' && (dateClass += `  `)
      formatDate(date, 'ddd') === '日' && (dateClass += `  `)
      return dateClass
    },

    timeClassName: (time: Date) => {
      const timeClassName = `text-center  `
      const affix = time.getHours() > 12 ? 'text-success-main' : 'text-error-main'
      return timeClassName + affix
    },
  }

  const dateProps = {
    selected: Days.validate.isDate(selectedDate) ? selectedDate : null,
    onChange: handleDateChange,
  }

  // 8桁数値入力のバリデーション関数
  const validateDirectInput = (input: string): {isValid: boolean; date?: Date; error?: string} => {
    // 数字以外を除去
    const numericInput = input.replace(/[^0-9]/g, '')

    if (numericInput === '') {
      return {isValid: true}
    }

    // 8桁でない場合
    if (numericInput.length !== 8) {
      return {isValid: false, error: '8桁の数字で入力してください (例: 20231025)'}
    }

    // YYYYMMDD形式として解析
    const year = parseInt(numericInput.substring(0, 4))
    const month = parseInt(numericInput.substring(4, 6))
    const day = parseInt(numericInput.substring(6, 8))

    // 基本的な範囲チェック
    if (year < 1900 || year > 2200) {
      return {isValid: false, error: '年は1900年から2200年の間で入力してください'}
    }

    if (month < 1 || month > 12) {
      return {isValid: false, error: '月は01から12の間で入力してください'}
    }

    if (day < 1 || day > 31) {
      return {isValid: false, error: '日は01から31の間で入力してください'}
    }

    // Daysクラスを使用して日付を生成
    try {
      const daysInstance = new Days(numericInput)
      const date = daysInstance.value

      // 日付が有効かチェック
      if (!Days.validate.isDate(date)) {
        return {isValid: false, error: '有効な日付ではありません'}
      }

      // 入力した数値と実際の日付が一致するかチェック（例：2月30日のような無効日付を除外）
      const actualYmd = Days.parser.getDate(date).ymd
      if (actualYmd !== numericInput) {
        return {isValid: false, error: '存在しない日付です'}
      }

      return {isValid: true, date}
    } catch (error) {
      return {isValid: false, error: '日付の解析に失敗しました'}
    }
  }

  // 8桁数値入力のハンドラー
  const handleDirectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDirectInput(value)

    const validation = validateDirectInput(value)

    if (validation.isValid && validation.date) {
      handleDateChange(validation.date)
      setInputError('')
    } else if (validation.error) {
      setInputError(validation.error)
    } else {
      setInputError('')
    }
  }

  // 8桁数値入力のEnterキーハンドラー
  const handleDirectInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const validation = validateDirectInput(directInput)
      if (validation.isValid && validation.date) {
        handleDateChange(validation.date)
        setIsOpen(false)
      }
    }
  }

  return (
    <div className="relative z-1000">
      {' '}
      {/* z-indexを明示的に設定 */}
      <C_Stack className="gap-4 items-center">
        {/* ボタンエリア */}
        <div className="flex gap-2 justify-between">
          <Button
            type="button"
            size="sm"
            color={`red`}
            onClick={() => {
              useResetValue({col, field})
              setIsOpen(false)
            }}
          >
            取り消し
          </Button>

          <Button
            type="button"
            size="sm"
            color={`blue`}
            onClick={() => {
              if (directInput) {
                const validation = validateDirectInput(directInput)
                if (validation.isValid && validation.date) {
                  handleDateChange(validation.date)
                  setIsOpen(false)
                }
              }
            }}
          >
            適用
          </Button>
        </div>

        {/* 8桁数値入力フィールド - 最前面に配置 */}
        <div
          className="relative z-[1001] p-1 "
          style={{position: 'relative', zIndex: 1001}} // インラインスタイルでも確実に設定
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">8桁数値で直接入力 (例: 20231025)</label>
          <input
            type="text"
            value={directInput}
            onChange={handleDirectInputChange}
            onKeyDown={handleDirectInputKeyDown}
            placeholder="YYYYMMDD"
            className="relative z-[1002] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={8}
            style={{
              position: 'relative',
              zIndex: 1002,
              pointerEvents: 'auto', // 明示的にポインターイベントを有効化
              touchAction: 'manipulation', // タッチデバイスでの操作を改善
            }}
            autoComplete="off"
          />
          {inputError && <p className="mt-1 text-sm text-red-600">{inputError}</p>}
          {directInput && !inputError && (
            <p className="mt-1 text-sm text-green-600">
              {(() => {
                const validation = validateDirectInput(directInput)
                if (validation.isValid && validation.date) {
                  return `変換結果: ${formatDate(validation.date, 'YYYY年MM月DD日(ddd)')}`
                }
                return ''
              })()}
            </p>
          )}
        </div>

        {/* カレンダー部分 */}
        <div className="relative z-[999]">
          <DatePicker inline {...displayProps} {...varingProps} {...dateProps} {...customStyleProps} dropdownMode="select" />
        </div>

        {isValid === false && (
          <div className="absolute left-1/2 top-12 w-full -translate-x-1/2 text-center z-[998]">
            <p>YYYY-MM-DDまたは8桁の数字で入力</p>
            <ul>
              <li></li>
            </ul>
          </div>
        )}
      </C_Stack>
    </div>
  )
}

export default MainDatePicker
