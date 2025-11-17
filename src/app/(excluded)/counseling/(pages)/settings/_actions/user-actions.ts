'use server'

import {revalidatePath} from 'next/cache'
import prisma from 'src/lib/prisma'

// ===================================================================
// CREATE
// ===================================================================

export const createCounselingUser = async (data: {name: string; email: string; role: string; counselingStoreId: number}) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        counselingStoreId: data.counselingStoreId,
        password: '999999', // デフォルトパスワード
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true, data: user}
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    return {success: false, error: 'ユーザーの作成に失敗しました'}
  }
}

// ===================================================================
// READ
// ===================================================================

export const getCounselingUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        counselingStoreId: {not: null},
      },
      orderBy: {sortOrder: 'asc'},
      include: {
        CounselingStore: true,
      },
    })
    return users
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return []
  }
}

export const getCounselingUser = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {id},
      include: {
        CounselingStore: true,
      },
    })
    return user
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return null
  }
}

// ===================================================================
// UPDATE
// ===================================================================

export const updateCounselingUser = async (
  id: number,
  data: {name: string; email: string; role: string; counselingStoreId: number}
) => {
  try {
    const user = await prisma.user.update({
      where: {id},
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        counselingStoreId: data.counselingStoreId,
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true, data: user}
  } catch (error) {
    console.error('ユーザー更新エラー:', error)
    return {success: false, error: 'ユーザーの更新に失敗しました'}
  }
}

// ===================================================================
// DELETE
// ===================================================================

export const deleteCounselingUser = async (id: number) => {
  try {
    await prisma.user.update({
      where: {id},
      data: {
        counselingStoreId: null,
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true}
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return {success: false, error: 'ユーザーの削除に失敗しました'}
  }
}
