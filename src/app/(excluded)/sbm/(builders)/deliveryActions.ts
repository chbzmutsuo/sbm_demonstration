'use server'

import prisma from 'src/lib/prisma'

import {revalidatePath} from 'next/cache'

// 配達グループの取得（日付指定）
export async function getDeliveryGroups(date: Date) {
  try {
    const groups = await prisma.sbmDeliveryGroup.findMany({
      where: {
        deliveryDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        optimizedRoute: true,
        groupReservations: {
          include: {
            SbmReservation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return groups
  } catch (error) {
    console.error('配達グループの取得に失敗:', error)
    throw error
  }
}

// 配達グループの作成
export async function createDeliveryGroup(group: DeliveryGroupType) {
  try {
    const newGroup = await prisma.sbmDeliveryGroup.create({
      data: {
        name: group.name!,
        deliveryDate: group.deliveryDate!,
        userId: group.userId!,
        userName: group.userName!,
        status: group.status || 'planning',
        notes: group.notes,
      },
    })

    revalidatePath('/sbm/delivery-route')
    return newGroup
  } catch (error) {
    console.error('配達グループの作成に失敗:', error)
    throw error
  }
}

// 配達グループの更新
export async function updateDeliveryGroup(group: DeliveryGroupType) {
  if (!group.id) throw new Error('グループIDが必要です')

  try {
    // 既存のルート停止点を削除（新しいものに置き換えるため）
    if (group.optimizedRoute) {
      await prisma.sbmDeliveryRouteStop.deleteMany({
        where: {
          sbmDeliveryGroupId: group.id,
        },
      })
    }

    const updatedGroup = await prisma.sbmDeliveryGroup.update({
      where: {id: group.id},
      data: {
        name: group.name,
        userId: group.userId,
        userName: group.userName,
        status: group.status,
        estimatedDuration: group.estimatedDuration,
        actualDuration: group.actualDuration,
        routeUrl: group.routeUrl,
        notes: group.notes,
        optimizedRoute: group.optimizedRoute
          ? {
              createMany: {
                data: group.optimizedRoute.map(stop => ({
                  sbmReservationId: stop.sbmReservationId!,
                  customerName: stop.customerName!,
                  address: stop.address!,
                  lat: stop.lat,
                  lng: stop.lng,
                  estimatedArrival: stop.estimatedArrival,
                  actualArrival: stop.actualArrival,
                  deliveryOrder: stop.deliveryOrder!,
                  deliveryCompleted: stop.deliveryCompleted || false,
                  recoveryCompleted: stop.recoveryCompleted || false,
                  estimatedDuration: stop.estimatedDuration!,
                  notes: stop.notes,
                })),
              },
            }
          : undefined,
      },
      include: {
        optimizedRoute: true,
      },
    })

    revalidatePath('/sbm/delivery-route')
    return updatedGroup
  } catch (error) {
    console.error('配達グループの更新に失敗:', error)
    throw error
  }
}

// 配達グループの削除
export async function deleteDeliveryGroup(groupId: number) {
  try {
    await prisma.sbmDeliveryGroup.delete({
      where: {id: groupId},
    })

    revalidatePath('/sbm/delivery-route')
  } catch (error) {
    console.error('配達グループの削除に失敗:', error)
    throw error
  }
}

// グループ未設定の配達を取得
export async function getUnassignedDeliveries(date: Date) {
  try {
    // すでにグループに割り当てられている予約IDを取得
    const assignedReservationIds = await prisma.sbmDeliveryGroupReservation.findMany({
      where: {
        SbmDeliveryGroup: {
          deliveryDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      },
      select: {
        sbmReservationId: true,
      },
    })

    // 未割り当ての配達予約を取得
    const unassignedDeliveries = await prisma.sbmReservation.findMany({
      where: {
        deliveryDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        pickupLocation: '配達',
        id: {
          notIn: assignedReservationIds.map(r => r.sbmReservationId),
        },
      },
      orderBy: {
        deliveryDate: 'asc',
      },
    })

    return unassignedDeliveries
  } catch (error) {
    console.error('未割り当て配達の取得に失敗:', error)
    throw error
  }
}

// グループに予約を割り当て
export async function assignReservationsToGroup(reservations: ReservationType[], groupId: number) {
  try {
    // 一括で予約を割り当て
    await prisma.sbmDeliveryGroupReservation.createMany({
      data: reservations.map(reservation => ({
        sbmDeliveryGroupId: groupId,
        sbmReservationId: reservation.id || 0,
      })),
    })

    // グループの予約数を更新
    await prisma.sbmDeliveryGroup.update({
      where: {id: groupId},
      data: {
        totalReservations: {
          increment: reservations.length,
        },
      },
    })

    revalidatePath('/sbm/delivery-route')
  } catch (error) {
    console.error('予約の割り当てに失敗:', error)
    throw error
  }
}

// グループの予約を取得
export async function getGroupReservations(groupId: number) {
  try {
    const groupReservations = await prisma.sbmDeliveryGroupReservation.findMany({
      where: {
        sbmDeliveryGroupId: groupId,
      },
      include: {
        SbmReservation: true,
      },
      orderBy: {
        deliveryOrder: 'asc',
      },
    })

    return groupReservations.map(gr => gr.SbmReservation)
  } catch (error) {
    console.error('グループ予約の取得に失敗:', error)
    throw error
  }
}

// 配達・回収完了状態の更新
export async function updateDeliveryStatus(
  groupId: number,
  sbmReservationId: number,
  deliveryCompleted?: boolean,
  recoveryCompleted?: boolean
) {
  try {
    // ルート停止点の状態を更新
    await prisma.sbmDeliveryRouteStop.updateMany({
      where: {
        sbmDeliveryGroupId: groupId,
        sbmReservationId: sbmReservationId,
      },
      data: {
        deliveryCompleted: deliveryCompleted,
        recoveryCompleted: recoveryCompleted,
        actualArrival: deliveryCompleted ? new Date() : undefined,
      },
    })

    // 予約自体の状態も更新
    await prisma.sbmReservation.update({
      where: {id: sbmReservationId},
      data: {
        deliveryCompleted: deliveryCompleted,
        recoveryCompleted: recoveryCompleted,
      },
    })

    // グループの完了数を更新
    const routeStops = await prisma.sbmDeliveryRouteStop.findMany({
      where: {
        sbmDeliveryGroupId: groupId,
      },
    })

    const completedCount = routeStops.filter(stop => stop.deliveryCompleted && stop.recoveryCompleted).length

    await prisma.sbmDeliveryGroup.update({
      where: {id: groupId},
      data: {
        completedReservations: completedCount,
        status: completedCount === routeStops.length ? 'completed' : 'in_progress',
      },
    })

    revalidatePath('/sbm/delivery-route')
  } catch (error) {
    console.error('配達状態の更新に失敗:', error)
    throw error
  }
}

// 統計情報の取得
export async function getDeliveryStats(date: Date) {
  try {
    const [groups, unassignedCount, completedCount, totalDistance] = await Promise.all([
      // グループ数
      prisma.sbmDeliveryGroup.count({
        where: {
          deliveryDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      }),

      // 未割り当て配達数
      getUnassignedDeliveries(date).then(deliveries => deliveries.length),

      // 完了済み配達数
      prisma.sbmDeliveryRouteStop.count({
        where: {
          SbmDeliveryGroup: {
            deliveryDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
          deliveryCompleted: true,
          recoveryCompleted: true,
        },
      }),

      // 総配達距離（km）- ルートURLから概算
      prisma.sbmDeliveryGroup
        .findMany({
          where: {
            deliveryDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            routeUrl: {
              not: null,
            },
          },
          select: {
            optimizedRoute: {
              select: {
                lat: true,
                lng: true,
              },
            },
          },
        })
        .then(groups => {
          // 各グループのルートの距離を計算（概算）
          return groups.reduce((total, group) => {
            const stops = group.optimizedRoute.filter(stop => stop.lat && stop.lng)
            let distance = 0
            for (let i = 0; i < stops.length - 1; i++) {
              const start = stops[i]
              const end = stops[i + 1]
              // 簡易的な距離計算（ヒュベニの公式）
              distance += calculateDistance(start.lat!, start.lng!, end.lat!, end.lng!)
            }
            return total + distance
          }, 0)
        }),
    ])

    return {
      groupCount: groups,
      unassignedCount,
      completedCount,
      totalDistance: Math.round(totalDistance), // km
    }
  } catch (error) {
    console.error('統計情報の取得に失敗:', error)
    throw error
  }
}

// 距離計算（ヒュベニの公式）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球の半径（km）
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
