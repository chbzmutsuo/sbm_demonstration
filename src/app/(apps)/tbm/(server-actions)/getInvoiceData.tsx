'use server'

import prisma from 'src/lib/prisma'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {DriveScheduleCl, DriveScheduleData} from '@app/(apps)/tbm/(class)/DriveScheduleCl'
import {BillingHandler} from '@app/(apps)/tbm/(class)/TimeHandler'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'

export type InvoiceData = {
  companyInfo: {
    name: string
    address: string
    tel: string
    fax: string
    bankInfo: string
  }
  customerInfo: {
    name: string
    address?: string
  }
  invoiceDetails: {
    yearMonth: Date
    totalAmount: number
    taxAmount: number
    grandTotal: number
    summaryByCategory: CategorySummary[]
    detailsByCategory: CategoryDetail[]
  }
}

export type CategorySummary = {
  category: string
  categoryCode: string
  totalTrips: number
  totalAmount: number
}

export type CategoryDetail = {
  category: string
  categoryCode: string
  routeName: string
  name: string
  trips: number
  unitPrice: number
  amount: number
  tollFee: number
  specialAddition?: number
}

export const getInvoiceData = async ({
  whereQuery,
  tbmBaseId,
  customerId,
}: {
  whereQuery: {gte: Date; lte: Date}
  tbmBaseId: number
  customerId: number // 必須に変更
}) => {
  // 営業所情報取得
  const tbmBase = await prisma.tbmBase.findFirst({
    where: {id: tbmBaseId},
  })

  // 顧客情報取得（必須）
  const customer = await prisma.tbmCustomer.findFirst({
    where: {id: customerId},
  })

  if (!customer) {
    throw new Error('指定された顧客が見つかりません')
  }

  // 運行スケジュールデータ取得（承認済みのみ）
  const driveScheduleList = await DriveScheduleCl.getDriveScheduleList({
    whereQuery: {
      ...whereQuery,
      gte: Days.day.subtract(whereQuery.gte, 1),
    },
    tbmBaseId,
    userId: undefined,
  })

  // 指定された顧客の便のみをフィルタリング
  // 月末日跨ぎ運行の請求月判定も含める
  const filteredSchedules = driveScheduleList.filter(schedule => {
    // 顧客IDの一致チェック
    const matchesCustomer = schedule.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id === customerId
    if (!matchesCustomer) return false

    // 請求月の判定（月末日跨ぎ運行対応）
    const billingMonth = BillingHandler.getBillingMonth(schedule.date, schedule.TbmRouteGroup.departureTime)

    // 指定された月と請求月が一致するかチェック

    const targetMonth = toUtc(new Date(whereQuery.gte.getFullYear(), whereQuery.gte.getMonth() + 1, 1))

    return formatDate(billingMonth, 'YYYYMM') === formatDate(targetMonth, 'YYYYMM')
  })

  if (filteredSchedules.length === 0) {
    throw new Error('指定された顧客の運行データが見つかりません')
  }

  // 便区分ごとにグループ化
  const schedulesByCategory = filteredSchedules.reduce(
    (acc, schedule) => {
      const categoryCode = schedule.TbmRouteGroup.seikyuKbn || '01'
      if (!acc[categoryCode]) {
        acc[categoryCode] = []
      }
      acc[categoryCode].push(schedule)
      return acc
    },
    {} as Record<string, DriveScheduleData[]>
  )

  // 便区分ごとの集計
  const summaryByCategory: CategorySummary[] = Object.entries(schedulesByCategory).map((props: [string, DriveScheduleData[]]) => {
    const [categoryCode, schedules] = props
    const category = TBM_CODE.ROUTE_KBN.byCode(categoryCode)?.label || '不明'
    const totalTrips = schedules.length

    // 各スケジュールの料金計算
    const totalAmount = schedules.reduce((sum, schedule) => {
      const routeGroupConfig = schedule.TbmRouteGroup.TbmMonthlyConfigForRouteGroup[0]
      const routeGroupFee = schedule.TbmRouteGroup.TbmRouteGroupFee[0]

      // 基本料金（運賃）
      const baseFee = routeGroupFee?.driverFee || 0
      // 通行料
      const tollFee = (schedule.M_postalHighwayFee || 0) + (schedule.O_generalHighwayFee || 0)

      return sum + baseFee + tollFee
    }, 0)

    return {
      category,
      categoryCode,
      totalTrips,
      totalAmount,
    }
  })

  // 便区分ごとの詳細明細
  const detailsByCategory: CategoryDetail[] = Object.entries(schedulesByCategory).flatMap(
    (props: [string, DriveScheduleData[]]) => {
      const [categoryCode, schedules] = props
      const category = TBM_CODE.ROUTE_KBN.byCode(categoryCode)?.label || '不明'

      // 路線名ごとにグループ化
      const schedulesByRoute = schedules.reduce(
        (acc, schedule) => {
          const routeName = schedule.TbmRouteGroup.routeName || schedule.TbmRouteGroup.name
          if (!acc[routeName]) {
            acc[routeName] = []
          }
          acc[routeName].push(schedule)
          return acc
        },
        {} as Record<string, DriveScheduleData[]>
      )

      return Object.entries(schedulesByRoute).map((props: [string, DriveScheduleData[]]) => {
        const [routeName, routeSchedules] = props
        const trips = routeSchedules.length

        // 月次設定から基本料金を取得
        const monthlyConfig = routeSchedules[0]?.TbmRouteGroup.TbmMonthlyConfigForRouteGroup[0]
        const routeGroupFee = routeSchedules[0]?.TbmRouteGroup.TbmRouteGroupFee[0]

        // 基本運賃（ドライバー料金または設定値）
        const unitPrice = routeGroupFee?.driverFee || monthlyConfig?.generalFee || 0
        const amount = unitPrice * trips

        // 通行料の合計（郵便高速 + 一般高速）
        const tollFee = routeSchedules.reduce(
          (sum, schedule) => sum + (schedule.M_postalHighwayFee || 0) + (schedule.O_generalHighwayFee || 0),
          0
        )

        return {
          category,
          categoryCode,
          routeName,
          name: routeSchedules[0]?.TbmRouteGroup.name || '',
          trips,
          unitPrice,
          amount,
          tollFee,
        }
      })
    }
  )

  // 合計金額計算
  const totalAmount = summaryByCategory.reduce((sum, item) => sum + item.totalAmount, 0)
  const taxAmount = Math.floor(totalAmount * 0.1) // 10%消費税
  const grandTotal = totalAmount + taxAmount

  const invoiceData: InvoiceData = {
    companyInfo: {
      name: '西日本運送株式会社',
      address: '九州支社 御中',
      tel: '0943-72-2361',
      fax: '0943-72-4160',
      bankInfo: '振込銀行 福岡銀行 田主丸支店\n（普通）９００８３\n登録番号 T2290020049699',
    },
    customerInfo: {
      name: customer.name,
      address: customer.address ?? undefined,
    },
    invoiceDetails: {
      yearMonth: whereQuery.gte,
      totalAmount,
      taxAmount,
      grandTotal,
      summaryByCategory,
      detailsByCategory,
    },
  }

  return invoiceData
}
