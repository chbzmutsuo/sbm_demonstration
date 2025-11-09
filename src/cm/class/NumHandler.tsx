import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'

export class NumHandler {
  // 数値を3桁ごとの小数点表記のStringに変換する
  static toLocaleStr = (value: number) => {
    if (value) {
      // value = value.toLocaleString();
      return value.toLocaleString()
    } else {
      return value
    }
  }

  static withPlusMinus = (value: number) => {
    return value > 0 ? '+' + value.toLocaleString() : value.toLocaleString()
  }

  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  static toPrice(value) {
    if (value) {
      value = DH__convertDataType(value, 'price').toLocaleString()
      return value
    } else {
      return value
    }
  }

  static round = (value?: number, decimalPoint = 1, mode: 'ceil' | 'floor' | 'round' = 'round') => {
    if (!value) {
      return 0
    }
    const multiplier = 10 ** decimalPoint
    switch (mode) {
      case 'ceil':
        return Math.ceil(value * multiplier) / multiplier
      case 'floor':
        return Math.floor(value * multiplier) / multiplier
      case 'round':
      default:
        return Math.round(value * multiplier) / multiplier
    }
  }
  static WithUnit = (value: number, unit?: string, decimalPoint = 0) =>
    value && NumHandler.toPrice(NumHandler.round(value, decimalPoint)) + (unit ?? '')

  static addPlusMinus(num) {
    let prefix = ''

    if (num > 0) {
      prefix = '+'
    }
    if (num < 0) {
      prefix = ''
    }

    return prefix + num
  }
}
