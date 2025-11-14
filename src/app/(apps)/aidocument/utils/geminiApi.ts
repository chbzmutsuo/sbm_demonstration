'use server'

import {GeminiApiRequest, GeminiAnalysisResult} from '../types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

/**
 * Gemini APIを呼び出してPDFを解析
 */
export async function analyzePdfWithGemini(request: GeminiApiRequest): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY環境変数が設定されていません')
  }

  // 現場データを整形
  const siteDataText = `
現場名: ${request.siteData.name}
住所: ${request.siteData.address || '未設定'}
金額: ${request.siteData.amount ? `${request.siteData.amount.toLocaleString()} 円` : '未設定'}
開始日: ${request.siteData.startDate ? new Date(request.siteData.startDate).toLocaleDateString('ja-JP') : '未設定'}
終了日: ${request.siteData.endDate ? new Date(request.siteData.endDate).toLocaleDateString('ja-JP') : '未設定'}

担当スタッフ:
${request.siteData.staff?.map(s => `- ${s.name} (年齢: ${s.age || '未設定'}, 性別: ${s.gender || '未設定'}, 期間: ${s.term || '未設定'})`).join('\n') || 'なし'}

利用車両:
${request.siteData.vehicles?.map(v => `- ${v.plate} (期間: ${v.term || '未設定'})`).join('\n') || 'なし'}
`.trim()

  // 自社データを整形
  const companyDataText = request.companyData
    ? `
自社名: ${request.companyData.name}
代表者名: ${request.companyData.representativeName || '未設定'}
自社住所: ${request.companyData.address || '未設定'}
電話番号: ${request.companyData.phone || '未設定'}

建設業許可:
${request.companyData.constructionLicense?.map(l => `- ${l.type}: ${l.number} (許可日: ${l.date})`).join('\n') || 'なし'}

社会保険:
${request.companyData.socialInsurance?.officeName ? `事務所名: ${request.companyData.socialInsurance.officeName}` : ''}
${request.companyData.socialInsurance?.officeCode ? `事務所コード: ${request.companyData.socialInsurance.officeCode}` : ''}
`.trim()
    : ''

  // 画像サイズ情報を取得（最初のページのサイズを使用）
  const firstImage = request.pdfImages[0]
  const imageSizeInfo = firstImage
    ? `
【画像サイズ情報】
各ページの画像サイズとPDFサイズの対応関係：
${request.pdfImages
  .map(
    (img, idx) =>
      `ページ${idx + 1}: 画像サイズ ${img.width}px × ${img.height}px = PDFサイズ ${img.pdfWidth.toFixed(2)}mm × ${img.pdfHeight.toFixed(2)}mm`
  )
  .join('\n')}

座標変換の計算方法：
- 画像上のXピクセル座標 → PDFのX座標(mm) = (Xピクセル / 画像幅) × PDF幅(mm)
- 画像上のYピクセル座標 → PDFのY座標(mm) = (Yピクセル / 画像高さ) × PDF高さ(mm)

例：画像が1654px × 2339px、PDFが210mm × 297mmの場合
- 画像上の座標(827, 1169) → PDF座標(105mm, 148.5mm)
`
    : ''

  // プロンプトを作成
  const prompt = `
あなたはPDFフォーム解析の専門家です。以下のPDF画像を解析し、現場マスタと自社の情報を適切な位置に配置してください。

【現場マスタの情報】
${siteDataText}

${companyDataText ? `【自社の情報】\n${companyDataText}` : ''}

${imageSizeInfo}

【解析タスク】
1. PDFの各ページのレイアウトを解析してください
2. フォームフィールド、入力欄、記入欄を検出してください
3. 現場マスタと自社の情報と照合して、適切な配置位置を決定してください
4. 上記の画像サイズ情報を正確に使用して、mm単位の座標を計算してください

【配置すべき情報】
- 現場名 (componentId: "s_name")
- 住所 (componentId: "s_address")
- 金額 (componentId: "s_amount")
- 開始日 (componentId: "s_startDate")
- 終了日 (componentId: "s_endDate")
- スタッフ情報 (componentId: "s_{staffId}_name", "s_{staffId}_age", "s_{staffId}_gender", "s_{staffId}_term")
- 車両情報 (componentId: "v_{vehicleId}_plate", "v_{vehicleId}_term")
${
  companyDataText
    ? `- 自社名 (componentId: "c_name")
