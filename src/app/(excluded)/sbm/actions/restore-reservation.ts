'use server'

import prisma from 'src/lib/prisma'

type changeHistoryObject = {
  [key: string]: any
}

/**
 * 取り消された予約を復活させる
 * @param id 予約ID
 * @param userId 復活処理を行うユーザーID
 */
export const restoreReservation = async (id: number, userId: number): Promise<{success: boolean; error?: string}> => {
  try {
    // 予約の存在確認
    const reservation = await prisma.sbmReservation.findUnique({
      where: {id},
    })

    if (!reservation) {
      return {success: false, error: '予約が見つかりません'}
    }

    // キャンセルされていない場合はエラー
    if (!reservation.isCanceled) {
      return {success: false, error: 'この予約はキャンセルされていません'}
    }

    // トランザクションで処理
    await prisma.$transaction(async tx => {
      // 予約を復活（isCanceled = false に設定）
      await tx.sbmReservation.update({
        where: {id},
        data: {
          isCanceled: false,
          canceledAt: null,
          cancelReason: null,
        },
      })

      // 変更履歴に記録
      await tx.sbmReservationChangeHistory.create({
        data: {
          userId,
          sbmReservationId: id,
          changeType: 'restore', // 復活専用のタイプ
          changedFields: ['isCanceled', 'canceledAt', 'cancelReason'],
          oldValues: {
            isCanceled: true,
            canceledAt: reservation.canceledAt,
            cancelReason: reservation.cancelReason,
          } as changeHistoryObject,
          newValues: {
            isCanceled: false,
            canceledAt: null,
            cancelReason: null,
          } as changeHistoryObject,
        },
      })
    })

    return {success: true}
  } catch (error) {
    console.error('予約復活エラー:', error)
    return {success: false, error: '予約の復活に失敗しました'}
  }
}
