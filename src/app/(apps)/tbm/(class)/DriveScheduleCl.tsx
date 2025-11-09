import {TbmReportCl} from '@app/(apps)/tbm/(class)/TbmReportCl'
import {tbmTableKeyValue} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {driveInputPageType} from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'

import {Days} from '@cm/class/Days/Days'

export type unkoMeisaiKey =
  | `date`
  // | `routeCode`
  | `name`
  | `routeName`
  | `vehicleType`
  | `productName`
  // | `customerCode`
  | `customerName`
  // | `vehicleTypeCode`
  | `plateNumber`
  // | `driverCode`
  | `driverName`
  | `L_postalFee`
  | `M_postalHighwayFee`
  | `N_generalFee`
  | `O_generalHighwayFee`
  | `P_KosokuShiyodai`
  | `Q_driverFee`
  | `Q_futaiFee`
  | `R_JomuinUnchin`
  | `S_jomuinFutan`
  | `T_thirteenPercentOfPostalHighway`
  | `U_general`
  | `V_highwayExcess`
  | `W_remarks`
  | `X_orderNumber`

export type unkoMeisaiKeyValue = {
  [key in unkoMeisaiKey]: tbmTableKeyValue
}

export class DriveScheduleCl {
  DriveSchedule: Awaited<ReturnType<typeof TbmReportCl.fetcher.fetchUnkoMeisaiData>>['monthlyTbmDriveList']

  constructor(schedule) {
    this.DriveSchedule = schedule
  }

  static allowNonApprovedSchedule = false
  static getStatus(driveScheduleList: driveInputPageType['driveScheduleList']) {
    const unkoCompleted = driveScheduleList.every(d => d.finished)
    const carInputCompleted = driveScheduleList.every(d => {
      const odometerInputList =
        d?.TbmVehicle?.OdometerInput?.filter(item => {
          if (!item?.date || !d?.date) return false
          const isSameDate = Days.validate.isSameDate(item?.date, d?.date)
          const completed = item?.odometerStart > 0 && item?.odometerEnd > 0

          return isSameDate && completed
        }) ?? []

      return odometerInputList.length > 0
    })

    const gyomushuryo = driveScheduleList.every(d => d.confirmed)

    return {unkoCompleted, carInputCompleted, gyomushuryo}
  }
}
