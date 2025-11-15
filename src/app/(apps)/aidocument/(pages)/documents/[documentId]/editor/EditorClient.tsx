'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {ChevronRight, CheckCircle, Loader2, AlertCircle, Bot, Download} from 'lucide-react'
import {DocumentWithRelations, PlacedItem, AIProvider} from '@app/(apps)/aidocument/types'
import {updateDocument} from '@app/(apps)/aidocument/actions/document-actions'
import {analyzePdfAndAutoPlace} from '@app/(apps)/aidocument/actions/ai-analyze-actions'
import DocumentEditorComponent from '@app/(apps)/aidocument/components/editor/DocumentEditor'
import {Button} from '@cm/components/styles/common-components/Button'
import {FileHandler, S3FormData} from '@cm/class/FileHandler'
import {exportPdfWithItems} from '@app/(apps)/aidocument/utils/pdfExport'
import {convertPdfToImagesClient} from '@app/(apps)/aidocument/utils/pdfToImageClient'

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
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    confidence: number
    model: string
    processingTime: number
  } | null>(null)
  const [loadingStage, setLoadingStage] = useState<string>('')
  const [aiProvider, setAiProvider] = useState<AIProvider>('geminie')

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
    setAnalysisResult(null)
    setLoadingStage('PDFを画像に変換中...')

    try {
      // クライアント側でPDFを画像に変換（解像度を上げて精度向上）
      const pdfImages = await convertPdfToImagesClient(pdfUrl, {scale: 1.0})

      if (pdfImages.length === 0) {
        setError('PDFの画像変換に失敗しました')
        setLoadingStage('')
        setIsLoading(false)
        return
      }

      setLoadingStage('AIで解析中...')

      // サーバーに画像を送信して解析
      const result = await analyzePdfAndAutoPlace({
        pdfImages,
        siteId: document.Site.id,
        documentId: document.id,
        provider: aiProvider,
      })

      if (result.success && result.result) {
        setLoadingStage('解析結果を適用中...')

        // 信頼度の平均を計算
        const avgConfidence = result.result.items.reduce((sum, item) => sum + item.confidence, 0) / result.result.items.length

        const aiItems: PlacedItem[] = result.result.items.map(item => ({
          componentId: item.componentId,
          x: item.x,
          y: item.y,
          pageIndex: (item as any).pageIndex || 0,
        }))
        setItems(aiItems)

        // 解析結果を保存
        setAnalysisResult({
          confidence: avgConfidence,
          model: result.result.analysisMetadata.model,
          processingTime: result.result.analysisMetadata.processingTime,
        })

        setLoadingStage('')
        alert(`AI自動配置が完了しました（信頼度: ${(avgConfidence * 100).toFixed(1)}%）`)
      } else {
        setError(result.error || 'AI解析に失敗しました')
        setLoadingStage('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI解析に失敗しました')
      setLoadingStage('')
      console.error('AI analyze error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPdf = async () => {
    if (!pdfUrl) {
      alert('PDFをアップロードしてください')
      return
    }

    if (items.length === 0) {
      alert('配置済みアイテムがありません')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      // PDFエクスポート前に自動保存
      const saveResult = await updateDocument(document.id, {
        items: items,
      })

      if (!saveResult.success) {
        console.warn('自動保存に失敗しましたが、エクスポートを続行します:', saveResult.message)
        // 保存に失敗してもエクスポートは続行（現在のメモリ上のデータでエクスポート）
      }

      await exportPdfWithItems(pdfUrl, items, document.Site, document.name)
      alert('PDFをエクスポートしました')
    } catch (err) {
      setError('PDFのエクスポートに失敗しました')
      console.error('PDF export error:', err)
    } finally {
      setIsExporting(false)
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

          <div className="flex gap-2 self-end sm:self-center items-center">
            {/* AIプロバイダー選択 */}
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded border border-gray-200">
              <label className="text-xs text-gray-600">AI:</label>
              <select
                value={aiProvider}
                onChange={e => setAiProvider(e.target.value as AIProvider)}
                disabled={isLoading}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <Button color="gray" onClick={handleAiAnalyze} disabled={!pdfUrl || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {loadingStage || 'AI解析中...'}
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2 inline-block" />
                  AI自動配置
                </>
              )}
            </Button>
            {analysisResult && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded border border-gray-200">
                <span>信頼度: {(analysisResult.confidence * 100).toFixed(1)}%</span>
                <span className="text-gray-400">|</span>
                <span>{analysisResult.processingTime}ms</span>
              </div>
            )}
            <Button color="gray" type="button" onClick={handleExportPdf} disabled={!pdfUrl || items.length === 0 || isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  エクスポート中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 inline-block" />
                  PDFエクスポート
                </>
              )}
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
      <DocumentEditorComponent
        document={{...document, pdfTemplateUrl: pdfUrl}}
        items={items}
        onItemsChange={setItems}
        onPdfUpload={handlePdfUpload}
        isUploading={isUploading}
        selectedIndex={selectedIndex}
        onSelectedIndexChange={setSelectedIndex}
      />
    </div>
  )
}
