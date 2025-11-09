'use client'
import React from 'react'

import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'

export type GlobalIdSelectorProps = {
  columns: colType[][]
  options?: anyObject
  useGlobalProps: useGlobalPropType
}

const GlobalIdSelector = React.memo((props: GlobalIdSelectorProps) => {
  const {useGlobalProps, columns} = props
  const {query, addQuery, pathname} = useGlobalProps

  const defaultValues = Object.fromEntries(
    columns.flat().map(col => {
      const value = query[col.id]
      return [col.id, value]
    })
  )

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: defaultValues,
    autoApplyProps: {form: {}},
    onFormItemBlur: ({newlatestFormData}) => {
      addQuery(newlatestFormData)
    },
  })

  const ControlOptions = {
    ControlStyle: {width: 140, fontSize: 13, background: 'white'},
    LabelStyle: {fontSize: 13},
  }

  if (['/QRBP/engineer'].some(path => pathname.includes(path))) {
    return <></>
  }

  return (
    <div className={`min-w-10`}>
      <div className={`text-sm`}>
        <BasicForm latestFormData={latestFormData} alignMode="row" ControlOptions={ControlOptions}></BasicForm>
      </div>
    </div>
  )
})
export default GlobalIdSelector
