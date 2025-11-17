'use client'
import React from 'react'
import type {AnalysisResult} from '../types'

type ResultDisplayProps = {
  result: AnalysisResult
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({result}) => {
  // カテゴリごとのアイコンと色を定義
  const categoryStyles: {[key: string]: {icon: string; color: string; bgColor: string}} = {
    '感謝・労い': {icon: '🙏', color: 'text-pink-700', bgColor: 'bg-pink-100'},
    '確認・懸念': {icon: '❓', color: 'text-yellow-700', bgColor: 'bg-yellow-100'},
    '指導・助言': {icon: '💡', color: 'text-blue-700', bgColor: 'bg-blue-100'},
    '関係構築': {icon: '🤝', color: 'text-green-700', bgColor: 'bg-green-100'},
  }

  const getStyleForCategory = (category: string) => {
    return (
      categoryStyles[category] || {
        icon: '📌',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
      }
    )
  }

  // 観点ごとのアイコンと背景色を定義
  const viewpointColors = [
    {icon: '🎯', bgColor: 'bg-purple-100', borderColor: 'border-purple-300'},
    {icon: '📊', bgColor: 'bg-blue-100', borderColor: 'border-blue-300'},
    {icon: '⚡', bgColor: 'bg-amber-100', borderColor: 'border-amber-300'},
    {icon: '🌟', bgColor: 'bg-pink-100', borderColor: 'border-pink-300'},
    {icon: '💼', bgColor: 'bg-teal-100', borderColor: 'border-teal-300'},
  ]

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">分析結果</h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[repeat(2,auto)]">
        {/* 左側: AI分析結果 */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">📋 分析観点</h3>
          <div className="space-y-4">
            {result.viewpoints.viewpoints.map((viewpoint, index) => {
              const style = viewpointColors[index % viewpointColors.length]
              const facts = result.factAnalysis[viewpoint] || []

              return (
                <div
                  key={index}
                  className={`${style.bgColor} border-2 ${style.borderColor} rounded-lg p-5 shadow-md`}
                >
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">{style.icon}</span>
                    {viewpoint}
                  </h4>
                  <ul className="space-y-2">
                    {facts.map((fact, factIndex) => (
                      <li key={factIndex} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                        <span className="text-gray-700">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右側: ネクストアクション */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">🎯 ネクストアクション</h3>
          <div className="space-y-4">
            {result.actionSuggestions.actions.map((action, index) => {
              const style = getStyleForCategory(action.category)

              return (
                <div
                  key={index}
                  className={`${style.bgColor} border-2 border-opacity-50 rounded-lg p-5 shadow-md`}
                >
                  <h4 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${style.color}`}>
                    <span className="text-2xl">{style.icon}</span>
                    {action.category}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{action.suggestion}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultDisplay

