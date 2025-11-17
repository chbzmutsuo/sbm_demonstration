'use client'

// 共通のフィールドクラス生成関数
const getFieldClass = (value: string | number | string[], required = false) => {
  const baseClass = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  if (required) {
    const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
    return hasValue ? cn(baseClass, 'border-green-500 bg-green-300/10') : cn(baseClass, 'border-red-500 bg-red-300/10')
  }
  const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
  return hasValue ? cn(baseClass, 'border-blue-500 bg-blue-300/10') : cn(baseClass, 'border-gray-300')
}

import {useState, useCallback} from 'react'
import {ExpenseFormData} from '@app/(excluded)/keihi/types'
import {KEIHI_STATUS, TAX_CATEGORIES} from '@app/(excluded)/keihi/actions/expense/constants'

import {cn} from '@cm/shadcn/lib/utils'
import Input from '@cm/shadcn/ui/Organisms/form/Input'
import Select from '@cm/shadcn/ui/Organisms/form/Select'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

// ハイライト表示用のスタイル
const highlightStyle = 'border-yellow-400 bg-yellow-50 shadow-md transition-all duration-500'

interface ExpenseIntegratedFormProps {
  formData: ExpenseFormData
  setFormData: (field: string, value: any) => void
  allOptions: {
    subjects: Array<{value: string; label: string}>
    industries: Array<{value: string; label: string}>
    purposes: Array<{value: string; label: string}>
  }

  // AI関連のprops
  isGeneratingInsights: boolean
  additionalInstruction: string
  setAdditionalInstruction: React.Dispatch<React.SetStateAction<string>>
  onGenerateInsights: () => Promise<void>
}

