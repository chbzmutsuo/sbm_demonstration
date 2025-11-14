'use client'

import {useState, useEffect} from 'react'
import {DocumentWithRelations} from '../../types'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import {Button} from '@cm/components/styles/common-components/Button'

interface DocumentFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {id?: number; name: string}) => void
  initialData: DocumentWithRelations | null
  siteName: string
}

export default function DocumentForm({isOpen, onClose, onSave, initialData, siteName}: DocumentFormProps) {
  const [docName, setDocName] = useState('')

  useEffect(() => {
    if (initialData) {
      setDocName(initialData.name)
    } else {
      setDocName('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({id: initialData?.id, name: docName})
  }

  return (
    <BasicModal
      open={isOpen}
      setopen={onClose}
      title={initialData ? '書類の名称変更' : '新規書類の作成'}
      style={{maxWidth: '500px'}}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">現場名</label>
          <input type="text" value={siteName} disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
        </div>
        <div>
          <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 mb-1">
            書類名称
          </label>
          <input
            id="doc-name"
            type="text"
            placeholder="例: 作業員名簿 (様式第5号)"
            value={docName}
            onChange={e => setDocName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            キャンセル
          </Button>
          <Button type="submit">{initialData ? '保存' : '作成して編集'}</Button>
        </div>
      </form>
    </BasicModal>
  )
}

