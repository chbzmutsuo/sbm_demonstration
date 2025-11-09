'use server'

import {MEIAI_SUM_ORIGIN} from '@app/(apps)/tbm/(lib)/calculation'
import {fetchUnkoMeisaiData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {unkoMeisaiKey} from '@app/(apps)/tbm/(class)/DriveScheduleCl'
import {tbmTableKeyValue} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {TbmCustomer} from '@prisma/client'

export type nioshuUriageRecordKey = `customerName` | `postalFee` | `generalFee` | `driverFee`

export type NioshuUriageRecord = {
  customer: TbmCustomer | null
  keyValue: {
    [key in nioshuUriageRecordKey]: tbmTableKeyValue
  }
}

export const fetchNioshuUriageData = async ({whereQuery, tbmBaseId}) => {
  const {monthlyTbmDriveList} = await fetchUnkoMeisaiData({
    whereQuery,
    tbmBaseId,
    userId: undefined,
  })

  // 荷主ごとにグループ化
  const customerMap = new Map<number, typeof monthlyTbmDriveList>()

  monthlyTbmDriveList.forEach(row => {
    const {schedule} = row
    const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.tbmCustomerId

    if (customerId) {
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, [])
      }
      customerMap.get(customerId)!.push(row)
    }
  })

  // 荷主別に集計
  const NioshuUriageRecords: NioshuUriageRecord[] = Array.from(customerMap.entries()).map(([customerId, schedules]) => {
    const customer = schedules[0]?.schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer ?? null

    const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(schedules, dataKey)

    const postalFee = MEIAI_SUM(`L_postalFee`)
    const generalFee = MEIAI_SUM(`N_generalFee`)
    const driverFee = MEIAI_SUM(`Q_driverFee`) + MEIAI_SUM(`Q_futaiFee`)

    const widthBase = 120

    return {
      customer,
      keyValue: {
        customerName: {
          label: 'お得意先',
          cellValue: customer?.name ?? '',
          style: {fontSize: 12, minWidth: widthBase},
        },
        postalFee: {
          label: '通行料1',
          cellValue: postalFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        generalFee: {
          label: '通行料2',
          cellValue: generalFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        driverFee: {
          label: '運賃',
          cellValue: driverFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
      },
    }
  })

  // 荷主名でソート
  NioshuUriageRecords.sort((a, b) => {
    const nameA = a.customer?.name ?? ''
    const nameB = b.customer?.name ?? ''
    return nameA.localeCompare(nameB, 'ja')
  })

  return {
    NioshuUriageRecords,
  }
}

