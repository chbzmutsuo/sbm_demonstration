import {useState, useCallback} from 'react'
import {ExpenseFormData, AIDraft} from '../types'
import {DEFAULT_CONVERSATION_PURPOSES} from '../(constants)/conversation-purposes'
import {getTodayString} from '../utils'

interface UseExpenseFormManagerOptions {
  initialData?: Partial<ExpenseFormData>
}

export const useExpenseFormManager = (options: UseExpenseFormManagerOptions = {}) => {
  const {initialData} = options

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: getTodayString(),
    amount: 0,
    mfSubject: '', // subjectをmfSubjectに統合
    counterparty: '',
    participants: '',
    conversationPurpose: [...DEFAULT_CONVERSATION_PURPOSES], // 配列形式に変更
    keywords: [],
    conversationSummary: '',
    mfTaxCategory: '課仕 10%', // デフォルト税区分
    mfDepartment: '本社', // デフォルト部門
    ...initialData,
  })

  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null)
  const [showDraft, setShowDraft] = useState(false)

  const updateFormData = useCallback((field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const updateMultipleFields = useCallback((updates: Partial<ExpenseFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const addKeyword = useCallback(
    (keyword: string) => {
      if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keyword.trim()],
        }))
      }
    },
    [formData.keywords]
  )

  const removeKeyword = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      date: getTodayString(),
      amount: 0,
      mfSubject: '', // subjectをmfSubjectに統合
      counterparty: '',
      participants: '',
      conversationPurpose: [...DEFAULT_CONVERSATION_PURPOSES], // 配列形式に変更
      keywords: [],
      conversationSummary: '',
      mfTaxCategory: '課仕 10%', // デフォルト税区分
      mfDepartment: '本社', // デフォルト部門
    })
    setAiDraft(null)
    setShowDraft(false)
  }, [])

  const isFormValid = useCallback(() => {
    return !!(formData.date && formData.amount && formData.mfSubject && formData.mfTaxCategory && formData.mfDepartment)
  }, [formData.date, formData.amount, formData.mfSubject, formData.mfTaxCategory, formData.mfDepartment])

  return {
    formData,
    setFormData,
    updateFormData,
    updateMultipleFields,
    addKeyword,
    removeKeyword,
    resetForm,
    isFormValid,
    aiDraft,
    setAiDraft,
    showDraft,
    setShowDraft,
  }
}
