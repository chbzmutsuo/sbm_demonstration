import {redirect} from 'next/navigation'
import {LogListView} from '../../(components)/Log/LogListView'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getWorkoutlogListByDate, getPRLogIds} from '../../server-actions/workout-log'

export default async function TrainingDatePage(props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session) {
    return redirect('/login')
  }

  const userId = session.id
  const date = query.date as string

  if (!date) {
    return redirect('/training')
  }

  // サーバーサイドでデータを取得
  const logList = await getWorkoutlogListByDate(userId, date)
  const prLogIds = await getPRLogIds(
    userId,
    logList.map(log => log.id)
  )

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <LogListView userId={userId} selectedDate={date} logList={logList} prLogIds={prLogIds} />
    </div>
  )
}
