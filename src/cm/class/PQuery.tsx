import {SearchQuery} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'
import {getDMMFModel, getRelationalModels} from 'src/cm/lib/methods/prisma-schema'
import {additionalPropsType, MyTableType} from '@cm/types/types'
import {anyObject} from '@cm/types/utility-types'
import {DH__switchColType} from '@cm/class/DataHandler/type-converter'
import {StrHandler} from '@cm/class/StrHandler'

// 型定義
interface WhereQueryItem {
  dataModelName: string
  colId: string
  searchType: string
  value: any
  dataType: string
}

interface PaginationProps {
  take: number
  skip: number
  page: number
  countPerPage: number
}

interface FlexQueryProps {
  tableId?: string
  query: anyObject
  dataModelName: string
  additional?: additionalPropsType
  myTable?: MyTableType
  take: number
  skip: number
  page: number
  disableOrderByFromUrlParams?: boolean
}

interface FlexQueryResult {
  AND: any[]
  orderBy: any[]
  page: number
  take: number
  skip: number
  from: number
}

interface SearchTypeConfig {
  label: string
}

interface RelationalIncludeProps {
  parentName: string
  parentObj: any
  schemaAsObj: any
  SORT: any
}

// 定数（メモ化で最適化）
export const defaultCountPerPage = 30
export const defaultOrderByArray = Object.freeze([{sortOrder: 'asc'}, {id: 'asc'}] as const)

// 検索タイプマスター（メモ化）
const searchTypeAndLabelMaster = Object.freeze({
  contains: {label: 'を含む'},
  equals: {label: 'と一致'},
  gte: {label: '以上'},
  lte: {label: '以下'},
} as const)

