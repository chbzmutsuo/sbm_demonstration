'use server'

import {Prisma} from '@prisma/client'

import prisma from 'src/lib/prisma'

// Create: 取引先を作成
export const createClient = async (data: {name: string}) => {
  try {
    const client = await prisma.aidocumentClient.create({
      data: {
        name: data.name,
      },
    })
    return {success: true, result: client, message: '取引先を作成しました'}
  } catch (error) {
    console.error('取引先作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の作成に失敗しました',
    }
  }
}

// Read: 取引先一覧を取得
export const getClients = async (params?: {
  where?: Prisma.AidocumentClientWhereInput
  orderBy?: Prisma.AidocumentClientOrderByWithRelationInput
  take?: number
  skip?: number
}) => {
  try {
    const clients = await prisma.aidocumentClient.findMany({
      where: params?.where,
      orderBy: params?.orderBy || {sortOrder: 'asc'},
      take: params?.take,
      skip: params?.skip,
      include: {
        Site: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })
    return {success: true, result: clients, message: '取引先一覧を取得しました'}
  } catch (error) {
    console.error('取引先一覧取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先一覧の取得に失敗しました',
    }
  }
}

// Read: 取引先を1件取得
export const getClientById = async (id: number) => {
  try {
    const client = await prisma.aidocumentClient.findUnique({
      where: {id},
      include: {
        Site: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })
    if (!client) {
      return {success: false, result: null, message: '取引先が見つかりません'}
    }
    return {success: true, result: client, message: '取引先を取得しました'}
  } catch (error) {
    console.error('取引先取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の取得に失敗しました',
    }
  }
}

// Update: 取引先を更新
export const updateClient = async (id: number, data: {name?: string}) => {
  try {
    const client = await prisma.aidocumentClient.update({
      where: {id},
      data: {
        name: data.name,
      },
    })
    return {success: true, result: client, message: '取引先を更新しました'}
  } catch (error) {
    console.error('取引先更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の更新に失敗しました',
    }
  }
}

// Delete: 取引先を削除
export const deleteClient = async (id: number) => {
  try {
    await prisma.aidocumentClient.delete({
      where: {id},
    })
    return {success: true, result: null, message: '取引先を削除しました'}
  } catch (error) {
    console.error('取引先削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の削除に失敗しました',
    }
  }
}
