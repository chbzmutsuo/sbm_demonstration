'use client'

import React, {useState, useEffect} from 'react'
import {Clock, ChevronDown, ChevronUp} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {cn} from '@cm/shadcn/lib/utils'
import {getReservationHistoryById} from '../actions/history-actions'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

type ReservationHistoryViewerProps = {
  reservationId: number
  className?: string
}

type HistoryItemProps = {
  history: ReservationChangeHistoryType
  isExpanded: boolean
  toggleExpand: () => void
  users: any
}

export const ReservationHistoryViewer: React.FC<ReservationHistoryViewerProps> = ({reservationId, className}) => {
  const [histories, setHistories] = useState<ReservationChangeHistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const {data: users = []} = useDoStandardPrisma('user', 'findMany', {})

  useEffect(() => {
    loadHistories()
  }, [reservationId])

  const loadHistories = async () => {
    setLoading(true)
    try {
      const data = await getReservationHistoryById(reservationId)
      setHistories(data as ReservationChangeHistoryType[])
    } catch (error) {
      console.error('変更履歴の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className={cn('p-4 bg-white rounded-lg shadow-sm', className)}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">変更履歴を読み込み中...</span>
        </div>
      </div>
    )
  }

  if (histories.length === 0) {
    return (
      <div className={cn('p-4 bg-white rounded-lg shadow-sm', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Clock className="h-12 w-12 text-gray-300 mb-2" />
          <p>この予約の変更履歴はありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      <div className="px-4 py-3 border-b">
        <h3 className="text-lg font-medium text-gray-900">変更履歴</h3>
        <p className="text-sm text-gray-500">
          予約ID: {reservationId} の変更履歴 ({histories.length}件)
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {histories.map(history => (
          <HistoryItem
            key={history.id}
            history={history}
            isExpanded={expandedId === history.id}
            toggleExpand={() => toggleExpand(history.id as string)}
            users={users}
          />
        ))}
      </div>
    </div>
  )
}

const HistoryItem: React.FC<HistoryItemProps> = ({history, isExpanded, toggleExpand, users}) => {
  // 変更内容の差分を抽出

  const changes = extractChanges(history.oldValues || {}, history.newValues || {}, users)

  // 変更タイプに応じたスタイルとラベル
  const getChangeTypeStyle = () => {
    switch (history.changeType) {
      case 'create':
        return {
          badge: 'bg-green-100 text-green-800',
          label: '新規作成',
        }
      case 'update':
        return {
          badge: 'bg-blue-100 text-blue-800',
          label: '更新',
        }
      case 'delete':
        return {
          badge: 'bg-red-100 text-red-800',
          label: '削除',
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          label: history.changeType,
        }
    }
  }

  const changeTypeStyle = getChangeTypeStyle()

  return (
    <div className="px-4 py-3 hover:bg-gray-50">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${changeTypeStyle.badge}`}>{changeTypeStyle.label}</span>
          <span className="text-sm text-gray-500">{formatDate(history.changedAt as Date, 'YYYY/MM/DD HH:mm')}</span>
        </div>

        <div className="flex items-center space-x-3">
          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {isExpanded && changes.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center text-xs text-gray-500">
            <span className="font-medium mr-1">変更者:</span>
            <span className="text-gray-700">{users.find(user => user.id === history.newValues?.['userId'])?.name || '不明'}</span>
          </div>
          {/* 変更タイプに応じた表示 */}
          {history.changeType === 'create' ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">新規予約</h4>
              <div className="space-y-3">
                {changes.map((change, index) => (
                  <div key={index} className="bg-white rounded-md p-3 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 mb-1">{change.label}</div>
                    <div className="text-sm">{renderValue(change.newValue)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : history.changeType === 'delete' ? (
            <div className="bg-red-50 border border-red-100 rounded-md p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">予約キャンセル</h4>
              <div className="space-y-3">
                {changes.map((change, index) => (
                  <div key={index} className="bg-white rounded-md p-3 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 mb-1">{change.label}</div>
                    <div className="text-sm">{renderValue(change.oldValue)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                <h4 className="text-sm font-medium text-blue-800">予約内容変更</h4>
              </div>
              <div className="divide-y divide-gray-200 w-[400px]">
                {changes.map((change, index) => (
                  <div key={index} className="p-1.5 px-3 hover:bg-gray-50">
                    <div className="text-xs font-medium text-gray-500 ">{change.label}</div>
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="flex-1 p-1">
                        <div className="text-sm">{renderValue(change.oldValue)}</div>
                      </div>
                      <div className="hidden md:block text-gray-300 px-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="md:hidden text-gray-300 py-1 flex justify-center">
                        <svg className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="flex-1 p-2 bg-blue-50 rounded-md text-blue-500 font-bold">
                        <div className="text-sm font-medium">{renderValue(change.newValue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isExpanded && changes.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded text-center text-sm text-gray-500">変更内容の詳細はありません</div>
      )}
    </div>
  )
}

// 変更差分を抽出するロジック
const extractChanges = (oldValues: Record<string, any>, newValues: Record<string, any>, users) => {
  const changes: {label: string; oldValue: any; newValue: any}[] = []
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

  // フィールドのラベルマッピング
  const fieldLabels: Record<string, string> = {
    customerName: '顧客名',
    contactName: '担当者名',
    deliveryDate: '配達日時',
    pickupLocation: '受取方法',
    purpose: '用途',
    paymentMethod: '支払方法',
    orderChannel: '注文経路',
    totalAmount: '合計金額',
    finalAmount: '最終金額',
    pointsUsed: '使用ポイント',
    notes: '備考',
    postalCode: '郵便番号',
    prefecture: '都道府県',
    city: '市区町村',
    street: '町名・番地',
    building: '建物名',
    phoneNumber: '電話番号',
    orderStaff: '受注担当者',
    items: '注文商品',
    isCanceled: 'キャンセル',
    canceledAt: 'キャンセル日時',
    cancelReason: 'キャンセル理由',
  }

  // 特別な処理が必要なフィールド
  const specialFields = [
    'id',
    'createdAt',
    'updatedAt',
    'SbmReservationItem',

    'reservationData',
    'deliveryDate',
    'items',

    'userId',

    'phoneNumber',

    'canceledAt',

    'isCanceled',
    'deliveryCompleted',
    'recoveryCompleted',
  ]

  allKeys.forEach(key => {
    // 特別な処理が必要なフィールド
    if (specialFields.includes(key)) {
      if (key === 'canceledAt') {
        const oldDate = oldValues[key] ? new Date(oldValues[key]) : null
        const newDate = newValues[key] ? new Date(newValues[key]) : null

        if ((oldDate && newDate && oldDate.getTime() !== newDate.getTime()) || (!oldDate && newDate) || (oldDate && !newDate)) {
          changes.push({
            label: fieldLabels[key] || key,
            oldValue: oldDate,
            newValue: newDate,
          })
        }
      }

      if (key === 'items') {
        // 商品リストの差分を処理
        const oldItems = oldValues[key] || []
        const newItems = newValues[key] || []

        // 商品リストに変更があるか確認
        if (JSON.stringify(oldItems) !== JSON.stringify(newItems)) {
          // 商品の追加・削除・変更を詳細に分析
          if (oldItems.length === 0 && newItems.length > 0) {
            // 商品の追加（新規注文）
            changes.push({
              label: '商品追加',
              oldValue: [],
              newValue: newItems,
            })
          } else if (oldItems.length > 0 && newItems.length === 0) {
            // 商品の削除（注文キャンセル）
            changes.push({
              label: '商品削除',
              oldValue: oldItems,
              newValue: [],
            })
          } else {
            // 商品の変更（数量や商品の変更）
            // 追加された商品
            const addedItems = newItems.filter(
              newItem =>
                !oldItems.some(
                  oldItem => oldItem.sbmProductId === newItem.sbmProductId && oldItem.productName === newItem.productName
                )
            )

            // 削除された商品
            const removedItems = oldItems.filter(
              oldItem =>
                !newItems.some(
                  newItem => newItem.sbmProductId === oldItem.sbmProductId && newItem.productName === oldItem.productName
                )
            )

            // 数量や価格が変更された商品
            const changedItems = newItems
              .filter(newItem => {
                const oldItem = oldItems.find(
                  o => o.sbmProductId === newItem.sbmProductId && o.productName === newItem.productName
                )
                return (
                  oldItem &&
                  (oldItem.quantity !== newItem.quantity ||
                    oldItem.unitPrice !== newItem.unitPrice ||
                    oldItem.totalPrice !== newItem.totalPrice)
                )
              })
              .map(newItem => {
                const oldItem = oldItems.find(
                  o => o.sbmProductId === newItem.sbmProductId && o.productName === newItem.productName
                )
                return {oldItem, newItem}
              })

            // 変更内容を追加
            if (addedItems.length > 0) {
              changes.push({
                label: '商品追加',
                oldValue: null,
                newValue: addedItems,
              })
            }

            if (removedItems.length > 0) {
              changes.push({
                label: '商品削除',
                oldValue: removedItems,
                newValue: null,
              })
            }

            if (changedItems.length > 0) {
              changedItems.forEach(({oldItem, newItem}) => {
                if (oldItem.quantity !== newItem.quantity) {
                  changes.push({
                    label: `${newItem.productName}の数量変更`,
                    oldValue: {...oldItem, _type: 'quantity'},
                    newValue: {...newItem, _type: 'quantity'},
                  })
                }

                if (oldItem.unitPrice !== newItem.unitPrice) {
                  changes.push({
                    label: `${newItem.productName}の単価変更`,
                    oldValue: {...oldItem, _type: 'price'},
                    newValue: {...newItem, _type: 'price'},
                  })
                }
              })
            }
          }
        }
      } else if (key === 'deliveryDate') {
        // 日付フィールドの処理
        const oldDate = oldValues[key] ? new Date(oldValues[key]) : null
        const newDate = newValues[key] ? new Date(newValues[key]) : null

        if ((oldDate && newDate && oldDate.getTime() !== newDate.getTime()) || (!oldDate && newDate) || (oldDate && !newDate)) {
          changes.push({
            label: fieldLabels[key] || key,
            oldValue: oldDate,
            newValue: newDate,
          })
        }
      }
      return
    }

    // 通常のフィールド比較
    if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
      changes.push({
        label: fieldLabels[key] || key,
        oldValue: oldValues[key],
        newValue: newValues[key],
      })
    }
  })

  return changes
}

// 値を適切に表示するロジック
const renderValue = (value: any): React.ReactNode => {
  if (value === undefined || value === null) {
    return <span className="text-gray-400">未設定</span>
  }

  // 日付の場合
  if (value instanceof Date) {
    return formatDate(value, 'YYYY/MM/DD HH:mm')
  }

  // 真偽値の場合
  if (typeof value === 'boolean') {
    return value ? <span className="text-green-600">はい</span> : <span className="text-red-600">いいえ</span>
  }

  // 商品配列の場合
  if (Array.isArray(value) && value.length > 0 && value[0] && 'productName' in value[0]) {
    return (
      <div className="space-y-1">
        {value.map((item, idx) => (
          <div key={idx} className="text-xs">
            {item.productName} × {item.quantity}個
            {item.unitPrice && <span className="ml-1">(¥{item.unitPrice.toLocaleString()})</span>}
          </div>
        ))}
      </div>
    )
  }

  // 特殊な商品変更の場合（_type属性で判別）
  if (typeof value === 'object' && value !== null && '_type' in value) {
    if (value._type === 'quantity') {
      return (
        <div className="text-xs">
          <strong>{value.quantity}個</strong>
          <span className="text-gray-500 ml-1">
            (¥{value.unitPrice?.toLocaleString() || 0} × {value.quantity})
          </span>
        </div>
      )
    }

    if (value._type === 'price') {
      return (
        <div className="text-xs">
          <strong>¥{value.unitPrice?.toLocaleString() || 0}</strong>
          <span className="text-gray-500 ml-1">
            × {value.quantity}個 = ¥{value.totalPrice?.toLocaleString() || 0}
          </span>
        </div>
      )
    }
  }

  // 金額の場合
  if (typeof value === 'number') {
    if (['totalAmount', 'finalAmount', 'pointsUsed'].some(field => field.includes(String(value)))) {
      return <span>¥{value.toLocaleString()}</span>
    }
    return value.toLocaleString()
  }

  // オブジェクトの場合
  if (typeof value === 'object' && value !== null) {
    // 複雑なオブジェクトの場合は簡略表示
    return (
      <details className="text-xs">
        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">詳細を表示</summary>
        <pre className="mt-1 p-1 bg-gray-50 rounded text-xs overflow-auto max-h-24">{JSON.stringify(value, null, 2)}</pre>
      </details>
    )
  }

  return String(value)
}
