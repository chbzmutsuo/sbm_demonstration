'use server'

import {CONVERSATION_PURPOSES} from '@app/(excluded)/keihi/(constants)/conversation-purposes'
import {getOptionsByCategory} from '@app/(excluded)/keihi/actions/master-actions'
import {ImageAnalysisResult} from '@app/(excluded)/keihi/types'
import OpenAI from 'openai'

// 複数画像の統合解析
export const analyzeMultipleReceipts = async (
  imageDataList: string[]
): Promise<{
  success: boolean
  data?: {
    receipts: Array<{
      date: string
      counterparty: string
      amount: number
      mfSubject: string // 統合された科目フィールド
      participants: string
      keywords: string[]
      imageIndex: number
      conversationPurpose: string[]
    }>
    totalAmount: number
    suggestedMerge: boolean
    allKeywords: string[]
  }
  error?: string
}> => {
  try {
    if (imageDataList.length === 0) {
      return {success: false, error: '画像が選択されていません'}
    }

    if (imageDataList.length === 1) {
      // 単一画像の場合は従来の解析を使用
      const result = await analyzeReceiptImage(imageDataList[0])
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            receipts: [
              {
                date: result.data.date,
                counterparty: result.data.counterparty,
                amount: result.data.amount,
                mfSubject: result.data.mfSubject,
                participants: result.data.suggestedCounterparties[0] || '',
                keywords: result.data.generatedKeywords,
                imageIndex: 0,
                conversationPurpose: result.data.suggestedPurposes || [],
              },
            ],
            totalAmount: result.data.amount,
            suggestedMerge: false,
            allKeywords: result.data.generatedKeywords,
          },
        }
      }
      return {success: false, error: result.error || '画像解析に失敗しました'}
    }

    // 複数画像の場合
    const results = await Promise.all(
      imageDataList.map(async (imageData, index) => {
        const result = await analyzeReceiptImage(imageData)
        if (result.success && result.data) {
          return {
            date: result.data.date,
            counterparty: result.data.counterparty,
            amount: result.data.amount,
            mfSubject: result.data.mfSubject,
            participants: result.data.suggestedCounterparties[0] || '',
            keywords: result.data.generatedKeywords,
            imageIndex: index,
            conversationPurpose: result.data.suggestedPurposes || [],
          }
        }
        return null
      })
    )

    const validResults = results.filter(result => result !== null)

    if (validResults.length === 0) {
      return {success: false, error: 'すべての画像の解析に失敗しました'}
    }

    const totalAmount = validResults.reduce((sum, receipt) => sum + receipt.amount, 0)
    const allKeywords = [...new Set(validResults.flatMap(receipt => receipt.keywords))]

    // 同じ日付・取引先の領収書がある場合は統合を提案
    const suggestedMerge = validResults.some((receipt, index) =>
      validResults.some(
        (other, otherIndex) => index !== otherIndex && receipt.date === other.date && receipt.counterparty === other.counterparty
      )
    )

    return {
      success: true,
      data: {
        receipts: validResults,
        totalAmount,
        suggestedMerge,
        allKeywords,
      },
    }
  } catch (error) {
    console.error('複数画像解析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像解析に失敗しました',
    }
  }
}

// 画像からOCR＋AI解析（新仕様対応）
export const analyzeReceiptImage = async (
  imageBase64: string
): Promise<{
  success: boolean
  data?: ImageAnalysisResult
  error?: string
}> => {
  const getSubjects = await getOptionsByCategory('subjects')

  const MAJOR_ACCOUNTS = getSubjects.data ?? []

  try {
    const conversationPurposeOptions = CONVERSATION_PURPOSES.map(p => p.value).join('\n')

    const prompt = `
この領収書画像から情報を抽出し、ビジネス交流記録として整理してください。

【抽出する情報】
1. 日付（YYYY-MM-DD形式）
2. 取引先（店舗名・施設名）
3. 金額（数値のみ）
4. 適切な勘定科目（以下から選択）：
${MAJOR_ACCOUNTS.map(acc => `- ${acc.label}`).join('\n')}

【推測する情報】
5. 想定される相手（複数可能）：
   - 店舗の種類、立地、時間帯から推測
   - 例：「Aさん（教師）」「Bさん（エンジニア）」「その他複数名」「店頭スタッフ」

6. 会話の目的（複数選択、以下から推測）：
${conversationPurposeOptions}

7. キーワード（1~2個）：
   - 相手、会話の目的、取引先、科目から想定される交流内容
   - 例：「技術相談」「新規開拓」「人材紹介」

以下のJSON形式で回答してください：
{
  "date": "YYYY-MM-DD",
  "counterparty": "店舗名・取引先名",
  "amount": 数値,
  "subject": "勘定科目",
  "suggestedCounterparties": ["相手1", "相手2"],
  "generatedKeywords": ["キーワード1", "キーワード2", "キーワード3"],
  "conversationSummary": "会話内容の要約"
}
`

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {type: 'text', text: prompt},
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: {type: 'json_object'},
      temperature: 1, // 創造性を高めて多様な推測を促す
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    // JSONを抽出（```json ``` で囲まれている場合があるため）
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON形式の応答が見つかりません')
    }

    const parsedData = JSON.parse(jsonMatch[0])

    // データの検証と正規化
    const result: ImageAnalysisResult = {
      date: parsedData.date || new Date().toISOString().split('T')[0],
      counterparty: parsedData.counterparty || '',
      amount: parsedData.amount || 0,
      mfSubject: parsedData.mfSubject || '会議費',
      suggestedCounterparties: Array.isArray(parsedData.suggestedCounterparties)
        ? parsedData.suggestedCounterparties
        : ['その他複数名'],
      suggestedPurposes: Array.isArray(parsedData.suggestedPurposes)
        ? parsedData.suggestedPurposes.filter(p => CONVERSATION_PURPOSES.some(cp => cp.value === p))
        : ['営業活動'],
      generatedKeywords: Array.isArray(parsedData.generatedKeywords)
        ? parsedData.generatedKeywords.slice(0, 3)
        : ['ビジネス交流', '情報交換'],
      conversationSummary: parsedData.conversationSummary || '',
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('画像解析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像解析に失敗しました',
    }
  }
}
