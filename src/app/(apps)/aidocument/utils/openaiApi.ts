'use server'

import OpenAI from 'openai'
import {GeminiApiRequest, GeminiAnalysisResult, OpenAIAnalysisRawResult, Component} from '../types'

/**
 * コンポーネントのラベルから、PDFフォームで使われそうなラベル例を生成
 */
function generateLabelExamples(label: string, componentId: string): string {
  // 基本的なラベル例のマッピング
  const labelMap: Record<string, string[]> = {
    現場名: ['「現場名」「現場」「工事名」「件名」「工事名称」'],
    住所: ['「住所」「所在地」「現場住所」「工事場所」'],
    金額: ['「金額」「請負代金額」「工事代金」「契約金額」'],
    開始日: ['「開始日」「着手日」「工事開始日」「起工日」'],
    終了日: ['「終了日」「完成予定日」「工事終了日」「竣工日」'],
    自社名: ['「受注者」「施工者」「会社名」「事業者名」'],
    代表者名: ['「代表者」「代表者名」「氏名」「責任者名」'],
    自社住所: ['「住所」「所在地」'],
    電話番号: ['「電話番号」「TEL」「連絡先」'],
  }

  // 既知のラベルがある場合はそれを使用
  if (labelMap[label]) {
    return `${labelMap[label].join('、')}などのラベルの近くの入力欄`
  }

  // componentIdから推測
  if (componentId.startsWith('s_') && componentId.includes('_name') && !componentId.startsWith('s_name')) {
    return '「担当者」「作業員」「スタッフ」「氏名」などのラベルの近くの入力欄（テーブルの場合、氏名列のセル）'
  }
  if (componentId.startsWith('s_') && componentId.includes('_age')) {
    return '「年齢」などのラベルの近くの入力欄（テーブルの場合、年齢列のセル）'
  }
  if (componentId.startsWith('s_') && componentId.includes('_gender')) {
    return '「性別」などのラベルの近くの入力欄（テーブルの場合、性別列のセル）'
  }
  if (componentId.startsWith('s_') && componentId.includes('_term')) {
    return '「期間」などのラベルの近くの入力欄（テーブルの場合、期間列のセル）'
  }
  if (componentId.startsWith('v_') && componentId.includes('_plate')) {
    return '「車両番号」「ナンバープレート」「使用車両」などのラベルの近くの入力欄（テーブルの場合、車両番号列のセル）'
  }
  if (componentId.startsWith('v_') && componentId.includes('_term')) {
    return '「期間」などのラベルの近くの入力欄（テーブルの場合、期間列のセル）'
  }
  if (componentId.includes('license') && componentId.includes('type')) {
    return '「許可種別」「業種」などのラベルの近くの入力欄'
  }
  if (componentId.includes('license') && componentId.includes('number')) {
    return '「許可番号」「免許番号」などのラベルの近くの入力欄'
  }
  if (componentId.includes('license') && componentId.includes('date')) {
    return '「許可日」「取得日」などのラベルの近くの入力欄'
  }
  if (componentId.includes('social') && componentId.includes('officeName')) {
    return '「事務所名」「保険事務所」などのラベルの近くの入力欄'
  }
  if (componentId.includes('social') && componentId.includes('officeCode')) {
    return '「事務所コード」「コード」などのラベルの近くの入力欄'
  }

  // デフォルト: ラベルそのものを使用
  return `「${label}」などのラベルの近くの入力欄`
}

/**
 * OpenAI APIを呼び出してPDFを解析
 */
