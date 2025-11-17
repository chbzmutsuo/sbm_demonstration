// 'use client'

// import React, {useState, useEffect, useMemo} from 'react'
// import {ExerciseMaster} from '../../types/training'
// import {getWorkoutLogByExercise} from '../../server-actions/workout-log'
// import {MonthlyChart} from './MonthlyChart'
// import {ExerciseSummaryCard} from './ExerciseSummaryCard'
// import {toUtc} from '@cm/class/Days/date-utils/calculations'

// interface MonthlyDashboardProps {
//   userId: number
//   masters: ExerciseMaster[]
//   onExerciseSelect: (exerciseId: number) => void
// }

// interface ExerciseSummary {
//   exercise: ExerciseMaster
//   totalSessions: number
//   totalVolume: number
//   maxStrength: number
//   maxReps: number
//   avgStrength: number
//   avgReps: number
//   lastWorkout: Date | null
// }

// export function MonthlyDashboard({userId, masters, onExerciseSelect}: MonthlyDashboardProps) {
//   const [currentMonth, setCurrentMonth] = useState(() => {
//     const now = new Date()
//     return new Date(now.getFullYear(), now.getMonth(), 1)
//   })
//   const [exerciseSummaries, setExerciseSummaries] = useState<ExerciseSummary[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [monthlyData, setMonthlyData] = useState<Array<{date: string; volume: number}>>([])

//   // 月を変更する関数
//   const changeMonth = (offset: number) => {
//     const newMonth = new Date(currentMonth)
//     newMonth.setMonth(newMonth.getMonth() + offset)
//     setCurrentMonth(newMonth)
//   }

//   // 月の開始日と終了日を取得
//   const monthRange = useMemo(() => {
//     const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
//     const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
//     return {startOfMonth, endOfMonth}
//   }, [currentMonth])

//   // 月間データを取得
//   const fetchMonthlyData = async () => {
//     if (!userId) return

//     setIsLoading(true)
//     try {
//       const summaries: ExerciseSummary[] = []
//       const monthlyVolumeData: Array<{date: string; volume: number}> = []

//       // 各種目の月間サマリーを取得
//       for (const master of masters) {
//         const result = await getWorkoutLogByExercise(userId, master.id, 1)
//         if (result.result) {
//           const logList = result.result.filter(log => {
//             const logDate = new Date(log.date)
//             return logDate >= monthRange.startOfMonth && logDate <= monthRange.endOfMonth
//           })

//           if (logList.length > 0) {
//             const totalVolume = logList.reduce((sum, log) => sum + log.strength * log.reps, 0)
//             const maxStrength = Math.max(...logList.map(log => log.strength))
//             const maxReps = Math.max(...logList.map(log => log.reps))
//             const avgStrength = logList.reduce((sum, log) => sum + log.strength, 0) / logList.length
//             const avgReps = logList.reduce((sum, log) => sum + log.reps, 0) / logList.length
//             const lastWorkout = new Date(Math.max(...logList.map(log => new Date(log.date).getTime())))

//             summaries.push({
//               exercise: master,
//               totalSessions: logList.length,
//               totalVolume,
//               maxStrength,
//               maxReps,
//               avgStrength: Math.round(avgStrength * 10) / 10,
//               avgReps: Math.round(avgReps * 10) / 10,
//               lastWorkout,
//             })
//           }
//         }
//       }

//       // 月間の日別ボリュームデータを作成
//       const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
//         const dateStr = date.toISOString().split('T')[0]

//         // その日の全種目のボリュームを合計
//         let dailyVolume = 0

//         for (const summary of summaries) {
//           const daylogList =
//             summary.exercise.WorkoutLog?.filter(log => {
//               const logDate = new Date(log.date)
//               return logDate.getDate() === day
//             }) || []
//           dailyVolume += daylogList.reduce((sum, log) => sum + log.strength * log.reps, 0)
//         }

//         monthlyVolumeData.push({date: dateStr, volume: dailyVolume})
//       }

//       setExerciseSummaries(summaries)
//       setMonthlyData(monthlyVolumeData)
//     } catch (error) {
//       console.error('月間データの取得に失敗しました:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchMonthlyData()
//   }, [currentMonth, masters, userId])

//   const monthLabel = currentMonth.toLocaleDateString('ja-JP', {year: 'numeric', month: 'long'})

//   return (
//     <div className="space-y-6">
//       {/* 月選択ヘッダー */}
//       <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
//         <h2 className="text-xl font-semibold text-slate-800">{monthLabel}の分析</h2>
//         <div className="flex items-center space-x-2">
//           <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
//             <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
//             <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="text-slate-600">読み込み中...</div>
//         </div>
//       ) : (
//         <>
//           {/* 月間ボリュームチャート */}
//           <div className="bg-white p-6 rounded-lg shadow-sm">
//             <h3 className="text-lg font-semibold text-slate-800 mb-4">月間トレーニングボリューム</h3>
//             <MonthlyChart data={monthlyData} />
//           </div>

//           {/* 種目別サマリー */}
//           <div className="bg-white p-6 rounded-lg shadow-sm">
//             <h3 className="text-lg font-semibold text-slate-800 mb-4">種目別サマリー</h3>
//             {exerciseSummaries.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {exerciseSummaries.map(summary => (
//                   <ExerciseSummaryCard
//                     key={summary.exercise.id}
//                     summary={summary}
//                     onClick={() => onExerciseSelect(summary.exercise.id)}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-slate-500">
//                 <p>この月のトレーニング記録がありません</p>
//               </div>
//             )}
//           </div>

//           {/* 全体サマリー */}
//           {exerciseSummaries.length > 0 && (
//             <div className="bg-white p-6 rounded-lg shadow-sm">
//               <h3 className="text-lg font-semibold text-slate-800 mb-4">全体サマリー</h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">{exerciseSummaries.length}</div>
//                   <div className="text-sm text-slate-600">種目数</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-600">
//                     {exerciseSummaries.reduce((sum, s) => sum + s.totalSessions, 0)}
//                   </div>
//                   <div className="text-sm text-slate-600">総セッション数</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-purple-600">
//                     {Math.round(exerciseSummaries.reduce((sum, s) => sum + s.totalVolume, 0) / 100) / 10}k
//                   </div>
//                   <div className="text-sm text-slate-600">総ボリューム</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-orange-600">
//                     {Math.round(exerciseSummaries.reduce((sum, s) => sum + s.avgStrength, 0) / exerciseSummaries.length)}
//                   </div>
//                   <div className="text-sm text-slate-600">平均強度</div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   )
// }
