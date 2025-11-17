import {getMidnight} from '@cm/class/Days/date-utils/calculations'

const today = getMidnight()
export class ProductCl {
  data: ProductType
  constructor(data: ProductType) {
    if (!data?.SbmProductPriceHistory) {
      // throw new Error('SbmProductPriceHistory is undefined')
    }
    this.data = data
  }
  get currentPrice() {
    // 今日以降で最も新しい価格を取得
    const target = this.data.SbmProductPriceHistory?.sort(
      (a, b) => new Date(b.effectiveDate ?? new Date()).getTime() - new Date(a.effectiveDate ?? new Date()).getTime()
    ).filter(h => h.effectiveDate && new Date(h.effectiveDate).getTime() <= today.getTime())

    return target?.[0]?.price || 0
  }
  get currentCost() {
    // 今日以降で最も新しい原価を取得
    const today = new Date()
    const target = this.data.SbmProductPriceHistory?.filter(
      h => h.effectiveDate && new Date(h.effectiveDate).getTime() <= today.getTime()
    ).sort((a, b) => new Date(b.effectiveDate ?? new Date()).getTime() - new Date(a.effectiveDate ?? new Date()).getTime())[0]
    return target?.cost || 0
  }
}
