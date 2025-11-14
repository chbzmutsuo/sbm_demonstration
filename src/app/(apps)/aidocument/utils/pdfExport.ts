import {PDFDocument, rgb, StandardFonts, PDFFont} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {PlacedItem} from '../types'
import {SiteWithRelations} from '../types'
import {getComponentValue} from '../hooks/useDocumentEditor'

/**
 * PDFエクスポート用のユーティリティ関数
 */

// mmからポイントに変換（1ポイント = 0.352778mm）
const mmToPoint = (mm: number): number => {
  return mm / 0.352778
}

/**
 * 日本語フォントを読み込む
 */
async function loadJapaneseFont(): Promise<Uint8Array | null> {
  try {
    const fontResponse = await fetch('/fonts/Nasu-Regular.ttf')
    if (fontResponse.ok) {
      const arrayBuffer = await fontResponse.arrayBuffer()
      return new Uint8Array(arrayBuffer)
    }
  } catch (error) {
    console.warn('日本語フォントの読み込みに失敗しました:', error)
  }
  return null
}

/**
 * 配置済みアイテムを含むPDFを生成してダウンロード
 */
export async function exportPdfWithItems(
  pdfUrl: string,
  items: PlacedItem[],
  site: SiteWithRelations,
  documentName: string
): Promise<void> {
  try {
    // S3からPDFを取得
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      throw new Error('PDFの取得に失敗しました')
    }

    const pdfBytes = await pdfResponse.arrayBuffer()

    // PDFを読み込む
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // fontkitを登録（カスタムフォント埋め込みに必要）
    pdfDoc.registerFontkit(fontkit)

    // 日本語フォントを読み込む
    const japaneseFontBytes = await loadJapaneseFont()
    let japaneseFont: PDFFont | null = null
    if (japaneseFontBytes) {
      try {
        japaneseFont = await pdfDoc.embedFont(japaneseFontBytes)
        console.log('日本語フォントを埋め込みました')
      } catch (fontError) {
        console.warn('フォントの埋め込みに失敗しました:', fontError)
      }
    }

    // フォールバック用の標準フォント
    const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // すべてのページを取得
    const pages = pdfDoc.getPages()

    // 配置済みアイテムを描画（現在は最初のページのみ）
    // 将来的に複数ページ対応が必要な場合は、itemにpageIndexを追加する必要がある
    if (pages.length > 0) {
      const firstPage = pages[0]
      const {width: pageWidthPt, height: pageHeightPt} = firstPage.getSize()

      // PDFの実際のサイズをmm単位に変換（ポイントからmm）
      // 1ポイント = 0.352778mm
      const pageWidthMm = pageWidthPt * 0.352778
      const pageHeightMm = pageHeightPt * 0.352778

      // フォントサイズ（ポイント単位）
      // Tailwind CSSのtext-smは14px = 約10.5ポイント（96dpi基準）
      // より正確には、ブラウザのデフォルト16px基準でtext-smは14px = 10.5ポイント
      const fontSize = 10.5

      // 使用するフォント（日本語フォントがあればそれを使用、なければ標準フォント）
      const font = japaneseFont || standardFont

      // 配置済みアイテムを描画
      console.log('PDFエクスポート開始:', {
        itemsCount: items.length,
        pageSizePt: {width: pageWidthPt, height: pageHeightPt},
        pageSizeMm: {width: pageWidthMm, height: pageHeightMm},
        hasJapaneseFont: !!japaneseFont,
      })

      for (const item of items) {
        // DocumentEditor.tsxのonItemMoveで調整されている座標（x: mmX - 12, y: mmY - 1）を考慮
        // 画面表示用の調整を元に戻す
        // PlacedItem.tsxからpadding/marginを削除したので、調整は不要
        const adjustedX = item.x
        const adjustedY = item.y

        // mm単位の座標をポイント単位に変換
        // PDFの実際のサイズに基づいて変換（固定のA4サイズではなく）
        // PdfViewerでは固定サイズ（800px）をA4（210mm）と仮定しているため、
        // 実際のPDFサイズが異なる場合、比例計算で調整が必要
        const xPoint = (adjustedX / pageWidthMm) * pageWidthPt
        // PDF座標系は左下が原点なので、Y座標を反転
        const yPoint = pageHeightPt - (adjustedY / pageHeightMm) * pageHeightPt

        // コンポーネントの値を取得（item.valueを優先しない）
        const value = getComponentValue(item.componentId, site) || item.value || ''

        console.log(`アイテム ${item.componentId}:`, {
          original: {x: item.x, y: item.y},
          adjusted: {x: adjustedX, y: adjustedY},
          point: {x: xPoint, y: yPoint},
          value: String(value),
        })

        if (value && String(value).trim()) {
          try {
            // アイテムのフォントサイズを取得（デフォルト: 10.5ポイント）
            const itemFontSize = item.fontSize || 10.5

            // テキストを描画
            // フォントサイズを考慮してベースラインを調整
            firstPage.drawText(String(value), {
              x: xPoint,
              y: yPoint - itemFontSize, // ベースラインを考慮
              size: itemFontSize,
              color: rgb(0, 0, 0), // 黒色
              font: font, // フォントを指定
            })
            console.log(`✓ 描画成功: ${item.componentId} at (${xPoint}, ${yPoint - itemFontSize}), fontSize: ${itemFontSize}`)
          } catch (textError) {
            // テキスト描画エラー（例: フォントが対応していない文字）はスキップ
            console.warn(`テキスト描画エラー (${item.componentId}):`, textError)
          }
        } else {
          console.warn(`値が空: ${item.componentId}`)
        }
      }
    }

    // PDFを生成
    const modifiedPdfBytes = await pdfDoc.save()

    // ダウンロード
    const blob = new Blob([new Uint8Array(modifiedPdfBytes)], {type: 'application/pdf'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // ファイル名をサニタイズ（特殊文字を削除）
    const sanitizedName = (documentName || 'document').replace(
      /[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\s-_.]/g,
      ''
    )
    link.download = `${sanitizedName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDFエクスポートエラー:', error)
    throw error
  }
}
