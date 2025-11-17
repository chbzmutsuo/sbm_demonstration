'use client'

import React, {useState, useEffect} from 'react'

import {PlusCircle, Edit, Trash2, Package} from 'lucide-react'
import {getAllIngredients, createIngredient, updateIngredient, deleteIngredient} from '../../actions/ingredientActions'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useModal from '@cm/components/utils/modal/useModal'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/shadcn/ui/button'
import {IngredientFormModal} from './IngredientFormModal'

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientType[]>([])
  const [loading, setLoading] = useState(true)

  const EditIngredientModalReturn = useModal()
  const DeleteIngredientModalReturn = useModal()

  useEffect(() => {
    loadIngredients()
  }, [])

  const loadIngredients = async () => {
    setLoading(true)
    try {
      const data = await getAllIngredients()
      setIngredients(data)
    } catch (error) {
      console.error('材料データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (ingredientData: Partial<IngredientType>) => {
    try {
      if (EditIngredientModalReturn?.open?.ingredient) {
        // 更新
        await updateIngredient(EditIngredientModalReturn.open.ingredient.id, ingredientData)
      } else {
        // 新規作成
        await createIngredient(ingredientData)
      }

      await loadIngredients()
      EditIngredientModalReturn.handleClose()
    } catch (error) {
      console.error('材料の保存に失敗しました:', error)
    }
  }

  const handleDelete = async () => {
    if (!DeleteIngredientModalReturn?.open?.ingredient) return

    try {
      await deleteIngredient(DeleteIngredientModalReturn.open.ingredient.id)
      await loadIngredients()
      DeleteIngredientModalReturn.handleClose()
    } catch (error) {
      console.error('材料の削除に失敗しました:', error)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">材料マスタ</h1>
        <Button
          onClick={() => EditIngredientModalReturn.handleOpen({ingredient: null})}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle size={20} className="mr-2" />
          新規材料追加
        </Button>
      </div>

      {/* 材料一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">材料名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingredients.map(ingredient => (
                <tr key={ingredient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{ingredient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{ingredient.unit}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{ingredient.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(ingredient.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => EditIngredientModalReturn.handleOpen({ingredient})}
                        className="text-blue-600 hover:text-blue-800"
                        title="編集"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => DeleteIngredientModalReturn.handleOpen({ingredient})}
                        className="text-red-600 hover:text-red-800"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ingredients.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">材料データがありません</p>
          </div>
        )}
      </div>

      {/* 材料編集モーダル */}
      <EditIngredientModalReturn.Modal>
        <Padding>
          <IngredientFormModal
            ingredient={EditIngredientModalReturn?.open?.ingredient}
            onSave={handleSave}
            onClose={EditIngredientModalReturn.handleClose}
          />
        </Padding>
      </EditIngredientModalReturn.Modal>

      {/* 材料削除確認モーダル */}
      <DeleteIngredientModalReturn.Modal>
        <Padding>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">材料の削除</h3>
            <p className="text-gray-600 mb-6">
              「{DeleteIngredientModalReturn?.open?.ingredient?.name}」を削除してもよろしいですか？
              この材料を使用している商品がある場合、関連付けも削除されます。
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={DeleteIngredientModalReturn.handleClose}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                削除
              </Button>
            </div>
          </div>
        </Padding>
      </DeleteIngredientModalReturn.Modal>
    </div>
  )
}
