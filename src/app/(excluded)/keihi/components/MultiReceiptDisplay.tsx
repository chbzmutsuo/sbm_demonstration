'use client'

interface MultiReceiptDisplayProps {
  multiReceiptData: {
    receipts: Array<{
      date: string
      amount: number
      mfSubject: string // 統合された科目フィールド
      participants: string
      keywords: string[]
      imageIndex: number
    }>
    totalAmount: number
    suggestedMerge: boolean
    allKeywords: string[]
  } | null
}

export default function MultiReceiptDisplay({multiReceiptData}: MultiReceiptDisplayProps) {
  if (!multiReceiptData || multiReceiptData.receipts.length <= 1) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h4 className="font-medium text-amber-800 mb-2">📋 複数領収書解析結果</h4>
      <div className="space-y-2">
        {multiReceiptData.receipts.map((receipt, index) => (
          <div key={index} className="text-sm text-amber-700 bg-white p-2 rounded border">
            {index + 1}枚目: {receipt.participants} - ¥{receipt.amount.toLocaleString()} ({receipt.date})
          </div>
        ))}
        <div className="text-sm font-medium text-amber-800 pt-2 border-t">
          合計金額: ¥{multiReceiptData.totalAmount.toLocaleString()}
          {multiReceiptData.suggestedMerge && ' (同一取引として統合済み)'}
        </div>
      </div>
    </div>
  )
}
