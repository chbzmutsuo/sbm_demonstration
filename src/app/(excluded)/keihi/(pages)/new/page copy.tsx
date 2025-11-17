'use client'

import {useState, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {useExpenseFormManager} from '@app/(excluded)/keihi/hooks/useExpenseFormManager'
import {useImageUpload} from '@app/(excluded)/keihi/hooks/useImageUpload'
import {generateInsightsDraft} from '@app/(excluded)/keihi/actions/expense/insights'
import {analyzeReceiptImage} from '@app/(excluded)/keihi/actions/expense/analyzeReceipt'
import {createExpenseAction} from '@app/(excluded)/keihi/actions/expense-create-actions'
import ExpenseEditor from '@app/(excluded)/keihi/(pages)/expense/[id]/edit/ExpenseEditor'

// 共通のフィールドクラス生成関数
const getFieldClass = (value: string | number | string[], required = false) => {
  const baseClass = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  if (required) {
    const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
    return hasValue ? `${baseClass} border-green-300 bg-green-50` : `${baseClass} border-red-300 bg-red-50`
  }
  const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
  return hasValue ? `${baseClass} border-blue-300 bg-blue-50` : `${baseClass} border-gray-300`
}

const NewExpensePage = () => {
  const router = useRouter()

  // カスタムフック
  const {
    formData,
    updateFormData,
    updateMultipleFields,
    addKeyword,
    removeKeyword,
    isFormValid,
    aiDraft,
    setAiDraft,
    showDraft,
    setShowDraft,
  } = useExpenseFormManager()

  const {uploadedImages, capturedImageFiles, isProcessing: isImageProcessing, processFiles, clearImages} = useImageUpload()

  // const {modalState, openModal, closeModal} = usePreviewModal()

  // 状態管理
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [additionalInstruction, setAdditionalInstruction] = useState('')

  // 画像アップロード処理
  const handleImageCapture = useCallback(
    async (files: File[]) => {
      try {
        const result = await processFiles(files)
        if (result && result.base64Images.length > 0) {
          // 最初の画像を自動解析
          await handleImageAnalysis(result.base64Images[0])
        }
      } catch (error) {
        console.error('画像処理エラー:', error)
      }
    },
    [processFiles]
  )

  // 画像解析処理
  const handleImageAnalysis = useCallback(
    async (base64Image: string) => {
      setIsAnalyzing(true)
      setAnalysisStatus('領収書を解析中...')

      try {
        const result = await analyzeReceiptImage(base64Image)

        if (result.success && result.data) {
          // フォームデータを更新
          updateMultipleFields({
            date: result.data.date,
            amount: result.data.amount,
            mfSubject: result.data.mfSubject, // subjectをmfSubjectに変更
            counterparty: result.data.counterparty,
            participants: result.data.suggestedCounterparties.join(','),
            keywords: result.data.generatedKeywords,
          })

          toast.success('領収書を解析しました！内容を確認してください。')
        } else {
          toast.error(result.error || '画像解析に失敗しました')
        }
      } catch (error) {
        console.error('画像解析エラー:', error)
        toast.error('画像解析に失敗しました')
      } finally {
        setIsAnalyzing(false)
        setAnalysisStatus('')
      }
    },
    [updateMultipleFields]
  )

  // AIインサイト生成（統合フォーム対応）
  const handleGenerateInsights = useCallback(async () => {
    if (!isFormValid()) {
      toast.error('必須項目（日付、金額、摘要、税区分、部門）を入力してください')
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateInsightsDraft(formData, additionalInstruction || undefined)

      if (result.success && result.data) {
        // AIの結果を直接フォームデータに設定（統合フォーム版）
        updateFormData('summary', result.data.summary || '')
        updateFormData('insight', result.data.insight || '')
        updateFormData('conversationSummary', result.data.conversationSummary || formData.conversationSummary || '')
        updateFormData('mfSubject', result.data.mfSubject || formData.mfSubject || '')
        updateFormData('mfSubAccount', result.data.mfSubAccount || formData.mfSubAccount || '')
        updateFormData('autoTags', result.data.autoTags || [])

        // 生成されたキーワードを既存のキーワードに追加
        if (result.data.generatedKeywords && result.data.generatedKeywords.length > 0) {
          const newKeywords = [...new Set([...formData.keywords, ...result.data.generatedKeywords])]
          updateFormData('keywords', newKeywords)
        }

        // 変更された項目を記録（ハイライト表示用）
        updateFormData('_changedFields', {
          summary: !!result.data.summary,
          insight: !!result.data.insight,
          conversationSummary: !!result.data.conversationSummary,
          mfSubject: !!result.data.mfSubject,
          mfSubAccount: !!result.data.mfSubAccount,
        })

        toast.success('AIインサイトを生成しました')
      } else {
        toast.error(result.error || 'AIインサイト生成に失敗しました')
      }
    } catch (error) {
      console.error('AIインサイト生成エラー:', error)
      toast.error('AIインサイト生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }, [formData, additionalInstruction, isFormValid, updateFormData])

  // フォーム送信
  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) {
      toast.error('必須項目（日付、金額、摘要、税区分、部門）を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      // 画像ファイルがある場合は、APIを使用して処理
      // Server Actionは直接Fileオブジェクトを処理できないため、API経由で処理
      // let result

      // if (capturedImageFiles.length > 0) {
      //   // 画像ファイル付きの場合はAPI経由で処理
      //   const formDataObj = new FormData()

      //   // フォームデータをJSON文字列として追加
      //   formDataObj.append('formData', JSON.stringify(formData))
      //   formDataObj.append('withAI', 'true')
      //   formDataObj.append('aiDraft', JSON.stringify(aiDraft))

      //   // 画像ファイルを追加
      //   capturedImageFiles.forEach((file, index) => {
      //     formDataObj.append(`file${index}`, file)
      //   })

      //   // API呼び出し
      //   const response = await fetch('/api/keihi/expense/create', {
      //     method: 'POST',
      //     body: formDataObj,
      //   })

      //   result = await response.json()
      // } else {
      //   // 画像ファイルがない場合はServer Actionを直接呼び出し
      // }
      const result = await createExpenseAction(formData, capturedImageFiles, true, aiDraft)

      if (result.success) {
        toast.success('経費記録を作成しました')
        router.push('/keihi')
      } else {
        toast.error(result.error || '経費記録の作成に失敗しました')
      }
    } catch (error) {
      console.error('経費記録作成エラー:', error)
      toast.error('経費記録の作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, aiDraft, capturedImageFiles, isFormValid, router])

  return <ExpenseEditor expenseId={''} onUpdate={() => {}} />
}

export default NewExpensePage
