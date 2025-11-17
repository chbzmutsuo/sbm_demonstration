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
          parts: [{text: prompt}],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 16384, // 複数の分析結果を含むため、トークン数を増やす
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

// 統合分析：3ステップを1回のAPI呼び出しで実行
export const analyzeWithAI = async (messages: CollectedMessage[], apiKey: string): Promise<AnalysisResult> => {
  try {
    console.log('AI分析を開始します（統合実行）...')

    const prompt = `あなたはプロのビジネスアナリストであり、経験豊富な営業マネージャーです。
以下のコミュニケーション履歴（JSON）を読み込み、以下の3ステップの分析を一度に実行してください。

# 入力データ
${JSON.stringify(messages, null, 2)}

# 分析ステップ

## Step 1: 観点提案
マネージャーが特に注目すべき「主要な観点（トピック、案件名、行動特性など）」を3〜5個提案してください。

## Step 2: 事実分析
Step 1で提案した観点ごとに、入力データから抽出した具体的な「事実」を3〜5個の箇条書きでまとめてください。

## Step 3: 行動提案
Step 2の事実分析に基づき、部下（相手）に対して取るべき「ネクストアクション」を3〜5個提案してください。
アクションは「カテゴリ」（例：感謝・労い、確認・懸念、指導・助言、関係構築）と「具体的な提案」で構成してください。

# 出力形式
以下のJSON形式で出力してください。必ず有効なJSONのみを出力し、説明文やコメントは含めないでください。

{
  "viewpoints": {
    "viewpoints": ["観点1", "観点2", "観点3"]
  },
  "factAnalysis": {
    "観点1": ["事実1", "事実2", "事実3"],
    "観点2": ["事実4", "事実5", "事実6"],
    "観点3": ["事実7", "事実8"]
  },
  "actionSuggestions": {
    "actions": [
      {"category": "感謝・労い", "suggestion": "具体的な提案1"},
      {"category": "確認・懸念", "suggestion": "具体的な提案2"},
      {"category": "関係構築", "suggestion": "具体的な提案3"}
    ]
  }
}

出力:
`

    console.log('統合分析を実行中...')
    const result = await callGeminiAPI(prompt, apiKey)
    console.log('分析完了:', result)

    // 結果のバリデーションと整形
    let viewpoints: Viewpoints
    if (result.viewpoints && typeof result.viewpoints === 'object') {
      if (Array.isArray(result.viewpoints.viewpoints)) {
        viewpoints = result.viewpoints
      } else if (Array.isArray(result.viewpoints)) {
        viewpoints = {viewpoints: result.viewpoints}
      } else {
        viewpoints = {viewpoints: []}
      }
    } else {
      viewpoints = {viewpoints: []}
    }

    const factAnalysis: FactAnalysis = result.factAnalysis || {}
    const actionSuggestions: ActionSuggestions = result.actionSuggestions || {actions: result.actions || []}

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
