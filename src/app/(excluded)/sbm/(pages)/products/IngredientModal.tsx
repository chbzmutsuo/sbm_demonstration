'use client'

import React, {useState, useEffect} from 'react'

import {Plus, Trash2, Save} from 'lucide-react'
import {Button} from '@cm/shadcn/ui/button'
import {Input} from '@cm/shadcn/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@cm/shadcn/ui/select'
import {getAllIngredients, getProductIngredients, saveProductIngredients} from '../../actions/ingredientActions'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

type IngredientModalProps = {
  productId: number
  onClose: () => void
  onUpdate: () => void
}

export const IngredientModal: React.FC<IngredientModalProps> = ({productId, onClose, onUpdate}) => {
  const [ingredients, setIngredients] = useState<IngredientType[]>([])
  const [productIngredients, setProductIngredients] = useState<ProductIngredientType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [allIngredients, currentProductIngredients] = await Promise.all([
          getAllIngredients(),
          getProductIngredients(productId),
        ])
        setIngredients(allIngredients)
        setProductIngredients(currentProductIngredients)
      } catch (error) {
        console.error('材料データの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [productId])

  const handleAddIngredient = () => {
    setProductIngredients([
      ...productIngredients,
      {
        id: 0, // 新規追加の場合は0
        sbmProductId: productId,
        sbmIngredientId: 0,
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ingredient: null,
      },
    ])
  }

  const handleRemoveIngredient = (index: number) => {
    setProductIngredients(productIngredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index: number, ingredientId: number) => {
    const updatedIngredients = [...productIngredients]
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      sbmIngredientId: ingredientId,
      ingredient: ingredients.find(i => i.id === ingredientId) || null,
    }
    setProductIngredients(updatedIngredients)
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedIngredients = [...productIngredients]
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      quantity,
    }
    setProductIngredients(updatedIngredients)
  }

  const handleSave = async () => {
    try {
      // 材料IDが選択されていない項目を除外
      const validIngredients = productIngredients.filter(pi => pi.sbmIngredientId > 0)

      await saveProductIngredients(productId, validIngredients)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('材料の保存に失敗しました:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">材料管理</h2>

      <div className="space-y-4 mb-6 ">
        {productIngredients.length === 0 ? (
          <p className="text-gray-500 text-center py-4">材料が登録されていません</p>
        ) : (
          productIngredients.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Select
                value={item.sbmIngredientId.toString()}
                onValueChange={value => handleIngredientChange(index, parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="材料を選択" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map(ingredient => (
                    <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                      {ingredient.name} ({ingredient.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={item.quantity}
                onChange={e => handleQuantityChange(index, parseFloat(e.target.value))}
                className="w-24"
              />

              <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(index)} className="text-red-500">
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        )}
      </div>

      <R_Stack>
        <Button variant="outline" onClick={handleAddIngredient}>
          <Plus size={16} className="mr-1" /> 材料を追加
        </Button>

        <R_Stack>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} variant="default">
            <Save size={16} className="mr-1" /> 保存
          </Button>
        </R_Stack>
      </R_Stack>
    </div>
  )
}
