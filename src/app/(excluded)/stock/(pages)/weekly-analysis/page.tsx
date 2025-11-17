'use client'

import React, {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function WeeklyAnalysisPage() {
  const [selectedWeek, setSelectedWeek] = useState(formatDate(new Date(), 'YYYY-MM-DD'))
  const [analysisData, setAnalysisData] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfitLoss: 0,
    bestTrade: null,
    worstTrade: null,
    patterns: [],
    emotions: [],
    improvements: '',
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 週次分析</h1>
              <p className="text-gray-600 mt-2">週間のトレード成績と改善点の分析</p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="week"
                value={selectedWeek}
                onChange={e => setSelectedWeek(e.target.value)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">分析実行</Button>
            </div>
          </div>
        </div>

        {/* 週間統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">📈 総取引数</h3>
            <div className="text-3xl font-bold text-blue-600">{analysisData.totalTrades}</div>
            <div className="text-sm text-gray-500 mt-1">今週の取引回数</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 勝率</h3>
            <div className="text-3xl font-bold text-green-600">{analysisData.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500 mt-1">利益取引の割合</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">💰 週間損益</h3>
            <div className={`text-3xl font-bold ${analysisData.totalProfitLoss >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {analysisData.totalProfitLoss > 0 ? '+' : ''}
              {analysisData.totalProfitLoss.toLocaleString()}円
            </div>
            <div className="text-sm text-gray-500 mt-1">今週の総損益</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚡ 改善度</h3>
            <div className="text-3xl font-bold text-purple-600">B+</div>
            <div className="text-sm text-gray-500 mt-1">前週比評価</div>
          </div>
        </div>

        {/* 分析結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 ベスト・ワーストトレード</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="font-semibold text-green-700">ベストトレード</div>
                <div className="text-sm text-gray-600">7974 任天堂 +15,000円</div>
                <div className="text-xs text-gray-500">ゴールデンクロス判定が的確</div>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <div className="font-semibold text-red-700">ワーストトレード</div>
                <div className="text-sm text-gray-600">6098 リクルートHD -8,000円</div>
                <div className="text-xs text-gray-500">感情的な判断による早期損切り</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 負けパターン分析</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">感情的な判断</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">損切りの遅れ</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '40%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">40%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">過度な集中投資</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 改善計画 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📝 来週の改善計画</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">継続すべき点</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  テクニカル分析に基づく判断
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  事前の戦略設計
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  リスク管理の徹底
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">改善すべき点</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">×</span>
                  感情的な判断を避ける
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">×</span>
                  損切りルールの厳守
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">×</span>
                  ポジションサイズの適正化
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">来週の具体的な改善アクション</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="来週実行する具体的な改善策を記入してください..."
              value={analysisData.improvements}
              onChange={e => setAnalysisData(prev => ({...prev, improvements: e.target.value}))}
            />
          </div>
        </div>

        {/* 感情分析 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">😊 感情状態分析</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">😌</div>
              <div className="text-sm font-semibold">冷静</div>
              <div className="text-xs text-gray-500">70%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">😰</div>
              <div className="text-sm font-semibold">不安</div>
              <div className="text-xs text-gray-500">20%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">😤</div>
              <div className="text-sm font-semibold">興奮</div>
              <div className="text-xs text-gray-500">8%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">😔</div>
              <div className="text-sm font-semibold">後悔</div>
              <div className="text-xs text-gray-500">2%</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>アドバイス:</strong> 冷静な判断が多く、良い傾向です。不安な時の取引パターンを見直し、
              より客観的な判断基準を設けることで、さらに成績向上が期待できます。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
