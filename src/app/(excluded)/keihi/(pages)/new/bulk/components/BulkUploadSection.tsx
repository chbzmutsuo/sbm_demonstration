'use client'

interface BulkUploadSectionProps {
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  isAnalyzing: boolean
  uploadedCount: number
  hasProcessedResults?: boolean
  onReset?: () => void
}

export const BulkUploadSection = ({
  onImageUpload,
  isAnalyzing,
  uploadedCount,
  hasProcessedResults,
  onReset,
}: BulkUploadSectionProps) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="mb-4">
          <label htmlFor="bulk-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">複数の領収書画像をアップロード</span>
            <span className="mt-1 block text-sm text-gray-500">PNG, JPG, JPEG形式に対応</span>
          </label>
          <input
            id="bulk-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            disabled={isAnalyzing}
            className="hidden"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            type="button"
            onClick={() => document.getElementById('bulk-upload')?.click()}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isAnalyzing ? 'アップロード中...' : 'ファイルを選択'}
          </button>
          {hasProcessedResults && onReset && (
            <button
              onClick={onReset}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              新しい処理を開始
            </button>
          )}
        </div>
        {uploadedCount > 0 && <p className="mt-2 text-sm text-green-600">{uploadedCount}枚の画像をアップロードしました</p>}
      </div>
    </div>
  )
}
