import {redirect, notFound} from 'next/navigation'
import {LogForm} from '../../../../(components)/Log/LogForm'

import {getExerciseMasters, getWorkoutLogById, getWorkoutlogListByDate} from '../../../../server-actions/workout-log'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function EditLogPage(props) {
  const query = await props.searchParams
  const params = await props.params
  const {session} = await initServerComopnent({query: query})

  if (!session) {
    return redirect('/login')
  }

  console.log(params) //////logList
  const userId = session.id
  const logId = parseInt(params.id)

  if (isNaN(logId)) {
    return notFound()
  }

  // サーバーサイドでデータを取得
  const editingLog = await getWorkoutLogById(logId)

  if (!editingLog || editingLog.userId !== userId) {
    return notFound()
  }

  const date = editingLog.date.toISOString().split('T')[0]
  const masters = await getExerciseMasters(userId)
  const logList = await getWorkoutlogListByDate(userId, date)

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <LogForm masters={masters} logList={logList} editingLog={editingLog} selectedDate={date} />
    </div>
  )
}
