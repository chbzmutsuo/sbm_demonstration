'use client'

import { Button } from '@cm/components/styles/common-components/Button'
import { SlideBlock } from '../../../(components)/SlideBlock'
import { useState, useEffect } from 'react'
import { getSlideAnswers, updateSlideMode, updateCurrentSlide, deleteSlideAnswer } from '../../../colabo-server-actions'
import { toast } from 'react-toastify'
import type { GameData, SlideData, SlideMode, SlideAnswer, AnswerStats } from '../../../types/game-types'
import { calculateScores } from '../../../lib/psycho-questions'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

interface SocketActions {
  changeSlide: (slideId: number, slideIndex: number) => void
  changeMode: (slideId: number, mode: SlideMode) => void
  closeAnswer: (slideId: number) => void
  shareAnswer: (slideId: number, answerId: number, isAnonymous: boolean) => void
  revealCorrect: (slideId: number) => void
}

interface TeacherViewProps {
  game: GameData
  currentSlide: SlideData | null
  currentSlideIndex: number
  currentSlideMode: SlideMode | null
  answerStats: AnswerStats | null
  socket: SocketActions
  onSlideChange: (slideId: number, index: number) => void
}

export default function NewTeacherView({
  game,
  currentSlide,
  currentSlideIndex,
  currentSlideMode,
  answerStats,
  socket,
  onSlideChange,
}: TeacherViewProps) {
  const { query } = useGlobal()
  const [answers, setAnswers] = useState<SlideAnswer[]>([])
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false)

  const totalSlides = game.Slide?.length || 0
  const totalStudents = game.GameStudent?.length || 0

  // プロジェクター画面を開く
  const openProjectorView = () => {
    const url = new URL(window.location.href)
    const baseUrl = url.origin + url.pathname.replace(/\/$/, '')
    const projectorUrl = HREF(`${baseUrl}/projector`, {}, query)

    window.open(projectorUrl, 'dashboardWindow', 'width=1024,height=768')
  }

  // ダッシュボード画面を開く
  const openDashboardView = () => {
    const url = new URL(window.location.href)
    const baseUrl = url.origin + url.pathname.replace(/\/$/, '')
    const dashboardUrl = HREF(`${baseUrl}/dashboard`, {}, query)

    window.open(dashboardUrl, 'dashboardWindow', 'width=1024,height=768')
  }

  // スライドを切り替え
  const handleChangeSlide = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= totalSlides) return

    const newSlide = game.Slide?.[newIndex]
    if (newSlide) {
      // DBに教師の現在のスライドを保存
      await updateCurrentSlide(game.id, newSlide.id)

      // Socket.io経由で全員に通知
      socket.changeSlide(newSlide.id, newIndex)
      onSlideChange(newSlide.id, newIndex)
    }
  }

  // モードを変更
  const handleChangeMode = async (mode: SlideMode) => {
    if (!currentSlide) return

    // DBにモードを保存
    await updateSlideMode(currentSlide.id, mode)

    // Socket.io経由で全員に通知
    socket.changeMode(currentSlide.id, mode)
  }

  // 回答を締め切る
  const handleCloseAnswer = () => {
    if (!currentSlide) return
    socket.closeAnswer(currentSlide.id)
  }

  // 回答を取得（共有状態も含む）
  const loadAnswers = async () => {
    if (!currentSlide) return

    setIsLoadingAnswers(true)
    try {
      const result = await getSlideAnswers(currentSlide.id)
      if (result.success && result.answers) {
        setAnswers(result.answers as unknown as SlideAnswer[])
      }
    } catch (error) {
      console.error('回答取得エラー:', error)
      toast.error('回答の取得に失敗しました')
    } finally {
      setIsLoadingAnswers(false)
    }
  }

  // 回答を削除
  const handleDeleteAnswer = async (answerId: number, studentName: string) => {
    if (!currentSlide) return

    const confirmed = window.confirm(`${studentName}の回答を削除しますか？`)
    if (!confirmed) return

    try {
      const answer = answers.find(a => a.id === answerId)
      if (!answer) return

      const result = await deleteSlideAnswer(currentSlide.id, answer.studentId)

      if (result.success) {
        toast.success('回答を削除しました')
        // 回答リストを再取得
        await loadAnswers()
      } else {
        toast.error('回答の削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライドが変わったら回答を取得（常に表示）
  useEffect(() => {
    if (currentSlide?.id) {
      loadAnswers()
    }
  }, [currentSlide?.id])

  // 回答更新を監視（常に更新）
  useEffect(() => {
    if (answerStats && currentSlide?.id) {
      loadAnswers()
    }
  }, [answerStats?.answerCount])

  return (
    <div className="grid grid-cols-[1fr_400px] gap-4">
      {/* 左側: スライド表示とコントロール */}
      <div className="space-y-4">
        {/* コントロールパネル */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* 画面切り替えボタン */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <Button onClick={openProjectorView} className="bg-purple-600 hover:bg-purple-700 text-xs" size="sm">
              📺 プロジェクター画面を開く
            </Button>
            <Button onClick={openDashboardView} className="bg-orange-600 hover:bg-orange-700 text-xs" size="sm">
              🎛️ ダッシュボードを開く
            </Button>
          </div>

          {/* スライド情報 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{currentSlide?.contentData?.title || 'スライド'}</h2>
            <div className="text-sm text-gray-600">
              {currentSlideIndex + 1} / {totalSlides}
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => handleChangeSlide(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
              className="bg-gray-600 hover:bg-gray-700"
            >
              ← 前のスライド
            </Button>
            <div className="text-sm text-gray-600">スライド #{currentSlideIndex + 1}</div>
            <Button
              onClick={() => handleChangeSlide(currentSlideIndex + 1)}
              disabled={currentSlideIndex >= totalSlides - 1}
              className="bg-gray-600 hover:bg-gray-700"
            >
              次のスライド →
            </Button>
          </div>

          {/* モード切り替え */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleChangeMode('view')}
              className={currentSlideMode === 'view' ? 'bg-blue-600' : 'bg-gray-400'}
            >
              📺 表示
            </Button>
            <Button
              onClick={() => handleChangeMode('answer')}
              className={currentSlideMode === 'answer' ? 'bg-green-600' : 'bg-gray-400'}
              disabled={currentSlide?.templateType === 'normal'}
            >
              ✍️ 回答
            </Button>
            <Button
              onClick={() => handleChangeMode('result')}
              className={currentSlideMode === 'result' ? 'bg-purple-600' : 'bg-gray-400'}
              disabled={currentSlide?.templateType === 'normal'}
            >
              📊 結果
            </Button>
          </div>

          {/* 回答締切ボタン */}
          {currentSlideMode === 'answer' && (
            <div className="mt-4">
              <Button onClick={handleCloseAnswer} className="w-full bg-red-600 hover:bg-red-700">
                ⏱️ 回答を締め切る
              </Button>
            </div>
          )}
        </div>

        {/* スライドプレビュー */}
        {currentSlide ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{currentSlide.contentData?.title || 'スライドプレビュー'}</h3>
            <div className="space-y-4 min-h-96">
              {/* ノーマルスライド */}
              {currentSlide.templateType === 'normal' && (
                <div className="space-y-6">
                  {(() => {
                    // rows構造があればrowsを使用、なければblocksを使用（後方互換）
                    const rows = currentSlide.contentData?.rows
                    const blocks = currentSlide.contentData?.blocks

                    if (rows && rows.length > 0) {
                      return rows.map((row: any, rowIndex: number) => (
                        <div
                          key={row.id || rowIndex}
                          className="grid gap-4"
                          style={{
                            gridTemplateColumns: `repeat(${row.columns || 1}, minmax(0, 1fr))`,
                          }}
                        >
                          {row.blocks?.map((block: any, blockIndex: number) => (
                            <SlideBlock key={block.id || blockIndex} block={block} isPreview={true} />
                          ))}
                        </div>
                      ))
                    } else if (blocks && blocks.length > 0) {
                      return blocks.map((block: any, index: number) => (
                        <SlideBlock key={index} block={block} isPreview={true} />
                      ))
                    }
                    return null
                  })()}
                </div>
              )}

              {/* 選択クイズ */}
              {currentSlide.templateType === 'choice' && (
                <div className="space-y-4">
                  {currentSlide.contentData?.question && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-lg font-medium">{currentSlide.contentData.question}</p>
                    </div>
                  )}
                  {currentSlide.contentData?.choices && currentSlide.contentData.choices.length > 0 && (
                    <div className="space-y-2">
                      {currentSlide.contentData.choices.map((choice, index) => (
                        <div
                          key={choice.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${choice.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">{choice.text}</div>
                          {choice.isCorrect && <span className="text-green-600 font-bold">✓ 正解</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 自由記述 */}
              {currentSlide.templateType === 'freetext' && currentSlide.contentData?.question && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-lg font-medium whitespace-pre-wrap">{currentSlide.contentData.question}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">スライドがありません</p>
          </div>
        )}
      </div>

      {/* 右側: 回答状況・結果表示 */}
      <div className="space-y-4">
        {/* 参加者情報 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">参加状況</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">参加生徒</span>
              <span className="font-bold">{totalStudents}名</span>
            </div>
            {answerStats && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">回答済み</span>
                <span className="font-bold text-green-600">
                  {answerStats.answerCount} / {totalStudents}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 現在のモード */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">現在のモード</h3>
          <div className="text-center py-2">
            {currentSlideMode === 'view' && <div className="text-blue-600 font-bold">📺 表示モード</div>}
            {currentSlideMode === 'answer' && <div className="text-green-600 font-bold">✍️ 回答モード</div>}
            {currentSlideMode === 'result' && <div className="text-purple-600 font-bold">📊 結果モード</div>}
            {!currentSlideMode && <div className="text-gray-400">モードが選択されていません</div>}
          </div>
        </div>

        {/* 回答一覧（常に表示） */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">回答一覧</h3>
            <Button size="sm" onClick={loadAnswers} disabled={isLoadingAnswers}>
              🔄 更新
            </Button>
          </div>

          {isLoadingAnswers ? (
            <div className="text-center py-4 text-gray-500">読み込み中...</div>
          ) : answers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {answers.map(answer => {
                const answerDataParsed = typeof answer.answerData === 'string' ? JSON.parse(answer.answerData) : answer.answerData

                return (
                  <div key={answer.id} className="bg-white border border-gray-200 rounded p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{answer.Student?.name}</div>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteAnswer(answer.id, answer.Student?.name || '生徒')}
                        className="bg-red-600 hover:bg-red-700 text-xs"
                      >
                        削除
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {answerDataParsed.type === 'choice' && currentSlide?.contentData?.choices && (
                        <div>
                          <div className="mb-1">選択: {currentSlide.contentData.choices[answerDataParsed.choiceIndex]?.text}</div>
                          {/* 結果モードの場合、正答を自動表示 */}
                          {currentSlideMode === 'result' && (
                            <div className="mt-2 p-2 bg-green-50 rounded">
                              <div className="font-semibold text-green-700 mb-1">正答:</div>
                              {currentSlide.contentData.choices
                                ?.filter((choice: any) => choice.isCorrect)
                                .map((correctChoice: any, index: number) => (
                                  <div key={index} className="text-green-600">
                                    ✓ {correctChoice.text}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                      {answerDataParsed.type === 'freetext' && (
                        <div className="whitespace-pre-wrap">{answerDataParsed.textAnswer}</div>
                      )}
                      {answerDataParsed.type === 'psycho' && (
                        <div className="space-y-1">
                          {(() => {
                            const { curiocity, efficacy } = calculateScores(answerDataParsed)
                            return (
                              <>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-purple-600">好奇心:</span>
                                  <span className="font-bold">{curiocity}/25</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-purple-500 h-2 rounded-full"
                                      style={{ width: `${(curiocity / 25) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-blue-600">効力感:</span>
                                  <span className="font-bold">{efficacy}/25</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${(efficacy / 25) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                {answerDataParsed.impression && (
                                  <div className="mt-2 p-2 bg-pink-50 rounded text-gray-700">
                                    <div className="font-semibold text-pink-700 mb-1">感想:</div>
                                    <div className="whitespace-pre-wrap">{answerDataParsed.impression}</div>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">回答がまだありません</div>
          )}
        </div>
      </div>
    </div>
  )
}
