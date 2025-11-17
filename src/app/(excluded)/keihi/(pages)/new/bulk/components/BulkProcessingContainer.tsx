'use client'
import React, {useState, useCallback, useRef} from 'react'
import {toast} from 'react-toastify'

import {AnalyzedReceipt, BulkProcessingSummary} from '@app/(excluded)/keihi/types'
import {BulkUploadSection} from './BulkUploadSection'
import {BulkProcessingResults} from './BulkProcessingResults'
import {BulkProcessingStatus} from './BulkProcessingStatus'

import {fetchAnalyzeReceiptImage} from '@app/(excluded)/keihi/api/analyzeReceiptImage/fetchAnalyzeReceiptImage'
import useLogOnRender from '@cm/hooks/useLogOnRender'
import ContentPlayer from '@cm/components/utils/ContentPlayer'

interface BulkProcessingContainerProps {
  onComplete?: () => void
}

export const BulkProcessingContainer = ({onComplete}: BulkProcessingContainerProps) => {
  // 状態管理
  useLogOnRender()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [analyzedReceipts, setAnalyzedReceipts] = useState<AnalyzedReceipt[]>([])
  const [processingResults, setProcessingResults] = useState<BulkProcessingSummary | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [hasProcessedResults, setHasProcessedResults] = useState(false)
  const fileNameRef = useRef<string[]>([])

  // 重複処理防止用のref
  const isProcessingRef = useRef(false)

  // 処理結果を一括で設定する関数
  const setProcessingResultsAll = useCallback((receipts: AnalyzedReceipt[], summary: BulkProcessingSummary | null) => {
    console.log('Setting processing results:', receipts, summary)
    setAnalyzedReceipts(receipts)
    setProcessingResults(summary)
    setHasProcessedResults(true)
  }, [])

  // 新しい処理を開始する際の状態リセット
  const resetProcessingState = useCallback(() => {
    setAnalyzedReceipts([])
    setProcessingResults(null)
    setUploadedImages([])
    setHasProcessedResults(false)
    setAnalysisStatus('')
  }, [])

  // 画像アップロード処理
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files: File[] = []
      for (let i = 0; i < (event.target.files?.length || 0); i++) {
        files.push(event.target.files?.[i] as unknown as File)
      }

      if (!files || files.length === 0) {
        return
      }

      // 新しい画像をアップロードする際は前の結果をリセット
      resetProcessingState()

      try {
        setIsAnalyzing(true)
        setAnalysisStatus(`${files.length}枚の画像を解析中...`)

        const imageFiles = files.filter(file => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
          toast.error('画像ファイルが含まれていません')
          return
        }

        if (imageFiles.length !== files.length) {
          toast.warning(`${files.length - imageFiles.length}個の非画像ファイルをスキップしました`)
        }

        // Base64変換 + ファイル名保持
        const base64Images: string[] = []
        const names: string[] = []
        for (const file of imageFiles) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = e => {
              const result = e.target?.result as string
              const base64Data = result.split(',')[1]
              resolve(base64Data)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          base64Images.push(base64)
          names.push(file.name)
        }

        setUploadedImages(base64Images)
        fileNameRef.current = names
        toast.success(`${imageFiles.length}枚の画像をアップロードしました`)
      } catch (error) {
        console.error('画像アップロードエラー:', error)
        toast.error('画像のアップロードに失敗しました')
      } finally {
        setIsAnalyzing(false)
        setAnalysisStatus('')
        // ファイル入力をリセット
        if (event.target) {
          event.target.value = ''
        }
      }
    },
    [resetProcessingState]
  )

  // 一括解析実行
  const handleBulkAnalysis = useCallback(async () => {
    if (uploadedImages.length === 0) {
      toast.error('画像をアップロードしてください')
      return
    }

    // 重複実行を防ぐ
    if (isProcessingRef.current) {
      return
    }

    try {
      isProcessingRef.current = true
      setIsAnalyzing(true)
      setAnalysisStatus('画像を解析してレコードを作成中...')

      const result = await fetchAnalyzeReceiptImage(uploadedImages, fileNameRef.current)

      if (result.success && result.data) {
        const receiptsWithImageData = result.data.map(record => ({
          ...record,
          imageData: uploadedImages[record.imageIndex],
          counterparty: '', // デフォルト値を設定（APIレスポンスにlocationが含まれていない）
          mfMemo: '', // デフォルト値を設定
        }))

        // 状態を一括で更新して再レンダリングを最小化
        setProcessingResultsAll(receiptsWithImageData, result.summary || null)

        // 処理結果に応じたメッセージを表示
        if (result.summary) {
          const {recordsCreated, imagesUploaded, failedRecords, failedImages} = result.summary
          if (failedRecords > 0 || failedImages > 0) {
            toast.warning(
              `処理完了: ${recordsCreated}件作成、${imagesUploaded}件画像保存、${failedRecords}件失敗、${failedImages}件画像失敗`
            )
          } else {
            toast.success(`${recordsCreated}件のレコードと${imagesUploaded}件の画像を正常に保存しました`)
          }
        } else {
          toast.success(`${result.data.length}件のレコードを作成しました`)
        }
      } else {
        toast.error(result.error || '解析に失敗しました')
      }
    } catch (error) {
      console.error('一括解析エラー:', error)
      toast.error('一括解析に失敗しました')
    } finally {
      isProcessingRef.current = false
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }, [uploadedImages, setProcessingResultsAll])

  // 画像プレビュー（メモ化）
  const getImagePreview = useCallback((base64Data: string) => {
    return `data:image/jpeg;base64,${base64Data}`
  }, [])

  return (
    <div className="space-y-6">
      {/* 画像アップロードセクション */}
      <BulkUploadSection
        onImageUpload={handleImageUpload}
        isAnalyzing={isAnalyzing}
        uploadedCount={uploadedImages.length}
        hasProcessedResults={hasProcessedResults}
        onReset={resetProcessingState}
      />

      {/* アップロード済み画像一覧 */}
      {uploadedImages.length > 0 && !hasProcessedResults && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">アップロード済み画像 ({uploadedImages.length}枚)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            {uploadedImages.map((imageData, index) => (
              <div key={index} className="relative">
                <ContentPlayer
                  src={getImagePreview(imageData)}
                  styles={{
                    thumbnail: {width: 80, height: 80},
                  }}
                />

                <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">{index + 1}</div>
              </div>
            ))}
          </div>
          <button
            onClick={handleBulkAnalysis}
            disabled={isAnalyzing || analyzedReceipts.length > 0}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {isAnalyzing ? '解析中...' : '一括解析・レコード作成'}
          </button>
        </div>
      )}

      {/* 処理状況表示 */}
      {isAnalyzing && analysisStatus && <BulkProcessingStatus status={analysisStatus} />}

      {/* 処理結果表示 */}
      {hasProcessedResults && (
        <BulkProcessingResults
          uploadedImages={uploadedImages}
          analyzedReceipts={analyzedReceipts}
          processingResults={processingResults}
          getImagePreview={getImagePreview}
          onReset={resetProcessingState}
          onComplete={onComplete}
        />
      )}
    </div>
  )
}
