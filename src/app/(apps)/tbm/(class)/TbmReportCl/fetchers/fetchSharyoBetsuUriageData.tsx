'use server'

import {NumHandler} from '@cm/class/NumHandler'

export type sharyoBetsuUriageRecordKey =
  | `CD`
  | `vehicleNumber`
  | `monthlyMileage`
  | `postalFee`
  | `generalFee`
  | `etcUsageFee`
  | `tollFee`
  | `freightRevenue`
  | `futaiFee`
  | `fuelCostPerVehicle`

import {MEIAI_SUM_ORIGIN} from '@app/(apps)/tbm/(lib)/calculation'
import {getTbmBase_MonthConfig} from '@app/(apps)/tbm/(server-actions)/getBasics'
import {getNenpiDataByCar} from '@app/(apps)/tbm/(server-actions)/getNenpiDataByCar'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import prisma from 'src/lib/prisma'
import {TbmVehicle} from '@prisma/client'

import {fetchUnkoMeisaiData, tbmTableKeyValue} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {unkoMeisaiKey} from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'

export type SharyoBetsuUriageRecord = {
  vehicle: TbmVehicle
  keyValue: {
    [key in sharyoBetsuUriageRecordKey]: tbmTableKeyValue
  }
}

export const fetchSharyoBetsuUriageData = async ({whereQuery, tbmBaseId}) => {
  const {monthlyTbmDriveList} = await fetchUnkoMeisaiData({
    whereQuery,
    tbmBaseId,
    userId: undefined,
  })

  const yearMonth = whereQuery.gte ?? getMidnight()

  const {TbmBase_MonthConfig} = await getTbmBase_MonthConfig({yearMonth, tbmBaseId})

  const {nenpiKanriDataListByCar} = await getNenpiDataByCar({tbmBaseId, whereQuery, TbmBase_MonthConfig})

  // 車両リストを取得
  const vehicleList = await prisma.tbmVehicle.findMany({
    where: {tbmBaseId},
    orderBy: {code: 'asc'},
  })

  // 車両ごとにグループ化
  const vehicleMap = new Map<number, typeof monthlyTbmDriveList>()

  monthlyTbmDriveList.forEach(row => {
    const {schedule} = row
    const vehicleId = schedule.TbmVehicle?.id

    if (vehicleId) {
      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, [])
      }
      vehicleMap.get(vehicleId)!.push(row)
    }
  })

  // 車両別に集計
  const SharyoBetsuUriageRecords: SharyoBetsuUriageRecord[] = vehicleList.map((vehicle, index) => {
    const vehicleSchedule = vehicleMap.get(vehicle.id) ?? []

    const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(vehicleSchedule, dataKey)

    // 燃費管理データから車両別の情報を取得
    const fuelData = nenpiKanriDataListByCar.find(v => v?.vehicle?.id === vehicle.id)

    const postalFee = MEIAI_SUM(`L_postalFee`)
    const generalFee = MEIAI_SUM(`N_generalFee`)
    const etcUsageFee = MEIAI_SUM(`M_postalHighwayFee`) + MEIAI_SUM(`O_generalHighwayFee`)
    const tollFee = postalFee + generalFee
    const freightRevenue = MEIAI_SUM(`Q_driverFee`)
    const futaiFee = MEIAI_SUM(`Q_futaiFee`)
    const fuelCostPerVehicle = fuelData?.fuelCostInPeriod ?? 0
    const monthlyMileage = fuelData?.sokoKyoriInPeriod ?? 0

    const width40 = 40
    const width120 = 120
    const widthBase = 120

    return {
      vehicle,
      keyValue: {
        CD: {
          label: 'コード',
          cellValue: index + 1,
          style: {fontSize: 12, minWidth: width40},
        },
        vehicleNumber: {
          label: '車両番号',
          cellValue: vehicle.vehicleNumber ?? '',
          style: {fontSize: 12, minWidth: width120},
        },
        monthlyMileage: {
          label: '月間走行距離',
          cellValue: NumHandler.WithUnit(monthlyMileage, 'km', 1),
          style: {fontSize: 12, minWidth: widthBase},
        },
        postalFee: {
          label: '郵便',
          cellValue: postalFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        generalFee: {
          label: '一般',
          cellValue: generalFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        etcUsageFee: {
          label: 'ETC利用料金',
          cellValue: etcUsageFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        tollFee: {
          label: '通行料',
          cellValue: tollFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        freightRevenue: {
          label: '運賃高',
          cellValue: freightRevenue,
          style: {fontSize: 12, minWidth: widthBase},
        },
        futaiFee: {
          label: '付帯料金高',
          cellValue: futaiFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        fuelCostPerVehicle: {
          label: '車両別給油料金',
          cellValue: fuelCostPerVehicle,
          style: {fontSize: 12, minWidth: widthBase},
        },
      },
    }
  })

  return {
    SharyoBetsuUriageRecords,
  }
}

