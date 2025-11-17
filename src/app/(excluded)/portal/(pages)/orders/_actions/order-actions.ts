'use server'

import prisma from 'src/lib/prisma'

// 受注を全て取得
export const getAllOrders = async () => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        Product: true,
      },
      orderBy: {orderAt: 'desc'},
    })
    return {success: true, data: orders}
  } catch (error) {
    console.error('受注の取得に失敗しました:', error)
    return {success: false, error: '受注の取得に失敗しました', data: []}
  }
}

// 受注を作成
export const createOrder = async (data: {orderAt: Date; productId: number; quantity: number; amount: number; note?: string}) => {
  try {
    const order = await prisma.order.create({
      data: {
        ...data,
        note: data.note || null,
      },
    })
    return {success: true, data: order}
  } catch (error) {
    console.error('受注の作成に失敗しました:', error)
    return {success: false, error: '受注の作成に失敗しました'}
  }
}

// 受注を更新
export const updateOrder = async (
  id: number,
  data: {
    orderAt: Date
    productId: number
    quantity: number
    amount: number
    note?: string
  }
) => {
  try {
    const order = await prisma.order.update({
      where: {id},
      data: {
        ...data,
        note: data.note || null,
      },
    })
    return {success: true, data: order}
  } catch (error) {
    console.error('受注の更新に失敗しました:', error)
    return {success: false, error: '受注の更新に失敗しました'}
  }
}

// 受注を削除
export const deleteOrder = async (id: number) => {
  try {
    await prisma.order.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('受注の削除に失敗しました:', error)
    return {success: false, error: '受注の削除に失敗しました'}
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
