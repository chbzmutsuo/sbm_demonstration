'use server'

import prisma from 'src/lib/prisma'

// 出荷を全て取得
export const getAllShipments = async () => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        Product: true,
      },
      orderBy: {shipmentAt: 'desc'},
    })
    return {success: true, data: shipments}
  } catch (error) {
    console.error('出荷の取得に失敗しました:', error)
    return {success: false, error: '出荷の取得に失敗しました', data: []}
  }
}

// 出荷を作成
export const createShipment = async (data: {
  shipmentId: string
  shipmentAt: Date
  productId: number
  quantity: number
  note?: string
}) => {
  try {
    const shipment = await prisma.shipment.create({
      data: {
        ...data,
        note: data.note || null,
      },
    })
    return {success: true, data: shipment}
  } catch (error) {
    console.error('出荷の作成に失敗しました:', error)
    return {success: false, error: '出荷の作成に失敗しました'}
  }
}

// 出荷を更新
export const updateShipment = async (
  id: number,
  data: {
    shipmentId: string
    shipmentAt: Date
    productId: number
    quantity: number
    note?: string
  }
) => {
  try {
    const shipment = await prisma.shipment.update({
      where: {id},
      data: {
        ...data,
        note: data.note || null,
      },
    })
    return {success: true, data: shipment}
  } catch (error) {
    console.error('出荷の更新に失敗しました:', error)
    return {success: false, error: '出荷の更新に失敗しました'}
  }
}

// 出荷を削除
export const deleteShipment = async (id: number) => {
  try {
    await prisma.shipment.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('出荷の削除に失敗しました:', error)
    return {success: false, error: '出荷の削除に失敗しました'}
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
