'use client'

import React, {useState, useEffect} from 'react'

import {Button} from '@cm/shadcn/ui/button'
import {Input} from '@cm/shadcn/ui/input'

import Textarea from '@cm/shadcn/ui/Organisms/form/Textarea'

type IngredientFormModalProps = {
  ingredient?: IngredientType | null
  onSave: (data: Partial<IngredientType>) => void
  onClose: () => void
}

export const IngredientFormModal: React.FC<IngredientFormModalProps> = ({ingredient, onSave, onClose}) => {
  const [formData, setFormData] = useState<Partial<IngredientType>>({
    name: '',
    description: '',
    unit: '',
  })

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        description: ingredient.description || '',
        unit: ingredient.unit,
      })
    }
  }, [ingredient])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{ingredient ? '材料の編集' : '新規材料の追加'}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">材料名*</label>
          <Input name="name" value={formData.name} onChange={handleChange} required className="w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">単位*</label>
          <Input
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="個、g、ml など"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <Textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange as any}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </div>
  )
}
