'use client'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {useEffect, useMemo, useCallback} from 'react'
import useDateSwitcherFunc from '@cm/components/utils/dates/DateSwitcher/useDateSwitcherFunc'
import {colType} from '@cm/types/col-types'
import {FitMargin} from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'

interface NewDateSwitcherProps {
  yearOnly?: boolean
  monthOnly?: boolean
  selectPeriod?: boolean
  selectMonth?: boolean
  additionalCols?: colType[]
}

const NewDateSwitcher = (props: NewDateSwitcherProps) => {
  const {query} = useGlobal()
  const {width} = useWindowSize()

  const {
    FormHook: {BasicForm, ReactHookForm, latestFormData},
    from,
    to,
  } = useDateSwitcherFunc(props)

  // レスポンシブ対応のControlOptionsをメモ化
  const controlOptions = useMemo(() => {
    const baseOptions = {
      ControlStyle: {
        width: width > 600 ? 190 : 145,
        fontSize: 14,
      },
    }

    if (width <= 600) {
      baseOptions.ControlStyle.fontSize = 14
    }

    return baseOptions
  }, [width])

  // setValue操作をメモ化してパフォーマンス向上
  const updateFormValues = useCallback(() => {
    if (from && ReactHookForm.getValues('from') !== from) {
      ReactHookForm.setValue('from', from)
    }
    if (to && ReactHookForm.getValues('to') !== to) {
      ReactHookForm.setValue('to', to)
    }
  }, [from, to, ReactHookForm])

  // queryの変更時のみ実行し、不要な再レンダリングを防ぐ
  useEffect(() => {
    updateFormValues()
  }, [query])

  return (
    <FitMargin>
      <BasicForm latestFormData={latestFormData} alignMode="row" ControlOptions={controlOptions} />
    </FitMargin>
  )
}

export default NewDateSwitcher
