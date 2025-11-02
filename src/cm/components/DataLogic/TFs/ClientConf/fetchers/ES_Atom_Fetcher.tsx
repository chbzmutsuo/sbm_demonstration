'use server'

import {PrismaModelNames} from '@cm/types/prisma-types'

import {additionalPropsType, MyTableType} from '@cm/types/types'
import {anyObject} from '@cm/types/utility-types'

export type ES_Atom_FetcherProps = {
  DetailePageId
  // params: anyObject
  EasySearchBuilder: any
  dataModelName: PrismaModelNames
  additional: additionalPropsType
  myTable: MyTableType
  include: anyObject
  session: anyObject
  query: anyObject
  easySearchExtraProps: anyObject
}
export type dataCountObject = {
  [key: string]: number
}
