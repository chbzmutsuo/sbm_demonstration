'use server'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {getJQUANTS_ID_TOKEN} from '@app/(apps)/stock/api/jquants-server-actions/jquants-auth'
import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'
import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'

export const jquants_getStockList = async urlParams => {
  const token = await getJQUANTS_ID_TOKEN()

  const JQUANTS_API_URL = 'https://api.jquants.com/v1/listed/info'

  const urlParamsString = Object.entries(urlParams)
  const url = `${JQUANTS_API_URL}?${urlParamsString}`
  const result = await fetch(url, {headers: {Authorization: `Bearer ${token}`}}).then(res => res.json())

  return result?.info
}

export const jquants__getStockPrice = async ({
  from,
  to,
  code,
  date,
  pagination_key,
}: {
  from?: string
  to?: string
  code?: string
  date?: string
  pagination_key?: string
}) => {
  const JQUANTS_API_URL = 'https://api.jquants.com/v1/prices/daily_quotes'

  const token = await getJQUANTS_ID_TOKEN()
  if (!token) {
    return {success: false, message: 'JQUANTS_API_TOKENが設定されていません'}
  }

  try {
    const urlParams = {from, to, code, date, pagination_key}
    const urlParamsString = Object.entries(urlParams)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const url = `${JQUANTS_API_URL}?${urlParamsString}`
    const result = await fetch(url, {headers: {Authorization: `Bearer ${token}`}}).then(res => res.json())

    return {success: true, result: {...result, code}, message: '取得に成功しました'}
  } catch (e: any) {
    return {success: false, message: e.message || '取得に失敗しました'}
  }
}

export const upsertStockHistory = async ({date}) => {
  // 銘柄リストをMapに変換してO(1)検索を可能にする
  const stockList = await prisma.stock.findMany({
    select: {id: true, Code: true}, // 必要な列のみ選択
    orderBy: {Code: 'asc'},
  })
  const stockMap = new Map(stockList.map(stock => [stock.Code, stock]))

  const jquants__getHistory = async ({date}) => {
    const dateStr = formatDate(date, 'YYYYMMDD')
    console.log(`${dateStr}の履歴を取得`)

    let continueFlag = true
    let pagination_key = undefined
    let daily_quotes_list: any[] = []
    while (continueFlag) {
      const stockRes = await jquants__getStockPrice({
        date: dateStr,
        pagination_key: pagination_key,
      })
      const {daily_quotes, pagination_key: newPagination_key} = stockRes.result

      daily_quotes_list = [...daily_quotes_list, ...daily_quotes]
      if (newPagination_key) {
        pagination_key = newPagination_key
      } else {
        continueFlag = false
      }
    }

    return {daily_quotes_list}
  }

  const {daily_quotes_list} = await jquants__getHistory({date})
  console.log(`取得した履歴データ数: ${daily_quotes_list.length}`)

  // バッチサイズを小さくしてメモリ使用量を削減
  const BATCH_SIZE = 100
  let processedCount = 0

  for (let i = 0; i < daily_quotes_list.length; i += BATCH_SIZE) {
    const batch = daily_quotes_list.slice(i, i + BATCH_SIZE)
    const transactionQueryList: transactionQuery<any, any>[] = []

    batch.forEach(payload => {
      const theStock = stockMap.get(payload.Code)

      if (theStock && payload.Close !== null) {
        const stockHistory_stockId_Date_unique = {stockId: theStock?.id, Date: toUtc(payload.Date)}

        payload = {...payload, ...stockHistory_stockId_Date_unique}

        const queryData: transactionQuery<any, any> = {
          model: `stockHistory`,
          method: `upsert`,
          queryObject: {
            where: {stockHistory_stockId_Date_unique},
            ...createUpdate({
              ...payload,
              TurnoverValue: payload.TurnoverValue?.toString(), //桁が大きすぎる
            }),
          },
        }

        const lastObject = Object.fromEntries(
          Object.entries(payload).map(([key, value]) => {
            const newKey = `last_${key}`
            if (key === 'TurnoverValue') {
              return [newKey, value?.toString()]
            }
            if (key === 'Code' || key === 'stockId') {
              return [newKey, undefined]
            }
            return [newKey, value]
          })
        )

        const queryDataForStock: transactionQuery<any, any> = {
          model: `stock`,
          method: `upsert`,
          queryObject: {
            where: {id: theStock?.id ?? 0},
            ...createUpdate({Code: theStock?.Code, ...lastObject}),
          },
        }

        transactionQueryList.push(queryData)
        transactionQueryList.push(queryDataForStock)
      }
    })

    if (transactionQueryList.length > 0) {
      await processBatchWithRetry({
        soruceList: transactionQueryList,
        mainProcess: async batch => {
          await doTransaction({transactionQueryList: batch})
        },
      })

      processedCount += batch.length
    }

    // メモリ解放のための明示的なガベージコレクション促進
    if (global.gc) {
      global.gc()
    }
  }

  return {success: true, message: `バッチ処理が完了しました。${processedCount}件のデータを処理しました。`}
}

