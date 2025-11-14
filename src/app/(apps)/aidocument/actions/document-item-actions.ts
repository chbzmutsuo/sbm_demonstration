'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/client'

// Create: 書類項目を作成
export const createDocumentItem = async (data: {
  documentId: number
  componentId: string
  x: number
  y: number
  value?: string
}) => {
  try {
    const item = await prisma.aidocumentDocumentItem.create({
      data: {
        documentId: data.documentId,
        componentId: data.componentId,
        x: data.x,
        y: data.y,
        value: data.value,
      },
    })
    return {success: true, result: item, message: '書類項目を作成しました'}
  } catch (error) {
    console.error('書類項目作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類項目の作成に失敗しました',
    }
  }
}

// Read: 書類項目一覧を取得
export const getDocumentItems = async (params?: {
  where?: Prisma.AidocumentDocumentItemWhereInput
  orderBy?: Prisma.AidocumentDocumentItemOrderByWithRelationInput
  take?: number
  skip?: number
}) => {
  try {
    const items = await prisma.aidocumentDocumentItem.findMany({
      where: params?.where,
      orderBy: params?.orderBy || {sortOrder: 'asc'},
      take: params?.take,
      skip: params?.skip,
    })
    return {success: true, result: items, message: '書類項目一覧を取得しました'}
  } catch (error) {
    console.error('書類項目一覧取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類項目一覧の取得に失敗しました',
    }
  }
}

// Read: 書類項目を1件取得
export const getDocumentItemById = async (id: number) => {
  try {
    const item = await prisma.aidocumentDocumentItem.findUnique({
      where: {id},
    })
    if (!item) {
      return {success: false, result: null, message: '書類項目が見つかりません'}
    }
    return {success: true, result: item, message: '書類項目を取得しました'}
  } catch (error) {
    console.error('書類項目取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類項目の取得に失敗しました',
    }
  }
}

// Update: 書類項目を更新
export const updateDocumentItem = async (
  id: number,
  data: {
    componentId?: string
    x?: number
    y?: number
    value?: string
  }
) => {
  try {
    const item = await prisma.aidocumentDocumentItem.update({
      where: {id},
      data: {
        componentId: data.componentId,
        x: data.x,
        y: data.y,
        value: data.value,
      },
    })
    return {success: true, result: item, message: '書類項目を更新しました'}
  } catch (error) {
    console.error('書類項目更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類項目の更新に失敗しました',
    }
  }
}

// Delete: 書類項目を削除
export const deleteDocumentItem = async (id: number) => {
  try {
    await prisma.aidocumentDocumentItem.delete({
      where: {id},
    })
    return {success: true, result: null, message: '書類項目を削除しました'}
  } catch (error) {
    console.error('書類項目削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類項目の削除に失敗しました',
    }
  }
}

// Delete: 書類項目を複数削除
export const deleteDocumentItems = async (ids: number[]) => {
  try {
    await prisma.aidocumentDocumentItem.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    return {success: true, result: null, message: '書類項目を削除しました'}
  } catch (error) {
    console.error('書類項目一括削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類項目の削除に失敗しました',
    }
  }
}

