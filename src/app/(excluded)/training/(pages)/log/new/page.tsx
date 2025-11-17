import {redirect} from 'next/navigation'
import {LogForm} from '../../../(components)/Log/LogForm'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getExerciseMasters, getWorkoutlogListByDate} from '../../../server-actions/workout-log'

export default async function NewLogPage(props) {
  const searchParams = await props.searchParams
  const {session} = await initServerComopnent({query: searchParams})

  if (!session) {
    return redirect('/login')
  }

  const userId = session.id
  const date = searchParams.date as string

  if (!date) {
    return redirect('/training')
  }

  // サーバーサイドでデータを取得
  const masters = await getExerciseMasters(userId)
  const logList = await getWorkoutlogListByDate(userId, date)

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <LogForm masters={masters} logList={logList} selectedDate={date} />
    </div>
  )
}
