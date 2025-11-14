'use client'

import {useState, useEffect} from 'react'
import {Plus, Trash2} from 'lucide-react'
import {AidocumentCompany} from '@prisma/client'
import {ConstructionLicense, SocialInsurance} from '../../types'
import {Button} from '@cm/components/styles/common-components/Button'

interface CompanyFormProps {
  initialData: AidocumentCompany
  onSave: (data: {
    name: string
    representativeName?: string
    address?: string
    phone?: string
    constructionLicense?: ConstructionLicense[]
    socialInsurance?: SocialInsurance
  }) => void
}

export default function CompanyForm({initialData, onSave}: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    representativeName: (initialData.representativeName as string) || '',
    address: (initialData.address as string) || '',
    phone: (initialData.phone as string) || '',
    constructionLicense: (initialData.constructionLicense as ConstructionLicense[]) || [],
    socialInsurance: (initialData.socialInsurance as SocialInsurance) || {
      health: 'joined',
      pension: 'joined',
      employment: 'joined',
      officeName: '',
      officeCode: '',
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialInsuranceChange = (field: keyof SocialInsurance, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialInsurance: {
        ...prev.socialInsurance,
        [field]: value,
      },
    }))
  }

  const addLicense = () => {
    setFormData(prev => ({
      ...prev,
      constructionLicense: [...prev.constructionLicense, {type: '', number: '', date: ''}],
    }))
  }

  const removeLicense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constructionLicense: prev.constructionLicense?.filter((_, i) => i !== index),
    }))
  }

  const updateLicense = (index: number, field: keyof ConstructionLicense, value: string) => {
    setFormData(prev => {
      const newLicenses = [...(prev.constructionLicense || [])]
      newLicenses[index] = {...newLicenses[index], [field]: value}
      return {...prev, constructionLicense: newLicenses}
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* 基本情報 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">基本情報</h2>
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
      </div>

      {/* 建設業許可 */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">建設業許可</h2>
          <Button type="button" color="blue" size="sm" onClick={addLicense}>
            <Plus className="w-3 h-3 mr-1 inline-block" /> 追加
          </Button>
        </div>
        <div className="space-y-2">
          {formData.constructionLicense?.length === 0 && (
            <p className="text-xs text-gray-500 text-center">許可情報がありません</p>
          )}
          {formData.constructionLicense?.map((license, index) => (
            <div key={index} className="p-3 bg-gray-50 border rounded-md relative">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="許可業種"
                  value={license.type}
                  onChange={e => updateLicense(index, 'type', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="許可番号"
                  value={license.number}
                  onChange={e => updateLicense(index, 'number', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={license.date}
                  onChange={e => updateLicense(index, 'date', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <Button type="button" color="red" className="absolute top-1 right-1 w-6 h-6" onClick={() => removeLicense(index)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 社会保険情報 */}
      <div className="space-y-3 pt-4 border-t">
        <h2 className="text-lg font-semibold text-gray-800">社会保険情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">健康保険</label>
            <select
              value={formData.socialInsurance.health}
              onChange={e => handleSocialInsuranceChange('health', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="joined">加入</option>
              <option value="not_joined">未加入</option>
              <option value="exempt">免除</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">厚生年金保険</label>
            <select
              value={formData.socialInsurance.pension}
              onChange={e => handleSocialInsuranceChange('pension', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="joined">加入</option>
              <option value="not_joined">未加入</option>
              <option value="exempt">免除</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">雇用保険</label>
            <select
              value={formData.socialInsurance.employment}
              onChange={e => handleSocialInsuranceChange('employment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="joined">加入</option>
              <option value="not_joined">未加入</option>
              <option value="exempt">免除</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">営業所名称</label>
            <input
              type="text"
              value={formData.socialInsurance.officeName || ''}
              onChange={e => handleSocialInsuranceChange('officeName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">事業所整理記号等</label>
            <input
              type="text"
              value={formData.socialInsurance.officeCode || ''}
              onChange={e => handleSocialInsuranceChange('officeCode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button color="blue" type="submit">
          保存
        </Button>
      </div>
    </form>
  )
}
