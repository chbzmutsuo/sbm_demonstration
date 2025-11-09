// --- カラム型 ---
import type {CSSProperties} from 'react'
import type {acceptType} from '@cm/types/file-types'
import type {ControlContextType} from '@cm/types/form-control-type'
import type {dataFormatterType, onFormItemBlurType, JSXReturnFunc, registerType} from './utility-types'
import {forSelcetType, multipleSelectProps} from '@cm/types/select-types'
import {upsertControllerType} from '@cm/types/form-types'

export type colTypeStr =
  | 'json'
  | 'url'
  | 'text'
  | 'price'
  | 'ratio'
  | 'selectId'
  | 'number'
  | 'int'
  | 'datetime-local'
  | 'float'
  | 'date'
  | 'boolean'
  | 'rating'
  | 'time'
  | 'month'
  | 'year'
  | 'datetime'
  | 'color'
  | 'select'
  | 'file'
  | 'slate'
  | 'email'
  | 'password'
  | 'textarea'
  | 'confirm'
  | 'string'
  | 'review'
  | 'array'
  | 'rate'
  | ''

export type TdcreateFormPropss = {
  style?: CSSProperties | ((value, record) => any) | any
  hidden?: boolean
  rowSpan?: number
  colSpan?: number
  rowIndex?: any
  colIndex?: any
  reverseLabelTitle?: boolean
}

export type colTdProps = {
  withLabel?: boolean
  editable?: {
    upsertController?: upsertControllerType
    style?: CSSProperties
  }
  getRowColor?: dataFormatterType
  divider?: any
  linkTo?: {
    format?: dataFormatterType
    href?: (record: any) => string
  }
} & TdcreateFormPropss

export type colFormProps = {
  showResetBtn?: boolean
  placerHolder?: any
  file?: {
    accept?: acceptType
    backetKey: string
  }
  send?: boolean
  descriptionNoteAfter?: dataFormatterType | string
  style?: CSSProperties
  defaultValue?:
    | string
    | number
    | Date
    | boolean
    | null
    | ((props: {alreadyRegisteredFormData: any; formData: any; col: colType}) => any)
  register?: registerType
  editFormat?: (props: ControlContextType) => any
  addFormat?: JSXReturnFunc | any
  disabled?: boolean | ((props: {record: any; col: any}) => boolean)
} & TdcreateFormPropss

export type colTypeOptional = {
  isMain?: boolean
  surroundings?: {
    form?: {
      left?: any
      right?: any
    }
  }
  onFormItemBlur?: onFormItemBlurType
  type?: colTypeStr
  inputProps?: {
    step?: number
    min?: number
    required?: boolean
    placeholder?: string
  } & any
  inputTypeAs?: colTypeStr
  th?: {
    format?: (col: colType) => any
    style?: CSSProperties
    divider?: any
    hidden?: boolean
  }
  affix?: {
    label?: string
    prefix?: string
    suffix?: string
  }
  format?: dataFormatterType
  multipleSelect?: multipleSelectProps
  forSelect?: forSelcetType
  td?: colTdProps
  form?: colFormProps | null
  search?: any
  sort?: any
  originalColIdx?: number
}

export type colType = {
  id: string
  label: any
} & colTypeOptional
