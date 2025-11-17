'use server'

const baseStaffCount = 3

import {DailyPlan} from '@app/(excluded)/portal/(pages)/DashboardClient'
import prisma from 'src/lib/prisma'

// ============================================================================
// 型定義
// ============================================================================

type DayInfo = {
  day: number
  date: Date
  dateString: string
  dayOfWeek: number
  isHoliday: boolean
  isPast: boolean
  isToday: boolean
}

type ProductCumulative = {
  cumulativeProduction: number
  remainingTarget: number
}

// ============================================================================
// ヘルパー関数（純粋関数 - DBアクセスなし）
// ============================================================================

// 過去データから月間目標を計算
function calculateMonthlyTargetFromData(
  productId: number,
  year: number,
  month: number,
  allOrders: any[],
  allowanceStock: number
): number {
  // 過去3年間の同月データをフィルタ
  const relevantOrders = allOrders.filter(order => {
    const orderDate = new Date(order.orderAt)
    const orderYear = orderDate.getFullYear()
    const orderMonth = orderDate.getMonth() + 1
    return order.productId === productId && orderMonth === month && orderYear >= year - 3 && orderYear < year
  })

  // 年度ごとにグループ化
  const yearlyOrders: Record<number, number> = {}
  relevantOrders.forEach(order => {
    const orderYear = new Date(order.orderAt).getFullYear()
    if (!yearlyOrders[orderYear]) yearlyOrders[orderYear] = 0
    yearlyOrders[orderYear] += order.quantity
  })

  // 平均を計算
  const years = Object.keys(yearlyOrders)
  const totalQuantity = Object.values(yearlyOrders).reduce((sum, qty) => sum + qty, 0)
  const average = years.length > 0 ? totalQuantity / years.length : 0

  return average + allowanceStock
}

// 過去データから月初在庫を計算
function calculateMonthStartStockFromData(
  productId: number,
  monthStart: Date,
  allProductions: any[],
  allShipments: any[]
): number {
  const totalProduction = allProductions
    .filter(p => p.productId === productId && new Date(p.productionAt) < monthStart)
    .reduce((sum, p) => sum + p.quantity, 0)

  const totalShipment = allShipments
    .filter(s => s.productId === productId && new Date(s.shipmentAt) < monthStart)
    .reduce((sum, s) => sum + s.quantity, 0)

  return totalProduction - totalShipment
}

// 日付情報リストを生成
function generateDayInfoList(year: number, month: number, today: Date, holidayDates: number[]): DayInfo[] {
  const currentDate = today.getDate()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const isCurrentMonth = year === currentYear && month === currentMonth
  const daysInMonth = new Date(year, month, 0).getDate()

  return Array.from({length: daysInMonth}, (_, i) => {
    const day = i + 1
    const date = new Date(year, month - 1, day)
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayOfWeek = date.getDay()
    const isHoliday = holidayDates.includes(day)
    const isPast = isCurrentMonth && day < currentDate
    const isToday = isCurrentMonth && day === currentDate

    return {day, date, dateString, dayOfWeek, isHoliday, isPast, isToday}
  })
}

