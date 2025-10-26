'use client'

import {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {SlideBlock} from '../../../(components)/SlideBlock'
import {saveSlideAnswer, deleteSlideAnswer} from '../../../colabo-server-actions'
import {toast} from 'react-toastify'
import {gameDataType} from '@app/(apps)/edu/Colabo/class/GameCl'
import PsychoAnswerForm from '../../../components/psycho/PsychoAnswerForm'

interface StudentViewProps {
  game: gameDataType
  currentSlide: any
  currentSlideMode: 'view' | 'answer' | 'result' | null
  student: any
  socket: any
  sharedAnswers: any[]
  isCorrectRevealed: boolean
}

export default function StudentView({
  game,
  currentSlide,
  currentSlideMode,
  student,
  socket,
  sharedAnswers,
  isCorrectRevealed,
}: StudentViewProps) {
  const [answerData, setAnswerData] = useState<any>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // スライドが変わったらリセット
  useEffect(() => {
    const theSlide = game.Slide.find((slide: any) => slide.id === currentSlide?.id)

    if (theSlide) {
      const Answers = theSlide?.SlideAnswer.find((answer: any) => answer.studentId === student.id)
      if (Answers) {
        setAnswerData(Answers.answerData)
        setHasSubmitted(true)
        return
      }
    }

    setAnswerData(null)
    setHasSubmitted(false)
  }, [currentSlide?.id])

  // 回答を送信
  const handleSubmitAnswer = async () => {
    if (!currentSlide || !answerData) {
      toast.error('回答を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      // DBに保存
      const result = await saveSlideAnswer({
        gameId: game.id,
        slideId: currentSlide.id,
        studentId: student.id,
        answerData,
      })

      if (result.success) {
        // Socket.ioで教師に通知
        socket.submitAnswer(currentSlide.id, answerData)
        setHasSubmitted(true)
        toast.success('回答を送信しました')
      } else {
        toast.error(result.error || '回答の送信に失敗しました')
      }
    } catch (error) {
      console.error('回答送信エラー:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 選択クイズの回答
  const handleChoiceAnswer = (choiceIndex: number) => {
    if (hasSubmitted) return
    setAnswerData({type: 'choice', choiceIndex, timestamp: new Date().toISOString()})
  }

  // 自由記述の回答
  const handleTextAnswer = (text: string) => {
    setAnswerData({type: 'freetext', text, timestamp: new Date().toISOString()})
  }

  // 心理アンケートの回答送信
  const handlePsychoSubmit = async (psychoAnswerData: any) => {
    if (!currentSlide) {
      toast.error('スライドが選択されていません')
      return
    }

    setIsSubmitting(true)
    try {
      // DBに保存
      const result = await saveSlideAnswer({
        gameId: game.id,
        slideId: currentSlide.id,
        studentId: student.id,
        answerData: {type: 'psycho', ...psychoAnswerData, timestamp: new Date().toISOString()},
      })

      if (result.success) {
        // Socket.ioで教師に通知
        socket.submitAnswer(currentSlide.id, psychoAnswerData)
        setHasSubmitted(true)
        setAnswerData({type: 'psycho', ...psychoAnswerData})
        toast.success('回答を送信しました')
      } else {
        toast.error(result.error || '回答の送信に失敗しました')
      }
    } catch (error) {
      console.error('心理アンケート回答送信エラー:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 回答をやり直し
  const handleRetryAnswer = async () => {
    if (!currentSlide) return

    const confirmed = window.confirm('回答をやり直しますか？現在の回答が削除されます。')
    if (!confirmed) return

    try {
      const result = await deleteSlideAnswer(currentSlide.id, student.id)

      if (result.success) {
        setAnswerData(null)
        setHasSubmitted(false)
        toast.success('回答を削除しました。やり直してください。')
      } else {
        toast.error('回答の削除に失敗しました')
      }
    } catch (error) {
      console.error('回答削除エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // 待機画面
  if (hasSubmitted && currentSlideMode === 'answer') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">回答を送信しました</h2>
          <p className="text-gray-600 mb-4">他の人の回答を待っています...</p>
          <div className="animate-pulse text-blue-600 mb-6">⏳</div>
          <Button onClick={handleRetryAnswer} className="bg-orange-600 hover:bg-orange-700">
            回答をやり直す
          </Button>
        </div>
      </div>
    )
  }

  // 表示モード or 結果モード
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">{currentSlide?.contentData?.title || 'スライド'}</h2>
            <div className="text-sm text-gray-600">
              {student.name} ({student.attendanceNumber ? `出席番号: ${student.attendanceNumber}` : ''})
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentSlideMode === 'view' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📺 表示中</span>
            )}
            {currentSlideMode === 'answer' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✍️ 回答してください</span>
            )}
            {currentSlideMode === 'result' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">📊 結果表示</span>
            )}
          </div>
        </div>

        {/* スライド内容 */}
        {currentSlide ? (
          <div className="space-y-6">
            {/* ノーマルスライドのブロック表示 */}
            {currentSlide.templateType === 'normal' && (
              <div className="space-y-4">
                {currentSlide.contentData?.blocks?.map((block: any, index: number) => (
                  <SlideBlock key={index} block={block} isPreview={true} />
                ))}
              </div>
            )}

            {/* 選択クイズ・自由記述の問題文表示 */}
            {(currentSlide.templateType === 'choice' || currentSlide.templateType === 'freetext') &&
              currentSlide.contentData?.question && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-800 whitespace-pre-wrap">{currentSlide.contentData.question}</p>
                </div>
              )}

            {/* 心理アンケートの表示・回答（全モード） */}
            {currentSlide.templateType === 'psycho' && (
              <div>
                <PsychoAnswerForm
                  gameId={game.id}
                  slideId={currentSlide.id}
                  studentId={student.id}
                  existingAnswer={game.Slide.find((s: any) => s.id === currentSlide.id)?.SlideAnswer?.find(
                    (a: any) => a.studentId === student.id
                  )}
                  onSubmit={handlePsychoSubmit}
                  isReadOnly={hasSubmitted || currentSlideMode === 'view'}
                  currentMode={currentSlideMode}
                  onRetry={handleRetryAnswer}
                />
              </div>
            )}

            {/* 回答フォーム（回答モード時、心理アンケート以外） */}
            {currentSlideMode === 'answer' && !hasSubmitted && currentSlide.templateType !== 'psycho' && (
              <div className="border-t pt-6">
                {currentSlide.templateType === 'choice' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-4">回答を選択してください</h3>
                    {currentSlide.contentData?.choices?.map((choice: any, index: number) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoiceAnswer(index)}
                        className={`
                          w-full text-left border-2 rounded-lg p-4 transition-all
                          ${answerData?.choiceIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                        `}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full border-2 mr-3 flex items-center justify-center font-bold ${
                              answerData?.choiceIndex === index
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            {answerData?.choiceIndex === index ? '✓' : index + 1}
                          </div>
                          <span className="text-lg">{choice.text}</span>
                        </div>
                      </button>
                    ))}
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!answerData || isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 mt-4 py-3 text-lg"
                    >
                      {isSubmitting ? '送信中...' : '回答を送信'}
                    </Button>
                  </div>
                )}

                {currentSlide.templateType === 'freetext' && (
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg mb-2">回答を入力してください</h3>
                    <textarea
                      value={answerData?.text || ''}
                      onChange={e => handleTextAnswer(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-4 min-h-32 focus:border-blue-500 focus:outline-none"
                      placeholder="ここに回答を入力してください..."
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!answerData?.text || isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
                    >
                      {isSubmitting ? '送信中...' : '回答を送信'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 結果表示（結果モード時） */}
            {currentSlideMode === 'result' && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">結果</h3>
                {/* 正答表示（選択クイズの場合）- 結果モードで自動表示 */}
                {currentSlide.templateType === 'choice' && (
                  <div className="mb-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">✅ 正解</h4>
                      <div className="space-y-2">
                        {currentSlide.contentData?.choices
                          ?.filter((choice: any) => choice.isCorrect)
                          .map((choice: any, index: number) => (
                            <div
                              key={choice.id}
                              className="bg-white rounded-lg p-3 border-2 border-green-500 flex items-center space-x-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                {currentSlide.contentData.choices.indexOf(choice) + 1}
                              </div>
                              <div className="flex-1">{choice.text}</div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 自分の回答の正誤 */}
                    {answerData && currentSlide.contentData?.choices && (
                      <div className="mt-4">
                        {currentSlide.contentData.choices[answerData.choiceIndex]?.isCorrect ? (
                          <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <div className="font-bold text-green-800 text-xl">正解です！</div>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-center">
                            <div className="text-4xl mb-2">💭</div>
                            <div className="font-bold text-red-800 text-xl">不正解です</div>

                            <div className="text-sm text-red-600 mt-2">
                              あなたの回答: {currentSlide.contentData.choices[answerData.choiceIndex]?.text}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 共有された回答（自由記述の場合） */}
                {sharedAnswers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">共有された回答</h4>
                    {sharedAnswers.map((shared, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        {shared.isAnonymous ? (
                          <div className="text-sm text-gray-600 mb-1">匿名</div>
                        ) : (
                          <div className="text-sm text-gray-600 mb-1">{shared.Student?.name}</div>
                        )}
                        <div className="text-gray-800">{shared.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* やり直しボタン（回答済みの場合） */}
                {hasSubmitted && currentSlide.templateType !== 'psycho' && (
                  <div className="mt-6 text-center">
                    <Button onClick={handleRetryAnswer} className="bg-orange-600 hover:bg-orange-700">
                      回答をやり直す
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📺</div>
            <p className="text-lg">先生が授業を開始するのを待っています...</p>
          </div>
        )}
      </div>
    </div>
  )
}
