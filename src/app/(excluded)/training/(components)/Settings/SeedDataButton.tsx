'use client'

import React, {useState} from 'react'
import {seedTrainingData} from '../../server-actions/seed-data'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

interface SeedDataButtonProps {
  className?: string
}

export function SeedDataButton({className = ''}: SeedDataButtonProps) {
  const {session} = useGlobal()
  const userId = session?.id

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    data?: {
      mastersCreated: number
      logListCreated: number
      totalMasters: number
      totallogList: number
    }
  } | null>(null)

  const handleSeedData = async () => {
    if (!userId) {
      alert('ログインが必要です')
      return
    }

    if (!confirm('テストデータを生成しますか？\n既存の種目マスタは保持されます。')) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const seedResult = await seedTrainingData(userId)
      setResult(seedResult)
    } catch (error) {
      console.error('シーディング中にエラーが発生しました:', error)
      setResult({
        success: false,
        message: `エラーが発生しました: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center">
        <button
          onClick={handleSeedData}
          disabled={isLoading || !userId}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '処理中...' : 'テストデータを生成'}
        </button>
        <p className="text-sm text-slate-500 mt-2">※ 種目マスタとトレーニング記録のサンプルデータを生成します</p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className={`font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
          {result.success && result.data && (
            <div className="mt-2 text-sm">
              <p>
                <span className="font-medium">種目マスタ:</span> {result.data.mastersCreated}件作成 (合計:{' '}
                {result.data.totalMasters}件)
              </p>
              <p>
                <span className="font-medium">トレーニング記録:</span> {result.data.logListCreated}件作成 (合計:{' '}
                {result.data.totallogList}件)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
