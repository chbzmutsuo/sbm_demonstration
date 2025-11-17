'use client'

import {useCallback} from 'react'
import {atomKey, useJotaiByKey} from '@cm/hooks/useJotai'
import {ExpenseRecord} from '../types'

export interface ExpenseFilterType {
  dateRange: {
    start?: string | null
    end?: string | null
  }
  mfSubject: string | null // 統合された科目フィールド
  status: string | null
  keyword: string | null
}

const initialFilter: ExpenseFilterType = {
  dateRange: {
    start: null,
    end: null,
  },
  mfSubject: null,
  status: null,
  keyword: null,
}

export const useExpenseFilter = () => {
  const [filter, setFilter] = useJotaiByKey<ExpenseFilterType>('useExpenseFilterState' as atomKey, initialFilter)

  const updateFilter = useCallback(
    (updates: Partial<ExpenseFilterType>) => {
      setFilter(prev => ({...prev, ...updates}))
    },
    [setFilter]
  )

  const resetFilter = useCallback(() => {
    setFilter(initialFilter)
  }, [setFilter])

  const filterExpenses = useCallback(
    (expenses: ExpenseRecord[]) => {
      return expenses.filter(expense => {
        // 日付範囲フィルタ
        if (filter.dateRange.start && new Date(expense.date) < new Date(filter.dateRange.start)) {
          return false
        }
        if (filter.dateRange.end && new Date(expense.date) > new Date(filter.dateRange.end)) {
          return false
        }

        // 科目フィルタ
        if (filter.mfSubject && expense.mfSubject !== filter.mfSubject) {
          return false
        }

        // ステータスフィルタ
        if (filter.status && expense.status !== filter.status) {
          return false
        }

        // キーワード検索
        if (filter.keyword) {
          const keyword = filter.keyword.toLowerCase()
          const searchTarget = [
            expense.participants,
            expense.counterparty,
            expense.summary,
            expense.insight,
            ...(expense.keywords || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (!searchTarget.includes(keyword)) {
            return false
          }
        }

        return true
      })
    },
    [filter]
  )

  return {
    filter,
    updateFilter,
    resetFilter,
    filterExpenses,
  }
}
