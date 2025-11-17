'use client'

import {ExpenseRecord} from '../types'
import {formatAmount, formatDate} from '../utils'
import React from 'react'
import {toast} from 'react-toastify'
// import {updateExpenseStatusAction} from '../actions/expense-server-actions'
import {StatusSelect} from './StatusSelect'
import {updateExpense} from '@app/(excluded)/keihi/actions/expense-actions'
import useModal from '@cm/components/utils/modal/useModal'

interface ExpenseListItemProps {
  expense: ExpenseRecord
  isSelected: boolean
  onToggleSelect: (id: string) => void
  subjectColorMap?: Record<string, string>
  onStatusChange?: (id: string, status: string) => void
  KeihiDetailMD: ReturnType<typeof useModal>
}

export const ExpenseListItem = ({
  expense,
  isSelected,
  onToggleSelect,
  subjectColorMap = {},
  onStatusChange,
  KeihiDetailMD,
}: ExpenseListItemProps) => {
  const subjectColor = subjectColorMap[expense.mfSubject || '']

  const insightSummaryText = expense.summary || ''
  const conversationSummaryText = expense.conversationSummary || ''
  const keywordsText = expense.keywords?.slice(0, 5).join(', ')
  const insightText = expense.insight || ''
  const autoTagsText = expense.autoTags?.join(', ') || ''
  // For optimistic UI update of status
  const [localStatus, setLocalStatus] = React.useState(expense.status || '')

  const shortText = (text?: string, max = 50) => {
    return text || '-'
    // if (!text) return '-'
    // return text.length > max ? `${text.slice(0, max)}...` : text
  }

  // ステータスに応じた行の背景色を設定
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case '一次チェック済':
        return 'bg-blue-50'
      case 'MF連携済み':
        return 'bg-green-50'
      case '私的利用':
        return 'bg-red-50'
      default:
        return ''
    }
  }

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${getStatusColor(localStatus)}`}>
      <td className="whitespace-nowrap text-center align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(expense.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="text-xs text-gray-500 ">{expense.createdAt && formatDate(expense.createdAt)}</div>
      </td>
      <td className="p-2 align-middle">
        <StatusSelect
          value={localStatus}
          onChange={async newStatus => {
            try {
              const result = await updateExpense(expense.id, {status: newStatus})
              if (result.success) {
                setLocalStatus(newStatus)
                onStatusChange?.(expense.id, newStatus)
              } else {
                throw new Error(result.error)
              }
            } catch (err) {
              console.error('status update failed', err)
              toast.error('ステータスの更新に失敗しました')
              throw err // StatusSelectコンポーネントでエラーハンドリング
            }
          }}
        />
      </td>

      <td className="align-middle font-semibold text-gray-900 whitespace-nowrap">
        <div className="text-xs text-gray-500">{expense.date && formatDate(expense.date)}</div>
        <div className="text-sm" onClick={() => KeihiDetailMD.handleOpen({keihiId: expense.id})}>
          <span className={`text-blue-500 cursor-pointer underline`}>¥{formatAmount(expense.amount)}</span>
        </div>
      </td>

      <td className="p-2 align-middle">
        <div>
          <span
            className="inline-block px-2 py-1 text-xs rounded font-medium"
            style={{
              backgroundColor: subjectColor ? `${subjectColor}20` : '#F1F5F9',
              color: subjectColor ? subjectColor : '#0F172A',
            }}
          >
            {expense.mfSubject}
          </span>
          {expense.counterparty && <div className="text-xs text-gray-500 mt-1 truncate">📍 {expense.counterparty}</div>}
        </div>
      </td>

      <td>
        {expense.participants || '-'}
        <br />
        {expense.conversationPurpose?.join(', ') || '-'}
        <br />
        {shortText(conversationSummaryText)}
      </td>

      <td>
        {shortText(insightSummaryText)}

        <br />
        {shortText(insightText)}
        <br />
        {shortText(keywordsText)}
      </td>

      <td className="p-2 align-middle">
        {expense.KeihiAttachment && expense.KeihiAttachment.length > 0 ? (
          <div className="flex flex-col items-center ">
            {/* <div className="w-14 h-10">
              <ContentPlayer
                src={expense.KeihiAttachment[0].url}
                styles={{thumbnail: {width: 56, height: 40, borderRadius: '6px'}}}
              />
            </div> */}
            <div className="text-[11px] text-gray-500 max-w-[120px] truncate">{expense.KeihiAttachment[0].originalName}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">画像なし</span>
        )}
      </td>

      <td>{expense.mfSubAccount || '-'}</td>

      <td>
        {expense.mfTaxCategory || '-'}
        <br />
        {expense.mfDepartment || '-'}
      </td>
    </tr>
  )
}
