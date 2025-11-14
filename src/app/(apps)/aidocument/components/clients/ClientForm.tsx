'use client'

import {useState, useEffect} from 'react'
import {ClientWithSites} from '../../types'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import {Button} from '@cm/components/styles/common-components/Button'

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {id?: number; name: string}) => void
  initialData: ClientWithSites | null
}

export default function ClientForm({isOpen, onClose, onSave, initialData}: ClientFormProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
    } else {
      setName('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({id: initialData?.id, name})
  }

  return (
    <BasicModal
      open={isOpen}
      setopen={onClose}
      title={initialData ? '取引先の編集' : '新規取引先の登録'}
      style={{maxWidth: '500px'}}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">取引先名</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </BasicModal>
  )
}

