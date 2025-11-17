'use server'

import prisma from 'src/lib/prisma'
import {revalidatePath} from 'next/cache'

// 材料マスターの取得
export const getAllIngredients = async () => {
  try {
    const ingredients = await prisma.sbmIngredient.findMany({
      orderBy: {name: 'asc'},
    })
    return ingredients
  } catch (error) {
    console.error('材料データの取得に失敗しました:', error)
    throw new Error('材料データの取得に失敗しました')
  }
}

// 材料マスターの作成
export const createIngredient = async (data: Partial<IngredientType>) => {
  try {
    const ingredient = await prisma.sbmIngredient.create({
      data: {
        name: data.name!,
        description: data.description || null,
        unit: data.unit!,
      },
    })

    revalidatePath('/sbm/ingredients')
    return {success: true, ingredient}
  } catch (error) {
    console.error('材料の作成に失敗しました:', error)
    return {success: false, error: '材料の作成に失敗しました'}
  }
}

// 材料マスターの更新
export const updateIngredient = async (id: number, data: Partial<IngredientType>) => {
  try {
    const ingredient = await prisma.sbmIngredient.update({
      where: {id},
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
      },
    })

    revalidatePath('/sbm/ingredients')
    return {success: true, ingredient}
  } catch (error) {
    console.error('材料の更新に失敗しました:', error)
    return {success: false, error: '材料の更新に失敗しました'}
  }
}

// 材料マスターの削除
export const deleteIngredient = async (id: number) => {
  try {
    // 関連する商品材料も削除される（CASCADE設定）
    await prisma.sbmIngredient.delete({
      where: {id},
    })

    revalidatePath('/sbm/ingredients')
    return {success: true}
  } catch (error) {
    console.error('材料の削除に失敗しました:', error)
    return {success: false, error: '材料の削除に失敗しました'}
  }
}

// 商品に紐づく材料の取得
export const getProductIngredients = async (productId: number) => {
  try {
    const productIngredients = await prisma.sbmProductIngredient.findMany({
      where: {sbmProductId: productId},
      include: {
        SbmIngredient: true,
      },
      orderBy: {
        SbmIngredient: {name: 'asc'},
      },
    })

    // フロントエンドで使いやすい形式に変換
    return productIngredients.map(pi => ({
      id: pi.id,
      sbmProductId: pi.sbmProductId,
      sbmIngredientId: pi.sbmIngredientId,
      quantity: pi.quantity,
      createdAt: pi.createdAt,
      updatedAt: pi.updatedAt,
      ingredient: pi.SbmIngredient,
    }))
  } catch (error) {
    console.error('商品材料の取得に失敗しました:', error)
    throw new Error('商品材料の取得に失敗しました')
  }
}

// 商品に紐づく材料の保存（一括更新）
export const saveProductIngredients = async (productId: number, ingredients: ProductIngredientType[]) => {
  try {
    // トランザクション開始
    await prisma.$transaction(async tx => {
      // 現在の商品材料を削除
      await tx.sbmProductIngredient.deleteMany({
        where: {sbmProductId: productId},
      })

      // 新しい商品材料を登録
      for (const ingredient of ingredients) {
        await tx.sbmProductIngredient.create({
          data: {
            sbmProductId: productId,
            sbmIngredientId: ingredient.sbmIngredientId,
            quantity: ingredient.quantity,
          },
        })
      }
    })

    revalidatePath('/sbm/products')
    return {success: true}
  } catch (error) {
    console.error('商品材料の保存に失敗しました:', error)
    return {success: false, error: '商品材料の保存に失敗しました'}
  }
}

// 期間内の材料使用量を計算
export const calculateIngredientsUsage = async ({where}) => {
  try {
    // 指定期間内のアクティブな予約を取得
    const reservations = await prisma.sbmReservation.findMany({
      where: {},
      include: {
        SbmReservationItem: {
          include: {
            SbmProduct: {
              include: {
                SbmProductIngredient: {
                  include: {
                    SbmIngredient: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // 材料ごとの使用量を集計
    const ingredientsUsage: {[key: number]: {ingredient: any; totalQuantity: number}} = {}

    for (const reservation of reservations) {
      for (const item of reservation.SbmReservationItem) {
        const product = item.SbmProduct

        if (product && product.SbmProductIngredient) {
          for (const productIngredient of product.SbmProductIngredient) {
            const ingredientId = productIngredient.sbmIngredientId
            const ingredient = productIngredient.SbmIngredient
            const quantity = productIngredient.quantity * item.quantity // 商品ごとの材料量 × 注文数量

            if (!ingredientsUsage[ingredientId]) {
              ingredientsUsage[ingredientId] = {
                ingredient,
                totalQuantity: 0,
              }
            }

            ingredientsUsage[ingredientId].totalQuantity += quantity
          }
        }
      }
    }

    // 結果を配列に変換して返す
    return Object.values(ingredientsUsage).map(({ingredient, totalQuantity}) => ({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      totalQuantity,
    }))
  } catch (error) {
    console.error('材料使用量の計算に失敗しました:', error)
    throw new Error('材料使用量の計算に失敗しました')
  }
}
