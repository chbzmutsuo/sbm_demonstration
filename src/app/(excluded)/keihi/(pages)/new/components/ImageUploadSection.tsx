'use client'

import {base64ToDataUrl} from '../../../utils'
import ContentPlayer from '@cm/components/utils/ContentPlayer'

interface ImageUploadSectionProps {
  uploadedImages: string[]
  onImageCapture: (files: File[]) => void

  isAnalyzing: boolean
  analysisStatus: string
}

export const ImageUploadSection = ({
  uploadedImages,
  onImageCapture,

  isAnalyzing,
  analysisStatus,
}: ImageUploadSectionProps) => {
  return (
    <div className="mb-6">
      {/* カメラ・画像アップロード */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
          <label htmlFor="image-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">領収書画像をアップロード</span>
            <span className="mt-1 block text-sm text-gray-500">PNG, JPG, JPEG形式に対応</span>
          </label>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={e => {
              const files = e.target.files
              if (files) {
                onImageCapture(Array.from(files))
              }
            }}
            className="hidden"
          />
        </div>
        <button
          type="button"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? '解析中...' : 'ファイルを選択'}
        </button>
      </div>

      {/* 解析状況 */}
      {isAnalyzing && analysisStatus && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">{analysisStatus}</p>
          </div>
        </div>
      )}

      {/* アップロード済み画像のプレビュー */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">📷 アップロード済み画像 ({uploadedImages.length}枚)</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedImages.map((imageBase64, index) => {
              const imageUrl = base64ToDataUrl(imageBase64)

              return (
                <div key={index} className="relative group">
                  <ContentPlayer src={imageUrl} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
