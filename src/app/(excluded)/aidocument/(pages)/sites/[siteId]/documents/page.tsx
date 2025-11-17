import {getSiteById} from '@app/(excluded)/aidocument/actions/site-actions'
import DocumentsClient from './DocumentsClient'
import {DocumentWithRelations} from '@app/(excluded)/aidocument/types'
import {notFound} from 'next/navigation'
import {getDocuments} from '@app/(excluded)/aidocument/actions/document-actions'

export default async function DocumentsPage({params}: {params: Promise<{siteId: string}>}) {
  const {siteId} = await params
  const siteIdNum = parseInt(siteId, 10)

  if (isNaN(siteIdNum)) {
    notFound()
  }

  const [siteResult, documentsResult] = await Promise.all([getSiteById(siteIdNum), getDocuments({where: {siteId: siteIdNum}})])

  if (!siteResult.success || !siteResult.result) {
    notFound()
  }

  if (!documentsResult.success || !documentsResult.result) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">データの取得に失敗しました: {documentsResult.message}</p>
        </div>
      </div>
    )
  }

  return <DocumentsClient site={siteResult.result} initialDocuments={documentsResult.result as DocumentWithRelations[]} />
}
