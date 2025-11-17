'use client'

import React, {useState} from 'react'
import {RawMaterial} from '@prisma/client'
import {PlusCircle, Edit2, Trash2, History} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  calculateCurrentStock,
  getAllRawMaterials,
} from './_actions/material-actions'
import StockHistoryModal from './_components/StockHistoryModal'

type MaterialClientProps = {
  initialMaterials: RawMaterialWithStock[]
}

export type RawMaterialWithStock = RawMaterial & {
  currentStock?: number
  isAlert?: boolean
}

const MaterialClient = ({initialMaterials}: MaterialClientProps) => {
  const {toggleLoad} = useGlobal()
  const [materials, setMaterials] = useState<RawMaterialWithStock[]>(initialMaterials)

  const EditModalReturn = useModal<{material?: RawMaterial}>()
  const HistoryModalReturn = useModal<{material: RawMaterial}>()

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'g',
    cost: 0,
    safetyStock: 0,
  })

  const loadMaterials = async () => {
    const {data} = await getAllRawMaterials()
    if (data) {
      const materialsWithStock = await Promise.all(
        data.map(async material => {
          const {currentStock} = await calculateCurrentStock(material.id)
          return {
            ...material,
            currentStock,
            isAlert: currentStock < material.safetyStock,
          }
        })
      )
      setMaterials(materialsWithStock)
    }
  }

  const handleOpenEdit = (material?: RawMaterial) => {
    if (material) {
      setFormData({
        name: material.name,
        category: material.category || '',
        unit: material.unit,
        cost: material.cost,
        safetyStock: material.safetyStock,
      })
    } else {
      setFormData({
        name: '',
        category: '',
        unit: 'g',
        cost: 0,
        safetyStock: 0,
      })
    }
    EditModalReturn.handleOpen({material})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const editingMaterial = EditModalReturn.open?.material

      const result = editingMaterial ? await updateRawMaterial(editingMaterial.id, formData) : await createRawMaterial(formData)

      if (result.success) {
        await loadMaterials()
        EditModalReturn.handleClose()
      } else {
        alert(result.error || '保存に失敗しました')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この原材料を削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteRawMaterial(id)
        if (result.success) {
          await loadMaterials()
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
      [name]: name === 'cost' || name === 'safetyStock' ? Number(value) : value,
    }))
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">原材料マスター</h1>
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
                <th className="px-4 py-3">名称</th>
                <th className="px-4 py-3">カテゴリ</th>
                <th className="px-4 py-3">単位</th>

                <th className="px-4 py-3 text-right">現在庫</th>
                <th className="px-4 py-3 text-right">安全在庫</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    原材料が登録されていません
                  </td>
                </tr>
              ) : (
                materials.map(material => (
                  <tr key={material.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{material.name}</td>
                    <td className="px-4 py-3">{material.category}</td>
                    <td className="px-4 py-3">{material.unit}</td>

                    <td className={`px-4 py-3 text-right font-semibold ${material.isAlert ? 'text-red-600' : 'text-gray-900'}`}>
                      {material.currentStock?.toLocaleString()} {material.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {material.safetyStock.toLocaleString()} {material.unit}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => HistoryModalReturn.handleOpen({material})}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="在庫履歴"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(material)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
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
      <EditModalReturn.Modal title={EditModalReturn.open?.material ? '原材料編集' : '原材料登録'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option></option>
              <option>カラーチップ</option>
              <option>ヒーター線</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="個">個</option>
              <option value="本">本</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">安全在庫</label>
            <input
              type="number"
              name="safetyStock"
              value={formData.safetyStock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              {EditModalReturn.open?.material ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </EditModalReturn.Modal>

      {/* 在庫履歴モーダル */}

      <HistoryModalReturn.Modal>
        <StockHistoryModal
          material={HistoryModalReturn.open.material}
          onClose={HistoryModalReturn.handleClose}
          onUpdate={loadMaterials}
        />
      </HistoryModalReturn.Modal>
    </div>
  )
}

export default MaterialClient
