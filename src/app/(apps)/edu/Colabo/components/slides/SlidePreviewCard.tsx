'use client'

import {SlideBlock} from '@app/(apps)/edu/Colabo/(components)/SlideBlock'
import {PSYCHO_QUESTIONS} from '../../lib/psycho-questions'
import {Trash} from 'lucide-react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

interface SlidePreviewCardProps {
  slide: any
  index: number
  isSelected: boolean
  onSelect: () => void
  handleDeleteSlide: (slideId: number) => void
}

export default function SlidePreviewCard({slide, index, isSelected, onSelect, handleDeleteSlide}: SlidePreviewCardProps) {
  const getTemplateLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return 'ノーマル'
      case 'psycho':
        return '心理アンケート'
      case 'choice':
        return '選択クイズ'
      case 'freetext':
        return '自由記述クイズ'
      case 'summary':
        return 'まとめアンケート'
      default:
        return type
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`
        bg-white rounded-lg shadow-md cursor-pointer transition-all
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:shadow-lg'}
      `}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">スライド #{index + 1}</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{getTemplateLabel(slide.templateType)}</span>
        </div>
        {isSelected && <span className="text-blue-600 text-sm font-medium">選択中</span>}
        <Trash
          onClick={async () => {
            if (confirm('このスライドを削除してもよろしいですか？')) {
              handleDeleteSlide(slide.id)
            }
          }}
          className="text-white p-0.5 bg-red-500 rounded-full"
        ></Trash>
      </div>

      {/* スライド内容 */}
      <div className="p-8 min-h-[400px] bg-white aspect-video ">
        {slide.contentData?.title && <h2 className="text-2xl font-bold mb-6 text-center">{slide.contentData.title}</h2>}

        {/* ノーマルスライド */}
        {slide.templateType === 'normal' && (
          <div className="space-y-4">
            {slide.contentData?.blocks && slide.contentData.blocks.length > 0 ? (
              slide.contentData.blocks.map((block: any, blockIndex: number) => (
                <SlideBlock key={blockIndex} block={block} isPreview={true} />
              ))
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>コンテンツがありません</p>
                <p className="text-sm mt-2">右側のパネルでブロックを追加してください</p>
              </div>
            )}
          </div>
        )}

        {/* 選択クイズスライド */}
        {slide.templateType === 'choice' && (
          <div className="space-y-6">
            {slide.contentData?.question && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800">{slide.contentData.question}</p>
              </div>
            )}

            {slide.contentData?.choices && slide.contentData.choices.length > 0 ? (
              <div className="space-y-2">
                {slide.contentData.choices.map((choice: any, choiceIndex: number) => (
                  <R_Stack
                    key={choice.id}
                    className={`p-1.5 rounded-lg border-2 ${
                      choice.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {choiceIndex + 1}
                    </div>

                    <p className="text-gray-800">{choice.text || '（未入力）'}</p>

                    {choice.isCorrect && <span className="flex-shrink-0 text-green-600 font-bold text-sm">✓ 正解</span>}
                  </R_Stack>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>選択肢がありません</p>
              </div>
            )}
          </div>
        )}

        {/* 自由記述スライド */}
        {slide.templateType === 'freetext' && (
          <div className="space-y-6">
            {slide.contentData?.question && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800 whitespace-pre-wrap">{slide.contentData.question}</p>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400">
              <p>自由記述の回答欄</p>
            </div>
          </div>
        )}

        {/* 心理アンケートスライド */}
        {slide.templateType === 'psycho' && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-lg font-medium text-purple-900 mb-1">心理アンケート</p>
              <p className="text-xs text-purple-700">好奇心（5問）+ 効力感（5問）+ 自由記述</p>
            </div>

            {/* 質問のプレビュー表示 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {PSYCHO_QUESTIONS.map((category, catIdx) => (
                <div key={catIdx} className="text-xs">
                  <div className="font-semibold text-purple-800 mb-1">{category.label}</div>
                  {category.questions.slice(0, 2).map((q, qIdx) => (
                    <div key={qIdx} className="text-gray-600 ml-2 mb-1">
                      • {q.label.length > 50 ? q.label.substring(0, 50) + '...' : q.label}
                    </div>
                  ))}
                  {category.questions.length > 2 && (
                    <div className="text-gray-400 ml-2 italic">...他{category.questions.length - 2}問</div>
                  )}
                </div>
              ))}
            </div>

            {/* 評価スケール */}
            <div className="flex justify-between text-xs text-gray-500 border-t border-gray-200 pt-2">
              <span>1: まったくそう思わない</span>
              <span>→</span>
              <span>5: とてもそう思う</span>
            </div>
          </div>
        )}

        {/* まとめアンケートスライド */}
        {slide.templateType === 'summary' && (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-lg font-medium text-orange-900 mb-1">まとめアンケート</p>
              <p className="text-xs text-orange-700">活動後の振り返りと満足度評価</p>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="bg-white border border-gray-200 rounded p-3">
                <p className="font-medium mb-1">📊 授業の満足度</p>
                <p className="text-xs text-gray-500">1〜5の5段階で評価</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-3">
                <p className="font-medium mb-1">📝 活動の振り返り</p>
                <p className="text-xs text-gray-500">自由記述</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
