'use server'

import prisma from 'src/lib/prisma'
import {revalidatePath} from 'next/cache'

// ===================================================================
// CREATE
// ===================================================================

export const createRoom = async (data: {name: string; counselingStoreId: number}) => {
  try {
    const room = await prisma.counselingRoom.create({
      data: {
        name: data.name,
        counselingStoreId: data.counselingStoreId,
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true, data: room}
  } catch (error) {
    console.error('部屋作成エラー:', error)
    return {success: false, error: '部屋の作成に失敗しました'}
  }
}

// ===================================================================
// READ
// ===================================================================

export const getRooms = async () => {
  try {
    const rooms = await prisma.counselingRoom.findMany({
      orderBy: {sortOrder: 'asc'},
      include: {
        CounselingStore: true,
      },
    })
    return rooms
  } catch (error) {
    console.error('部屋取得エラー:', error)
    return []
  }
}

export const getRoom = async (id: number) => {
  try {
    const room = await prisma.counselingRoom.findUnique({
      where: {id},
      include: {
        CounselingStore: true,
      },
    })
    return room
  } catch (error) {
    console.error('部屋取得エラー:', error)
    return null
  }
}

// ===================================================================
// UPDATE
// ===================================================================

export const updateRoom = async (id: number, data: {name: string; counselingStoreId: number}) => {
  try {
    const room = await prisma.counselingRoom.update({
      where: {id},
      data: {
        name: data.name,
        counselingStoreId: data.counselingStoreId,
      },
    })
    revalidatePath('/counseling/settings')
    return {success: true, data: room}
  } catch (error) {
    console.error('部屋更新エラー:', error)
    return {success: false, error: '部屋の更新に失敗しました'}
  }
}

// ===================================================================
// DELETE
// ===================================================================

export const deleteRoom = async (id: number) => {
  try {
    await prisma.counselingRoom.delete({
      where: {id},
    })
    revalidatePath('/counseling/settings')
    return {success: true}
  } catch (error) {
    console.error('部屋削除エラー:', error)
    return {success: false, error: '部屋の削除に失敗しました'}
  }
}

