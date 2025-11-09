'use server'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {prismaDataExtractionQueryType} from '@cm/components/DataLogic/TFs/Server/Conf'
import prisma from 'src/lib/prisma'

export const searchByQuery = async (props: {
  modelName: PrismaModelNames
  prismaDataExtractionQuery?: prismaDataExtractionQueryType

  // include?: anyObject
  // where?: anyObject
  // orderBy?: anyObject[]
  // skip?: number
  // take?: number
  // select?: anyObject
  // omit?: anyObject
}) => {
  const {modelName, prismaDataExtractionQuery} = props
  const {include, where, orderBy, skip, take, select, omit} = prismaDataExtractionQuery ?? {}

  let selectOrInclude
  if (include) {
    selectOrInclude = {
      include: select ? undefined : {...include},
      omit: select ? undefined : {...omit},
    }
  }

  if (select) {
    selectOrInclude = {select: {...select}}
  }

  const model = prisma[modelName] as any
  let totalCount = await model.aggregate({
    where: where,
    select: {_count: true},
  })
  totalCount = totalCount?._count.id

  const query = {
    where: where,
    skip: Math.max(0, Math.min(skip ?? 0, totalCount - 1)),
    take: take ?? undefined,
    orderBy: [...orderBy, {sortOrder: 'asc'}, {id: 'asc'}],

    ...selectOrInclude,
  }

  const records = await model.findMany({...query})

  return {records, totalCount}
}
