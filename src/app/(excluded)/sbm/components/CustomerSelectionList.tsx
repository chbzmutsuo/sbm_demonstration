'use client'

import React from 'react'
import {User, Phone} from 'lucide-react'

import {formatPhoneNumber} from '../utils/phoneUtils'

type CustomerSelectionListProps = {
  customers: any[]
  onSelectCustomer: (customer: CustomerType) => void
  onCancel: () => void
}

const CustomerSelectionList: React.FC<CustomerSelectionListProps> = ({customers, onSelectCustomer, onCancel}) => {
  if (customers.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">該当する顧客が見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">顧客を選択してください</h3>
      <p className="text-sm text-gray-600 mb-4">同じ電話番号で複数の顧客が見つかりました。連携する顧客を選択してください。</p>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {customers.map(result => (
          <div
            key={result.customer.id}
            className="border rounded-md p-3 hover:bg-blue-50 cursor-pointer transition-colors"
            onClick={() => onSelectCustomer(result.customer)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{result.customer.companyName}</div>
                {result.customer.contactName && (
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <User size={14} className="mr-1" />
                    {result.customer.contactName}
                  </div>
                )}
                <div className="mt-2 space-y-1">
                  {result.matchedPhones.map(phone => (
                    <div key={phone.id} className="text-sm text-gray-600 flex items-center">
                      <Phone size={14} className="mr-1" />
                      <span className="font-mono">{formatPhoneNumber(phone.phoneNumber)}</span>
                      <span className="ml-2 text-xs">({phone.label})</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {result.customer.prefecture} {result.customer.city} {result.customer.street}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

export default CustomerSelectionList
