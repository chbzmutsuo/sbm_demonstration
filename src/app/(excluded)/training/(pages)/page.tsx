import {redirect} from 'next/navigation'
import {CalendarView} from '../(components)/Calendar/CalendarView'

import {getWorkoutDatesForMonth, getWorkoutDataByDate} from '../server-actions/workout-log'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

export default async function TrainingPage(props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session) {
    return redirect('/login')
  }

  const userId = session.id

  // 現在の日付を取得
  const now = getMidnight()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // サーバーサイドでデータを取得
  const workoutDates = await getWorkoutDatesForMonth(userId, year, month)
  const workoutDataByDate = await getWorkoutDataByDate(userId, year, month)

  return (
    <div className="container mx-auto max-w-lg p-4">
      {/* <div className={` border border-red-500  p-4 bg-red-100 text-center  font-bold underline text-2xl absolute left-[200px]`}>
        aiueo
      </div> */}
      <CalendarView currentDate={now} workoutDates={workoutDates} workoutDataByDate={workoutDataByDate} />
    </div>
  )
}
