'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

// 種目マスタ一覧取得（ユーザー別）
export async function getExerciseMasters(userId: number) {
  return await doStandardPrisma('exerciseMaster', 'findMany', {
    where: {userId},
    orderBy: [{part: 'asc'}, {name: 'asc'}],
  })
}

// 種目マスタ作成
export async function createExerciseMaster(userId: number, data: any) {
  return await doStandardPrisma('exerciseMaster', 'create', {
    data: {
      ...data,
      userId,
    },
  })
}

// 種目マスタ更新
export async function updateExerciseMaster(userId: number, id: number, data: any) {
  return await doStandardPrisma('exerciseMaster', 'update', {
    where: {id, userId}, // ユーザーIDも条件に含める
    data,
  })
}

// 種目マスタ削除
export async function deleteExerciseMaster(userId: number, id: number) {
  return await doStandardPrisma('exerciseMaster', 'delete', {
    where: {id, userId}, // ユーザーIDも条件に含める
  })
}
