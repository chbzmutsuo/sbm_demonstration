'use client'

import React, {useState, useEffect} from 'react'
import {RawMaterial, StockAdjustment} from '@prisma/client'
import {
  getStockAdjustmentsByMaterial,
  createStockAdjustment,
  calculateCurrentStock,
  deleteStockAdjustment,
} from '../_actions/material-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {X, Trash2} from 'lucide-react'

type StockHistoryModalProps = {
  material: RawMaterial
  onClose: () => void
  onUpdate: () => void
}

const StockHistoryModal = ({material, onClose, onUpdate}: StockHistoryModalProps) => {
  const {toggleLoad} = useGlobal()
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [stockInfo, setStockInfo] = useState({currentStock: 0, adjustmentTotal: 0, productionTotal: 0})
  const [formData, setFormData] = useState({
    adjustmentAt: new Date().toISOString().slice(0, 10),
    reason: '入荷',
    quantity: 0,
  })

  useEffect(() => {
    loadData()
  }, [material.id])

  const loadData = async () => {
    const [adjustmentsResult, stockResult] = await Promise.all([
      getStockAdjustmentsByMaterial(material.id),
      calculateCurrentStock(material.id),
    ])

    if (adjustmentsResult.success) {
      setAdjustments(adjustmentsResult.data)
    }

    if (stockResult.success) {
      setStockInfo({
        currentStock: stockResult.currentStock,
        adjustmentTotal: stockResult.adjustmentTotal,
        productionTotal: stockResult.productionTotal,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const result = await createStockAdjustment({
        rawMaterialId: material.id,
        adjustmentAt: new Date(formData.adjustmentAt),
        reason: formData.reason,
        quantity: formData.quantity,
      })

      if (result.success) {
        await loadData()
        onUpdate()
        setFormData({
          adjustmentAt: new Date().toISOString().slice(0, 10),
          reason: '入荷',
          quantity: 0,
        })
      } else {
        alert(result.error || '在庫調整の登録に失敗しました')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この在庫調整を削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteStockAdjustment(id)
        if (result.success) {
          await loadData()
          onUpdate()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">在庫履歴 - {material.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto">
        {/* 現在庫サマリー */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">現在庫</p>
            <p className="text-2xl font-bold text-blue-900">
              {stockInfo.currentStock.toLocaleString()} {material.unit}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">調整合計</p>
            <p className="text-2xl font-bold text-green-900">
              +{stockInfo.adjustmentTotal.toLocaleString()} {material.unit}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">生産使用</p>
            <p className="text-2xl font-bold text-red-900">
              -{stockInfo.productionTotal.toLocaleString()} {material.unit}
            </p>
          </div>
        </div>

        {/* 在庫調整フォーム */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">在庫調整を追加</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">日付</label>
                <input
                  type="date"
                  name="adjustmentAt"
                  value={formData.adjustmentAt}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">理由</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>入荷</option>
                  <option>廃棄</option>
                  <option>サンプル使用</option>
                  <option>棚卸差異</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">変動量</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="正数: 増加, 負数: 減少"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              追加
            </button>
          </form>
        </div>

        {/* 履歴テーブル */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">履歴</h4>
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">日付</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">理由</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">変動量</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                        履歴がありません
                      </td>
                    </tr>
                  ) : (
                    <>
                      {adjustments.map(adj => (
                        <tr key={adj.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{formatDate(new Date(adj.adjustmentAt))}</td>
                          <td className="px-3 py-2">{adj.reason}</td>
                          <td className={`px-3 py-2 font-semibold ${adj.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {adj.quantity > 0 ? `+${adj.quantity.toLocaleString()}` : adj.quantity.toLocaleString()}{' '}
                            {material.unit}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => handleDelete(adj.id)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {stockInfo.productionTotal > 0 && (
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2">生産使用（合計）</td>
                          <td className="px-3 py-2 text-red-600">
                            -{stockInfo.productionTotal.toLocaleString()} {material.unit}
                          </td>
                          <td className="px-3 py-2">-</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockHistoryModal
