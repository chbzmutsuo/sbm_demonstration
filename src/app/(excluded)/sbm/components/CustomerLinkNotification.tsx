'use client'

import React from 'react'
import {AlertCircle, Link, UserPlus, Users} from 'lucide-react'

type CustomerLinkNotificationProps = {
  isLinked: boolean
  matchedCustomer?: CustomerType | null
  matchedCustomers?: CustomerType[]
  onLinkCustomer: () => void
  onShowCustomerList: () => void
  onCancelLink: () => void
}

const CustomerLinkNotification: React.FC<CustomerLinkNotificationProps> = ({
  isLinked,
  matchedCustomer,
  matchedCustomers = [],
  onLinkCustomer,
  onShowCustomerList,
  onCancelLink,
}) => {
  if (isLinked) {
    return (
      <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded-md">
        <Link size={18} className="text-blue-500 mr-2" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-700">顧客情報連携中: {matchedCustomer?.companyName}</p>
          <p className="text-xs text-blue-600">登録済みの顧客情報と連携しています</p>
        </div>
      </div>
    )
  }

  if (matchedCustomers && matchedCustomers.length > 1) {
    return (
      <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <Users size={18} className="text-yellow-500 mr-2" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-700">
            同じ電話番号で登録された顧客が{matchedCustomers.length}件見つかりました
          </p>
          <p className="text-xs text-yellow-600">顧客リストから連携先を選択してください</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onShowCustomerList}
            className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
          >
            顧客を選択
          </button>
          <button
            type="button"
            onClick={onCancelLink}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  } else if (matchedCustomer) {
    return (
      <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <AlertCircle size={18} className="text-yellow-500 mr-2" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-700">
            同じ電話番号で登録された顧客が見つかりました: {matchedCustomer.companyName}
          </p>
          <p className="text-xs text-yellow-600">この顧客情報と連携しますか？</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onLinkCustomer}
            className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
          >
            連携する
          </button>
          <button
            type="button"
            onClick={onCancelLink}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded-md">
      <UserPlus size={18} className="text-gray-500 mr-2" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">新規顧客</p>
        <p className="text-xs text-gray-600">この顧客情報は予約と共に保存されます</p>
      </div>
    </div>
  )
}

export default CustomerLinkNotification
