'use client'

import {ExpenseFormData} from '@app/(excluded)/keihi/types'

interface ConversationSummaryProps {
  formData: ExpenseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>
  getFieldClass: (value: string | number | string[], required?: boolean) => string
}

export default function ConversationSummary({formData, setFormData, getFieldClass}: ConversationSummaryProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">会話内容の要約</label>
      <textarea
        value={formData.conversationSummary}
        onChange={e => setFormData(prev => ({...prev, conversationSummary: e.target.value}))}
        rows={4}
        className={getFieldClass(formData.conversationSummary || '')}
        placeholder="1〜3文程度の自然文要約"
      />
    </div>
  )
}
