'use client'

import React, {useState} from 'react'
import {Order, Product} from '@prisma/client'
import {PlusCircle, Edit2, Trash2} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {createOrder, updateOrder, deleteOrder, getAllOrders} from './_actions/order-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export type OrderWithProduct = Order & {Product: Product}

type OrderClientProps = {
  initialOrders: OrderWithProduct[]
  products: Product[]
}

const OrderClient = ({initialOrders, products}: OrderClientProps) => {
  const {toggleLoad} = useGlobal()
  const [orders, setOrders] = useState<OrderWithProduct[]>(initialOrders)

  const EditModalReturn = useModal<{order?: OrderWithProduct}>()

  const [formData, setFormData] = useState({
    orderAt: new Date().toISOString().slice(0, 10),
    productId: 0,
    quantity: 0,
    amount: 0,
    note: '',
  })

  const loadOrders = async () => {
    const {data} = await getAllOrders()
    if (data) {
      setOrders(data)
    }
  }

  const handleOpenEdit = (order?: OrderWithProduct) => {
    if (order) {
      setFormData({
        orderAt: new Date(order.orderAt).toISOString().slice(0, 10),
        productId: order.productId,
        quantity: order.quantity,
        amount: order.amount,
        note: order.note || '',
      })
    } else {
      setFormData({
        orderAt: new Date().toISOString().slice(0, 10),
        productId: 0,
        quantity: 0,
        amount: 0,
        note: '',
      })
    }
    EditModalReturn.handleOpen({order})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const editingOrder = EditModalReturn.open?.order

      const data = {
        orderAt: new Date(formData.orderAt),
        productId: formData.productId,
        quantity: formData.quantity,
        amount: formData.amount,
        note: formData.note,
      }

      const result = editingOrder ? await updateOrder(editingOrder.id, data) : await createOrder(data)

      if (result.success) {
        await loadOrders()
        EditModalReturn.handleClose()
      } else {
        alert(result.error || '保存に失敗しました')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この受注を削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteOrder(id)
        if (result.success) {
          await loadOrders()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' || name === 'quantity' || name === 'amount' ? Number(value) : value,
    }))
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = Number(e.target.value)
    const product = products.find(p => p.id === productId)
    setFormData(prev => ({
      ...prev,
      productId,
      amount: product ? product.cost * prev.quantity : prev.amount,
    }))
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number(e.target.value)
    const product = products.find(p => p.id === formData.productId)
    setFormData(prev => ({
      ...prev,
      quantity,
      amount: product ? product.cost * quantity : prev.amount,
    }))
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">受注データ</h1>
        <button
          onClick={() => handleOpenEdit()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          新規登録
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3">受注日</th>
                <th className="px-4 py-3">製品</th>
                <th className="px-4 py-3">カラー</th>
                <th className="px-4 py-3 text-right">数量</th>

                <th className="px-4 py-3">備考</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    受注データが登録されていません
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(new Date(order.orderAt))}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.Product.name}</td>
                    <td className="px-4 py-3">{order.Product.color}</td>
                    <td className="px-4 py-3 text-right">{order.quantity.toLocaleString()}</td>

                    <td className="px-4 py-3 text-gray-600">{order.note || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 編集モーダル */}
      <EditModalReturn.Modal title={EditModalReturn.open?.order ? '受注編集' : '受注登録'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">受注日</label>
            <input
              type="date"
              name="orderAt"
              value={formData.orderAt}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">製品</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleProductChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>選択してください</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}（{product.color}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleQuantityChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              {EditModalReturn.open?.order ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </EditModalReturn.Modal>
    </div>
  )
}

export default OrderClient
