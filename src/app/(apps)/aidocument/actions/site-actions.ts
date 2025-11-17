'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/client'
import {getServerSession} from 'next-auth'
import {authOptions} from '@app/api/auth/[...nextauth]/constants/authOptions'

// ログインユーザーの自社IDを取得
const getSelfCompanyId = async (): Promise<number | null> => {
  const session = (await getServerSession(authOptions)) as any
  const userId = session?.user?.id
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {aidocumentCompanyId: true},
  })
  return user?.aidocumentCompanyId || null
}

// Create: 現場を作成
export const createSite = async (data: {
  clientId: number
  name: string
  address?: string
  amount?: number
  startDate?: Date
  endDate?: Date
}) => {
  try {
    const companyId = await getSelfCompanyId()
    if (!companyId) {
      return {
        success: false,
        result: null,
        message: '自社データが設定されていません',
      }
    }

    const site = await prisma.aidocumentSite.create({
      data: {
        clientId: data.clientId,
        companyId,
        name: data.name,
        address: data.address,
        amount: data.amount,
        startDate: data.startDate,
        endDate: data.endDate,
      },
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
    })
    return {success: true, result: site, message: '現場を作成しました'}
  } catch (error) {
    console.error('現場作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '現場の作成に失敗しました',
    }
  }
}

// Read: 現場一覧を取得
export const getSites = async (params?: {
  where?: Prisma.AidocumentSiteWhereInput
  orderBy?: Prisma.AidocumentSiteOrderByWithRelationInput
  take?: number
  skip?: number
}) => {
  try {
    const sites = await prisma.aidocumentSite.findMany({
      where: params?.where,
      orderBy: params?.orderBy || {sortOrder: 'asc'},
      take: params?.take,
      skip: params?.skip,
      include: {
        Staff: {
          orderBy: {sortOrder: 'asc'},
        },
        aidocumentVehicles: {
          orderBy: {sortOrder: 'asc'},
        },
        Subcontractors: {
          orderBy: {sortOrder: 'asc'},
        },
        Document: {
          orderBy: {sortOrder: 'asc'},
        },
        Client: true,
        Company: true,
      },
    })
    return {success: true, result: sites, message: '現場一覧を取得しました'}
  } catch (error) {
    console.error('現場一覧取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '現場一覧の取得に失敗しました',
    }
  }
}

// Read: 現場を1件取得
export const getSiteById = async (id: number) => {
  try {
    const site = await prisma.aidocumentSite.findUnique({
      where: {id},
      include: {
        Staff: {
          orderBy: {sortOrder: 'asc'},
        },
        aidocumentVehicles: {
          orderBy: {sortOrder: 'asc'},
        },
        Subcontractors: {
          orderBy: {sortOrder: 'asc'},
          include: {
            Company: true,
          },
        },
        Document: {
          orderBy: {sortOrder: 'asc'},
        },
        Client: true,
        Company: true,
      },
    })
    if (!site) {
      return {success: false, result: null, message: '現場が見つかりません'}
    }
    return {success: true, result: site, message: '現場を取得しました'}
  } catch (error) {
    console.error('現場取得エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '現場の取得に失敗しました',
    }
  }
}

// Update: 現場を更新
export const updateSite = async (
  id: number,
  data: {
    name?: string
    address?: string
    amount?: number
    startDate?: Date
    endDate?: Date
    contractDate?: Date
    costBreakdown?: Prisma.JsonObject
    siteAgent?: Prisma.JsonObject
    chiefEngineer?: Prisma.JsonObject
    safetyManager?: string
    safetyPromoter?: string
  }
) => {
  try {
    const site = await prisma.aidocumentSite.update({
      where: {id},
      data: {
        name: data.name,
        address: data.address,
        amount: data.amount,
        startDate: data.startDate,
        endDate: data.endDate,
        contractDate: data.contractDate,
        costBreakdown: data.costBreakdown,
        siteAgent: data.siteAgent,
        chiefEngineer: data.chiefEngineer,
        safetyManager: data.safetyManager,
        safetyPromoter: data.safetyPromoter,
      },
      include: {
        Staff: {
          orderBy: {sortOrder: 'asc'},
        },
        aidocumentVehicles: {
          orderBy: {sortOrder: 'asc'},
        },
        Subcontractors: {
          orderBy: {sortOrder: 'asc'},
        },
        Client: true,
        Company: true,
      },
    })
    return {success: true, result: site, message: '現場を更新しました'}
  } catch (error) {
    console.error('現場更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '現場の更新に失敗しました',
    }
  }
}

// Delete: 現場を削除
export const deleteSite = async (id: number) => {
  try {
    await prisma.aidocumentSite.delete({
      where: {id},
    })
    return {success: true, result: null, message: '現場を削除しました'}
  } catch (error) {
    console.error('現場削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '現場の削除に失敗しました',
    }
  }
}

// Create: スタッフを作成
export const createStaff = async (data: {siteId: number; name: string; age?: number; gender?: string; term?: string}) => {
  try {
    const staff = await prisma.aidocumentStaff.create({
      data: {
        siteId: data.siteId,
        name: data.name,
        age: data.age,
        gender: data.gender,
        term: data.term,
      },
    })
    return {success: true, result: staff, message: 'スタッフを作成しました'}
  } catch (error) {
    console.error('スタッフ作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : 'スタッフの作成に失敗しました',
    }
  }
}

// Update: スタッフを更新
export const updateStaff = async (
  id: number,
  data: {
    name?: string
    age?: number
    gender?: string
    term?: string
  }
) => {
  try {
    const staff = await prisma.aidocumentStaff.update({
      where: {id},
      data: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        term: data.term,
      },
    })
    return {success: true, result: staff, message: 'スタッフを更新しました'}
  } catch (error) {
    console.error('スタッフ更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : 'スタッフの更新に失敗しました',
    }
  }
}

// Delete: スタッフを削除
export const deleteStaff = async (id: number) => {
  try {
    await prisma.aidocumentStaff.delete({
      where: {id},
    })
    return {success: true, result: null, message: 'スタッフを削除しました'}
  } catch (error) {
    console.error('スタッフ削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : 'スタッフの削除に失敗しました',
    }
  }
}

// Create: 車両を作成
export const createVehicle = async (data: {siteId: number; plate: string; term?: string}) => {
  try {
    const vehicle = await prisma.aidocumentVehicle.create({
      data: {
        siteId: data.siteId,
        plate: data.plate,
        term: data.term,
      },
    })
    return {success: true, result: vehicle, message: '車両を作成しました'}
  } catch (error) {
    console.error('車両作成エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '車両の作成に失敗しました',
    }
  }
}

// Update: 車両を更新
export const updateVehicle = async (id: number, data: {plate?: string; term?: string}) => {
  try {
    const vehicle = await prisma.aidocumentVehicle.update({
      where: {id},
      data: {
        plate: data.plate,
        term: data.term,
      },
    })
    return {success: true, result: vehicle, message: '車両を更新しました'}
  } catch (error) {
    console.error('車両更新エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '車両の更新に失敗しました',
    }
  }
}

// Delete: 車両を削除
export const deleteVehicle = async (id: number) => {
  try {
    await prisma.aidocumentVehicle.delete({
      where: {id},
    })
    return {success: true, result: null, message: '車両を削除しました'}
  } catch (error) {
    console.error('車両削除エラー:', error)
    return {
      success: false,
      result: null,
      message: error instanceof Error ? error.message : '車両の削除に失敗しました',
    }
  }
}
