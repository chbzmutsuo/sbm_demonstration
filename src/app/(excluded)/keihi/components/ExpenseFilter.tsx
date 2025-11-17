'use client'

import {useCallback} from 'react'
import {ExpenseFilterType} from '../hooks/useExpenseFilter'
import {useAllOptions} from '../hooks/useOptions'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {KEIHI_STATUS} from '@app/(excluded)/keihi/actions/expense/constants'

interface ExpenseFilterProps {
  filter: ExpenseFilterType
  onFilterChange: (updates: Partial<ExpenseFilterType>) => void
  onReset: () => void
}

export const ExpenseFilter = ({filter, onFilterChange, onReset}: ExpenseFilterProps) => {
  const {allOptions} = useAllOptions()

  const handleDateChange = useCallback(
    (field: 'start' | 'end') => (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        dateRange: {
          ...filter.dateRange,
          [field]: e.target.value || null,
        },
      })
    },
    [filter.dateRange, onFilterChange]
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">検索・フィルター</h3>
        <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none">
          リセット
        </button>
      </div>

      <R_Stack className={`gap-10`}>
        {/* 日付範囲 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">日付範囲</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filter.dateRange.start || ''}
              onChange={handleDateChange('start')}
              className="block w-[160px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={filter.dateRange.end || ''}
              onChange={handleDateChange('end')}
              className="block w-[160px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 科目 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">科目</label>
          <select
            value={filter.mfSubject || ''}
            onChange={e => onFilterChange({mfSubject: e.target.value || null})}
            className="block w-[160px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">すべて</option>
            {allOptions.subjects?.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>

        {/* ステータス */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ステータス</label>
          <select
            value={filter.status || ''}
            onChange={e => onFilterChange({status: e.target.value || null})}
            className="block w-[160px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">すべて</option>
            {KEIHI_STATUS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </R_Stack>
    </div>
  )
}
