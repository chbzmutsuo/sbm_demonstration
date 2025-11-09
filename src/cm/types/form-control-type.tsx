import {useResetValueType} from 'src/cm/hooks/useBasicForm/BaiscForm'
import {useCacheSelectOptionReturnType} from 'src/cm/hooks/useCacheSelectOptions/useCacheSelectOptions'

import {CSSProperties} from 'react'
import {UseFormReturn} from 'react-hook-form'
import {colTypeStr, extraFormStateType} from '@cm/types/types'

import {anyObject} from '@cm/types/utility-types'
import {BaseColTypes} from '@cm/class/DataHandler/types'
import {colType} from '@cm/types/col-types'

export type liftUpNewValueOnChangeType = (props: {id: string; newValue: any; ReactHookForm: any}) => void

export type formPropType = {
  className: string
  type: colTypeStr
}

export type alignModeType = `row` | `rowBlock` | `col` | `grid` | `console`
export type ControlWrapperPropType = {
  formId: string
  formData: anyObject
  ControlStyle?: CSSProperties
  errorMessage: string | undefined

  field: any
  columns?: colType[][]
  col: colType
  ReactHookForm: UseFormReturn
  ControlOptions?: ControlOptionType
  latestFormData: anyObject
  extraFormState: extraFormStateType
  setextraFormState: React.Dispatch<React.SetStateAction<extraFormStateType>>
  Cached_Option_Props: useCacheSelectOptionReturnType
  useResetValue: useResetValueType
  // useGlobalProps: useGlobalPropType
  Register?: any
  currentValue?: any
  alignMode?: alignModeType
}

export type ControlContextType = ControlWrapperPropType & {
  ControlStyle: CSSProperties
  formId: string
  col: colType
  liftUpNewValueOnChange: liftUpNewValueOnChangeType
  currentValue: any
  isBooleanType: boolean
  Register: any
  formProps: formPropType
  Cached_Option_Props: useCacheSelectOptionReturnType
  wrapperId: string
  pointerClass: string
  type: BaseColTypes
}

export type ControlOptionType = {
  controllClassName?: string
  showLabel?: boolean
  showDescription?: boolean
  showErrorMessage?: boolean
  showResetBtn?: boolean
  LabelStyle?: CSSProperties
  ControlStyle?: CSSProperties
  direction?: string

  controlWrapperClassBuilder?: (props: {col: colType}) => any
}
