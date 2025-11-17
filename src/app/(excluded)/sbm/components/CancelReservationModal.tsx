'use client'

import React, {useState} from 'react'
import {X} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/shadcn/ui/button'
import Textarea from '@cm/shadcn/ui/Organisms/form/Textarea'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

type CancelReservationModalProps = {
  reservation: ReservationType | null
  onCancel: () => void
  onConfirm: (reason: string, userId: number) => Promise<void>
}

export const CancelReservationModal: React.FC<CancelReservationModalProps> = ({reservation, onCancel, onConfirm}) => {
  const {session} = useGlobal()
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!reservation) return null

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('取り消し理由を入力してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm(reason, session?.id)
    } catch (err) {
      setError('予約の取り消しに失敗しました')
      console.error('予約取り消しエラー:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">予約の取り消し</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-500 focus:outline-none">
          <X size={20} />
        </button>
      </div>

      <Padding>
        <div className="space-y-4">
          <div>
            <p className="text-red-600 font-medium">
              この操作は取り消すことができます。予約は完全に削除されず、取り消し状態になります。
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">予約情報</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">顧客名:</div>
              <div className="font-medium">{reservation.customerName}</div>

              <div className="text-gray-500">配達日時:</div>
              <div className="font-medium">{formatDate(reservation.deliveryDate, 'yyyy/MM/dd HH:mm')}</div>

              <div className="text-gray-500">合計金額:</div>
              <div className="font-medium">¥{reservation.totalAmount?.toLocaleString()}</div>

              <div className="text-gray-500">商品:</div>
              <div className="font-medium">
                {reservation.items?.map((item, idx) => (
                  <div key={idx}>
                    {item.productName} x{item.quantity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
              取り消し理由 <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="取り消し理由を入力してください"
              className="w-full"
              rows={3}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>

          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
            {isSubmitting ? '処理中...' : '予約を取り消す'}
          </Button>
        </div>
      </Padding>
    </div>
  )
}
