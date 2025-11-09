import {driveInputPageType} from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'

import {Days} from '@cm/class/Days/Days'

export class DriveScheduleCl {
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
