import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {uploadAttachment, linkAttachmentsToExpense} from '@app/(excluded)/keihi/actions/expense-actions'

export async function POST(request: NextRequest) {
  try {
    // マルチパートフォームデータを解析
    const formData = await request.formData()

    // フォームデータとAIドラフトを取得
    const formDataJson = formData.get('formData')
    const withAI = formData.get('withAI') === 'true'
    const aiDraftJson = formData.get('aiDraft')

    if (!formDataJson) {
      return NextResponse.json({success: false, error: 'フォームデータがありません'}, {status: 400})
    }

    // JSON文字列をオブジェクトに変換
    const expenseData = JSON.parse(formDataJson.toString())
    const aiDraft = aiDraftJson ? JSON.parse(aiDraftJson.toString()) : undefined

    // 1. 経費レコードを作成
    const expense = await prisma.keihiExpense.create({
      data: {
        // 基本情報
        date: new Date(expenseData.date),
        amount: expenseData.amount,
        mfSubject: expenseData.mfSubject,
        counterparty: expenseData.counterparty,
        participants: expenseData.participants,
        conversationPurpose: expenseData.conversationPurpose,
        keywords:
          withAI && aiDraft?.generatedKeywords
            ? [...new Set([...expenseData.keywords, ...aiDraft.generatedKeywords])]
            : expenseData.keywords,

        // 会話記録
        conversationSummary: expenseData.conversationSummary,
        summary: withAI && aiDraft?.summary ? aiDraft.summary : expenseData.summary,

        // AI生成情報
        insight: withAI && aiDraft?.insight ? aiDraft.insight : expenseData.insight,
        autoTags: withAI && aiDraft?.autoTags ? aiDraft.autoTags : expenseData.autoTags || [],
        status: expenseData.status,

        // MoneyForward用情報
        mfSubAccount: expenseData.mfSubAccount,
        mfTaxCategory: expenseData.mfTaxCategory,
        mfDepartment: expenseData.mfDepartment,
      },
    })

    // 2. 画像ファイルを処理
    const attachmentIds: string[] = []

    // FormDataからファイルを抽出
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        const file = value
        const fileFormData = new FormData()
        fileFormData.append('file', file)

        const uploadResult = await uploadAttachment(fileFormData)
        if (uploadResult.success && uploadResult.data) {
          attachmentIds.push(uploadResult.data.id)
        }
      }
    }

    // 3. 添付ファイルを経費レコードに関連付け
    if (attachmentIds.length > 0) {
      await linkAttachmentsToExpense(expense.id, attachmentIds)
    }

    return NextResponse.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    console.error('経費記録作成エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '経費記録の作成に失敗しました',
      },
      {status: 500}
    )
  }
}
