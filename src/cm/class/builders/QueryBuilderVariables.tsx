import {getRelationalModels, getSchema} from 'src/cm/lib/methods/prisma-schema'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {anyObject} from '@cm/types/utility-types'
import {CSSProperties} from 'react'
import {Prisma, PrismaClient} from '@prisma/client'
import {dataCountObject} from '@cm/components/DataLogic/TFs/Server/fetchers/EasySearchDataSwrFetcher'
import {AccordiongPropType} from '@cm/components/utils/Accordions/Accordion'

export const SORT_ARGS = {orderBy: [{sortOrder: 'asc'}, {id: 'asc'}]}

export type getIncludeType = {[key in PrismaModelNames]?: Prisma.Args<PrismaClient, 'findMany'>}
export type includeProps = {
  session?: anyObject
  query?: anyObject
  QueryBuilderExtraProps?: anyObject
}

export const roopMakeRelationalInclude = ({parentName, parentObj}) => {
  const schemaAsObj = getSchema()

  const {singleAttributeObj, hasManyAttributeObj, hasOneAttributeObj} = getRelationalModels({
    schemaAsObj,
    parentName,
  })

  const relationalObj = {...hasManyAttributeObj, ...hasOneAttributeObj}
  const hasInclude = parentObj.include
  if (hasInclude) {
    Object.keys(parentObj.include).forEach(key => {
      if (relationalObj[key]?.relationalType === 'hasMany') {
        if (parentObj.include[key].orderBy === undefined) {
          parentObj.include[key] = {...parentObj.include[key], ...SORT_ARGS}

          roopMakeRelationalInclude({
            parentName: key,
            parentObj: parentObj.include[key],
          })
        }
      }
    })
  }
  return parentObj
}

export type EasySearchObjectExclusiveGroup<
  T extends string = string,
  CONDITION extends object = {
    [key: string]: any
  },
> = {[key in T]?: EasySearchObjectAtom<CONDITION>}

export type EasySearchObjectAtom<
  CONDITION extends object = {
    [key: string]: any
  },
> = {
  label: string
  CONDITION?: CONDITION
  description?: string
  exclusiveTo?: boolean
  notify?: boolean | CSSProperties
  refresh?: boolean
  sql?: string
  keyValueList?: {key: string; value: boolean | string}[]
}

export const getEasySearchPrismaDataOnServer = ({query, dataModelName, easySearchObject, additionalWhere, searchQueryAnd}) => {
  // アクティブなeasy search objectに限定する
  const availableEasySearchObj = (() => {
    const activeEasySearchObject = {...easySearchObject}

    Object.keys(easySearchObject ?? {}).filter(key => {
      const {exclusiveTo} = easySearchObject[key]

      if (exclusiveTo === false) {
        delete activeEasySearchObject[key]
      }
    })
    return activeEasySearchObject
  })()

  const queryArrays = (() => {
    const filterKeyArr = Object.values(availableEasySearchObj)
    const queryArrays = Object.keys(availableEasySearchObj).map(key => {
      const thisEasySearchObj: EasySearchObject = availableEasySearchObj[key]

      let selfKeyValueQuery = {}

      thisEasySearchObj.keyValueList?.forEach(obj => {
        selfKeyValueQuery = {...selfKeyValueQuery, [obj.key]: obj.value}
      })

      const tmpQuery = (() => {
        let tmpQuery = {} //これでカウントを検索

        /**アクティブかつ、他グループのkeyValuesを取得 */
        const keyValuesFromOtherExclusiveGroup = (() => {
          const keyValuesFromOtherExclusiveGroup = filterKeyArr
            .filter((obj: EasySearchObject) => {
              const {keyValueList} = obj
              const queryKey = keyValueList[0]?.key
              const isActive = query?.[queryKey]
              const isFromOtherGroup = obj.exclusiveGroup.groupIndex !== thisEasySearchObj.exclusiveGroup.groupIndex
              return isActive && isFromOtherGroup
            })
            .map((obj: EasySearchObject) => obj?.keyValueList)
          return keyValuesFromOtherExclusiveGroup
        })()

        const totalKeyValueList: any[] = []
        thisEasySearchObj?.keyValueList.forEach(obj => {
          totalKeyValueList.push(obj)
        })

        keyValuesFromOtherExclusiveGroup?.forEach((keyValues: any[]) => {
          keyValues.forEach((obj: anyObject) => {
            totalKeyValueList.push(obj)
          })
        })

        /**keyValuesを元にtmpQueryを作成 */
        totalKeyValueList.forEach((obj: anyObject) => {
          const {key, value} = obj

          tmpQuery = {...tmpQuery, [key]: value}
        })

        return tmpQuery
      })()

      const whereAnd = getEasySearchWhereAnd({
        easySearchObject,
        query: thisEasySearchObj?.refresh ? selfKeyValueQuery : tmpQuery,
        additionalWhere,
      })

      return {key, dataModelName, where: {AND: [...whereAnd, ...searchQueryAnd]}, select: {id: true}}
    })

    return queryArrays
  })()

  return {queryArrays, availableEasySearchObj}
}

