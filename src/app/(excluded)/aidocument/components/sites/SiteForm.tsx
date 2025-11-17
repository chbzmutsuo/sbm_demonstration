'use client'

import {useState, useEffect} from 'react'
import {Plus, Trash2} from 'lucide-react'
import {SiteWithRelations} from '../../types'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import {Button} from '@cm/components/styles/common-components/Button'

interface SiteFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    id?: number
    name: string
    address?: string
    amount?: number
    startDate?: Date
    endDate?: Date
    staff?: Array<{id?: number; name: string; age?: number; gender?: string; term?: string}>
    vehicles?: Array<{id?: number; plate: string; term?: string}>
  }) => void
  initialData: SiteWithRelations | null
  clientId: number
}

export default function SiteForm({isOpen, onClose, onSave, initialData, clientId}: SiteFormProps) {
  const [formData, setFormData] = useState<{
    name: string
    address: string
    amount: number
    startDate: string
    endDate: string
    staff: Array<{id?: number; name: string; age: number; gender: string; term: string}>
    vehicles: Array<{id?: number; plate: string; term: string}>
  }>({
    name: '',
    address: '',
    amount: 0,
    startDate: '',
    endDate: '',
    staff: [],
    vehicles: [],
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address || '',
        amount: initialData.amount || 0,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        staff:
          initialData.Staff?.map(s => ({
            id: s.id,
            name: s.name,
            age: s.age || 0,
            gender: s.gender || '男性',
            term: s.term || '',
          })) || [],
        vehicles:
          initialData.aidocumentVehicles?.map(v => ({
            id: v.id,
            plate: v.plate,
            term: v.term || '',
          })) || [],
      })
    } else {
      setFormData({
        name: '',
        address: '',
        amount: 0,
        startDate: '',
        endDate: '',
        staff: [],
        vehicles: [],
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, type} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const handleNestedChange = (listName: 'staff' | 'vehicles', index: number, fieldName: string, value: any) => {
    setFormData(prev => {
      const newList = [...prev[listName]]
      newList[index] = {...newList[index], [fieldName]: value}
      return {...prev, [listName]: newList}
    })
  }

  const addNestedItem = (listName: 'staff' | 'vehicles') => {
    if (listName === 'staff') {
      setFormData(prev => ({
        ...prev,
        staff: [...prev.staff, {name: '', age: 0, gender: '男性', term: ''}],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, {plate: '', term: ''}],
      }))
    }
  }

  const removeNestedItem = (listName: 'staff' | 'vehicles', index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const saveData = {
      id: initialData?.id,
      name: formData.name,
      address: formData.address || undefined,
      amount: formData.amount || undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      staff: formData.staff,
      vehicles: formData.vehicles,
    }

    // スタッフと車両の保存は別途処理（サイト保存後に実行）
    onSave(saveData)
  }

  return (
    <BasicModal
      open={isOpen}
      setopen={onClose}
      title={initialData ? '現場の編集' : '新規現場の登録'}
      style={{maxWidth: '600px', maxHeight: '90vh'}}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">現場名</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">金額（円）</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">施工開始日</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">施工終了日</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* 担当スタッフ */}
        <div className="space-y-3 pt-2 border-t">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">担当スタッフ</label>
              <Button type="button" color="blue" size="sm" onClick={() => addNestedItem('staff')}>
                <Plus className="w-3 h-3 mr-1 inline-block" /> 追加
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
              {formData.staff.length === 0 && <p className="text-xs text-gray-500 text-center">スタッフがいません</p>}
              {formData.staff.map((staff, index) => (
                <div key={index} className="p-2 bg-white border rounded-md relative">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <input
                      type="text"
                      placeholder="氏名"
                      value={staff.name}
                      onChange={e => handleNestedChange('staff', index, 'name', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="number"
                      placeholder="年齢"
                      value={staff.age}
                      onChange={e => handleNestedChange('staff', index, 'age', parseInt(e.target.value) || 0)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={staff.gender}
                      onChange={e => handleNestedChange('staff', index, 'gender', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="男性">男性</option>
                      <option value="女性">女性</option>
                      <option value="その他">その他</option>
                    </select>
                    <input
                      type="text"
                      placeholder="期間 (例: YYYY-MM-DD~)"
                      value={staff.term}
                      onChange={e => handleNestedChange('staff', index, 'term', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    color="red"
                    className="absolute top-0 right-0 rounded-full p-1 "
                    onClick={() => removeNestedItem('staff', index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 利用車両 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">利用車両</label>
              <Button type="button" color="blue" size="sm" onClick={() => addNestedItem('vehicles')}>
                <Plus className="w-3 h-3 mr-1 inline-block" /> 追加
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border">
              {formData.vehicles.length === 0 && <p className="text-xs text-gray-500 text-center">車両がありません</p>}
              {formData.vehicles.map((vehicle, index) => (
                <div key={index} className="p-2 bg-white border rounded-md relative">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <input
                      type="text"
                      placeholder="プレート番号"
                      value={vehicle.plate}
                      onChange={e => handleNestedChange('vehicles', index, 'plate', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="期間 (例: YYYY-MM-DD~)"
                      value={vehicle.term}
                      onChange={e => handleNestedChange('vehicles', index, 'term', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    color="red"
                    className="absolute top-0 right-0 rounded-full p-1 "
                    onClick={() => removeNestedItem('vehicles', index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
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
