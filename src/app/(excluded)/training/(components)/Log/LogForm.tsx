'use client'

import React, {useState, useEffect, useRef} from 'react'
import {WorkoutLogWithMaster, WorkoutLogInput, ExerciseMaster} from '../../types/training'
import {addLog, editLog, getExerciseHistory} from '../../server-actions/workout-log'
import {PART_OPTIONS} from '../../(constants)/PART_OPTIONS'
import {PerformanceChart} from './PerformanceChart'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

type LogFormProps = {
  masters: ExerciseMaster[]
  logList?: WorkoutLogWithMaster[]
  editingLog?: WorkoutLogWithMaster | null
  selectedDate: string
}

export function LogForm({masters, logList = [], editingLog = null, selectedDate}: LogFormProps) {
  const {router, session} = useGlobal()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // フォームの状態
  const [formData, setFormData] = useState<WorkoutLogInput>({
    exerciseId: editingLog?.exerciseId || 0,
    strength: editingLog?.strength || 0,
    reps: editingLog?.reps || 0,
  })

  // 選択された種目の前回の記録
  const [lastLog, setLastLog] = useState<WorkoutLogWithMaster | null>(null)

  // 種目フィルタリング用の状態
  const [selectedPart, setSelectedPart] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  // 過去の記録
  const [exerciseHistory, setExerciseHistory] = useState<WorkoutLogWithMaster[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)

  // フィルタリングされた種目マスター
  const filteredMasters = masters.filter(master => {
    const matchesPart = !selectedPart || master.part === selectedPart
    const matchesSearch = !searchTerm || master.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPart && matchesSearch
  })

  // 種目が変更されたときに前回の記録を更新
  useEffect(() => {
    if (formData.exerciseId) {
      const exerciselogList = logList.filter(log => log.exerciseId === formData.exerciseId)

      if (exerciselogList.length > 0) {
        // 同じ種目の最新の記録を取得
        const latestLog = exerciselogList.reduce((prev, current) => {
          return new Date(prev.createdAt) > new Date(current.createdAt) ? prev : current
        })
        setLastLog(latestLog)

        // 編集中でなければ、前回の記録を初期値として設定
        if (!editingLog) {
          setFormData(prev => ({
            ...prev,
            strength: latestLog.strength,
            reps: latestLog.reps,
          }))
        }
      } else {
        setLastLog(null)
      }

      // 過去の記録を取得
      fetchExerciseHistory(formData.exerciseId)
    }
  }, [formData.exerciseId, logList, editingLog])

  // ドロップダウン外のクリックを検知して閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 過去の記録を取得
  const fetchExerciseHistory = async (exerciseId: number) => {
    if (!exerciseId) return

    setIsLoadingHistory(true)
    try {
      const history = await getExerciseHistory(exerciseId)
      setExerciseHistory(history)
    } catch (error) {
      console.error('過去の記録の取得に失敗しました:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 入力変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target
    setFormData({
      ...formData,
      [name]: name === 'exerciseId' ? parseInt(value) : parseFloat(value),
    })
  }

  // 部位選択時の処理
  const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPart(e.target.value)
  }

  // 検索語入力時の処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsDropdownOpen(true)
  }

  // 種目選択時の処理
  const handleExerciseSelect = (exerciseId: number) => {
    setFormData({
      ...formData,
      exerciseId,
    })
    setIsDropdownOpen(false)

    // 選択された種目の名前を検索欄に表示
    const selectedExercise = masters.find(m => m.id === exerciseId)
    if (selectedExercise) {
      setSearchTerm(selectedExercise.name)
    }
  }

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = {
        ...formData,
        date: new Date(selectedDate),
        userId: session?.id,
      }

      if (editingLog) {
        await editLog(editingLog.id, data)
      } else {
        await addLog(data)
      }

      // 日付ページに戻る
      router.push(`/training/date?date=${selectedDate}`)
      router.refresh()
    } catch (error) {
      console.error('記録の保存に失敗しました:', error)
    }
  }

  // キャンセル処理
  const handleCancel = () => {
    router.back()
  }

  // 選択中の種目名を取得
  const selectedExerciseName = formData.exerciseId ? masters.find(m => m.id === formData.exerciseId)?.name : ''

  // 過去の記録のサマリーを計算
  const historySummary =
    exerciseHistory.length > 0
      ? {
          count: exerciseHistory.length,
          maxWeight: Math.max(...exerciseHistory.map(log => log.strength)),
          maxReps: Math.max(...exerciseHistory.map(log => log.reps)),
          avgWeight: exerciseHistory.reduce((sum, log) => sum + log.strength, 0) / exerciseHistory.length,
          avgReps: exerciseHistory.reduce((sum, log) => sum + log.reps, 0) / exerciseHistory.length,
          lastTrainingDate: new Date(Math.max(...exerciseHistory.map(log => new Date(log.date).getTime()))).toLocaleDateString(
            'ja-JP'
          ),
        }
      : null

  return (
    <C_Stack className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{editingLog ? 'トレーニング記録の編集' : 'トレーニング記録の追加'}</h2>

      <section>
        <form onSubmit={handleSubmit}>
          {/* 部位フィルタリング */}
          {!editingLog && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">部位でフィルタ</label>
              <select value={selectedPart} onChange={handlePartChange} className="w-full p-2 border rounded">
                <option value="">すべての部位</option>
                {PART_OPTIONS.map(part => (
                  <option key={part.value} value={part.value}>
                    {part.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* カスタム種目選択 */}
          <div className="mb-4" ref={dropdownRef}>
            <label className="block text-gray-700 mb-2">種目を選択</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full p-2 border rounded"
                placeholder="種目名を入力して検索"
              />
              {isDropdownOpen && filteredMasters.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredMasters.map(master => (
                    <div
                      key={master.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handleExerciseSelect(master.id)}
                    >
                      {master.part && (
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: PART_OPTIONS.find(p => p.value === master.part)?.color || '#ccc',
                          }}
                        ></span>
                      )}
                      <span>{master.name}</span>
                      {master.part && <span className="text-gray-500 text-xs ml-2">({master.part})</span>}
                    </div>
                  ))}
                </div>
              )}
              {/* 隠しフィールド - 実際のフォームデータ用 */}
              <input type="hidden" name="exerciseId" value={formData.exerciseId} />
            </div>
            {!formData.exerciseId && searchTerm && <p className="text-sm text-red-500 mt-1">種目を選択してください</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">重量 (kg)</label>
            <input
              type="number"
              name="strength"
              value={formData.strength.toString() ?? ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.5"
              min="0"
              required
            />
            {lastLog && !editingLog && <p className="text-sm text-gray-500 mt-1">前回: {lastLog.strength}kg</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">回数</label>
            <input
              type="number"
              name="reps"
              value={formData.reps.toString() ?? ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
            {lastLog && !editingLog && <p className="text-sm text-gray-500 mt-1">前回: {lastLog.reps}回</p>}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              保存
            </button>
          </div>
        </form>
      </section>

      <section className={`pt-8 mt-8 border-t `}>
        {/* 過去のトレーニングサマリー */}
        {formData.exerciseId > 0 && historySummary && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="font-semibold text-md mb-2">{selectedExerciseName} の記録サマリー</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                トレーニング回数: <span className="font-medium">{historySummary.count}回</span>
              </div>
              <div>
                最終トレーニング: <span className="font-medium">{historySummary.lastTrainingDate}</span>
              </div>
              <div>
                最大重量: <span className="font-medium">{historySummary.maxWeight}kg</span>
              </div>
              <div>
                最大回数: <span className="font-medium">{historySummary.maxReps}回</span>
              </div>
              <div>
                平均重量: <span className="font-medium">{historySummary.avgWeight.toFixed(1)}kg</span>
              </div>
              <div>
                平均回数: <span className="font-medium">{historySummary.avgReps.toFixed(1)}回</span>
              </div>
            </div>
          </div>
        )}

        {/* 記録の推移グラフ */}
        {formData.exerciseId > 0 && exerciseHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-md mb-2">記録の推移</h3>
            <PerformanceChart logList={exerciseHistory} />
          </div>
        )}
      </section>
    </C_Stack>
  )
}
