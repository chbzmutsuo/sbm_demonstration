'use client'

import React from 'react'
import {useRouter} from 'next/navigation'
import {LogItem} from './LogItem'
import {WorkoutLogWithMaster} from '../../types/training'
import {removeLog, quickAddSet} from '../../server-actions/workout-log'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {PART_OPTIONS} from '@app/(excluded)/training/(constants)/PART_OPTIONS'

type LogListViewProps = {
  userId: number
  selectedDate: string
  logList?: WorkoutLogWithMaster[]
  prLogIds?: number[]
}

export function LogListView({userId, selectedDate, logList = [], prLogIds = []}: LogListViewProps) {
  const router = useRouter()

  // 日付をフォーマット
  const formattedDate = new Date(selectedDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  // 記録追加時の処理
  const handleAddLog = () => {
    router.push(`/training/log/new?date=${selectedDate}`)
  }

  // 記録編集時の処理
  const handleEditLog = (log: WorkoutLogWithMaster) => {
    router.push(`/training/log/${log.id}/edit`)
  }

  // 記録削除時の処理
  const handleDeleteLog = async (logId: number) => {
    try {
      await removeLog(logId)
      // 画面を更新
      router.refresh()
    } catch (error) {
      console.error('記録の削除に失敗しました:', error)
    }
  }

  // クイック追加時の処理
  const handleQuickAdd = async (log: WorkoutLogWithMaster) => {
    try {
      await quickAddSet({
        userId,
        exerciseId: log.exerciseId,
        strength: log.strength,
        reps: log.reps,
        date: selectedDate,
      })
      // 画面を更新
      router.refresh()
    } catch (error) {
      console.error('クイック追加に失敗しました:', error)
    }
  }

  // カレンダーに戻る処理
  const handleBackToCalendar = () => {
    router.push('/training')
  }

  // 種目ごとにグループ化
  const logListByExercise: {[key: string]: WorkoutLogWithMaster[]} = {}

  logList.forEach(log => {
    const exerciseName = log.exercise?.name || '不明な種目'
    if (!logListByExercise[exerciseName]) {
      logListByExercise[exerciseName] = []
    }
    logListByExercise[exerciseName].push(log)
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handleBackToCalendar} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          カレンダーに戻る
        </button>
        <h2 className="text-xl font-bold">{formattedDate}</h2>
        <button onClick={handleAddLog} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          記録追加
        </button>
      </div>

      {logList.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(logListByExercise).map(([exerciseName, logList]) => {
            const partColor = PART_OPTIONS.find(part => part.value === logList[0].ExerciseMaster?.part)?.color
            return (
              <div key={exerciseName} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-2xl font-bold mb-2 flex gap-1 items-center" style={{color: partColor}}>
                  <IconBtn
                    {...{
                      rounded: true,
                      className: 'w-6 h-6 scale-75',
                      color: partColor ?? 'gray',
                    }}
                  ></IconBtn>
                  {exerciseName}
                </h3>
                <div className="space-y-2 pl-4 scale-95">
                  {logList.map(log => (
                    <LogItem
                      key={log.id}
                      log={log}
                      isPR={prLogIds.includes(log.id)}
                      onEdit={() => handleEditLog(log)}
                      onDelete={() => handleDeleteLog(log.id)}
                      onQuickAdd={() => handleQuickAdd(log)}
                      showWorkName={false}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">この日のトレーニング記録はありません</p>
        </div>
      )}
    </div>
  )
}
