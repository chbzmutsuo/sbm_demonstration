'use client'
import React, {useState} from 'react'
import type {AnalysisFormData, AnalysisResult} from '../types'
import {collectData} from '../lib/data-collector'
import {analyzeWithAI} from '../lib/ai-analyzer'

type InputFormProps = {
  accessToken: string
  onAnalysisComplete: (result: AnalysisResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
}

const InputForm: React.FC<InputFormProps> = ({accessToken, onAnalysisComplete, isAnalyzing, setIsAnalyzing}) => {
  const today = new Date().toISOString().split('T')[0]
  const threeMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]
  const [emails, setEmails] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>(threeMonthAgo)
  const [dateTo, setDateTo] = useState<string>(today)
  const [chatRoomId, setChatRoomId] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)

    try {
      // 入力データの整形
      const formData: AnalysisFormData = {
        targetEmails: emails
          .split(',')
          .map(e => e.trim())
          .filter(e => e),
        dateFrom,
        dateTo,
        chatRoomId: chatRoomId || undefined,
      }

      // Step 0: データ収集
      const collectedData = await collectData(accessToken, formData)

      // Step 1-3: AI分析
      const analysisResult = await analyzeWithAI(collectedData)

      onAnalysisComplete(analysisResult)
    } catch (error) {
      console.error('分析エラー:', error)
      alert('分析中にエラーが発生しました。設定を確認してください。')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">分析設定</h2>

      <div className="space-y-4">
        {/* 対象メールアドレス */}
        <div>
          <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-2">
            対象メールアドレス（必須・複数可）
          </label>
          <input
            type="text"
            id="emails"
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder="example@example.com, another@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">複数の場合はカンマ区切りで入力してください</p>
        </div>

        {/* 期間 From */}
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
            期間（開始日）
          </label>
          <input
            type="date"
            id="dateFrom"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* 期間 To */}
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-2">
            期間（終了日）
          </label>
          <input
            type="date"
            id="dateTo"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* Google Chat ルームID */}
        <div>
          <label htmlFor="chatRoomId" className="block text-sm font-medium text-gray-700 mb-2">
            Google Chat ルームID（任意）
          </label>
          <input
            type="text"
            id="chatRoomId"
            value={chatRoomId}
            onChange={e => setChatRoomId(e.target.value)}
            placeholder="例: spaces/AAAAxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-sm text-amber-600 mt-1">※分析対象ルームに "Analyzer Bot" が招待されている必要があります。</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isAnalyzing}
        className="w-full mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? '分析中...' : '分析実行'}
      </button>
    </form>
  )
}

export default InputForm
