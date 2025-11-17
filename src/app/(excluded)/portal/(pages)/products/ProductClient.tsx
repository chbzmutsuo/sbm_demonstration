'use client'

import React, {useState} from 'react'
import {Product, RawMaterial, ProductRecipe} from '@prisma/client'
import {PlusCircle, Edit2, Trash2, Plus, X} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {createProduct, updateProduct, deleteProduct, getAllProducts, addRecipe, deleteRecipe} from './_actions/product-actions'

export type ProductWithRecipe = Product & {
  ProductRecipe: (ProductRecipe & {RawMaterial: RawMaterial})[]
}

type ProductClientProps = {
  initialProducts: ProductWithRecipe[]
  rawMaterials: RawMaterial[]
}

const ProductClient = ({initialProducts, rawMaterials}: ProductClientProps) => {
  const {toggleLoad} = useGlobal()
  const [products, setProducts] = useState<ProductWithRecipe[]>(initialProducts)

  const EditModalReturn = useModal<{product?: ProductWithRecipe}>()
  const RecipeModalReturn = useModal<{product: ProductWithRecipe}>()

  const [formData, setFormData] = useState({
    name: '',
    color: '',
    cost: 0,
    productionCapacity: 0,
    allowanceStock: 0,
  })

  const [recipeForm, setRecipeForm] = useState({
    rawMaterialId: 0,
    amount: 0,
  })

  const loadProducts = async () => {
    const {data} = await getAllProducts()
    if (data) {
      setProducts(data)
    }
  }

  const handleOpenEdit = (product?: ProductWithRecipe) => {
    if (product) {
      setFormData({
        name: product.name,
        color: product.color,
        cost: product.cost,
        productionCapacity: product.productionCapacity,
        allowanceStock: product.allowanceStock,
      })
    } else {
      setFormData({
        name: '',
        color: '',
        cost: 0,
        productionCapacity: 0,
        allowanceStock: 0,
      })
    }
    EditModalReturn.handleOpen({product})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await toggleLoad(async () => {
      const editingProduct = EditModalReturn.open?.product

      const result = editingProduct ? await updateProduct(editingProduct.id, formData) : await createProduct(formData)

      if (result.success) {
        await loadProducts()
        EditModalReturn.handleClose()
      } else {
        alert(result.error || '保存に失敗しました')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この製品を削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteProduct(id)
        if (result.success) {
          await loadProducts()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      })
    }
  }

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault()

    const product = RecipeModalReturn.open?.product
    if (!product) return

    await toggleLoad(async () => {
      const result = await addRecipe(product.id, recipeForm.rawMaterialId, recipeForm.amount)

      if (result.success) {
        await loadProducts()
        setRecipeForm({rawMaterialId: 0, amount: 0})
      } else {
        alert(result.error || 'レシピの追加に失敗しました')
      }
    })
  }

  const handleDeleteRecipe = async (recipeId: number) => {
    if (confirm('このレシピを削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteRecipe(recipeId)
        if (result.success) {
          await loadProducts()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'productionCapacity' || name === 'allowanceStock' ? Number(value) : value,
    }))
  }

  const handleRecipeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const {name, value} = e.target
    setRecipeForm(prev => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">製品マスター</h1>
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
                <th className="px-4 py-3">製品名</th>
                <th className="px-4 py-3">カラー</th>

                <th className="px-4 py-3 text-right">生産能力(人/時)</th>
                <th className="px-4 py-3 text-right">余裕在庫</th>
                <th className="px-4 py-3">レシピ</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    製品が登録されていません
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3">{product.color}</td>

                    <td className="px-4 py-3 text-right">{product.productionCapacity} </td>
                    <td className="px-4 py-3 text-right">{product.allowanceStock} 枚</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => RecipeModalReturn.handleOpen({product})}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {product.ProductRecipe.length}件
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
      <EditModalReturn.Modal title={EditModalReturn.open?.product ? '製品編集' : '製品登録'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">製品名</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">カラー</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生産能力（枚/人・時）</label>
            <input
              type="number"
              name="productionCapacity"
              value={formData.productionCapacity}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">余裕在庫（枚）</label>
            <input
              type="number"
              name="allowanceStock"
              value={formData.allowanceStock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              {EditModalReturn.open?.product ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </EditModalReturn.Modal>

      {/* レシピモーダル */}
      <RecipeModalReturn.Modal
        title={`レシピ管理 - ${RecipeModalReturn.open?.product?.name}（${RecipeModalReturn.open?.product?.color}）`}
      >
        {RecipeModalReturn.open?.product && (
          <div className="space-y-4">
            {/* レシピ追加フォーム */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">原材料を追加</h4>
              <form onSubmit={handleAddRecipe} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">原材料</label>
                    <select
                      name="rawMaterialId"
                      value={recipeForm.rawMaterialId}
                      onChange={handleRecipeChange}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>選択してください</option>
                      {rawMaterials.map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">使用量</label>
                    <input
                      type="number"
                      name="amount"
                      value={recipeForm.amount}
                      onChange={handleRecipeChange}
                      required
                      min="0"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  追加
                </button>
              </form>
            </div>

            {/* レシピ一覧 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">登録済み原材料</h4>
              {RecipeModalReturn.open.product.ProductRecipe.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">原材料が登録されていません</p>
              ) : (
                <div className="space-y-2">
                  {RecipeModalReturn.open.product.ProductRecipe.map(recipe => (
                    <div key={recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{recipe.RawMaterial.name}</p>
                        <p className="text-sm text-gray-600">
                          {recipe.amount} {recipe.RawMaterial.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </RecipeModalReturn.Modal>
    </div>
  )
}

export default ProductClient
