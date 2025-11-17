'use client'
import {Fields} from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React, {useCallback, useMemo, useRef} from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'
import {ChevronsLeft, ChevronsRight} from 'lucide-react'
import {colType} from '@cm/types/col-types'

interface DateSwitcherProps {
  additionalCols?: colType[]
  selectPeriod?: boolean
  selectMonth?: boolean
  monthOnly?: boolean
  yearOnly?: boolean
}

interface QueryInfo {
  noValue: boolean
  from: Date | null
  to: Date | null
  defaultValue: {from: Date | null; to: Date | null}
}

interface ColumnBaseParams {
  addMinusMonth: (plus?: number) => void
  addMinusDate: (plus?: number) => void
  selectPeriod?: boolean
  selectMonth?: boolean
  monthOnly?: boolean
  yearOnly?: boolean
}

export default function useDateSwitcherFunc(props: DateSwitcherProps) {
  const {query, addQuery, toggleLoad} = useGlobal()

  // FormHookの参照を保持するためのref
  const formHookRef = useRef<any>(null)

  // additionalColsから追加のペイロードを取得する関数をメモ化
  const getAdditionalPayload = useCallback(
    (data: any) => Object.fromEntries(props.additionalCols?.map(col => [col.id, data[col.id]]) ?? []),
    [props.additionalCols]
  )

  // 追加のデフォルト値をメモ化
  const additionalDefaultValue = useMemo(
    () => Object.fromEntries(props?.additionalCols?.map(col => [col.id, query[col.id]]) ?? []),
    [props.additionalCols, query]
  )

  // クエリ情報をメモ化
  const queryInfo = useMemo(() => getQueryInfo({query}), [query])
  const {noValue, from, to, defaultValue} = queryInfo

  // 日付範囲切り替え関数
  const switchFromTo = useCallback(
    (data: any) => {
      toggleLoad(
        async () => {
          const newQuery: Record<string, string | undefined> = {}
          Object.keys(data).forEach(key => {
            const value = data[key]
            newQuery[key] = value && Days.validate.isDate(value) ? formatDate(value) : undefined
          })

          addQuery({...newQuery, ...getAdditionalPayload(data)})
        },
        {refresh: false, mutate: false}
      )
    },
    [addQuery, getAdditionalPayload, toggleLoad]
  )

  // 月切り替え関数
  const switchMonth = useCallback(
    (data: any) => {
      toggleLoad(
        async () => {
          const month = data.month
          if (!month) {
            addQuery({month: undefined, ...getAdditionalPayload(data)})
            return
          }

          const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(toUtc(month))

          // FormHookが利用可能な場合のみsetValueを実行
          if (formHookRef.current?.ReactHookForm) {
            formHookRef.current.ReactHookForm.setValue('from', firstDayOfMonth)
            formHookRef.current.ReactHookForm.setValue('to', lastDayOfMonth)
            formHookRef.current.ReactHookForm.setValue('month', null)
          }

          const newQuery = {
            from: formatDate(firstDayOfMonth),
            to: formatDate(lastDayOfMonth),
            month: formatDate(month),
          }
          addQuery({...newQuery, ...getAdditionalPayload(data)})
        },
        {refresh: false, mutate: false}
      )
    },
    [addQuery, getAdditionalPayload, toggleLoad]
  )

  // 日付切り替え関数
  const switchDate = useCallback(
    (data: any) => {
      toggleLoad(
        async () => {
          const date = data.date
          if (!date) {
            addQuery({date: undefined, ...getAdditionalPayload(data)})
            return
          }

          // FormHookが利用可能な場合のみsetValueを実行
          if (formHookRef.current?.ReactHookForm) {
            formHookRef.current.ReactHookForm.setValue('from', date)
            formHookRef.current.ReactHookForm.setValue('to', date)
          }

          const newQuery = {
            from: formatDate(date),
            to: formatDate(date),
          }
          addQuery({...newQuery, ...getAdditionalPayload(data)})
        },
        {refresh: false, mutate: false}
      )
    },
    [addQuery, getAdditionalPayload, toggleLoad]
  )

  // 月の加算/減算関数をメモ化
  const addMinusMonth = useCallback(
    (plus = 1) => {
      const currentMonth = new Date(formHookRef.current?.latestFormData?.from || new Date())
      const month = Days.month.add(currentMonth, plus)
      if (Days.validate.isDate(month)) {
        switchMonth({month, ...additionalDefaultValue})
      }
    },
    [switchMonth, additionalDefaultValue]
  )

  // 日付の加算/減算関数をメモ化
  const addMinusDate = useCallback(
    (plus = 1) => {
      const currentDate = new Date(formHookRef.current?.latestFormData?.from || new Date())
      const date = Days.day.add(currentDate, plus)
      if (Days.validate.isDate(date)) {
        switchDate({date, ...additionalDefaultValue})
      }
    },
    [switchDate, additionalDefaultValue]
  )

  // カラムをメモ化（循環依存を避けるため）
  const columns = useMemo(() => {
    const columnsBase = getColumnBase({
      addMinusMonth,
      addMinusDate,
      ...props,
    })

    const cols = [...columnsBase, ...(props.additionalCols ?? [])]
    return Fields.transposeColumns(cols)
  }, [props, additionalDefaultValue, addMinusMonth, addMinusDate])

  // FormHookの初期化
  const FormHook = useBasicFormProps({
    columns,
    formData: {...defaultValue, ...additionalDefaultValue},

    onFormItemBlur: useCallback(
      async ({value, name, id, e, newlatestFormData: data, ReactHookForm}) => {
        const isEqual = Object.keys(data).every(key => {
          const value1 = formatDate(data[key])
          const value2 = query[key]
          return value1 === value2
        })

        if (!isEqual) {
          name === 'month' ? switchMonth(data) : switchFromTo(data)
        }
      },
      [query, switchMonth, switchFromTo]
    ),
  })

  // FormHookの参照を更新
  formHookRef.current = FormHook

  return {
    noValue,
    FormHook,
    from,
    to,
    switchMonth,
    addMinusMonth,
    switchFromTo,
  }
}

