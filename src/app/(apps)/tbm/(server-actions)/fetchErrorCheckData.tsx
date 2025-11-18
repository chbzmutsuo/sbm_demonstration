'use server'

import prisma from 'src/lib/prisma'

export const fetchErrorCheckData = async ({tbmBaseId}) => {
  // 1. オドメーター入力エラー: 開始のみ入力で、終了が入っていないもの
  const odometerErrors = await prisma.odometerInput.findMany({
    where: {
      TbmVehicle: {
        tbmBaseId,
      },
      odometerStart: {
        gt: 0,
      },
      odometerEnd: 0,
    },
    include: {
      TbmVehicle: {
        select: {
          vehicleNumber: true,
          name: true,
        },
      },
      User: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  // 2. 運行入力エラー: 完了されているが、ドライバーの締めや管理者の承認がされていないもの
  const driveScheduleErrors = await prisma.tbmDriveSchedule.findMany({
    where: {
      tbmBaseId,
      finished: true,
      OR: [{confirmed: false}, {confirmed: null}, {approved: false}, {approved: null}],
    },
    include: {
      User: {
        select: {
          name: true,
          code: true,
        },
      },
      TbmVehicle: {
        select: {
          vehicleNumber: true,
          name: true,
        },
      },
      TbmRouteGroup: {
        select: {
          name: true,
          code: true,
          routeName: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return {
    odometerErrors,
    driveScheduleErrors,
  }
}