export async function analyzePdfWithOpenAI(request: GeminiApiRequest): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY環境変数が設定されていません')
  }

  const openai = new OpenAI({apiKey})

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

  // プロンプトを作成（2段階解析アプローチ）
  const prompt = `
あなたはPDFフォーム解析の専門家です。以下のPDF画像を詳細に解析し、各情報項目に対応する入力欄や記入欄の位置を正確に検出してください。

【現場マスタの情報】
${siteDataText}

${companyDataText ? `【自社の情報】\n${companyDataText}` : ''}

${imageSizeInfo}

【解析フェーズ1: フォーム構造の理解】
まず、PDF画像全体を注意深く観察し、以下の情報を把握してください：
1. フォームの全体的なレイアウト（縦型/横型、セクション構成）
2. すべてのラベルや見出しの位置と内容
3. 入力欄、記入欄、テーブル、チェックボックスなどのフォーム要素の位置
4. 各要素の視覚的な境界線（枠線、下線、空白スペースなど）

【解析フェーズ2: 各項目の位置検出】
以下の各情報項目について、PDF画像上で対応する入力欄や記入欄の位置を視覚的に検出し、その左上隅のピクセル座標を正確に測定してください。

【検出すべき項目と対応するラベル】
${(() => {
  if (!request.components || request.components.length === 0) {
    return '（コンポーネント情報が提供されていません）'
  }

  // コンポーネントをグループごとに整理
  const componentsByGroup = request.components.reduce((acc: Record<string, Component[]>, comp) => {
    const group = comp.group || 'その他'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(comp)
    return acc
  }, {})

  let itemNumber = 1
  const items: string[] = []

  // 各グループごとに項目を生成
  Object.entries(componentsByGroup).forEach(([groupName, comps]) => {
    comps.forEach(comp => {
      // ラベルから検出対象のラベル例を生成
      // コンポーネントのラベルを基に、PDFフォームで使われそうなラベル例を推測
      const labelExamples = generateLabelExamples(comp.label, comp.id)

      items.push(
        `${itemNumber}. ${comp.label} (componentId: "${comp.id}")
   検出対象: ${labelExamples}
   検出方法: ラベルを探し、その右側または下側の入力欄の左上隅を検出`
      )
      itemNumber++
    })
  })

  return items.join('\n\n')
})()}

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
5. 座標は必ず整数値で指定してください
6. 各ページの画像サイズは上記の【画像サイズ情報】を参照してください
7. 【重要】各項目のX座標は必ず異なる値になるように検出してください。全ての項目が同じX座標を持つことはありません
8. X座標の検出方法：
   - 各入力欄の左端を画像上で正確に測定してください
   - ラベルが左側にある場合、ラベルの右端から入力欄の左端までの距離を考慮してください
   - 複数の項目が縦に並んでいる場合でも、それぞれのX座標を個別に測定してください

【出力形式】
以下のJSON形式で回答してください。各項目について、画像上のピクセル座標（imageX, imageY）を正確に指定してください。

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
      "imageY": 350,
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
    "model": "gpt-4o",
    "processingTime": 1000
  }
}

注意：上記の例では、s_nameとs_addressは同じX座標(827)ですが、これは同じ列に縦に並んでいる場合の例です。通常は各項目が異なるX座標を持ちます（例：s_amountはimageX: 1200）。実際のPDFでは、各項目のX座標を個別に測定してください。

【重要な注意事項】
- 必ず画像上で実際の入力欄や記入欄の位置を視覚的に検出してください
- 情報を列挙するだけではなく、各項目の具体的な位置座標（imageX, imageY）を必ず返してください
- 各項目について、画像上の正確なピクセル座標を測定してください
- imageX, imageYは画像上のピクセル座標で指定してください（整数値、0以上）
- 【最重要】各項目のimageX座標は必ず異なる値になるように検出してください。全ての項目が同じimageX座標を持つことは絶対にありません
- 例：複数の項目が検出される場合、それぞれ異なるimageX値を持つ必要があります
  - 正しい例: imageX: 100, imageX: 200, imageX: 300（それぞれ異なる値）
  - 誤った例: imageX: 100, imageX: 100, imageX: 100（全て同じ値 - これは絶対に避けてください）
- pageIndexは0ベースで指定してください（1ページ目は0）
- confidenceは0-1の範囲で指定してください：
  - 入力欄を明確に検出できた場合: 0.9以上
  - 入力欄を推測できた場合: 0.7-0.8
  - 空白スペースを推測した場合: 0.5-0.6
- 配置できない項目は除外してください
- 複数ページのPDFの場合、各ページごとに適切な位置を決定してください
- JSON形式で回答してください（コードブロックは不要）
- すべての検出可能な項目について、必ず座標を含めて返してください
`

  try {
    // 複数ページの画像を処理
    // OpenAI Vision APIは複数画像を1つのリクエストで処理できる
    const imageContents = request.pdfImages.map(imageData => ({
      type: 'image_url' as const,
      image_url: {
        url: imageData.imageBase64, // Base64データURLをそのまま使用
      },
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            ...imageContents,
          ],
        },
      ],
      response_format: {type: 'json_object'},
      temperature: 0.1, // 低い温度で一貫性のある結果を生成
      max_tokens: 16384, // より多くのトークンで詳細な解析を可能に
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('OpenAI APIからの応答が空です')
    }

    // JSONを抽出（コードブロックを除去）
    let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    if (!jsonMatch) {
      jsonMatch = content.match(/```\n([\s\S]*?)\n```/)
    }
    if (!jsonMatch) {
      jsonMatch = content.match(/\{[\s\S]*\}/)
    }
    if (!jsonMatch) {
      console.error('OpenAI API応答の内容:', content)
      throw new Error('OpenAI APIからの応答にJSONが見つかりません')
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]

    // AIの生の応答をログ出力（デバッグ用）
    console.log('=== OpenAI API生の応答（JSON） ===')
    console.log(jsonText)
    console.log('================================')

    let rawResult: OpenAIAnalysisRawResult
    try {
      rawResult = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError)
      console.error('パースしようとしたJSON:', jsonText)
      throw new Error(
        `OpenAI APIからの応答のJSON解析に失敗しました: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      )
    }

    // 結果の妥当性チェック
    if (!rawResult.items || !Array.isArray(rawResult.items)) {
      console.error('無効な応答形式:', rawResult)
      throw new Error('OpenAI APIからの応答の形式が不正です（itemsが配列ではありません）')
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

      console.log('X座標の統計:', {
        最小値: minX,
        最大値: maxX,
        平均値: avgX.toFixed(2),
        ユニークな値の数: uniqueXCoordinates.size,
        総項目数: rawResult.items.length,
      })
    }

    // ピクセル座標をmm座標に変換
    const convertedItems = rawResult.items.map((item, index) => {
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
      // 画像サイズ = PDFサイズ(ポイント) × scale
      // なので: mm座標 = (ピクセル座標 / (PDFサイズ(ポイント) × scale)) × PDFサイズ(mm)
      //       = (ピクセル座標 / scale) × (PDFサイズ(mm) / PDFサイズ(ポイント))
      //       = (ピクセル座標 / scale) × 0.352778
      // ただし、より直感的な計算式: mm座標 = (ピクセル座標 / 画像サイズ) × PDFサイズ(mm)
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

      // 検証: スケールから逆算
      // 画像サイズ = PDFサイズ(ポイント) × scale
      // PDFサイズ(ポイント) = PDFサイズ(mm) / 0.352778
      // 画像サイズ = (PDFサイズ(mm) / 0.352778) × scale
      // なので: mm座標 = (ピクセル座標 / ((PDFサイズ(mm) / 0.352778) × scale)) × PDFサイズ(mm)
      //       = (ピクセル座標 × 0.352778) / scale
      const pdfWidthPt = imageData.pdfWidth / 0.352778
      const pdfHeightPt = imageData.pdfHeight / 0.352778
      const scale = imageData.width / pdfWidthPt
      const xMmAlt = (item.imageX / scale) * 0.352778
      const yMmAlt = (item.imageY / scale) * 0.352778

      // デバッグログ（詳細版）
      console.log(`座標変換: ${item.componentId}`, {
        ピクセル座標: {imageX: item.imageX, imageY: item.imageY},
        画像サイズ: {width: imageData.width, height: imageData.height},
        PDFサイズmm: {width: imageData.pdfWidth.toFixed(2), height: imageData.pdfHeight.toFixed(2)},
        PDFサイズポイント: {width: pdfWidthPt.toFixed(2), height: pdfHeightPt.toFixed(2)},
        計算されたスケール: scale.toFixed(2),
        mm座標方法1: {x: xMm.toFixed(2), y: yMm.toFixed(2)},
        mm座標方法2: {x: xMmAlt.toFixed(2), y: yMmAlt.toFixed(2)},
        差分: {x: Math.abs(xMm - xMmAlt).toFixed(2), y: Math.abs(yMm - yMmAlt).toFixed(2)},
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

      console.log('変換後のmm座標（X）の統計:', {
        最小値: minConvertedX.toFixed(2),
        最大値: maxConvertedX.toFixed(2),
        平均値: avgConvertedX.toFixed(2),
        ユニークな値の数: uniqueConvertedX.size,
        総項目数: convertedItems.length,
      })
    }

    // 誤差調整係数を取得（ログ用）
    const coordinateAdjustmentFactor = parseFloat(process.env.AI_COORDINATE_ADJUSTMENT_FACTOR || '1.0')

    // 検出結果のサマリーをログ出力
    console.log(`OpenAI解析完了: ${convertedItems.length}項目を検出`, {
      検出項目数: convertedItems.length,
      平均信頼度: convertedItems.reduce((sum, item) => sum + item.confidence, 0) / convertedItems.length,
      ページ数: request.pdfImages.length,
      誤差調整係数: coordinateAdjustmentFactor,
    })

    // 日付をDateオブジェクトに変換
    const analyzedAt = rawResult.analysisMetadata.analyzedAt ? new Date(rawResult.analysisMetadata.analyzedAt) : new Date()

    const result: GeminiAnalysisResult = {
      items: convertedItems,
      analysisMetadata: {
        analyzedAt,
        model: 'gpt-4o',
        processingTime: rawResult.analysisMetadata.processingTime || 0,
      },
    }

    return result
  } catch (error) {
    console.error('OpenAI API呼び出しエラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // より詳細なエラーメッセージを提供
    if (errorMessage.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI APIキーが設定されていません。環境変数OPENAI_API_KEYを設定してください。')
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      throw new Error('OpenAI APIの認証に失敗しました。APIキーが正しいか確認してください。')
    } else if (errorMessage.includes('429')) {
      throw new Error('OpenAI APIのレート制限に達しました。しばらく待ってから再試行してください。')
    } else if (errorMessage.includes('JSON')) {
      throw new Error('OpenAI APIからの応答の解析に失敗しました。')
    } else {
      throw new Error(`OpenAI APIの呼び出しに失敗しました: ${errorMessage}`)
    }
  }
}
