import prisma from 'src/lib/prisma'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'

export type driveInputPageType = {
  driveScheduleList: Awaited<ReturnType<typeof getDriveInputPageData>>
}

export const getDriveInputPageData = async ({user, whereQuery}: {user: any; whereQuery: any}) => {
  const driveScheduleList = await prisma.tbmDriveSchedule.findMany({
    where: {userId: user?.id, date: {equals: whereQuery.gte}},
    orderBy: {sortOrder: `asc`},
    include: {
      TbmBase: {},
      TbmRouteGroup: {},
      TbmVehicle: {
        include: {
          OdometerInput: {
            where: {date: {lte: whereQuery.gte}},
            orderBy: {date: `desc`},
            take: 2,
          },
        },
      },
      TbmDriveScheduleImage: {},
    },
  })
  return driveScheduleList.sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime()
    if (dateCompare !== 0) return dateCompare

    // 同じ日付の場合は出発時刻でソート
    return TimeHandler.compareTimeStrings(a.TbmRouteGroup.departureTime, b.TbmRouteGroup.departureTime)
  })
}
