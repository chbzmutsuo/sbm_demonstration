'use client'

import React, {useState, useEffect} from 'react'
import {getDeliveryStats} from '../(builders)/deliveryActions'

interface DeliveryStatsProps {
  selectedDate: Date
}

interface Stats {
  groupCount: number
  unassignedCount: number
  completedCount: number
  totalDistance: number
}

export const DeliveryStats: React.FC<DeliveryStatsProps> = ({selectedDate}) => {
  const [stats, setStats] = useState<Stats>({
    groupCount: 0,
    unassignedCount: 0,
    completedCount: 0,
    totalDistance: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [selectedDate])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const data = await getDeliveryStats(selectedDate)
      setStats(data)
    } catch (error) {
      console.error('統計情報の取得に失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.groupCount}</div>
        <div className="text-sm text-gray-600">配達グループ数</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.unassignedCount}</div>
        <div className="text-sm text-gray-600">未割り当て配達</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
        <div className="text-sm text-gray-600">完了済み配達</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.totalDistance}</div>
        <div className="text-sm text-gray-600">総配達距離 (km)</div>
      </div>
    </div>
  )
}

export default DeliveryStats
