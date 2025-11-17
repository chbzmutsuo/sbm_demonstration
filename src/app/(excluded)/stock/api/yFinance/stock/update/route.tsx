import {STOCK_CONST} from '@app/(excluded)/stock/(constants)/STOCK_CONST'
import {jquants__getStockPrice} from '@app/(excluded)/stock/api/jquants-server-actions/jquants-getter'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import prisma from 'src/lib/prisma'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  const today = new Date()

  const threeMonthBefore = Days.month.subtract(today, 3)
  const fourMonthBefore = Days.month.subtract(today, 4)

  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }
  const now = toUtc(new Date())

  const stockList = await prisma.stock.findMany({take: 10})

  const fetchedData: any[] = []
  for (const stock of stockList) {
    const stockRes = await jquants__getStockPrice({
      from: new Days(fourMonthBefore).ymd() ?? '',
      // to: new Days(today).ymd() ?? '',
      code: stock.Code ?? '',
    })
    if (stockRes?.success) {
      const {Code, daily_quotes} = stockRes?.result
      const list = daily_quotes
      const latest = list && list[list?.length - 1]
      fetchedData.push({
        Code: stockRes?.result.Code,
        daily_quotes,
        latest,
      })
    }
  }

  const transactionQueryList = fetchedData
    .map(data => {
      const latest = data.latest

      const stock = stockList.find(stock => stock.Code === data.code)
      if (!stock) return

      const payload = Object.fromEntries(
        Object.entries(latest).filter(([key]) => STOCK_CONST.Y_FINANCE_COLS.some(col => col.en === key))
      )

      const stockHistory_stockId_date_unique = {
        stockId: stock?.id,
        date: now,
      }
      return {
        model: `stockHistory`,
        method: `upsert`,
        queryObject: {
          where: {stockHistory_stockId_date_unique},
          ...createUpdate({...stockHistory_stockId_date_unique, ...payload}),
        },
      }
    })
    .filter(Boolean) as transactionQuery[]

  const res = await doTransaction({transactionQueryList})

  return NextResponse.json({success: true, message: `Updated`, result: res})
}
