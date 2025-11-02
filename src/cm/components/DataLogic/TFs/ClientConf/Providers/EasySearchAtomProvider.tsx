'use client'

import {createContext} from 'react'
import {prismaDataType} from '@cm/types/types'

type context = {
  initiateEsAtomProvider?: any
  prismaDataExtractionQuery: any
  easySearchObject: any
  easySearchWhereAnd: any
  DetailePageId: number | undefined
  easySearchPrismaDataOnServer: any
  prismaData: prismaDataType
}

export const EasySearchAtomContext = createContext<context>({
  prismaDataExtractionQuery: undefined,
  easySearchObject: undefined,
  easySearchWhereAnd: undefined,
  DetailePageId: undefined,
  easySearchPrismaDataOnServer: {},
  prismaData: {
    records: [],
    totalCount: 0,
    loading: true,
    beforeLoad: true,
    noData: false,
  },
})

export const EasySearchAtomProvider = props => props.children
export default EasySearchAtomProvider
