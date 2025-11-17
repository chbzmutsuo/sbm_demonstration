// 金額フォーマット
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount)
}

// 日付フォーマット
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP')
}

// 日時フォーマット
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('ja-JP')
}

// ファイルサイズフォーマット
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Base64画像をData URLに変換
export const base64ToDataUrl = (base64: string, mimeType = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${base64}`
}

// ファイルをBase64に変換
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      const base64Data = result.split(',')[1] // data:image/jpeg;base64, を除去
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 複数ファイルをBase64に変換
export const filesToBase64 = async (files: File[]): Promise<string[]> => {
  const promises = files.map(file => fileToBase64(file))
  return Promise.all(promises)
}

// 画像ファイルのみをフィルタリング
export const filterImageFiles = (files: File[]): File[] => {
  return files.filter(file => file.type.startsWith('image/'))
}

// フォームフィールドのクラス名を生成（ハイライト用）
export const getFieldClassName = (value: string | number | string[], required = false): string => {
  const baseClass = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  if (required) {
    const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
    return hasValue ? `${baseClass} border-green-300 bg-green-50` : `${baseClass} border-red-300 bg-red-50`
  }

  const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
  return hasValue ? `${baseClass} border-blue-300 bg-blue-50` : `${baseClass} border-gray-300`
}

// 配列から重複を除去
export const uniqueArray = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

// 空の値をフィルタリング
export const filterEmpty = <T>(array: (T | null | undefined)[]): T[] => {
  return array.filter((item): item is T => item != null)
}

// 遅延実行
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// エラーメッセージの標準化
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '予期しないエラーが発生しました'
}

// 今日の日付をYYYY-MM-DD形式で取得
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]
}

// 文字列を安全にJSONパース
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

// オブジェクトから空の値を除去
export const removeEmptyValues = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const result: Partial<T> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== '' && value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        ;(result as any)[key] = value
      } else if (!Array.isArray(value)) {
        ;(result as any)[key] = value
      }
    }
  }

  return result
}
