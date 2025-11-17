'use server'

import {RFM_SCORE_CRITERIA} from '../(constants)'
import prisma from 'src/lib/prisma'
import {PhoneNumberTemp} from '@app/(excluded)/sbm/components/CustomerPhoneManager'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

export async function getAllTeams(): Promise<Partial<DeliveryTeamType>[]> {
  const teams = await prisma.sbmDeliveryTeam.findMany({
    orderBy: {name: 'asc'},
  })

  return teams.map(t => ({
    id: t.id,
    name: t.name,
    date: t.date,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }))
}

// ダッシュボード統計
export async function getDashboardStats(date: string): Promise<DashboardStatsType> {
  const targetDate = new Date(date)
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const reservations = await prisma.sbmReservation.findMany({
    where: {
      deliveryDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {SbmReservationItem: true},
  })

  const totalSales = reservations.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalCost = reservations.reduce(
    (sum, r) => sum + r.SbmReservationItem.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity * 0.6, 0),
    0
  ) // 原価率60%と仮定
  const profit = totalSales - totalCost
  const orderCount = reservations.length
  const avgOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0

  const salesByPurpose = reservations.reduce(
    (acc, r) => {
      const existing = acc.find(item => item.purpose === r.purpose)
      if (existing) {
        existing.count += 1
        existing.amount += r.totalAmount
      } else {
        acc.push({
          purpose: r.purpose,
          count: 1,
          amount: r.totalAmount,
        })
      }
      return acc
    },
    [] as {purpose: any; count: number; amount: number}[]
  )

  const salesByProduct = reservations.reduce(
    (acc, r) => {
      r.SbmReservationItem.forEach(item => {
        const existing = acc.find(p => p.productName === item.productName)
        if (existing) {
          existing.count += item.quantity
          existing.amount += item.totalPrice
        } else {
          acc.push({
            productName: item.productName,
            count: item.quantity,
            amount: item.totalPrice,
          })
        }
      })
      return acc
    },
    [] as {productName: string; count: number; amount: number}[]
  )

  return {
    totalSales,
    totalCost,
    profit,
    orderCount,
    avgOrderValue,
    salesByPurpose,
    salesByProduct,
  }
}

