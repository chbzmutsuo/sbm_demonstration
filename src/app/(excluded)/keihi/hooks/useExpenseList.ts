'use client'

import {useState, useCallback} from 'react'
import useSWR from 'swr'
import {getExpenses} from '../actions/expense-actions'
import {ExpenseRecord} from '../types'
import {useExpenseQueryState} from './useExpenseQueryState'

interface ExpenseListState {
  selectedIds: string[]
}

const fetcher = async (params: any) => {
  const result = await getExpenses(params)
  if (result.success && result.data) {
    return result.data
  }
  throw new Error(result.error || '経費記録の取得に失敗しました')
}

export const useExpenseList = () => {
  const {queryState} = useExpenseQueryState()
  const [state, setState] = useState<ExpenseListState>({
    selectedIds: [],
  })

  // SWRで経費データ取得
  const {data, error, isLoading, mutate} = useSWR(
    [
      'expenses',
      queryState.page,
      queryState.limit,
      JSON.stringify(queryState.filter),
      queryState.sort.field,
      queryState.sort.order,
    ],
    () =>
      fetcher({
        page: queryState.page,
        limit: queryState.limit,
        filter: queryState.filter,
        sort: {
          field: queryState.sort.field,
          order: queryState.sort.order,
        },
      }),
    {
      revalidateOnFocus: false,
    }
  )

  // 選択状態の切り替え
  const toggleSelect = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id],
    }))
  }, [])

  // 全選択/全解除の切り替え
  const toggleSelectAll = useCallback(() => {
    if (!data?.expenses) return
    setState(prev => ({
      ...prev,
      selectedIds:
        prev.selectedIds.length === data.expenses.length ? [] : data.expenses.map((expense: ExpenseRecord) => expense.id),
    }))
  }, [data])

  // ステータス更新（ローカルのみ。必要に応じてmutateで再取得も可）
  const updateExpenseStatus = useCallback(
    async (id: string, status: string) => {
      if (!data?.expenses) return
      // ローカルでのみ反映
      mutate()
    },
    [data, mutate]
  )

  // 明示的な再取得
  const fetchExpenses = useCallback(() => {
    mutate()
  }, [])

  return {
    state: {
      loading: isLoading,
      expenses: data?.expenses || [],
      selectedIds: state.selectedIds,
      totalCount: data?.totalCount || 0,
      totalPages: data?.totalPages || 0,
    },
    setState,
    fetchExpenses,
    toggleSelect,
    toggleSelectAll,
    updateExpenseStatus,
    filteredExpenses: data?.expenses || [], // フィルターはサーバーサイドで適用済み
    error,
  }
}
