import React from 'react'
import {getDashboardData} from './_actions/dashboard-actions'
import DashboardClient from './DashboardClient'
import {FitMargin} from '@cm/components/styles/common-components/common-components'

const PortalHomePage = async () => {
  const today = new Date()
  today.setDate(today.getDate() + 3)

  // ダッシュボードデータを取得
  const result = await getDashboardData(today)

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">データの取得に失敗しました</p>
        </div>
      </div>
    )
  }

  return (
    <FitMargin>
      <DashboardClient products={result.data.products} calendar={result.data.calendar} workingDays={result.data.workingDays} />
    </FitMargin>
  )
}

export default PortalHomePage
