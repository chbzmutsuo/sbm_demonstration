'use server'

import prisma from 'src/lib/prisma'

export const fetchTestProgressData = async ({tbmBaseId, whereQuery}) => {
  // 1. 配車設定状況（便別）
  const driveSchedules = await prisma.tbmDriveSchedule.findMany({
    where: {
      tbmBaseId,
      date: whereQuery,
    },
    include: {
      TbmRouteGroup: {
        include: {
          TbmRouteGroupFee: {
            orderBy: {
              startDate: 'desc',
            },
          },
        },
      },
    },
    orderBy: [
      //
      {finished: {sort: 'asc', nulls: 'last'}},
      {date: 'asc'},
    ],
  })

  // 便別に集計
  const routeGroupStats = new Map()
  driveSchedules.forEach(schedule => {
    const routeGroupId = schedule.tbmRouteGroupId
    const routeGroup = schedule.TbmRouteGroup

    if (!routeGroupStats.has(routeGroupId)) {
      // 運行日の運賃設定を取得
      const feeOnDate = routeGroup.TbmRouteGroupFee.find(fee => fee.startDate <= schedule.date)

      routeGroupStats.set(routeGroupId, {
        routeGroup: {
          id: routeGroup.id,
          code: routeGroup.code,
          name: routeGroup.name,
          routeName: routeGroup.routeName,
        },
        driverFee: feeOnDate?.driverFee ?? 0,
        futaiFee: feeOnDate?.futaiFee ?? 0,
        count: 0,
        finishedCount: 0,
        confirmedCount: 0,
        approvedCount: 0,
        details: [],
      })
    }

    const stats = routeGroupStats.get(routeGroupId)
    stats.count++
    if (schedule.finished) stats.finishedCount++
    if (schedule.confirmed) stats.confirmedCount++
    if (schedule.approved) stats.approvedCount++
    stats.details.push({
      date: schedule.date,
      finished: schedule.finished,
      confirmed: schedule.confirmed,
      approved: schedule.approved,
    })
  })

  const routeGroupStatsArray = Array.from(routeGroupStats.values())

  // 合計を計算
  const totals = {
    count: routeGroupStatsArray.reduce((sum, s) => sum + s.count, 0),
    finishedCount: routeGroupStatsArray.reduce((sum, s) => sum + s.finishedCount, 0),
    confirmedCount: routeGroupStatsArray.reduce((sum, s) => sum + s.confirmedCount, 0),
    approvedCount: routeGroupStatsArray.reduce((sum, s) => sum + s.approvedCount, 0),
    driverFee: routeGroupStatsArray[0]?.driverFee ?? 0, // 運賃は便ごとに異なるため、最初のものを表示
    futaiFee: routeGroupStatsArray[0]?.futaiFee ?? 0, // 付帯作業も同様
  }

  // 2. 給油データ登録数とその明細
  const refuelHistories = await prisma.tbmRefuelHistory.findMany({
    where: {
      TbmVehicle: {
        tbmBaseId,
      },
      date: whereQuery,
    },
    include: {
      TbmVehicle: {
        select: {
          vehicleNumber: true,
          name: true,
        },
      },
      User: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: [{TbmVehicle: {vehicleNumber: 'asc'}}, {date: 'asc'}, {id: 'asc'}],
  })

  // 直前のオドメータを取得してチェック
  const refuelHistoriesWithCheck = refuelHistories.map((history, index) => {
    // 同じ車両の前の記録をチェック（同じ配列内で）
    const previousInArray = refuelHistories
      .slice(0, index)
      .filter(h => h.tbmVehicleId === history.tbmVehicleId)
      .pop()

    const previousOdometer = previousInArray?.odometer ?? 0
    const hasError = previousOdometer > 0 && history.odometer < previousOdometer

    return {
      ...history,
      previousOdometer,
      hasError,
    }
  })

  // 3. オドメーター入力数とその明細
  const odometerInputs = await prisma.odometerInput.findMany({
    where: {
      TbmVehicle: {
        tbmBaseId,
      },
      date: whereQuery,
    },
    include: {
      TbmVehicle: {
        select: {
          vehicleNumber: true,
          name: true,
        },
      },
      User: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: [{TbmVehicle: {vehicleNumber: 'asc'}}, {date: 'asc'}, {id: 'asc'}],
  })

  // 直前のオドメータを取得してチェック
  const odometerInputsWithCheck = odometerInputs.map((input, index) => {
    // 同じ車両の前の記録をチェック（同じ配列内で）
    const previousInArray = odometerInputs
      .slice(0, index)
      .filter(i => i.tbmVehicleId === input.tbmVehicleId)
      .pop()

    const previousOdometerEnd = previousInArray?.odometerEnd ?? 0
    const hasError = previousOdometerEnd > 0 && input.odometerStart < previousOdometerEnd

    return {
      ...input,
      previousOdometerEnd,
      hasError,
    }
  })

  return {
    routeGroupStats: routeGroupStatsArray,
    routeGroupTotals: totals,
    refuelHistories: refuelHistoriesWithCheck,
    odometerInputs: odometerInputsWithCheck,
  }
}
