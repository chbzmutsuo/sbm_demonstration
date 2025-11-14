'use server'

import {Prisma} from '@prisma/client'
import prisma from 'src/lib/prisma'
import {getServerSession} from 'next-auth'
import {authOptions} from '@app/api/auth/[...nextauth]/constants/authOptions'

// ログインユーザーの自社データを取得
export const getSelfCompany = async () => {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return {
        success: false,
        result: null,
        message: 'ログインが必要です',
      }
    }

    const user = await prisma.user.findUnique({
      where: {id: userId},
      include: {
        AidocumentCompany: true,
      },
    })

    if (!user?.aidocumentCompanyId) {
      return {
        success: false,
        result: null,
        message: '自社データが設定されていません',
      }
    }

    return {
      success: true,
      result: user.AidocumentCompany,
      message: '自社データを取得しました',
    }
  } catch (error) {
    console.error('自社データ取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '自社データの取得に失敗しました',
    }
  }
}

// 自社データを更新
export const updateSelfCompany = async (data: {
  name?: string
  representativeName?: string
  address?: string
  phone?: string
  constructionLicense?: Array<{type: string; number: string; date: string}>
  socialInsurance?: {
    health: string
    pension: string
    employment: string
    officeName?: string
    officeCode?: string
  }
}) => {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return {
        success: false,
        result: null,
        message: 'ログインが必要です',
      }
    }

    const user = await prisma.user.findUnique({
      where: {id: userId},
    })

    if (!user?.aidocumentCompanyId) {
      return {
        success: false,
        result: null,
        message: '自社データが設定されていません',
      }
    }

    const company = await prisma.aidocumentCompany.update({
      where: {id: user.aidocumentCompanyId},
      data: {
        name: data.name,
        representativeName: data.representativeName,
        address: data.address,
        phone: data.phone,
        constructionLicense: data.constructionLicense as Prisma.JsonArray,
        socialInsurance: data.socialInsurance as Prisma.JsonObject,
      },
    })

    return {
      success: true,
      result: company,
      message: '自社データを更新しました',
    }
  } catch (error) {
    console.error('自社データ更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '自社データの更新に失敗しました',
    }
  }
}

// 取引先（発注者）一覧を取得
export const getClientCompanies = async (params?: {
  where?: Prisma.AidocumentCompanyWhereInput
  orderBy?: Prisma.AidocumentCompanyOrderByWithRelationInput
  take?: number
  skip?: number
}) => {
  try {
    const companies = await prisma.aidocumentCompany.findMany({
      where: {
        ...params?.where,
        type: 'client',
      },
      orderBy: params?.orderBy || {sortOrder: 'asc'},
      take: params?.take,
      skip: params?.skip,
      include: {
        SitesAsClient: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })
    return {success: true, result: companies, message: '取引先一覧を取得しました'}
  } catch (error) {
    console.error('取引先一覧取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先一覧の取得に失敗しました',
    }
  }
}

// 取引先（発注者）を作成
export const createClientCompany = async (data: {
  name: string
  representativeName?: string
  address?: string
  phone?: string
}) => {
  try {
    const company = await prisma.aidocumentCompany.create({
      data: {
        name: data.name,
        type: 'client',
        representativeName: data.representativeName,
        address: data.address,
        phone: data.phone,
      },
    })
    return {success: true, result: company, message: '取引先を作成しました'}
  } catch (error) {
    console.error('取引先作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の作成に失敗しました',
    }
  }
}

// 取引先（発注者）を更新
export const updateClientCompany = async (
  id: number,
  data: {
    name?: string
    representativeName?: string
    address?: string
    phone?: string
  }
) => {
  try {
    const company = await prisma.aidocumentCompany.update({
      where: {id},
      data: {
        name: data.name,
        representativeName: data.representativeName,
        address: data.address,
        phone: data.phone,
      },
    })
    return {success: true, result: company, message: '取引先を更新しました'}
  } catch (error) {
    console.error('取引先更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の更新に失敗しました',
    }
  }
}

// 取引先（発注者）を削除
export const deleteClientCompany = async (id: number) => {
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

// 取引先（発注者）を1件取得
export const getClientCompanyById = async (id: number) => {
  try {
    const company = await prisma.aidocumentCompany.findUnique({
      where: {id},
      include: {
        SitesAsClient: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })
    if (!company) {
      return {success: false, result: null, message: '取引先が見つかりません'}
    }
    return {success: true, result: company, message: '取引先を取得しました'}
  } catch (error) {
    console.error('取引先取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '取引先の取得に失敗しました',
    }
  }
}

