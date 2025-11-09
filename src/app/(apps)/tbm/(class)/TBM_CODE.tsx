import {Code} from '@cm/class/Code'

export class TBM_CODE {
  static VEHICLE_MAINTANANCE_RECORD_TYPE = new Code({
    SANTEN: {code: '01', label: `3ヶ月点検`},
    SHAKEN: {code: '02', label: `車検`, color: `red`},
    REPAIR: {code: '03', label: `一般修理`, color: `red`},
    PLATE_HENKO: {code: '04', label: `プレート変更`, color: `red`},
  })

  static ROUTE_KBN = new Code({
    KITEI_CHIIKINAI: {code: '01', label: `既定（地域内）`, color: `green`},
    KITEI_CHIIKAGA: {code: '02', label: `既定（地域間）`, color: `green`},
    LINJI_CHIIKINA: {code: '03', label: `臨時（地域内）`, color: `red`},
    LINJI_CHIIKAGA: {code: '04', label: `臨時（地域間）`, color: `red`},
    CHIIKINA: {code: '05', label: `増設（地域内）`, color: `blue`},
    CHIIKAGA: {code: '06', label: `増設（地域間）`, color: `blue`},
    KOKUSAI: {code: '07', label: `航空`, color: `orange`},
    CHIIKIN: {code: '08', label: `一般`, color: `gray`},
    RINEN: {code: '09', label: `リネン`, color: `gray`},
    FOLDING: {code: '10', label: `折り込み`, color: `gray`},
    LPG: {code: '11', label: `LPG`, color: `gray`},
    OTHER: {code: '12', label: `その他`, color: `gray`},
  })
  static USER_TYPE = new Code({
    CHIIKIN: {code: '01', label: `一般`, color: `gray`},
    WETAKU: {code: '02', label: `委託用`, color: `red`},
  })

  static WORK_STATUS_KBN = new Code({
    SHUKKIN: {
      code: '01',
      label: `出勤`,
      countAs: [`shukkin`],
    },
    KONKYU: {
      code: '02',
      label: `公休`,
      countAs: [],
    },

    KYUJITSU_SHUKKIN: {
      code: '03',
      label: `休日出勤`,
      countAs: [`shukkin`],
    },

    YUKYU: {
      code: '04',
      label: `有給休暇`,
      countAs: [`yukyu`],
    },

    KEKKIN: {
      code: '05',
      label: `欠勤`,
      countAs: [],
    },

    SOUTAI: {
      code: '06',
      label: `早退`,
      countAs: [],
    },
  })
}
