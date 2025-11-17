'use client'

import {useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {ExpenseFilterType} from './useExpenseFilter'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export type SortField = 'date' | 'createdAt' | 'imageTitle' | null
export type SortOrder = 'asc' | 'desc'

export interface QueryState {
  filter: ExpenseFilterType
  sort: {
    field: SortField
    order: SortOrder
  }
  page: number
  limit: number
}

// デフォルトの日付範囲を計算する関数（年初から年末）
const getDefaultDateRange = () => {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, -700) // 1月1日
  const endOfYear = new Date(today.getFullYear(), 11, 31) // 12月31日

  const data = {
    // start: formatDate(startOfYear),
    // end: formatDate(endOfYear),
  }

  return data
}

// デフォルトの状態
const getDefaultState = (): QueryState => {
  const defaultDateRange = getDefaultDateRange()
  return {
    filter: {
      dateRange: defaultDateRange,
      mfSubject: null,
      status: null,
      keyword: null,
    },
    sort: {
      field: 'createdAt',
      order: 'desc',
    },
    page: 1,
    limit: 50,
  }
}

export const useExpenseQueryState = () => {
  const router = useRouter()
  const {query, shallowAddQuery} = useGlobal()
  const defaultState = getDefaultState()

  // クエリパラメータから状態を取得（デフォルト値を設定）
  const getQueryState = useCallback((): QueryState => {
    return {
      filter: {
        dateRange: {
          start: query['startDate'] || defaultState.filter.dateRange.start,
          end: query['endDate'] || defaultState.filter.dateRange.end,
        },
        mfSubject: query['mfSubject'] || defaultState.filter.mfSubject,
        status: query['status'] || defaultState.filter.status,
        keyword: query['keyword'] || defaultState.filter.keyword,
      },
      sort: {
        field: (query['sortField'] as SortField) || defaultState.sort.field,
        order: (query['sortOrder'] as SortOrder) || defaultState.sort.order,
      },
      page: parseInt(query['page'] || defaultState.page.toString()),
      limit: parseInt(query['limit'] || defaultState.limit.toString()),
    }
  }, [query, defaultState])

  // クエリパラメータを更新
  const updateQuery = useCallback(
    (updates: Partial<QueryState>) => {
      const current = getQueryState()

      const newState = {...current, ...updates}

      // 新しいクエリオブジェクトを作成
      const newQuery: Record<string, string> = {}

      // フィルター
      newQuery.startDate = newState?.filter?.dateRange?.start || ''
      newQuery.endDate = newState?.filter?.dateRange?.end || ''
      newQuery.mfSubject = newState?.filter?.mfSubject || ''
      newQuery.status = newState?.filter?.status || ''
      newQuery.keyword = newState?.filter?.keyword || ''

      // ソート
      newQuery.sortField = newState?.sort?.field || ''
      newQuery.sortOrder = newState?.sort?.order || ''

      // ページネーション
      newQuery.page = newState.page.toString()
      newQuery.limit = newState.limit.toString()

      // クエリを更新
      shallowAddQuery(newQuery)
    },
    [shallowAddQuery, getQueryState]
  )

  // フィルターをリセット（デフォルト値を設定）
  const resetQuery = useCallback(() => {
    updateQuery(getDefaultState())
  }, [updateQuery])

  // ソート切り替え
  const toggleSort = useCallback(
    (field: SortField) => {
      const current = getQueryState()
      const newOrder: SortOrder = current.sort.field === field && current.sort.order === 'desc' ? 'asc' : 'desc'

      updateQuery({
        sort: {
          field,
          order: newOrder,
        },
        page: 1, // ソート変更時はページを1に戻す
      })
    },
    [getQueryState, updateQuery]
  )

  return {
    queryState: getQueryState(),
    updateQuery,
    resetQuery,
    toggleSort,
  }
}
