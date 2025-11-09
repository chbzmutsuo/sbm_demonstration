import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'

export type transposeColumnsOptionProps = {
  autoSplit?: {
    table?: number
    form?: number
  }
} & anyObject

export type optionsOrOptionFetcherProps = {
  latestFormData?: anyObject
  col: colType
  // additionalQuery?: anyObject
}

export type optionsOrOptionFetcherType = (
  props: optionsOrOptionFetcherProps
) => Promise<{optionObjArr: optionType[]; modelName?: string}>

export type optionType = {
  id?: any
  label?: string
  value: string
  color?: string
} & anyObject
