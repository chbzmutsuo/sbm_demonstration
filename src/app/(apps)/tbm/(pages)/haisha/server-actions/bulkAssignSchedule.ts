'use server'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'

interface BulkAssignParams {
  tbmBaseId: number
  tbmRouteGroupId: number
  userId: number | null
  tbmVehicleId: number | null
  dates: Date[]
}

/**
 * 複数日に対して一括で配車スケジュールを割り当てるサーバーアクション
 *
 * @param params 一括割り当てパラメータ
 * @returns 処理結果
 */
export async function bulkAssignSchedule(params: BulkAssignParams) {
  const {tbmBaseId, tbmRouteGroupId, userId, tbmVehicleId, dates} = params

  // パラメータチェック
  if (!tbmBaseId || !tbmRouteGroupId) {
    return {
      success: false,
      message: '必要なパラメータが不足しています',
    }
  }

  // 日付が指定されていない場合はエラー
  if (!dates || dates.length === 0) {
    return {
      success: false,
      message: '日付が選択されていません',
    }
  }

  try {
    // 選択された日付をUTC 0時に正規化
    const normalizedDates = dates.map(date => getMidnight(date))

    // 日付文字列の配列を作成（クエリ用）
    const dateStrings = normalizedDates.map(date => formatDate(date, 'YYYY-MM-DD'))

    // 既存のスケジュールを取得
    const existingSchedules = await prisma.tbmDriveSchedule.findMany({
      where: {
        tbmRouteGroupId,
        date: {
          in: normalizedDates,
        },
      },
    })

    // 既存スケジュールのマップを作成（日付文字列 -> スケジュールID）
    const existingScheduleMap = existingSchedules.reduce(
      (acc, schedule) => {
        acc[formatDate(schedule.date, 'YYYY-MM-DD')] = schedule.id
        return acc
      },
      {} as Record<string, number>
    )

    // トランザクションクエリの配列を準備
    const transactionQueries = normalizedDates.map(date => {
      const dateString = formatDate(date, 'YYYY-MM-DD')
      const existingId = existingScheduleMap[dateString]

      // 既存のスケジュールがある場合はIDで更新、ない場合は新規作成
      if (existingId) {
        return {
          model: 'TbmDriveSchedule',
          method: 'update',
          queryObject: {
            where: {
              id: existingId,
            },
            data: {
              ...(userId !== null ? {userId} : {}),
              ...(tbmVehicleId !== null ? {tbmVehicleId} : {}),
            },
          },
        }
      } else {
        return {
          model: 'TbmDriveSchedule',
          method: 'create',
          queryObject: {
            data: {
              date,
              tbmRouteGroupId,
              tbmBaseId,
              ...(userId !== null ? {userId} : {}),
              ...(tbmVehicleId !== null ? {tbmVehicleId} : {}),
              sortOrder: 0,
            },
          },
        }
      }
    })

    // トランザクション実行
    const result = await doTransaction({
      transactionQueryList: transactionQueries as transactionQuery<'tbmDriveSchedule', 'create' | 'update'>[],
    })

    return {
      success: result.success,
      message: result.success ? `${dates.length}件の配車スケジュールを更新しました` : '配車スケジュールの更新に失敗しました',
      result: result.result,
    }
  } catch (error) {
    console.error('一括割り当て処理でエラーが発生しました:', error)
    return {
      success: false,
      message: '一括割り当て処理でエラーが発生しました',
      error,
    }
  }
}
