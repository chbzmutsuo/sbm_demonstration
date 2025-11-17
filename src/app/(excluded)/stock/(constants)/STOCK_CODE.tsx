import {Code} from '@cm/class/Code'

export class STOCK_CODE extends Code {
  static COLOR = new Code({
    rise: {code: '01', label: `上昇`, color: `red`},
    fall: {code: '02', label: `下降`, color: `blue`},
  })
  static STOCK_CONFIG_TYPE = new Code({
    rise: {code: '01', label: `上昇`},
    fall: {code: '02', label: `下降`},
    crash: {code: '03', label: `クラッシュ`},
  })
  static STOCK_CONFIG_NAME = new Code({
    period: {code: '01', label: `期間(日)`},
    threshold: {code: '02', label: `閾値(%)`},
  })
}
