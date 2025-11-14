import EditorClient from './EditorClient'
import {getDocumentById} from '@app/(apps)/aidocument/actions/document-actions'
import {notFound} from 'next/navigation'

export default async function EditorPage({params}: {params: Promise<{documentId: string}>}) {
  const {documentId} = await params
  const documentIdNum = parseInt(documentId, 10)

  if (isNaN(documentIdNum)) {
    notFound()
  }

  const result = await getDocumentById(documentIdNum)

  if (!result.success || !result.result) {
    notFound()
  }

  return <EditorClient document={result.result} />
}
