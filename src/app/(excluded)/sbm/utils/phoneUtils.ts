/**
 * 電話番号をフォーマットする
 * 桁数に応じて適切なハイフン区切りを行う
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''

  // 数字のみ抽出
  const numbers = phone.replace(/[^0-9]/g, '')

  // 086-251-1356（市外局番3桁、市内局番3桁、加入者番号4桁）や
  // 080-1914-5919（携帯: 3-4-4）などに対応
  if (numbers.length === 11) {
    // 携帯電話: 090-1234-5678, 080-1914-5919
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (numbers.length === 10) {
    // 固定電話（市外局番3桁 or 2桁）
    // 例: 086-251-1356, 03-1234-5678
    // 市外局番3桁（0[1-9]0, 0[1-9][1-9] など）を優先
    if (/^0\d{2}/.test(numbers)) {
      // 3-3-4
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    } else {
      // 2-4-4
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  } else if (numbers.length === 9) {
    // 固定電話（市外局番2桁 or 1桁）
    // 例: 099-12-3456, 0-1234-5678
    // 3-2-4
    if (/^0\d{2}/.test(numbers)) {
      return numbers.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3')
    } else {
      // 1-4-4
      return numbers.replace(/(\d{1})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  }

  // その他の桁数はそのまま返す
  return numbers
}

/**
 * 電話番号から数字のみを抽出する
 */
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  return phone.replace(/[^0-9]/g, '')
}

/**
 * 電話番号入力時の処理
 * 数字のみを許可し、フォーマットを適用する
 */
export const handlePhoneNumberInput = (value: string): string => {
  // 数字のみ抽出
  return value.replace(/[^0-9]/g, '')
}
