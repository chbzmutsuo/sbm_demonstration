'use server'

import prisma from 'src/lib/prisma'

// 製品を全て取得
export const getAllProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductRecipe: {
          include: {
            RawMaterial: true,
          },
        },
      },
      orderBy: {id: 'asc'},
    })
    return {success: true, data: products}
  } catch (error) {
    console.error('製品の取得に失敗しました:', error)
    return {success: false, error: '製品の取得に失敗しました', data: []}
  }
}

// 製品を作成
export const createProduct = async (data: {
  name: string
  color: string
  cost: number
  productionCapacity: number
  allowanceStock: number
}) => {
  try {
    const product = await prisma.product.create({
      data,
    })
    return {success: true, data: product}
  } catch (error) {
    console.error('製品の作成に失敗しました:', error)
    return {success: false, error: '製品の作成に失敗しました'}
  }
}

// 製品を更新
export const updateProduct = async (
  id: number,
  data: {
    name: string
    color: string
    cost: number
    productionCapacity: number
    allowanceStock: number
  }
) => {
  try {
    const product = await prisma.product.update({
      where: {id},
      data,
    })
    return {success: true, data: product}
  } catch (error) {
    console.error('製品の更新に失敗しました:', error)
    return {success: false, error: '製品の更新に失敗しました'}
  }
}

// 製品を削除
export const deleteProduct = async (id: number) => {
  try {
    await prisma.product.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('製品の削除に失敗しました:', error)
    return {success: false, error: '製品の削除に失敗しました'}
  }
}

// レシピを追加
export const addRecipe = async (productId: number, rawMaterialId: number, amount: number) => {
  try {
    const recipe = await prisma.productRecipe.create({
      data: {
        productId,
        rawMaterialId,
        amount,
      },
    })
    return {success: true, data: recipe}
  } catch (error) {
    console.error('レシピの追加に失敗しました:', error)
    return {success: false, error: 'レシピの追加に失敗しました'}
  }
}

// レシピを削除
export const deleteRecipe = async (id: number) => {
  try {
    await prisma.productRecipe.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('レシピの削除に失敗しました:', error)
    return {success: false, error: 'レシピの削除に失敗しました'}
  }
}

// 原材料一覧を取得
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
