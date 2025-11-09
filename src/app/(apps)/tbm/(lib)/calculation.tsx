import {eigyoshoRecordKey, fetchEigyoshoUriageData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoUriageData'

import {carHistoryKey, fetchRuisekiKyoriKichoData} from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'

import {TbmReportCl} from '@app/(apps)/tbm/(class)/TbmReportCl'
import {fetchUnkoMeisaiData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {unkoMeisaiKey} from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
type userSchedule = Awaited<ReturnType<typeof fetchUnkoMeisaiData>>['monthlyTbmDriveList']

export const MEIAI_SUM_ORIGIN = (userSchedule: userSchedule, dataKey: unkoMeisaiKey) => {
  return userSchedule.reduce((acc, cur) => {
    const value = cur.keyValue?.[dataKey]?.cellValue
    return acc + (Number(value) ?? 0)
  }, 0)
}
//

type userWithCarHistory = Awaited<ReturnType<typeof fetchRuisekiKyoriKichoData>>

export const RUISEKI_SUM_ORIGIN = (userWithCarHistory: userWithCarHistory, dataKey: carHistoryKey) => {
  return userWithCarHistory.reduce((acc, obj) => {
    const value = obj.allCars.reduce((acc, cur) => {
      return acc + (cur[dataKey] ?? 0)
    }, 0)

    return acc + (Number(value) ?? 0)
  }, 0)
}

type MyEigyoshoUriageRecord = Awaited<ReturnType<typeof fetchEigyoshoUriageData>>['EigyoshoUriageRecords']
export const EIGYOSHO_URIAGE_SUMORIGIN = (MyEigyoshoUriageRecord: MyEigyoshoUriageRecord, dataKey: eigyoshoRecordKey) => {
  return MyEigyoshoUriageRecord.reduce((acc, cur) => {
    const sum = Object.keys(cur.keyValue).reduce((acc, key) => {
      const theKey = (dataKey || '') as any
      return acc + (cur.keyValue[theKey]?.cellValue ?? 0)
    }, 0)

    return acc + (Number(sum) ?? 0)
  }, 0)
}
