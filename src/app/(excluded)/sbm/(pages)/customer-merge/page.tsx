'use client'

import React, {useState, useEffect} from 'react'

import {Search, Users, AlertTriangle, CheckCircle, X, ArrowLeft} from 'lucide-react'
import {getAllCustomers, mergeCustomers} from '../../actions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useModal from '@cm/components/utils/modal/useModal'
import {Padding} from '@cm/components/styles/common-components/common-components'

export default function CustomerMergePage() {
  const [customers, setCustomers] = useState<CustomerType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [parentCustomer, setParentCustomer] = useState<CustomerType | null>(null)
  const [childCustomer, setChildCustomer] = useState<CustomerType | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const ConfirmMergeModalReturn = useModal()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await getAllCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('顧客データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const keyword = searchKeyword.toLowerCase()
    return (
      customer.companyName?.toLowerCase().includes(keyword) ||
      customer.contactName?.toLowerCase().includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword)
    )
  })

  const handleMerge = async () => {
    if (!parentCustomer || !childCustomer) return

    setIsProcessing(true)
    try {
      const result = await mergeCustomers(Number(parentCustomer.id), Number(childCustomer.id))
      if (result.success) {
        alert('顧客統合が完了しました')
        setParentCustomer(null)
        setChildCustomer(null)
        await loadCustomers()
        ConfirmMergeModalReturn.handleClose()
      } else {
        alert(result.error || '統合に失敗しました')
      }
    } catch (error) {
      console.error('統合エラー:', error)
      alert('統合中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-8">
          <Users className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">顧客統合</h1>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">重要な注意事項</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>統合後、子顧客（統合元）のデータは完全に削除されます</li>
                  <li>子顧客の予約データ</li>
                  <li>この操作は元に戻すことができません</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 検索フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="顧客名、担当者名、電話番号、メールアドレスで検索..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 統合先（親）顧客選択 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="mr-2 text-green-600" size={20} />
                統合先（親）顧客
              </h2>
              <p className="text-sm text-gray-600 mt-1">データを残す顧客を選択してください</p>
            </div>
            <div className="p-4">
              {parentCustomer ? (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{parentCustomer.companyName}</h3>
                      {parentCustomer.contactName && <p className="text-sm text-gray-600">担当: {parentCustomer.contactName}</p>}

                      <p className="text-sm text-gray-600">
                        {parentCustomer.prefecture}
                        {parentCustomer.city}
                      </p>
                    </div>
                    <button onClick={() => setParentCustomer(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">統合先の顧客を選択してください</p>
              )}
            </div>
          </div>

          {/* 統合方向 */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <ArrowLeft size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">統合</p>
            </div>
          </div>

          {/* 統合元（子）顧客選択 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="mr-2 text-red-600" size={20} />
                統合元（子）顧客
              </h2>
              <p className="text-sm text-gray-600 mt-1">削除される顧客を選択してください</p>
            </div>
            <div className="p-4">
              {childCustomer ? (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{childCustomer.companyName}</h3>
                      {childCustomer.contactName && <p className="text-sm text-gray-600">担当: {childCustomer.contactName}</p>}

                      <p className="text-sm text-gray-600">
                        {childCustomer.prefecture}
                        {childCustomer.city}
                      </p>
                    </div>
                    <button onClick={() => setChildCustomer(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">統合元の顧客を選択してください</p>
              )}
            </div>
          </div>
        </div>

        {/* 統合実行ボタン */}
        {parentCustomer && childCustomer && (
          <div className="mt-6 text-center">
            <button
              onClick={() => ConfirmMergeModalReturn.handleOpen({parentCustomer, childCustomer})}
              disabled={isProcessing}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isProcessing ? '統合中...' : '顧客統合を実行'}
            </button>
          </div>
        )}

        {/* 顧客一覧 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">顧客一覧</h2>
            <p className="text-sm text-gray-600">統合する顧客をクリックして選択してください</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">担当者</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-gray-50 ${
                      parentCustomer?.id === customer.id
                        ? 'bg-green-50 border-green-200'
                        : childCustomer?.id === customer.id
                          ? 'bg-red-50 border-red-200'
                          : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{customer.companyName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.contactName || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.phones?.map(phone => phone.phoneNumber).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.prefecture}
                      {customer.city}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.createdAt ? formatDate(customer.createdAt) : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setParentCustomer(customer)}
                          disabled={childCustomer?.id === customer.id}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          統合先に設定
                        </button>
                        <button
                          onClick={() => setChildCustomer(customer)}
                          disabled={parentCustomer?.id === customer.id}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          統合元に設定
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 統合確認モーダル */}
      <ConfirmMergeModalReturn.Modal>
        <Padding>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="mr-2 text-red-600" size={24} />
                顧客統合の確認
              </h3>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">以下の顧客統合を実行します：</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* 統合先 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-semibold text-green-800 mb-2">統合先（残る顧客）</h4>
                      <p className="text-sm font-medium">{parentCustomer?.companyName}</p>
                    </div>

                    {/* 矢印 */}
                    <div className="text-center">
                      <ArrowLeft size={24} className="text-gray-400 mx-auto" />
                    </div>

                    {/* 統合元 */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="font-semibold text-red-800 mb-2">統合元（削除される顧客）</h4>
                      <p className="text-sm font-medium">{childCustomer?.companyName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">実行される処理：</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 統合元顧客の全予約データを統合先顧客に移行</li>
                    <li>• 統合元顧客の電話番号データを統合先顧客に移行</li>
                    <li>• 統合元顧客のRFM分析データを統合先顧客に移行</li>
                    <li>• 統合元顧客のデータを完全削除</li>
                  </ul>
                  <p className="text-sm text-yellow-700 font-semibold mt-2">⚠️ この操作は元に戻すことができません</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => ConfirmMergeModalReturn.handleClose()}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold"
                >
                  {isProcessing ? '統合中...' : '統合を実行'}
                </button>
              </div>
            </div>
          </div>
        </Padding>
      </ConfirmMergeModalReturn.Modal>
    </div>
  )
}
