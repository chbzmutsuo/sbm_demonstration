'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {ChevronRight, Download, Printer as PrinterIcon, ArrowLeft} from 'lucide-react'
import {DocumentWithRelations, PlacedItem} from '@app/(apps)/aidocument/types'
import {Button} from '@cm/components/styles/common-components/Button'
import {Document, Page, pdfjs} from 'react-pdf'
import {getComponentValue} from '@app/(apps)/aidocument/hooks/useDocumentEditor'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import {PDFDownloadLink} from '@react-pdf/renderer'

interface PreviewClientProps {
  document: DocumentWithRelations
}

export default function PreviewClient({document}: PreviewClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<PlacedItem[]>([])
  const [numPages, setNumPages] = useState<number>(0)
  const [pageWidth, setPageWidth] = useState<number>(0)
  const [pageHeight, setPageHeight] = useState<number>(0)

  // PDF.js worker設定
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  useEffect(() => {
    // JSONからitemsを読み込む
    if (document.items && typeof document.items === 'object') {
      try {
        const parsedItems = Array.isArray(document.items) ? (document.items as unknown as PlacedItem[]) : []
        setItems(parsedItems)
      } catch (err) {
        console.error('Items parsing error:', err)
      }
    }
  }, [document])

  const onDocumentLoadSuccess = ({numPages}: {numPages: number}) => {
    setNumPages(numPages)
  }

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({scale: 1})
    setPageWidth(viewport.width)
    setPageHeight(viewport.height)
  }

  // 固定サイズ（エディターと同じ値）
  const FIXED_WIDTH = 800
  const FIXED_HEIGHT = (FIXED_WIDTH / 210) * 297
  const MAX_HEIGHT = (FIXED_WIDTH / 297) * 210
  const ACTUAL_HEIGHT = Math.max(FIXED_HEIGHT, MAX_HEIGHT)

  // mmからピクセルに変換
  const mmToPx = (mm: number, dimension: 'x' | 'y') => {
    if (dimension === 'x') {
      return (mm / 210) * FIXED_WIDTH
    } else {
      return (mm / 297) * ACTUAL_HEIGHT
    }
  }

  const site = document.Site
  const client = site ? (site as any).Client : null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-screen max-h-[100vh]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-300 p-2 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 max-w-7xl mx-auto">
          <div>
            {/* Breadcrumbs */}
            <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1 flex-wrap">
              <span onClick={() => router.push('/aidocument/clients')} className="hover:underline cursor-pointer text-blue-600">
                取引先マスタ
              </span>
              <ChevronRight className="w-3 h-3" />
              {client && (
                <>
                  <span
                    onClick={() => router.push(`/aidocument/clients/${client.id}/sites`)}
                    className="hover:underline cursor-pointer text-blue-600 truncate max-w-[100px]"
                  >
                    {client.name}
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              {site && (
                <>
                  <span
                    onClick={() => router.push(`/aidocument/sites/${site.id}/documents`)}
                    className="hover:underline cursor-pointer text-blue-600 truncate max-w-[100px]"
                  >
                    {site.name}
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-800 truncate">{document.name} - 印刷プレビュー</h1>
          </div>

          <div className="flex gap-2 self-end sm:self-center">
            <Button color="gray" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2 inline-block" />
              戻る
            </Button>

            <Button color="blue" onClick={handlePrint}>
              <PrinterIcon className="w-4 h-4 mr-2 inline-block" />
              印刷
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Content */}
      <div className="flex-grow bg-gray-200 p-4 overflow-auto print:p-0 print:bg-white">
        <div className="max-w-4xl mx-auto print:max-w-none">
          {/* PDF Viewer with Items */}
          {document.pdfTemplateUrl ? (
            <div className="relative flex justify-center items-start print:block">
              <div
                className="relative bg-white shadow-lg border-2 border-gray-400 print:shadow-none print:border-0"
                style={{
                  width: `${FIXED_WIDTH}px`,
                  height: `${ACTUAL_HEIGHT}px`,
                  minWidth: `${FIXED_WIDTH}px`,
                  minHeight: `${ACTUAL_HEIGHT}px`,
                }}
              >
                <Document
                  file={document.pdfTemplateUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="p-4">PDF読み込み中...</div>}
                  error={<div className="p-4 text-red-600">PDFの読み込みに失敗しました</div>}
                  options={{
                    httpHeaders: {},
                    withCredentials: false,
                  }}
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
                  const value = getComponentValue(item.componentId, site || undefined) || item.value || item.componentId

                  return (
                    <div
                      key={index}
                      className="absolute text-sm bg-transparent px-1 py-0.5 whitespace-nowrap"
                      style={{
                        left: `${pxX}px`,
                        top: `${pxY}px`,
                      }}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">PDFテンプレートが設定されていません</div>
          )}
        </div>
      </div>
    </div>
  )
}
