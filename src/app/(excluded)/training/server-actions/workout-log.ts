'use server'

import {revalidatePath} from 'next/cache'
import prisma from 'src/lib/prisma'
import {WorkoutLogWithMaster, WorkoutLogInput, ExerciseMaster} from '../types/training'
import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

// カレンダー用の月ごとのトレーニング日を取得
export async function getWorkoutDatesForMonth(userId: number, year: number, month: number) {
  const startDate = toUtc(new Date(year, month - 1, 1))
  const endDate = toUtc(new Date(year, month, 0))

  const logList = await prisma.workoutLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
    },
    distinct: ['date'],
  })

  return logList.map(log => formatDate(log.date, 'YYYY-MM-DD'))
}

// 月ごとの日付別トレーニングデータを取得（部位ごとの集計を含む）
export async function getWorkoutDataByDate(userId: number, year: number, month: number) {
  const startDate = toUtc(new Date(year, month - 1, 1))
  const endDate = toUtc(new Date(year, month, 0))

  // 日付ごとのログを取得
  const logList = await prisma.workoutLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  // 日付ごとに部位別のセット数を集計
  const result: {
    [date: string]: {
      totalSets: number
      exerciseCount: number
      partSummary: {
        part: string
        count: number
      }[]
    }
  } = {}

  logList.forEach(log => {
    const dateStr = formatDate(log.date, 'YYYY-MM-DD')
    const part = log.ExerciseMaster?.part || 'その他'

    if (!result[dateStr]) {
      result[dateStr] = {
        totalSets: 0,
        exerciseCount: 0,
        partSummary: [],
      }
    }

    // 総セット数をカウント
    result[dateStr].totalSets++

    // 部位別のセット数を集計
    const existingPart = result[dateStr].partSummary.find(p => p.part === part)
    if (existingPart) {
      existingPart.count++
    } else {
      result[dateStr].partSummary.push({
        part,
        count: 1,
      })
    }
  })

  // 種目数をカウント（日付ごと、部位ごとにユニークな種目数）
  const exerciseCounts = await prisma.workoutLog.groupBy({
    by: ['date', 'exerciseId'],
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // 日付ごとの種目数をカウント
  exerciseCounts.forEach(item => {
    const dateStr = formatDate(new Date(item.date), 'YYYY-MM-DD')
    if (result[dateStr]) {
      result[dateStr].exerciseCount++
    }
  })

  return result
}

// 特定の日付のトレーニングログを取得
export async function getWorkoutlogListByDate(userId: number, dateStr: string) {
  const date = toUtc(new Date(dateStr))

  const logList = await prisma.workoutLog.findMany({
    where: {
      userId,
      date: date,
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: [{exerciseId: 'asc'}, {createdAt: 'asc'}],
  })

  // ExerciseMasterを exercise としても設定
  const logListWithExercise = logList.map(log => ({
    ...log,
    exercise: log.ExerciseMaster,
  }))

  return logListWithExercise as WorkoutLogWithMaster[]
}

// 特定のIDのトレーニングログを取得
export async function getWorkoutLogById(id: number) {
  const log = await prisma.workoutLog.findUnique({
    where: {id},
    include: {
      ExerciseMaster: true,
    },
  })

  if (!log) return null

  // ExerciseMasterを exercise としても設定
  const logWithExercise = {
    ...log,
    exercise: log.ExerciseMaster,
  }

  return logWithExercise as WorkoutLogWithMaster
}

// 特定の種目の過去のトレーニングログを取得
export async function getExerciseHistory(exerciseId: number, limit = 20) {
  const logList = await prisma.workoutLog.findMany({
    where: {
      exerciseId,
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: limit,
  })

  // ExerciseMasterを exercise としても設定
  const logListWithExercise = logList.map(log => ({
    ...log,
    exercise: log.ExerciseMaster,
  }))

  return logListWithExercise as WorkoutLogWithMaster[]
}

// 自己記録（PR）のログIDを取得
export async function getPRLogIds(userId: number, logIds: number[]) {
  if (logIds.length === 0) return []

  // PRを判定するためのクエリ
  const logList = await prisma.workoutLog.findMany({
    where: {
      id: {in: logIds},
      userId,
    },
    select: {
      id: true,
      exerciseId: true,
      strength: true,
      reps: true,
    },
  })

  // 各ログについて、それ以前の同じ種目の記録と比較
  const prLogIds: number[] = []

  for (const log of logList) {
    // 同じ種目の過去の記録を取得
    const previouslogList = await prisma.workoutLog.findMany({
      where: {
        userId,
        exerciseId: log.exerciseId,
        createdAt: {lt: getMidnight()}, // 現在より前の記録
        id: {not: log.id}, // 自分自身を除外
      },
      select: {
        strength: true,
        reps: true,
      },
    })

    // PRかどうかを判定（重量が同じか多く、かつ回数が同じか多い場合）
    const isPR = !previouslogList.some(prev => prev.strength >= log.strength && prev.reps >= log.reps)

    if (isPR) {
      prLogIds.push(log.id)
    }
  }

  return prLogIds
}

// 種目マスタを取得
export async function getExerciseMasters(userId: number) {
  const masters = await prisma.exerciseMaster.findMany({
    where: {
      OR: [
        {userId},
        // isPublicフィールドが存在する場合のみ使用
        // {isPublic: true},
      ],
    },
    orderBy: {
      name: 'asc',
    },
  })

  return masters as ExerciseMaster[]
}

// トレーニングログを追加
export async function addLog(data: WorkoutLogInput & {date: Date; userId?: number}) {
  const result = await prisma.workoutLog.create({
    data: {
      exerciseId: data.exerciseId,
      strength: data.strength,
      reps: data.reps,
      date: toUtc(data.date),
      userId: data.userId || 1, // ユーザーIDが指定されていない場合はデフォルト値を使用
    },
  })

  // キャッシュを更新
  const dateStr = formatDate(data.date, 'YYYY-MM-DD')
  revalidatePath(`/training/date?date=${dateStr}`)
  revalidatePath('/training')

  return result
}

// トレーニングログを編集
export async function editLog(id: number, data: WorkoutLogInput & {date: Date}) {
  const result = await prisma.workoutLog.update({
    where: {id},
    data: {
      exerciseId: data.exerciseId,
      strength: data.strength,
      reps: data.reps,
      date: toUtc(data.date),
    },
  })

  // キャッシュを更新
  const dateStr = formatDate(data.date, 'YYYY-MM-DD')
  revalidatePath(`/training/date?date=${dateStr}`)
  revalidatePath('/training')

  return result
}

// トレーニングログを削除
export async function removeLog(id: number) {
  const log = await prisma.workoutLog.findUnique({
    where: {id},
    select: {date: true},
  })

  const result = await prisma.workoutLog.delete({
    where: {id},
  })

  // キャッシュを更新
  if (log) {
    const dateStr = formatDate(log.date, 'YYYY-MM-DD')
    revalidatePath(`/training/date?date=${dateStr}`)
    revalidatePath('/training')
  }

  return result
}

// クイック追加（同じ種目・重量・回数のセットを追加）
export async function quickAddSet(data: {userId: number; exerciseId: number; strength: number; reps: number; date: string}) {
  const result = await prisma.workoutLog.create({
    data: {
      exerciseId: data.exerciseId,
      strength: data.strength,
      reps: data.reps,
      date: toUtc(data.date),
      userId: data.userId,
    },
  })

  // キャッシュを更新
  revalidatePath(`/training/date?date=${data.date}`)
  revalidatePath('/training')

  return result
}
