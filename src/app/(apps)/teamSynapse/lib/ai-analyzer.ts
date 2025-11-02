import type {CollectedMessage, AnalysisResult, Viewpoints, FactAnalysis, ActionSuggestions} from '../types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

// Gemini APIを呼び出す共通関数
const callGeminiAPI = async (prompt: string, apiKey: string): Promise<any> => {
  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // JSON部分のみ抽出（マークダウンのコードブロックを除去）
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1] || jsonMatch[0])
  }

  return JSON.parse(text)
}

// Step 1: 観点提案
const proposeViewpoints = async (messages: CollectedMessage[], apiKey: string): Promise<Viewpoints> => {
  const prompt = `あなたはプロのビジネスアナリストです。
以下のコミュニケーション履歴（JSON）を読み込み、マネージャーが特に注目すべき「主要な観点（トピック、案件名、行動特性など）」を3〜5個提案してください。

# 制約
- 出力は必ず以下のJSON形式とすること。
- {"viewpoints": ["観点1", "観点2", "観点3"]}

# 入力データ
${JSON.stringify(messages, null, 2)}

出力:
`

  console.log('Step 1: 観点提案を実行中...')
  const result = await callGeminiAPI(prompt, apiKey)
  console.log('Step 1完了:', result)
  return result as Viewpoints
}

// Step 2: 事実分析
const analyzeFacts = async (messages: CollectedMessage[], viewpoints: string[], apiKey: string): Promise<FactAnalysis> => {
  const viewpointsList = viewpoints.map(v => `- ${v}`).join('\n')

  const prompt = `あなたはプロのビジネスアナリストです。
以下の入力データ（JSON）に基づき、指定された「分析観点」ごとに、関連する具体的な「事実」を入力データから抽出してください。

# 分析観点
${viewpointsList}

# 制約
- 出力は必ず以下のJSON形式とすること。
- 各観点に対する事実は、入力データから抽出した具体的な内容を3〜5個の箇条書き（文字列配列）でまとめること。
- 例: {
    "観点1": ["事実1", "事実2"],
    "観点2": ["事実3", "事実4"]
  }

# 入力データ
${JSON.stringify(messages, null, 2)}

出力:
`

  console.log('Step 2: 事実分析を実行中...')
  const result = await callGeminiAPI(prompt, apiKey)
  console.log('Step 2完了:', result)
  return result as FactAnalysis
}

// Step 3: 行動提案
const suggestActions = async (factAnalysis: FactAnalysis, apiKey: string): Promise<ActionSuggestions> => {
  const prompt = `あなたは経験豊富な営業マネージャーです。
以下の「事実分析レポート」（JSON）に基づき、部下（相手）に対して取るべき「ネクストアクション」を3〜5個提案してください。

# 制約
- アクションは「カテゴリ」（例：感謝・労い、確認・懸念、指導・助言、関係構築）と「具体的な提案」で構成すること。
- 出力は必ず以下のJSON形式とすること。
- {
    "actions": [
      {"category": "感謝・労い", "suggestion": "具体的な提案1"},
      {"category": "確認・懸念", "suggestion": "具体的な提案2"}
    ]
  }

# 事実分析レポート
${JSON.stringify(factAnalysis, null, 2)}

出力:
`

  console.log('Step 3: 行動提案を実行中...')
  const result = await callGeminiAPI(prompt, apiKey)
  console.log('Step 3完了:', result)
  return result as ActionSuggestions
}

// 全体の分析フロー
export const analyzeWithAI = async (messages: CollectedMessage[]): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!
    // Step 1: 観点提案
    const viewpoints = await proposeViewpoints(messages, apiKey)

    // Step 2: 事実分析
    const factAnalysis = await analyzeFacts(messages, viewpoints.viewpoints, apiKey)

    // Step 3: 行動提案
    const actionSuggestions = await suggestActions(factAnalysis, apiKey)

    return {
      viewpoints,
      factAnalysis,
      actionSuggestions,
    }
  } catch (error) {
    console.error('AI分析エラー:', error)
    throw error
  }
}
