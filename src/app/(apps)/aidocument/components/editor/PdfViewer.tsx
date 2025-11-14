'use client'

import {forwardRef, useRef, useEffect, useState, useMemo} from 'react'
import {useDroppable} from '@dnd-kit/core'
import {Document, Page, pdfjs} from 'react-pdf'
import {PlacedItem, SiteWithRelations} from '../../types'
import PdfUploadZone from './PdfUploadZone'
import PlacedItemComponent from './PlacedItem'
import {getComponentValue} from '../../hooks/useDocumentEditor'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

interface PdfViewerProps {
  pdfUrl: string | null
  items: PlacedItem[]
  onItemMove: (index: number, x: number, y: number) => void
  onItemRemove: (index: number) => void
  onPdfUpload?: (file: File) => void
  isUploading?: boolean
  site?: SiteWithRelations | null
}

const PdfViewer = forwardRef<HTMLDivElement, PdfViewerProps>(
  ({pdfUrl, items, onItemMove, onItemRemove, onPdfUpload, isUploading = false, site}, ref) => {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageWidth, setPageWidth] = useState<number>(0)
    const [pageHeight, setPageHeight] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPrinting, setIsPrinting] = useState(false)

    // PDF.js worker設定 - unpkg.comを使用
    useEffect(() => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    }, [])

    // 印刷モード検出
    useEffect(() => {
      const handleBeforePrint = () => setIsPrinting(true)
      const handleAfterPrint = () => setIsPrinting(false)

      window.addEventListener('beforeprint', handleBeforePrint)
      window.addEventListener('afterprint', handleAfterPrint)

      return () => {
        window.removeEventListener('beforeprint', handleBeforePrint)
        window.removeEventListener('afterprint', handleAfterPrint)
      }
    }, [])

    const {setNodeRef, isOver} = useDroppable({
      id: 'pdf-drop-zone',
    })

    const onDocumentLoadSuccess = ({numPages}: {numPages: number}) => {
      setNumPages(numPages)
    }

    const onPageLoadSuccess = (page: any) => {
      const viewport = page.getViewport({scale: 1})
      setPageWidth(viewport.width)
      setPageHeight(viewport.height)
    }

    // 固定サイズ（DocumentEditorと同じ値）
    // 印刷時は高解像度でレンダリング（devicePixelRatioを考慮）
    const FIXED_WIDTH = 800
    const PRINT_SCALE = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2
    const PRINT_WIDTH = isPrinting ? FIXED_WIDTH * PRINT_SCALE : FIXED_WIDTH
    const FIXED_HEIGHT = (FIXED_WIDTH / 210) * 297
    const MAX_HEIGHT = (FIXED_WIDTH / 297) * 210
    const ACTUAL_HEIGHT = Math.max(FIXED_HEIGHT, MAX_HEIGHT)
    const PRINT_HEIGHT = isPrinting ? ACTUAL_HEIGHT * PRINT_SCALE : ACTUAL_HEIGHT

    // mmからピクセルに変換（A4: 210mm × 297mm）
    // 印刷時は高解像度で計算
    const mmToPx = (mm: number, dimension: 'x' | 'y') => {
      if (dimension === 'x') {
        return (mm / 210) * PRINT_WIDTH
      } else {
        return (mm / 297) * PRINT_HEIGHT
      }
    }

    // PDF.jsのオプションをメモ化
    const pdfOptions = useMemo(
      () => ({
        httpHeaders: {},
        withCredentials: false,
      }),
      []
    )

    if (!pdfUrl) {
      return <PdfUploadZone onPdfUpload={onPdfUpload || (() => {})} loading={isUploading} />
    }

    return (
      <div ref={ref} className="relative flex justify-center items-start">
        <div
          ref={setNodeRef}
          className={`relative bg-white shadow-lg border-2 print:shadow-none print:border-0 ${
            isOver ? 'border-blue-500 border-dashed' : 'border-gray-400'
          }`}
          style={{
            width: `${FIXED_WIDTH}px`,
            height: `${ACTUAL_HEIGHT}px`,
            minWidth: `${FIXED_WIDTH}px`,
            minHeight: `${ACTUAL_HEIGHT}px`,
            // 印刷時は高解像度でレンダリング
            ...(isPrinting && {
              width: `${PRINT_WIDTH}px`,
              height: `${PRINT_HEIGHT}px`,
              minWidth: `${PRINT_WIDTH}px`,
              minHeight: `${PRINT_HEIGHT}px`,
            }),
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div>PDF読み込み中...</div>}
            error={<div className="p-4 text-red-600">PDFの読み込みに失敗しました</div>}
            options={pdfOptions}
          >
            {numPages > 0 && (
              <Page
                pageNumber={1}
                onLoadSuccess={onPageLoadSuccess}
                width={PRINT_WIDTH}
                scale={isPrinting ? PRINT_SCALE : 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                devicePixelRatio={isPrinting ? PRINT_SCALE : undefined}
              />
            )}
          </Document>

          {/* 配置済みアイテム */}
          {items.map((item, index) => {
            const pxX = mmToPx(item.x, 'x')
            const pxY = mmToPx(item.y, 'y')
            const value = getComponentValue(item.componentId, site || undefined) || `${item.componentId}には値がありません`

            return (
              <div key={index}>
                <PlacedItemComponent
                  item={item}
                  index={index}
                  x={pxX}
                  y={pxY}
                  value={value}
                  onMove={(newX, newY) => {
                    // ピクセルからmmに変換して親に通知
                    // 表示サイズを使用（印刷時は高解像度）
                    const mmX = (newX / PRINT_WIDTH) * 210
                    const mmY = (newY / PRINT_HEIGHT) * 297
                    onItemMove(index, mmX, mmY)
                  }}
                  onRemove={() => onItemRemove(index)}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

PdfViewer.displayName = 'PdfViewer'

export default PdfViewer
