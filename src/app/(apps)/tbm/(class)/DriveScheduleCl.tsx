import {driveInputPageType} from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'
import {tbmTableKeyValue} from '@app/(apps)/tbm/(server-actions)/getMonthlyTbmDriveData'
import {Days} from '@cm/class/Days/Days'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {
  Mid_TbmRouteGroup_TbmCustomer,
  TbmCustomer,
  TbmDriveSchedule,
  TbmMonthlyConfigForRouteGroup,
  TbmRouteGroup,
  TbmRouteGroupFee,
  TbmVehicle,
  User,
} from '@prisma/client'

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
export type DriveScheduleData = TbmDriveSchedule & {
  TbmRouteGroup: TbmRouteGroup & {
    TbmMonthlyConfigForRouteGroup: TbmMonthlyConfigForRouteGroup[]
    Mid_TbmRouteGroup_TbmCustomer: Mid_TbmRouteGroup_TbmCustomer & {
      TbmCustomer: TbmCustomer
    }
    TbmRouteGroupFee: TbmRouteGroupFee[]
  }
  TbmVehicle: TbmVehicle
  User: User & {
    TbmVehicle: TbmVehicle
  }
}
export class DriveScheduleCl {
  DriveSchedule: DriveScheduleData

  constructor(schedule) {
    this.DriveSchedule = schedule
  }

  static allowNonApprovedSchedule = true

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

  static async getDriveScheduleList(props: {
    whereQuery: {
      gte?: Date | undefined
      lte?: Date | undefined
    }
    tbmBaseId: number | undefined
    userId: number | undefined
  }) {
    const {tbmBaseId, whereQuery, userId} = props
    const tbmDriveSchedule = await doStandardPrisma('tbmDriveSchedule', 'findMany', {
      where: {
        approved: DriveScheduleCl.allowNonApprovedSchedule ? undefined : true,
        date: whereQuery,
        tbmBaseId,
        userId,
      },
      orderBy: [
        {date: 'asc'},
        {TbmRouteGroup: {departureTime: {sort: 'asc', nulls: 'last'}}},
        {createdAt: 'asc'},
        {userId: 'asc'},
      ],
      include: {
        TbmEtcMeisai: {include: {}},
        TbmRouteGroup: {
          include: {
            TbmMonthlyConfigForRouteGroup: {where: {yearMonth: whereQuery.gte}},
            Mid_TbmRouteGroup_TbmCustomer: {include: {TbmCustomer: {}}},
            TbmRouteGroupFee: {where: {startDate: {gte: whereQuery.gte}}},
          },
        },
        TbmVehicle: {},
        User: {
          where: {id: userId},
          include: {TbmVehicle: {}},
        },
      },
    }).then(res => res.result)

    return tbmDriveSchedule
  }

  get unkoMeisaiCols() {
    const schedule = this.DriveSchedule

    const jitsudoKaisu = 1
    const ConfigForRoute = schedule.TbmRouteGroup.TbmMonthlyConfigForRouteGroup.find(
      config => config.tbmRouteGroupId === schedule.TbmRouteGroup.id
    )

    const feeOnDate = schedule.TbmRouteGroup.TbmRouteGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).find(
      fee => fee.startDate <= schedule.date
    )

    const Q_driverFee = (feeOnDate?.driverFee ?? 0) + (feeOnDate?.futaiFee ?? 0)

    const L_postalFee = (ConfigForRoute?.tsukoryoSeikyuGaku ?? 0) / jitsudoKaisu
    const M_postalHighwayFee = schedule.M_postalHighwayFee ?? 0

    const N_generalFee = ConfigForRoute?.generalFee ?? 0
    const O_generalHighwayFee = schedule.O_generalHighwayFee ?? 0

    const T_thirteenPercentOfPostalHighway = M_postalHighwayFee * 0.3
    const S_jomuinFutan = M_postalHighwayFee - (L_postalFee + T_thirteenPercentOfPostalHighway)
    const U_general = O_generalHighwayFee - N_generalFee

