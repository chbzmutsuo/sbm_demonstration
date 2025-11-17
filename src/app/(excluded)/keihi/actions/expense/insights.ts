'use server'

import OpenAI from 'openai'

import {ExpenseFormData, AIDraft} from '@app/(excluded)/keihi/types'

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

export interface AIAnalysisResult {
  summary: string // 摘要
  insight: string // 統合されたインサイト
  conversationSummary: string // 会話内容の要約
  autoTags: string[]
  mfSubject: string // 勘定科目
  mfSubAccount: string // 補助科目
  mfTaxCategory?: string
}

// インサイト生成のオプション
interface InsightGenerationOptions {
  additionalInstruction?: string
  isDraft?: boolean
}

// インサイト生成結果の型
interface InsightGenerationResult {
  summary: string
  insight: string
  conversationSummary: string
  autoTags: string[]
  generatedKeywords?: string[]
  mfSubject: string
  mfSubAccount: string
  mfTaxCategory?: string
}

// インサイト生成用のプロンプト作成
const generateInsightPrompt = (formData: ExpenseFormData, options: InsightGenerationOptions = {}): string => {
  const {additionalInstruction, isDraft} = options

  // 入力情報として指定された項目のみを使用
  const basePrompt = `
あなたは個人事業主（ITエンジニア、アプリの受託開発、個人開発）として、ビジネス交流の記録を自分自身の視点で振り返っています。
以下の経費記録情報から、事業に関係のある文脈を作り出し、必要な情報を生成してください。


【入力情報】
- 取引先: ${formData.counterparty || '不明'}
- 相手名: ${formData.participants || '不明'}
- 会話内容の要約: ${formData.conversationSummary || '記録なし'}
- 会話の目的: ${formData.conversationPurpose.join('・')}
- キーワード: ${formData.keywords.join('・')}

【生成する内容】
1. 摘要（summary）: 経費の簡潔な説明文（30文字以内）
2. インサイト（insight）: 自分が思い出して記述したような主観的な記録（200-300文字）
3. 会話内容の要約（conversationSummary）: 会話内容のより良い要約（入力があれば改善、なければ新規作成）
4. 勘定科目（mfSubject）: 以下の選択肢から最適なものを選択
   - 旅費交通費、接待交際費、通信費、消耗品費、広告宣伝費、会議費、新聞図書費、支払手数料、地代家賃、水道光熱費、修繕費、租税公課
5. 補助科目（mfSubAccount）: 必要に応じて補助科目を提案

【インサイト記述の重要な指針】
- 客観的な記録ではなく、自分自身が思い出して記述したような文体で書く
- 「〜について相談した」「〜を依頼した」「〜と感じた」「〜を検討している」など主観的表現を使用
- 今後のアクションや考えを含める（「次は〜してみよう」「〜を要検討」など）
- 相手の発言は「〜曰く」「〜とのこと」「〜らしい」などで表現
- 効率よく記載したいという性格も考慮し、体言止めも使う

【記述例】
- 「今後外注をしていきたいから、知人のIT関係者を紹介してもらえないかとAさんに依頼した。Aさんは〜」
- 「飲食店のレジアプリについて、アイデアを相談。Bさん曰く、〜。その場合、NextJSとtailwindで構築できるか要相談。次は実際の店舗でスタッフにヒアリングをしてみよう。」

【多様な交流目的を考慮】
- 営業・商談：新規顧客開拓、既存顧客との関係強化
- アプリデモの紹介とフィードバックをもらうこと
- 技術・開発：技術課題の解決、新技術の相談
- 外注・パートナー：業務委託先の発掘、協業相手の探索
- 顧客紹介：新規顧客の紹介依頼、ビジネスマッチング
- 関係構築：長期的な信頼関係の構築、人脈形成
- 学習・成長：スキル向上、知識習得、業界動向の把握

${additionalInstruction ? `\n【追加指示】\n${additionalInstruction}` : ''}

以下のJSON形式で回答してください：
{
  "summary": "摘要文",
  "insight": "主観的な記録文（自分が思い出して記述したような文体）",
  "conversationSummary": "会話内容の要約",
  "mfSubject": "勘定科目",
  "mfSubAccount": "補助科目",
  "autoTags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]
}
`

  return basePrompt
}

// 統合されたインサイト生成関数
export const generateInsightsCore = async (
  formData: ExpenseFormData,
  options: InsightGenerationOptions = {}
): Promise<{
  success: boolean
  data?: InsightGenerationResult
  error?: string
}> => {
  try {
    const prompt = generateInsightPrompt(formData, options)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{role: 'user', content: prompt}],
      // max_tokens: 1500,
      temperature: 1,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON形式の応答が見つかりません')
    }

    const parsedData = JSON.parse(jsonMatch[0])

    return {
      success: true,
      data: parsedData,
    }
  } catch (error) {
    console.error('インサイト生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'インサイト生成に失敗しました',
    }
  }
}

// 下書き生成（新仕様対応）
export const generateInsightsDraft = async (
  formData: ExpenseFormData,
  additionalInstruction?: string
): Promise<{
  success: boolean
  data?: AIDraft
  error?: string
}> => {
  try {
    const result = await generateInsightsCore(formData, {
      additionalInstruction,
      isDraft: true,
    })

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'インサイト生成に失敗しました',
      }
    }

    const draft: AIDraft = {
      summary: result.data.summary || '',
      insight: result.data.insight || '',
      conversationSummary: result.data.conversationSummary || '',
      mfSubject: result.data.mfSubject || '',
      mfSubAccount: result.data.mfSubAccount || '',
      autoTags: result.data.autoTags || [],
      generatedKeywords: result.data.generatedKeywords || [],
    }

    return {
      success: true,
      data: draft,
    }
  } catch (error) {
    console.error('下書き生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '下書き生成に失敗しました',
    }
  }
}

// // 実際のインサイト生成（データベース保存用）
// export const generateInsights = async (
//   formData: ExpenseFormData,
//   additionalInstruction?: string
// ): Promise<{
//   success: boolean
//   data?: AIAnalysisResult
//   error?: string
// }> => {
//   try {
//     const result = await generateInsightsCore(formData, {
//       additionalInstruction,
//       isDraft: false,
//     })

//     if (!result.success || !result.data) {
//       return {
//         success: false,
//         error: result.error || 'インサイト生成に失敗しました',
//       }
//     }

//     const analysisResult: AIAnalysisResult = {
//       summary: result.data.summary || '',
//       insight: result.data.insight || '',
//       conversationSummary: result.data.conversationSummary || formData.conversationSummary || '',
//       autoTags: result.data.autoTags || [],
//       mfSubject: result.data.mfSubject || formData.mfSubject || '',
//       mfSubAccount: result.data.mfSubAccount || formData.mfSubAccount || '',
//       mfTaxCategory: '課仕 10%',
//     }

//     return {
//       success: true,
//       data: analysisResult,
//     }
//   } catch (error) {
//     console.error('インサイト生成エラー:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'インサイト生成に失敗しました',
//     }
//   }
// }
