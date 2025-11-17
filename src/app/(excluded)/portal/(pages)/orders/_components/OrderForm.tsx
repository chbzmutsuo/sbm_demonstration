'use client'

import React, {useState, useEffect} from 'react'
import {Order} from '@prisma/client'
import {OrderWithProduct} from '@app/(excluded)/portal/(pages)/orders/OrderClient'
import {ProductWithRecipe} from '@app/(excluded)/portal/(pages)/products/ProductClient'

type OrderFormProps = {
  order?: OrderWithProduct
  products: ProductWithRecipe[]
  onSave: (data: Partial<Order>) => void
  onCancel: () => void
}

const OrderForm = ({order, products, onSave, onCancel}: OrderFormProps) => {
  const [formData, setFormData] = useState({
    orderAt: order?.orderAt ? new Date(order.orderAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    productId: order?.productId || 0,
    quantity: order?.quantity || 0,
    note: order?.note || '',
  })

  const [amount, setAmount] = useState(order?.amount || 0)

  useEffect(() => {
    if (order) {
      setFormData({
        orderAt: new Date(order.orderAt).toISOString().slice(0, 10),
        productId: order.productId,
        quantity: order.quantity,
        note: order.note || '',
      })
      setAmount(order.amount)
    }
  }, [order])

  useEffect(() => {
    // 売上金額を自動計算
    const product = products.find(p => p.id === formData.productId)
    if (product) {
      setAmount(product.cost * formData.quantity)
    } else {
      setAmount(0)
    }
  }, [formData.productId, formData.quantity, products])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' || name === 'quantity' ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId) {
      alert('商品を選択してください')
      return
    }
    onSave({
      orderAt: new Date(formData.orderAt),
      productId: formData.productId,
      quantity: formData.quantity,
      amount,
      note: formData.note,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">商品</label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">商品を選択</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.color})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">受注枚数</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">売上金額</label>
          <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">¥{amount.toLocaleString()}</div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="備考（フリーテキスト）"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          キャンセル
        </button>
        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          保存
        </button>
      </div>
    </form>
  )
}

export default OrderForm
