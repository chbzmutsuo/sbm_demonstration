'use client'

import React, {useState} from 'react'

import {Phone, ShoppingCart} from 'lucide-react'
import {handlePhoneNumberInput} from '../../utils/phoneUtils'

import {createOrUpdateCustomer, searchCustomersByPhone, getCustomerPhones, getProductPriceAtDate} from '../../actions'

import {
  ORDER_CHANNEL_OPTIONS,
  PURPOSE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PICKUP_LOCATION_OPTIONS,
  DEFAULT_RESERVATION_STATE,
} from '../../(constants)'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import useModal from '@cm/components/utils/modal/useModal'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import PostalCodeInput from '../../components/PostalCodeInput'
import CustomerUpdateConfirmModal from '../../components/CustomerUpdateConfirmModal'
import CustomerPhoneManager, {PhoneNumberTemp} from '../../components/CustomerPhoneManager'
import CustomerLinkNotification from '../../components/CustomerLinkNotification'
import CustomerSelectionList from '../../components/CustomerSelectionList'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {ProductCl} from '@app/(excluded)/sbm/(pages)/products/ProductCl'

// 電話番号ラベル
const PHONE_LABELS: string[] = ['自宅', '携帯', '職場', 'FAX', 'その他']

// 予約フォームモーダル
export const ReservationModal = ({
  reservation,
  customers,
  products,
  handleSave,
  onClose,
}: {
  reservation: (ReservationType & {phones: PhoneNumberTemp[]}) | null
  customers: CustomerType[]
  products: ProductType[]
  handleSave: (data: Partial<ReservationType>) => void
  onClose: () => void
}) => {
  const {session} = useGlobal()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneLabel, setPhoneLabel] = useState<string>('携帯')
  const phoneLabels = PHONE_LABELS
  const [phoneNumberTempList, setPhoneNumberTempList] = useState<PhoneNumberTemp[]>(reservation?.phones || [])
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerType | null>(null)
  const [matchedCustomers, setMatchedCustomers] = useState<CustomerType[]>([])
  const [isCustomerLinked, setIsCustomerLinked] = useState(false)

  const [formData, setFormData] = useState<any>(() => {
    if (reservation) {
      return {
        ...reservation,
        deliveryDate: formatDate(reservation.deliveryDate),
        deliveryTime: formatDate(reservation.deliveryDate, 'HH:mm'),
        selectedItems: reservation.items || [],
      }
    }
    return {
      ...DEFAULT_RESERVATION_STATE,
      deliveryDate: formatDate(new Date()),
      deliveryTime: '12:00',
      selectedItems: [],
    }
  })

  const CustomerUpdateModalReturn = useModal()
  const CustomerSelectionModalReturn = useModal()
  // 顧客連携処理
  const handleLinkCustomer = async () => {
    if (!matchedCustomer) return

    // 顧客情報を設定
    setFormData((prev: any) => ({
      ...prev,
      sbmCustomerId: matchedCustomer.id,
      customerName: matchedCustomer.companyName,
      contactName: matchedCustomer.contactName,
      postalCode: matchedCustomer.postalCode,
      prefecture: matchedCustomer.prefecture,
      city: matchedCustomer.city,
      street: matchedCustomer.street,
      building: matchedCustomer.building,
    }))

    // 電話番号リストを取得して設定
    if (matchedCustomer.id) {
      const phones = await getCustomerPhones(matchedCustomer.id)
      const phoneList: PhoneNumberTemp[] = phones.map(phone => ({
        id: phone.id,
        phoneNumber: phone.phoneNumber,
        label: phone.label,
      }))
      setPhoneNumberTempList(phoneList)
    }

    setIsCustomerLinked(true)
  }

  // 顧客選択リストを表示
  const handleShowCustomerList = () => {
    CustomerSelectionModalReturn.handleOpen()
  }

  // 顧客リストから選択
  const handleSelectCustomerFromList = async (customer: CustomerType) => {
    setMatchedCustomer(customer)
    CustomerSelectionModalReturn.handleClose()

    // 顧客情報を設定
    setFormData((prev: any) => ({
      ...prev,
      sbmCustomerId: customer.id,
      customerName: customer.companyName,
      contactName: customer.contactName,
      postalCode: customer.postalCode,
      prefecture: customer.prefecture,
      city: customer.city,
      street: customer.street,
      building: customer.building,
    }))

    // 電話番号リストを取得して設定
    if (customer.id) {
      const phones = await getCustomerPhones(customer.id)
      const phoneList: PhoneNumberTemp[] = phones.map(phone => ({
        id: phone.id,
        phoneNumber: phone.phoneNumber,
        label: phone.label,
      }))
      setPhoneNumberTempList(phoneList)
    }

    setIsCustomerLinked(true)
  }

  // 顧客連携キャンセル
  const handleCancelLink = () => {
    setMatchedCustomer(null)
    setMatchedCustomers([])
  }

  // 商品を選択リストに追加
  const addProductToOrder = async (product: ProductType) => {
    const productCl = new ProductCl(product)
    const existingItem = formData.selectedItems.find((item: ReservationItemType) => item.sbmProductId === product.id)

    // 配達日時を取得
    const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime || '12:00'}`)

    // 適用日以降の最新価格を取得
    let effectivePrice = productCl.currentPrice!
    let effectiveCost = productCl.currentCost!

    if (product.id) {
      const priceAtDate = await getProductPriceAtDate(product.id, deliveryDateTime)
      if (priceAtDate !== null) {
        effectivePrice = priceAtDate
        // 原価については価格履歴から取得するか、現在の原価を使用
        // 価格履歴に原価も含まれている場合は、それを使用する
        const SbmProductPriceHistory = product.SbmProductPriceHistory?.find(
          h => h.effectiveDate && new Date(h.effectiveDate) <= deliveryDateTime
        )
        if (SbmProductPriceHistory?.cost) {
          effectiveCost = SbmProductPriceHistory.cost
        }
      }
    }

    if (existingItem) {
      setFormData((prev: any) => ({
        ...prev,
        selectedItems: prev.selectedItems.map((item: ReservationItemType) =>
          item.sbmProductId === product.id
            ? {...item, quantity: (item.quantity || 0) + 1, totalPrice: ((item.quantity || 0) + 1) * effectivePrice}
            : item
        ),
      }))
    } else {
      const newItem = {
        sbmProductId: product.id!,
        productName: product.name!,
        quantity: 1,
        unitPrice: effectivePrice,
        unitCost: effectiveCost,
        totalPrice: effectivePrice,
      }

      setFormData((prev: any) => ({
        ...prev,
        selectedItems: [...prev.selectedItems, newItem],
      }))
    }
    calculateTotals()
  }

  // 商品数量を更新
  const updateItemQuantity = (sbmProductId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(sbmProductId)
      return
    }

    setFormData((prev: any) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((item: ReservationItemType) =>
        item.sbmProductId === sbmProductId ? {...item, quantity, totalPrice: quantity * (item.unitPrice || 0)} : item
      ),
    }))
    calculateTotals()
  }

  // 商品を注文から削除
  const removeItemFromOrder = (sbmProductId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((item: ReservationItemType) => item.sbmProductId !== sbmProductId),
    }))
    calculateTotals()
  }

  // 合計金額を計算
  const calculateTotals = () => {
    setTimeout(() => {
      setFormData((prev: any) => {
        const totalAmount = prev.selectedItems.reduce((sum: number, item: ReservationItemType) => sum + (item.totalPrice || 0), 0)
        const pointsUsed = Math.min(prev.pointsUsed || 0, totalAmount)
        const finalAmount = totalAmount - pointsUsed

        return {
          ...prev,
          totalAmount,
          finalAmount,
        }
      })
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value, type} = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))

    if (name === 'pointsUsed') {
      calculateTotals()
    }

    // 配達日時が変更された場合は、既存商品の価格を再計算
    if (name === 'deliveryDate' || name === 'deliveryTime') {
      recalculateItemPrices()
    }
  }

  // 既存商品の価格を再計算
  const recalculateItemPrices = async () => {
    if (!formData.selectedItems || formData.selectedItems.length === 0) return

    const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime || '12:00'}`)

    const updatedItems = await Promise.all(
      formData.selectedItems.map(async (item: ReservationItemType) => {
        if (!item.sbmProductId) return item

        // 適用日以降の最新価格を取得
        const priceAtDate = await getProductPriceAtDate(item.sbmProductId, deliveryDateTime)

        if (priceAtDate !== null) {
          return {
            ...item,
            unitPrice: priceAtDate,
            totalPrice: (item.quantity || 0) * priceAtDate,
          }
        }

        return item
      })
    )

    setFormData((prev: any) => ({
      ...prev,
      selectedItems: updatedItems,
    }))

    calculateTotals()
  }

  // 電話番号入力時の処理
  const handlePhoneNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbersOnly = handlePhoneNumberInput(e.target.value)
    setPhoneNumber(numbersOnly)

    // 電話番号が8桁以上になったら顧客検索
    if (numbersOnly.length >= 8 && !isCustomerLinked) {
      const results = await searchCustomersByPhone(numbersOnly)
      if (results.length > 1) {
        // 複数の顧客が見つかった場合
        setMatchedCustomers(results as any)
        setMatchedCustomer(null)
      } else if (results.length === 1) {
        // 1件のみ見つかった場合
        setMatchedCustomer(results[0].customer)
        setMatchedCustomers([])
      } else {
        // 見つからなかった場合
        setMatchedCustomer(null)
        setMatchedCustomers([])
      }
    }

    // 電話番号が変わったら顧客連携を解除
    if (isCustomerLinked) {
      setIsCustomerLinked(false)
      setFormData((prev: any) => ({
        ...prev,
        sbmCustomerId: undefined,
      }))
    }

    // フォームデータに電話番号を設定
    setFormData((prev: any) => ({
      ...prev,
      phoneNumber: numbersOnly,
    }))
  }

  // 電話番号追加処理
  const handleAddPhoneNumber = () => {
    if (!phoneNumber) return

    // 既に同じ番号が登録されていないか確認
    const isDuplicate = phoneNumberTempList.some(p => p.phoneNumber === phoneNumber)
    if (isDuplicate) {
      alert('この電話番号は既に登録されています')
      return
    }

    // 新しい電話番号を追加
    const newPhoneItem: PhoneNumberTemp = {
      phoneNumber,
      label: phoneLabel,
      isNew: true,
    }

    setPhoneNumberTempList([...phoneNumberTempList, newPhoneItem])
    setPhoneNumber('') // 入力フィールドをクリア
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.customerName) {
      alert('会社・団体名は必須です')
      return
    }

    if (phoneNumberTempList.length === 0) {
      alert('電話番号は必須です')
      return
    }

    if (!formData.prefecture || !formData.city || !formData.street) {
      alert('都道府県、市区町村、町名番地は必須です')
      return
    }

    if (formData.selectedItems.length === 0) {
      alert('商品を1つ以上選択してください')
      return
    }

    if (phoneNumberTempList.length === 0) {
      alert('電話番号は必須です')
      return
    }

    // 顧客情報更新確認
    if (!reservation) {
      CustomerUpdateModalReturn.handleOpen()
      return
    }

    await saveReservation()
  }

  const saveReservation = async () => {
    try {
      // 顧客情報の処理
      if (CustomerUpdateModalReturn.open || !reservation) {
        // 顧客データ作成
        const customerData: Partial<CustomerType> = {
          id: formData.sbmCustomerId, // sbmCustomerIdがある場合は更新
          companyName: formData.customerName,
          contactName: formData.contactName,
          postalCode: formData.postalCode,
          prefecture: formData.prefecture,
          city: formData.city,
          street: formData.street,
          building: formData.building,
        }

        const result = await createOrUpdateCustomer(customerData, phoneNumberTempList)

        if (result.success && result.customer) {
          // 返却された顧客IDを設定
          formData.sbmCustomerId = result.customer.id
        }
      }

      // 日付と時間を結合
      const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime}`)

      const saveData = {
        ...formData,
        deliveryDate: deliveryDateTime,
        items: formData.selectedItems,
        sbmCustomerId: formData.sbmCustomerId,
        userId: session?.id,
        phones: phoneNumberTempList,
      }

      handleSave(saveData)
      CustomerUpdateModalReturn.handleClose()
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      <div className="mt-2">
        <CustomerLinkNotification
          isLinked={isCustomerLinked}
          matchedCustomer={matchedCustomer}
          matchedCustomers={matchedCustomers}
          onLinkCustomer={handleLinkCustomer}
          onShowCustomerList={handleShowCustomerList}
          onCancelLink={handleCancelLink}
        />
      </div>
      <R_Stack className={` items-stretch  flex-nowrap`}>
        <form onSubmit={handleSubmit} className="space-y-6 w-[900px]">
          {/* 顧客連携状態表示 */}

          {/* 顧客情報 */}
          <fieldset className="p-4 border rounded-lg">
            <legend className="px-2 font-semibold text-gray-900 flex items-center">
              <Phone className="mr-2" size={18} />
              顧客情報
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 *</label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={phoneNumber || ''}
                    onChange={handlePhoneNumberChange}
                    placeholder="09012345678"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={phoneLabel}
                    onChange={e => setPhoneLabel(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {phoneLabels.map(label => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddPhoneNumber}
                    disabled={!phoneNumber}
                    className="px-3 py-2  bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    追加
                  </button>
                </div>

                {/* 電話番号リスト管理 */}
                <div className="mt-3">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">登録済み電話番号</label> */}
                  <CustomerPhoneManager
                    phoneNumbers={phoneNumberTempList}
                    onPhoneNumbersChange={phones => {
                      setPhoneNumberTempList(phones)
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会社・団体名 *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <PostalCodeInput
                  postalCode={formData.postalCode || ''}
                  prefecture={formData.prefecture || ''}
                  city={formData.city || ''}
                  street={formData.street || ''}
                  building={formData.building || ''}
                  onAddressChange={address => {
                    setFormData(prev => ({
                      ...prev,
                      ...address,
                    }))
                  }}
                />
              </div>
            </div>
          </fieldset>

          {/* 予約詳細 */}
          <fieldset className="p-4 border rounded-lg">
            <legend className="px-2 font-semibold text-gray-900">予約詳細</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">納品日 *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">納品時間 *</label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">受取方法</label>
                <select
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PICKUP_LOCATION_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PURPOSE_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支払方法</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAYMENT_METHOD_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注文経路</label>
                <select
                  name="orderChannel"
                  value={formData.orderChannel}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ORDER_CHANNEL_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                <input
                  type="text"
                  name="orderStaff"
                  value={formData.orderStaff}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ポイント使用</label>
                <input
                  type="number"
                  name="pointsUsed"
                  value={formData.pointsUsed || 0}
                  onChange={handleInputChange}
                  min="0"
                  max={formData.totalAmount || 0}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </fieldset>

          {/* 商品選択 */}
          <fieldset className="p-4 border rounded-lg">
            <legend className="px-2 font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="mr-2" size={18} />
              商品選択
            </legend>

            {/* 商品選択 */}
            <div className="mt-4 mb-6">
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => {
                  const selectedProductId = parseInt(e.target.value)
                  if (selectedProductId) {
                    const selectedProduct = products.find(p => p.id === selectedProductId)
                    if (selectedProduct) {
                      addProductToOrder(selectedProduct)
                    }
                    // セレクトボックスを初期値に戻す
                    e.target.value = ''
                  }
                }}
                value=""
              >
                <option value="">-- 商品を選択して追加 --</option>
                {products
                  .filter(p => p.isActive)
                  .map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (¥{new ProductCl(product).currentPrice?.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>

            {/* 選択済み商品 */}
            {formData.selectedItems.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">選択済み商品</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">商品名</th>
                        <th className="px-3 py-2 text-right">単価</th>
                        <th className="px-3 py-2 text-center">数量</th>
                        <th className="px-3 py-2 text-right">小計</th>
                        <th className="px-3 py-2 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.selectedItems.map((item: ReservationItemType, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2">
                            <span className="font-medium">{item.productName}</span>
                          </td>
                          <td className="px-3 py-2 text-right">¥{item.unitPrice?.toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.sbmProductId!, (item.quantity || 0) - 1)}
                                className="w-6 h-6 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={e => updateItemQuantity(item.sbmProductId!, parseInt(e.target.value) || 0)}
                                min="1"
                                className="w-12 text-center border border-gray-300 rounded-md px-1 py-1 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.sbmProductId!, (item.quantity || 0) + 1)}
                                className="w-6 h-6 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">¥{item.totalPrice?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemFromOrder(item.sbmProductId!)}
                              className="text-red-600 hover:text-red-800"
                              title="削除"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </fieldset>

          {/* 金額計算 */}
          <fieldset className="p-4 border rounded-lg bg-gray-50">
            <legend className="px-2 font-semibold text-gray-900">金額計算</legend>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>小計:</span>
                <span className="font-semibold">¥{(formData.totalAmount || 0).toLocaleString()}</span>
              </div>
              {(formData.pointsUsed || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>ポイント使用:</span>
                  <span className="font-semibold">-¥{(formData.pointsUsed || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>合計:</span>
                <span>¥{(formData.finalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </fieldset>

          {/* アクションボタン */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              保存
            </button>
          </div>
        </form>

        <section>過去の注文情報を表示</section>
      </R_Stack>
      {/* 顧客情報更新確認モーダル */}
      <CustomerUpdateModalReturn.Modal>
        <CustomerUpdateConfirmModal onConfirm={saveReservation} onCancel={CustomerUpdateModalReturn.handleClose} />
      </CustomerUpdateModalReturn.Modal>
      {/* 顧客選択リストモーダル */}
      <CustomerSelectionModalReturn.Modal>
        <CustomerSelectionList
          customers={matchedCustomers}
          onSelectCustomer={handleSelectCustomerFromList}
          onCancel={CustomerSelectionModalReturn.handleClose}
        />
      </CustomerSelectionModalReturn.Modal>
    </div>
  )
}
