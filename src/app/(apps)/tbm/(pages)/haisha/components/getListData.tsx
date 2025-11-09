'use server'

import prisma from 'src/lib/prisma'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'
import {GetListDataParams, HaishaListData} from '../types/haisha-page-types'

export const getListData = async (props: GetListDataParams): Promise<HaishaListData> => {
  const {tbmBaseId, whereQuery, mode, takeSkip, sortBy = 'departureTime', tbmCustomerId} = props

  const commonWhere = {tbmBaseId}
  const tbmBase = await prisma.tbmBase.findUnique({select: {id: true, name: true}, where: {id: tbmBaseId}})

  const getMaxRecord = async () => {
    if (mode === 'ROUTE') {
      const maxRecord = await prisma.tbmRouteGroup.count({
        where: {
          ...commonWhere,
          ...(tbmCustomerId
            ? {
                Mid_TbmRouteGroup_TbmCustomer: {
                  tbmCustomerId,
                },
              }
            : {}),
        },
      })

      return maxRecord
    } else {
      const maxRecord = await prisma.user.count({where: commonWhere})

      return maxRecord
    }
  }

  // ソート条件を動的に生成
  const getOrderBy = () => {
    const baseOrder = [{date: 'asc' as const}]

    switch (sortBy) {
      case 'routeCode':
        return [...baseOrder, {TbmRouteGroup: {code: 'asc' as const}}]
      case 'customerCode':
        // 複雑な関連ソートはクライアントサイドで実行
        return baseOrder
      case 'departureTime':
      default:
        // 出発時刻順はクライアントサイドでソート（24時間超え対応のため）
        return baseOrder
    }
  }

  const rawTbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    select: {
      id: true,
      date: true,
      remark: true,
      userId: true,
      tbmRouteGroupId: true,
      tbmBaseId: true,
      tbmVehicleId: true,
      TbmRouteGroup: {
        select: {
          id: true,
          code: true,
          name: true,
          routeName: true,
          seikyuKbn: true,
          departureTime: true,
          finalArrivalTime: true,
          allowDuplicate: true,
          Mid_TbmRouteGroup_TbmCustomer: {
            select: {
              TbmCustomer: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      finished: true,
      confirmed: true,
      approved: true,
      User: {select: {id: true, name: true}},
      TbmVehicle: {
        select: {
          id: true,
          code: true,
          vehicleNumber: true,
          shape: true,
          type: true,
          OdometerInput: {select: {id: true, odometerStart: true, odometerEnd: true, date: true}},
        },
      },
    },
    where: {
      date: {gte: whereQuery.gte, lte: whereQuery.lt},
      ...(tbmCustomerId
        ? {
            TbmRouteGroup: {
              Mid_TbmRouteGroup_TbmCustomer: {
                tbmCustomerId,
              },
            },
          }
        : {}),
    },
    orderBy: getOrderBy(),
  })

  // 重複検知：同じ日付で、同じ「便、車両、ドライバー」の組み合わせをチェック
  // 以下の条件をすべて満たす場合のみ重複警告を表示:
  // 1. 自身の便が重複許可(allowDuplicate)でない
  // 2. 同じ組み合わせの他の便が存在する
  // 3. その他の便も重複許可でない
  let processedSchedules = rawTbmDriveSchedule.map(schedule => {
    // 自身が重複許可の場合は重複フラグを立てない
    if (schedule.TbmRouteGroup.allowDuplicate) {
      return {
        ...schedule,
        duplicated: false,
      }
    }

    // 自身が重複許可でない場合、同じ組み合わせの便が他にあるかチェック
    // かつ、その便も重複許可でない場合のみ重複フラグを立てる
    const duplicated = rawTbmDriveSchedule.some(
      otherSchedule =>
        otherSchedule.id !== schedule.id &&
        otherSchedule.date.getTime() === schedule.date.getTime() &&
        otherSchedule.tbmRouteGroupId === schedule.tbmRouteGroupId &&
        // 重複先の便が重複許可でない場合のみ重複とみなす
        !otherSchedule.TbmRouteGroup.allowDuplicate
    )

    return {
      ...schedule,
      duplicated,
    }
  })

  // 出発時刻順の場合はクライアントサイドでソート
  if (sortBy === 'departureTime') {
    processedSchedules = processedSchedules.sort((a, b) => {
      // まず日付でソート
      const dateCompare = a.date.getTime() - b.date.getTime()
      if (dateCompare !== 0) return dateCompare

      // 同じ日付の場合は出発時刻でソート
      return TimeHandler.compareTimeStrings(a.TbmRouteGroup.departureTime, b.TbmRouteGroup.departureTime)
    })
  } else if (sortBy === 'customerCode') {
    processedSchedules = processedSchedules.sort((a, b) => {
      // まず日付でソート
      const dateCompare = a.date.getTime() - b.date.getTime()
      if (dateCompare !== 0) return dateCompare

      // 同じ日付の場合は顧客コードでソート
      const customerCodeA = a.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      const customerCodeB = b.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      return customerCodeA.localeCompare(customerCodeB)
    })
  }

  const TbmDriveSchedule = processedSchedules

  const userList = await prisma.user.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      tbmBaseId: true,
      UserWorkStatus: {
        select: {id: true, date: true, workStatus: true, userId: true},
        where: {date: whereQuery},
      },
    },
    where: commonWhere,
    orderBy: {code: 'asc'},
    ...(mode === 'DRIVER' ? {...takeSkip} : {}),
  })

  // tbmRouteGroupのソート条件を動的に生成
  const getRouteGroupOrderBy = () => {
    switch (sortBy) {
      case 'customerCode':
        // 複雑な関連ソートはクライアントサイドで実行
        return [{code: 'asc' as const}, {name: 'asc' as const}]
      case 'routeCode':
        return [{code: 'asc' as const}, {name: 'asc' as const}]
      case 'departureTime':
      default:
        // 出発時刻順はクライアントサイドでソート
        return [{code: 'asc' as const}, {name: 'asc' as const}]
    }
  }

  let tbmRouteGroupRaw = await prisma.tbmRouteGroup.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      routeName: true,
      seikyuKbn: true,
      departureTime: true,
      finalArrivalTime: true,
      allowDuplicate: true,
      serviceNumber: true,
      tbmBaseId: true,
      Mid_TbmRouteGroup_TbmCustomer: {
        select: {
          TbmCustomer: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
      TbmRouteGroupCalendar: {
        select: {id: true, date: true, holidayType: true, remark: true},
        where: {date: whereQuery},
      },
    },
    where: {
      ...commonWhere,
      ...(tbmCustomerId
        ? {
            Mid_TbmRouteGroup_TbmCustomer: {
              tbmCustomerId,
            },
          }
        : {}),
    },
    orderBy: getRouteGroupOrderBy(),
    ...(mode === 'ROUTE' ? {...takeSkip} : {}),
  })

  // クライアントサイドでのソート処理
  if (sortBy === 'departureTime') {
    tbmRouteGroupRaw = tbmRouteGroupRaw.sort((a, b) => {
      return TimeHandler.compareTimeStrings(a.departureTime, b.departureTime)
    })
  } else if (sortBy === 'customerCode') {
    tbmRouteGroupRaw = tbmRouteGroupRaw.sort((a, b) => {
      const customerCodeA = a.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      const customerCodeB = b.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      const codeCompare = customerCodeA.localeCompare(customerCodeB)

      // 顧客コードが同じ場合は便コードでソート
      if (codeCompare === 0) {
        return (a.code || '').localeCompare(b.code || '')
      }
      return codeCompare
    })
  }

  const tbmRouteGroup = tbmRouteGroupRaw

  const carList = await prisma.tbmVehicle.findMany({
    select: {id: true, code: true, vehicleNumber: true, shape: true, type: true},
    where: commonWhere,
    orderBy: {code: 'asc'},
  })

  const userWorkStatusCount = await prisma.userWorkStatus.groupBy({
    by: ['userId', 'workStatus'],
    orderBy: {workStatus: 'desc'},
    _count: {_all: true},
    where: {date: whereQuery},
  })

  const result = {
    tbmBase,
    TbmDriveSchedule,
    userList,
    tbmRouteGroup,
    carList,
    maxCount: await getMaxRecord(),
    userWorkStatusCount,
  } as unknown as HaishaListData

  return result
}
