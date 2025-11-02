'use client'

import {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {flattenQuestions, RATING_LABELS, RATING_VALUES} from '../../../api/colabo-socket/psycho-questions'
import {toast} from 'react-toastify'

interface PsychoAnswerFormProps {
  gameId: number
  slideId: number
  studentId: number
  existingAnswer?: any
  onSubmit: (answerData: any) => Promise<void>
  isReadOnly?: boolean
  currentMode?: 'view' | 'answer' | 'result' | null
}

export default function PsychoAnswerForm({
  gameId,
  slideId,
  studentId,
  existingAnswer,
  onSubmit,
  isReadOnly = false,
  currentMode = null,
}: PsychoAnswerFormProps) {
  const [showFurigana, setShowFurigana] = useState(true)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [impression, setImpression] = useState('')
  const [shuffledQuestions] = useState(() => flattenQuestions(true))

  // 既存の回答をロード
  useEffect(() => {
    if (existingAnswer?.answerData) {
      const data = existingAnswer.answerData
      setAnswers({
        curiocity1: data.curiocity1 || 0,
        curiocity2: data.curiocity2 || 0,
        curiocity3: data.curiocity3 || 0,
        curiocity4: data.curiocity4 || 0,
        curiocity5: data.curiocity5 || 0,
        efficacy1: data.efficacy1 || 0,
        efficacy2: data.efficacy2 || 0,
        efficacy3: data.efficacy3 || 0,
        efficacy4: data.efficacy4 || 0,
        efficacy5: data.efficacy5 || 0,
      })
      setImpression(data.impression || '')
    }
  }, [existingAnswer])

  // 回答の選択
  const handleAnswerSelect = (questionKey: string, value: number) => {
    if (isReadOnly) return
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value,
    }))
  }

  // 提出可能かチェック
  const isReadyToSubmit = () => {
    // 全質問に回答したか
    const allQuestionsAnswered = shuffledQuestions.every(q => answers[q.questionKey] > 0)
    // 感想が入力されているか
    const hasImpression = impression.trim().length > 0

    return allQuestionsAnswered && hasImpression && !isReadOnly
  }

  // 提出処理
  const handleSubmit = async () => {
    if (!isReadyToSubmit()) {
      toast.error('全ての質問に回答し、感想も入力してください')
      return
    }

    const answerData = {
      ...answers,
      impression,
    }

    await onSubmit(answerData)
  }

  // ふりがな表示切り替え
  const removeFurigana = (text: string) => {
    return text
      .split('）')
      .map(str => {
        const fix = str + '）'
        return fix.replace(/（.+）|）/g, '')
      })
      .join('')
  }

  // 表示モードでは何も表示しない
  if (currentMode === 'view') {
    return null
  }

  // 結果モードでは自分の回答を表示（スコアと感想のみ）
  if (currentMode === 'result' && existingAnswer) {
    const answerData = existingAnswer.answerData
    const curiocity =
      (answerData.curiocity1 || 0) +
      (answerData.curiocity2 || 0) +
      (answerData.curiocity3 || 0) +
      (answerData.curiocity4 || 0) +
      (answerData.curiocity5 || 0)
    const efficacy =
      (answerData.efficacy1 || 0) +
      (answerData.efficacy2 || 0) +
      (answerData.efficacy3 || 0) +
      (answerData.efficacy4 || 0) +
      (answerData.efficacy5 || 0)

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-purple-800 mb-4">あなたの回答結果</h3>

          {/* スコア表示 */}
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-purple-900">好奇心スコア</span>
                <span className="text-2xl font-bold text-purple-600">{curiocity}/25</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-500 h-4 rounded-full transition-all duration-300"
                  style={{width: `${(curiocity / 25) * 100}%`}}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900">効力感スコア</span>
                <span className="text-2xl font-bold text-blue-600">{efficacy}/25</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{width: `${(efficacy / 25) * 100}%`}}
                />
              </div>
            </div>
          </div>

          {/* 感想表示 */}
          {answerData.impression && (
            <div className="bg-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-pink-900 mb-2">あなたの感想</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{answerData.impression}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 読み取り専用表示 */}
      {isReadOnly && (
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 text-center text-blue-800 font-medium">
          回答済みです（編集不可）
        </div>
      )}

      {/* ふりがな切り替えボタン */}
      <div className="flex justify-center">
        <Button onClick={() => setShowFurigana(prev => !prev)} className="bg-purple-600 hover:bg-purple-700">
          {showFurigana ? '漢字のみ表示' : 'ふりがなを表示'}
        </Button>
      </div>

      {/* 評価スケール表 */}
      <div className="bg-white border-2 border-purple-200 rounded-lg overflow-hidden">
        <div className="bg-purple-100 px-4 py-2 text-center font-semibold text-purple-900">評価スケール</div>
        <div className="grid grid-cols-5">
          {RATING_LABELS.map((label, i) => (
            <div key={i} className="border-r border-purple-200 last:border-r-0 p-3 text-center">
              <div className="text-2xl font-bold text-purple-700 mb-1">{i + 1}</div>
              <div className="text-xs text-gray-600 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 質問リスト */}
      <C_Stack className="gap-6">
        {shuffledQuestions.map((question, idx) => {
          const displayLabel = showFurigana ? question.label : removeFurigana(question.label)
          const selectedValue = answers[question.questionKey] || 0

          return (
            <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
              <label className="block">
                <div className="text-base font-medium text-gray-800 mb-4">
                  <span className="inline-block bg-purple-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2">
                    {idx + 1}
                  </span>
                  {displayLabel}
                </div>

                {/* 評価ボタン */}
                <div className="flex justify-around gap-2">
                  {RATING_VALUES.map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAnswerSelect(question.questionKey, value)}
                      disabled={isReadOnly}
                      className={`
                        flex-1 h-14 rounded-lg font-bold text-xl transition-all
                        ${
                          selectedValue === value
                            ? 'bg-purple-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
                        }
                        ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          )
        })}
      </C_Stack>

      {/* 感想入力 */}
      <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6">
        <label className="block">
          <div className="text-lg font-semibold text-gray-800 mb-3">
            📝{' '}
            {showFurigana
              ? 'グループで取（と）り組（く）みたいこと、抱負（ほうふ）などを書（か）いてください。'
              : 'グループで取り組みたいこと、抱負などを書いてください。'}
          </div>
          <textarea
            value={impression}
            onChange={e => setImpression(e.target.value)}
            disabled={isReadOnly}
            className={`
              w-full border-2 border-pink-300 rounded-lg px-4 py-3 text-base
              focus:ring-2 focus:ring-pink-500 focus:border-transparent
              ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
            rows={6}
            placeholder="ここに感想を入力してください..."
          />
        </label>
      </div>

      {/* 提出ボタン */}
      {!isReadOnly && (
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!isReadyToSubmit()}
            className={`
              px-12 py-4 text-lg font-bold rounded-lg shadow-lg
              ${isReadyToSubmit() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            {isReadyToSubmit() ? '✅ 回答を送信' : '⚠️ 全て回答してください'}
          </Button>
        </div>
      )}

      {/* 進捗表示 */}
      <div className="text-center text-sm text-gray-600">
        <p>
          回答済み: {Object.values(answers).filter(v => v > 0).length} / {shuffledQuestions.length}問
          {impression.trim().length > 0 && ' + 感想入力済み'}
        </p>
      </div>
    </div>
  )
}
