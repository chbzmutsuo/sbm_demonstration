'use server'
import { getNenpiDataByCar } from '@app/(apps)/tbm/(server-actions)/getNenpiDataByCar'
import prisma from 'src/lib/prisma'
import { TbmVehicle, User } from '@prisma/client'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'

export type carHistoryKey = `sokoKyoriInPeriod` | `heikinNempiInPeriod` | `sokyuyuRyoInPeriod` | `fuelCostInPeriod`

export const fetchRuisekiKyoriKichoData = async ({ tbmBaseId, whereQuery, TbmBase_MonthConfig }) => {
  const { nenpiKanriDataListByCar } = await getNenpiDataByCar({ tbmBaseId, whereQuery, TbmBase_MonthConfig })

  const userList = await prisma.user.findMany({
    where: { tbmBaseId },
    include: {
      TbmVehicle: {},
      TbmDriveSchedule: {
        where: {
          date: whereQuery,
          approved: TbmReportCl.allowNonApprovedSchedule ? undefined : true,
        },
        include: {
          TbmVehicle: {
            include: { OdometerInput: {} },
          },
        },
      },
    },
  })

  const userListWithCarHistory = userList.map(user => {
    const { id: userId, TbmDriveSchedule } = user

    let allCars = TbmDriveSchedule.reduce((acc, cur, i) => {
      const { TbmVehicle } = cur

      if (!acc.find(v => v.id === TbmVehicle?.id)) {
        acc.push(TbmVehicle)
      }
      return acc
    }, [] as any).sort((a, b) => (a.code ?? '')?.localeCompare(b.code ?? ''))

    allCars = allCars.map(car => {
      const fuelData = nenpiKanriDataListByCar.find(v => {
        return v?.vehicle?.id === car.id
      })

      return {
        car,
        ...fuelData,
      }
    })
    return { user, allCars }
  })
  type UserWithCarHistory = {
    user: User & { TbmVehicle: TbmVehicle }

    allCars: {
      car: TbmVehicle
      sokoKyoriInPeriod: number
      heikinNempiInPeriod: number
      sokyuyuRyoInPeriod: number
      fuelCostInPeriod: number
    }[]
  }

  return userListWithCarHistory as UserWithCarHistory[]
}
