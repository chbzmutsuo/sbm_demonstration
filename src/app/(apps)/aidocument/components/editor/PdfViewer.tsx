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
  onItemSelect?: (index: number) => void
  selectedIndex?: number | null
  onPdfUpload?: (file: File) => void
  isUploading?: boolean
  site?: SiteWithRelations | null
}

const PdfViewer = forwardRef<HTMLDivElement, PdfViewerProps>(
  (
    {pdfUrl, items, onItemMove, onItemRemove, onItemSelect, selectedIndex = null, onPdfUpload, isUploading = false, site},
    ref
  ) => {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageWidth, setPageWidth] = useState<number>(0)
    const [pageHeight, setPageHeight] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // PDF.js worker設定 - unpkg.comを使用
    useEffect(() => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
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
    const FIXED_WIDTH = 800
    const FIXED_HEIGHT = (FIXED_WIDTH / 210) * 297
    const MAX_HEIGHT = (FIXED_WIDTH / 297) * 210
    const ACTUAL_HEIGHT = Math.max(FIXED_HEIGHT, MAX_HEIGHT)

    // mmからピクセルに変換（A4: 210mm × 297mm）
    // 固定サイズを使用
    const mmToPx = (mm: number, dimension: 'x' | 'y') => {
      if (dimension === 'x') {
        return (mm / 210) * FIXED_WIDTH
      } else {
        return (mm / 297) * ACTUAL_HEIGHT
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
          className={`relative bg-white shadow-lg border-2 ${isOver ? 'border-blue-500 border-dashed' : 'border-gray-400'}`}
          style={{
            width: `${FIXED_WIDTH}px`,
            height: `${ACTUAL_HEIGHT}px`,
            minWidth: `${FIXED_WIDTH}px`,
            minHeight: `${ACTUAL_HEIGHT}px`,
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
                width={FIXED_WIDTH}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>

          {/* 配置済みアイテム */}
          {items.map((item, index) => {
            const pxX = mmToPx(item.x, 'x')
            const pxY = mmToPx(item.y, 'y')

            const value = getComponentValue(item.componentId, site || undefined)
            const noValue = value ? false : true
            const isSelected = selectedIndex === index

            return (
              <div key={index}>
                <PlacedItemComponent
                  item={item}
                  index={index}
                  x={pxX}
                  y={pxY}
                  value={value}
                  isSelected={isSelected}
                  onMove={(newX, newY) => {
                    // ピクセルからmmに変換して親に通知
                    // 固定サイズを使用
                    const mmX = (newX / FIXED_WIDTH) * 210
                    const mmY = (newY / ACTUAL_HEIGHT) * 297
                    onItemMove(index, mmX, mmY)
                  }}
                  onRemove={() => onItemRemove(index)}
                  onSelect={() => onItemSelect?.(index)}
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
