'use client'

import React from 'react'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {BulkProcessingContainer} from './components/BulkProcessingContainer'

const BulkCreatePage = React.memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">一括経費登録</h1>
              <T_LINK href="/keihi" className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                戻る
              </T_LINK>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 複数枚の領収書画像を一括でアップロード・解析できます</p>
              <p>• 基本情報（日付、金額、科目、キーワード）のみでレコードを作成します</p>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            <BulkProcessingContainer />
          </div>
        </div>
      </div>
    </div>
  )
})

export default BulkCreatePage
