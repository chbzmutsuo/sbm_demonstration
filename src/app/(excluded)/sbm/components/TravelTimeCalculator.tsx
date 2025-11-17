'use client'

import React, {useState, useEffect} from 'react'
import {Clock, AlertTriangle, CheckCircle, XCircle, Loader2} from 'lucide-react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {cn} from '@cm/shadcn/lib/utils'

type TravelTimeCalculatorProps = {
  reservations: ReservationType[]
}

/**
 * 配達地点間の所要時間を計算して表示するコンポーネント
 * サーバーサイドAPIを使用して計算する実装
 */
const TravelTimeCalculator: React.FC<TravelTimeCalculatorProps> = ({reservations}) => {
  const [travelTimes, setTravelTimes] = useState<{[key: string]: number}>({})
  const [timeValidation, setTimeValidation] = useState<{[key: string]: 'ok' | 'warning' | 'error'}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortedReservations, setSortedReservations] = useState<ReservationType[]>([])

  // 予約を時間でソート
  useEffect(() => {
    const sorted = [...reservations].sort((a, b) => {
      const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0
      const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0
      return dateA - dateB
    })
    setSortedReservations(sorted)
  }, [reservations])

  // 所要時間を計算
  useEffect(() => {
    calculateTravelTimes()
  }, [sortedReservations])

  // 配達地点間の所要時間を計算
  const calculateTravelTimes = async () => {
    if (sortedReservations.length < 2) {
      setLoading(false)
      return
    }

    try {
      const times: {[key: string]: number} = {}
      const validation: {[key: string]: 'ok' | 'warning' | 'error'} = {}

      // 予約から住所文字列を取得
      const getAddressString = (reservation: ReservationType): string => {
        // 郵便番号があれば先頭に追加
        const postalCode = reservation.postalCode ? `${reservation.postalCode} ` : ''
        return `${postalCode}${reservation.prefecture}${reservation.city}${reservation.street}`
      }

      // 隣接する予約間の所要時間を計算
      const calculateTimeBetween = async (fromReservation: ReservationType, toReservation: ReservationType) => {
        try {
          const fromAddress = getAddressString(fromReservation)
          const toAddress = getAddressString(toReservation)

          const response = await fetch('/api/google-maps/directions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              origin: fromAddress,
              destination: toAddress,
            }),
          })

          if (!response.ok) {
            throw new Error(`ルート計算に失敗しました: ${response.statusText}`)
          }

          const data = await response.json()

          // Google APIによる所要時間（秒）
          const travelTimeSeconds = data.duration.value || 0

          // 予約時間の差（秒）
          const fromTime = new Date(fromReservation.deliveryDate || '').getTime()
          const toTime = new Date(toReservation.deliveryDate || '').getTime()
          const timeDiffSeconds = (toTime - fromTime) / 1000

          // 時間差と所要時間を比較して適切性を判定
          let validationStatus: 'ok' | 'warning' | 'error'
          if (timeDiffSeconds >= travelTimeSeconds * 1.5) {
            validationStatus = 'ok' // 十分な時間がある
          } else if (timeDiffSeconds >= travelTimeSeconds) {
            validationStatus = 'warning' // ギリギリ
          } else {
            validationStatus = 'error' // 時間が足りない
          }

          return {
            travelTime: travelTimeSeconds,
            validation: validationStatus,
          }
        } catch (error) {
          console.error('ルート計算エラー:', error)
          throw new Error('ルート計算に失敗しました')
        }
      }

      try {
        if (sortedReservations.length < 2) {
          throw new Error('有効な予約が2つ以上必要です')
        }

        // 隣接する予約間の所要時間を計算
        for (let i = 0; i < sortedReservations.length - 1; i++) {
          const fromReservation = sortedReservations[i]
          const toReservation = sortedReservations[i + 1]

          const fromId = fromReservation.id
          const toId = toReservation.id
          const key = `${fromId}-${toId}`

          try {
            const result = await calculateTimeBetween(fromReservation, toReservation)

            times[key] = result.travelTime
            validation[key] = result.validation
          } catch (err) {
            console.error(`予約ID ${fromId} から ${toId} への所要時間計算に失敗しました:`, err)
            // エラーがあっても続行
          }
        }

        setTravelTimes(times)
        setTimeValidation(validation)
      } catch (err) {
        console.error('所要時間計算エラー:', err)
        setError('所要時間の計算に失敗しました')
      }
    } catch (err) {
      console.error('API初期化エラー:', err)
      setError('APIの初期化に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 所要時間を表示用にフォーマット
  const formatTravelTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}秒`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}分`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}時間${minutes}分`
    }
  }

  // 検証ステータスのアイコンを取得
  const getValidationIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <CheckCircle size={16} className="text-green-500" />
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />
      case 'error':
        return <XCircle size={16} className="text-red-500" />
      default:
        return null
    }
  }

  // 検証ステータスに基づく背景色を取得
  const getRowClassName = (status: 'ok' | 'warning' | 'error' | null) => {
    if (!status) return ''

    switch (status) {
      case 'ok':
        return 'bg-green-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'error':
        return 'bg-red-50'
      default:
        return ''
    }
  }

  // if (sortedReservations.length < 2) {
  //   return <div className="text-sm text-gray-500 p-4">所要時間を計算するには2件以上の予約が必要です</div>
  // }

  if (loading) {
    return (
      <div className="text-sm text-gray-500 p-4 flex items-center">
        <Loader2 className="animate-spin mr-2" size={16} />
        所要時間を計算中...
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-red-500 p-4">{error}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-1.5 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順番</th>
            <th className="px-1.5 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">納品時間</th>
            <th className="px-1.5 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客</th>
            <th className="px-1.5 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文詳細</th>
            <th className="px-1.5 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">判定</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedReservations.map((reservation, index) => {
            const nextReservation = sortedReservations[index + 1]
            const key = nextReservation ? `${reservation.id}-${nextReservation.id}` : ''

            const travelTime = nextReservation ? travelTimes[key] : null
            const validation = nextReservation ? timeValidation[key] : null

            const previousValidation = index > 0 ? timeValidation[`${sortedReservations[index - 1].id}-${reservation.id}`] : null
            // 2行で1セットとして表示（予約情報行と移動時間行）
            return (
              <React.Fragment key={reservation.id}>
                {/* 予約情報行 */}
                <tr className={cn(getRowClassName(previousValidation), ' border-b-gray-500 border-b-2')}>
                  <td className="px-1.5 py-1 whitespace-nowrap">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-1.5 py-1 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(reservation.deliveryDate || '').toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-1.5 py-1">
                    <R_Stack className="text-sm font-medium text-gray-900">
                      <div>{reservation.customerName}</div>
                      <div>{reservation.contactName}</div>
                    </R_Stack>
                    <div className="text-xs text-gray-500">
                      {reservation.prefecture}
                      {reservation.city}
                      {reservation.street}
                    </div>
                  </td>
                  <td className="px-1.5 py-1" colSpan={2}>
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.items?.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.productName} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* 移動時間行（最後の予約以外に表示） */}
                {nextReservation && (
                  <tr className={cn(getRowClassName(validation), 'hover:bg-gray-50  ')}>
                    <td className="px-1.5 py-1"></td>
                    <td className="px-1.5 py-1"></td>
                    <td className="px-1.5 py-1 text-right"></td>
                    <td className="px-1.5 py-1 whitespace-nowrap">
                      {travelTime || travelTime === 0 ? (
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1 text-gray-400" />
                          <span className="text-sm font-medium">{formatTravelTime(travelTime)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">計算中...</span>
                      )}
                    </td>
                    <td className="px-1.5 py-1">
                      {validation && (
                        <div className="flex items-center">
                          {getValidationIcon(validation)}
                          <span className="ml-1 text-xs">
                            {validation === 'ok' ? '余裕あり' : validation === 'warning' ? 'ギリギリ' : '時間不足'}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TravelTimeCalculator
