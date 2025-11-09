'use server'

import prisma from 'src/lib/prisma'
import {CategorySummary, CategoryDetail} from './getInvoiceData'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

/**
 * 手動編集データを保存
 */
export async function saveInvoiceManualEdit({
  tbmCustomerId,
  yearMonth,
  summaryByCategory,
  detailsByCategory,
}: {
  tbmCustomerId: number
  yearMonth: Date
  summaryByCategory: CategorySummary[]
  detailsByCategory: CategoryDetail[]
}) {
  const targetMonth = toUtc(new Date(yearMonth.getFullYear(), yearMonth.getMonth() + 1, 1))

  // 既存のレコードを検索（営業所に関係なく）
  const existing = await prisma.tbmInvoiceManualEdit.findFirst({
    where: {
      tbmCustomerId,
      yearMonth: targetMonth,
    },
  })

  if (existing) {
    // 更新
    await prisma.tbmInvoiceManualEdit.update({
      where: {
        id: existing.id,
      },
      data: {
        summary: summaryByCategory as any,
        details: detailsByCategory as any,
      },
    })
  } else {
    // 新規作成（tbmBaseIdはnullまたは最初に見つかった営業所を使用）
    const customer = await prisma.tbmCustomer.findUnique({
      where: {id: tbmCustomerId},
      select: {tbmBaseId: true},
    })

    await prisma.tbmInvoiceManualEdit.create({
      data: {
        ...(customer?.tbmBaseId ? {tbmBaseId: customer.tbmBaseId} : {}),
        tbmCustomerId,
        yearMonth: targetMonth,
        summary: summaryByCategory as any,
        details: detailsByCategory as any,
      },
    })
  }
}

/**
 * 手動編集データを取得
 */
export async function getInvoiceManualEdit({tbmCustomerId, yearMonth}: {tbmCustomerId: number; yearMonth: Date}): Promise<{
  summaryByCategory: CategorySummary[] | null
  detailsByCategory: CategoryDetail[] | null
}> {
  const targetMonth = toUtc(new Date(yearMonth.getFullYear(), yearMonth.getMonth() + 1, 1))

  // 営業所に関係なく、荷主と年月で検索
  const manualEdit = await prisma.tbmInvoiceManualEdit.findFirst({
    where: {
      tbmCustomerId,
      yearMonth: targetMonth,
    },
  })

  if (!manualEdit) {
    return {
      summaryByCategory: null,
      detailsByCategory: null,
    }
  }

  return {
    summaryByCategory: (manualEdit.summary as unknown as CategorySummary[]) || null,
    detailsByCategory: (manualEdit.details as unknown as CategoryDetail[]) || null,
  }
}

/**
 * 手動編集データを削除（配車連動データに戻す）
 */
export async function resetInvoiceManualEdit({tbmCustomerId, yearMonth}: {tbmCustomerId: number; yearMonth: Date}) {
  const targetMonth = toUtc(new Date(yearMonth.getFullYear(), yearMonth.getMonth() + 1, 1))

  // 営業所に関係なく、荷主と年月で削除
  await prisma.tbmInvoiceManualEdit.deleteMany({
    where: {
      tbmCustomerId,
      yearMonth: targetMonth,
    },
  })
}
