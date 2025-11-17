'use server'

import prisma from 'src/lib/prisma'

// 原材料を全て取得
export const getAllRawMaterials = async () => {
  try {
    const materials = await prisma.rawMaterial.findMany({
      orderBy: {id: 'asc'},
    })
    return {success: true, data: materials}
  } catch (error) {
    console.error('原材料の取得に失敗しました:', error)
    return {success: false, error: '原材料の取得に失敗しました', data: []}
  }
}

// 原材料を作成
export const createRawMaterial = async (data: {
  name: string
  category: string
  unit: string
  cost: number
  safetyStock: number
}) => {
  try {
    const material = await prisma.rawMaterial.create({
      data,
    })
    return {success: true, data: material}
  } catch (error) {
    console.error('原材料の作成に失敗しました:', error)
    return {success: false, error: '原材料の作成に失敗しました'}
  }
}

// 原材料を更新
export const updateRawMaterial = async (
  id: number,
  data: {
    name: string
    category: string
    unit: string
    cost: number
    safetyStock: number
  }
) => {
  try {
    const material = await prisma.rawMaterial.update({
      where: {id},
      data,
    })
    return {success: true, data: material}
  } catch (error) {
    console.error('原材料の更新に失敗しました:', error)
    return {success: false, error: '原材料の更新に失敗しました'}
  }
}

// 原材料を削除
export const deleteRawMaterial = async (id: number) => {
  try {
    await prisma.rawMaterial.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('原材料の削除に失敗しました:', error)
    return {success: false, error: '原材料の削除に失敗しました'}
  }
}

// 在庫調整履歴を取得
export const getStockAdjustmentsByMaterial = async (rawMaterialId: number) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      where: {rawMaterialId},
      orderBy: {adjustmentAt: 'desc'},
    })
    return {success: true, data: adjustments}
  } catch (error) {
    console.error('在庫調整履歴の取得に失敗しました:', error)
    return {success: false, error: '在庫調整履歴の取得に失敗しました', data: []}
  }
}

// 在庫調整を作成
export const createStockAdjustment = async (data: {
  rawMaterialId: number
  adjustmentAt: Date
  reason: string
  quantity: number
}) => {
  try {
    const adjustment = await prisma.stockAdjustment.create({
      data,
    })
    return {success: true, data: adjustment}
  } catch (error) {
    console.error('在庫調整の作成に失敗しました:', error)
    return {success: false, error: '在庫調整の作成に失敗しました'}
  }
}

// 在庫調整を削除
export const deleteStockAdjustment = async (id: number) => {
  try {
    await prisma.stockAdjustment.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('在庫調整の削除に失敗しました:', error)
    return {success: false, error: '在庫調整の削除に失敗しました'}
  }
}

// 原材料の現在庫計算
export const calculateCurrentStock = async (rawMaterialId: number) => {
  try {
    // 在庫調整の合計
    const adjustments = await prisma.stockAdjustment.findMany({
      where: {rawMaterialId},
    })
    const adjustmentTotal = adjustments.reduce((sum, adj) => sum + adj.quantity, 0)

    // 生産での使用量（国産製品のみ）
    const productions = await prisma.production.findMany({
      where: {
        type: '国産',
      },
      include: {
        Product: {
          include: {
            ProductRecipe: {
              where: {rawMaterialId},
            },
          },
        },
      },
    })

    let productionTotal = 0
    productions.forEach(prod => {
      const recipe = prod.Product.ProductRecipe.find(r => r.rawMaterialId === rawMaterialId)
      if (recipe) {
        productionTotal += prod.quantity * recipe.amount
      }
    })

    const currentStock = adjustmentTotal - productionTotal

    return {success: true, currentStock, adjustmentTotal, productionTotal}
  } catch (error) {
    console.error('現在庫の計算に失敗しました:', error)
    return {success: false, error: '現在庫の計算に失敗しました', currentStock: 0, adjustmentTotal: 0, productionTotal: 0}
  }
}
