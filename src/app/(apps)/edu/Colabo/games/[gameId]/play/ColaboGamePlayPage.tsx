'use client'

import {useState} from 'react'
import {useColaboSocket, type SlideStates} from '../../../hooks/useColaboSocket'
import {type SlideMode} from '../../../lib/socket-config'

import StudentView from './StudentView'
import {Button} from '@cm/components/styles/common-components/Button'
import NewTeacherView from '@app/(apps)/edu/Colabo/games/[gameId]/play/NewTeacherView'

interface ColaboGamePlayPageProps {
  game: any
  role: 'teacher' | 'student'
  userId: number
  student: any | null
}

export default function ColaboGamePlayPage({game, role, userId, student}: ColaboGamePlayPageProps) {
  // DBから取得した初期スライドモード状態を設定
  const initialSlideStates: SlideStates = {}
  game.Slide.forEach((slide: any) => {
    initialSlideStates[slide.id] = (slide.mode as SlideMode) || null
  })

  // DBから取得したcurrentSlideIdを初期インデックスに設定（教師・生徒共通）
  const initialSlideIndex = (() => {
    if (game.currentSlideId) {
      const index = game.Slide.findIndex((slide: any) => slide.id === game.currentSlideId)
      return index >= 0 ? index : 0
    }
    return 0
  })()

  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex)
  const [slideStates, setSlideStates] = useState<SlideStates>(initialSlideStates)
  const [answerStats, setAnswerStats] = useState<any>(null)
  const [sharedAnswers, setSharedAnswers] = useState<any[]>([])
  const [isCorrectRevealed, setIsCorrectRevealed] = useState(false)

  // Socket.io接続
  const socket = useColaboSocket({
    gameId: game.id,
    role,
    userId,
    userName: role === 'student' ? student?.name : game.Teacher?.name,
    onSlideChange: (slideId, slideIndex) => {
      console.log('スライド変更:', {slideId, slideIndex})
      setCurrentSlideIndex(slideIndex)
      // スライドが変わったらリセット
      setIsCorrectRevealed(false)
      setSharedAnswers([])
    },
    onSlideModeChange: (slideId, mode) => {
      console.log('スライドモード変更:', {slideId, mode})
      setSlideStates(prev => ({...prev, [slideId]: mode}))
      if (mode === 'view') {
        // 表示モードに戻ったらリセット
        setIsCorrectRevealed(false)
      }
    },
    onSlideStatesSync: states => {
      console.log('スライド状態同期:', states)
      setSlideStates(states)
    },
    onCurrentSlideSync: currentSlideId => {
      console.log('現在スライド同期:', currentSlideId)
      if (currentSlideId !== null) {
        const index = game.Slide.findIndex((slide: any) => slide.id === currentSlideId)
        if (index >= 0 && index !== currentSlideIndex) {
          console.log('Socket.ioからスライドインデックス更新:', index)
          setCurrentSlideIndex(index)
        }
      }
    },
    onAnswerUpdate: data => {
      // 教師のみ：回答状況の更新
      if (role === 'teacher') {
        setAnswerStats(data)
      }
    },
    onAnswerSaved: data => {
      // 生徒のみ：回答保存完了
      console.log('回答が保存されました:', data)
    },
    onSharedAnswer: data => {
      // 共有された回答を追加
      setSharedAnswers(prev => [...prev, data])
    },
    onRevealCorrect: data => {
      // 正答公開
      setIsCorrectRevealed(true)
    },
  })

  const currentSlide = game.Slide[currentSlideIndex ?? 0] || null
  const currentSlideMode = currentSlide ? slideStates[currentSlide.id] : null

  // 接続状態の表示
  const connectionStatusBadge = () => {
    const statusConfig = {
      connected: {color: 'bg-green-500', text: '接続中'},
      connecting: {color: 'bg-yellow-500', text: '接続中...'},
      disconnected: {color: 'bg-gray-500', text: '未接続'},
      error: {color: 'bg-red-500', text: 'エラー'},
    }

    const config = statusConfig[socket.connectionStatus] || statusConfig.disconnected

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <span className="text-sm text-gray-600">{config.text}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{game.name}</h1>
              <p className="text-sm text-gray-600">{role === 'teacher' ? '教師用画面' : `生徒: ${student?.name}`}</p>
            </div>
            <div className="flex items-center space-x-4">
              {connectionStatusBadge()}
              {currentSlide && (
                <div className="text-sm text-gray-600">
                  スライド {currentSlideIndex + 1} / {game.Slide.length}
                  {role === 'student' && (
                    <span className="ml-2 text-xs">
                      (ID: {currentSlide.id}, Mode: {currentSlideMode || 'なし'})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto p-4">
        {!socket.isConnected ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">🔌</div>
            <h2 className="text-xl font-semibold mb-2">サーバーに接続中...</h2>
            <p className="text-gray-600 mb-4">リアルタイム通信を確立しています</p>
            {socket.connectionStatus === 'error' && (
              <Button onClick={socket.connect} className="bg-blue-600 hover:bg-blue-700">
                再接続
              </Button>
            )}
          </div>
        ) : (
          <>
            {role === 'teacher' ? (
              <NewTeacherView
                game={game}
                currentSlide={currentSlide}
                currentSlideIndex={currentSlideIndex}
                currentSlideMode={currentSlideMode}
                answerStats={answerStats}
                socket={socket}
                onSlideChange={setCurrentSlideIndex}
              />
            ) : (
              <StudentView
                game={game}
                currentSlide={currentSlide}
                currentSlideMode={currentSlideMode}
                student={student}
                socket={socket}
                sharedAnswers={sharedAnswers}
                isCorrectRevealed={isCorrectRevealed}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
