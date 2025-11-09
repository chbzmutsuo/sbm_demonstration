'use server'

import prisma from 'src/lib/prisma'

const keiyuPerLiter = 160

export const getNenpiDataByCar = async ({tbmBaseId, whereQuery, TbmBase_MonthConfig}) => {
  console.warn(`営業所 / 月ごとに軽油単価の設定が必要です。`)

  const vehicleList = await prisma.tbmVehicle.findMany({where: {tbmBaseId}})

  // 期間中の給油履歴から、最大値と平均値を取得
  const fuelByCar = await prisma.tbmRefuelHistory.groupBy({
    by: [`tbmVehicleId`],
    where: {
      date: whereQuery,
      TbmVehicle: {tbmBaseId},
    },
    _sum: {amount: true},
    _avg: {amount: true},
  })

  // 期間中の車両ごとのオドメーター入力履歴から、走行距離を計算
  const odometerInputByCar = await prisma.odometerInput.groupBy({
    by: [`tbmVehicleId`],
    where: {
      date: whereQuery,
      TbmVehicle: {tbmBaseId},
    },
    _sum: {odometerEnd: true},
    _max: {odometerEnd: true},
    _min: {odometerStart: true},
  })

  await prisma.tbmVehicle.findMany({where: {tbmBaseId}, include: {TbmRefuelHistory: {}}})

  const nenpiKanriDataListByCar = vehicleList.map(vehicle => {
    //燃費データ
    const fuelData = fuelByCar.find(v => v.tbmVehicleId === vehicle.id)

    //走行距離データ
    const odometerInputData = odometerInputByCar.find(v => v.tbmVehicleId === vehicle.id)

    const sokoKyoriInPeriod = (odometerInputData?._max?.odometerEnd ?? 0) - (odometerInputData?._min?.odometerStart ?? 0)

    const sokyuyuRyoInPeriod = fuelData?._sum?.amount ?? 0
    const heikinNempiInPeriod = sokoKyoriInPeriod && sokyuyuRyoInPeriod && sokoKyoriInPeriod / sokyuyuRyoInPeriod

    const fuelCostInPeriod = sokyuyuRyoInPeriod * (TbmBase_MonthConfig?.keiyuPerLiter ?? keiyuPerLiter)

    return {
      vehicle,
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