// RFM分析
export async function getRFMAnalysis() {
  const customers = await prisma.sbmCustomer.findMany({
    include: {
      SbmReservation: {
        orderBy: {deliveryDate: 'desc'},
      },
    },
  })

  const today = new Date()
  const rfmData = customers
    .filter(customer => customer.SbmReservation.length > 0)
    .map(customer => {
      const customerReservations = customer.SbmReservation

      const lastOrderDate = new Date(Math.max(...customerReservations.map(r => r.deliveryDate.getTime())))
      const recency = Math.floor((today.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      const frequency = customerReservations.length
      const monetary = customerReservations.reduce((sum, r) => sum + r.totalAmount, 0)

      // スコア計算
      const rScore =
        recency <= RFM_SCORE_CRITERIA.RECENCY.EXCELLENT
          ? 5
          : recency <= RFM_SCORE_CRITERIA.RECENCY.GOOD
            ? 4
            : recency <= RFM_SCORE_CRITERIA.RECENCY.AVERAGE
              ? 3
              : recency <= RFM_SCORE_CRITERIA.RECENCY.POOR
                ? 2
                : 1

      const fScore =
        frequency >= RFM_SCORE_CRITERIA.FREQUENCY.EXCELLENT
          ? 5
          : frequency >= RFM_SCORE_CRITERIA.FREQUENCY.GOOD
            ? 4
            : frequency >= RFM_SCORE_CRITERIA.FREQUENCY.AVERAGE
              ? 3
              : frequency >= RFM_SCORE_CRITERIA.FREQUENCY.POOR
                ? 2
                : 1

      const mScore =
        monetary >= RFM_SCORE_CRITERIA.MONETARY.EXCELLENT
          ? 5
          : monetary >= RFM_SCORE_CRITERIA.MONETARY.GOOD
            ? 4
            : monetary >= RFM_SCORE_CRITERIA.MONETARY.AVERAGE
              ? 3
              : monetary >= RFM_SCORE_CRITERIA.MONETARY.POOR
                ? 2
                : 1

      const totalScore = rScore + fScore + mScore
      const rank =
        totalScore >= 13 ? 'VIP' : totalScore >= 10 ? '優良' : totalScore >= 7 ? '安定' : totalScore >= 5 ? '一般' : '離反懸念'

      return {
        customerId: customer.id,
        customerName: customer.companyName,
        recency,
        frequency,
        monetary,
        rScore,
        fScore,
        mScore,
        totalScore,
        rank,
        lastOrderDate,
      }
    })

  return rfmData.sort((a, b) => b.rScore + b.fScore + b.mScore - (a.rScore + a.fScore + a.mScore))
}

// 外部API連携
export async function lookupAddressByPostalCode(postalCode: string) {
  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`)
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        success: true,
        data: {
          prefecture: result.address1,
          city: result.address2,
          address: result.address3,
          fullAddress: `${result.address1}${result.address2}${result.address3}`,
        },
      }
    }

    return {success: false, error: '住所が見つかりませんでした'}
  } catch (error) {
    return {success: false, error: '住所検索に失敗しました'}
  }
}

export async function lookupCustomerByPhone(phoneNumber: string): Promise<CustomerType | null> {
  const cleanPhoneNumber = phoneNumber.replace(/-/g, '')

  const customer = await prisma.sbmCustomer.findFirst({
    where: {
      SbmCustomerPhone: {
        some: {
          phoneNumber: {
            contains: cleanPhoneNumber,
          },
        },
      },
    },
  })

  if (!customer) return null

  return {
    id: customer.id,
    companyName: customer.companyName,
    contactName: customer.contactName || '',
    prefecture: customer.prefecture || '',
    city: customer.city || '',
    street: customer.street || '',
    building: customer.building || '',
    postalCode: customer.postalCode || '',
    email: customer.email || '',
    availablePoints: customer.availablePoints,
    notes: customer.notes || '',
    updatedAt: customer.updatedAt,
    phones: [],
  }
}

// 価格履歴管理アクション
export async function createPriceHistory(
  sbmProductId: number,
  SbmProductPriceHistory: Omit<ProductPriceHistoryType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmProductPriceHistory.create({
      data: {
        sbmProductId: sbmProductId,
        price: SbmProductPriceHistory.price || 0,
        cost: SbmProductPriceHistory.cost || 0,
        effectiveDate: getMidnight(SbmProductPriceHistory.effectiveDate || new Date()),
      },
    })

    return {success: true}
  } catch (error) {
    console.error('価格履歴作成エラー:', error)
    return {success: false, error: '価格履歴の作成に失敗しました'}
  }
}

export const updatePriceHistory = async (
  id: number,
  SbmProductPriceHistory: Partial<ProductPriceHistoryType>
): Promise<{success: boolean; error?: string}> => {
  try {
    await prisma.sbmProductPriceHistory.update({
      where: {id},
      data: {
        price: SbmProductPriceHistory.price,
        cost: SbmProductPriceHistory.cost,
        effectiveDate: getMidnight(SbmProductPriceHistory.effectiveDate || new Date()),
      },
    })

    return {success: true}
  } catch (error) {
    console.error('価格履歴更新エラー:', error)
    return {success: false, error: '価格履歴の更新に失敗しました'}
  }
}

export const deletePriceHistory = async (id: number): Promise<{success: boolean; error?: string}> => {
  try {
    await prisma.sbmProductPriceHistory.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('価格履歴削除エラー:', error)
    return {success: false, error: '価格履歴の削除に失敗しました'}
  }
}

export async function getProductPriceHistory(sbmProductId: number): Promise<ProductPriceHistoryType[]> {
  try {
    const histories = await prisma.sbmProductPriceHistory.findMany({
      where: {sbmProductId: sbmProductId},
      orderBy: {effectiveDate: 'desc'},
    })

    return histories.map(h => ({
      id: h.id,
      sbmProductId: h.sbmProductId,
      price: h.price,
      cost: h.cost,
      effectiveDate: h.effectiveDate,
      createdAt: h.createdAt,
    }))
  } catch (error) {
    console.error('価格履歴取得エラー:', error)
    return []
  }
}

// 指定日時点での商品価格を取得（予約入力時用）
export async function getProductPriceAtDate(sbmProductId: number, targetDate: Date): Promise<number | null> {
  try {
    const SbmProductPriceHistory = await prisma.sbmProductPriceHistory.findFirst({
      where: {
        sbmProductId: sbmProductId,
        effectiveDate: {
          lte: targetDate,
        },
      },
      orderBy: {effectiveDate: 'desc'},
    })

    return SbmProductPriceHistory?.price || null
  } catch (error) {
    console.error('価格取得エラー:', error)
    return null
  }
}

// =====================顧客関係=====================

// 顧客管理アクション
export const createCustomer = async (customerData: Omit<CustomerType, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newCustomer = await prisma.sbmCustomer.create({
      data: {
        companyName: customerData.companyName || '',
        contactName: customerData.contactName || null,

        postalCode: customerData.postalCode || null,
        prefecture: customerData.prefecture || null,
        city: customerData.city || null,
        street: customerData.street || null,
        building: customerData.building || null,
        email: customerData.email || null,
        availablePoints: customerData.availablePoints || 0,
        notes: customerData.notes || null,
      },
    })

    return {success: true, data: newCustomer}
  } catch (error) {
    console.error('顧客作成エラー:', error)
    return {success: false, error: '顧客の作成に失敗しました'}
  }
}

export const updateCustomer = async (id: number, customerData: Partial<CustomerType>) => {
  try {
    const updatedCustomer = await prisma.sbmCustomer.update({
      where: {id},
      data: {
        companyName: customerData.companyName,
        contactName: customerData.contactName || null,
        postalCode: customerData.postalCode || null,
        prefecture: customerData.prefecture || null,
        city: customerData.city || null,
        street: customerData.street || null,
        building: customerData.building || null,
        email: customerData.email || null,
        availablePoints: customerData.availablePoints,
        notes: customerData.notes || null,
      },
    })

    return {success: true, data: updatedCustomer}
  } catch (error) {
    console.error('顧客更新エラー:', error)
    return {success: false, error: '顧客の更新に失敗しました'}
  }
}

export const deleteCustomer = async (id: number) => {
  try {
    // 予約がある場合は削除を防ぐ
    const reservationCount = await prisma.sbmReservation.count({
      where: {sbmCustomerId: id},
    })

    if (reservationCount > 0) {
      return {success: false, error: 'この顧客には予約履歴があるため削除できません'}
    }

    await prisma.sbmCustomer.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('顧客削除エラー:', error)
    return {success: false, error: '顧客の削除に失敗しました'}
  }
}

// データ取得アクション
export const getAllCustomers = async (): Promise<CustomerType[]> => {
  const customers = await prisma.sbmCustomer.findMany({
    include: {
      SbmCustomerPhone: true,
    },
    orderBy: {id: 'asc'},
  })

  return customers.map(c => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName || '',
    postalCode: c.postalCode || '',
    prefecture: c.prefecture || '',
    city: c.city || '',
    street: c.street || '',
    building: c.building || '',
    email: c.email || '',
    availablePoints: c.availablePoints,
    notes: c.notes || '',
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,

    phones: c.SbmCustomerPhone.map(phone => ({
      id: phone.id,
      sbmCustomerId: phone.sbmCustomerId,
      label: phone.label,
      phoneNumber: phone.phoneNumber,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    })),
  }))
}

// 電話番号で顧客を検索
// 電話番号による顧客検索（部分一致）
export const searchCustomersByPhone = async (phoneNumber: string) => {
  try {
    if (!phoneNumber || phoneNumber.length < 3) {
      return []
    }

    // 電話番号テーブルからのみ検索（メイン電話番号フィールドは削除済み）
    const mainPhoneCustomers: any[] = []

    // 電話番号テーブルでの検索
    const phoneCustomers = await prisma.sbmCustomer.findMany({
      where: {
        SbmCustomerPhone: {
          some: {
            phoneNumber: {
              contains: phoneNumber,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        SbmCustomerPhone: true,
      },
    })

    // 重複を除去してマージ
    const allCustomers = [...mainPhoneCustomers, ...phoneCustomers]
    const uniqueCustomers = allCustomers.filter((customer, index, self) => index === self.findIndex(c => c.id === customer.id))

    return uniqueCustomers.map(customer => {
      // マッチした電話番号を特定
      const matchedPhones: CustomerPhoneType[] = []

      // メイン電話番号フィールドは削除済み

      // 追加電話番号がマッチした場合
      customer.SbmCustomerPhone.filter(phone => phone.phoneNumber.includes(phoneNumber)).forEach(phone => {
        matchedPhones.push({
          id: phone.id,
          sbmCustomerId: phone.sbmCustomerId,
          label: phone.label,
          phoneNumber: phone.phoneNumber,
          createdAt: phone.createdAt,
          updatedAt: phone.updatedAt,
        })
      })

      return {
        customer: {
          id: customer.id,
          companyName: customer.companyName,
          contactName: customer.contactName || '',
          postalCode: customer.postalCode || '',
          prefecture: customer.prefecture || '',
          city: customer.city || '',
          street: customer.street || '',
          building: customer.building || '',
          email: customer.email || '',
          availablePoints: customer.availablePoints,
          notes: customer.notes || '',

          updatedAt: customer.updatedAt,
          phones: customer.SbmCustomerPhone.map(phone => ({
            id: phone.id,
            sbmCustomerId: phone.sbmCustomerId,
            label: phone.label,
            phoneNumber: phone.phoneNumber,
            createdAt: phone.createdAt,
            updatedAt: phone.updatedAt,
          })),
        },
        matchedPhones,
      }
    })
  } catch (error) {
    console.error('顧客検索エラー:', error)
    return []
  }
}

// 従来の関数は互換性のため残す（deprecated）
export const getCustomerByPhone = async (phoneNumber: string): Promise<CustomerType | null> => {
  const customer = await prisma.sbmCustomer.findFirst({
    where: {
      SbmCustomerPhone: {
        some: {phoneNumber: phoneNumber},
      },
    },
    include: {
      SbmCustomerPhone: true,
    },
  })

  if (!customer) return null

  return {
    id: customer.id,
    companyName: customer.companyName,
    contactName: customer.contactName || '',
    postalCode: customer.postalCode || '',
    prefecture: customer.prefecture || '',
    city: customer.city || '',
    street: customer.street || '',
    building: customer.building || '',
    email: customer.email || '',
    availablePoints: customer.availablePoints,
    notes: customer.notes || '',
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    phones: customer.SbmCustomerPhone.map(phone => ({
      id: phone.id,
      sbmCustomerId: phone.sbmCustomerId,
      label: phone.label,
      phoneNumber: phone.phoneNumber,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    })),
  }
}

// 顧客情報をUPSERT
export const createOrUpdateCustomer = async (
  customerData: Partial<CustomerType>,
  phoneData?: PhoneNumberTemp[]
): Promise<{success: boolean; customer?: CustomerType; error?: string}> => {
  try {
    // トランザクション内で処理
    const result = await prisma.$transaction(async tx => {
      let customer

      // sbmCustomerIdが指定されている場合は更新のみ
      if (customerData.id) {
        customer = await tx.sbmCustomer.update({
          where: {id: customerData.id},
          data: {
            companyName: customerData.companyName || '',
            contactName: customerData.contactName || '',
            postalCode: customerData.postalCode || '',
            prefecture: customerData.prefecture || '',
            city: customerData.city || '',
            street: customerData.street || '',
            building: customerData.building || '',
            email: customerData.email || '',
            availablePoints: customerData.availablePoints || 0,
            notes: customerData.notes || '',
          },
          include: {
            SbmCustomerPhone: true,
          },
        })
      } else {
        // 新規顧客作成
        customer = await tx.sbmCustomer.create({
          data: {
            companyName: customerData.companyName || '',
            contactName: customerData.contactName || '',
            postalCode: customerData.postalCode || '',
            prefecture: customerData.prefecture || '',
            city: customerData.city || '',
            street: customerData.street || '',
            building: customerData.building || '',
            email: customerData.email || '',
            availablePoints: customerData.availablePoints || 0,
            notes: customerData.notes || '',
          },
          include: {
            SbmCustomerPhone: true,
          },
        })
      }

      // 電話番号が指定されている場合、顧客の電話番号を追加
      if (phoneData) {
        await updateCustomerPhoneList(
          customer.id,
          phoneData.map(p => ({label: p.label, phoneNumber: p.phoneNumber}))
        )
      }

      // 最新の顧客情報を取得（電話番号含む）
      const updatedCustomer = await tx.sbmCustomer.findUnique({
        where: {id: customer.id},
        include: {
          SbmCustomerPhone: true,
        },
      })

      return updatedCustomer
    })

    return {
      success: true,
      customer: {
        id: result!.id,
        companyName: result!.companyName,
        contactName: result!.contactName || '',
        postalCode: result!.postalCode || '',
        prefecture: result!.prefecture || '',
        city: result!.city || '',
        street: result!.street || '',
        building: result!.building || '',
        email: result!.email || '',
        availablePoints: result!.availablePoints,
        notes: result!.notes || '',
        updatedAt: result!.updatedAt,
        phones: result!.SbmCustomerPhone.map(phone => ({
          id: phone.id,
          sbmCustomerId: phone.sbmCustomerId,
          label: phone.label,
          phoneNumber: phone.phoneNumber,
          createdAt: phone.createdAt,
          updatedAt: phone.updatedAt,
        })),
      },
    }
  } catch (error) {
    console.error('顧客データの保存エラー:', error)
    return {success: false, error: '顧客データの保存に失敗しました'}
  }
}

// 電話番号管理アクション
export async function createCustomerPhone(
  customerPhoneData: Omit<CustomerPhoneType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.create({
      data: {
        sbmCustomerId: customerPhoneData.sbmCustomerId,
        label: customerPhoneData.label,
        phoneNumber: customerPhoneData.phoneNumber,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号追加エラー:', error)
    return {success: false, error: '電話番号の追加に失敗しました'}
  }
}

export async function updateCustomerPhoneList(
  customerId: number,
  phones: PhoneNumberTemp[]
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.deleteMany({
      where: {sbmCustomerId: customerId},
    })
    await prisma.sbmCustomerPhone.createMany({
      data: phones.map(phone => ({
        sbmCustomerId: customerId,
        label: phone.label,
        phoneNumber: phone.phoneNumber,
      })),
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号更新エラー:', error)
    return {success: false, error: '電話番号の更新に失敗しました'}
  }
}

export async function updateCustomerPhone(
  id: number,
  customerPhoneData: Partial<CustomerPhoneType>
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.update({
      where: {id},
      data: {
        label: customerPhoneData.label,
        phoneNumber: customerPhoneData.phoneNumber,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号更新エラー:', error)
    return {success: false, error: '電話番号の更新に失敗しました'}
  }
}

export async function deleteCustomerPhone(id: number): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号削除エラー:', error)
    return {success: false, error: '電話番号の削除に失敗しました'}
  }
}

// 顧客の電話番号一覧を取得
export async function getCustomerPhones(customerId: number): Promise<CustomerPhoneType[]> {
  try {
    const phones = await prisma.sbmCustomerPhone.findMany({
      where: {sbmCustomerId: customerId},
    })

    return phones.map(phone => ({
      id: phone.id,
      sbmCustomerId: phone.sbmCustomerId,
      label: phone.label,
      phoneNumber: phone.phoneNumber,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    }))
  } catch (error) {
    console.error('電話番号取得エラー:', error)
    return []
  }
}

// 顧客統合アクション
export const mergeCustomers = async (parentId: number, childId: number): Promise<{success: boolean; error?: string}> => {
  if (parentId === childId) {
    return {success: false, error: '同じ顧客を統合することはできません'}
  }

  try {
    // トランザクション内で実行
    await prisma.$transaction(async tx => {
      // 子顧客の存在確認
      const parentCustomer = await tx.sbmCustomer.findUnique({where: {id: parentId}})
      const childCustomer = await tx.sbmCustomer.findUnique({where: {id: childId}})

      if (!parentCustomer) {
        throw new Error('統合先の顧客が見つかりません')
      }
      if (!childCustomer) {
        throw new Error('統合元の顧客が見つかりません')
      }

      // 1. 子顧客の予約データを親顧客に移行
      await tx.sbmReservation.updateMany({
        where: {sbmCustomerId: childId},
        data: {sbmCustomerId: parentId},
      })

      // 2. 子顧客の電話番号データを親顧客に移行（重複を除外）
      // 親顧客の電話番号一覧を取得
      const parentPhones = await tx.sbmCustomerPhone.findMany({
        where: {sbmCustomerId: parentId},
        select: {phoneNumber: true},
      })
      const parentPhoneNumbers = parentPhones.map(p => p.phoneNumber)

      // 子顧客の電話番号一覧を取得
      const childPhones = await tx.sbmCustomerPhone.findMany({
        where: {sbmCustomerId: childId},
      })

      // 重複しない電話番号のみ親顧客に移行
      for (const phone of childPhones) {
        if (!parentPhoneNumbers.includes(phone.phoneNumber)) {
          await tx.sbmCustomerPhone.update({
            where: {id: phone.id},
            data: {sbmCustomerId: parentId},
          })
        }
        // 重複する場合は何もしない（統合しない）
      }

      // 3. 子顧客を削除
      await tx.sbmCustomer.delete({
        where: {id: childId},
      })
    })

    return {success: true}
  } catch (error) {
    console.error('顧客統合エラー:', error)
    return {success: false, error: error instanceof Error ? error.message : '顧客統合に失敗しました'}
  }
}

// =========================商品関係====================

// 商品管理アクション
export const createProduct = async (
  productData: Omit<ProductType, 'id' | 'SbmProductPriceHistory' | 'createdAt' | 'updatedAt'>,

  priceData: {price: number; cost: number}
) => {
  try {
    const newProduct = await prisma.sbmProduct.create({
      data: {
        name: productData.name ?? '',
        description: productData.description || null,

        category: productData.category ?? '',
        isActive: productData.isActive,
        SbmProductPriceHistory: {
          create: {
            price: priceData.price || 0,
            cost: priceData.cost || 0,
            effectiveDate: getMidnight(new Date()).toISOString(),
          },
        },
      },
      include: {SbmProductPriceHistory: true},
    })

    // 価格履歴のproductIdを更新
    await prisma.sbmProductPriceHistory.updateMany({
      where: {sbmProductId: newProduct.id},
      data: {sbmProductId: newProduct.id},
    })

    return {success: true, data: newProduct}
  } catch (error) {
    console.error('商品作成エラー:', error)
    return {success: false, error: '商品の作成に失敗しました'}
  }
}

export const updateProduct = async (id: number, productData: Partial<ProductType>) => {
  try {
    const currentProduct = await prisma.sbmProduct.findUnique({where: {id}})
    if (!currentProduct) {
      return {success: false, error: '商品が見つかりません'}
    }

    const updatedProduct = await prisma.sbmProduct.update({
      where: {id},
      data: {
        name: productData.name,
        description: productData.description || null,

        category: productData.category,
        isActive: productData.isActive,
      },
      include: {SbmProductPriceHistory: true},
    })

    return {success: true, data: updatedProduct}
  } catch (error) {
    console.error('商品更新エラー:', error)
    return {success: false, error: '商品の更新に失敗しました'}
  }
}

export const deleteProduct = async (id: number) => {
  try {
    // 予約アイテムで使用されている場合は削除を防ぐ

    const itemCount = await prisma.sbmReservationItem.count({
      where: {sbmProductId: id},
    })

    if (itemCount > 0) {
      return {success: false, error: 'この商品は予約で使用されているため削除できません'}
    }

    await prisma.sbmProduct.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('商品削除エラー:', error)
    return {success: false, error: '商品の削除に失敗しました'}
  }
}

export const getAllProducts = async () => {
  const products = await prisma.sbmProduct.findMany({
    include: {
      SbmProductPriceHistory: {
        orderBy: {effectiveDate: 'desc'},
      },
    },
    orderBy: {name: 'asc'},
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',

    category: p.category,
    isActive: p.isActive,
    SbmProductPriceHistory: p.SbmProductPriceHistory.map(h => ({
      id: h.id,
      sbmProductId: h.sbmProductId,
      price: h.price,
      cost: h.cost,
      effectiveDate: h.effectiveDate,
    })),

    updatedAt: p.updatedAt,
  }))
}

// 予約登録時用：表示可能な商品のみ取得
export const getVisibleProducts = async () => {
  const products = await prisma.sbmProduct.findMany({
    where: {isActive: true},
    include: {
      SbmProductPriceHistory: {
        orderBy: {effectiveDate: 'desc'},
        take: 5,
      },
    },
    orderBy: {name: 'asc'},
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',

    category: p.category,
    isActive: p.isActive,
    SbmProductPriceHistory: p.SbmProductPriceHistory.map(h => ({
      id: h.id,
      sbmProductId: h.sbmProductId,
      price: h.price,
      cost: h.cost,
      effectiveDate: h.effectiveDate,
    })),

    updatedAt: p.updatedAt,
  }))
}

// =====================予約関係=================
export const getReservations = async where => {
  const reservations = await prisma.sbmReservation.findMany({
    where,
    include: {
      SbmCustomer: {
        include: {
          SbmCustomerPhone: true,
        },
      },
      SbmReservationItem: true,
      SbmReservationChangeHistory: {
        orderBy: {changedAt: 'desc'},
        take: 10,
      },
    },
    orderBy: {deliveryDate: 'desc'},
  })

  return reservations.map(r => ({
    id: r.id,
    sbmCustomerId: r.sbmCustomerId,
    customerName: r.customerName,
    contactName: r.contactName || '',
    postalCode: r.postalCode,
    prefecture: r.prefecture,
    city: r.city,
    street: r.street,
    building: r.building,
    deliveryDate: r.deliveryDate,
    pickupLocation: r.pickupLocation as '配達' | '店舗受取',
    purpose: r.purpose as '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他',
    paymentMethod: r.paymentMethod as '現金' | '銀行振込' | '請求書' | 'クレジットカード',
    orderChannel: r.orderChannel as '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他',
    totalAmount: r.totalAmount,
    pointsUsed: r.pointsUsed,
    finalAmount: r.finalAmount,
    orderStaff: r.orderStaff,
    userId: r.userId,
    notes: r.notes || '',
    deliveryCompleted: r.deliveryCompleted,
    recoveryCompleted: r.recoveryCompleted,
    isCanceled: r.isCanceled,
    canceledAt: r.canceledAt,
    cancelReason: r.cancelReason,

    phones: r.SbmCustomer.SbmCustomerPhone.map(phone => ({
      id: phone.id,
      sbmCustomerId: phone.sbmCustomerId,
      phoneNumber: phone.phoneNumber,
      label: phone.label,
    })),

    items: r.SbmReservationItem.map(item => ({
      id: item.id,
      sbmReservationId: item.sbmReservationId,
      sbmProductId: item.sbmProductId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),

    changeHistory: r.SbmReservationChangeHistory.map(ch => ({
      id: ch.id,
      userId: ch.userId,
      sbmReservationId: ch.sbmReservationId,

      changeType: ch.changeType as 'create' | 'update' | 'delete',
      changedAt: ch.changedAt,
      changedFields: (ch.changedFields as Record<string, any>) || {},
      oldValues: (ch.oldValues as Record<string, any>) || {},
      newValues: (ch.newValues as Record<string, any>) || {},
    })),

    updatedAt: r.updatedAt,
  }))
}

// 予約管理アクション - 統合版 upsertReservation
export async function upsertReservation(reservationData: Partial<ReservationType & {phones: PhoneNumberTemp[]}>) {
  try {
    // IDが存在する場合は更新、存在しない場合は新規作成
    const isUpdate = reservationData.id !== undefined && reservationData.id !== null
    let currentReservation: any = null

    // 更新の場合は現在の予約情報を取得
    if (isUpdate) {
      const foundReservation = await prisma.sbmReservation.findUnique({
        where: {id: reservationData.id},
        include: {
          SbmReservationItem: true,
          SbmReservationChangeHistory: true,
        },
      })

      if (!foundReservation) {
        return {success: false, error: '予約が見つかりません'}
      }

      currentReservation = foundReservation

      // 既存の商品明細を削除
      await prisma.sbmReservationItem.deleteMany({
        where: {sbmReservationId: reservationData.id},
      })
    }

    const newDataCore = {
      sbmCustomerId: reservationData.sbmCustomerId || 0,
      customerName: reservationData.customerName || '',
      contactName: reservationData.contactName || '',
      phoneNumber: reservationData.phoneNumber || '',
      postalCode: reservationData.postalCode || '',
      prefecture: reservationData.prefecture || '',
      city: reservationData.city || '',
      street: reservationData.street || '',
      building: reservationData.building || '',
      deliveryDate: reservationData.deliveryDate || new Date(),
      pickupLocation: reservationData.pickupLocation || '',
      purpose: reservationData.purpose || '',
      paymentMethod: reservationData.paymentMethod || '',
      orderChannel: reservationData.orderChannel || '',
      totalAmount: reservationData.totalAmount || 0,
      pointsUsed: reservationData.pointsUsed || 0,
      finalAmount: reservationData.finalAmount || 0,
      orderStaff: reservationData.orderStaff || '',
      userId: reservationData.userId || 0,
      notes: reservationData.notes || null,
      deliveryCompleted: reservationData.deliveryCompleted || false,
      recoveryCompleted: reservationData.recoveryCompleted || false,
      isCanceled: reservationData.isCanceled || false,
      canceledAt: reservationData.canceledAt || null,
      cancelReason: reservationData.cancelReason || null,
      // 商品明細を作成
    }

    const SbmReservationItem =
      reservationData.items?.map(item => ({
        sbmProductId: item.sbmProductId || 0,
        productName: item.productName || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
      })) || []

    const {newData, oldData} = await (async () => {
      const newData: any = {
        ...(newDataCore as unknown as ReservationType),
        items: SbmReservationItem as ReservationItemType[],
      }

      const oldDataCoreFromDb = await prisma.sbmReservation.findUnique({
        where: {id: reservationData.id ?? 0},
        include: {SbmReservationItem: true},
      })

      const oldData: any = {
        ...(oldDataCoreFromDb as unknown as ReservationType),
        items:
          oldDataCoreFromDb?.SbmReservationItem.map(item => ({
            id: item.id,
            sbmReservationId: item.sbmReservationId,
            sbmProductId: item.sbmProductId || 0,
            productName: item.productName || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            createdAt: item.createdAt,
          })) || [],
      }
      return {newData, oldData}
    })()

    // 共通のデータ構造
    const commonData = {
      ...newDataCore,
      SbmReservationItem: {
        create: SbmReservationItem,
      },
      // 変更履歴を作成
      SbmReservationChangeHistory: {
        create: {
          changeType: isUpdate ? 'update' : 'create',
          oldValues: isUpdate ? oldData : undefined,
          newValues: newData,
        },
      },
    }

    let result

    if (isUpdate) {
      // 更新処理
      result = await prisma.sbmReservation.update({
        where: {id: reservationData.id},
        data: commonData,
        include: {
          SbmReservationItem: true,

          SbmReservationChangeHistory: true,
        },
      })
    } else {
      // 新規作成処理
      // タスクは新規作成時のみ追加
      const createData = {
        ...commonData,
      }

      result = await prisma.sbmReservation.create({
        data: createData,
        include: {
          SbmReservationItem: true,

          SbmReservationChangeHistory: true,
        },
      })
    }

    await updateCustomerPhoneList(result.sbmCustomerId, reservationData.phones || [])

    return {success: true, data: result}
  } catch (error) {
    console.error('予約保存エラー:', error)
    return {success: false, error: '予約の保存に失敗しました'}
  }
}

export async function deleteReservation(id: number) {
  try {
    await prisma.sbmReservation.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('予約削除エラー:', error)
    return {success: false, error: '予約の削除に失敗しました'}
  }
}