// 製品の日別計画を計算
function calculateDailyPlan(
  product: any,
  productData: ProductData,
  dayInfo: DayInfo,
  dayListInMonth: DayInfo[],
  currentDate: number,
  cumulative: ProductCumulative,
  staffAssignments: any[],
  dailyProductionMap: Map<string, number>
): DailyPlan {
  const {day, date, isHoliday, isPast} = dayInfo
  const monthlyTarget = productData.monthlyTarget

  // 人員配置を取得
  const assignment = staffAssignments.find(a => new Date(a.assignmentAt).getDate() === day && a.productId === product.id)
  const staffCount = assignment?.staffCount || baseStaffCount

  // その日の生産能力を計算
  const dailyCapacity = staffCount * product.productionCapacity * 8

  let dailyTarget = 0
  let actualProduction = 0
  let isRisky = false

  // 昨日までの累積（この日の処理前）
  const cumulativeProductionForDisplay = cumulative.cumulativeProduction

  if (isPast) {
    // 過去日：実績を取得
    const key = `${product.id}-${day}`
    actualProduction = dailyProductionMap.get(key) || 0

    // この日の時点での残り稼働日数（この日を含む）
    const remainingDaysFromThisDay = dayListInMonth.filter(d => d.day >= day && !d.isHoliday).length

    // 過去日の目標：残り目標を残り日数で均等割
    dailyTarget = cumulative.remainingTarget / Math.max(1, remainingDaysFromThisDay)

    // 累積に実績を加算
    cumulative.cumulativeProduction += actualProduction
    cumulative.remainingTarget = monthlyTarget - cumulative.cumulativeProduction
  } else {
    // 未来日：均等割配分 + 能力超過時の先取り

    // この日以降の稼働日数（この日を含む）
    const remainingDaysFromThisDay = dayListInMonth.filter(d => d.day >= day && !d.isHoliday).length

    // 日別目標：残り目標を残り日数で均等割
    dailyTarget = cumulative.remainingTarget / Math.max(1, remainingDaysFromThisDay)

    // 実際に作れる量（能力と残り目標の小さい方）
    const productionPlan = Math.min(dailyCapacity, Math.max(0, cumulative.remainingTarget))

    // 累積に実際の生産予定を加算
    cumulative.cumulativeProduction += productionPlan
    cumulative.remainingTarget = monthlyTarget - cumulative.cumulativeProduction

    // 未来日の危険度判定：製造能力が目標に足りていない場合
    if (!isHoliday && cumulative.remainingTarget > 0 && dailyCapacity < dailyTarget) {
      isRisky = true
    }
  }

  const remainingWorkingDaysFromToday = dayListInMonth.filter(d => d.day >= currentDate).length

  return {
    productId: product.id,
    productName: product.name,
    productColor: product.color,
    monthlyTarget,
    dailyTarget,
    dailyCapacity,
    staffCount,
    actualProduction,
    cumulativeProduction: cumulativeProductionForDisplay,
    remainingWorkingDays: remainingWorkingDaysFromToday,
    isRisky,
  }
}

// カレンダーデータを生成（最適化版 - DBアクセスなし）
function generateCalendarDataFromData(
  today: Date,
  year: number,
  month: number,
  products: any[],
  productData: ProductData[],
  holidays: any[],
  staffAssignments: any[],
  dailyProductionMap: Map<string, number>
) {
  const holidayDates = holidays.map(h => new Date(h.holidayAt).getDate())
  const currentDate = today.getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  // 日付情報リストを生成
  const dayListInMonth = generateDayInfoList(year, month, today, holidayDates)

  // カレンダーの日付データを格納
  const calendarDays: {
    day: number | null
    date: string
    dayOfWeek: number
    isHoliday: boolean
    isPast: boolean
    isToday: boolean
    plans: DailyPlan[]
  }[] = []

  // 空白セル
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({
      day: null,
      date: '',
      dayOfWeek: 0,
      isHoliday: false,
      isPast: false,
      isToday: false,
      plans: [],
    })
  }

  // 製品ごとの累積追跡Mapを初期化
  const productCumulatives = new Map<number, ProductCumulative>()
  products.forEach(product => {
    const monthlyTarget = productData.find(p => p.id === product.id)?.monthlyTarget || 0
    productCumulatives.set(product.id, {
      cumulativeProduction: 0,
      remainingTarget: monthlyTarget,
    })
  })

  // 日付ごとの計画を生成
  dayListInMonth.forEach(dayInfo => {
    const dailyPlans = products.map(product => {
      const productDataItem = productData.find(p => p.id === product.id)!
      const cumulative = productCumulatives.get(product.id)!

      return calculateDailyPlan(
        product,
        productDataItem,
        dayInfo,
        dayListInMonth,
        currentDate,
        cumulative,
        staffAssignments,
        dailyProductionMap
      )
    })

    calendarDays.push({
      day: dayInfo.day,
      date: dayInfo.dateString,
      dayOfWeek: dayInfo.dayOfWeek,
      isHoliday: dayInfo.isHoliday,
      isPast: dayInfo.isPast,
      isToday: dayInfo.isToday,
      plans: dailyPlans,
    })
  })

  return {
    year,
    month,
    days: calendarDays,
  }
}

