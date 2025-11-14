import React from 'react'
import dynamic from 'next/dynamic'
import MyInput from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyInput/MyInput'

import {ControlContextType, ControlOptionType, formPropType} from '@cm/types/form-control-type'

import {colType} from '@cm/types/col-types'
import MyTextarea from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyTextarea'
import MyCheckBox from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyCheckBox/MyCheckBox'
import ErrorMessage from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/util-components/ErrorMessage'
import MyDatepicker from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyDatePIcker/MyDatepicker'
import MySelect from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/MySelect'

const Loader = () => <div className="animate-pulse bg-gray-200 h-10 rounded" />
const MyMdEditor = dynamic(() => import('@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyMdEditor'), {
  loading: Loader,
})
const MyFileControl = dynamic(
  () => import('@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyFileControl/MyFileControl'),
  {loading: Loader}
)

const MyMultipleChoice = dynamic(
  () => import('@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/MyMultipleChoice'),
  {loading: Loader}
)

export type ControlProps = {
  field: string
  latestFormData: any
  ReactHookForm: any
  Register: any
  col: colType
  currentValue: any
  formProps: formPropType

  extraFormState: any
  setextraFormState: any
  controlContextValue: ControlContextType
  ControlOptions: ControlOptionType
}

const Control = ({controlContextValue}) => {
  const {
    ReactHookForm,
    col,
    Register,
    ControlOptions,
    latestFormData,
    extraFormState,
    setextraFormState,
    currentValue,
    field,
    formProps,
    ControlStyle,
  } = controlContextValue

  col.type = col.inputTypeAs ?? col.type ?? 'text'
  const {type} = col

  const props: ControlProps = {
    field,
    latestFormData,
    ReactHookForm,
    Register,
    col,
    currentValue,
    formProps,
    extraFormState,
    setextraFormState,
    controlContextValue,
    ControlOptions,
  }

  return (
    <>
      <div style={{...ControlStyle}}>
        <Main {...{type, col, props}} />
        <ErrorMessage {...{controlContextValue}} />
      </div>
    </>
  )
}

export default Control

const Main = ({type, col, props}) => {
  if (type === 'slate') {
    return <MyMdEditor {...props} />
  }
  if (type === 'textarea') {
    return <MyTextarea {...props} />
  }

  if (type === 'boolean' || type === 'confirm') {
    return <MyCheckBox {...props} />
  }

  if (type === 'date' || type === 'month' || type === 'datetime' || type === 'year') {
    return <MyDatepicker {...props} />
  }

  if (col.multipleSelect) {
    return <MyMultipleChoice {...props}></MyMultipleChoice>
  } else if (col.forSelect) {
    return <MySelect {...{...props}} />
  }

  if (type === 'file') {
    return <MyFileControl {...props} />
  }

  return <MyInput {...props} />
}
