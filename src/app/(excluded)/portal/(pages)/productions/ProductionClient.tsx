'use client'

import React, {useState} from 'react'
import {Production, Product} from '@prisma/client'
import {PlusCircle, Edit2, Trash2} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {createProduction, updateProduction, deleteProduction, getAllProductions} from './_actions/production-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

type ProductionWithProduct = Production & {Product: Product}

type ProductionClientProps = {
  initialProductions: ProductionWithProduct[]
  products: Product[]
}

const ProductionClient = ({initialProductions, products}: ProductionClientProps) => {
  const {toggleLoad} = useGlobal()
  const [productions, setProductions] = useState<ProductionWithProduct[]>(initialProductions)

  const EditModalReturn = useModal<{production?: ProductionWithProduct}>()

  const [formData, setFormData] = useState({
    productionAt: new Date().toISOString().slice(0, 10),
    productId: 0,
    quantity: 0,
    type: '国産',
    note: '',
  })

  const loadProductions = async () => {
    const {data} = await getAllProductions()
    if (data) {
      setProductions(data)
    }
  }

  const handleOpenEdit = (production?: ProductionWithProduct) => {
    if (production) {
      setFormData({
        productionAt: new Date(production.productionAt).toISOString().slice(0, 10),
        productId: production.productId,
        quantity: production.quantity,
        type: production.type,
        note: production.note || '',
      })
    } else {
      setFormData({
        productionAt: new Date().toISOString().slice(0, 10),
        productId: 0,
        quantity: 0,
        type: '国産',
        note: '',
      })
    }
    EditModalReturn.handleOpen({production})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const editingProduction = EditModalReturn.open?.production

      const data = {
        productionAt: new Date(formData.productionAt),
        productId: formData.productId,
        quantity: formData.quantity,
        type: formData.type,
        note: formData.note,
      }

      const result = editingProduction ? await updateProduction(editingProduction.id, data) : await createProduction(data)

      if (result.success) {
        await loadProductions()
        EditModalReturn.handleClose()
      } else {
        alert(result.error || '保存に失敗しました')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この生産データを削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteProduction(id)
        if (result.success) {
          await loadProductions()
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
        <h1 className="text-2xl font-bold text-gray-900">生産データ</h1>
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
                <th className="px-4 py-3">生産日</th>
                <th className="px-4 py-3">製品</th>
                <th className="px-4 py-3">カラー</th>
                <th className="px-4 py-3 text-right">数量</th>
                <th className="px-4 py-3">区分</th>
                <th className="px-4 py-3">備考</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {productions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    生産データが登録されていません
                  </td>
                </tr>
              ) : (
                productions.map(production => (
                  <tr key={production.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(new Date(production.productionAt))}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{production.Product.name}</td>
                    <td className="px-4 py-3">{production.Product.color}</td>
                    <td className="px-4 py-3 text-right">{production.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          production.type === '国産' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {production.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{production.note || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(production)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(production.id)}
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
      <EditModalReturn.Modal title={EditModalReturn.open?.production ? '生産編集' : '生産登録'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生産日</label>
            <input
              type="date"
              name="productionAt"
              value={formData.productionAt}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">生産区分</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option>国産</option>
              <option>中国産</option>
            </select>
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
              {EditModalReturn.open?.production ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </EditModalReturn.Modal>
    </div>
  )
}

export default ProductionClient
