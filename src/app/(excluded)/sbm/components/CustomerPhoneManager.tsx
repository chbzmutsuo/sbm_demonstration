'use client'

import React, {useState} from 'react'
import {Phone, Plus, X} from 'lucide-react'

import {formatPhoneNumber, handlePhoneNumberInput} from '../utils/phoneUtils'
import {PHONE_LABELS} from '@app/(excluded)/sbm/components/CustomerPhoneDisplay'

type PhoneNumberTemp = {
  id?: number // DBに保存済みの場合はIDあり
  phoneNumber: string
  label: string
  isNew?: boolean
}

type CustomerPhoneManagerProps = {
  phoneNumbers: PhoneNumberTemp[]
  onPhoneNumbersChange: (phones: PhoneNumberTemp[]) => void
}

/**
 * 電話番号管理コンポーネント
 * 複数の電話番号を追加・編集・削除できる
 */
const CustomerPhoneManager: React.FC<CustomerPhoneManagerProps> = ({phoneNumbers, onPhoneNumbersChange}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newPhoneLabel, setNewPhoneLabel] = useState<string>('携帯')

  // 電話番号追加
  const handleAddPhone = () => {
    if (!newPhone) return

    const newPhoneItem: PhoneNumberTemp = {
      phoneNumber: newPhone,
      label: newPhoneLabel,
      isNew: true,
    }

    onPhoneNumbersChange([...phoneNumbers, newPhoneItem])
    setNewPhone('')
    setNewPhoneLabel('携帯')
    setShowAddForm(false)
  }

  // 電話番号削除
  const handleRemovePhone = (index: number) => {
    const updatedPhones = [...phoneNumbers]
    updatedPhones.splice(index, 1)
    onPhoneNumbersChange(updatedPhones)
  }

  return (
    <div className="space-y-2">
      {phoneNumbers.length > 0 ? (
        <div className="space-y-1">
          {phoneNumbers.map((phone, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Phone size={14} className="mr-1 text-gray-400" />
                <span className="font-mono">{formatPhoneNumber(phone.phoneNumber)}</span>
                <span className="ml-2 text-xs text-gray-500">({phone.label})</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhone(index)}
                className="text-red-500 hover:text-red-700"
                title="削除"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">電話番号が登録されていません</div>
      )}

      {showAddForm ? (
        <div className="mt-2 space-y-2">
          <div className="flex space-x-2">
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(handlePhoneNumberInput(e.target.value))}
              placeholder="新しい電話番号"
              inputMode="numeric"
              pattern="[0-9]*"
              className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newPhoneLabel}
              onChange={e => setNewPhoneLabel(e.target.value as string)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PHONE_LABELS.map(label => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setNewPhone('')
                setNewPhoneLabel('携帯')
                setShowAddForm(false)
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleAddPhone}
              disabled={!newPhone}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              追加
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800"
        >
          <Plus size={12} className="mr-1" />
          電話番号を追加
        </button>
      )}
    </div>
  )
}

export default CustomerPhoneManager
export type {PhoneNumberTemp}
