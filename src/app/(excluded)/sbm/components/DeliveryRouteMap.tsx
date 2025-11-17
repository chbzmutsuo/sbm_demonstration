'use client'

import React, {useState, useEffect, useRef, useCallback} from 'react'
import {Loader2, Clock, AlertTriangle, CheckCircle, XCircle} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

// Google Maps APIのタイプ定義
declare global {
  interface Window {
    //@ts-expect-error - google is not typed
    google: any
    initMap: () => void
  }
}

type DeliveryRouteMapProps = {
  reservations: ReservationType[]
  teamId?: number
  optimizeRoute?: boolean
}

/**
 * 配達ルート表示コンポーネント
 * Google Maps APIを使用して配達ルートを表示
 */
const DeliveryRouteMap: React.FC<DeliveryRouteMapProps> = ({reservations, teamId, optimizeRoute = false}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeData, setRouteData] = useState<any>(null)
  const [sortedReservations, setSortedReservations] = useState<ReservationType[]>([])
  const [travelTimes, setTravelTimes] = useState<{[key: string]: number}>({})
  const [timeValidation, setTimeValidation] = useState<{[key: string]: 'ok' | 'warning' | 'error'}>({})

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const directionsRendererRef = useRef<any>(null)

  // 予約を時間でソート
  useEffect(() => {
    const sorted = [...reservations].sort((a, b) => {
      const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0
      const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0
      return dateA - dateB
    })
    setSortedReservations(sorted)
  }, [reservations])

  // Google Maps APIをロード
  const loadGoogleMapsAPI = useCallback(() => {
    if (window.google && window.google.maps) {
      initMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initMap`
    script.async = true
    script.defer = true

    window.initMap = initMap

    script.onerror = () => {
      setError('Google Maps APIのロードに失敗しました')
      setLoading(false)
    }

    document.head.appendChild(script)
  }, [])

  // 地図を初期化
  const initMap = useCallback(() => {
    if (!mapRef.current || sortedReservations.length === 0) {
      setLoading(false)
      return
    }

    try {
      // 地図を作成
      const map = new window.google.maps.Map(mapRef.current, {
        center: {lat: 35.6812, lng: 139.7671}, // 東京
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      })

      googleMapRef.current = map

      // マーカーをクリア
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []

      // ルートレンダラーを初期化
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null)
      }
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
      })

      // 住所をジオコーディングしてマーカーを設置
      const bounds = new window.google.maps.LatLngBounds()
      const geocoder = new window.google.maps.Geocoder()

      // 各予約の住所をジオコーディング
      const geocodePromises = sortedReservations.map((reservation, index) => {
        const address = `${reservation.prefecture}${reservation.city}${reservation.street}`

        return new Promise<{reservation: ReservationType; position: any}>((resolve, reject) => {
          geocoder.geocode({address}, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const position = results[0].geometry.location
              resolve({reservation, position})
            } else {
              reject(`住所のジオコーディングに失敗しました: ${address}`)
            }
          })
        })
      })

      // すべての住所をジオコーディング
      Promise.all(geocodePromises)
        .then(results => {
          // マーカーを設置
          results.forEach(({reservation, position}, index) => {
            const marker = new window.google.maps.Marker({
              position,
              map,
              label: `${index + 1}`,
              title: `${formatDate(reservation.deliveryDate, 'HH:mm')} ${reservation.customerName}`,
            })

            // 情報ウィンドウを作成
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <div style="font-weight: bold;">${reservation.customerName}</div>
                  <div>${formatDate(reservation.deliveryDate, 'HH:mm')}</div>
                  <div>${reservation.prefecture}${reservation.city}${reservation.street}</div>
                </div>
              `,
            })

            marker.addListener('click', () => {
              infoWindow.open(map, marker)
            })

            markersRef.current.push(marker)
            bounds.extend(position)
          })

          // 地図の表示範囲を調整
          map.fitBounds(bounds)

          // ルートを計算
          if (results.length > 1) {
            calculateRoute(results)
          }
        })
        .catch(err => {
          console.error(err)
          setError('住所のジオコーディングに失敗しました')
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (err) {
      console.error('地図の初期化エラー:', err)
      setError('地図の初期化に失敗しました')
      setLoading(false)
    }
  }, [sortedReservations])

  // ルートを計算
  const calculateRoute = useCallback(
    (geocodedResults: any[]) => {
      const directionsService = new window.google.maps.DirectionsService()

      // 出発地点と目的地
      const origin = geocodedResults[0].position
      const destination = geocodedResults[geocodedResults.length - 1].position

      // 経由地点（最大23箇所）
      const waypoints = geocodedResults.slice(1, -1).map((result: any) => ({
        location: result.position,
        stopover: true,
      }))

      // ルートリクエスト
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: optimizeRoute,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(response)
            setRouteData(response)

            // 所要時間を計算
            calculateTravelTimes(response, geocodedResults)
          } else {
            console.error('ルート計算エラー:', status)
            setError('ルートの計算に失敗しました')
          }
        }
      )
    },
    [optimizeRoute]
  )

  // 各地点間の所要時間を計算
  const calculateTravelTimes = useCallback((routeResponse: any, geocodedResults: any[]) => {
    const times: {[key: string]: number} = {}
    const validation: {[key: string]: 'ok' | 'warning' | 'error'} = {}

    // ルートのレッグ（地点間）ごとに所要時間を取得
    const legs = routeResponse.routes[0].legs

    legs.forEach((leg: any, index: number) => {
      const fromReservation = geocodedResults[index].reservation
      const toReservation = geocodedResults[index + 1].reservation

      const fromId = fromReservation.id
      const toId = toReservation.id
      const key = `${fromId}-${toId}`

      // Google APIによる所要時間（秒）
      const travelTimeSeconds = leg.duration.value
      times[key] = travelTimeSeconds

      // 予約時間の差（秒）
      const fromTime = new Date(fromReservation.deliveryDate).getTime()
      const toTime = new Date(toReservation.deliveryDate).getTime()
      const timeDiffSeconds = (toTime - fromTime) / 1000

      // 時間差と所要時間を比較して適切性を判定
      if (timeDiffSeconds >= travelTimeSeconds * 1.5) {
        validation[key] = 'ok' // 十分な時間がある
      } else if (timeDiffSeconds >= travelTimeSeconds) {
        validation[key] = 'warning' // ギリギリ
      } else {
        validation[key] = 'error' // 時間が足りない
      }
    })

    setTravelTimes(times)
    setTimeValidation(validation)
  }, [])

  // Google Maps APIをロード
  useEffect(() => {
    if (sortedReservations.length > 0) {
      loadGoogleMapsAPI()
    }
  }, [sortedReservations, loadGoogleMapsAPI])

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

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* 地図表示エリア */}
      <div ref={mapRef} className="w-full h-[400px] bg-gray-100 rounded-lg relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">地図を読み込み中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 配達ルート情報 */}
      {sortedReservations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">配達スケジュール</h3>
            <p className="text-sm text-gray-500">
              {optimizeRoute ? '最適化されたルート' : '時間順のルート'} ({sortedReservations.length}件)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順番</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">移動時間</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedReservations.map((reservation, index) => {
                  const nextReservation = sortedReservations[index + 1]
                  const key = nextReservation ? `${reservation.id}-${nextReservation.id}` : ''
                  const travelTime = nextReservation ? travelTimes[key] : null
                  const validation = nextReservation ? timeValidation[key] : null

                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDate(reservation.deliveryDate, 'HH:mm')}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900">
                          {reservation.prefecture}
                          {reservation.city}
                          {reservation.street}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {travelTime && (
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-gray-400" />
                            <span className="text-sm text-gray-900">{formatTravelTime(travelTime)}</span>
                            {validation && (
                              <span
                                className="ml-2"
                                title={
                                  validation === 'ok'
                                    ? '十分な時間があります'
                                    : validation === 'warning'
                                      ? '時間がギリギリです'
                                      : '時間が足りません'
                                }
                              >
                                {getValidationIcon(validation)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryRouteMap
