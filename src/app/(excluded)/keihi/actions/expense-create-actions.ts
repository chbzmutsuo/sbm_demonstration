'use server'

import prisma from 'src/lib/prisma'
import {ExpenseFormData} from '../types'
import {uploadAttachment, linkAttachmentsToExpense} from './expense-actions'

// 経費記録作成（画像なし）
export async function createExpenseAction(
  formData: ExpenseFormData,
  imageFiles?: File[],
  withAI: boolean = false,
  aiDraft?: any
) {
  try {
    // 1. 経費レコードを作成
    const expense = await prisma.keihiExpense.create({
      data: {
        // 基本情報
        date: new Date(formData.date),
        amount: formData.amount,
        mfSubject: formData.mfSubject || '', // mfSubjectを使用
        counterparty: formData.counterparty,
        participants: formData.participants,
        conversationPurpose: formData.conversationPurpose,
        keywords:
          withAI && aiDraft?.generatedKeywords
            ? [...new Set([...formData.keywords, ...aiDraft.generatedKeywords])]
            : formData.keywords,

        // 会話記録
        conversationSummary: formData.conversationSummary,
        summary: withAI && aiDraft?.summary ? aiDraft.summary : formData.summary,

        // AI生成情報
        insight: withAI && aiDraft?.insight ? aiDraft.insight : formData.insight,
        autoTags: withAI && aiDraft?.autoTags ? aiDraft.autoTags : formData.autoTags || [],
        status: formData.status,

        // MoneyForward用情報
        mfSubAccount: formData.mfSubAccount,
        mfTaxCategory: formData.mfTaxCategory,
        mfDepartment: formData.mfDepartment,
      },
    })

    // 2. 画像ファイルがある場合は処理
    if (imageFiles && imageFiles.length > 0) {
      const attachmentIds: string[] = []

      for (const file of imageFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResult = await uploadAttachment(formData)
        if (uploadResult.success && uploadResult.data) {
          attachmentIds.push(uploadResult.data.id)
        }
      }

      // 添付ファイルを経費レコードに関連付け
      if (attachmentIds.length > 0) {
        await linkAttachmentsToExpense(expense.id, attachmentIds)
      }
    }

    return {success: true, data: expense}
  } catch (error) {
    console.error('経費記録作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '経費記録の作成に失敗しました',
    }
  }
}

// AIドラフトを使用した経費記録作成（画像なし）
export async function createExpenseWithDraftAction(formData: ExpenseFormData, draft: any) {
  return createExpenseAction(formData, undefined, true, draft)
}
