'use server'

import prisma from 'src/lib/prisma'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'

import {BillingHandler} from '@app/(apps)/tbm/(class)/TimeHandler'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {getInvoiceManualEdit} from './invoiceManualEdit'
import {DriveScheduleData, getDriveScheduleList} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'

// 単価のバリエーションを計算する関数
function calculatePriceVariations(
  feeInfos: Array<{schedule: DriveScheduleData; driverFee: number; futaiFee: number; tollFee: number}>,
  feeType: 'driverFee' | 'futaiFee' | 'tollFee',
  monthEnd: Date
): PriceVariation[] {
  // 同じ単価が適用される期間をグループ化
  const variations: PriceVariation[] = []
  let currentPrice: number | null = null
  let currentStartDate: Date | null = null
  let currentEndDate: Date | null = null

  for (let i = 0; i < feeInfos.length; i++) {
    const info = feeInfos[i]
    const price = info[feeType]

    if (currentPrice === null) {
      // 最初の料金設定
      currentPrice = price
      currentStartDate = info.schedule.date
      currentEndDate = info.schedule.date
    } else if (currentPrice === price) {
      // 同じ単価が続いている場合、最終日を更新
      currentEndDate = info.schedule.date
    } else {
      // 単価が変わった場合、前の期間を保存して新しい期間を開始
      variations.push({
        price: currentPrice,
        startDate: currentStartDate!,
        endDate: currentEndDate,
      })
      currentPrice = price
      currentStartDate = info.schedule.date
      currentEndDate = info.schedule.date
    }
  }

  // 最後の期間を追加
  if (currentPrice !== null) {
    variations.push({
      price: currentPrice,
      startDate: currentStartDate!,
      endDate: monthEnd, // 最後の期間は月末まで
    })
  }

  return variations
}

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

export type PriceVariation = {
  price: number // 単価
  startDate: Date // この単価が適用される開始日
  endDate: Date | null // この単価が適用される最終日（nullの場合は月末まで）
}

export type CategoryDetail = {
  category: string
  categoryCode: string
  routeName: string
  name: string
  vehicleType?: string // 車種
  routeDirection?: string // 方向（関東~東海など）
  trips: number
  // 運賃
  driverFeeVariations?: PriceVariation[] // 運賃単価のバリエーション
  driverFeeUnitPrice?: number // 運賃単価（単一の場合、後方互換性のため）
  amount: number // 運賃合計
  // 付帯料金
  futaiFeeVariations?: PriceVariation[] // 付帯料金単価のバリエーション
  futaiFeeUnitPrice?: number // 付帯料金単価（単一の場合、後方互換性のため）
  futaiFee: number // 付帯料金合計
  // 通行料
  tollFeeVariations?: PriceVariation[] // 通行料単価のバリエーション（通常は変動しないが、念のため）
  tollFeeUnitPrice?: number // 通行料単価（単一の場合）
  tollFee: number // 通行料合計
  specialAddition?: number
  isManualEdit?: boolean // 手動編集された行かどうか
  isManualAdded?: boolean // 手動追加された行かどうか
  // 後方互換性のため残す
  unitPrice?: number // 運賃単価（非推奨）
}