// ============================================================================
// 既存のexport関数（後方互換性のため保持）
// ============================================================================

// 過去3年間の同月平均受注数から月間生産目標を算出
export const calculateMonthlyTarget = async (productId: number, year: number, month: number) => {
  try {
    // 過去3年間の同月受注データを取得
    const pastOrders = await prisma.order.findMany({
      where: {
        productId,
        orderAt: {
          gte: new Date(year - 3, month - 1, 1),
          lt: new Date(year, month - 1, 1),
        },
      },
    })

    // 年度ごとにグループ化
    const yearlyOrders: Record<number, number> = {}
    pastOrders.forEach(order => {
      const orderYear = new Date(order.orderAt).getFullYear()
      const orderMonth = new Date(order.orderAt).getMonth() + 1

      if (orderMonth === month) {
        if (!yearlyOrders[orderYear]) yearlyOrders[orderYear] = 0
        yearlyOrders[orderYear] += order.quantity
      }
    })

    // 平均を計算
    const years = Object.keys(yearlyOrders)
    const totalQuantity = Object.values(yearlyOrders).reduce((sum: number, qty) => sum + (qty as number), 0)
    const average = years.length > 0 ? totalQuantity / years.length : 0

    // 製品の余裕在庫を取得
    const product = await prisma.product.findUnique({
      where: {id: productId},
    })

    // 月間目標 = 過去平均 + 余裕在庫
    const monthlyTarget = average + (product?.allowanceStock || 0)

    return {
      success: true,
      data: {
        average,
        monthlyTarget,
        yearsCount: years.length,
        yearlyData: yearlyOrders,
      },
    }
  } catch (error) {
    console.error('月間目標の計算に失敗しました:', error)
    return {success: false, error: '月間目標の計算に失敗しました'}
  }
}

// 月初在庫を計算
export const getMonthStartStock = async (productId: number, year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)

    // 月初以前の生産総数
    const productions = await prisma.production.findMany({
      where: {
        productId,
        productionAt: {
          lt: monthStart,
        },
      },
    })
    const totalProduction = productions.reduce((sum, p) => sum + p.quantity, 0)

    // 月初以前の出荷総数
    const shipments = await prisma.shipment.findMany({
      where: {
        productId,
        shipmentAt: {
          lt: monthStart,
        },
      },
    })
    const totalShipment = shipments.reduce((sum, s) => sum + s.quantity, 0)

    const monthStartStock = totalProduction - totalShipment

    return {success: true, data: monthStartStock}
  } catch (error) {
    console.error('月初在庫の計算に失敗しました:', error)
    return {success: false, error: '月初在庫の計算に失敗しました', data: 0}
  }
}