export const getEasySearchWhereAnd = ({easySearchObject, query, additionalWhere}) => {
  const result: any[] = []

  Object.keys(easySearchObject ?? {}).map(key => {
    const condition = easySearchObject[key].CONDITION

    if (condition === undefined) return

    if (key && query?.[key]) {
      result.push(condition)
    }
  })

  Object.keys(additionalWhere ?? {}).map(key => {
    const condition = additionalWhere?.[key]
    if (condition === undefined) return
    result.push({[key]: condition})
  })

  return result
}

export const Ex_exclusive0 = {
  reset: {
    label: '全て',
    notify: false,
    description: '',
    keyValueList: [{key: 'reset', value: true}],
    exclusiveTo: true,
    CONDITION: {},
  },
}

export type easySearchType = {
  session?: any
  query?: any
  additionalWhere?: anyObject
  dataModelName?: PrismaModelNames
  easySearchExtraProps?: anyObject
}

export type easySearchMethodType = (props: easySearchType) => {
  [key in PrismaModelNames]?: (props?: any) => {
    [key in string]: EasySearchObject
  }
}

export type easySearchSingleObject = {
  label: string
  notify: boolean
  description: string
  keyValueList: {key: string; value: boolean}[]
  exclusiveTo: boolean
  CONDITION: anyObject
}

export type EasySearchObject = EasySearchObjectAtom & {
  id: string
  exclusiveGroup: {groupIndex: number; name: string}
  keyValueList: anyObject[]
}

export type exclusiveGroupObj = {[key in string]: EasySearchObjectAtom}

export type makeEasySearchGroupsPropOptions = {accordion?: AccordiongPropType}
export type makeEasySearchGroupsProp = {
  exclusiveGroup: exclusiveGroupObj
  groupIndex?: number
  rowGroupIdx?: number
  options?: makeEasySearchGroupsPropOptions
  name: string
  additionalProps?: {
    showAsModal?: boolean
    refresh?: boolean
    [key: string]: any
  }
}

export type easySearchDataSwrType = {
  dataCountObject: dataCountObject
  availableEasySearchObj: EasySearchObject | null
  loading?: boolean
  noData?: boolean
  beforeLoad?: boolean
}

export const makeEasySearchGroups = (array: makeEasySearchGroupsProp[]) => {
  const result = {}

  const dataArr = array
    .map((d, i) => {
      const origin = {...d}

      const {name, additionalProps, groupIndex = i, rowGroupIdx, options} = origin

      const easySearchGroup = origin.exclusiveGroup
      const additionalPropsToAdd = {exclusiveGroup: {groupIndex, name, rowGroupIdx}, ...additionalProps}

      const data = addExvlusiveGroup(easySearchGroup, additionalPropsToAdd)
      return data
    })
    .flat()

  dataArr.forEach(obj => {
    result[obj?.id ?? ''] = obj
  })

  return result
}

const addExvlusiveGroup = (easySearchGroup, additionalPropsToAdd?: anyObject) => {
  const toArr = Object.keys(easySearchGroup).map(key => {
    const objectContent = {...easySearchGroup[key]}

    const defaultKeyValueList = [{key: key, value: true}]
    const {notify = false, exclusiveTo = true, label} = objectContent

    const keyValueList = objectContent?.keyValueList ?? defaultKeyValueList

    // default値をここで設定する
    const value = {...easySearchGroup[key], id: key, notify, exclusiveTo, keyValueList}

    return value
  })

  return toArr.map((obj: EasySearchObjectAtom) => {
    const result = {...obj, ...additionalPropsToAdd}

    return result
  }) as EasySearchObject[]
}

export const toRowGroup = (rowGroupIdx = 2, dataArr, exclusiveGroups: makeEasySearchGroupsProp[]) => {
  exclusiveGroups.forEach(group => {
    const {exclusiveGroup, name, additionalProps} = group

    dataArr.push({
      exclusiveGroup,
      name,
      rowGroupIdx,
      additionalProps,
    })
  })
}

export const makeExGroup = (esObj: anyObject) => {
  const result = {}
  Object.keys(esObj).forEach(str => {
    if (!str.includes(`__`)) {
      throw new Error(`str is not include __`)
    }
    const item = esObj[str]

    item.keyValueList = item.keyValueList ?? [{key: str, value: true}]

    const [key, value] = str.split(`__`)
    if (result[key] === undefined) {
      result[key] = {}
    }
    result[key][str] = item
  })
  return result
}
