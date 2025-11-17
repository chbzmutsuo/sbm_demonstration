'use server'

import prisma from 'src/lib/prisma'
import {revalidatePath} from 'next/cache'

// ===================================================================
// CREATE
// ===================================================================

export const createStore = async (data: {name: string}) => {
  try {
    const store = await prisma.counselingStore.create({
      data: {
        name: data.name,
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true, data: store}
  } catch (error) {
    console.error('店舗作成エラー:', error)
    return {success: false, error: '店舗の作成に失敗しました'}
  }
}

// ===================================================================
// READ
// ===================================================================

export const getStores = async () => {
  try {
    const stores = await prisma.counselingStore.findMany({
      orderBy: {sortOrder: 'asc'},
      include: {
        Room: true,
        User: true,
      },
    })
    return stores
  } catch (error) {
    console.error('店舗取得エラー:', error)
    return []
  }
}

export const getStore = async (id: number) => {
  try {
    const store = await prisma.counselingStore.findUnique({
      where: {id},
      include: {
        Room: true,
        User: true,
      },
    })
    return store
  } catch (error) {
    console.error('店舗取得エラー:', error)
    return null
  }
}

// ===================================================================
// UPDATE
// ===================================================================

export const updateStore = async (id: number, data: {name: string}) => {
  try {
    const store = await prisma.counselingStore.update({
      where: {id},
      data: {
        name: data.name,
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true, data: store}
  } catch (error) {
    console.error('店舗更新エラー:', error)
    return {success: false, error: '店舗の更新に失敗しました'}
  }
}

// ===================================================================
// DELETE
// ===================================================================

export const deleteStore = async (id: number) => {
  try {
    await prisma.counselingStore.delete({
      where: {id},
    })
    revalidatePath('/counseling/settings')
    return {success: true}
  } catch (error) {
    console.error('店舗削除エラー:', error)
    return {success: false, error: '店舗の削除に失敗しました'}
  }
}
