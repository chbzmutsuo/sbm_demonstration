'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/client'

// Create: 書類を作成
export const createDocument = async (data: {
  siteId: number
  name: string
  pdfTemplateUrl?: string
  items?: Array<{
    componentId: string
    x: number
    y: number
    value?: string
  }>
}) => {
  try {
    const document = await prisma.aidocumentDocument.create({
      data: {
        siteId: data.siteId,
        name: data.name,
        pdfTemplateUrl: data.pdfTemplateUrl,
        items: data.items ? (data.items as Prisma.JsonArray) : undefined,
      },
      include: {
        DocumentItem: true,
      },
    })
    return {success: true, result: document, message: '書類を作成しました'}
  } catch (error) {
    console.error('書類作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類の作成に失敗しました',
    }
  }
}

// Read: 書類一覧を取得
export const getDocuments = async (params?: {
  where?: Prisma.AidocumentDocumentWhereInput
  orderBy?: Prisma.AidocumentDocumentOrderByWithRelationInput
  take?: number
  skip?: number
}) => {
  try {
    const documents = await prisma.aidocumentDocument.findMany({
      where: params?.where,
      orderBy: params?.orderBy || {sortOrder: 'asc'},
      take: params?.take,
      skip: params?.skip,
      include: {
        DocumentItem: {
          orderBy: {sortOrder: 'asc'},
        },
        Site: {
          include: {
            Staff: {
              orderBy: {sortOrder: 'asc'},
            },
            aidocumentVehicles: {
              orderBy: {sortOrder: 'asc'},
            },
            Client: true,
            Company: true,
          },
        },
      },
    })
    return {success: true, result: documents, message: '書類一覧を取得しました'}
  } catch (error) {
    console.error('書類一覧取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類一覧の取得に失敗しました',
    }
  }
}

// Read: 書類を1件取得
export const getDocumentById = async (id: number) => {
  try {
    const document = await prisma.aidocumentDocument.findUnique({
      where: {id},
      include: {
        DocumentItem: {
          orderBy: {sortOrder: 'asc'},
        },
        Site: {
          include: {
            Staff: {
              orderBy: {sortOrder: 'asc'},
            },
            aidocumentVehicles: {
              orderBy: {sortOrder: 'asc'},
            },
            Client: true,
            Company: true,
          },
        },
      },
    })
    if (!document) {
      return {success: false, result: null, message: '書類が見つかりません'}
    }
    return {success: true, result: document, message: '書類を取得しました'}
  } catch (error) {
    console.error('書類取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類の取得に失敗しました',
    }
  }
}

// Update: 書類を更新
export const updateDocument = async (
  id: number,
  data: {
    name?: string
    pdfTemplateUrl?: string
    items?: Array<{
      componentId: string
      x: number
      y: number
      value?: string
    }>
  }
) => {
  try {
    const document = await prisma.aidocumentDocument.update({
      where: {id},
      data: {
        name: data.name,
        pdfTemplateUrl: data.pdfTemplateUrl,
        items: data.items ? (data.items as Prisma.JsonArray) : undefined,
      },
      include: {
        DocumentItem: {
          orderBy: {sortOrder: 'asc'},
        },
        Site: {
          include: {
            Staff: {
              orderBy: {sortOrder: 'asc'},
            },
            aidocumentVehicles: {
              orderBy: {sortOrder: 'asc'},
            },
            Client: true,
            Company: true,
          },
        },
      },
    })
    return {success: true, result: document, message: '書類を更新しました'}
  } catch (error) {
    console.error('書類更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類の更新に失敗しました',
    }
  }
}

// Delete: 書類を削除
export const deleteDocument = async (id: number) => {
  try {
    await prisma.aidocumentDocument.delete({
      where: {id},
    })
    return {success: true, result: null, message: '書類を削除しました'}
  } catch (error) {
    console.error('書類削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '書類の削除に失敗しました',
    }
  }
}
