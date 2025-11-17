'use client'

import * as pdfjs from 'pdfjs-dist'
import type {PdfImageData} from '../types'

/**
 * クライアント側でPDFを画像に変換するユーティリティ関数
 * ブラウザ環境で実行される
 */

interface PdfToImageOptions {
  scale?: number // 画像のスケール（デフォルト: 2.0）
}

/**
 * PDFファイルをBase64エンコードされたPNG画像の配列に変換（クライアント側）
 * @param pdfUrl PDFファイルのURL（S3 URL）
 * @param options 変換オプション
 * @returns 画像データとサイズ情報の配列（各ページごと）
 */
export async function convertPdfToImagesClient(
  pdfUrl: string,
  options: PdfToImageOptions = {}
): Promise<PdfImageData[]> {
  const {scale = 2.0} = options

  try {
    // PDF.js worker設定
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

    // PDFファイルを取得
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      throw new Error(`PDFの取得に失敗しました: ${pdfResponse.statusText}`)
    }

    const pdfBytes = await pdfResponse.arrayBuffer()

    // PDFを読み込む
    const loadingTask = pdfjs.getDocument({
      data: pdfBytes,
      useSystemFonts: true,
    })

    const pdfDocument = await loadingTask.promise
    const numPages = pdfDocument.numPages

    const images: PdfImageData[] = []

    // 各ページを画像に変換
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const viewport = page.getViewport({scale})

      // PDFの実際のサイズを取得（ポイント単位）
      const pdfViewport = page.getViewport({scale: 1.0})
      // ポイントからmmに変換（1ポイント = 0.352778mm）
      // pdfExport.tsと同じ計算方法を使用
      const pdfWidthMm = pdfViewport.width * 0.352778
      const pdfHeightMm = pdfViewport.height * 0.352778

      // デバッグログ
      console.log(`PDFページ${pageNum}サイズ:`, {
        ポイント: {width: pdfViewport.width, height: pdfViewport.height},
        mm: {width: pdfWidthMm.toFixed(2), height: pdfHeightMm.toFixed(2)},
        画像サイズ: {width: viewport.width, height: viewport.height},
        スケール: scale,
      })

      // Canvasを作成
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Canvas contextの取得に失敗しました')
      }

      // PDFページをCanvasに描画
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // CanvasをBase64エンコードされたPNG画像に変換
      const imageData = canvas.toDataURL('image/png')

      images.push({
        imageBase64: imageData,
        width: viewport.width,
        height: viewport.height,
        pdfWidth: pdfWidthMm,
        pdfHeight: pdfHeightMm,
      })
    }

    return images
  } catch (error) {
    console.error('PDF画像変換エラー:', error)
    throw new Error(
      `PDFの画像変換に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

