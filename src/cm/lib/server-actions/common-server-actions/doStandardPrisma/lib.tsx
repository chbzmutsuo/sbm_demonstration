import {createSuccessMessage} from '@cm/lib/prisma-helper'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {hashPassword} from 'src/cm/lib/crypt'

import {getRelationalModels, getSchema} from '@cm/lib/methods/prisma-schema'

export async function initQueryObject({model, method, queryObject, prismaModel}) {
  const {create, update, data} = queryObject

  const {where} = queryObject ?? {id: 0}

  if (create || update || data) {
    let hasedPW

    if (queryObject?.data?.password) {
      hasedPW = await hashPassword(queryObject.data.password)
    } else if (queryObject?.create?.password) {
      hasedPW = await hashPassword(queryObject.create.password)
    } else if (queryObject?.update?.password) {
      hasedPW = await hashPassword(queryObject.update.password)
    }

    if (queryObject?.create?.password) {
      queryObject.create.password = hasedPW
    }
    if (queryObject?.update?.password) {
      queryObject.update.password = hasedPW
    }
    if (queryObject?.data?.password) {
      queryObject.data.password = hasedPW
    }

    const targetKeys = ['data', 'create', 'update']
    // sortOrderがない場合は追加
    await addSortOrderIfNull({targetKeys, method, queryObject, where, prismaModel})

    // その他の付加情報を追加
    await addAdditionalProps({targetKeys, model, method, queryObject})

    await removeUnnecessaryFields({targetKeys, queryObject})
  }

  return queryObject
  /**
   *  updatedAtがある場合は追加
   */

  /** sortOrderがない場合は追加*/
  async function addSortOrderIfNull({targetKeys, method, queryObject, where, prismaModel}) {
    if (['create', 'upsert'].includes(method)) {
      const lastSortOrder =
        (await (
          await prismaModel.findFirst({
            where: {id: {not: 0}},
            orderBy: {sortOrder: 'desc'},
          })
        )?.sortOrder) ?? 0

      const findUnique = await prismaModel.findUnique({where: where ?? {id: 0}})

      targetKeys.forEach(key => {
        if (queryObject[key] && !queryObject[key].sortOrder) {
          queryObject[key].sortOrder = findUnique?.sortOrder ?? lastSortOrder + 1
        }
      })
    }
  }

  /**
   *  その他の付加情報を追加
   */
  async function addAdditionalProps({targetKeys, model, method, queryObject}) {
    if (['create', 'upsert', `update`].includes(method)) {
      targetKeys.forEach(key => {
        if (queryObject[key]) {
          ///更新日を追加
          const addUpdatedAt = (queryObject, key, model) => {
            const updatedAtFileldExists = getRelationalModels({schemaAsObj: getSchema(), parentName: model})?.singleAttributeObj
              ?.updatedAt
            if (updatedAtFileldExists) {
              queryObject[key][`updatedAt`] = formatDate(new Date(), `iso`)
            }
          }
          addUpdatedAt(queryObject, key, model)
        }
      })
    }
  }

  /**
   *  不要なフィールドを削除
   */
  async function removeUnnecessaryFields({targetKeys, queryObject}) {
    targetKeys.forEach(key => {
      if (queryObject[key]?.password === null || queryObject[key]?.password === '') {
        queryObject[key].password = undefined
      }
    })

    delete queryObject?.create?.id
    delete queryObject?.update?.id
  }
}

export async function doDelete({prismaModel, queryObject, model, method}) {
  const {where} = queryObject

  let result = null
  const findUnique = await prismaModel.findUnique({where: where ?? {id: 0}})
  if (findUnique) {
    result = await prismaModel['delete'](queryObject)
    console.info('correctly deleted')
  } else {
    console.error('delete: not found')
  }

  return {success: true, result, message: createSuccessMessage({model, method})}
}

export async function doDeleteMany({prismaModel, queryObject, model, method}) {
  const {where} = queryObject
  let result = null
  const findTheData = await prismaModel.findMany({where: where ?? {id: 0}})
  if (findTheData.length > 0) {
    result = await prismaModel['deleteMany'](queryObject)
    console.info('correctly deleted')
  } else {
    console.error('delete: not found')
  }

  return {success: true, result, message: createSuccessMessage({model, method})}
}

export async function doDefaultPrismaMethod({prismaModel, method, queryObject, model}) {
  if (queryObject?.where?.id && isNaN(queryObject?.where?.id)) {
    queryObject.where.id = 0
  }

  const result = await prismaModel?.[method]?.(queryObject)

  return {success: true, result, message: createSuccessMessage({model, method})}
}
