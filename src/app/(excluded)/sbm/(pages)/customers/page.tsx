'use client'

import React, {useState, useEffect} from 'react'

import {Search, PlusCircle, Edit, Trash2, Users, Phone} from 'lucide-react'
import {getAllCustomers, createCustomer, updateCustomer, deleteCustomer, updateCustomerPhoneList} from '../../actions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {FilterSection, useFilterForm} from '@cm/components/utils/FilterSection'
import useModal from '@cm/components/utils/modal/useModal'
import {Padding} from '@cm/components/styles/common-components/common-components'
import CustomerPhoneManager from '../../components/CustomerPhoneManager'
import PostalCodeInput from '../../components/PostalCodeInput'
import {formatPhoneNumber} from '../../utils/phoneUtils'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function CustomersPage() {
  const {query, addQuery} = useGlobal()
  const [customers, setCustomers] = useState<CustomerType[]>([])
  const [loading, setLoading] = useState(true)

  // フィルターフォームの状態管理
  const defaultFilters = {
    searchKeyword: query.searchKeyword || '',
  }

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const {
    formValues: filterValues,
    setFormValues: setFilterValues,
    resetForm: resetFilterForm,
    handleInputChange: handleFilterInputChange,
  } = useFilterForm(defaultFilters)

  // 現在適用されているフィルター
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

  const DeleteCustomerModalReturn = useModal()

  const PhoneManagerModalReturn = useModal()

  useEffect(() => {
    loadCustomers()
  }, [appliedFilters])

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

  // フィルターを適用する
  const applyFilters = () => {
    setAppliedFilters({...filterValues})
    addQuery({searchKeyword: filterValues.searchKeyword})
  }

  // フィルターをクリアする
  const clearFilters = () => {
    resetFilterForm()
    setAppliedFilters(defaultFilters)
    addQuery({searchKeyword: ''})
  }

  const EditCustomerModalReturn = useModal()

  const filteredCustomers = customers.filter(customer => {
    const keyword = query.searchKeyword?.toLowerCase() || ''
    return (
      customer.companyName?.toLowerCase().includes(keyword) ||
      customer.contactName?.toLowerCase().includes(keyword) ||
      customer.phones
        ?.map(phone => phone.phoneNumber)
        .join(', ')
        ?.toLowerCase()
        .includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword) ||
      `${customer.prefecture || ''}${customer.city || ''}${customer.street || ''}${customer.building || ''}`
        .toLowerCase()
        .includes(keyword)
    )
  })

  // ページネーション用
  const pageCount = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = async () => {
    if (!DeleteCustomerModalReturn.open?.customer) return
    if (confirm('この顧客を削除してもよろしいですか？')) {
      try {
        const result = await deleteCustomer(DeleteCustomerModalReturn.open.customer.id)

        if (result.success) {
          await loadCustomers()
          DeleteCustomerModalReturn.handleClose()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除中にエラーが発生しました')
      }
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
      <div className=" mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Users className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">顧客マスタ</h1>
          </div>
          <button
            onClick={() => EditCustomerModalReturn.handleOpen({customer: undefined})}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            <span>新規顧客追加</span>
          </button>
        </div>

        {/* 検索フィルター */}
        <FilterSection onApply={applyFilters} onClear={clearFilters} title="顧客検索">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">検索</label>
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="searchKeyword"
                  value={filterValues.searchKeyword || ''}
                  onChange={handleFilterInputChange}
                  placeholder="会社名、氏名、電話番号、住所で検索..."
                  className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* 顧客一覧 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">顧客一覧 ({filteredCustomers.length}件)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会社名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配達先住所</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ポイント</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map(customer => {
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{customer.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{customer.contactName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {customer.phones?.map(phone => {
                          return (
                            <div key={phone.id} className={` text-gray-700 text-xs`}>
                              {formatPhoneNumber(phone.phoneNumber)} ({phone.label})
                            </div>
                          )
                        })}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {`${customer.prefecture || ''}${customer.city || ''}${customer.street || ''}${customer.building ? ' ' + customer.building : ''}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-semibold">{customer.availablePoints?.toLocaleString()}pt</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {customer.createdAt ? formatDate(customer.createdAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              PhoneManagerModalReturn.handleOpen({
                                customer,
                                loadCustomers,
                              })
                            }
                            className="text-green-600 hover:text-green-800"
                            title="電話番号管理"
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            onClick={() => EditCustomerModalReturn.handleOpen({customer})}
                            className="text-blue-600 hover:text-blue-800"
                            title="編集"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => DeleteCustomerModalReturn.handleOpen({customer})}
                            className="text-red-600 hover:text-red-800"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {query.searchKeyword ? '検索条件に一致する顧客が見つかりません' : '顧客データがありません'}
              </p>
            </div>
          )}

          {/* ページネーション */}
          {pageCount > 1 && (
            <div className="px-6 py-4 border-t flex justify-center">
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  前へ
                </button>

                {Array.from({length: Math.min(5, pageCount)}, (_, i) => {
                  // 現在のページを中心に表示するページ番号を計算
                  let pageNum
                  if (pageCount <= 5) {
                    // 5ページ以下の場合はすべて表示
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    // 現在のページが先頭付近の場合
                    pageNum = i + 1
                  } else if (currentPage >= pageCount - 2) {
                    // 現在のページが末尾付近の場合
                    pageNum = pageCount - 4 + i
                  } else {
                    // それ以外の場合は現在のページを中心に表示
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 顧客フォームモーダル */}
      <EditCustomerModalReturn.Modal>
        <Padding>
          <CustomerModal
            onUpdate={loadCustomers}
            customer={EditCustomerModalReturn.open?.customer}
            onClose={EditCustomerModalReturn.handleClose}
          />
        </Padding>
      </EditCustomerModalReturn.Modal>
      {/* 電話番号管理モーダル */}
      <PhoneManagerModalReturn.Modal>
        <Padding>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <CustomerPhoneManager
                phoneNumbers={PhoneManagerModalReturn.open?.customer?.phones || []}
                onPhoneNumbersChange={async phones => {
                  PhoneManagerModalReturn.setopen({
                    ...PhoneManagerModalReturn.open,
                    customer: {...PhoneManagerModalReturn.open?.customer, phones},
                  })
                }}
              />
              <div className="mt-6 flex justify-end gap-8">
                <button
                  onClick={PhoneManagerModalReturn.handleClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  閉じる
                </button>
                <button
                  onClick={async () => {
                    const {id, phones} = PhoneManagerModalReturn.open?.customer || {}
                    await updateCustomerPhoneList(id, phones)
                    await loadCustomers()
                    PhoneManagerModalReturn.handleClose()
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-gray-700"
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        </Padding>
      </PhoneManagerModalReturn.Modal>
      {/* 削除確認モーダル */}
      <DeleteCustomerModalReturn.Modal>
        <Padding>
          <ConfirmModal
            title="顧客削除確認"
            message="この顧客を削除してもよろしいですか？この操作は元に戻せません。"
            onConfirm={handleDelete}
            onClose={() => DeleteCustomerModalReturn.handleClose()}
          />
        </Padding>
      </DeleteCustomerModalReturn.Modal>
    </div>
  )
}

// 顧客フォームモーダル
const CustomerModal = ({
  customer,
  onUpdate,
  onClose,
}: {
  onUpdate: () => void
  customer: CustomerType | null
  onClose: () => void
}) => {
  const [formData, setFormData] = useState<Partial<CustomerType>>({
    companyName: customer?.companyName || '',
    contactName: customer?.contactName || '',
    phones: customer?.phones || [],
    email: customer?.email || '',
    prefecture: customer?.prefecture || '',
    city: customer?.city || '',
    street: customer?.street || '',
    building: customer?.building || '',
    postalCode: customer?.postalCode || '',
    availablePoints: customer?.availablePoints || 0,
    notes: customer?.notes || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value, type} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.prefecture || !formData.city || !formData.street) {
      alert('都道府県、市区町村、町名番地は必須です')
      return
    }

    const customerData = formData

    try {
      if (customer) {
        const result = await updateCustomer(customer.id!, customerData)
        if (result.success) {
          // await loadCustomers()
          // EditCustomerModalReturn.handleClose()
          await onUpdate()
          await onClose()
        } else {
          alert(result.error || '更新に失敗しました')
        }
      } else {
        const result = await createCustomer(customerData as Omit<CustomerType, 'id' | 'createdAt' | 'updatedAt'>)

        if (result.success) {
          await onUpdate()
          await onClose()
        } else {
          alert(result.error || '作成に失敗しました')
        }
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存中にエラーが発生しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">氏名*</label>
        <input
          type="text"
          name="contactName"
          value={formData.contactName || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <PostalCodeInput
        postalCode={formData.postalCode || ''}
        prefecture={formData.prefecture || ''}
        city={formData.city || ''}
        street={formData.street || ''}
        building={formData.building || ''}
        onAddressChange={addressData => {
          setFormData(prev => ({
            ...prev,
            ...addressData,
          }))
        }}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">利用可能ポイント</label>
        <input
          type="number"
          name="availablePoints"
          value={formData.availablePoints || 0}
          onChange={handleInputChange}
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          キャンセル
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          保存
        </button>
      </div>
    </form>
  )
}

// 確認モーダル
const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  onConfirm: () => void
  onClose: () => void
}) => (
  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end space-x-3">
      <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
        キャンセル
      </button>
      <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
        削除
      </button>
    </div>
  </div>
)
