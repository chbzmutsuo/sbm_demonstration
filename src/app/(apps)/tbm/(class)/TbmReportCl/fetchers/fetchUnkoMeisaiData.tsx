'use server'

export type tbmTableKeyValue = {
  type?: any
  label: string | React.ReactNode
  cellValue?: number | string | Date | null
  style?: {
    width?: number
    minWidth?: number
    backgroundColor?: string
  }
}

type userType = User & {TbmVehicle?: TbmVehicle}

export type getMonthlyTbmDriveDataReturn = Awaited<ReturnType<typeof fetchUnkoMeisaiData>>
export type MonthlyTbmDriveData = getMonthlyTbmDriveDataReturn['monthlyTbmDriveList'][number]

import prisma from 'src/lib/prisma'
import {TbmVehicle, User} from '@prisma/client'
import {DriveScheduleCl, unkoMeisaiKeyValue} from '@app/(apps)/tbm/(class)/DriveScheduleCl'
import {TbmReportCl} from '@app/(apps)/tbm/(class)/TbmReportCl'

export type fetchUnkoMeisaiDataReturn = Awaited<ReturnType<typeof _getData>>[number]
const _getData = async (props: {
  whereQuery: {
    gte?: Date | undefined
    lte?: Date | undefined
  }
  tbmBaseId: number | undefined
  userId: number | undefined
}) => {
  const {tbmBaseId, whereQuery, userId} = props

  const whereArgs = {
    approved: DriveScheduleCl.allowNonApprovedSchedule ? undefined : true,
    date: whereQuery,
    tbmBaseId,
    userId,
  }

  const tbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    where: whereArgs,
    orderBy: [{date: 'asc'}, {TbmRouteGroup: {departureTime: {sort: 'asc', nulls: 'last'}}}, {createdAt: 'asc'}, {userId: 'asc'}],
    include: {
      TbmEtcMeisai: {include: {}},
      TbmRouteGroup: {
        include: {
          TbmMonthlyConfigForRouteGroup: {where: {yearMonth: whereQuery.gte}},
          Mid_TbmRouteGroup_TbmCustomer: {include: {TbmCustomer: {}}},
          TbmRouteGroupFee: {}, // フィルタを削除して、すべての料金設定を取得（運行日でフィルタリングする）
        },
      },
      TbmVehicle: {},
      User: {
        where: {id: userId},
        include: {TbmVehicle: {}},
      },
    },
  })

  return tbmDriveSchedule
}

export const fetchUnkoMeisaiData = async ({
  whereQuery,
  tbmBaseId,
  userId,
}: {
  whereQuery: {gte?: Date | undefined; lte?: Date | undefined}
  tbmBaseId: number
  userId: number | undefined
}) => {
  const ConfigForMonth = await prisma.tbmMonthlyConfigForRouteGroup.findFirst({
    where: {
      yearMonth: whereQuery.gte,
      TbmRouteGroup: {tbmBaseId: tbmBaseId},
    },
  })

  const tbmDriveSchedule = await _getData({whereQuery, tbmBaseId, userId})

  const monthlyTbmDriveList = tbmDriveSchedule.map(schedule => {
    const unkoMeisaiKeyValue = TbmReportCl.reportCols.createUnkoMeisaiRow(schedule)
    return {
      schedule,
      keyValue: unkoMeisaiKeyValue,
    }
  }) as {schedule: fetchUnkoMeisaiDataReturn; keyValue: unkoMeisaiKeyValue}[]

  const userList: userType[] = monthlyTbmDriveList
    .reduce((acc, row) => {
      const {schedule} = row
      const {User} = schedule
      if (acc.find(user => User && user?.id === User?.id)) {
        return acc
      }
      acc.push(User as userType)
      return acc
    }, [] as userType[])
    .sort((a, b) => -String(a?.code ?? '').localeCompare(String(b?.code ?? '')))

  return {
    monthlyTbmDriveList,
    ConfigForMonth,
    userList,
  }
}
