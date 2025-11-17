'use client'

import React, {useState, useEffect} from 'react'
import {Phone, Plus} from 'lucide-react'

import {getCustomerPhones, createCustomerPhone} from '../actions'
import {formatPhoneNumber, handlePhoneNumberInput} from '../utils/phoneUtils'

export const PHONE_LABELS: string[] = ['自宅', '携帯', '職場', 'FAX', 'その他']

type CustomerPhoneDisplayProps = {
  customerId?: number
  phoneNumber?: string // メインの電話番号（連携時に表示）
  onPhoneNumberChange?: (phoneNumber: string) => void
}

/**
 * 顧客の電話番号表示コンポーネント
 * 既存の顧客と連携している場合は、その顧客の電話番号一覧を表示
 * 新規の電話番号も追加できる
 */
const CustomerPhoneDisplay: React.FC<CustomerPhoneDisplayProps> = ({customerId, phoneNumber = '', onPhoneNumberChange}) => {
  const [phones, setPhones] = useState<CustomerPhoneType[]>([])
  const [loading, setLoading] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [phoneLabel, setPhoneLabel] = useState<string>('携帯')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (customerId) {
      loadPhones()
    }
  }, [customerId])

  const loadPhones = async () => {
    if (!customerId) return

    setLoading(true)
    try {
      const data = await getCustomerPhones(customerId)
      setPhones(data)
    } catch (error) {
      console.error('電話番号データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePhoneState = async () => {
    if (!customerId || !newPhone) return

    try {
      await createCustomerPhone({
        sbmCustomerId: customerId,
        label: phoneLabel,
        phoneNumber: newPhone,
      })

      setNewPhone('')
      setPhoneLabel('携帯')
      setShowAddForm(false)
      await loadPhones()

      // メイン電話番号も更新
      if (onPhoneNumberChange) {
        onPhoneNumberChange(newPhone)
      }
    } catch (error) {
      console.error('電話番号の追加に失敗しました:', error)
    }
  }

  // // 顧客IDがない場合は単一の電話番号入力フィールドを表示
  // if (!customerId) {
  //   return null
  // }

  return (
    <div className="mt-2">
      {loading ? (
        <div className="text-sm text-gray-500">読み込み中...</div>
      ) : phones.length > 0 ? (
        <div>
          <div className="text-xs text-gray-500 mb-1">登録済み電話番号:</div>
          <div className="space-y-1">
            {phones.map(phone => (
              <div key={phone.id} className="flex items-center text-sm">
                <Phone size={14} className="mr-1 text-gray-400" />
                <span className="font-mono">{formatPhoneNumber(phone.phoneNumber)}</span>
                <span className="ml-2 text-xs text-gray-500">({phone.label})</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
              value={phoneLabel}
              onChange={e => setPhoneLabel(e.target.value as string)}
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
                setPhoneLabel('携帯')
                setShowAddForm(false)
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSavePhoneState}
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
          className="mt-1 flex items-center text-xs text-blue-600 hover:text-blue-800"
        >
          <Plus size={12} className="mr-1" />
          電話番号を追加
        </button>
      )}
    </div>
  )
}

export default CustomerPhoneDisplay
