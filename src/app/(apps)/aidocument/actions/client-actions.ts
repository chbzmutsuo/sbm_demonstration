'use server'

import {Prisma} from '@prisma/client'

import prisma from 'src/lib/prisma'

const SITE_INCLUDE = {
  SitesAsClient: {
    orderBy: {sortOrder: 'asc' as const},
  },
}

const normalizeClient = (client: {SitesAsClient: any[]} & Record<string, any>) => ({
  ...client,
  Site: client.SitesAsClient,
})

// Create: 取引先を作成
export const createClient = async (data: {name: string}) => {
  try {
    const client = await prisma.aidocumentCompany.create({
      data: {
        name: data.name,
        type: 'client',
      },
      include: SITE_INCLUDE,
    })
    return {success: true, result: normalizeClient(client), message: '取引先を作成しました'}
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
  where?: Prisma.AidocumentCompanyWhereInput
  orderBy?: Prisma.AidocumentCompanyOrderByWithRelationInput
  take?: number
  skip?: number
}) => {
  try {
    const clients = await prisma.aidocumentCompany.findMany({
      where: {
        type: 'client',
        ...params?.where,
      },
      orderBy: params?.orderBy || {sortOrder: 'asc'},
      take: params?.take,
      skip: params?.skip,
      include: SITE_INCLUDE,
    })
    return {
      success: true,
      result: clients.map(normalizeClient),
      message: '取引先一覧を取得しました',
    }
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
    const client = await prisma.aidocumentCompany.findUnique({
      where: {id},
      include: SITE_INCLUDE,
    })
    if (!client || client.type !== 'client') {
      return {success: false, result: null, message: '取引先が見つかりません'}
    }
    return {success: true, result: normalizeClient(client), message: '取引先を取得しました'}
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
    const client = await prisma.aidocumentCompany.update({
      where: {id},
      data: {
        name: data.name,
      },
      include: SITE_INCLUDE,
    })
    return {success: true, result: normalizeClient(client), message: '取引先を更新しました'}
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
    await prisma.aidocumentCompany.delete({
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
