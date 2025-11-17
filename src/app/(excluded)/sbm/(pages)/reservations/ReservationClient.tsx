'use client'

import React, {useState, useEffect} from 'react'

import {Search, PlusCircle, Edit, CheckSquare, Square, Clock, Ban, RefreshCw} from 'lucide-react'
import {formatPhoneNumber} from '../../utils/phoneUtils'

import {getReservations, getAllCustomers, getVisibleProducts, upsertReservation, deleteReservation} from '../../actions'
import {cancelReservation} from '../../actions/cancel-reservation'
import {restoreReservation} from '../../actions/restore-reservation'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useModal from '@cm/components/utils/modal/useModal'
import {C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {cn} from '@cm/shadcn/lib/utils'
import {FilterSection, useFilterForm} from '@cm/components/utils/FilterSection'

import {ReservationModal} from '@app/(excluded)/sbm/(pages)/reservations/ReservationModal'
import {PhoneNumberTemp} from '@app/(excluded)/sbm/components/CustomerPhoneManager'
import {ReservationHistoryViewer} from '@app/(excluded)/sbm/components/ReservationHistoryViewer'
import {CancelReservationModal} from '@app/(excluded)/sbm/components/CancelReservationModal'
import {RestoreReservationModal} from '@app/(excluded)/sbm/components/RestoreReservationModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function ReservationClient() {
  const [reservations, setReservations] = useState<ReservationType[]>([])
  const [customers, setCustomers] = useState<CustomerType[]>([])
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const {addQuery, query} = useGlobal()

  // フィルターフォームの状態管理
  const defaultFilters = {
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    keyword: '', // 商品名、担当スタッフ、お客様名、会社名で検索
    deliveryCompleted: '',
    recoveryCompleted: '',
    showCanceled: false,
  }

  const {
    formValues: filterValues,
    setFormValues: setFilterValues,
    resetForm: resetFilterForm,
    handleInputChange: handleFilterInputChange,
  } = useFilterForm(defaultFilters)

  const EditReservationModalReturn = useModal()
  const DeleteReservationModalReturn = useModal()
  const ReservationHistoryModalReturn = useModal()
  const CancelReservationModalReturn = useModal()
  const RestoreReservationModalReturn = useModal()

  useEffect(() => {
    loadData()

    // URLクエリパラメータがある場合はフォームの初期値として設定
    if (Object.keys(query).length > 0) {
      setFilterValues({
        startDate: query.startDate || defaultFilters.startDate,
        endDate: query.endDate || defaultFilters.endDate,
        keyword: query.keyword || '',
        deliveryCompleted: query.deliveryCompleted || '',
        recoveryCompleted: query.recoveryCompleted || '',
        showCanceled: query.showCanceled === 'true' || false,
      })
    }
  }, [])

  useEffect(() => {
    loadReservations()
  }, [query])

  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([getAllCustomers(), getVisibleProducts()])
      setCustomers(customersData)
      setProducts(productsData as ProductType[])
      await loadReservations()
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReservations = async () => {
    try {
      const where: any = {}

      // 日付範囲フィルター
      if (query.startDate || query.endDate) {
        where.deliveryDate = {}

        if (query.startDate) {
          where.deliveryDate.gte = new Date(query.startDate)
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate)
          endDate.setHours(23, 59, 59, 999)
          where.deliveryDate.lte = endDate
        }
      }

      // キーワード検索
      if (query.keyword) {
        where.OR = [
          {customerName: {contains: query.keyword, mode: 'insensitive'}},
          {orderStaff: {contains: query.keyword, mode: 'insensitive'}},
          {notes: {contains: query.keyword, mode: 'insensitive'}},
        ]
      }

      // 詳細フィルター
      if (query.customerName) {
        where.customerName = {contains: query.customerName, mode: 'insensitive'}
      }

      if (query.staffName) {
        where.orderStaff = {contains: query.staffName, mode: 'insensitive'}
      }

      if (query.productName) {
        where.SbmReservationItem = {
          some: {
            productName: {contains: query.productName, mode: 'insensitive'},
          },
        }
      }

      const data = await getReservations(where)
      setReservations(data as ReservationType[])
    } catch (error) {
      console.error('予約データの読み込みに失敗しました:', error)
    }
  }

  // フィルターを適用する
  const applyFilters = () => {
    // フォームの値をURLクエリパラメータに変換
    const queryParams = {...filterValues}

    // 空の値は除外
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '' || queryParams[key] === undefined) {
        delete queryParams[key]
      }
    })

    // URLクエリパラメータを更新
    addQuery(queryParams)
  }

  // フィルターをクリアする
  const clearFilters = () => {
    resetFilterForm()
    addQuery({}) // URLクエリパラメータをクリア
  }

  // 詳細フィルターの表示/非表示を切り替える
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters)
  }

  const handleSave = async (reservationData: Partial<ReservationType & {phones: PhoneNumberTemp[]}>) => {
    try {
      // 既存の予約を編集する場合はIDを設定
      if (EditReservationModalReturn.open?.reservation) {
        reservationData.id = EditReservationModalReturn.open.reservation.id
      }

      // 統合されたupsertReservation関数を使用
      await upsertReservation(reservationData)

      await loadReservations()
      EditReservationModalReturn.handleClose()
    } catch (error) {
      console.error('保存に失敗しました:', error)
    }
  }

  const handleDelete = async () => {
    if (DeleteReservationModalReturn.open?.reservation) {
      try {
        await deleteReservation(Number(DeleteReservationModalReturn.open.reservation.id))
        await loadReservations()
        DeleteReservationModalReturn.handleClose()
      } catch (error) {
        console.error('削除に失敗しました:', error)
      }
    }
  }

  // 予約取り消し処理
  const handleCancelReservation = async (reason: string, userId) => {
    if (CancelReservationModalReturn.open?.reservation) {
      try {
        const result = await cancelReservation(Number(CancelReservationModalReturn.open.reservation.id), reason, userId)

        if (result.success) {
          await loadReservations()
          CancelReservationModalReturn.handleClose()
        } else {
          console.error('予約取り消しエラー:', result.error)
        }
      } catch (error) {
        console.error('予約取り消し処理に失敗しました:', error)
      }
    }
  }

  // 予約復元処理
  const handleRestoreReservation = async userId => {
    if (RestoreReservationModalReturn.open?.reservation) {
      try {
        const result = await restoreReservation(Number(RestoreReservationModalReturn.open.reservation.id), userId)

        if (result.success) {
          await loadReservations()
          RestoreReservationModalReturn.handleClose()
        } else {
          console.error('予約復元エラー:', result.error)
        }
      } catch (error) {
        console.error('予約復元処理に失敗しました:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">予約管理</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => EditReservationModalReturn.handleOpen({reservation: null})}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            新規予約
          </button>
        </div>
      </div>

      {/* フィルター */}
      <FilterSection onApply={applyFilters} onClear={clearFilters} title="予約検索">
        <C_Stack className={`gap-4`}>
          <R_Stack className={` flex-nowrap`}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">開始日</label>
              <input
                type="date"
                name="startDate"
                value={filterValues.startDate}
                onChange={handleFilterInputChange}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                name="endDate"
                value={filterValues.endDate}
                onChange={handleFilterInputChange}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className={`w-[300px]`}>
              <label className="block text-xs font-medium text-gray-700 mb-1">キーワード検索</label>
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="keyword"
                  placeholder="商品名、担当者、顧客名、会社名"
                  value={filterValues.keyword}
                  onChange={handleFilterInputChange}
                  className="w-full pl-8 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </R_Stack>

          <R_Stack>
            <div className="flex items-center">
              <label className="block text-xs font-medium text-gray-700 mr-2">受け渡し状態:</label>
              <select
                name="deliveryCompleted"
                value={filterValues.deliveryCompleted}
                onChange={handleFilterInputChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="true">完了</option>
                <option value="false">未完了</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="block text-xs font-medium text-gray-700 mr-2">回収状態:</label>
              <select
                name="recoveryCompleted"
                value={filterValues.recoveryCompleted}
                onChange={handleFilterInputChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="true">完了</option>
                <option value="false">未完了</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showCanceled"
                name="showCanceled"
                checked={filterValues.showCanceled}
                onChange={handleFilterInputChange}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showCanceled" className="ml-1 block text-xs text-gray-700">
                取り消し済み予約を表示
              </label>
            </div>
          </R_Stack>
        </C_Stack>
      </FilterSection>

      {/* 予約一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className={cn(
              //
              'w-full text-sm text-left text-gray-500',
              '[&_td]:p-2'
            )}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-3 py-3 min-w-[120px]">納品日時</th>
                <th className="px-3 py-3 min-w-[150px]">顧客情報</th>

                <th className="px-3 py-3 min-w-[200px]">連絡先/配送先</th>
                <th className="px-3 py-3 min-w-[80px]">受取方法</th>
                <th className="px-3 py-3 min-w-[80px]">用途</th>
                <th className="px-3 py-3 min-w-[100px]">支払方法</th>
                <th className="px-3 py-3 min-w-[80px]">注文経路</th>
                <th className="px-3 py-3 min-w-[200px]">商品詳細</th>
                <th className="px-3 py-3 min-w-[140px]">金額詳細</th>
                <th className="px-3 py-3 min-w-[80px]">担当者</th>
                <th className="px-3 py-3 min-w-[80px]">進捗</th>
                <th className="px-3 py-3 min-w-[150px]">備考</th>
                <th className="px-3 py-3 min-w-[120px]">登録・更新</th>
                <th className="px-3 py-3 min-w-[80px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => {
                return (
                  <tr
                    key={reservation.id}
                    className={`border-b ${reservation.isCanceled ? 'bg-gray-400 text-gray-500 opacity-50' : 'hover:bg-gray-50 bg-white'}`}
                  >
                    {/* 納品日時 */}
                    <td>
                      <div className="text-sm">
                        <div className={`font-medium ${reservation.isCanceled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {formatDate(reservation.deliveryDate, 'MM/DD')}
                        </div>
                        <div className="text-gray-500">{formatDate(reservation.deliveryDate, 'HH:mm')}</div>
                      </div>
                    </td>

                    {/* 顧客情報 */}
                    <td>
                      <div className="text-sm">
                        <div className={`font-medium ${reservation.isCanceled ? 'text-gray-500' : 'text-gray-900'}`}>
                          {reservation.customerName}
                          {reservation.isCanceled && ' (取消済)'}
                        </div>
                        {reservation.contactName && <div className="text-gray-500">担当: {reservation.contactName}</div>}
                      </div>
                    </td>

                    {/* 配送先 */}
                    <td>
                      <div className="text-sm text-gray-900">
                        <div>
                          {reservation.postalCode && <div>〒{reservation.postalCode}</div>}
                          <div>
                            {reservation.prefecture}
                            {reservation.city}
                            {reservation.street}
                          </div>
                          {reservation.building && <div className="text-gray-500">{reservation.building}</div>}
                        </div>
                        <div className=" text-gray-700 text-xs">{formatPhoneNumber(reservation.phoneNumber || '')}</div>
                      </div>
                    </td>

                    {/* 受取方法 */}
                    <td>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          reservation.pickupLocation === '配達' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {reservation.pickupLocation}
                      </span>
                    </td>

                    {/* 用途 */}
                    <td>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">{reservation.purpose}</span>
                    </td>

                    {/* 支払方法 */}
                    <td>
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        {reservation.paymentMethod}
                      </span>
                    </td>

                    {/* 注文経路 */}
                    <td>
                      <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">{reservation.orderChannel}</span>
                    </td>

                    {/* 商品詳細 */}
                    <td>
                      <div className="text-sm leading-4">
                        {reservation.items?.map((item, index) => (
                          <div key={index} className="mb-1 flex-nowrap justify-between">
                            <div className="font-medium text-gray-900 ">
                              ・{item.productName} x{item.quantity}
                            </div>
                            <div className="text-gray-500 text-xs ml-4 ">
                              ¥{item.unitPrice?.toLocaleString()} × {item.quantity} = ¥{item.totalPrice?.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* 金額詳細 */}
                    <td>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">合計: ¥{reservation.totalAmount?.toLocaleString()}</div>
                        {(reservation.pointsUsed || 0) > 0 && (
                          <div className="text-red-600">P: -¥{reservation.pointsUsed?.toLocaleString()}</div>
                        )}
                        <div className="font-semibold text-blue-600">支払: ¥{reservation.finalAmount?.toLocaleString()}</div>
                      </div>
                    </td>

                    {/* 担当者 */}
                    <td className="px-3 py-4 text-sm text-gray-900">{reservation.orderStaff}</td>

                    {/* 進捗 */}
                    <td>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          {reservation.deliveryCompleted ? (
                            <CheckSquare size={16} className="text-green-500" />
                          ) : (
                            <Square size={16} className="text-gray-300" />
                          )}
                          <span className="text-xs text-gray-600">配達</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {reservation.recoveryCompleted ? (
                            <CheckSquare size={16} className="text-green-500" />
                          ) : (
                            <Square size={16} className="text-gray-300" />
                          )}
                          <span className="text-xs text-gray-600">回収</span>
                        </div>
                      </div>
                    </td>

                    {/* 備考 */}
                    <td>
                      <div className="text-sm text-gray-600 max-w-xs">
                        {reservation.notes && (
                          <div className="truncate" title={reservation.notes}>
                            {reservation.notes}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 登録・更新 */}
                    <td>
                      <div className="text-xs text-gray-500">
                        <div>登録: {formatDate(reservation.createdAt, 'MM/dd HH:mm')}</div>
                        <div>更新: {formatDate(reservation.updatedAt, 'MM/dd HH:mm')}</div>
                      </div>
                    </td>

                    {/* 操作 */}
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={reservation.isCanceled}
                          onClick={() => EditReservationModalReturn.handleOpen({reservation})}
                          className="p-1 text-blue-600 hover:text-blue-800  rounded h-5"
                          title="編集"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          disabled={reservation.isCanceled}
                          onClick={() => ReservationHistoryModalReturn.handleOpen({reservation})}
                          className="p-1 text-green-600  rounded h-5"
                          title="履歴"
                        >
                          <Clock size={20} />
                        </button>
                        {reservation.isCanceled === true ? (
                          <button
                            onClick={() => RestoreReservationModalReturn.handleOpen({reservation})}
                            className="p-1 text-green-600  rounded h-5"
                            title="復元"
                          >
                            <RefreshCw size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={() => CancelReservationModalReturn.handleOpen({reservation})}
                            className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded h-5"
                            title="取り消し"
                          >
                            <Ban size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {reservations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">条件に一致する予約がありません</p>
          </div>
        )}
      </div>

      {/* 予約フォームモーダル */}
      <EditReservationModalReturn.Modal>
        <ReservationModal
          reservation={EditReservationModalReturn.open?.reservation}
          customers={customers}
          products={products}
          handleSave={handleSave}
          onClose={EditReservationModalReturn.handleClose}
        />
      </EditReservationModalReturn.Modal>

      {/* 予約履歴モーダル */}
      <ReservationHistoryModalReturn.Modal>
        <ReservationHistoryViewer reservationId={ReservationHistoryModalReturn.open?.reservation?.id} />
        {/* <ReservationHistoryModal
            reservation={ReservationHistoryModalReturn.open?.reservation}
          />
            onClose={() => ReservationHistoryModalReturn.handleClose()} */}
      </ReservationHistoryModalReturn.Modal>

      {/* 削除確認モーダル */}
      <DeleteReservationModalReturn.Modal>
        <Padding>
          <ConfirmModal
            title="予約の削除"
            message="この予約を完全に削除します。この操作は元に戻せません。"
            onConfirm={handleDelete}
            onClose={() => DeleteReservationModalReturn.handleClose()}
          />
        </Padding>
      </DeleteReservationModalReturn.Modal>

      {/* 取り消し確認モーダル */}
      <CancelReservationModalReturn.Modal>
        <CancelReservationModal
          reservation={CancelReservationModalReturn.open?.reservation}
          onCancel={() => CancelReservationModalReturn.handleClose()}
          onConfirm={handleCancelReservation}
        />
      </CancelReservationModalReturn.Modal>

      {/* 復元確認モーダル */}
      <RestoreReservationModalReturn.Modal>
        <RestoreReservationModal
          reservation={RestoreReservationModalReturn.open?.reservation}
          onCancel={() => RestoreReservationModalReturn.handleClose()}
          onConfirm={handleRestoreReservation}
        />
      </RestoreReservationModalReturn.Modal>
    </div>
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
  <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
          キャンセル
        </button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          削除
        </button>
      </div>
    </div>
  </div>
)
