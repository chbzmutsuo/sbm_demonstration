'use client'

import React, {useState, useEffect} from 'react'
import {Search, Phone, User, X, Loader2} from 'lucide-react'
import {searchCustomersByPhone} from '../actions'

import {formatPhoneNumber} from '../utils/phoneUtils'

type CustomerSearchModalProps = {
  onClose: () => void
  onSelectCustomer: (customer: CustomerType) => void
  initialPhone?: string
  isOpen?: boolean // useModalとの互換性のために残す
}

/**
 * 顧客検索モーダル
 * 電話番号による部分一致検索を行い、顧客を選択する
 */
const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({onClose, onSelectCustomer, initialPhone = ''}) => {
  const [searchPhone, setSearchPhone] = useState(initialPhone)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (initialPhone) {
      setSearchPhone(initialPhone)
      handleSearch(initialPhone)
    }
  }, [initialPhone])

  // 検索実行
  const handleSearch = async (phone: string = searchPhone) => {
    if (!phone || phone.length < 3) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(false)

    try {
      const results = await searchCustomersByPhone(phone)
      setSearchResults(results)
      setHasSearched(true)
    } catch (error) {
      console.error('検索エラー:', error)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  // 顧客選択
  const handleSelectCustomer = (customer: CustomerType) => {
    onSelectCustomer(customer)
    onClose()
  }

  // モーダルを閉じる
  const handleClose = () => {
    setSearchPhone('')
    setSearchResults([])
    setHasSearched(false)
    onClose()
  }

  return (
    <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-2xl">
      {/* ヘッダー */}
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Search className="mr-2" size={20} />
            顧客検索
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* 検索フォーム */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">電話番号（部分一致）</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              placeholder="090, 03, 携帯番号の一部など..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !searchPhone || searchPhone.length < 3}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Search size={16} className="mr-1" />
                  検索
                </>
              )}
            </button>
          </div>
          {searchPhone.length > 0 && searchPhone.length < 3 && (
            <p className="text-sm text-gray-500 mt-1">3文字以上入力してください</p>
          )}
        </div>

        {/* 検索結果 */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">検索中...</p>
            </div>
          )}

          {!isLoading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-8">
              <User size={32} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">該当する顧客が見つかりませんでした</p>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">{searchResults.length}件の顧客が見つかりました</p>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.customer.id}-${index}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectCustomer(result.customer)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{result.customer.companyName}</h4>
                      {result.customer.contactName && (
                        <p className="text-sm text-gray-600">担当: {result.customer.contactName}</p>
                      )}
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          住所: {result.customer.prefecture}
                          {result.customer.city}
                          {result.customer.street}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">マッチした電話番号:</p>
                        {result.matchedPhones.map((phone, phoneIndex) => (
                          <div key={phoneIndex} className="flex items-center justify-end text-sm text-blue-600 mb-1">
                            <Phone size={14} className="mr-1" />
                            <span className="font-mono">{formatPhoneNumber(phone.phoneNumber)}</span>
                            <span className="ml-1 text-xs text-gray-500">({phone.label})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleClose}
          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

export default CustomerSearchModal
