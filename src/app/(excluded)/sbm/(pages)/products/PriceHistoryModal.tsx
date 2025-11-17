'use client'

import React, {useState} from 'react'

import {PlusCircle, Edit, Trash2, X} from 'lucide-react'
import {createPriceHistory, updatePriceHistory} from '../../actions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

// 統合された価格履歴モーダル
export const PriceHistoryModal = ({
  loadProducts,
  product,
  onClose,
  onDelete,
}: {
  loadProducts: () => void
  product: ProductType | null
  onClose: () => void
  onDelete: (priceHistoryId: number) => void
}) => {
  if (!product) return null

  // 編集モード管理
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editingPriceHistory, setEditingPriceHistory] = useState<ProductPriceHistoryType | null>(null)

  // フォームデータ
  const [formData, setFormData] = useState<Partial<ProductPriceHistoryType>>({
    price: 0,
    cost: 0,
    effectiveDate: formatDate(getMidnight()),
  })

  // 編集モードを開始
  const startEdit = (SbmProductPriceHistory?: ProductPriceHistoryType) => {
    if (SbmProductPriceHistory) {
      setEditingPriceHistory(SbmProductPriceHistory)
      setFormData({
        price: SbmProductPriceHistory.price || 0,
        cost: SbmProductPriceHistory.cost || 0,
        effectiveDate: formatDate(SbmProductPriceHistory.effectiveDate || getMidnight()),
      })
    } else {
      setEditingPriceHistory(null)
      setFormData({
        price: 0,
        cost: 0,
        effectiveDate: formatDate(getMidnight()),
      })
    }
    setEditMode(true)
  }

  // 編集モードを終了
  const cancelEdit = () => {
    setEditMode(false)
    setEditingPriceHistory(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, type} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'datetime-local' ? new Date(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.price || !formData.cost || !formData.effectiveDate) {
      alert('価格、原価、適用日は必須です')
      return
    }

    if (formData.price < formData.cost) {
      if (!confirm('価格が原価を下回っています。このまま保存しますか？')) {
        return
      }
    }

    // 外部の関数を使用して保存
    if (editingPriceHistory?.id) {
      // 更新

      const result = await updatePriceHistory(editingPriceHistory.id, formData)
      if (result.success) {
        await loadProducts()
        onClose()
      } else {
        alert(result.error || '更新に失敗しました')
        return
      }
    } else if (product?.id) {
      // 新規作成
      const result = await createPriceHistory(
        Number(product.id),
        formData as Omit<ProductPriceHistoryType, 'id' | 'createdAt' | 'updatedAt'>
      )
      if (result.success) {
        await loadProducts()
        onClose()
      } else {
        alert(result.error || '作成に失敗しました')
        return
      }
    }
    setEditMode(false)
    setEditingPriceHistory(null)
  }

  const profitRate = formData.price && formData.cost ? ((formData.price - formData.cost) / formData.price) * 100 : 0

  // 一覧表示モード
  if (!editMode) {
    return (
      <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">価格履歴 - {product.name}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => startEdit()}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <PlusCircle size={16} />
              <span>追加</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">適用日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">販売価格</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原価</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">利益率</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.SbmProductPriceHistory && product.SbmProductPriceHistory.length > 0 ? (
                product.SbmProductPriceHistory.map((history, index) => {
                  const profitRate = ((history.price! - history.cost!) / history.price!) * 100
                  return (
                    <tr key={history.id || index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(history.effectiveDate!)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">¥{history.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">¥{history.cost?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`font-semibold ${profitRate >= 30 ? 'text-green-600' : profitRate >= 20 ? 'text-yellow-600' : 'text-red-600'}`}
                        >
                          {profitRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => startEdit(history)} className="text-blue-600 hover:text-blue-800" title="編集">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => history.id && onDelete(history.id)}
                            className="text-red-600 hover:text-red-800"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    価格履歴がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            閉じる
          </button>
        </div>
      </div>
    )
  }

  // 編集モード
  return (
    <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {editingPriceHistory?.id ? '価格履歴編集' : '価格履歴追加'} - {product?.name}
        </h2>
        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">販売価格（円） *</label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleInputChange}
              required
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原価（円） *</label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ''}
              onChange={handleInputChange}
              required
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">適用日 *</label>
          <input
            type="date"
            name="effectiveDate"
            value={formData.effectiveDate ? formatDate(formData.effectiveDate) : ''}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!!(formData.price && formData.cost) && (
          <div className="bg-gray-50 p-3 rounded-md">
            <span className="text-sm text-gray-600">利益率: </span>
            <span
              className={`font-semibold ${profitRate >= 30 ? 'text-green-600' : profitRate >= 20 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {profitRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-600 ml-2">(利益: ¥{(formData.price - formData.cost).toLocaleString()})</span>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={cancelEdit}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            {editingPriceHistory?.id ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
