'use server'

import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import { Days } from '@cm/class/Days/Days'
import prisma from 'src/lib/prisma'

const keiyuPerLiter = 160

export type getNenpiDataByCarReturn = Awaited<ReturnType<typeof getNenpiDataByCar>>
export const getNenpiDataByCar = async ({ tbmBaseId, whereQuery, TbmBase_MonthConfig }) => {
  console.warn(`営業所 / 月ごとに軽油単価の設定が必要です。`)

  const { firstDayOfMonth } = Days.month.getMonthDatum(whereQuery.gte)

  const vehicleList = await prisma.tbmVehicle.findMany({
    where: { tbmBaseId },
    include: {
      TbmRefuelHistory: {
        where: { date: whereQuery },
        orderBy: { date: 'asc' },
      },
    },
  })

  const previousFuelHistoryByCar = await prisma.tbmVehicle.findMany({
    where: { tbmBaseId },
    include: {
      TbmRefuelHistory: {
        where: { date: { lte: firstDayOfMonth } },
        orderBy: [{ date: 'desc' }, { id: 'asc' }],
        take: 1,
      },
    },
  })

  await prisma.tbmVehicle.findMany({
    where: { tbmBaseId }, include: { TbmRefuelHistory: {} }
  })

  const nenpiKanriDataListByCar = vehicleList.map(vehicle => {
    const carriedOverFuelHistory = previousFuelHistoryByCar.find(v => v.id === vehicle.id)?.TbmRefuelHistory[0]

    if (carriedOverFuelHistory) {
      const { date, odometer, amount } = carriedOverFuelHistory
      console.log({ date, odometer, amount })
    }

    const fuelHistoryData = vehicle.TbmRefuelHistory

    const start = fuelHistoryData[0]?.odometer
    const end = fuelHistoryData?.[fuelHistoryData.length - 1]?.odometer

    const sokoKyoriInPeriod = TbmReportCl.getKukankYori(start, end)



    let sokyuyuRyoInPeriod = 0
    const sokyuyuRyoInPeriodForAverageCalculation = fuelHistoryData.reduce((acc, cur, i) => {
      const prev = fuelHistoryData[i - 1]
      const kukanKyori = TbmReportCl.getKukankYori(prev?.odometer ?? 0, cur.odometer ?? 0)

      sokyuyuRyoInPeriod += cur.amount

      if (kukanKyori) {
        return acc + cur.amount
      } else {
        return acc
      }
    }, 0)



    const heikinNempiInPeriod = sokoKyoriInPeriod && sokyuyuRyoInPeriodForAverageCalculation && sokoKyoriInPeriod / sokyuyuRyoInPeriodForAverageCalculation

    const fuelCostInPeriod = sokyuyuRyoInPeriod * (TbmBase_MonthConfig?.keiyuPerLiter ?? keiyuPerLiter)

    return {
      vehicle,
      carriedOverFuelHistory,
      sokoKyoriInPeriod: sokoKyoriInPeriod ?? 0,
      heikinNempiInPeriod: heikinNempiInPeriod ?? 0,
      sokyuyuRyoInPeriod: sokyuyuRyoInPeriod ?? 0,
      fuelCostInPeriod: fuelCostInPeriod ?? 0,
    }
  })

  return {
    nenpiKanriDataListByCar,
  }
}
