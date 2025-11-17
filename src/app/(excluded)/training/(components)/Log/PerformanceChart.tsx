'use client'

import React, {useMemo} from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {Bar} from 'react-chartjs-2'
import {WorkoutLogWithMaster} from '../../types/training'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface PerformanceChartProps {
  logList: WorkoutLogWithMaster[]
}

export function PerformanceChart({logList}: PerformanceChartProps) {
  // 日付でソートされたログ（最大10件）
  const sortedlogList = useMemo(() => {
    return [...logList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10)
  }, [logList])

  // チャートデータの作成
  const chartData = useMemo(() => {
    const labels = sortedlogList.map(log => {
      const date = new Date(log.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    return {
      labels,
      datasets: [
        {
          label: '重量 (kg)',
          data: sortedlogList.map(log => log.strength),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: '回数',
          data: sortedlogList.map(log => log.reps),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    }
  }, [sortedlogList])

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '重量 (kg)',
        },
        min: 0,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '回数',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
      },
    },
  }

  if (logList.length < 2) {
    return <div className="text-center py-4 text-gray-500">過去の記録が不足しているため、グラフを表示できません</div>
  }

  return <Bar data={chartData} options={options} height={200} />
}