export const updateAlgorithm = async ({date}) => {
  const config = await getStockConfig()
  const dateStr = formatDate(date, 'YYYYMMDD')
  console.log(`${dateStr}のバロメータを更新`)

  // 銘柄数を取得
  const stockCount = await prisma.stock.count()
  console.log(`処理対象銘柄数: ${stockCount}`)

  const BATCH_SIZE = 100 // バッチサイズを小さくしてメモリ使用量を削減
  let processedCount = 0
  let totalTransactions = 0

  // バッチ処理でメモリ使用量を削減
  for (let offset = 0; offset < stockCount; offset += BATCH_SIZE) {
    // 小さなバッチで銘柄を取得
    const stockBatch = await prisma.stock.findMany({
      skip: offset,
      take: BATCH_SIZE,
      orderBy: {Code: 'asc'},
      include: {
        StockHistory: {
          orderBy: {Date: 'desc'},
          take: 60, // 150から60に削減（必要最小限）
          where: {Close: {not: null}}, // null値を除外してデータ量削減
        },
      },
    })

    const transactionQueryList: transactionQuery<any, any>[] = []

    stockBatch.forEach(stock => {
      // StockHistoryが不十分な場合はスキップ
      if (!stock.StockHistory || stock.StockHistory.length < 2) {
        return
      }

      const StockInst = new StockCl(stock, config)
      const {barometer, riseRate, prices} = StockInst

      // 銘柄本体の更新
      const last_Barometer = Object.fromEntries(
        Object.entries(barometer).map(([key, value]) => {
          return [`last_${key}`, value]
        })
      )

      // StockHistory更新も有効化
      const latestHistory = StockInst.latest
      if (latestHistory) {
        const stockHistory_stockId_Date_unique = {stockId: stock?.id, Date: latestHistory.Date}
        const stockHistoryQueryData: transactionQuery<any, any> = {
          model: `stockHistory`,
          method: `upsert`,
          queryObject: {
            where: {stockHistory_stockId_Date_unique},
            ...createUpdate({
              Code: stock.Code,
              ...stockHistory_stockId_Date_unique,
              riseRate,
              ...barometer,
            }),
          },
        }

        transactionQueryList.push(stockHistoryQueryData)
      }

      const stockQueryData: transactionQuery<any, any> = {
        model: `stock`,
        method: `upsert`,
        queryObject: {
          where: {id: stock.id},
          ...createUpdate({
            Code: stock.Code,
            ...last_Barometer,
            profit: prices.profit ?? 0,
          }),
        },
      }

      transactionQueryList.push(stockQueryData)
    })

    // バッチごとに即座に実行してメモリを解放
    if (transactionQueryList.length > 0) {
      await processBatchWithRetry({
        soruceList: transactionQueryList,
        mainProcess: async batch => {
          await doTransaction({transactionQueryList: batch})
        },
      })

      totalTransactions += transactionQueryList.length
      processedCount += stockBatch.length
    }

    // メモリ解放のための明示的なガベージコレクション促進
    if (global.gc) {
      global.gc()
    }
  }

  return {
    success: true,
    message: `${dateStr}のバロメータを更新しました。${processedCount}銘柄、${totalTransactions}件のトランザクションを実行しました。`,
  }
}
