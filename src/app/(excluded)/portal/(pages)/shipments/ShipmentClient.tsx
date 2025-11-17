'use client'

import React, {useState} from 'react'
import {Shipment, Product} from '@prisma/client'
import {PlusCircle, Edit2, Trash2} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {createShipment, updateShipment, deleteShipment, getAllShipments} from './_actions/shipment-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

type ShipmentWithProduct = Shipment & {Product: Product}

type ShipmentClientProps = {
  initialShipments: ShipmentWithProduct[]
  products: Product[]
}

const ShipmentClient = ({initialShipments, products}: ShipmentClientProps) => {
  const {toggleLoad} = useGlobal()
  const [shipments, setShipments] = useState<ShipmentWithProduct[]>(initialShipments)

  const EditModalReturn = useModal<{shipment?: ShipmentWithProduct}>()

  const [formData, setFormData] = useState({
    shipmentId: '',
    shipmentAt: new Date().toISOString().slice(0, 10),
    productId: 0,
    quantity: 0,
    note: '',
  })

  const loadShipments = async () => {
    const {data} = await getAllShipments()
    if (data) {
      setShipments(data)
    }
  }

  const handleOpenEdit = (shipment?: ShipmentWithProduct) => {
    if (shipment) {
      setFormData({
        shipmentId: shipment.shipmentId,
        shipmentAt: new Date(shipment.shipmentAt).toISOString().slice(0, 10),
        productId: shipment.productId,
        quantity: shipment.quantity,
        note: shipment.note || '',
      })
    } else {
      setFormData({
        shipmentId: '',
        shipmentAt: new Date().toISOString().slice(0, 10),
        productId: 0,
        quantity: 0,
        note: '',
      })
    }
    EditModalReturn.handleOpen({shipment})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const editingShipment = EditModalReturn.open?.shipment

      const data = {
        shipmentId: formData.shipmentId,
        shipmentAt: new Date(formData.shipmentAt),
        productId: formData.productId,
        quantity: formData.quantity,
        note: formData.note,
      }

      const result = editingShipment ? await updateShipment(editingShipment.id, data) : await createShipment(data)

      if (result.success) {
        await loadShipments()
        EditModalReturn.handleClose()
      } else {
        alert(result.error || '保存に失敗しました')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この出荷データを削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteShipment(id)
        if (result.success) {
          await loadShipments()
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
      [name]: name === 'productId' || name === 'quantity' ? Number(value) : value,
    }))
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">出荷データ</h1>
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
                <th className="px-4 py-3">出荷ID</th>
                <th className="px-4 py-3">出荷日</th>
                <th className="px-4 py-3">製品</th>
                <th className="px-4 py-3">カラー</th>
                <th className="px-4 py-3 text-right">数量</th>
                <th className="px-4 py-3">備考</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    出荷データが登録されていません
                  </td>
                </tr>
              ) : (
                shipments.map(shipment => (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{shipment.shipmentId}</td>
                    <td className="px-4 py-3">{formatDate(new Date(shipment.shipmentAt))}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{shipment.Product.name}</td>
                    <td className="px-4 py-3">{shipment.Product.color}</td>
                    <td className="px-4 py-3 text-right">{shipment.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{shipment.note || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(shipment)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.id)}
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
      <EditModalReturn.Modal title={EditModalReturn.open?.shipment ? '出荷編集' : '出荷登録'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出荷ID</label>
            <input
              type="text"
              name="shipmentId"
              value={formData.shipmentId}
              onChange={handleChange}
              required
              placeholder="例: SH20250101-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出荷日</label>
            <input
              type="date"
              name="shipmentAt"
              value={formData.shipmentAt}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              {EditModalReturn.open?.shipment ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </EditModalReturn.Modal>
    </div>
  )
}

export default ShipmentClient
