'use client'

import {ExpenseFormData} from '@app/(excluded)/keihi/types'
import {useState, useCallback} from 'react'

interface KeywordManagerProps {
  formData: ExpenseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>
}

export default function KeywordManager({formData, setFormData}: KeywordManagerProps) {
  const [keywordInput, setKeywordInput] = useState('')

  // キーワード追加
  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }))
      setKeywordInput('')
    }
  }, [keywordInput, formData.keywords, setFormData])

  // キーワード削除
  const removeKeyword = useCallback(
    (keyword: string) => {
      setFormData(prev => ({
        ...prev,
        keywords: prev.keywords?.filter(k => k !== keyword) || [],
      }))
    },
    [setFormData]
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">キーワード</label>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          value={keywordInput}
          onChange={e => setKeywordInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="キーワードを入力してEnter"
        />
        <button
          type="button"
          onClick={addKeyword}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:w-auto w-full"
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData.keywords?.map(keyword => (
          <span key={keyword} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            {keyword}
            <button type="button" onClick={() => removeKeyword(keyword)} className="ml-2 text-blue-600 hover:text-blue-800">
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