    const R_JomuinUnchin = Q_driverFee - (T_thirteenPercentOfPostalHighway + U_general)

    const Customer = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer

    const keyValue: unkoMeisaiKeyValue = {
      date: {
        type: 'date',
        label: 'A運行日',
        cellValue: schedule.date,
      },
      // routeCode: {
      //   label: 'B便CD',
      //   cellValue: schedule.TbmRouteGroup.code,
      // },
      routeName: {
        label: '路線名',
        cellValue: schedule.TbmRouteGroup.routeName,
        style: {minWidth: 160},
      },
      name: {
        label: 'C便名',
        cellValue: schedule.TbmRouteGroup.name,
        style: {minWidth: 160},
      },
      vehicleType: {
        label: 'D車種',
        cellValue: schedule.TbmVehicle?.type,
      },

      productName: {
        label: 'E品名',
        cellValue: schedule.TbmRouteGroup.productName,
      },
      // customerCode: {
      //   label: 'F取引先CD',
      //   cellValue: Customer?.code,
      // },
      customerName: {
        label: 'G取引先',
        cellValue: Customer?.name,
      },
      // vehicleTypeCode: {
      //   label: '車種CD',
      //   cellValue: 'コード',
      // },
      plateNumber: {
        label: 'I車番',
        cellValue: schedule.TbmVehicle?.vehicleNumber,
      },
      // driverCode: {
      //   label: '運転手CD',
      //   cellValue: 'コード',
      // },
      driverName: {
        label: 'K運転手',
        cellValue: schedule.User?.name,
      },
      L_postalFee: {
        label: (
          <div>
            <div>L通行料</div> <div>(郵便)</div>
          </div>
        ),
        cellValue: L_postalFee,
        style: {backgroundColor: '#fcdede'},
      },
      M_postalHighwayFee: {
        label: (
          <div>
            <div>M有料利用料</div> <div>(郵便)</div>
          </div>
        ),
        cellValue: M_postalHighwayFee,
        style: {backgroundColor: '#fcdede'},
      },
      N_generalFee: {
        label: (
          <div>
            <div>N通行料</div> <div>(一般)</div>
          </div>
        ),
        cellValue: N_generalFee,
        style: {backgroundColor: '#deebfc'},
      },
      O_generalHighwayFee: {
        label: (
          <div>
            <div>O有料利用料</div> <div>(一般)</div>
          </div>
        ),
        cellValue: O_generalHighwayFee,
        style: {backgroundColor: '#deebfc'},
      },
      P_KosokuShiyodai: {
        label: 'P高速使用代',
        cellValue: S_jomuinFutan,
      },
      Q_driverFee: {
        label: 'Q運賃',
        cellValue: Q_driverFee,
      },
      R_JomuinUnchin: {
        label: 'R給与算定運賃',
        cellValue: R_JomuinUnchin,
        style: {
          minWidth: 100,
          backgroundColor: '#defceb',
        },
      },
      S_jomuinFutan: {
        label: (
          <div>
            <div>S乗務員負担</div> <div>高速代-(通行料+30％)</div>
          </div>
        ),
        cellValue: S_jomuinFutan,
        style: {backgroundColor: '#defceb'},
      },
      T_thirteenPercentOfPostalHighway: {
        label: (
          <div>
            <div>T運賃から負担</div> <div>高速代の30％</div>
          </div>
        ),
        cellValue: T_thirteenPercentOfPostalHighway,
        style: {backgroundColor: '#defceb'},
      },
      U_general: {
        label: 'U高速代-通行料',
        cellValue: U_general,
        style: {backgroundColor: '#9ec1ff'},
      },
      V_highwayExcess: {
        label: 'V高速超過分',
        cellValue: 0,
      },
      W_remarks: {
        label: 'W備考',
        cellValue: '要検討',
      },
      X_orderNumber: {
        label: 'X発注書NO',
        cellValue: '要検討',
      },
    }

    Object.keys(keyValue).forEach(key => {
      keyValue[key].style = {minWidth: 90, fontSize: 12, ...keyValue[key].style}
    })
    return keyValue
  }
}