export const getInvoiceData = async ({
  whereQuery,
  customerId,
}: {
  whereQuery: {gte: Date; lte: Date}

  customerId: number // 必須に変更
}) => {
  // 顧客情報取得（必須）
  const customer = await prisma.tbmCustomer.findFirst({
    where: {id: customerId},
  })

  if (!customer) {
    throw new Error('指定された顧客が見つかりません')
  }

  // 運行スケジュールデータ取得（承認済みのみ）
  const driveScheduleList = await getDriveScheduleList({
    whereQuery: {
      ...whereQuery,
      gte: Days.day.subtract(whereQuery.gte, 1),
    },
    tbmBaseId: undefined,
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
      // 運行日に対して適切な料金設定を取得（startDate <= schedule.date のうち最新のもの）
      const feeOnDate = schedule.TbmRouteGroup.TbmRouteGroupFee.sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime()
      ).find(fee => fee.startDate <= schedule.date)

      // 基本料金（運賃 + 付帯料金）
      const baseFee = (feeOnDate?.driverFee || 0) + (feeOnDate?.futaiFee || 0)
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

        // 運行日でソート
        const sortedSchedules = [...routeSchedules].sort((a, b) => a.date.getTime() - b.date.getTime())

        // 各運行スケジュールに対して適切な料金設定を取得
        type FeeInfo = {
          schedule: DriveScheduleData
          driverFee: number
          futaiFee: number
          tollFee: number
        }

        const feeInfos: FeeInfo[] = sortedSchedules.map(schedule => {
          const feeSorted = schedule.TbmRouteGroup.TbmRouteGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
          const feeOnDate = feeSorted.find(fee => schedule.date.getTime() >= fee.startDate.getTime())

          return {
            schedule,
            driverFee: feeOnDate?.driverFee || 0,
            futaiFee: feeOnDate?.futaiFee || 0,
            tollFee: (schedule.M_postalHighwayFee || 0) + (schedule.O_generalHighwayFee || 0),
          }
        })

        // 運賃・付帯料金・通行料の合計を計算
        const totalDriverFee = feeInfos.reduce((sum, info) => sum + info.driverFee, 0)
        const totalFutaiFee = feeInfos.reduce((sum, info) => sum + info.futaiFee, 0)
        const totalTollFee = feeInfos.reduce((sum, info) => sum + info.tollFee, 0)

        // 運賃単価のバリエーションを計算
        const driverFeeVariations = calculatePriceVariations(feeInfos, 'driverFee', whereQuery.lte)
        // 付帯料金単価のバリエーションを計算
        const futaiFeeVariations = calculatePriceVariations(feeInfos, 'futaiFee', whereQuery.lte)
        // 通行料単価のバリエーションを計算
        const tollFeeVariations = calculatePriceVariations(feeInfos, 'tollFee', whereQuery.lte)

        // 単一の単価がある場合は後方互換性のため設定
        const driverFeeUnitPrice = driverFeeVariations.length === 1 ? driverFeeVariations[0].price : undefined
        const futaiFeeUnitPrice = futaiFeeVariations.length === 1 ? futaiFeeVariations[0].price : undefined
        const tollFeeUnitPrice = tollFeeVariations.length === 1 ? tollFeeVariations[0].price : undefined

        return {
          category,
          categoryCode,
          routeName,
          name: routeSchedules[0]?.TbmRouteGroup.name || '',
          vehicleType: routeSchedules[0]?.TbmRouteGroup.vehicleType || '',
          routeDirection: '', // 方向は後で実装可能
          trips,
          driverFeeVariations: driverFeeVariations.length > 1 ? driverFeeVariations : undefined,
          driverFeeUnitPrice,
          amount: totalDriverFee,
          futaiFeeVariations: futaiFeeVariations.length > 1 ? futaiFeeVariations : undefined,
          futaiFeeUnitPrice,
          futaiFee: totalFutaiFee,
          tollFeeVariations: tollFeeVariations.length > 1 ? tollFeeVariations : undefined,
          tollFeeUnitPrice,
          tollFee: totalTollFee,
          // 後方互換性のため
          unitPrice: driverFeeUnitPrice,
        }
      })
    }
  )

  // 合計金額計算
  let totalAmount = summaryByCategory.reduce((sum, item) => sum + item.totalAmount, 0)
  let taxAmount = Math.floor(totalAmount * 0.1) // 10%消費税
  let grandTotal = totalAmount + taxAmount

  // 手動編集データを取得
  const manualEditData = await getInvoiceManualEdit({
    tbmCustomerId: customerId,
    yearMonth: whereQuery.gte,
  })

  // 手動編集データがある場合は、配車連動データを上書き
  let finalSummaryByCategory = summaryByCategory
  let finalDetailsByCategory = detailsByCategory

  if (manualEditData.summaryByCategory) {
    finalSummaryByCategory = manualEditData.summaryByCategory
    // 手動編集されたサマリーから合計金額を再計算
    const manualTotalAmount = finalSummaryByCategory.reduce((sum, item) => sum + item.totalAmount, 0)
    const manualTaxAmount = Math.floor(manualTotalAmount * 0.1)
    const manualGrandTotal = manualTotalAmount + manualTaxAmount
    totalAmount = manualTotalAmount
    taxAmount = manualTaxAmount
    grandTotal = manualGrandTotal
  }

  if (manualEditData.detailsByCategory) {
    finalDetailsByCategory = manualEditData.detailsByCategory
  }

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
      summaryByCategory: finalSummaryByCategory,
      detailsByCategory: finalDetailsByCategory,
    },
  }

  return invoiceData
}