export function ExpenseIntegratedForm({
  formData,
  setFormData,
  allOptions,
  isGeneratingInsights,
  additionalInstruction,
  setAdditionalInstruction,
  onGenerateInsights,
}: ExpenseIntegratedFormProps) {
  const [keywordInput, setKeywordInput] = useState('')
  const [conversationPurposeList, setConversationPurposeList] = useState<string[]>(formData.conversationPurpose || [])

  // キーワード追加
  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData('keywords', [...(formData.keywords || []), keywordInput.trim()])
      setKeywordInput('')
    }
  }, [keywordInput, formData.keywords, setFormData])

  // キーワード削除
  const removeKeyword = useCallback(
    (index: number) => {
      setFormData(
        'keywords',
        formData.keywords.filter((_, i) => i !== index)
      )
    },
    [setFormData]
  )

  // 自動タグ追加
  const addAutoTag = useCallback(() => {
    const newTag = prompt('新しいタグを入力してください:')
    if (newTag?.trim()) {
      const currentTags = formData.autoTags || []
      setFormData('autoTags', [...currentTags, newTag.trim()])
    }
  }, [formData.autoTags, setFormData])

  // 自動タグ削除
  const removeAutoTag = useCallback(
    (index: number) => {
      const currentTags = formData.autoTags || []
      setFormData(
        'autoTags',
        currentTags.filter((_, i) => i !== index)
      )
    },
    [formData.autoTags, setFormData]
  )

  return (
    <div className="space-y-8">
      {/* 基本情報セクション */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="sm:col-span-2">
            <Select
              label="ステータス"
              required
              selectType="radio"
              value={formData.status || ''}
              onChange={e => setFormData('status', e.target.value)}
              options={KEIHI_STATUS.map(status => ({value: status.value, label: status.label}))}
              className={`grid  lg:grid-cols-4  gap-4 text-xs  `}
            />
          </div>

          <Input
            label="日付"
            required
            type="date"
            value={formData.date || ''}
            onChange={e => setFormData('date', e.target.value)}
            className={getFieldClass(formData.date || '', true)}
          />
          <Input
            label="金額"
            required
            type="number"
            value={formData.amount ? String(formData.amount) : ''}
            onChange={e => setFormData('amount', parseInt(e.target.value) || 0)}
            className={getFieldClass(formData.amount || '', true)}
          />

          <Input
            label="取引先"
            required
            type="text"
            value={formData.counterparty || ''}
            onChange={e => setFormData('counterparty', e.target.value)}
            className={getFieldClass(formData.counterparty || '', true)}
          />
          <Input
            label="相手名"
            type="text"
            value={formData.participants || ''}
            onChange={e => setFormData('participants', e.target.value)}
            className={getFieldClass(formData.participants || '', true)}
          />

          <div className="sm:col-span-2">
            <Input
              label="会話内容の要約"
              required
              type="textarea"
              value={formData.conversationSummary || ''}
              onChange={e => setFormData('conversationSummary', e.target.value)}
              className={getFieldClass(formData.conversationSummary || '', true)}
              rows={4}
            />
          </div>
        </div>
      </section>
      {/* MoneyForward用情報セクション */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">MoneyForward連携情報</h2>

        <C_Stack className={`gap-8`}>
          <div>
            <Select
              label="勘定科目"
              required
              selectType="radio"
              value={formData.mfSubject || ''}
              onChange={e => setFormData('mfSubject', e.target.value)}
              className={cn('grid  lg:grid-cols-4  gap-4 text-xs  ', getFieldClass(formData.mfSubject || '', true))}
              options={allOptions.subjects}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="補助科目"
              type="text"
              value={formData.mfSubAccount || ''}
              onChange={e => setFormData('mfSubAccount', e.target.value)}
              className={cn(getFieldClass(formData.mfSubAccount || '', true))}
            />

            <Select
              label="税区分"
              required
              selectType="normal"
              value={formData.mfTaxCategory || ''}
              onChange={e => setFormData('mfTaxCategory', e.target.value)}
              className={getFieldClass(formData.mfTaxCategory || '', true)}
              options={TAX_CATEGORIES.map(category => ({value: category.value, label: category.label}))}
            />
          </div>
        </C_Stack>
      </section>

      {/* キーワード設定セクション */}
      <section>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="キーワードを入力してEnterで追加"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              追加
            </button>
          </div>

          {/* 既存キーワード表示 */}
          {formData.keywords?.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">設定済みキーワード:</p>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    onClick={() => {
                      if (confirm('削除しますか？')) {
                        removeKeyword(index)
                      }
                    }}
                    className="cursor-pointerinter inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                    <button type="button" className="ml-2 text-blue-600 hover:text-blue-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {/* インサイト・AI情報セクション */}
      <section className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">インサイト・分析情報</h2>
          <button
            type="button"
            onClick={onGenerateInsights}
            disabled={isGeneratingInsights}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGeneratingInsights && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {isGeneratingInsights ? 'AI生成中...' : 'AIで生成・上書き'}
          </button>
        </div>

        {/* AI追加指示入力 */}
        <div className="mb-4">
          <Input
            label="AIへの追加指示（任意）"
            type="textarea"
            value={additionalInstruction}
            onChange={e => setAdditionalInstruction(e.target.value)}
            className={getFieldClass(additionalInstruction || '', false)}
          />
          {/* <label className="block text-sm font-medium text-gray-700 mb-2">AIへの追加指示（任意）</label>
          <textarea
            value={additionalInstruction}
            onChange={e => setAdditionalInstruction(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="例：技術的な内容を重視して、営業面は簡潔に"
          /> */}
        </div>

        <div className="space-y-4">
          {/* 摘要 */}
          <div>
            <Input
              label="摘要"
              type="text"
              value={formData.summary || ''}
              onChange={e => setFormData('summary', e.target.value)}
              className={getFieldClass(formData.summary || '', true)}
            />
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
            <input
              type="text"
              value={formData.summary || ''}
              onChange={e => setFormData('summary', e.target.value)}
              className={cn(
                //
                getFieldClass(formData.summary || ''),
                formData._changedFields?.summary ? highlightStyle : ''
              )}
              placeholder="経費の簡潔な説明文"
            /> */}
          </div>

          {/* インサイト */}
          <div>
            <Input
              label="インサイト"
              type="textarea"
              value={formData.insight || ''}
              onChange={e => setFormData('insight', e.target.value)}
              className={getFieldClass(formData.insight || '', true)}
              rows={8}
            />
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">
              インサイト
              <span className="text-xs text-gray-500 ml-2">（営業・ビジネス・技術の観点を統合）</span>
            </label>
            <textarea
              value={formData.insight || ''}
              onChange={e => setFormData('insight', e.target.value)}
              rows={5}
              className={cn(
                //
                getFieldClass(formData.insight || ''),
                formData._changedFields?.insight ? highlightStyle : ''
              )}
              placeholder="営業・ビジネス・技術の観点を統合したインサイト"
            /> */}
          </div>

          {/* 自動タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">自動タグ</label>
            <div className="space-y-3">
              {/* 既存タグ表示・編集 */}
              {(formData.autoTags || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(formData.autoTags || []).map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                    >
                      <input
                        type="text"
                        value={tag}
                        onChange={e => {
                          const newTags = [...(formData.autoTags || [])]
                          newTags[index] = e.target.value
                          setFormData('autoTags', newTags)
                        }}
                        className="bg-transparent border-none outline-none text-purple-800 min-w-0 flex-1"
                        style={{width: `${Math.max(tag.length * 8, 50)}px`}}
                      />
                      <button
                        type="button"
                        onClick={() => removeAutoTag(index)}
                        className="text-purple-600 hover:text-purple-800 text-xs ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* タグ追加ボタン */}
              <button
                type="button"
                onClick={addAutoTag}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                タグ追加
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
