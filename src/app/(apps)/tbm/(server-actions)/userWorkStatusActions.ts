'use server'

import prisma from 'src/lib/prisma'
import {Days} from '@cm/class/Days/Days'
import {TbmReportCl} from '../(class)/TbmReportCl'

export type UserWorkStatusData = {
  userId: number
  date: Date
  workStatus?: string | null
  remark?: string | null
  totalRestraintTimeMinutes?: number | null
  totalWorkTimeMinutes?: number | null
  breakTimeMinutes?: number | null
  lateNightBreakTimeMinutes?: number | null
  restTimeMinutes?: number | null
  scheduledWorkTimeMinutes?: number | null
  overtime1Minutes?: number | null
  overtime1_1Minutes?: number | null
  lateNightOvertimeMinutes?: number | null
  holidayWorkMinutes?: number | null
}

export type SingleUser_AttendancePage = Awaited<ReturnType<typeof getUserWorkStatusForMonth>>

export type UserWorkStatusItem = NonNullable<SingleUser_AttendancePage>['UserWorkStatus'][number]

// 指定された月のUserWorkStatusを取得
export async function getUserWorkStatusForMonth(params: {tbmBaseId: number; userId?: number; yearMonth: Date}) {
  const {tbmBaseId, userId, yearMonth} = params

  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(yearMonth)

  const dateWhere = {gte: firstDayOfMonth, lte: lastDayOfMonth}

  const UserData = await prisma.user.findUnique({
    where: {id: userId},
    include: {
      UserWorkStatus: {where: {date: dateWhere}},
      OdometerInput: {where: {date: dateWhere}},
      TbmRefuelHistory: {where: {date: dateWhere}},
      TbmDriveSchedule: {
        where: {
          date: dateWhere,
          approved: TbmReportCl.allowNonApprovedSchedule ? undefined : true,
        },
        include: {
          TbmRouteGroup: true,
          TbmVehicle: true,
        },
      },
    },
  })

  return UserData
}

// UserWorkStatusの作成・更新
export async function upsertUserWorkStatus(data: UserWorkStatusData) {
  const unique_userId_date = {
    userId: data.userId,
    date: data.date,
  }

  const result = await prisma.userWorkStatus.upsert({
    where: {unique_userId_date},
    create: data,
    update: data,
  })
  return result
}

// UserWorkStatusの削除
export async function deleteUserWorkStatus(params: {userId: number; date: Date}) {
  try {
    const {userId, date} = params
    const unique_userId_date = {userId, date}

    const result = await prisma.userWorkStatus.delete({
      where: {unique_userId_date},
    })

    return {success: true, data: result}
  } catch (error) {
    console.error('Error deleting UserWorkStatus:', error)
    return {success: false, error: error.message}
  }
}
