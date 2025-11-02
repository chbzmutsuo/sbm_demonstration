import {PrismaClient} from '@prisma/client'

// prismaMethodType を関数型のメソッド名のみを含むように修正
export type prismaMethodType =
  | 'findMany'
  | 'findFirst'
  | 'findUnique'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | 'update'
  | 'create'
  | 'createMany'
  | 'updateMany'
  | 'groupBy'
  | 'aggregate'
  | 'transaction'
  | 'count'

export type PrismaClientOrigin = keyof import('.prisma/client').PrismaClient

export type excluded = Exclude<
  PrismaClientOrigin,
  | '$connect'
  | '$disconnect'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$extends'
  | '$on'
  | '$queryRaw'
  | '$queryRawUnsafe'
  | '$use'
  | '$transaction'
> &
  string

export type PrismaModelNames = excluded
export type extendedPrismaClient = PrismaClient & {[key in PrismaModelNames]: any}
