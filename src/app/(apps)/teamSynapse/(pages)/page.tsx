'use client'
import React, {useState} from 'react'
import InputForm from '../components/InputForm'
import ResultDisplay from '../components/ResultDisplay'
import AuthButton from '../components/AuthButton'
import {useGoogleAuth} from '../hooks/useGoogleAuth'
import type {AnalysisResult} from '../types'

const TeamSynapseTopCC = () => {
  const {isAuthenticated, handleSignIn, accessToken} = useGoogleAuth()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Synapse</h1>
          <p className="text-lg text-gray-600">Google Workspaceコミュニケーション分析ツール</p>
        </div>

        {/* 認証ボタン */}
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
            <h2 className="text-xl font-semibold mb-4">まずはGoogleアカウントで認証してください</h2>
            <p className="text-gray-600 mb-6">Gmail、Google Drive、Google Chatの読み取り権限が必要です</p>
            <AuthButton onSignIn={handleSignIn} />
          </div>
        )}

        {/* メインコンテンツ */}
        {isAuthenticated && (
          <>
            <InputForm
              accessToken={accessToken!}
              onAnalysisComplete={setAnalysisResult}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />

            {isAnalyzing && (
              <div className="bg-white rounded-lg shadow-md p-8 my-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">分析中です。しばらくお待ちください...</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && <ResultDisplay result={analysisResult} />}
          </>
        )}
      </div>
    </div>
  )
}

export default TeamSynapseTopCC
