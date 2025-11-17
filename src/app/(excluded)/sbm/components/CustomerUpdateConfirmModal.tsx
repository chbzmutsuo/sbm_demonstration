'use client'

import React from 'react'
import {AlertCircle} from 'lucide-react'

type CustomerUpdateConfirmModalProps = {
  onConfirm: () => void
  onCancel: () => void
}

/**
 * 顧客情報更新確認モーダル
 * 予約作成時に顧客情報をマスタに登録するか確認する
 */
const CustomerUpdateConfirmModal: React.FC<CustomerUpdateConfirmModalProps> = ({onConfirm, onCancel}) => {
  return (
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-yellow-500 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">顧客情報の更新</h3>
        </div>
        <p className="text-gray-600 mb-6">
          予約データを作成しますか？
          <br />
          <small className="text-gray-500">今後同じ電話番号で検索できるようになります。</small>
        </p>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            キャンセル
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            更新して保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerUpdateConfirmModal
