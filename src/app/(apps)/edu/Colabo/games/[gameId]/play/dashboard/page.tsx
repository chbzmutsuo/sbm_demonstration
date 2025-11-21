import {initServerComopnent} from 'src/non-common/serverSideFunction'
import Redirector from '@cm/components/utils/Redirector'
import ColaboGamePlayPage from '../ColaboGamePlayPage'
import {GameCl} from '@app/(apps)/edu/Colabo/class/GameCl'

const DashboardPage = async props => {
  const params = await props.params
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const gameId = Number(params.gameId)

  // 教師のみアクセス可能：ログインチェック
  if (!session?.id) {
    return <Redirector redirectPath={`/login`} />
  }

  // Gameの詳細を取得
  const game = await GameCl.getCurrentSlideAnswers(gameId)

  if (!game) {
    return <div className="p-6 text-center">Gameが見つかりません</div>
  }

  // 教師本人確認
  if (game.teacherId !== session.id) {
    return <div className="p-6 text-center text-red-600">このGameにアクセスする権限がありません</div>
  }

  // 操作ダッシュボード：教師用の操作画面
  return (
    <ColaboGamePlayPage
      game={JSON.parse(JSON.stringify(game))}
      role="teacher"
      userId={session.id}
      student={null}
    />
  )
}

export default DashboardPage


