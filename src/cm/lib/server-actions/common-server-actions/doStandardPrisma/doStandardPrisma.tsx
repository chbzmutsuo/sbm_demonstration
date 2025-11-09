'use server'
import {requestResultType} from '@cm/types/types'
import {handlePrismaError} from '@cm/lib/prisma-helper'

import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import {PrismaClient} from '@prisma/client'

import {
  doDefaultPrismaMethod,
  doDelete,
  doDeleteMany,
  initQueryObject,
} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/lib'
import {prismaChain} from '../../../../../non-common/prismaChain'
import prisma from '../../../../../lib/prisma'

export type doStandardPrismaType = <T extends PrismaModelNames, M extends prismaMethodType>(
  model: T,
  method: M,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queryObject: Parameters<PrismaClient[T][M]>[0],
  transactionPrisma?: any
) => Promise<requestResultType>

export const generalDoStandardPrisma = async (model: any, method: any, queryObject: any, transactionPrisma?: any) => {
  return doStandardPrisma(model, method, queryObject, transactionPrisma)
}
export const doStandardPrisma: doStandardPrismaType = async (model, method, queryObject, transactionPrisma) => {
  const PRISMA = transactionPrisma || prisma
  const prismaModel = PRISMA[model] as any

  const newQueryObject = await initQueryObject({model, method, queryObject, prismaModel})

  let res: requestResultType

  //処理の実行
  try {
    switch (method) {
      case 'delete': {
        res = await doDelete({prismaModel, queryObject: newQueryObject, model, method})
        break
      }

      case 'deleteMany': {
        res = await doDeleteMany({prismaModel, queryObject: newQueryObject, model, method})
        break
      }

      default: {
        res = await doDefaultPrismaMethod({prismaModel, method, queryObject: newQueryObject, model})

        break
      }
    }

    const chainMethod = prismaChain[model]?.find(e => e.when.includes(method))?.do
    if (chainMethod) {
      const chainRes: requestResultType = await executeChainMethod(async () => {
        return await chainMethod({res, queryObject: newQueryObject})
      })
      return {
        ...chainRes,
        result: res.result,
      }
    }
    type resultType = Awaited<ReturnType<PrismaClient['user']['findMany']>>
    return res as {
      success: boolean
      message: string
      error: string
      result: resultType
    }
  } catch (error) {
    const errorMessage = handlePrismaError(error)
    console.error({
      errorMessage,
      model,
      method,
      queryObject: newQueryObject,
      error: error.stack,
    })

    return {
      success: false,
      message: errorMessage,
      error: error.message,
      result: null,
    }
  }
}

const executeChainMethod = async callback => {
  // 現在のロック状態をチェック
  const lockRecord = await prisma.chainMethodLock.findUnique({
    where: {id: 1}, // IDが固定されている場合
  })

  const now = new Date()

  // ロックがかかっているか、ロックの有効期限が切れていないか確認
  if (lockRecord && lockRecord.isLocked && lockRecord.expiresAt && lockRecord.expiresAt > now) {
    console.debug('他のプロセスが実行中です。処理をスキップします。')
    return {success: false, message: '他のプロセスが実行中です。処理をスキップします。', result: null} as requestResultType
  }

  try {
    const data = {
      isLocked: true,
      expiresAt: new Date(now.getTime() + 60000), // 60秒後にロックが解除される
    }
    // ロックを設定（有効期限を60秒後に設定）
    await prisma.chainMethodLock.upsert({
      where: {id: 1},
      create: data,
      update: data,
    })

    // チェーンメソッドの実行
    console.debug('チェーンメソッドを実行します')
    const res: requestResultType = await callback()

    return res
  } catch (error) {
    console.error(error.stack)
    return {success: false, message: 'エラーが発生しました', result: null} as requestResultType
  } finally {
    console.debug(`lock解除`)
    const data = {
      isLocked: false,
      expiresAt: null,
    }
    // ロック解除
    await prisma.chainMethodLock.upsert({
      where: {id: 1},
      create: data,
      update: data,
    })
  }
}
