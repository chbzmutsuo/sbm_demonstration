import {useRouter} from 'next/navigation'
import {useState, useCallback} from 'react'
import {toast} from 'react-toastify'

import {AnalyzedReceipt, BulkProcessingSummary} from '@app/(excluded)/keihi/types'
import {getExpenseById, updateExpense} from '@app/(excluded)/keihi/actions/expense-actions'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import {generateInsightsCore} from '@app/(excluded)/keihi/actions/expense/insights'
import {ExpenseFormData} from '@app/(excluded)/keihi/types'

interface BulkProcessingResultsProps {
  uploadedImages: string[]
  analyzedReceipts: AnalyzedReceipt[]
  processingResults: BulkProcessingSummary | null
  getImagePreview: (base64Data: string) => string
  onReset: () => void
  onComplete?: () => void
}

export const BulkProcessingResults = ({
  uploadedImages,
  analyzedReceipts,
  processingResults,
  getImagePreview,
  onReset,
  onComplete,
}: BulkProcessingResultsProps) => {
  const router = useRouter()
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [insightProgress, setInsightProgress] = useState({current: 0, total: 0})

  // バックグラウンドインサイト生成
  const handleGenerateInsights = useCallback(async () => {
    if (analyzedReceipts.length === 0) {
      toast.error('作成されたレコードがありません')
      return
    }

    try {
      setIsGeneratingInsights(true)
      setInsightProgress({current: 0, total: analyzedReceipts.length})

      const expenseIds = analyzedReceipts.map(record => record.id).filter((id): id is string => id !== undefined)

      // プログレス更新のため、個別に処理
      let processedCount = 0
      for (const expenseId of expenseIds) {
        setInsightProgress({current: processedCount, total: analyzedReceipts.length})

        const createInsights = async () => {
          const expenseRes = await getExpenseById(expenseId)
          const formData = expenseRes.data as any as ExpenseFormData

          const insightRes = await generateInsightsCore(formData, {
            additionalInstruction: '',
          })

          if (insightRes.success) {
            const updated = await updateExpense(expenseId, {
              summary: insightRes.data?.summary,
              insight: insightRes.data?.insight,
              conversationSummary: insightRes.data?.conversationSummary,
              mfSubject: insightRes.data?.mfSubject,
              mfSubAccount: insightRes.data?.mfSubAccount,
              autoTags: insightRes.data?.autoTags,
            })
          }
        }

        createInsights()
        await new Promise(resolve => setTimeout(resolve, 500))

        processedCount++
      }

      setInsightProgress({current: analyzedReceipts.length, total: analyzedReceipts.length})
      toast.success('インサイト生成が完了しました。')

      router.push('/keihi')
    } catch (error) {
      console.error('インサイト生成エラー:', error)
      toast.error('インサイト生成の開始に失敗しました')
    } finally {
      setIsGeneratingInsights(false)
    }
  }, [analyzedReceipts, router])

  return (
    <div className="space-y-6">
      {/* 処理完了後の簡略表示 */}
      {uploadedImages.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{uploadedImages.length}</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">処理済み画像: {uploadedImages.length}枚</p>
                <p className="text-sm text-blue-700">解析・レコード作成が完了しました</p>
              </div>
            </div>
            <button
              onClick={async () => {
                onReset()
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              新しい処理を開始
            </button>
          </div>
        </div>
      )}

      {/* 処理結果サマリー */}
      {processingResults && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">処理結果サマリー</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{processingResults.totalImages}</div>
              <div className="text-sm text-gray-600">総画像数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{processingResults.recordsCreated}</div>
              <div className="text-sm text-gray-600">レコード作成成功</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{processingResults.imagesUploaded}</div>
              <div className="text-sm text-gray-600">画像保存成功</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{processingResults.failedRecords}</div>
              <div className="text-sm text-gray-600">レコード作成失敗</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{processingResults.failedImages}</div>
              <div className="text-sm text-gray-600">画像保存失敗</div>
            </div>
          </div>

          {/* 成功率表示 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">レコード作成成功率</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round((processingResults.recordsCreated / processingResults.totalImages) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{width: `${(processingResults.recordsCreated / processingResults.totalImages) * 100}%`}}
              ></div>
            </div>

            <div className="flex justify-between items-center mb-2 mt-3">
              <span className="text-sm font-medium text-gray-700">画像保存成功率</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round((processingResults.imagesUploaded / processingResults.recordsCreated) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{width: `${(processingResults.imagesUploaded / processingResults.recordsCreated) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 解析結果一覧 */}
      {analyzedReceipts.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">処理結果詳細 ({analyzedReceipts.length}件)</h3>
          <div className="space-y-4 mb-6">
            {analyzedReceipts.map((receipt, index) => (
              <div
                key={receipt.id}
                className={`border rounded-lg p-4 ${
                  receipt.recordCreated && receipt.imageUploaded
                    ? 'border-green-200 bg-green-50'
                    : receipt.recordCreated
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                }`}
              >
                {/* 処理状況ヘッダー */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">画像 #{index + 1}</span>
                    {receipt.recordCreated && receipt.imageUploaded && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ 完全成功
                      </span>
                    )}
                    {receipt.recordCreated && !receipt.imageUploaded && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⚠ 部分成功
                      </span>
                    )}
                    {!receipt.recordCreated && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ 失敗
                      </span>
                    )}
                  </div>
                  {receipt.imageData && (
                    <ContentPlayer
                      src={getImagePreview(receipt.imageData)}
                      styles={{
                        thumbnail: {width: 80, height: 80},
                      }}
                    />
                  )}
                </div>

                {/* レコード詳細 */}
                {receipt.recordCreated && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">日付:</span>
                      <span className="ml-2 text-gray-900">{receipt.date || '未設定'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">金額:</span>
                      <span className="ml-2 text-gray-900">¥{receipt.amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">科目:</span>
                      <span className="ml-2 text-gray-900">{receipt.mfSubject || '未分類'}</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">キーワード:</span>
                      <span className="ml-2 text-gray-900">{receipt.keywords || '未設定'}</span>
                    </div>
                  </div>
                )}

                {/* エラー詳細 */}
                {receipt.errors && receipt.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">エラー詳細:</span> {receipt.errors.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingInsights && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isGeneratingInsights ? 'インサイト生成中...' : 'AIインサイト生成 & 一覧へ'}
            </button>
            <button
              onClick={async () => {
                router.push('/keihi')
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              一覧ページへ
            </button>
          </div>

          {/* インサイト生成プログレス */}
          {isGeneratingInsights && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">インサイト生成進捗</span>
                <span className="text-sm font-semibold text-purple-900">
                  {insightProgress.current} / {insightProgress.total}
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{width: `${(insightProgress.current / insightProgress.total) * 100}%`}}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
