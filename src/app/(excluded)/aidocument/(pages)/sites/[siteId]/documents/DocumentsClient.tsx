'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Plus, ChevronRight, Loader2, AlertCircle} from 'lucide-react'
import {SiteWithRelations, DocumentWithRelations} from '@app/(excluded)/aidocument/types'
import {createDocument, updateDocument, deleteDocument} from '@app/(excluded)/aidocument/actions/document-actions'
import DocumentList from '@app/(excluded)/aidocument/components/documents/DocumentList'

import {Button} from '@cm/components/styles/common-components/Button'
import DocumentForm from '@app/(excluded)/aidocument/components/documents/DocumentForm'

interface DocumentsClientProps {
  site: SiteWithRelations
  initialDocuments: DocumentWithRelations[]
}

export default function DocumentsClient({site, initialDocuments}: DocumentsClientProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentWithRelations[]>(initialDocuments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<DocumentWithRelations | null>(null)

  const handleOpenModal = (doc: DocumentWithRelations | null = null) => {
    setEditingDoc(doc)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingDoc(null)
    setIsModalOpen(false)
  }

  const handleSave = async (data: {id?: number; name: string}) => {
    setIsLoading(true)
    setError(null)

    try {
      if (data.id) {
        const result = await updateDocument(data.id, {name: data.name})
        if (result.success && result.result) {
          setDocuments(prev =>
            prev.map(d =>
              d.id === data.id
                ? {
                    ...result.result,
                    Site: d.Site, // 既存のSite情報を保持
                  }
                : d
            )
          )
        } else {
          setError(result.message)
        }
      } else {
        const result = await createDocument({
          siteId: site.id,
          name: data.name,
        })
        if (result.success && result.result) {
          // 新規作成時はエディタページに遷移
          router.push(`/aidocument/documents/${result.result.id}/editor`)
          return
        } else {
          setError(result.message)
        }
      }
      handleCloseModal()
    } catch (err) {
      setError('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (docId: number) => {
    if (!window.confirm('この書類を削除しますか？')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteDocument(docId)
      if (result.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1 flex-wrap">
        <span onClick={() => router.push('/aidocument/clients')} className="hover:underline cursor-pointer text-blue-600">
          取引先マスタ
        </span>
        <ChevronRight className="w-3 h-3" />
        <span
          onClick={() => router.push(`/aidocument/clients/${site.clientId}/sites`)}
          className="hover:underline cursor-pointer text-blue-600 truncate max-w-[150px] sm:max-w-xs"
        >
          {site.name}
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-medium text-gray-800 truncate">{site.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">書類管理</h1>
          <p className="text-sm text-gray-600">{site.name} に関連する書類一覧</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2 inline-block" />
          新規書類を作成
        </Button>
      </div>

      {/* Status */}
      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700">読み込み中...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center mb-3">
          <AlertCircle className="w-5 h-5 mr-2 inline-block" />
          {error}
        </div>
      )}

      {/* Document List */}
      {!isLoading && (
        <DocumentList
          documents={documents}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onNavigateToEditor={docId => router.push(`/aidocument/documents/${docId}/editor`)}
        />
      )}

      {/* 書類 編集・新規作成モーダル */}
      <DocumentForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingDoc}
        siteName={site.name}
      />
    </div>
  )
}
