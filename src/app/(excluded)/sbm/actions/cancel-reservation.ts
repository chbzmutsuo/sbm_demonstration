'use server'

import prisma from 'src/lib/prisma'

type changeHistoryObject = {
  [key: string]: any
}

/**
 * 予約を取り消す（ソフトデリート）
 * @param id 予約ID

 * @param reason 取り消し理由
 */
export const cancelReservation = async (
  id: number,
  reason: string,
  userId: number
): Promise<{success: boolean; error?: string}> => {
  try {
    // 予約の存在確認
    const reservation = await prisma.sbmReservation.findUnique({
      where: {id},
      include: {
        SbmReservationItem: true,
      },
    })

    if (!reservation) {
      return {success: false, error: '予約が見つかりません'}
    }

    // 既にキャンセル済みかチェック
    if (reservation.isCanceled) {
      return {success: false, error: 'この予約は既にキャンセルされています'}
    }

    // 予約データをJSON形式に変換
    const reservationData: changeHistoryObject = {
      ...reservation,
      items: reservation.SbmReservationItem.map(item => ({
        id: item.id,
        sbmReservationId: item.sbmReservationId,
        sbmProductId: item.sbmProductId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    }

    // トランザクションで処理
    await prisma.$transaction(async tx => {
      // 予約をソフトデリート（isCanceled = true に設定）
      await tx.sbmReservation.update({
        where: {id},
        data: {
          isCanceled: true,
          canceledAt: new Date(),

          cancelReason: reason,
        },
      })

      // 変更履歴に記録
      await tx.sbmReservationChangeHistory.create({
        data: {
          userId,

          sbmReservationId: id,
          changeType: 'cancel', // キャンセル専用のタイプ
          changedFields: ['isCanceled', 'canceledAt', 'cancelReason'],
          oldValues: {
            isCanceled: false,
            canceledAt: null,

            cancelReason: null,
          } as changeHistoryObject,
          newValues: {
            isCanceled: true,
            canceledAt: new Date(),

            cancelReason: reason,
            reservationData: reservationData,
          } as changeHistoryObject,
        },
      })
    })

    return {success: true}
  } catch (error) {
    console.error('予約キャンセルエラー:', error)
    return {success: false, error: '予約のキャンセルに失敗しました'}
  }
}

/**
 * 取り消された予約も含めて予約を取得する
 * キャンセル済みの予約はisCanceledフラグで判別できる
 */
export async function getReservationsWithCanceled(filter: any = {}) {
  try {
    const where: any = {...filter}

    // キャンセルされた予約も含める（デフォルトではキャンセルされた予約も含む）
    // where.isCanceled = false のように明示的に指定されていない限り、全て取得

    const reservations = await prisma.sbmReservation.findMany({
      where,
      include: {
        SbmCustomer: {
          include: {
            SbmCustomerPhone: true,
          },
        },
        SbmReservationItem: true,
        SbmReservationChangeHistory: {
          orderBy: {changedAt: 'desc'},
          take: 10,
        },
      },
      orderBy: {deliveryDate: 'desc'},
    })

    return reservations.map(r => ({
      id: r.id,
      sbmCustomerId: r.sbmCustomerId,
      customerName: r.customerName,
      contactName: r.contactName || '',
      postalCode: r.postalCode,
      prefecture: r.prefecture,
      city: r.city,
      street: r.street,
      building: r.building,
      deliveryDate: r.deliveryDate,
      pickupLocation: r.pickupLocation as '配達' | '店舗受取',
      purpose: r.purpose as '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他',
      paymentMethod: r.paymentMethod as '現金' | '銀行振込' | '請求書' | 'クレジットカード',
      orderChannel: r.orderChannel as '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他',
      totalAmount: r.totalAmount,
      pointsUsed: r.pointsUsed,
      finalAmount: r.finalAmount,
      orderStaff: r.orderStaff,
      userId: r.userId,
      notes: r.notes || '',
      deliveryCompleted: r.deliveryCompleted,
      recoveryCompleted: r.recoveryCompleted,
      // キャンセル関連情報
      isCanceled: r.isCanceled,
      canceledAt: r.canceledAt,

      cancelReason: r.cancelReason || '',

      phones: r.SbmCustomer.SbmCustomerPhone.map(phone => ({
        id: phone.id,
        sbmCustomerId: phone.sbmCustomerId,
        phoneNumber: phone.phoneNumber,
        label: phone.label,
      })),

      items: r.SbmReservationItem.map(item => ({
        id: item.id,
        sbmReservationId: item.sbmReservationId,
        sbmProductId: item.sbmProductId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),

      changeHistory: r.SbmReservationChangeHistory.map(ch => ({
        id: ch.id,
        userId: ch.userId,
        sbmReservationId: ch.sbmReservationId,
        changeType: ch.changeType as 'create' | 'update' | 'delete' | 'cancel' | 'restore',
        changedAt: ch.changedAt,
        changedFields: (ch.changedFields as Record<string, any>) || {},
        oldValues: (ch.oldValues as Record<string, any>) || {},
        newValues: (ch.newValues as Record<string, any>) || {},
      })),

      updatedAt: r.updatedAt,
    }))
  } catch (error) {
    console.error('予約取得エラー:', error)
    return []
  }
}
