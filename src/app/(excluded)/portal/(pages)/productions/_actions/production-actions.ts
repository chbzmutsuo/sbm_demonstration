'use server'

import prisma from 'src/lib/prisma'

// 生産を全て取得
export const getAllProductions = async () => {
  try {
    const productions = await prisma.production.findMany({
      include: {
        Product: true,
      },
      orderBy: {productionAt: 'desc'},
    })
    return {success: true, data: productions}
  } catch (error) {
    console.error('生産の取得に失敗しました:', error)
    return {success: false, error: '生産の取得に失敗しました', data: []}
  }
}

// 生産を作成
export const createProduction = async (data: {
  productionAt: Date
  productId: number
  quantity: number
  type: string
  note?: string
}) => {
  try {
    const production = await prisma.production.create({
      data: {
        ...data,
        note: data.note || null,
      },
    })
    return {success: true, data: production}
  } catch (error) {
    console.error('生産の作成に失敗しました:', error)
    return {success: false, error: '生産の作成に失敗しました'}
  }
}

// 生産を更新
export const updateProduction = async (
  id: number,
  data: {
    productionAt: Date
    productId: number
    quantity: number
    type: string
    note?: string
  }
) => {
  try {
    const production = await prisma.production.update({
      where: {id},
      data: {
        ...data,
        note: data.note || null,
      },
    })
    return {success: true, data: production}
  } catch (error) {
    console.error('生産の更新に失敗しました:', error)
    return {success: false, error: '生産の更新に失敗しました'}
  }
}

// 生産を削除
export const deleteProduction = async (id: number) => {
  try {
    await prisma.production.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('生産の削除に失敗しました:', error)
    return {success: false, error: '生産の削除に失敗しました'}
  }
}

// 製品一覧を取得
export const getAllProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {id: 'asc'},
    })
    return {success: true, data: products}
  } catch (error) {
    console.error('製品の取得に失敗しました:', error)
    return {success: false, error: '製品の取得に失敗しました', data: []}
  }
}
