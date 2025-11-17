'use client'

import {AnalyzedReceipt} from '../../../../types'
import {formatAmount, formatDate, base64ToDataUrl} from '../../../../utils'
import {Eye} from 'lucide-react'
import ContentPlayer from '@cm/components/utils/ContentPlayer'

interface AnalyzedReceiptsListProps {
  receipts: AnalyzedReceipt[]
  onPreviewImage: (imageUrl: string, fileName: string) => void
}

export const AnalyzedReceiptsList = ({receipts, onPreviewImage}: AnalyzedReceiptsListProps) => {
  if (receipts.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">解析済み領収書一覧 ({receipts.length}件)</h3>
      <div className="space-y-4">
        {receipts.map((receipt, index) => (
          <div key={receipt.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {/* 画像プレビュー */}
              {receipt.imageData && (
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border group">
                    <ContentPlayer
                      src={base64ToDataUrl(receipt.imageData)}
                      styles={{
                        thumbnail: {width: 80, height: 80},
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => onPreviewImage(base64ToDataUrl(receipt.imageData!), `領収書${index + 1}.jpg`)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              )}

              {/* 解析結果 */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                    <p className="text-gray-900">{formatDate(receipt.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                    <p className="text-gray-900 font-semibold">¥{formatAmount(receipt.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                    <p className="text-gray-900">{receipt.mfSubject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">相手名</label>
                    <p className="text-gray-900">{receipt.participants || '-'}</p>
                  </div>
                </div>

                {/* キーワード */}
                {receipt.keywords.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">キーワード</label>
                    <div className="flex flex-wrap gap-1">
                      {receipt.keywords.map((keyword, keywordIndex) => (
                        <span key={keywordIndex} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
