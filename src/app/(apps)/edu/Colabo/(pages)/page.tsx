import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import Link from 'next/link'
import {HREF} from '@cm/lib/methods/urls'

const Page = async props => {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session?.id) {
    return <Redirector redirectPath={'/login'} />
  }

  // Get teacher's recent games and slides
  const totalGameCount = await prisma.game.count({
    where: {teacherId: session.id},
    orderBy: [{date: 'desc'}],
  })
  const recentGames = await prisma.game.findMany({
    where: {teacherId: session.id},
    orderBy: [{date: 'desc'}],
    take: 5,
    include: {
      School: true,
      Slide: {
        orderBy: {sortOrder: 'asc'},
        take: 3,
      },
      GameStudent: {include: {Student: true}},
    },
  })

  const totalSlides = await prisma.slide.count({
    where: {
      Game: {teacherId: session.id},
    },
  })

  const totalResponses = await prisma.slideAnswer.count({
    where: {
      Game: {teacherId: session.id},
    },
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Colabo ダッシュボード</h1>
        <p className="text-gray-600">インタラクティブスライド授業の管理画面です</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総授業数</p>
              <p className="text-2xl font-bold text-gray-900">{totalGameCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総スライド数</p>
              <p className="text-2xl font-bold text-gray-900">{totalSlides}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総回答数</p>
              <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブ授業</p>
              <p className="text-2xl font-bold text-gray-900">{recentGames.filter(g => g.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* アクションカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">新しい授業を作成</h2>
          <p className="text-gray-600 mb-4">スライドを使ったインタラクティブな授業を開始しましょう</p>
          <Link
            href={HREF('/edu/game', {mode: 'create'}, query)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            授業を作成
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">スライドを編集</h2>
          <p className="text-gray-600 mb-4">既存のスライドを編集したり、新しいスライドを追加できます</p>
          <Link
            href={HREF('/edu/colabo/slide', {}, query)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            スライド管理
          </Link>
        </div>
      </div>

      {/* 最近の授業 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">最近の授業</h2>
        </div>
        <div className="p-6">
          {recentGames.length > 0 ? (
            <div className="space-y-4">
              {recentGames.map(game => (
                <div key={game.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{game.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(game.date).toLocaleDateString('ja-JP')} • スライド数: {game.Slide?.length || 0} • 参加者:{' '}
                        {game.GameStudent?.length || 0}人
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={HREF(`/edu/colabo/slide-editor/${game.id}`, {}, query)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                      >
                        編集
                      </Link>
                      <Link
                        href={HREF(`/edu/colabo/presentation/${game.secretKey}`, {as: 'teacher'}, query)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                      >
                        開始
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">授業がありません</h3>
              <p className="mt-1 text-sm text-gray-500">最初の授業を作成してみましょう</p>
              <div className="mt-6">
                <Link
                  href={HREF('/edu/game', {mode: 'create'}, query)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  授業を作成
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
