'use client'

import {useState, useEffect} from 'react'
import {CompanyWithSites} from '../../types'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import {Button} from '@cm/components/styles/common-components/Button'

interface CompanyFormSimpleProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {id?: number; name: string; representativeName?: string; address?: string; phone?: string}) => void
  initialData: CompanyWithSites | null
}

export default function CompanyFormSimple({isOpen, onClose, onSave, initialData}: CompanyFormSimpleProps) {
  const [formData, setFormData] = useState({
    name: '',
    representativeName: '',
    address: '',
    phone: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        representativeName: (initialData.representativeName as string) || '',
        address: (initialData.address as string) || '',
        phone: (initialData.phone as string) || '',
      })
    } else {
      setFormData({
        name: '',
        representativeName: '',
        address: '',
        phone: '',
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: initialData?.id,
      ...formData,
    })
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
          <label className="block text-sm font-medium text-gray-700 mb-1">企業名 *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">代表者名</label>
          <input
            type="text"
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button color="gray" onClick={onClose} type="button">
            キャンセル
          </Button>
          <Button color="blue" type="submit">
            保存
          </Button>
        </div>
      </form>
    </BasicModal>
  )
}