export class P_Query {
  /**
   * whereに関連するクエリキーを生成する（メモ化で最適化）
   */
  static create_where_colId_searchType_dataType_key = (() => {
    const cache = new Map<string, string>()

    return (col: {id: string; type?: string}, modelName: string, searchType: string): string => {
      const cacheKey = `${col.id}-${col.type}-${modelName}-${searchType}`

      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!
      }

      const colId = col.id
      const convertedDataType = DH__switchColType({type: col.type ?? ''})
      const result = `where-${modelName}-${colId}-${searchType}-${convertedDataType}`

      cache.set(cacheKey, result)
      return result
    }
  })()

  /**
   * whereに関連するクエリを取得する（効率化）
   */
  static getwhereRelatedQueries = (query: anyObject, dataModelName: string): WhereQueryItem[] => {
    const wherePrefix = 'where-'
    const idQueryKey = `where-${dataModelName}-id-equals-number`

    // 効率的なフィルタリング
    const whereRelatedQueries = Object.keys(query)
      .filter(key => key.startsWith(wherePrefix) && key.includes(dataModelName))
      .map(key => {
        const parts = key.split('-')
        if (parts.length >= 5) {
          const [, dataModelName, colId, searchType, dataType] = parts
          return {
            dataModelName,
            colId,
            searchType,
            value: query[key],
            dataType,
          }
        }
        return null
      })
      .filter(Boolean) as WhereQueryItem[]

    // ID検索の追加（重複チェック）
    if (query[idQueryKey] && !whereRelatedQueries.some(item => item.colId === 'id')) {
      whereRelatedQueries.push({
        dataModelName,
        colId: 'id',
        searchType: 'equals',
        value: query[idQueryKey],
        dataType: 'number',
      })
    }

    return whereRelatedQueries
  }

  /**
   * ページネーション設定を取得（型安全性向上）
   */
  static getPaginationPropsByQuery = ({
    query,
    tableId = '',
    countPerPage,
  }: {
    query: anyObject
    tableId?: string
    countPerPage?: number
  }): PaginationProps => {
    const defaultCount = process.env.NEXT_PUBLIC_ROOTPATH === 'aquapot' ? 10 : defaultCountPerPage
    const finalCountPerPage = countPerPage ?? defaultCount

    const page = Math.max(1, Number(query?.[`${tableId}_P`] ?? 1))
    const take = Math.max(1, Number(query?.[`${tableId}_T`] ?? finalCountPerPage))
    const skip = Math.max(0, Number(query?.[`${tableId}_S`] ?? 0))

    return {take, skip, page, countPerPage: finalCountPerPage}
  }

  /**
   * フレックスクエリ作成（最適化）
   */
  static createFlexQuery = (props: FlexQueryProps): FlexQueryResult => {
    const {dataModelName, additional, take, skip, page, disableOrderByFromUrlParams} = props

    if (disableOrderByFromUrlParams) {
      delete props.query.orderBy
    }

    // クエリのマージ（効率化）
    const mergedQuery = {...props.query, ...additional?.where}

    // AND条件の構築
    const searchAND = SearchQuery.createWhere({dataModelName, query: mergedQuery})
    const additionalAND = Object.entries(additional?.where ?? {}).map(([key, value]) => ({[key]: value}))
    const AND = [...searchAND, ...additionalAND]

    //OrderBy の構築（効率化）===
    const orderBy = [...(additional?.orderBy ?? []), ...defaultOrderByArray]
    if (mergedQuery?.orderBy) {
      // 動的ソートの追加
      const schema = getDMMFModel(StrHandler.capitalizeFirstLetter(dataModelName))
      const col = schema?.fields?.find(field => field.name === mergedQuery.orderBy)
      if (col) {
        if (col.isRequired) {
          orderBy.unshift({
            [mergedQuery.orderBy]: mergedQuery.orderDirection || 'asc',
          })
        } else {
          orderBy.unshift({
            [mergedQuery.orderBy]: {
              sort: mergedQuery.orderDirection || 'asc',
              nulls: 'last',
            },
          })
        }
      }

      // if (col) {
      //   orderBy.unshift({
      //     [mergedQuery.orderBy]: mergedQuery.orderDirection || 'asc',
      //   })
      // }
      // orderBy.unshift({
      //   [mergedQuery.orderBy]: mergedQuery.orderDirection || 'asc',
      //   // [mergedQuery.orderBy]: {
      //   //   sort: mergedQuery.orderDirection || 'asc',
      //   //   nulls: 'last',
      //   // },
      // })
    }

    const from = (page - 1) * take + 1

    return {AND, orderBy, page, take, skip, from}
  }

  /**
   * デフォルトOrderByを設定（再帰最適化）
   */
  static setDefaultOrderByInIncludeObject = (includeObject: any): any => {
    if (!includeObject || typeof includeObject !== 'object') {
      return includeObject
    }

    const include = {...includeObject}
    const processedKeys = new Set<string>()

    const setDefaultOrderBy = (targetModel: any, depth = 0): void => {
      // 無限再帰防止
      if (depth > 10 || !targetModel || typeof targetModel !== 'object') {
        return
      }

      for (const key in targetModel) {
        if (processedKeys.has(key)) continue
        processedKeys.add(key)

        const value = targetModel[key]
        if (!value || typeof value !== 'object') continue

        const isNoOrderProp = value.noOrder

        // noOrderプロパティの削除
        if (value.noOrder) {
          delete value.noOrder
        }

        // デフォルトorderByの設定
        if (value.orderBy === undefined && !isNoOrderProp) {
          value.orderBy = {sortOrder: 'asc'}
        }

        // 再帰処理
        if (value.include) {
          setDefaultOrderBy(value.include, depth + 1)
        }
      }
    }

    Object.keys(include).forEach(key => {
      setDefaultOrderBy(include[key])
    })

    return include
  }

  /**
   * リレーショナルインクルード作成（最適化）
   */
  static roopMakeRelationalInclude = ({parentName, parentObj, schemaAsObj, SORT}: RelationalIncludeProps): any => {
    if (!parentObj?.include) {
      return parentObj
    }

    try {
      const {hasManyAttributeObj, hasOneAttributeObj} = getRelationalModels({
        schemaAsObj,
        parentName,
      })

      const relationalObj = {...hasManyAttributeObj, ...hasOneAttributeObj}

      Object.keys(parentObj.include).forEach(key => {
        const relation = relationalObj[key]
        const includeItem = parentObj.include[key]

        if (relation?.relationalType === 'hasMany' && includeItem?.orderBy === undefined) {
          parentObj.include[key] = {...includeItem, ...SORT}

          // 再帰処理（深度制限付き）
          P_Query.roopMakeRelationalInclude({
            parentName: key,
            parentObj: parentObj.include[key],
            schemaAsObj,
            SORT,
          })
        }
      })
    } catch (error) {
      console.warn('Error in roopMakeRelationalInclude:', error)
    }

    return parentObj
  }

  /**
   * 検索タイプマスター（読み取り専用）
   */
  static get searchTypeAndLabelMaster() {
    return searchTypeAndLabelMaster
  }
}

// 型エクスポート
export type {WhereQueryItem, PaginationProps, FlexQueryProps, FlexQueryResult, SearchTypeConfig, RelationalIncludeProps}
