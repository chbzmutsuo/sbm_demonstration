import {MyFormType} from '@cm/types/form-types'
import type {PrismaModelNames} from '@cm/types/prisma-types'
import {editTypePropType, additionalPropsType, PageBuilderGetterType, MyModalType, MyTableType} from '@cm/types/types'

import type {CSSProperties} from 'react'

export type surroundings = {
  table?: PageBuilderGetterType
  top?: PageBuilderGetterType
  right?: PageBuilderGetterType
  bottom?: PageBuilderGetterType
  left?: PageBuilderGetterType
  form?: PageBuilderGetterType
}

export type optionsType = {
  dataModelName?: string
  additional?: additionalPropsType
  surroundings?: surroundings
  editType?: editTypePropType
  ColBuilderExtraProps?: any
  PageBuilderExtraProps?: any
  QueryBuilderExtraProps?: any
  easySearchExtraProps?: any
  myForm?: MyFormType
  myTable?: MyTableType
  myModal?: MyModalType
  EditForm?: any
  PageBuilderGetter?: PageBuilderGetterType
  displayStyle?: CSSProperties
  redirectPath?: any
  methodsThroughClass?: {
    myFormCreate: {class: any; key: string}
  }
}

export type setParams = () => Promise<optionsType>

export type setCustomParamsType = {
  variants: {modelNames: PrismaModelNames[] | string[]; setParams: setParams}[]
  dataModelName: any
}
