'use client'

import {useState, useEffect, useRef} from 'react'
import {useRouter} from 'next/navigation'
import {ChevronRight, CheckCircle, Loader2, AlertCircle, Bot, Printer} from 'lucide-react'
import {DocumentWithRelations, PlacedItem} from '@app/(apps)/aidocument/types'
import {updateDocument} from '@app/(apps)/aidocument/actions/document-actions'
import {analyzePdfAndAutoPlace} from '@app/(apps)/aidocument/actions/ai-analyze-actions'
import DocumentEditorComponent from '@app/(apps)/aidocument/components/editor/DocumentEditor'

import {Button} from '@cm/components/styles/common-components/Button'
import {FileHandler, S3FormData} from '@cm/class/FileHandler'
import {useReactToPrint} from 'react-to-print'

interface EditorClientProps {
  document: DocumentWithRelations
}

export default function EditorClient({document}: EditorClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<PlacedItem[]>([])
  const [pdfUrl, setPdfUrl] = useState<string | null>(document.pdfTemplateUrl || null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const documentEditorRef = useRef<HTMLDivElement>(null)
  const printFunc = useReactToPrint({
    contentRef: documentEditorRef,
    documentTitle: document.name,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }

    `,
  })
  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await updateDocument(document.id, {
        items: items,
      })
      if (result.success) {
        // 成功時のフィードバック（トーストなど）
        alert('保存しました')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePdfUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formDataObj: S3FormData = {
        bucketKey: 'aidocument',
        deleteImageUrl: pdfUrl || undefined,
        optimize: false,
      }

      const uploadResult = await FileHandler.sendFileToS3({
        file,
        formDataObj,
        validateFile: true,
      })

      if (uploadResult.success && uploadResult.result?.url) {
        const newPdfUrl = uploadResult.result.url
        setPdfUrl(newPdfUrl)

        // データベースに保存
        const result = await updateDocument(document.id, {
          pdfTemplateUrl: newPdfUrl,
        })

        if (!result.success) {
          setError('PDFの保存に失敗しました')
        }
      } else {
        setError(uploadResult.error || 'PDFのアップロードに失敗しました')
      }
    } catch (err) {
      setError('PDFのアップロードに失敗しました')
      console.error('PDF upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAiAnalyze = async () => {
    if (!pdfUrl) {
      alert('PDFをアップロードしてください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await analyzePdfAndAutoPlace({
        pdfUrl,
        siteId: document.Site.id,
        documentId: document.id,
      })

      if (result.success && result.result) {
        const aiItems: PlacedItem[] = result.result.items.map(item => ({
          componentId: item.componentId,
          x: item.x,
          y: item.y,
        }))
        setItems(aiItems)
        alert('AI自動配置が完了しました')
      } else {
        setError(result.error || 'AI解析に失敗しました')
      }
    } catch (err) {
      setError('AI解析に失敗しました')
      console.error('AI analyze error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const site = document.Site
  const client = site ? (site as any).Client : null

  return (
    <div className="flex flex-col h-screen max-h-[100vh]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-300 p-2 shadow-sm">
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
            <h1 className="text-lg font-bold text-gray-800 truncate">{document.name}</h1>
          </div>

          <div className="flex gap-2 self-end sm:self-center">
            <Button color="gray" onClick={handleAiAnalyze} disabled={!pdfUrl || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI解析中...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2 inline-block" />
                  AI自動配置
                </>
              )}
            </Button>
            <Button
              color="gray"
              type="button"
              onClick={() => {
                printFunc()
              }}
            >
              <Printer className="w-4 h-4 mr-2 inline-block" />
              印刷プレビュー
            </Button>
            <Button color="blue" type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 inline-block" />
                  保存
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-2 inline-block " />
            {error}
          </div>
        )}
      </header>

      {/* Main Content */}
      <>
        <DocumentEditorComponent
          ref={documentEditorRef}
          document={{...document, pdfTemplateUrl: pdfUrl}}
          items={items}
          onItemsChange={setItems}
          onPdfUpload={handlePdfUpload}
          isUploading={isUploading}
        />
      </>
    </div>
  )
}
