'use server'

import {requestResultType} from '@cm/types/types'
import prisma from 'src/lib/prisma'
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import {PrismaClient} from '@prisma/client'

export type transactionQuery<T extends PrismaModelNames = PrismaModelNames, M extends prismaMethodType = prismaMethodType> = {
  model: T
  method: M
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queryObject: Parameters<PrismaClient[T][M]>[0]
  transactiondb?: any
}

type mode = 'transaction' | 'parallel' | 'sequential'
export const doTransaction = async (props: {transactionQueryList: transactionQuery[]; mode?: mode; uniqueKey?: string}) => {
  if (props.transactionQueryList.length === 0) {
    return {success: false, result: [], message: '更新するデータがありません。'}
  }

  const {transactionQueryList, mode = 'parallel'} = props
  const message = `${transactionQueryList.length}件を一括更新しました。`
  const timeKey = [
    //
    props.transactionQueryList[0].model,
    props.uniqueKey ?? new Date().getTime(),
    transactionQueryList.length + '件',
  ]
    .filter(d => d)
    .join('_')

  const errorItemList: (transactionQuery<any, any> & {error: string})[] = []

  try {
    let data: any[] = []
    if (mode === 'transaction') {
      data = await prisma.$transaction(async tx => {
        const promises = transactionQueryList.map(async q => {
          try {
            const {model, method, queryObject} = q
            return await tx[model][method](queryObject)
          } catch (error) {
            errorItemList.push({...q, error: error.message})
            throw new Error(error.message)
          }
        })
        return await Promise.all(promises)
      })
    } else if (mode === 'parallel') {
      const promises = transactionQueryList.map(async q => {
        try {
          const {model, method, queryObject} = q
          return prisma[model][method](queryObject)
        } catch (error) {
          errorItemList.push({...q, error: error.message})
          return null
        }
      })
      data = await Promise.all(promises)
      data = data.filter(d => d !== null)
    } else if (mode === 'sequential') {
      for (const q of transactionQueryList) {
        const {model, method, queryObject} = q
        data.push(await prisma[model][method](queryObject))
      }
    }

    const result: requestResultType = {success: true, result: data, message}
    console.timeEnd(timeKey)
    return result
  } catch (error) {
    throw new Error(error.message)
    // console.error(error.stack)
    // const result: requestResultType = {
    //   success: false,
    //   message: error.message,
    //   result: errorItemList,
    // }
  } finally {
    console.timeEnd(timeKey)
  }
}
