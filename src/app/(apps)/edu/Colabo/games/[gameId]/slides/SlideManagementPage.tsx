'use client'

import { useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import QRCodeDisplay from '../../../parts/QRCodeDisplay'
import Link from 'next/link'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'
import LeftSidebar from '../../../components/slides/LeftSidebar'
import CenterPreview from '../../../components/slides/CenterPreview'
import RightSidebar from '../../../components/slides/RightSidebar'
import useModal from '@cm/components/utils/modal/useModal'
import useSlideHandlers from './useSlideHandlers'
import {useJotaiByKey} from '@cm/hooks/useJotai'
import { R_Stack} from '@cm/components/styles/common-components/common-components'
import {Card} from '@cm/shadcn/ui/card'
import useWindowSize from '@cm/hooks/useWindowSize'

interface SlideManagementPageProps {
  game: any
}

export default function SlideManagementPage({game}: SlideManagementPageProps) {
  const {query, router} = useGlobal()

  const [slides, setSlides] = useJotaiByKey<any[]>(`slides_${game.id}`, game.Slide || [])
  const [selectedSlideId, setSelectedSlideId] = useJotaiByKey<number | null>(`selectedSlideId_${game.id}`, slides[0]?.id || null)
  const QRModalReturn = useModal()

  // 選択中のスライドを取得
  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId) || null

  // スライドが追加/削除された時に選択を更新
  useEffect(() => {
    if (slides.length > 0 && !selectedSlideId) {
      setSelectedSlideId(slides[0].id)
    }
  }, [slides, selectedSlideId])

  const {handleAddSlide, handleUpdateSlide, handleDeleteSlide, handleReorderSlides} = useSlideHandlers({
    game,
    slides,
    selectedSlideId,
    setSlides,
    setSelectedSlideId,
    router,
  })

  const {appbarHeight, bodyHeight = 0} = useWindowSize()

  const headerHeight = 70

  const panelStyle = {
    border: '0.5px solid #e0e0e0',
    background: 'white',
    maxHeight: bodyHeight - appbarHeight - headerHeight - 20,
    overflow: 'auto',
  }

  return (
    <div className="flex flex-col  bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm flex-shrink-0" style={{height: headerHeight}}>
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <Link href={HREF(`/edu/Colabo`, {}, query)} className="text-blue-600 hover:underline text-sm  inline-block">
                ← 授業一覧に戻る
              </Link>
              <R_Stack>
                <h1 className="text-2xl font-bold">{game.name}</h1>
                <p className="text-sm text-gray-600 ">
                  {new Date(game.date).toLocaleDateString('ja-JP')} • {game.School?.name}
                </p>
              </R_Stack>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => QRModalReturn.handleOpen()} className="bg-green-600 hover:bg-green-700">
                📱 QRコード
              </Button>
              <Link href={HREF(`/edu/Colabo/games/${game.id}/play`, {as: 'teacher'}, query)}>
                <Button className="bg-purple-600 hover:bg-purple-700">▶️ 授業開始</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QRコードモーダル */}
      <QRModalReturn.Modal>
        <QRCodeDisplay secretKey={game.secretKey} gameName={game.name} />
      </QRModalReturn.Modal>

      {/* メインコンテンツ: 3ペインレイアウト */}
      <Card>
        <R_Stack className=" justify-center items-stretch bg-gray-100 p-3  rounded w-fit mx-auto gap-0 ">
          {/* 左サイドバー: スライドサムネイル */}
          <div style={panelStyle}>
            <LeftSidebar
              slides={slides}
              selectedSlideId={selectedSlideId}
              onSelectSlide={setSelectedSlideId}
              onReorderSlides={handleReorderSlides}
              onAddSlide={handleAddSlide}
            />
          </div>

          {/* 中央: スライドプレビュー */}
          <div style={panelStyle}>
            <CenterPreview
              slides={slides}
              selectedSlideId={selectedSlideId}
              onSelectSlide={setSelectedSlideId}
              handleDeleteSlide={handleDeleteSlide}
              handleUpdateSlide={handleUpdateSlide}
            />
          </div>

          {/* 右サイドバー: 編集パネル */}
          <div style={panelStyle}>
            <RightSidebar
              selectedSlide={selectedSlide}
              handleUpdateSlide={handleUpdateSlide}
              handleDeleteSlide={handleDeleteSlide}
            />
          </div>
        </R_Stack>
      </Card>
    </div>
  )
}
