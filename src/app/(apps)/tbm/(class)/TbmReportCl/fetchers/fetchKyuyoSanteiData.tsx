'use server'

import {MEIAI_SUM_ORIGIN} from '@app/(apps)/tbm/(lib)/calculation'
import {fetchEigyoshoUriageData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoUriageData'
import {tbmTableKeyValue} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {getTbmBase_MonthConfig} from '@app/(apps)/tbm/(server-actions)/getBasics'
import {carHistoryKey, fetchRuisekiKyoriKichoData} from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {unkoMeisaiKey} from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import prisma from 'src/lib/prisma'
import {User} from '@prisma/client'

export type KyuyoSanteiRecordKey =
  | 'B_Shukkin'
  | 'C_Yukyu'
  | 'D_Name'
  | 'E_Code'
  | 'F_CarNumber'
  | 'H_TougetsuUnchinZandaka'
  | 'I_KyuyuRyo'
  | 'J_ssTanka'
  | 'K_TougutsuNenryoDai'
  | 'L_Senshakiryo'
  | 'M_Half'
  | 'N_Kosukudai'
  | 'O_YukyuHoten'
  | 'P_Other1'
  | 'Q_Other2'
  | 'R_Total'
  | 'S_Shokuhi'
  | 'T_MaebaraiKin'
  | 'U_Kosukudai'
  | 'V_Syukaku'
  | 'W_Misyu'
  | 'X_UriageSonshitsu'
  | 'Y_Car'
  | 'Z_hoken'
  | 'AA_Yushi'
  | 'AB_EigyoSonshitsu'
  | 'AC_EigyoSonshitsuRitsu'
  | 'AD_Rate'

export type KyuyoSanteiRecord = {
  user: User
  keyValue: {
    [key in KyuyoSanteiRecordKey]: tbmTableKeyValue
  }
}

export const fetchKyuyoSanteiData = async ({whereQuery, tbmBaseId}) => {
  const {userList, monthlyTbmDriveList} = await fetchEigyoshoUriageData({
    whereQuery,
    tbmBaseId,
  })

  const yearMonth = whereQuery.gte ?? getMidnight()

  const {TbmBase_MonthConfig} = await getTbmBase_MonthConfig({yearMonth, tbmBaseId})

  const userListWithCarHistory = await fetchRuisekiKyoriKichoData({
    tbmBaseId,
    whereQuery,
    TbmBase_MonthConfig,
  })

  const carWashHistory = await prisma.tbmCarWashHistory.groupBy({
    by: [`userId`],
    where: {
      TbmVehicle: {tbmBaseId},
      userId: {in: userList.map(user => user.id)},
      date: {gte: whereQuery?.gte, lte: whereQuery?.lte},
    },
    _sum: {price: true},
  })

  const {result: kyuyoTableRecord} = await doStandardPrisma(`kyuyoTableRecord`, `findMany`, {
    where: {
      User: {tbmBaseId},
      yearMonth,
    },
  })

  // UserWorkStatusから出勤日数・有給休暇を集計
  const userWorkStatusList = await prisma.userWorkStatus.findMany({
    where: {
      User: {tbmBaseId},
      date: {gte: whereQuery?.gte, lte: whereQuery?.lte},
    },
  })

  const KyuyoSanteiRecords: KyuyoSanteiRecord[] = userList.map(user => {
    const myKyuyoTableRecord = kyuyoTableRecord.find(record => record.userId === user.id)

    // userListWithCarHistoryからTbmVehicleを含むユーザー情報を取得
    const userWithCarHistoryData = userListWithCarHistory.find(data => data.user.id === user.id)

    // 該当ユーザーのすべての運行実績をフィルタ（すべての車両を含む）
    const userSchedule = monthlyTbmDriveList.filter(row => {
      const {schedule} = row
      return schedule.User?.id === user.id
    })

    // 運行実績から直接集計（すべての車両の合計）
    const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(userSchedule, dataKey)

    // 累積距離基準データをフィルタ（すべての車両を含む）
    const userWithCarHistory = userListWithCarHistory.filter(data => data.user.id === user.id)

    const RUISEKI_SUM = (dataKey: carHistoryKey) => {
      if (userWithCarHistory.length === 0) return 0
      return userWithCarHistory.reduce((acc, obj) => {
        const value = obj.allCars.reduce((acc, cur) => {
          // fuelDataがundefinedの場合でもデフォルト値0を使用
          const val = cur[dataKey] ?? 0
          return acc + (Number(val) ?? 0)
        }, 0)
        return acc + (Number(value) ?? 0)
      }, 0)
    }

    // 洗車機料を集計（ユーザーごとの合計）
    const carWashSum = carWashHistory.find(d => d.userId === user.id)?._sum?.price ?? 0

    // メインの車両を取得（ユーザーに紐づく車両）
    const myVehicleList = userWithCarHistoryData?.allCars ?? []

    // 出勤日数・有給休暇を集計
    const userWorkStatusForUser = userWorkStatusList.filter(ws => ws.userId === user.id)
    let shukkinCount = 0
    let yukyuCount = 0

    userWorkStatusForUser.forEach(ws => {
      if (!ws.workStatus) return
      const workStatusKbn = Object.values(TBM_CODE.WORK_STATUS_KBN).find(kbn => kbn.code === ws.workStatus)
      if (workStatusKbn) {
        if (workStatusKbn.countAs?.includes('shukkin')) {
          shukkinCount++
        }
        if (workStatusKbn.countAs?.includes('yukyu')) {
          yukyuCount++
        }
      }
    })

    const B_shukkin = shukkinCount
    const C_yukyu = yukyuCount
    const H_tougetsuUnchinZandaka = MEIAI_SUM(`R_JomuinUnchin`)
    const I_kyuyuRyo = RUISEKI_SUM(`sokyuyuRyoInPeriod`)
    const J_ssTanka = TbmBase_MonthConfig?.keiyuPerLiter ?? 0
    const K_tougutsuNenryoDai = RUISEKI_SUM(`fuelCostInPeriod`)
    const L_senshakiryo = carWashSum
    const AD_rate = myKyuyoTableRecord?.rate ?? 0.5
    const M_half = (H_tougetsuUnchinZandaka - K_tougutsuNenryoDai) * AD_rate
    const N_kosukudai = MEIAI_SUM(`S_jomuinFutan`)
    const O_yukyuHoten = 8800 * B_shukkin
    const P_other1 = myKyuyoTableRecord?.other1 ?? 0
    const Q_other2 = myKyuyoTableRecord?.other2 ?? 0
    const R_total = M_half - N_kosukudai + O_yukyuHoten + P_other1 + Q_other2
    const S_shokuhi = myKyuyoTableRecord?.shokuhi ?? 0
    const T_maebaraiKin = myKyuyoTableRecord?.maebaraiKin ?? 0
    const U_kosukudai = MEIAI_SUM(`U_general`)
    const V_syukaku = 2000 * (B_shukkin + C_yukyu)
    const W_misyu = H_tougetsuUnchinZandaka - K_tougutsuNenryoDai - M_half - P_other1 - Q_other2

    // 車両関連費用（String型を数値変換）
    const parseVehicleCost = (value: string | null | undefined): number => {
      if (!value) return 0

      return isNaN(Number(value)) ? 0 : Number(value)
    }

    const Y_car = myVehicleList.reduce((acc, obj) => {
      return acc + (parseVehicleCost(obj.car.maintenance) ?? 0)
    }, 0)
    const Z_hoken = myVehicleList.reduce((acc, obj) => {
      return acc + (parseVehicleCost(obj.car.insurance) ?? 0)
    }, 0)
    const AA_yushi = myVehicleList.reduce((acc, obj) => {
      return acc + (parseVehicleCost(obj.car.oilTireParts) ?? 0)
    }, 0)

    const X_uriageSonshitsu = W_misyu - (Y_car + Z_hoken + AA_yushi)
    const AB_eigyoSonshitsu = X_uriageSonshitsu
    const AC_eigyoSonshitsuRitsu = H_tougetsuUnchinZandaka > 0 ? AB_eigyoSonshitsu / H_tougetsuUnchinZandaka : 0

    const width40 = 40
    const width80 = 80
    const widthBase = 100
    const with160 = 160

    return {
      user,
      keyValue: {
        B_Shukkin: {
          label: '出勤日数',
          cellValue: B_shukkin,
          style: {fontSize: 12, minWidth: width40},
        },
        C_Yukyu: {
          label: '有給休暇',
          cellValue: C_yukyu,
          style: {fontSize: 12, minWidth: width40},
        },
        D_Name: {
          label: '乗務員名',
          cellValue: user.name,
          style: {fontSize: 12, minWidth: width80},
        },
        E_Code: {
          label: 'コード',
          cellValue: user.code ?? '',
          style: {fontSize: 12, minWidth: width40},
        },
        F_CarNumber: {
          label: '車番/車種',
          cellValue: myVehicleList.map(obj => `${obj.car.vehicleNumber} / ${obj.car.type}`).join('\n'),
          style: {fontSize: 12, minWidth: with160},
        },
        H_TougetsuUnchinZandaka: {
          label: '当月運賃高（円）',
          cellValue: H_tougetsuUnchinZandaka,
          style: {fontSize: 12, minWidth: widthBase},
        },
        I_KyuyuRyo: {
          label: '当月給油量（L）',
          cellValue: I_kyuyuRyo,
          style: {fontSize: 12, minWidth: widthBase},
        },
        J_ssTanka: {
          label: '当月ss単価',
          cellValue: J_ssTanka,
          style: {fontSize: 12, minWidth: widthBase},
        },
        K_TougutsuNenryoDai: {
          label: '当月燃料代（円）',
          cellValue: K_tougutsuNenryoDai,
          style: {fontSize: 12, minWidth: widthBase},
        },
        L_Senshakiryo: {
          label: '洗車機料',
          cellValue: L_senshakiryo,
          style: {fontSize: 12, minWidth: widthBase},
        },
        M_Half: {
          label: '（売上-燃料他）*0.5',
          cellValue: M_half,
          style: {fontSize: 12, minWidth: widthBase},
        },
        N_Kosukudai: {
          label: '高速代（円）',
          cellValue: N_kosukudai,
          style: {fontSize: 12, minWidth: widthBase},
        },
        O_YukyuHoten: {
          label: '有給補填',
          cellValue: O_yukyuHoten,
          style: {fontSize: 12, minWidth: widthBase},
        },
        P_Other1: {
          label: 'その他①',
          cellValue: P_other1,
          style: {fontSize: 12, minWidth: widthBase},
        },
        Q_Other2: {
          label: 'その他②',
          cellValue: Q_other2,
          style: {fontSize: 12, minWidth: widthBase},
        },
        R_Total: {
          label: '総支給額　（円）',
          cellValue: R_total,
          style: {fontSize: 12, minWidth: widthBase},
        },
        S_Shokuhi: {
          label: '食費　（円）',
          cellValue: S_shokuhi,
          style: {fontSize: 12, minWidth: widthBase},
        },
        T_MaebaraiKin: {
          label: '前払金　（円）',
          cellValue: T_maebaraiKin,
          style: {fontSize: 12, minWidth: widthBase},
        },
        U_Kosukudai: {
          label: '高速超過負担　　　　（円）',
          cellValue: U_kosukudai,
          style: {fontSize: 12, minWidth: widthBase},
        },
        V_Syukaku: {
          label: '宿泊費　（円）',
          cellValue: V_syukaku,
          style: {fontSize: 12, minWidth: widthBase},
        },
        W_Misyu: {
          label: '明細給与　(円）',
          cellValue: W_misyu,
          style: {fontSize: 12, minWidth: widthBase},
        },
        X_UriageSonshitsu: {
          label: '売上損失利益',
          cellValue: X_uriageSonshitsu,
          style: {fontSize: 12, minWidth: widthBase},
        },
        Y_Car: {
          label: '車両・整備代',
          cellValue: Y_car,
          style: {fontSize: 12, minWidth: widthBase},
        },
        Z_hoken: {
          label: '保険代',
          cellValue: Z_hoken,
          style: {fontSize: 12, minWidth: widthBase},
        },
        AA_Yushi: {
          label: '油脂・タイヤ・備品代',
          cellValue: AA_yushi,
          style: {fontSize: 12, minWidth: widthBase},
        },
        AB_EigyoSonshitsu: {
          label: '営業損失利益',
          cellValue: AB_eigyoSonshitsu,
          style: {fontSize: 12, minWidth: widthBase},
        },
        AC_EigyoSonshitsuRitsu: {
          label: '営業損失利益率',
          cellValue: AC_eigyoSonshitsuRitsu,
          style: {fontSize: 12, minWidth: widthBase},
        },
        AD_Rate: {
          label: '備　考',
          cellValue: AD_rate,
          style: {fontSize: 12, minWidth: widthBase},
        },
      },
    }
  })

  // ユーザー名でソート
  KyuyoSanteiRecords.sort((a, b) => {
    return (a.user.name ?? '').localeCompare(b.user.name ?? '', 'ja')
  })

  return {
    KyuyoSanteiRecords,
  }
}
