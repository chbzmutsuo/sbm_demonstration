// MoneyForward税区分の選択肢
export const TAX_CATEGORIES = [
  {value: '', label: '選択してください'},
  {value: '課仕 10%', label: '課仕 10%（標準税率）'},
  {value: '課仕 8%', label: '課仕 8%（軽減税率）'},
  {value: '課対仕入', label: '課対仕入'},
  {value: '非課税仕入', label: '非課税仕入'},
  {value: '不課税仕入', label: '不課税仕入'},
  {value: '対象外', label: '対象外'},
] as const

export type TaxCategoryValue = (typeof TAX_CATEGORIES)[number]['value']

export const KEIHI_STATUS = [
  {value: '未設定', label: '未設定'},
  {value: '私的利用', label: '私的利用'},
  {value: '一次チェック済', label: '一次チェック済'},
] as const

export type StatusValue = (typeof KEIHI_STATUS)[number]['value']
