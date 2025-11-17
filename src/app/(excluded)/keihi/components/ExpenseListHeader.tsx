'use client'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'

interface ExpenseListHeaderProps {
  totalCount: number
  selectedCount: number
  onSyncExpensesSelected: () => void
  onSyncLocationsSelected: () => void
  onDeleteSelected: () => void
}

export const ExpenseListHeader = ({
  totalCount,
  selectedCount,
  onSyncExpensesSelected,
  onSyncLocationsSelected,
  onDeleteSelected,
}: ExpenseListHeaderProps) => {
  const selected = selectedCount > 0
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">経費記録一覧</h1>
          <p className="text-sm text-gray-600 mt-1">
            全{totalCount}件{selectedCount > 0 && ` (${selectedCount}件選択中)`}
          </p>
        </div>

        <C_Stack className={` items-end`}>
          <R_Stack className={`gap-4`}>
            <T_LINK
              href={
                'https://docs.google.com/spreadsheets/d/1lZ5YDWz3kGHU-P7cxg4eMHWlF_0JdKTOhPvDeT3KG0o/edit?gid=861720079#gid=861720079'
              }
              target="_blank"
            >
              Gシート
            </T_LINK>
            <T_LINK
              href="/keihi/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              新規作成
            </T_LINK>

            {/* 一括登録ボタン */}
            <T_LINK
              href="/keihi/new/bulk"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              一括登録
            </T_LINK>
          </R_Stack>
          <R_Stack className={`gap-4`}>
            {/* 新規作成ボタン */}

            {/* 選択時のアクション */}

            <button
              disabled={!selected}
              onClick={onSyncLocationsSelected}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium"
            >
              Gシート連携（取引先）
            </button>
            <button
              disabled={!selected}
              onClick={onSyncExpensesSelected}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Gシート連携（経費）
            </button>

            <button
              disabled={!selected}
              onClick={onDeleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              削除（選択）
            </button>
          </R_Stack>
        </C_Stack>
      </div>
    </div>
  )
}
