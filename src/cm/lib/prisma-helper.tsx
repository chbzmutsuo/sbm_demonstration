import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'

import {isDev} from '@cm/lib/methods/common'

/**
 * Prismaエラーコードの型定義
 */
type PrismaErrorCode = 'P2025' | 'P2002' | 'P2003' | 'P2016' | 'P2017' | 'P2018' | 'P2019' | string

/**
 * Prismaエラーメタデータの型定義
 */
interface PrismaErrorMeta {
  target?: string[]
  field_name?: string
  constraint?: string
  cause?: string
  model_name?: string
}

/**
 * Prismaエラーオブジェクトの型定義
 */
interface PrismaError {
  code?: PrismaErrorCode
  message: string
  meta?: PrismaErrorMeta
}

const METHOD_MESSAGES: Record<prismaMethodType, string> = {
  findMany: 'の一覧を取得しました',
  findFirst: 'の詳細を取得しました',
  findUnique: 'の詳細を取得しました',
  upsert: 'を更新しました',
  delete: 'を削除しました',
  deleteMany: 'を一括削除しました',
  update: 'を更新しました',
  updateMany: 'を一括更新しました',
  create: 'を作成しました',
  createMany: 'を一括作成しました',
  groupBy: 'をグループ化しました',
  aggregate: 'を集計しました',
  transaction: 'を更新しました',
  count: 'の件数を取得しました',
} as const

/**
 * フィールドの日本語対応表
 * 実際のプロジェクトのフィールドに合わせて拡張可能
 */
const FIELD_DISPLAY_NAMES: Record<string, string> = {
  // 共通フィールド
  id: 'ID',
  email: 'メールアドレス',
  name: '名前',
  code: 'コード',
  title: 'タイトル',
  createdAt: '作成日時',
  updatedAt: '更新日時',
  // ユーザー関連
  password: 'パスワード',
  role: '権限',
  // その他
  customerNumber: '顧客番号',
  vehicleNumber: '車両番号',
  frameNo: '車台番号',
  // 必要に応じて追加
} as const

/**
 * Prisma操作の成功メッセージを生成する
 * @param model - Prismaモデル名
 * @param method - Prismaメソッド名
 * @returns 成功メッセージ
 */
export const createSuccessMessage = ({model, method}: {model: PrismaModelNames; method: prismaMethodType}): string => {
  // モデル名を小文字に変換
  const normalizedModel = (model?.charAt(0).toLowerCase() + model?.slice(1)) as PrismaModelNames

  const modelDisplayName = 'データ'
  const methodMessage = METHOD_MESSAGES[method] ?? method

  return `${modelDisplayName}${methodMessage}`
}

/**
 * フィールド名の日本語表示名を取得する
 * @param fieldName - フィールド名
 * @returns 日本語表示名
 */
const getFieldDisplayName = (fieldName: string): string => {
  return FIELD_DISPLAY_NAMES[fieldName] ?? fieldName
}

/**
 * モデル名をエラーメッセージから抽出する
 * @param message - エラーメッセージ
 * @returns モデル名（見つからない場合はnull）
 */
const extractModelNameFromMessage = (message: string): string | null => {
  const regex = /No '(\w+)' record\(s\)/
  const match = regex.exec(message)
  return match ? match[1] : null
}

/**
 * 重複エラーのフィールド名リストを日本語に変換する
 * @param fields - フィールド名の配列
 * @returns 日本語表示名のリスト
 */
const formatDuplicateFields = (fields: string[]): string => {
  return fields.map(field => `【${getFieldDisplayName(field)}】`).join('・')
}

/**
 * 外部キー制約エラーの関連モデル名を抽出・表示する
 * @param fieldName - フィールド名または制約名
 * @returns フォーマットされたエラーメッセージ
 */
const formatForeignKeyError = (fieldName?: string): string => {
  if (!fieldName) return '関連データ'

  const parts = fieldName.split('_')
  if (parts.length >= 2) {
    const [modelA, modelB] = parts
    const displayNameA = modelA
    const displayNameB = modelB
    return `${displayNameA}・${displayNameB}`
  }

  return fieldName
}

/**
 * バリデーションエラーメッセージを解析・フォーマットする
 * @param message - エラーメッセージ
 * @returns フォーマットされたエラーメッセージ
 */
const parseValidationError = (message: string): string => {
  // 型エラーのパターン
  const typeErrorRegex = /Argument `(.+)`: Invalid value provided\. Expected (.+), provided (.+)\./
  const typeErrorMatch = typeErrorRegex.exec(message)
  if (typeErrorMatch) {
    const [, fieldName, expectedType] = typeErrorMatch
    const displayName = getFieldDisplayName(fieldName)
    return `${displayName}は${expectedType}型でなければなりません`
  }

  // 必須フィールドエラーのパターン
  const missingFieldRegex = /Argument `(.+)` is missing\./
  const missingFieldMatch = missingFieldRegex.exec(message)
  if (missingFieldMatch) {
    const [, fieldName] = missingFieldMatch
    const displayName = getFieldDisplayName(fieldName)
    return `${displayName}は必ず入力してください`
  }

  return 'データの形式が正しくありません'
}

/**
 * Prismaエラーを日本語のユーザーフレンドリーなメッセージに変換する
 * @param error - Prismaエラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export const handlePrismaError = (error: PrismaError): string => {
  const {code, meta, message} = error

  // エラーコードが存在する場合の処理
  if (code) {
    switch (code) {
      case 'P2025': {
        // レコードが見つからない
        const modelName = extractModelNameFromMessage(message)
        const displayName = modelName ? modelName : 'データ'
        return `必要な${displayName}が見つかりませんでした`
      }

      case 'P2002': {
        // 一意制約違反（重複エラー）
        const duplicatedFields = formatDuplicateFields(meta?.target ?? [])
        const baseMessage = 'データ重複エラー'

        if (isDev && duplicatedFields) {
          return `${baseMessage}: ${duplicatedFields}`
        }
        return baseMessage
      }

      case 'P2003': {
        // 外部キー制約違反
        const relationInfo = formatForeignKeyError(meta?.field_name ?? meta?.constraint)
        return `関連データエラー: ${relationInfo}の関連性に問題があります`
      }

      case 'P2016': {
        // クエリ解釈エラー
        return 'データ検索条件に問題があります'
      }

      case 'P2017': {
        // レコード接続エラー
        return 'データの関連付けに失敗しました'
      }

      case 'P2018': {
        // 必須関連レコードが見つからない
        return '必須の関連データが見つかりません'
      }

      case 'P2019': {
        // 入力エラー
        return 'データの入力値に問題があります'
      }

      default: {
        const baseMessage = 'データベースで予期しないエラーが発生しました'
        return isDev && code ? `[${code}] ${baseMessage}` : baseMessage
      }
    }
  }

  // エラーコードがない場合のバリデーションエラー処理
  return parseValidationError(message)
}

/**
 * 共通の除外フィールド設定
 * Prismaクエリで一般的に除外されるフィールド
 */
export const COMMON_OMIT_FIELDS = {
  updatedAt: true,
  // 必要に応じて追加
  // password: true,
  // tempResetCode: true,
} as const
