import {useState, useMemo, useEffect} from 'react'
import {WorkoutLogWithMaster, WorkoutLogInput} from '../types/training'
import {getWorkoutlogListByDate} from '@app/(excluded)/training/server-actions/workout-log'

interface UseWorkoutLogProps {
  userId: number
  selectedDate: string
}

export function useWorkoutLog({userId, selectedDate}: UseWorkoutLogProps) {
  // 記録一覧
  const [logList, setlogList] = useState<WorkoutLogWithMaster[]>([])

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false)

  // エラー状態
  const [error, setError] = useState<string | null>(null)

  // 記録の取得
  const fetchlogList = async () => {
    if (!userId || !selectedDate) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getWorkoutlogListByDate(userId, selectedDate)
      if (result) {
        setlogList(result)
      }
    } catch (err) {
      setError('記録の取得に失敗しました')
      console.error('記録取得エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 記録の作成
  const addLog = async (data: WorkoutLogInput & {date: Date}) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await addLog(data)
      if (result) {
        setlogList(prev => [...prev, result])
      }
      return result
    } catch (err) {
      setError('記録の作成に失敗しました')
      console.error('記録作成エラー:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 記録の更新
  const editLog = async (id: number, data: WorkoutLogInput) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await editLog(id, data)
      if (result) {
        setlogList(prev => prev.map(log => (log.id === id ? result : log)))
      }
      return result
    } catch (err) {
      setError('記録の更新に失敗しました')
      console.error('記録更新エラー:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 記録の削除
  const removeLog = async (id: number) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      await removeLog(id)
      setlogList(prev => prev.filter(log => log.id !== id))
      return true
    } catch (err) {
      setError('記録の削除に失敗しました')
      console.error('記録削除エラー:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // クイック追加（同じ内容でセット追加）
  const quickAddSet = async (logToCopy: WorkoutLogWithMaster) => {
    const newLogData: WorkoutLogInput & {date: Date; userId: number} = {
      exerciseId: logToCopy.exerciseId,
      strength: logToCopy.strength,
      reps: logToCopy.reps,
      date: new Date(selectedDate),
      userId: logToCopy.userId,
    }

    return await addLog(newLogData)
  }

  useEffect(() => {
    fetchlogList()
  }, [userId, selectedDate])

  // PR記録のIDを計算
  const prLogIds = useMemo(() => {
    const prIds = new Set<number>()
    const maxStrengths: Record<number, number> = {}

    // 日付順にソート
    const sortedlogList = [...logList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sortedlogList.forEach(log => {
      if (!maxStrengths[log.exerciseId] || log.strength > maxStrengths[log.exerciseId]) {
        if (log.strength > 0) {
          maxStrengths[log.exerciseId] = log.strength
          prIds.add(log.id)
        }
      }
    })

    return prIds
  }, [logList])

  // 総ボリュームを計算
  const totalVolume = useMemo(() => {
    return logList.reduce((sum, log) => sum + log.strength * log.reps, 0)
  }, [logList])

  return {
    // 状態
    logList,
    isLoading,
    error,

    // アクション
    fetchlogList,
    addLog,
    editLog,
    removeLog,
    quickAddSet,

    setlogList,

    // 計算値
    prLogIds,
    totalVolume,
  }
}
