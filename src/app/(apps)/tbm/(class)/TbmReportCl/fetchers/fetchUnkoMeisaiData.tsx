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

type userType = User & { TbmVehicle?: TbmVehicle }

export type getMonthlyTbmDriveDataReturn = Awaited<ReturnType<typeof fetchUnkoMeisaiData>>
export type MonthlyTbmDriveData = getMonthlyTbmDriveDataReturn['monthlyTbmDriveList'][number]

import prisma from 'src/lib/prisma'
import { TbmVehicle, User } from '@prisma/client'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import { unkoMeisaiKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'

export type DriveScheduleData = Awaited<ReturnType<typeof getDriveScheduleList>>[number]
export const getDriveScheduleList = async (props: {
  allowNonApprovedSchedule?: boolean
  whereQuery: {
    gte?: Date | undefined
    lte?: Date | undefined
  }
  tbmBaseId: number | undefined
  userId: number | undefined
}) => {
  const { allowNonApprovedSchedule, tbmBaseId, whereQuery, userId } = props

  const whereArgs = {
    approved: allowNonApprovedSchedule ? undefined : TbmReportCl.allowNonApprovedSchedule ? undefined : true,
    date: whereQuery,
    tbmBaseId,
    userId,
  }

  const tbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    where: whereArgs,
    orderBy: [{ date: 'asc' }, { TbmRouteGroup: { departureTime: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'asc' }, { userId: 'asc' }],
    include: {
      TbmEtcMeisai: { include: {} },
      TbmRouteGroup: {
        include: {
          TbmMonthlyConfigForRouteGroup: { where: { yearMonth: whereQuery.gte } },
          Mid_TbmRouteGroup_TbmCustomer: { include: { TbmCustomer: {} } },
          TbmRouteGroupFee: {}, // フィルタを削除して、すべての料金設定を取得（運行日でフィルタリングする）
        },
      },
      TbmVehicle: {},
      User: {
        where: { id: userId },
        include: { TbmVehicle: {} },
      },
    },
  })

  return tbmDriveSchedule
}

export const fetchUnkoMeisaiData = async ({
  allowNonApprovedSchedule,
  whereQuery,
  tbmBaseId,
  userId,
}: {
  allowNonApprovedSchedule?: boolean
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
  tbmBaseId: number
  userId: number | undefined
}) => {
  const ConfigForMonth = await prisma.tbmMonthlyConfigForRouteGroup.findFirst({
    where: {
      yearMonth: whereQuery.gte,
      TbmRouteGroup: { tbmBaseId: tbmBaseId },
    },
  })

  const tbmDriveSchedule = await getDriveScheduleList({ allowNonApprovedSchedule, whereQuery, tbmBaseId, userId })

  const monthlyTbmDriveList = tbmDriveSchedule.map(schedule => {
    const unkoMeisaiKeyValue = TbmReportCl.reportCols.createUnkoMeisaiRow(schedule)
    return {
      schedule,
      keyValue: unkoMeisaiKeyValue,
    }
  }) as { schedule: DriveScheduleData; keyValue: unkoMeisaiKeyValue }[]

  const userList: userType[] = monthlyTbmDriveList
    .reduce((acc, row) => {
      const { schedule } = row
      const { User } = schedule
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
