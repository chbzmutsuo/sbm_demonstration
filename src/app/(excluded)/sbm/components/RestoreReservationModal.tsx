'use client'

import React, {useState} from 'react'
import {X} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/shadcn/ui/button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

type RestoreReservationModalProps = {
  reservation: ReservationType | null
  onCancel: () => void
  onConfirm: (userId: number) => Promise<void>
}

export const RestoreReservationModal: React.FC<RestoreReservationModalProps> = ({reservation, onCancel, onConfirm}) => {
  const {session} = useGlobal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!reservation) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm(session?.id)
    } catch (err) {
      setError('予約の復元に失敗しました')
      console.error('予約復元エラー:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">予約の復元</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-500 focus:outline-none">
          <X size={20} />
        </button>
      </div>

      <Padding>
        <div className="space-y-4">
          <div>
            <p className="text-green-600 font-medium">取り消された予約を復元します。予約は再度有効になります。</p>
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

              <div className="text-gray-500">取り消し理由:</div>
              <div className="font-medium">{reservation.cancelReason || '理由なし'}</div>

              <div className="text-gray-500">取り消し日時:</div>
              <div className="font-medium">
                {reservation?.canceledAt && formatDate(reservation?.canceledAt, 'yyyy/MM/dd HH:mm')}
              </div>
            </div>
          </div>

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '処理中...' : '予約を復元する'}
          </Button>
        </div>
      </Padding>
    </div>
  )
}
