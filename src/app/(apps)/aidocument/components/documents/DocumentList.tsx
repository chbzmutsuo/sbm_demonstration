'use client'

import {FileText, Edit2, Trash2, SquarePen} from 'lucide-react'
import {DocumentWithRelations} from '../../types'
import {Button} from '@cm/components/styles/common-components/Button'

interface DocumentListProps {
  documents: DocumentWithRelations[]
  onEdit: (doc: DocumentWithRelations) => void
  onDelete: (docId: number) => void
  onNavigateToEditor: (docId: number) => void
}

export default function DocumentList({documents, onEdit, onDelete, onNavigateToEditor}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">まだ書類が作成されていません。</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {documents.map(doc => (
          <li
            key={doc.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 hover:bg-gray-50"
          >
            <span className="font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => onNavigateToEditor(doc.id)}>
              {doc.name}
            </span>
            <div className="flex gap-2 shrink-0">
              <Button color="blue" type="button" size="sm" onClick={() => onNavigateToEditor(doc.id)}>
                <SquarePen className="w-3 h-3 mr-1 inline-block" /> レイアウト編集
              </Button>
              <Button color="blue" type="button" size="sm" onClick={() => onEdit(doc)}>
                <Edit2 className="w-3 h-3 mr-1 inline-block" /> 名称変更
              </Button>
              <Button color="red" type="button" size="sm" onClick={() => onDelete(doc.id)}>
                <Trash2 className="w-3 h-3 mr-1 inline-block" /> 削除
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
