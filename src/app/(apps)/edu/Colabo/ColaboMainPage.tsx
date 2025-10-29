'use client'

import {Button} from '@cm/components/styles/common-components/Button'
import GameCreateForm from './parts/GameCreateForm'
import Link from 'next/link'
import useModal from '@cm/components/utils/modal/useModal'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import SocketInitializer from './components/SocketInitializer'

interface ColaboMainPageProps {
  myGames: any[]
  schools: any[]
  teachers: any[]
  subjects: any[]
  classrooms: any[]
  session: any
}

export default function ColaboMainPage({myGames, schools, teachers, subjects, classrooms, session}: ColaboMainPageProps) {
  // const [showCreateForm, setShowCreateForm] = useState(false)
  const CreateFormModalReturn = useModal()
  const {query} = useGlobal()

  return (
    <div className="container mx-auto p-6">
      {/* Socket.ioサーバー初期化 */}
      <SocketInitializer />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Colabo - インタラクティブスライド授業</h1>
        <p className="text-gray-600">リアルタイムでつながる、双方向授業プラットフォーム</p>
      </div>

      {/* Game作成フォーム（モーダル） */}

      <CreateFormModalReturn.Modal>
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">新しい授業を作成</h2>
          </div>
          <div className="p-6">
            <GameCreateForm
              schools={schools}
              teachers={teachers}
              subjects={subjects}
              classrooms={classrooms}
              onClose={() => CreateFormModalReturn.handleClose()}
              defaultSchoolId={session.scopes?.schoolId}
              defaultTeacherId={session.id}
            />
          </div>
        </div>
      </CreateFormModalReturn.Modal>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 新規作成カード */}
        <div
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => CreateFormModalReturn.handleOpen()}
        >
          <div className="text-4xl mb-4">➕</div>
          <h2 className="text-xl font-semibold mb-2">新しい授業を作成</h2>
          <p className="text-blue-100 text-sm">スライドを使ったインタラクティブな授業を始めましょう</p>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">授業統計</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">総授業数</span>
              <span className="font-bold text-xl">{myGames.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">今月</span>
              <span className="font-bold">
                {
                  myGames.filter(g => {
                    const date = new Date(g.date)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length
                }
              </span>
            </div>
          </div>
        </div>

        {/* クイックアクセス */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">クイックアクセス</h3>
          <div className="space-y-2">
            <Link href="/edu/Colabo/enter" className="block text-blue-600 hover:text-blue-800 hover:underline">
              📱 生徒入室画面
            </Link>
            <Link href="/edu/Grouping" className="block text-blue-600 hover:text-blue-800 hover:underline">
              👥 Groupingアプリ
            </Link>
          </div>
        </div>
      </div>

      {/* Game一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">授業一覧</h2>
        </div>
        <div className="p-6">
          {myGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGames.map(game => (
                <Link
                  key={game.id}
                  href={HREF(`/edu/Colabo/games/${game.id}/slides`, {}, query)}
                  className="block border rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{game.name}</h3>
                    {game.Slide?.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{game.Slide.length}枚</span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>
                        {new Date(game.date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'})}
                      </span>
                    </div>
                    {game.SubjectNameMaster && (
                      <div className="flex items-center">
                        <span className="mr-2">📚</span>
                        <span>{game.SubjectNameMaster.name}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="mr-2">👥</span>
                      <span>{game.GameStudent?.length || 0}名</span>
                    </div>
                    {game.School && (
                      <div className="flex items-center">
                        <span className="mr-2">🏫</span>
                        <span className="text-xs">{game.School.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-xs text-gray-500">ID: {game.secretKey}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">まだ授業がありません</h3>
              <p className="text-gray-500 mb-6">「新しい授業を作成」から最初の授業を始めましょう</p>
              <Button onClick={() => CreateFormModalReturn.handleOpen()} className="bg-blue-600 hover:bg-blue-700">
                授業を作成
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
