'use server'

import {getTbmBase_MonthConfig} from '@app/(apps)/tbm/(server-actions)/getBasics'
import {EIGYOSHO_URIAGE_SUMORIGIN} from '@app/(apps)/tbm/(lib)/calculation'
import {eigyoshoRecordKey, fetchEigyoshoUriageData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoUriageData'
import {tbmTableKeyValue} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {User} from '@prisma/client'

export type KyuyoRecordKey =
  | 'B_Shukkin'
  | 'C_Yukyu'
  | 'D_Name'
  | 'E_Code'
  | 'F_CarNumber'
  | 'G_CarType'
  | 'H_TougetsuUnchinZandaka'
  | 'I_KyuyuRyo'
  | 'J_ssTanka'
  | 'K_TougutsuNenryoDai'
  | 'L_Senshakiryo'
  | 'M'
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

export type KyuyoRecord = {
  user: User
  keyValue: {
    [key in KyuyoRecordKey]: tbmTableKeyValue
  }
}

const width40 = 40
const width80 = 80
const widthBase = 100
export const getKyuyoTableList = async ({whereQuery, tbmBaseId}) => {
  const {userList, monthlyTbmDriveList, EigyoshoUriageRecords} = await fetchEigyoshoUriageData({whereQuery, tbmBaseId})

  const yearMonth = whereQuery.gte ?? getMidnight()

  const {TbmBase_MonthConfig} = await getTbmBase_MonthConfig({yearMonth, tbmBaseId})

  const {result: kyuyoTableRecord} = await doStandardPrisma(`kyuyoTableRecord`, `findMany`, {
    where: {
      User: {tbmBaseId},
      yearMonth,
    },
  })

  const kyuyoTableList: KyuyoRecord[] = userList.map(item => {
    const myKyuyoTableRecord = kyuyoTableRecord.find(record => record.userId === item.id)

    const MyEigyoshoUriageRecord = EigyoshoUriageRecords.filter(record => record.user.id === item.id) as any

    const EIGYOSHO_URIAGE_SUM = (dataKey: eigyoshoRecordKey) => {
      return EIGYOSHO_URIAGE_SUMORIGIN(MyEigyoshoUriageRecord, dataKey)
    }

    const user = item

    const myVehicle = item.TbmVehicle

    const attendanceDays = 20
    const yukyu = 2
    const P_other1 = myKyuyoTableRecord?.other1 ?? 0
    const Q_other2 = myKyuyoTableRecord?.other2 ?? 0

    const kosokuChokafutan = EIGYOSHO_URIAGE_SUM(`K`)

    const AD_rate = myKyuyoTableRecord?.rate
    const M_half = (EIGYOSHO_URIAGE_SUM(`M_salaryFare`) - EIGYOSHO_URIAGE_SUM(`Q_fuelCost`)) * (AD_rate ?? 1)

    const N_HighwayFee = EIGYOSHO_URIAGE_SUM(`J_highwayMinusFee`)
    const O_YukyuHoten = 8240 * attendanceDays

    const soShikyu = (M_half ?? 0) - (N_HighwayFee ?? 0) + (O_YukyuHoten ?? 0) + (P_other1 ?? 0) + (Q_other2 ?? 0)

    return {
      user,
      keyValue: {
        B_Shukkin: {
          label: '稼働日数',
          cellValue: attendanceDays,
          style: {fontSize: 12, minWidth: width40},
        },
        C_Yukyu: {
          label: '有給休暇',
          cellValue: yukyu, // TODO: 有給休暇の計算ロジックを実装
          style: {fontSize: 12, minWidth: width40},
        },
        D_Name: {
          label: '乗務員名',
          cellValue: user.name,
          style: {fontSize: 12, minWidth: width80},
        },

        E_Code: {
          label: 'コード',
          cellValue: user.code,
          style: {fontSize: 12, minWidth: width40},
        },
        F_CarNumber: {
          label: '車番',
          cellValue: myVehicle?.vehicleNumber ?? '',
          style: {fontSize: 12, minWidth: width80},
        },
        G_CarType: {
          label: '車種',
          cellValue: myVehicle?.type ?? '',
          style: {fontSize: 12, minWidth: width80},
        },

        // =================ここから==========
        H_TougetsuUnchinZandaka: {
          label: '当月運賃高(円)',
          cellValue: EIGYOSHO_URIAGE_SUM(`M_salaryFare`),
          style: {fontSize: 12, minWidth: widthBase},
        },

        I_KyuyuRyo: {
          label: '給油量（L）',
          cellValue: EIGYOSHO_URIAGE_SUM(`P_fuelUsage`),
          style: {fontSize: 12, minWidth: widthBase},
        },
        J_ssTanka: {
          label: 'ss単価',
          cellValue: TbmBase_MonthConfig?.keiyuPerLiter ?? 0, // TODO: ss単価の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },

        K_TougutsuNenryoDai: {
          label: '当月燃料代',
          cellValue: EIGYOSHO_URIAGE_SUM(`Q_fuelCost`),
          style: {fontSize: 12, minWidth: widthBase},
        },

        L_Senshakiryo: {
          label: '洗車機料',
          cellValue: EIGYOSHO_URIAGE_SUM(`R_carWash`),
          style: {fontSize: 12, minWidth: widthBase},
        },

        M: {
          label: '(運賃-燃料)*0.5',
          cellValue: M_half,
          style: {fontSize: 12, minWidth: widthBase},
        },
        N_Kosukudai: {
          label: '高速代',
          cellValue: N_HighwayFee,
          style: {fontSize: 12, minWidth: widthBase},
        },
        O_YukyuHoten: {
          label: '有給補填',
          cellValue: O_YukyuHoten, // TODO: 有給補填の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },
        P_Other1: {
          label: 'その他①',
          cellValue: myKyuyoTableRecord?.[`other1`],
          style: {fontSize: 12, minWidth: widthBase},
        },
        Q_Other2: {
          label: 'その他②',
          cellValue: myKyuyoTableRecord?.[`other2`],
          style: {fontSize: 12, minWidth: widthBase},
        },
        R_Total: {
          label: '総支給額　（円）',
          cellValue: soShikyu, // TODO: 総支給額の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },
        S_Shokuhi: {
          label: '食費（円）',
          cellValue: myKyuyoTableRecord?.[`shokuhi`],
          style: {fontSize: 12, minWidth: widthBase},
        },
        T_MaebaraiKin: {
          label: '前払金（円）',
          cellValue: myKyuyoTableRecord?.[`maebaraiKin`],
          style: {fontSize: 12, minWidth: widthBase},
        },
        U_Kosukudai: {
          label: '高速超過負担（円）',
          cellValue: kosokuChokafutan,
          style: {fontSize: 12, minWidth: widthBase},
        },
        V_Syukaku: {
          label: '宿泊費（円）',
          cellValue: (attendanceDays + yukyu) * 2000,
          style: {fontSize: 12, minWidth: widthBase},
        },
        W_Misyu: {
          label: '明細給与(円）',
          cellValue: 0, // TODO: 明細給与の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },
        X_UriageSonshitsu: {
          label: '売上損失利益',
          cellValue: 0, // TODO: 売上損失利益の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },
        Y_Car: {
          label: '車両・整備代',
          cellValue: 0,
          style: {fontSize: 12, minWidth: widthBase},
        },
        Z_hoken: {
          label: '保険代',
          cellValue: 0,
          style: {fontSize: 12, minWidth: widthBase},
        },
        AA_Yushi: {
          label: '油脂・タイヤ・備品代',
          cellValue: 0,
          style: {fontSize: 12, minWidth: widthBase},
        },
        AB_EigyoSonshitsu: {
          label: '営業損失利益',
          cellValue: 0, // TODO: 営業損失利益の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },
        AC_EigyoSonshitsuRitsu: {
          label: '営業損失利益率',
          cellValue: 0, // TODO: 営業損失利益率の計算ロジックを実装
          style: {fontSize: 12, minWidth: widthBase},
        },
        AD_Rate: {
          label: '備考',
          cellValue: myKyuyoTableRecord?.[`rate`],
          style: {fontSize: 12, minWidth: widthBase},
        },
      },
    }
  })

  return {kyuyoTableList}
}
