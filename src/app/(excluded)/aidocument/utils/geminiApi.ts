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

【重要】座標の指定方法：
- 画像上の位置をピクセル座標で指定してください
- 画像の左上を原点(0, 0)とし、X軸は右方向、Y軸は下方向です
- 入力欄の左上隅を画像上で正確に測定してください
- 座標変換はアプリ側で実施するため、ピクセル座標をそのまま返してください

例：画像が1654px × 2339pxの場合
- 画像の左上隅: (0, 0)
- 画像の中央: (827, 1169)
- 画像の右下隅: (1654, 2339)
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
4. 各入力欄の左上隅の位置を画像上のピクセル座標で正確に測定してください

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
以下のJSON形式で回答してください。座標は画像上のピクセル座標（imageX, imageY）で指定してください。左上を原点(0,0)としてください。

{
  "items": [
    {
      "componentId": "s_name",
      "imageX": 827,
      "imageY": 300,
      "confidence": 0.9,
      "fieldType": "text_field",
      "pageIndex": 0
    },
    {
      "componentId": "s_address",
      "imageX": 827,
      "imageY": 400,
      "confidence": 0.9,
      "fieldType": "text_field",
      "pageIndex": 0
    },
    {
      "componentId": "s_amount",
      "imageX": 1200,
      "imageY": 300,
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

注意：上記の例では、s_nameとs_addressは同じX座標(827)ですが、これは同じ列に縦に並んでいる場合の例です。通常は各項目が異なるX座標を持ちます（例：s_amountはimageX: 1200）。実際のPDFでは、各項目のX座標を個別に測定してください。

【座標検出の詳細ルール】
1. 画像の左上を原点(0, 0)とし、X軸は右方向、Y軸は下方向です
2. 入力欄や記入欄が見つかった場合：
   - その左上隅のピクセル座標を検出してください
   - 枠線がある場合は、枠線の内側の左上隅を検出してください
   - X座標とY座標は必ず個別に測定してください（同じX座標を複数の項目に使用しないでください）
3. 入力欄が見つからない場合：
   - 対応するラベルの右側または下側の空白スペースの左上隅を検出してください
   - ラベルと空白スペースの間隔を考慮してください
   - 各項目は異なるX座標を持つ必要があります（縦に並んでいる場合でも、X座標は必ず個別に測定してください）
4. テーブル形式の場合：
   - 該当するセルの左上隅を検出してください
   - セル内の余白を考慮してください
   - テーブルの各列は異なるX座標を持ちます。同じ列内の複数行でも、各セルのX座標を正確に測定してください
   - 例：氏名列のX座標、年齢列のX座標、性別列のX座標はそれぞれ異なる値になります
5. X座標の検出方法：
   - 各入力欄の左端を画像上で正確に測定してください
   - ラベルが左側にある場合、ラベルの右端から入力欄の左端までの距離を考慮してください
   - 複数の項目が縦に並んでいる場合でも、それぞれのX座標を個別に測定してください
6. 【重要】各項目のX座標は必ず異なる値になるように検出してください。全ての項目が同じX座標を持つことはありません

【注意事項】
- 座標は画像上のピクセル座標（imageX, imageY）で指定してください（整数値、0以上）
- 【最重要】各項目のimageX座標は必ず異なる値になるように検出してください。全ての項目が同じimageX座標を持つことは絶対にありません
- 例：複数の項目が検出される場合、それぞれ異なるimageX値を持つ必要があります
  - 正しい例: imageX: 100, imageX: 200, imageX: 300（それぞれ異なる値）
  - 誤った例: imageX: 100, imageX: 100, imageX: 100（全て同じ値 - これは絶対に避けてください）
- pageIndexは0ベースで指定してください（1ページ目は0）
- confidenceは0-1の範囲で指定してください
- 配置できない項目は除外してください
- 複数ページのPDFの場合、各ページごとに適切な位置を決定してください
- 座標変換（ピクセル座標→mm座標）はアプリ側で実施するため、ピクセル座標をそのまま返してください
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

    // AIの生の応答をログ出力（デバッグ用）
    console.log('=== Gemini API生の応答（JSON） ===')
    console.log(jsonText)
    console.log('================================')

    // Gemini APIの生の応答型（ピクセル座標を含む）
    interface GeminiAnalysisRawResult {
      items: Array<{
        componentId: string
        imageX: number // 画像上のX座標（ピクセル）
        imageY: number // 画像上のY座標（ピクセル）
        confidence: number // 0-1の信頼度
        fieldType: string
        pageIndex: number // ページ番号（0ベース）
      }>
      analysisMetadata: {
        analyzedAt: string
        model: string
        processingTime: number
      }
    }

    let rawResult: GeminiAnalysisRawResult
    try {
      rawResult = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError)
      console.error('パースしようとしたJSON:', jsonText)
      throw new Error(
        `Gemini APIからの応答のJSON解析に失敗しました: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      )
    }

    // 結果の妥当性チェック
    if (!rawResult.items || !Array.isArray(rawResult.items)) {
      console.error('無効な応答形式:', rawResult)
      throw new Error('Gemini APIからの応答の形式が不正です（itemsが配列ではありません）')
    }

    // 座標の重複チェック（X座標が全て同じ値でないか確認）
    if (rawResult.items.length > 0) {
      const xCoordinates = rawResult.items.map(item => item.imageX)
      const uniqueXCoordinates = new Set(xCoordinates)

      if (uniqueXCoordinates.size === 1 && rawResult.items.length > 1) {
        console.warn('⚠️ 警告: 全ての項目のX座標が同じ値です！', {
          同じX座標値: xCoordinates[0],
          項目数: rawResult.items.length,
          各項目のcomponentId: rawResult.items.map(item => item.componentId),
        })
      }

      // X座標の統計情報をログ出力
      const minX = Math.min(...xCoordinates)
      const maxX = Math.max(...xCoordinates)
      const avgX = xCoordinates.reduce((sum, x) => sum + x, 0) / xCoordinates.length

      console.log('X座標（ピクセル）の統計:', {
        最小値: minX,
        最大値: maxX,
        平均値: avgX.toFixed(2),
        ユニークな値の数: uniqueXCoordinates.size,
        総項目数: rawResult.items.length,
      })
    }

    // ピクセル座標をmm座標に変換（OpenAI APIと同じロジック）
    const convertedItems = rawResult.items.map((item) => {
      // pageIndexが未定義の場合のエラーハンドリング
      if (item.pageIndex === undefined || item.pageIndex === null) {
        console.warn(`警告: ${item.componentId}のpageIndexが未定義です。デフォルト値0を使用します。`)
        item.pageIndex = 0
      }

      const imageData = request.pdfImages[item.pageIndex]
      if (!imageData) {
        throw new Error(`ページ${item.pageIndex}の画像データが見つかりません`)
      }

      // 座標の妥当性チェック
      if (item.imageX < 0 || item.imageX > imageData.width) {
        console.warn(`警告: ${item.componentId}のimageX座標(${item.imageX})が画像幅(${imageData.width})の範囲外です`)
      }
      if (item.imageY < 0 || item.imageY > imageData.height) {
        console.warn(`警告: ${item.componentId}のimageY座標(${item.imageY})が画像高さ(${imageData.height})の範囲外です`)
      }

      // ピクセル座標をmm座標に変換
      // 計算式: mm座標 = (ピクセル座標 / 画像サイズ) × PDFサイズ(mm)
      let xMm = (item.imageX / imageData.width) * imageData.pdfWidth
      let yMm = (item.imageY / imageData.height) * imageData.pdfHeight

      // 誤差調整係数（A4サイズ想定での座標誤差を補正）
      // 環境変数から取得可能（デフォルト: 1.0 = 調整なし）
      // 値が1より大きい場合、座標を拡大（例: 1.05 = 5%拡大）
      // 値が1より小さい場合、座標を縮小（例: 0.95 = 5%縮小）
      const coordinateAdjustmentFactor = parseFloat(process.env.AI_COORDINATE_ADJUSTMENT_FACTOR || '1.0')

      if (coordinateAdjustmentFactor !== 1.0) {
        xMm = xMm * coordinateAdjustmentFactor
        yMm = yMm * coordinateAdjustmentFactor
      }

      // デバッグログ
      console.log(`座標変換: ${item.componentId}`, {
        ピクセル座標: {imageX: item.imageX, imageY: item.imageY},
        画像サイズ: {width: imageData.width, height: imageData.height},
        PDFサイズmm: {width: imageData.pdfWidth.toFixed(2), height: imageData.pdfHeight.toFixed(2)},
        mm座標: {x: xMm.toFixed(2), y: yMm.toFixed(2)},
        誤差調整係数: coordinateAdjustmentFactor,
        信頼度: item.confidence,
      })

      return {
        componentId: item.componentId,
        x: xMm,
        y: yMm,
        confidence: item.confidence,
        fieldType: item.fieldType,
        pageIndex: item.pageIndex,
        imageX: item.imageX, // デバッグ用に保持
        imageY: item.imageY, // デバッグ用に保持
      }
    })

    // 変換後の座標が全て同じ値でないかチェック
    if (convertedItems.length > 0) {
      const convertedXCoordinates = convertedItems.map(item => item.x)
      const uniqueConvertedX = new Set(convertedXCoordinates)

      if (uniqueConvertedX.size === 1 && convertedItems.length > 1) {
        console.warn('⚠️ 警告: 変換後のmm座標で、全ての項目のX座標が同じ値です！', {
          同じX座標値: convertedXCoordinates[0],
          項目数: convertedItems.length,
          各項目のcomponentId: convertedItems.map(item => item.componentId),
        })
      }

      // 変換後のX座標の統計情報をログ出力
      const minConvertedX = Math.min(...convertedXCoordinates)
      const maxConvertedX = Math.max(...convertedXCoordinates)
      const avgConvertedX = convertedXCoordinates.reduce((sum, x) => sum + x, 0) / convertedXCoordinates.length

      const firstImage = request.pdfImages[0]
      const pdfWidth = firstImage?.pdfWidth || 210
      const pdfHeight = firstImage?.pdfHeight || 297

      console.log('変換後のmm座標（X）の統計:', {
        最小値: minConvertedX.toFixed(2),
        最大値: maxConvertedX.toFixed(2),
        平均値: avgConvertedX.toFixed(2),
        ユニークな値の数: uniqueConvertedX.size,
        総項目数: convertedItems.length,
        PDF幅: pdfWidth.toFixed(2),
        PDF高さ: pdfHeight.toFixed(2),
      })

      // 座標がPDFサイズを超えている場合の警告
      const outOfBoundsX = convertedItems.filter(item => item.x > pdfWidth)
      const outOfBoundsY = convertedItems.filter(item => item.y > pdfHeight)
      if (outOfBoundsX.length > 0) {
        console.warn(`⚠️ 警告: ${outOfBoundsX.length}個の項目のX座標がPDF幅(${pdfWidth.toFixed(2)}mm)を超えています`)
      }
      if (outOfBoundsY.length > 0) {
        console.warn(`⚠️ 警告: ${outOfBoundsY.length}個の項目のY座標がPDF高さ(${pdfHeight.toFixed(2)}mm)を超えています`)
      }
    }

    // 誤差調整係数を取得（ログ用）
    const coordinateAdjustmentFactor = parseFloat(process.env.AI_COORDINATE_ADJUSTMENT_FACTOR || '1.0')

    // 検出結果のサマリーをログ出力
    console.log(`Gemini解析完了: ${convertedItems.length}項目を検出`, {
      検出項目数: convertedItems.length,
      平均信頼度: convertedItems.reduce((sum, item) => sum + item.confidence, 0) / convertedItems.length,
      ページ数: request.pdfImages.length,
      誤差調整係数: coordinateAdjustmentFactor,
    })

    const result: GeminiAnalysisResult = {
      items: convertedItems,
      analysisMetadata: {
        analyzedAt: rawResult.analysisMetadata.analyzedAt ? new Date(rawResult.analysisMetadata.analyzedAt) : new Date(),
        model: rawResult.analysisMetadata.model || 'gemini-2.0-flash-exp',
        processingTime: rawResult.analysisMetadata.processingTime || 0,
      },
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