// 今月の生産総数を取得
export const getMonthlyProduction = async (productId: number, year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const productions = await prisma.production.findMany({
      where: {
        productId,
        productionAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const total = productions.reduce((sum, p) => sum + p.quantity, 0)

    return {success: true, data: total}
  } catch (error) {
    console.error('今月の生産総数の取得に失敗しました:', error)
    return {success: false, error: '今月の生産総数の取得に失敗しました', data: 0}
  }
}

// 今月の出荷総数を取得
export const getMonthlyShipment = async (productId: number, year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const shipments = await prisma.shipment.findMany({
      where: {
        productId,
        shipmentAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const total = shipments.reduce((sum, s) => sum + s.quantity, 0)

    return {success: true, data: total}
  } catch (error) {
    console.error('今月の出荷総数の取得に失敗しました:', error)
    return {success: false, error: '今月の出荷総数の取得に失敗しました', data: 0}
  }
}

// 稼働日を計算（休日・土日を除外）
export const getWorkingDays = async (year: number, month: number, startDay = 1, endDay?: number) => {
  try {
    const daysInMonth = new Date(year, month, 0).getDate()
    const lastDay = endDay !== undefined ? Math.min(endDay, daysInMonth) : daysInMonth

    // 会社休日を取得
    const holidays = await prisma.companyHoliday.findMany({
      where: {
        holidayAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    })

    const holidayDates = holidays.map(h => new Date(h.holidayAt).getDate())

    // 稼働日をカウント
    const workingDays: number[] = []
    for (let day = startDay; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()

      // 土日と会社休日を除外
      if (!holidayDates.includes(day)) {
        workingDays.push(day)
      }
    }

    return {success: true, data: workingDays}
  } catch (error) {
    console.error('稼働日の計算に失敗しました:', error)
    return {success: false, error: '稼働日の計算に失敗しました', data: []}
  }
}

// 日別人員配置を取得
export const getDailyStaffAssignments = async (year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const assignments = await prisma.dailyStaffAssignment.findMany({
      where: {
        assignmentAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        Product: true,
      },
    })

    return {success: true, data: assignments}
  } catch (error) {
    console.error('日別人員配置の取得に失敗しました:', error)
    return {success: false, error: '日別人員配置の取得に失敗しました', data: []}
  }
}

// 日別人員配置を更新（upsert）
export const updateDailyStaffAssignment = async (date: Date, productId: number, staffCount: number) => {
  try {
    const assignment = await prisma.dailyStaffAssignment.upsert({
      where: {
        assignment_product_unique: {
          assignmentAt: date,
          productId,
        },
      },
      update: {
        staffCount,
      },
      create: {
        assignmentAt: date,
        productId,
        staffCount,
      },
    })

    return {success: true, data: assignment}
  } catch (error) {
    console.error('日別人員配置の更新に失敗しました:', error)
    return {success: false, error: '日別人員配置の更新に失敗しました'}
  }
}
export type ProductData = {
  id: number
  name: string
  color: string
  productionCapacity: number
  allowanceStock: number
  monthlyTarget: number
  monthStartStock: number
  monthlyProduction: number
  monthlyShipment: number
  currentStock: number
  remainingTarget: number
  targetAchievementRate: number
}

// ============================================================================
// ダッシュボード用の統合データを取得（パフォーマンス最適化版）
// ============================================================================

export const getDashboardData = async (today: Date) => {
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0, 23, 59, 59)

  try {
    // ============================================================================
    // 1. 必要なデータを全て一括取得（N+1問題の解消）
    // ============================================================================
    const [products, allOrders, allProductions, allShipments, holidays, staffAssignments] = await Promise.all([
      // 全製品
      prisma.product.findMany({orderBy: {id: 'asc'}}),

      // 過去3年間の全受注データ
      prisma.order.findMany({
        where: {
          orderAt: {
            gte: new Date(year - 3, 0, 1),
            lt: new Date(year, month, 0),
          },
        },
      }),

      // 全期間の生産データ
      prisma.production.findMany({
        where: {
          productionAt: {
            lt: new Date(year, month, 0),
          },
        },
      }),

      // 全期間の出荷データ
      prisma.shipment.findMany({
        where: {
          shipmentAt: {
            lt: new Date(year, month, 0),
          },
        },
      }),

      // 会社休日
      prisma.companyHoliday.findMany({
        where: {
          holidayAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),

      // 人員配置
      prisma.dailyStaffAssignment.findMany({
        where: {
          assignmentAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {Product: true},
      }),
    ])

    // ============================================================================
    // 2. データをMap化して高速検索可能にする
    // ============================================================================

    // 製品別の月間生産実績をMap化
    const monthlyProductionMap = new Map<number, number>()
    allProductions.forEach(prod => {
      const prodDate = new Date(prod.productionAt)
      if (prodDate >= monthStart && prodDate <= monthEnd) {
        const current = monthlyProductionMap.get(prod.productId) || 0
        monthlyProductionMap.set(prod.productId, current + prod.quantity)
      }
    })

    // 製品別×日別の生産実績をMap化
    const dailyProductionMap = new Map<string, number>()
    allProductions.forEach(prod => {
      const prodDate = new Date(prod.productionAt)
      if (prodDate >= monthStart && prodDate <= monthEnd) {
        const key = `${prod.productId}-${prodDate.getDate()}`
        const current = dailyProductionMap.get(key) || 0
        dailyProductionMap.set(key, current + prod.quantity)
      }
    })

    // 製品別の月間出荷をMap化
    const monthlyShipmentMap = new Map<number, number>()
    allShipments.forEach(ship => {
      const shipDate = new Date(ship.shipmentAt)
      if (shipDate >= monthStart && shipDate <= monthEnd) {
        const current = monthlyShipmentMap.get(ship.productId) || 0
        monthlyShipmentMap.set(ship.productId, current + ship.quantity)
      }
    })

    // ============================================================================
    // 3. 製品データを計算
    // ============================================================================

    const productData: ProductData[] = products.map(product => {
      // 月間目標の計算
      const monthlyTarget = calculateMonthlyTargetFromData(product.id, year, month, allOrders, product.allowanceStock)

      // 月初在庫の計算
      const monthStartStock = calculateMonthStartStockFromData(product.id, monthStart, allProductions, allShipments)

      // 今月の生産・出荷
      const monthlyProduction = monthlyProductionMap.get(product.id) || 0
      const monthlyShipment = monthlyShipmentMap.get(product.id) || 0

      const currentStock = monthStartStock + monthlyProduction - monthlyShipment
      const remainingTarget = Math.max(0, monthlyTarget - monthlyProduction)

      return {
        ...product,
        monthlyTarget,
        monthStartStock,
        monthlyProduction,
        monthlyShipment,
        currentStock,
        remainingTarget,
        targetAchievementRate: monthlyTarget > 0 ? Math.round((monthlyProduction / monthlyTarget) * 100) : 0,
      }
    })

    // ============================================================================
    // 4. カレンダーデータを生成
    // ============================================================================

    const calendarData = generateCalendarDataFromData(
      today,
      year,
      month,
      products,
      productData,
      holidays,
      staffAssignments,
      dailyProductionMap
    )

    // const lastDayInfomation = calendarData.days
    //   .filter(day => !day.isHoliday)
    //   .sort((a, b) => (a.day ?? 0) - (b.day ?? 0))
    //   .pop()

    // if (lastDayInfomation) {
    //   const plans = lastDayInfomation.plans
    //   plans?.forEach(plan => {
    //     plan.monthlyTarget <= plan.cumulativeProduction
    //     const product = productData.find(p => p.id === plan.productId)
    //     if (product) {
    //       const isFullFilled = product.monthlyTarget <= product.monthlyProduction + plan.dailyCapacity
    //     }
    //   })
    // }

    // ============================================================================
    // 5. 見込み生産数を計算
    // ============================================================================

    const scheduledProductionByProduct = new Map<number, number>()

    const expectedProductionByProduct = new Map<number, number>()
    calendarData.days.forEach(dayData => {
      if (dayData.day !== null) {
        dayData.plans.forEach(plan => {
          const current = expectedProductionByProduct.get(plan.productId) || 0

          //実績と予定両方の合計を計算
          const addCount = dayData.isPast ? plan.actualProduction : plan.dailyCapacity
          expectedProductionByProduct.set(plan.productId, current + addCount)

          //予定のみの合計を計算

          scheduledProductionByProduct.set(
            plan.productId,
            (scheduledProductionByProduct.get(plan.productId) || 0) + (dayData.isPast ? 0 : plan.dailyCapacity)
          )
        })
      }
    })

    const productsWithExpected = productData.map(product => {
      const scheduledProduction = scheduledProductionByProduct.get(product.id) || 0
      const expectedProduction = expectedProductionByProduct.get(product.id) || 0
      const excessExpected = expectedProduction - product.monthlyTarget

      const isFullFilledOnLastDay = product.monthlyTarget <= product.monthlyProduction + scheduledProduction

      return {
        ...product,
        scheduledProduction,
        expectedProduction,
        excessExpected,
        isFullFilledOnLastDay,
      }
    })

    // 稼働日を計算
    const holidayDates = holidays.map(h => new Date(h.holidayAt).getDate())
    const daysInMonth = new Date(year, month, 0).getDate()
    const workingDays: number[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      if (!holidayDates.includes(day)) {
        workingDays.push(day)
      }
    }

    return {
      success: true,
      data: {
        products: productsWithExpected,
        workingDays,
        staffAssignments,
        calendar: calendarData,
      },
    }
  } catch (error) {
    console.error('ダッシュボードデータの取得に失敗しました:', error)
    return {success: false, error: 'ダッシュボードデータの取得に失敗しました'}
  }
}
