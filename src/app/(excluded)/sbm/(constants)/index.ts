export type OrderChannelType = '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他'
export type PurposeType = '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他'
export type PaymentMethodType = '現金' | '銀行振込' | '請求書' | 'クレジットカード'
export type PickupLocationType = '配達' | '店舗受取'
// 選択肢定数
export const ORDER_CHANNEL_OPTIONS: OrderChannelType[] = ['電話', 'FAX', 'メール', 'Web', '営業', 'その他']

export const PURPOSE_OPTIONS: PurposeType[] = ['会議', '研修', '接待', 'イベント', '懇親会', 'その他']

export const PAYMENT_METHOD_OPTIONS: PaymentMethodType[] = ['現金', '銀行振込', '請求書', 'クレジットカード']

export const PICKUP_LOCATION_OPTIONS: PickupLocationType[] = ['配達', '店舗受取']

// デフォルト値
export const DEFAULT_RESERVATION_STATE = {
  sbmCustomerId: 0,
  customerName: '',
  contactName: '',
  phoneNumber: '',
  deliveryAddress: '',
  deliveryDate: new Date(),
  orderChannel: '電話' as OrderChannelType,
  purpose: '会議' as PurposeType,
  paymentMethod: '現金' as PaymentMethodType,
  pickupLocation: '配達' as PickupLocationType,
  pointsUsed: 0,
  orderStaff: '',
  notes: '',
  items: [],
  totalAmount: 0,
  finalAmount: 0,
  deliveryCompleted: false,
  recoveryCompleted: false,
}

// RFMスコア計算基準
export const RFM_SCORE_CRITERIA = {
  RECENCY: {
    EXCELLENT: 30, // 30日以内
    GOOD: 60, // 60日以内
    AVERAGE: 90, // 90日以内
    POOR: 180, // 180日以内
  },
  FREQUENCY: {
    EXCELLENT: 10, // 10回以上
    GOOD: 5, // 5回以上
    AVERAGE: 3, // 3回以上
    POOR: 2, // 2回以上
  },
  MONETARY: {
    EXCELLENT: 100000, // 10万円以上
    GOOD: 50000, // 5万円以上
    AVERAGE: 20000, // 2万円以上
    POOR: 5000, // 5千円以上
  },
}

// 印刷設定
export const PRINT_SETTINGS = {
  INVOICES_PER_PAGE: 2, // A4用紙に2伝票
  PAGE_BREAK_CLASS: 'page-break-after',
}

// バリデーション設定
export const VALIDATION = {
  PHONE_NUMBER_REGEX: /^\d{10,11}$/,
  POSTAL_CODE_REGEX: /^\d{7}$/,
  MIN_ORDER_AMOUNT: 500, // 最小注文金額
}

// UI設定
export const UI_SETTINGS = {
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  MODAL_SIZES: {
    SM: 'max-w-sm',
    MD: 'max-w-md',
    LG: 'max-w-lg',
    XL: 'max-w-xl',
    XXL: 'max-w-2xl',
    XXXL: 'max-w-4xl',
  },
}

// 日付設定
export const DATE_SETTINGS = {
  DEFAULT_TIME: '12:00',
  BUSINESS_HOURS_START: '09:00',
  BUSINESS_HOURS_END: '18:00',
}
