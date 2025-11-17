'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

// 月間統計データを効率的に取得
export async function getMonthlyAnalysisData(userId: number, year: number, month: number) {
  const startOfMonth = toUtc(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const endOfMonth = toUtc(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

  // 該当月の全記録を種目マスタと一緒に取得
  return await doStandardPrisma('workoutLog', 'findMany', {
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: {date: 'asc'},
  })
}

// 複数月の統計データを効率的に取得（月間推移用）
export async function getMonthlyTrendsData(userId: number, fromYear: number, fromMonth: number, monthsCount: number) {
  const startDate = toUtc(Date.UTC(fromYear, fromMonth, 1, 0, 0, 0, 0))
  const endYear = fromYear + Math.floor((fromMonth + monthsCount) / 12)
  const endMonth = (fromMonth + monthsCount) % 12
  const endDate = toUtc(Date.UTC(endYear, endMonth, 0, 23, 59, 59, 999))

  // 指定期間の全記録を取得
  const result = await doStandardPrisma('workoutLog', 'findMany', {
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
    orderBy: {date: 'asc'},
  })

  return result
}

// 種目別の進捗データを効率的に取得
export async function getExerciseProgressData(userId: number, exerciseId: number, months: number = 6) {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  startDate.setUTCHours(0, 0, 0, 0)

  return await doStandardPrisma('workoutLog', 'findMany', {
    where: {
      userId,
      exerciseId,
      date: {
        gte: startDate,
      },
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: {date: 'asc'},
  })
}

// 全種目の進捗データを一括取得（種目別分析用）
export async function getAllExercisesProgressData(userId: number, months: number = 6) {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  startDate.setUTCHours(0, 0, 0, 0)

  return await doStandardPrisma('workoutLog', 'findMany', {
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: [{ExerciseMaster: {part: 'asc'}}, {ExerciseMaster: {name: 'asc'}}, {date: 'asc'}],
  })
}

// 部位別統計データを計算
export interface PartStats {
  part: string
  totalVolume: number
  totalReps: number
  totalSets: number
  exercises: string[]
}

export async function calculatePartStats(logList: any[]): Promise<PartStats[]> {
  const partMap = new Map<string, PartStats>()

  logList.forEach(log => {
    const part = log.ExerciseMaster.part
    const volume = log.strength * log.reps

    if (!partMap.has(part)) {
      partMap.set(part, {
        part,
        totalVolume: 0,
        totalReps: 0,
        totalSets: 0,
        exercises: [],
      })
    }

    const stats = partMap.get(part)!
    stats.totalVolume += volume
    stats.totalReps += log.reps
    stats.totalSets += 1

    if (!stats.exercises.includes(log.ExerciseMaster.name)) {
      stats.exercises.push(log.ExerciseMaster.name)
    }
  })

  return Array.from(partMap.values()).sort((a, b) => b.totalVolume - a.totalVolume)
}

// 月間統計データを計算
export interface MonthlyStats {
  name: string
  year: number
  month: number
  totalVolume: number
  totalReps: number
  totalSets: number
  trainingDays: number
  partStats: PartStats[]
}

export async function calculateMonthlyStats(logList: any[], year: number, month: number): Promise<MonthlyStats> {
  const totalVolume = logList.reduce((sum, log) => sum + log.strength * log.reps, 0)
  const totalReps = logList.reduce((sum, log) => sum + log.reps, 0)
  const totalSets = logList.length
  const trainingDays = new Set(logList.map(log => new Date(log.date).toISOString().split('T')[0])).size

  const partStats = await calculatePartStats(logList)

  return {
    name: `${year}/${String(month + 1).padStart(2, '0')}`,
    year,
    month,
    totalVolume,
    totalReps,
    totalSets,
    trainingDays,
    partStats,
  }
}