- 代表者名 (componentId: "c_representativeName")
- 自社住所 (componentId: "c_address")
- 電話番号 (componentId: "c_phone")
- 建設業許可種別 (componentId: "c_license_{index}_type")
- 建設業許可番号 (componentId: "c_license_{index}_number")
- 建設業許可日 (componentId: "c_license_{index}_date")
- 社会保険事務所名 (componentId: "c_social_officeName")
- 社会保険事務所コード (componentId: "c_social_officeCode")`
    : ''
}

【出力形式】
以下のJSON形式で回答してください。座標はPDF座標系（mm単位）で、左上を原点(0,0)としてください。上記の画像サイズ情報を使用して正確に計算してください。

{
  "items": [
    {
      "componentId": "s_name",
      "x": 50.0,
      "y": 30.0,
      "confidence": 0.9,
      "fieldType": "text_field",
      "pageIndex": 0
    }
  ],
  "analysisMetadata": {
    "analyzedAt": "2025-01-01T00:00:00Z",
    "model": "gemini-2.0-flash-exp",
    "processingTime": 1000
  }
}

【注意事項】
- 座標はmm単位で指定してください
- pageIndexは0ベースで指定してください（1ページ目は0）
- confidenceは0-1の範囲で指定してください
- 配置できない項目は除外してください
- 複数ページのPDFの場合、各ページごとに適切な位置を決定してください
`

  try {
    // 各ページの画像をGemini APIに送信
    // 最初のページにプロンプトと画像を含め、残りのページには画像のみを含める
    const contents = request.pdfImages.map((imageData, index) => {
      const parts: any[] = []

      // 最初のページのみプロンプトを含める
      if (index === 0) {
        parts.push({
          text: prompt,
        })
      }

      // 画像データを追加
      parts.push({
        inline_data: {
          mime_type: 'image/png',
          data: imageData.imageBase64.split(',')[1], // data:image/png;base64, の部分を除去
        },
      })

      return {
        role: 'user',
        parts: parts,
      }
    })

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.1, // 低い温度で一貫性のある結果を生成
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) {
      throw new Error('Gemini APIからの応答が空です')
    }

    // JSON部分を抽出（マークダウンのコードブロックを除去）
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Gemini APIからの応答にJSONが見つかりません')
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const result: GeminiAnalysisResult = JSON.parse(jsonText)

    // 日付をDateオブジェクトに変換
    if (result.analysisMetadata.analyzedAt) {
      result.analysisMetadata.analyzedAt = new Date(result.analysisMetadata.analyzedAt)
    }

    return result
  } catch (error) {
    console.error('Gemini API呼び出しエラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // より詳細なエラーメッセージを提供
    if (errorMessage.includes('NEXT_PUBLIC_GEMINI_API_KEY')) {
      throw new Error('Gemini APIキーが設定されていません。環境変数:NEXT_PUBLIC_GEMINI_API_KEYを設定してください。')
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      throw new Error('Gemini APIの認証に失敗しました。APIキーが正しいか確認してください。')
    } else if (errorMessage.includes('429')) {
      throw new Error('Gemini APIのレート制限に達しました。しばらく待ってから再試行してください。')
    } else if (errorMessage.includes('JSON')) {
      throw new Error('Gemini APIからの応答の解析に失敗しました。')
    } else {
      throw new Error(`Gemini APIの呼び出しに失敗しました: ${errorMessage}`)
    }
  }
}