// カラムベース生成関数を最適化
const getColumnBase = ({
  addMinusMonth,
  addMinusDate,
  selectPeriod = false,
  selectMonth = false,
  monthOnly = false,
  yearOnly = false,
}: ColumnBaseParams) => {
  const columnsBase: any = {
    from: {
      id: 'from',
      label: selectPeriod ? 'から' : monthOnly || yearOnly ? '' : '',
      type: monthOnly ? 'month' : yearOnly ? 'year' : 'date',
      form: {
        register: {
          required: '日付を指定してください',
        },
        reverseLabelTitle: true,
        showResetBtn: monthOnly || yearOnly ? false : undefined,
        style: monthOnly || yearOnly ? {width: 155} : undefined,
      },
    },
  }

  // 期間選択の場合のtoカラム
  if (selectPeriod) {
    columnsBase.to = {
      id: 'to',
      label: 'まで',
      type: 'date',
      form: {
        reverseLabelTitle: true,
        register: {
          validate: (value: any, formValue: any) => {
            return value && formValue?.from && new Date(value) <= new Date(formValue?.from)
              ? '終了日は開始日より後の日付を指定してください'
              : undefined
          },
        },
      },
    }
  }

  // 月選択の場合のmonthカラム
  if (selectMonth) {
    columnsBase.month = {
      id: 'month',
      label: '月指定',
      type: 'month',
      form: {
        showResetBtn: false,
      },
      surroundings: {
        form: {
          left: <ChevronsLeft className="text-primary-main w-7 cursor-pointer" onClick={() => addMinusMonth(-1)} />,
          right: <ChevronsRight className="text-primary-main w-7 cursor-pointer" onClick={() => addMinusMonth(1)} />,
        },
      },
    }
  }

  // サラウンド要素の設定
  const getNavigationElements = () => {
    if (monthOnly) {
      return {
        left: <ChevronsLeft className="text-primary-main onHover w-7" onClick={() => addMinusMonth(-1)} />,
        right: <ChevronsRight className="text-primary-main onHover w-7" onClick={() => addMinusMonth(1)} />,
      }
    }

    if (yearOnly) {
      return {
        left: <ChevronsLeft className="text-primary-main w-7" onClick={() => addMinusMonth(-12)} />,
        right: <ChevronsRight className="text-primary-main w-7" onClick={() => addMinusMonth(12)} />,
      }
    }

    if (!selectPeriod) {
      return {
        left: <ChevronsLeft className="text-primary-main onHover w-7" onClick={() => addMinusDate(-1)} />,
        right: <ChevronsRight className="text-primary-main onHover w-7" onClick={() => addMinusDate(1)} />,
      }
    }

    return null
  }

  const navigationElements = getNavigationElements()
  if (navigationElements) {
    columnsBase.from.surroundings = {
      form: navigationElements,
    }
  }

  return Object.values(columnsBase) as colType[]
}

// クエリ情報取得関数を最適化
const getQueryInfo = ({query}: {query: any}): QueryInfo => {
  const noValue = !query.from && !query.to
  let from: Date | null = null
  let to: Date | null = null

  if (query.from) {
    from = new Date(query.from)
  } else if (query.month && noValue) {
    from = Days.month.getMonthDatum(new Date(query.month)).firstDayOfMonth
  } else {
    from = getMidnight(new Date())
  }

  if (query.to) {
    to = new Date(query.to)
  } else if (query.month && noValue) {
    to = Days.month.getMonthDatum(new Date(query.month)).lastDayOfMonth
  }

  return {
    noValue,
    from,
    to,
    defaultValue: {from, to},
  }
}
