'use client'

import {useRouter} from 'next/navigation'

interface FormActionsProps {
  isLoading: boolean
  isAnalyzing: boolean
  aiDraft: any
  showDraft: boolean
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function FormActions({isLoading, isAnalyzing, aiDraft, showDraft, onSubmit}: FormActionsProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 order-2 sm:order-1"
      >
        キャンセル
      </button>
      <button
        type="submit"
        disabled={isLoading || isAnalyzing}
        onClick={onSubmit}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
      >
        {(isLoading || isAnalyzing) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
        {isLoading ? '作成中...' : isAnalyzing ? '解析中...' : '作成'}
      </button>
    </div>
  )
}
