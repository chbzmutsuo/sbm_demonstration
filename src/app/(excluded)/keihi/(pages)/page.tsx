'use client'

import {useState, useEffect, useCallback} from 'react'
import {toast} from 'react-toastify'
import {deleteExpenses, syncExpensesToSheet, syncLocationsToSheet} from '../actions/expense-actions'
import {ExpenseListHeader} from '../components/ExpenseListHeader'
import {ExpenseListItem} from '../components/ExpenseListItem'
import {ExpenseFilter} from '../components/ExpenseFilter'
import {Pagination} from '../components/Pagination'
import {LoadingSpinner} from '../components/ui/LoadingSpinner'
import {ProcessingStatus} from '../components/ui/ProcessingStatus'
import {useAllOptions} from '../hooks/useOptions'
import {useExpenseList} from '../hooks/useExpenseList'
import {useExpenseQueryState} from '../hooks/useExpenseQueryState'
import {SortableHeader} from '../components/SortableHeader'
import {StickyBottom, StickyTop} from '@cm/components/styles/common-components/Sticky'
import {cn} from '@cm/shadcn/lib/utils'
import {Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import useModal from '@cm/components/utils/modal/useModal'
import ExpenseEditor from '@app/(excluded)/keihi/(pages)/expense/[id]/edit/ExpenseEditor'
import {Button} from '@cm/components/styles/common-components/Button'
import useLogOnRender from '@cm/hooks/useLogOnRender'

const ExpenseListPage = () => {
  useLogOnRender('useExpenseList')
  const {allOptions} = useAllOptions()
  const {queryState, updateQuery, resetQuery, toggleSort} = useExpenseQueryState()
  const {state, setState, fetchExpenses, toggleSelect, toggleSelectAll, updateExpenseStatus, filteredExpenses} = useExpenseList()

  const KeihiDetailMD = useModal({alertOnClose: true})

  const [subjectColorMap, setSubjectColorMap] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingLocations, setIsExportingLocations] = useState(false)
  const [isSyncingExpenses, setIsSyncingExpenses] = useState(false)
  const [isSyncingLocations, setIsSyncingLocations] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // クエリパラメータが変更されたら再取得
  useEffect(() => {
    fetchExpenses()
  }, [])

  // 科目カラーのマップをオプションから構築
  useEffect(() => {
    if (allOptions.subjects?.length) {
      const map = Object.fromEntries(allOptions.subjects.map(opt => [opt.label, opt.color || '']))
      setSubjectColorMap(map)
    }
  }, [allOptions.subjects])

  // ページ変更
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > state.totalPages) return
      updateQuery({page})
    },
    [updateQuery, state.totalPages]
  )

  // 表示件数変更
  const handleLimitChange = useCallback(
    (limit: number) => {
      updateQuery({limit, page: 1}) // ページを1に戻す
    },
    [updateQuery]
  )

  // フィルター変更
  const handleFilterChange = useCallback(
    (updates: Partial<typeof queryState.filter>) => {
      updateQuery({
        filter: {...queryState.filter, ...updates},
        page: 1, // フィルター変更時はページを1に戻す
      })
    },
    [queryState.filter, updateQuery]
  )

  // 経費データをスプレッドシートに連携（選択）
  const handleSyncExpensesSelected = useCallback(async () => {
    if (state.selectedIds.length === 0) {
      toast.error('連携する記録を選択してください')
      return
    }

    try {
      setIsSyncingExpenses(true)
      const result = await syncExpensesToSheet(state.selectedIds)

      if (result.success) {
        toast.success(`${state.selectedIds.length}件の経費データをGoogleスプレッドシートに連携しました: ${result.message}`)
      } else {
        toast.error(result.message || '経費データのスプレッドシート連携に失敗しました')
      }
    } catch (error) {
      console.error('経費データのスプレッドシート連携エラー:', error)
      toast.error('経費データのスプレッドシート連携に失敗しました')
    } finally {
      setIsSyncingExpenses(false)
    }
  }, [state.selectedIds])

  // 取引先データをスプレッドシートに連携（選択）
  const handleSyncLocationsSelected = useCallback(async () => {
    if (state.selectedIds.length === 0) {
      toast.error('連携する記録を選択してください')
      return
    }

    try {
      setIsSyncingLocations(true)
      const result = await syncLocationsToSheet(state.selectedIds)

      if (result.success) {
        toast.success(`${state.selectedIds.length}件の取引先データをGoogleスプレッドシートに連携しました: ${result.message}`)
      } else {
        toast.error(result.message || '取引先データのスプレッドシート連携に失敗しました')
      }
    } catch (error) {
      console.error('取引先データのスプレッドシート連携エラー:', error)
      toast.error('取引先データのスプレッドシート連携に失敗しました')
    } finally {
      setIsSyncingLocations(false)
    }
  }, [state.selectedIds])

  // 選択削除
  const handleDeleteSelected = useCallback(async () => {
    if (state.selectedIds.length === 0) {
      toast.error('削除する記録を選択してください')
      return
    }

    if (!confirm(`選択した${state.selectedIds.length}件の記録を削除しますか？`)) {
      return
    }

    try {
      setIsDeleting(true)
      const result = await deleteExpenses(state.selectedIds)

      if (result.success) {
        toast.success(`${state.selectedIds.length}件の記録を削除しました`)
        setState(prev => ({
          ...prev,
          selectedIds: [],
        }))
        // データを再取得
        await fetchExpenses()
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }, [state.selectedIds, fetchExpenses, setState])

  // ページネーション用の計算
  const currentFrom = (queryState.page - 1) * queryState.limit + 1
  const currentTo = Math.min(queryState.page * queryState.limit, state.totalCount)

  // ローディング状態の表示
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">経費記録を読み込み中...</p>
        </div>
      </div>
    )
  }

  const allSelected = state.selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0

  return (
    <div className="bg-gray-50 px-4">
      <KeihiDetailMD.Modal>
        <div className={`w-full`}>
          <ExpenseEditor
            expenseId={KeihiDetailMD?.open?.keihiId}
            onUpdate={async () => {
              // await fetchExpenses()
              await fetchExpenses()
              KeihiDetailMD.handleClose()
            }}
          />
        </div>
      </KeihiDetailMD.Modal>
      <div className="max-w-[90vw] mx-auto">
        <div className="bg-white shadow-sm">
          {/* ヘッダー */}
          <StickyTop className="bg-white">
            <ExpenseListHeader
              totalCount={state.totalCount}
              selectedCount={state.selectedIds.length}
              onSyncExpensesSelected={handleSyncExpensesSelected}
              onSyncLocationsSelected={handleSyncLocationsSelected}
              onDeleteSelected={handleDeleteSelected}
            />
            {/* 表示件数選択 */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                {filteredExpenses.length > 0 && (
                  <Button onClick={toggleSelectAll} color={allSelected ? 'gray' : 'blue'}>
                    <R_Stack className="cursor-pointer">
                      <input type="checkbox" onChange={() => undefined} checked={allSelected} className="h-4 w-4 " />
                      <span>{allSelected ? '全解除' : '全選択'}</span>
                    </R_Stack>
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">表示件数:</label>
                  <select
                    value={queryState.limit}
                    onChange={e => handleLimitChange(parseInt(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={50}>50件</option>
                    <option value={100}>100件</option>
                    <option value={200}>200件</option>
                    <option value={500}>500件</option>
                  </select>
                </div>
              </div>
            </div>
          </StickyTop>

          {/* フィルター */}
          <Padding>
            <ExpenseFilter filter={queryState.filter} onFilterChange={handleFilterChange} onReset={resetQuery} />
          </Padding>

          {/* 処理状況 */}
          <div>
            <ProcessingStatus isVisible={isExporting} message="経費データCSV出力中..." variant="info" />
            <ProcessingStatus isVisible={isExportingLocations} message="取引先一覧CSV出力中..." variant="info" />
            <ProcessingStatus
              isVisible={isSyncingExpenses}
              message="経費データをGoogleスプレッドシートに連携中..."
              variant="info"
            />
            <ProcessingStatus
              isVisible={isSyncingLocations}
              message="取引先データをGoogleスプレッドシートに連携中..."
              variant="info"
            />
            <ProcessingStatus isVisible={isDeleting} message="削除処理中..." variant="info" />
          </div>

          {/* 経費記録一覧 */}
          <div className="divide-y divide-gray-200">
            {filteredExpenses.length === 0 ? (
              <Padding className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">経費記録がありません</h3>
                <p className="text-gray-600 mb-6">
                  {state.expenses.length === 0
                    ? '新しい経費記録を作成してください。'
                    : 'フィルター条件に一致する記録がありません。'}
                </p>
              </Padding>
            ) : (
              <Padding className="overflow-auto">
                <table
                  className={cn(
                    'min-w-full divide-y divide-gray-200',
                    '[&_th]:p-2',
                    '[&_td]:p-1',
                    '[&_td]:px-3.5',
                    '[&_td]:align-middle',
                    '[&_td]:text-sm',
                    '[&_td]:text-gray-700',
                    '[&_td]:min-w-[60px]',
                    '[&_td]:max-w-[160px]',
                    '[&_td]:truncate',
                    '[&_td]:text-xs',
                    '[&_td]:leading-5'
                  )}
                >
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader
                        label="取込日/選択"
                        field="createdAt"
                        currentField={queryState.sort.field}
                        currentOrder={queryState.sort.order}
                        onSort={toggleSort}
                      />
                      <th className="text-xs font-medium text-gray-500">ステータス</th>

                      <SortableHeader
                        label="日付/金額"
                        field="date"
                        currentField={queryState.sort.field}
                        currentOrder={queryState.sort.order}
                        onSort={toggleSort}
                      />
                      <th className="text-xs font-medium text-gray-500">科目/取引先</th>
                      <th className="text-xs font-medium text-gray-500">相手/会話の目的/会話内容の要約</th>
                      <th className="text-xs font-medium text-gray-500">要約/洞察/キーワード</th>
                      <SortableHeader
                        label="画像"
                        field="imageTitle"
                        currentField={queryState.sort.field}
                        currentOrder={queryState.sort.order}
                        onSort={toggleSort}
                      />
                      <th className="text-xs font-medium text-gray-500">MF科目/MF補助科目</th>
                      <th className="text-xs font-medium text-gray-500">MF税区分/MF部門</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map(expense => (
                      <ExpenseListItem
                        key={expense.id}
                        expense={expense}
                        isSelected={state.selectedIds.includes(expense.id)}
                        onToggleSelect={toggleSelect}
                        subjectColorMap={subjectColorMap}
                        onStatusChange={updateExpenseStatus}
                        KeihiDetailMD={KeihiDetailMD}
                      />
                    ))}
                  </tbody>
                </table>
              </Padding>
            )}
          </div>

          {/* ページネーション */}
          <StickyBottom className="bg-gray-100">
            <Pagination
              currentPage={queryState.page}
              totalPages={state.totalPages}
              onPageChange={handlePageChange}
              totalCount={state.totalCount}
              currentFrom={currentFrom}
              currentTo={currentTo}
            />
          </StickyBottom>
        </div>
      </div>
    </div>
  )
}

export default ExpenseListPage

// // 経費データCSV出力（全件）
// const handleExportAll = useCallback(async () => {
//   try {
//     setIsExporting(true)
//     const result = await exportExpensesToCsv()

//     if (result.success && result.data) {
//       // CSVファイルのダウンロード
//       downloadCsv(result.data, `経費記録_全件_${new Date().toISOString().split('T')[0]}.csv`)
//       toast.success('経費データのCSV出力が完了しました')
//     } else {
//       toast.error(result.error || '経費データのCSV出力に失敗しました')
//     }
//   } catch (error) {
//     console.error('経費データCSV出力エラー:', error)
//     toast.error('経費データのCSV出力に失敗しました')
//   } finally {
//     setIsExporting(false)
//   }
// }, [downloadCsv])

// // 経費データCSV出力（選択）
// const handleExportSelected = useCallback(async () => {
//   if (state.selectedIds.length === 0) {
//     toast.error('出力する記録を選択してください')
//     return
//   }

//   try {
//     setIsExporting(true)
//     const result = await exportExpensesToCsv(state.selectedIds)

//     if (result.success && result.data) {
//       // CSVファイルのダウンロード
//       downloadCsv(result.data, `経費記録_選択_${new Date().toISOString().split('T')[0]}.csv`)
//       toast.success(`${state.selectedIds.length}件の経費データCSV出力が完了しました`)
//     } else {
//       toast.error(result.error || '経費データのCSV出力に失敗しました')
//     }
//   } catch (error) {
//     console.error('経費データCSV出力エラー:', error)
//     toast.error('経費データのCSV出力に失敗しました')
//   } finally {
//     setIsExporting(false)
//   }
// }, [state.selectedIds, downloadCsv])

// // 取引先一覧CSV出力（全件）
// const handleExportLocationsAll = useCallback(async () => {
//   try {
//     setIsExportingLocations(true)
//     const result = await exportLocationsToCsv()

//     if (result.success && result.data) {
//       // CSVファイルのダウンロード
//       downloadCsv(result.data, `取引先一覧_全件_${new Date().toISOString().split('T')[0]}.csv`)
//       toast.success('取引先一覧のCSV出力が完了しました')
//     } else {
//       toast.error(result.error || '取引先一覧のCSV出力に失敗しました')
//     }
//   } catch (error) {
//     console.error('取引先一覧CSV出力エラー:', error)
//     toast.error('取引先一覧のCSV出力に失敗しました')
//   } finally {
//     setIsExportingLocations(false)
//   }
// }, [downloadCsv])

// // 取引先一覧CSV出力（選択）
// const handleExportLocationsSelected = useCallback(async () => {
//   if (state.selectedIds.length === 0) {
//     toast.error('出力する記録を選択してください')
//     return
//   }

//   try {
//     setIsExportingLocations(true)
//     const result = await exportLocationsToCsv(state.selectedIds)

//     if (result.success && result.data) {
//       // CSVファイルのダウンロード
//       downloadCsv(result.data, `取引先一覧_選択_${new Date().toISOString().split('T')[0]}.csv`)
//       toast.success(`${state.selectedIds.length}件の取引先一覧CSV出力が完了しました`)
//     } else {
//       toast.error(result.error || '取引先一覧のCSV出力に失敗しました')
//     }
//   } catch (error) {
//     console.error('取引先一覧CSV出力エラー:', error)
//     toast.error('取引先一覧のCSV出力に失敗しました')
//   } finally {
//     setIsExportingLocations(false)
//   }
// }, [state.selectedIds, downloadCsv])

// // 経費データをスプレッドシートに連携（全件）
// const handleSyncExpensesAll = useCallback(async () => {
//   try {
//     setIsSyncingExpenses(true)
//     const result = await syncExpensesToSheet()

//     if (result.success) {
//       toast.success(`経費データをGoogleスプレッドシートに連携しました: ${result.message}`)
//     } else {
//       toast.error(result.message || '経費データのスプレッドシート連携に失敗しました')
//     }
//   } catch (error) {
//     console.error('経費データのスプレッドシート連携エラー:', error)
//     toast.error('経費データのスプレッドシート連携に失敗しました')
//   } finally {
//     setIsSyncingExpenses(false)
//   }
// }, [])

// // 共通のCSVダウンロード処理
// const downloadCsv = useCallback((data: string, filename: string) => {
//   const blob = new Blob([data], {type: 'text/csv;charset=utf-8'})
//   const url = URL.createObjectURL(blob)
//   const link = document.createElement('a')
//   link.href = url
//   link.download = filename
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)
//   URL.revokeObjectURL(url)
// }, [])

// // 取引先データをスプレッドシートに連携（全件）
// const handleSyncLocationsAll = useCallback(async () => {
//   try {
//     setIsSyncingLocations(true)
//     const result = await syncLocationsToSheet()

//     if (result.success) {
//       toast.success(`取引先データをGoogleスプレッドシートに連携しました: ${result.message}`)
//     } else {
//       toast.error(result.message || '取引先データのスプレッドシート連携に失敗しました')
//     }
//   } catch (error) {
//     console.error('取引先データのスプレッドシート連携エラー:', error)
//     toast.error('取引先データのスプレッドシート連携に失敗しました')
//   } finally {
//     setIsSyncingLocations(false)
//   }
// }, [])
