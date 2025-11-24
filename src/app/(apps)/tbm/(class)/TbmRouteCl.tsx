import { Days } from '@cm/class/Days/Days'
import {
  TbmDriveSchedule,
  TbmMonthlyConfigForRouteGroup,
  TbmRouteGroup,
  TbmRouteGroupFee,
  Mid_TbmRouteGroup_TbmCustomer,
  TbmCustomer,
} from '@prisma/client'
import { TimeHandler } from './TimeHandler'
export type TbmRouteData = TbmRouteGroup & {
  TbmMonthlyConfigForRouteGroup: TbmMonthlyConfigForRouteGroup[]
  TbmDriveSchedule: TbmDriveSchedule[]
  TbmRouteGroupFee: TbmRouteGroupFee[]
  Mid_TbmRouteGroup_TbmCustomer: Mid_TbmRouteGroup_TbmCustomer & {
    TbmCustomer: TbmCustomer
  }
}
export default class TbmRouteCl {
  data: TbmRouteData

  constructor(TbmRouteGroup) {
    this.data = TbmRouteGroup
  }

  get timeRange() {
    if (!this.data.departureTime && !this.data.finalArrivalTime) {
      return '時刻未設定'
    }
    return `${TimeHandler.formatTimeString(this.data.departureTime, 'display')} - ${TimeHandler.formatTimeString(this.data.finalArrivalTime, 'display')}`
  }

  get Customer() {
    return this.data.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer
  }

  getMonthlyData(month: Date) {
    const DriveSchedule = this?.data?.TbmDriveSchedule?.filter(schedule => {
      return Days.validate.isSameMonth(month, schedule.date)
    })

    const monthConfig = this?.data?.TbmMonthlyConfigForRouteGroup?.find(config => {
      return Days.validate.isSameMonth(month, config.yearMonth)
    })

    const { tsukoryoSeikyuGaku = 0 } = monthConfig ?? {}

    const jitsudoKaisu = DriveSchedule?.length ?? 0



    return { jitsudoKaisu }
  }
}
