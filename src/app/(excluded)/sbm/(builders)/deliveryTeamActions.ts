'use server'

import prisma from 'src/lib/prisma'

// 配達チーム関連のサーバーアクション

/**
 * 特定日付の配達チームを取得
 */

export async function getDeliveryTeamsByDate(date: string): Promise<DeliveryTeamType[]> {
  try {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const teams = await prisma.sbmDeliveryTeam.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return teams
  } catch (error) {
    console.error('配達チーム取得エラー:', error)
    return []
  }
}

/**
 * 新しい配達チームを作成
 */
export async function createDeliveryTeam(
  teamData: Omit<DeliveryTeamType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{success: boolean; team?: DeliveryTeamType; error?: string}> {
  try {
    const newTeam = await prisma.sbmDeliveryTeam.create({
      data: {
        name: teamData.name,
        date: teamData.date,
      },
    })

    return {
      success: true,
      team: newTeam,
    }
  } catch (error) {
    console.error('配達チーム作成エラー:', error)
    return {
      success: false,
      error: '配達チームの作成に失敗しました',
    }
  }
}

/**
 * 予約を配達チームに割り当て
 */
export async function assignReservationToTeam(
  teamId: number,
  reservationId: number,
  assignedBy: string
): Promise<{success: boolean; error?: string}> {
  try {
    // チームの存在確認
    const team = await prisma.sbmDeliveryTeam.findUnique({
      where: {id: teamId},
    })

    if (!team) {
      return {
        success: false,
        error: '配達チームが見つかりません',
      }
    }

    // 予約の存在確認
    const reservation = await prisma.sbmReservation.findUnique({
      where: {id: reservationId},
    })

    if (!reservation) {
      return {
        success: false,
        error: '予約が見つかりません',
      }
    }

    // 既に割り当てられているか確認
    const existingAssignment = await prisma.sbmDeliveryAssignment.findFirst({
      where: {
        sbmReservationId: reservationId,
        sbmDeliveryTeamId: teamId,
      },
    })

    if (existingAssignment) {
      return {
        success: false,
        error: 'この予約は既にこのチームに割り当てられています',
      }
    }

    // 割り当て作成
    await prisma.sbmDeliveryAssignment.create({
      data: {
        sbmDeliveryTeamId: teamId,
        sbmReservationId: reservationId,
        assignedBy,
        deliveryDate: reservation.deliveryDate,
        status: 'assigned',
      },
    })

    return {success: true}
  } catch (error) {
    console.error('予約割り当てエラー:', error)
    return {
      success: false,
      error: '予約の割り当てに失敗しました',
    }
  }
}

/**
 * 予約を別のチームに移動
 */
export async function moveReservationToTeam(
  reservationId: number,
  fromTeamId: number,
  toTeamId: number,
  assignedBy: string
): Promise<{success: boolean; error?: string}> {
  try {
    // トランザクションで処理
    await prisma.$transaction(async tx => {
      // 現在の割り当てを削除
      await tx.sbmDeliveryAssignment.deleteMany({
        where: {
          sbmReservationId: reservationId,
          sbmDeliveryTeamId: fromTeamId,
        },
      })

      // 予約情報を取得
      const reservation = await tx.sbmReservation.findUnique({
        where: {id: reservationId},
      })

      if (!reservation) {
        throw new Error('予約が見つかりません')
      }

      // 新しいチームに割り当て
      await tx.sbmDeliveryAssignment.create({
        data: {
          sbmDeliveryTeamId: toTeamId,
          sbmReservationId: reservationId,
          assignedBy,
          deliveryDate: reservation.deliveryDate,
          status: 'assigned',
        },
      })
    })

    return {success: true}
  } catch (error) {
    console.error('予約移動エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '予約の移動に失敗しました',
    }
  }
}

/**
 * チームの予約を納品時間順に並べ替え
 */
export async function sortTeamReservationsByDeliveryTime(teamId: number): Promise<{success: boolean; error?: string}> {
  try {
    // チームに割り当てられた予約を取得
    const assignments = await prisma.sbmDeliveryAssignment.findMany({
      where: {sbmDeliveryTeamId: teamId},
      include: {SbmReservation: true},
    })

    if (assignments.length === 0) {
      return {
        success: false,
        error: 'このチームに割り当てられた予約がありません',
      }
    }

    // 納品時間でソート
    const sortedAssignments = assignments.sort((a, b) => {
      return a.SbmReservation.deliveryDate.getTime() - b.SbmReservation.deliveryDate.getTime()
    })

    // 配達順を更新
    for (let i = 0; i < sortedAssignments.length; i++) {
      await prisma.sbmDeliveryAssignment.update({
        where: {id: sortedAssignments[i].id},
        data: {route: {deliveryOrder: i + 1}},
      })
    }

    return {success: true}
  } catch (error) {
    console.error('予約並べ替えエラー:', error)
    return {
      success: false,
      error: '予約の並べ替えに失敗しました',
    }
  }
}

/**
 * 配達グループ（新システム）を作成
 */
export const createDeliveryGroup = async (
  name: string,
  date: Date,
  userId: number,
  userName: string
): Promise<{success: boolean; group?: DeliveryGroupType; error?: string}> => {
  try {
    const newGroup = await prisma.sbmDeliveryGroup.create({
      data: {
        name,
        deliveryDate: date,
        userId,
        userName,
        status: 'planning',
      },
    })

    return {
      success: true,
      group: newGroup as unknown as DeliveryGroupType,
    }
  } catch (error) {
    console.error('配達グループ作成エラー:', error)
    return {
      success: false,
      error: '配達グループの作成に失敗しました',
    }
  }
}

/**
 * 複数の配達グループを一括作成
 */
export const createMultipleDeliveryGroups = async (
  count: number,
  date: Date,
  userId: number,
  userName: string
): Promise<{success: boolean; groups?: DeliveryGroupType[]; error?: string}> => {
  try {
    const groups: DeliveryGroupType[] = []

    // トランザクションで複数のグループを作成
    await prisma.$transaction(async tx => {
      for (let i = 1; i <= count; i++) {
        const newGroup = await tx.sbmDeliveryGroup.create({
          data: {
            name: `チーム${i}`,
            deliveryDate: date,
            userId,
            userName,
            status: 'planning',
          },
        })

        groups.push(newGroup as unknown as DeliveryGroupType)
      }
    })

    return {
      success: true,
      groups,
    }
  } catch (error) {
    console.error('複数配達グループ作成エラー:', error)
    return {
      success: false,
      error: '配達グループの一括作成に失敗しました',
    }
  }
}

/**
 * 予約を配達グループに割り当て
 */
export async function assignReservationToGroup(
  groupId: number,
  reservationId: number
): Promise<{success: boolean; error?: string}> {
  try {
    // 既存の割り当てを確認
    const existingAssignment = await prisma.sbmDeliveryGroupReservation.findFirst({
      where: {
        sbmDeliveryGroupId: groupId,
        sbmReservationId: reservationId,
      },
    })

    if (existingAssignment) {
      return {
        success: false,
        error: 'この予約は既にこのグループに割り当てられています',
      }
    }

    // 他のグループへの割り当てを確認
    const otherAssignment = await prisma.sbmDeliveryGroupReservation.findFirst({
      where: {
        sbmReservationId: reservationId,
      },
    })

    // グループ内の最大配達順序を取得
    const maxOrder = await prisma.sbmDeliveryGroupReservation.aggregate({
      where: {
        sbmDeliveryGroupId: groupId,
      },
      _max: {
        deliveryOrder: true,
      },
    })

    const nextOrder = (maxOrder._max.deliveryOrder || 0) + 1

    // トランザクションで処理
    await prisma.$transaction(async tx => {
      // 他のグループに割り当てられていれば削除
      if (otherAssignment) {
        await tx.sbmDeliveryGroupReservation.delete({
          where: {
            id: otherAssignment.id,
          },
        })
      }

      // 新しいグループに割り当て
      await tx.sbmDeliveryGroupReservation.create({
        data: {
          sbmDeliveryGroupId: groupId,
          sbmReservationId: reservationId,
          deliveryOrder: nextOrder,
          isCompleted: false,
        },
      })

      // グループの予約数を更新
      await tx.sbmDeliveryGroup.update({
        where: {id: groupId},
        data: {
          totalReservations: {
            increment: 1,
          },
        },
      })
    })

    return {success: true}
  } catch (error) {
    console.error('予約割り当てエラー:', error)
    return {
      success: false,
      error: '予約の割り当てに失敗しました',
    }
  }
}

/**
 * 複数の予約を一括で配達グループに割り当て
 */
export async function assignMultipleReservationsToGroup(
  groupId: number,
  reservationIds: number[]
): Promise<{success: boolean; error?: string}> {
  try {
    if (reservationIds.length === 0) {
      return {
        success: false,
        error: '割り当てる予約がありません',
      }
    }

    // トランザクションで処理
    await prisma.$transaction(async tx => {
      // グループ内の最大配達順序を取得
      const maxOrder = await tx.sbmDeliveryGroupReservation.aggregate({
        where: {
          sbmDeliveryGroupId: groupId,
        },
        _max: {
          deliveryOrder: true,
        },
      })

      let nextOrder = (maxOrder._max.deliveryOrder || 0) + 1

      // 各予約を処理
      for (const reservationId of reservationIds) {
        // 他のグループへの割り当てを確認
        const otherAssignment = await tx.sbmDeliveryGroupReservation.findFirst({
          where: {
            sbmReservationId: reservationId,
          },
        })

        // 他のグループに割り当てられていれば削除
        if (otherAssignment) {
          await tx.sbmDeliveryGroupReservation.delete({
            where: {
              id: otherAssignment.id,
            },
          })

          // 元のグループの予約数を減らす
          if (otherAssignment.sbmDeliveryGroupId !== groupId) {
            await tx.sbmDeliveryGroup.update({
              where: {id: otherAssignment.sbmDeliveryGroupId},
              data: {
                totalReservations: {
                  decrement: 1,
                },
              },
            })
          } else {
            // 同じグループ内での再割り当ての場合はスキップ
            continue
          }
        }

        // 新しいグループに割り当て
        await tx.sbmDeliveryGroupReservation.create({
          data: {
            sbmDeliveryGroupId: groupId,
            sbmReservationId: reservationId,
            deliveryOrder: nextOrder++,
            isCompleted: false,
          },
        })
      }

      // グループの予約数を更新
      await tx.sbmDeliveryGroup.update({
        where: {id: groupId},
        data: {
          totalReservations: {
            increment: reservationIds.length,
          },
        },
      })
    })

    return {success: true}
  } catch (error) {
    console.error('複数予約割り当てエラー:', error)
    return {
      success: false,
      error: '予約の一括割り当てに失敗しました',
    }
  }
}

/**
 * 予約を別の配達グループに移動
 */
export async function moveReservationToGroup(
  reservationId: number,
  fromGroupId: number,
  toGroupId: number
): Promise<{success: boolean; error?: string}> {
  try {
    // トランザクションで処理
    await prisma.$transaction(async tx => {
      // 現在の割り当てを取得
      const currentAssignment = await tx.sbmDeliveryGroupReservation.findFirst({
        where: {
          sbmReservationId: reservationId,
          sbmDeliveryGroupId: fromGroupId,
        },
      })

      if (!currentAssignment) {
        throw new Error('現在の割り当てが見つかりません')
      }

      // 移動先グループの最大配達順序を取得
      const maxOrder = await tx.sbmDeliveryGroupReservation.aggregate({
        where: {
          sbmDeliveryGroupId: toGroupId,
        },
        _max: {
          deliveryOrder: true,
        },
      })

      const nextOrder = (maxOrder._max.deliveryOrder || 0) + 1

      // 現在の割り当てを削除
      await tx.sbmDeliveryGroupReservation.delete({
        where: {
          id: currentAssignment.id,
        },
      })

      // 新しいグループに割り当て
      await tx.sbmDeliveryGroupReservation.create({
        data: {
          sbmDeliveryGroupId: toGroupId,
          sbmReservationId: reservationId,
          deliveryOrder: nextOrder,
          isCompleted: currentAssignment.isCompleted,
          completedAt: currentAssignment.completedAt,
        },
      })

      // 元のグループの予約数を減らす
      await tx.sbmDeliveryGroup.update({
        where: {id: fromGroupId},
        data: {
          totalReservations: {
            decrement: 1,
          },
          completedReservations: currentAssignment.isCompleted
            ? {
                decrement: 1,
              }
            : undefined,
        },
      })

      // 移動先グループの予約数を増やす
      await tx.sbmDeliveryGroup.update({
        where: {id: toGroupId},
        data: {
          totalReservations: {
            increment: 1,
          },
          completedReservations: currentAssignment.isCompleted
            ? {
                increment: 1,
              }
            : undefined,
        },
      })
    })

    return {success: true}
  } catch (error) {
    console.error('予約移動エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '予約の移動に失敗しました',
    }
  }
}

/**
 * 配達グループの予約を納品時間順に並べ替え
 */
export async function sortGroupReservationsByDeliveryTime(groupId: number): Promise<{success: boolean; error?: string}> {
  try {
    // グループに割り当てられた予約を取得
    const groupReservations = await prisma.sbmDeliveryGroupReservation.findMany({
      where: {sbmDeliveryGroupId: groupId},
      include: {
        SbmReservation: true,
      },
    })

    if (groupReservations.length === 0) {
      return {
        success: false,
        error: 'このグループに割り当てられた予約がありません',
      }
    }

    // 納品時間でソート
    const sortedReservations = groupReservations.sort((a, b) => {
      return a.SbmReservation.deliveryDate.getTime() - b.SbmReservation.deliveryDate.getTime()
    })

    // トランザクションで配達順を更新
    await prisma.$transaction(async tx => {
      for (let i = 0; i < sortedReservations.length; i++) {
        await tx.sbmDeliveryGroupReservation.update({
          where: {id: sortedReservations[i].id},
          data: {deliveryOrder: i + 1},
        })
      }
    })

    return {success: true}
  } catch (error) {
    console.error('予約並べ替えエラー:', error)
    return {
      success: false,
      error: '予約の並べ替えに失敗しました',
    }
  }
}

/**
 * グループ内の予約の順序を変更
 */
export async function changeReservationOrder(
  groupId: number,
  reservationId: number,
  newOrder: number
): Promise<{success: boolean; error?: string}> {
  try {
    // グループに割り当てられた予約を取得
    const groupReservations = await prisma.sbmDeliveryGroupReservation.findMany({
      where: {sbmDeliveryGroupId: groupId},
      orderBy: {deliveryOrder: 'asc'},
    })

    if (groupReservations.length === 0) {
      return {
        success: false,
        error: 'このグループに割り当てられた予約がありません',
      }
    }

    // 対象の予約を見つける
    const targetReservation = groupReservations.find(gr => gr.sbmReservationId === reservationId)
    if (!targetReservation) {
      return {
        success: false,
        error: '指定された予約がこのグループに見つかりません',
      }
    }

    // 新しい順序が範囲内かチェック
    const maxOrder = groupReservations.length
    if (newOrder < 1 || newOrder > maxOrder) {
      return {
        success: false,
        error: `順序は1から${maxOrder}の間で指定してください`,
      }
    }

    // 現在の順序
    const currentOrder = targetReservation.deliveryOrder ?? 0

    // 同じ順序なら何もしない
    if (currentOrder === newOrder) {
      return {success: true}
    }

    // トランザクションで順序を更新
    await prisma.$transaction(async tx => {
      if (newOrder > currentOrder) {
        // 下に移動する場合、間の予約を上に移動
        await tx.sbmDeliveryGroupReservation.updateMany({
          where: {
            sbmDeliveryGroupId: groupId,
            deliveryOrder: {
              gt: currentOrder,
              lte: newOrder,
            },
          },
          data: {
            deliveryOrder: {decrement: 1},
          },
        })
      } else {
        // 上に移動する場合、間の予約を下に移動
        await tx.sbmDeliveryGroupReservation.updateMany({
          where: {
            sbmDeliveryGroupId: groupId,
            deliveryOrder: {
              gte: newOrder,
              lt: currentOrder,
            },
          },
          data: {
            deliveryOrder: {increment: 1},
          },
        })
      }

      // 対象の予約を新しい順序に更新
      await tx.sbmDeliveryGroupReservation.update({
        where: {id: targetReservation.id},
        data: {deliveryOrder: newOrder},
      })
    })

    return {success: true}
  } catch (error) {
    console.error('予約順序変更エラー:', error)
    return {
      success: false,
      error: '予約の順序変更に失敗しました',
    }
  }
}

/**
 * グループ内の予約を1つ上に移動
 */
export async function moveReservationUp(groupId: number, reservationId: number): Promise<{success: boolean; error?: string}> {
  try {
    // 予約の現在の順序を取得
    const currentReservation = await prisma.sbmDeliveryGroupReservation.findFirst({
      where: {
        sbmDeliveryGroupId: groupId,
        sbmReservationId: reservationId,
      },
    })

    if (!currentReservation) {
      return {
        success: false,
        error: '指定された予約がこのグループに見つかりません',
      }
    }

    const currentOrder = currentReservation.deliveryOrder ?? 0

    // 既に最上部なら何もしない
    if (currentOrder <= 1) {
      return {
        success: true,
        error: 'この予約は既に最上部にあります',
      }
    }

    // 1つ上の順序に変更
    return await changeReservationOrder(groupId, reservationId, currentOrder - 1)
  } catch (error) {
    console.error('予約上移動エラー:', error)
    return {
      success: false,
      error: '予約の移動に失敗しました',
    }
  }
}

/**
 * グループ内の予約を1つ下に移動
 */
export async function moveReservationDown(groupId: number, reservationId: number): Promise<{success: boolean; error?: string}> {
  try {
    // 予約の現在の順序を取得
    const currentReservation = await prisma.sbmDeliveryGroupReservation.findFirst({
      where: {
        sbmDeliveryGroupId: groupId,
        sbmReservationId: reservationId,
      },
    })

    if (!currentReservation) {
      return {
        success: false,
        error: '指定された予約がこのグループに見つかりません',
      }
    }

    // グループ内の予約数を取得
    const count = await prisma.sbmDeliveryGroupReservation.count({
      where: {sbmDeliveryGroupId: groupId},
    })

    const currentOrder = currentReservation.deliveryOrder ?? 0

    // 既に最下部なら何もしない
    if (currentOrder >= count) {
      return {
        success: true,
        error: 'この予約は既に最下部にあります',
      }
    }

    // 1つ下の順序に変更
    return await changeReservationOrder(groupId, reservationId, currentOrder + 1)
  } catch (error) {
    console.error('予約下移動エラー:', error)
    return {
      success: false,
      error: '予約の移動に失敗しました',
    }
  }
}

/**
 * 配達グループの特定日付のグループを取得
 */
export async function getDeliveryGroupsByDate(date: string): Promise<DeliveryGroupType[]> {
  try {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const groups = await prisma.sbmDeliveryGroup.findMany({
      where: {
        deliveryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        groupReservations: {
          include: {
            SbmReservation: true,
          },
          orderBy: {
            deliveryOrder: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return groups as unknown as DeliveryGroupType[]
  } catch (error) {
    console.error('配達グループ取得エラー:', error)
    return []
  }
}

/**
 * 配達グループのGoogle Map URLを生成
 */
export async function generateGroupGoogleMapUrl(groupId: number): Promise<{success: boolean; url?: string; error?: string}> {
  try {
    const group = await prisma.sbmDeliveryGroup.findUnique({
      where: {id: groupId},
      include: {
        groupReservations: {
          include: {
            SbmReservation: true,
          },
          orderBy: {
            deliveryOrder: 'asc',
          },
        },
      },
    })

    if (!group || group.groupReservations.length === 0) {
      return {
        success: false,
        error: '予約が見つかりません',
      }
    }

    // 住所を結合してGoogle Maps URLを作成
    const addresses = group.groupReservations.map(gr => {
      const r = gr.SbmReservation
      const address = `${r.prefecture || ''}${r.city || ''}${r.street || ''}${r.building || ''}`
      return encodeURIComponent(address)
    })

    // Google Maps の複数地点ルートURL形式
    // 最初の地点をスタート地点、最後の地点を目的地として設定
    const url = `https://www.google.com/maps/dir/?api=1&destination=${addresses[addresses.length - 1]}&waypoints=${addresses.slice(0, -1).join('|')}`

    // URLをグループに保存
    await prisma.sbmDeliveryGroup.update({
      where: {id: groupId},
      data: {
        routeUrl: url,
      },
    })

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('Google Map URL生成エラー:', error)
    return {
      success: false,
      error: 'マップURLの生成に失敗しました',
    }
  }
}
