'use client'
import React, {useState, useEffect} from 'react'
import type {AnalysisFormData, AnalysisResult, ServiceType} from '../types'
import {collectData} from '../lib/data-collector'
import {analyzeWithAI} from '../lib/ai-analyzer'
import {fetchGmailContactEmails, fetchChatSpaces} from '../lib/google-apis'

type InputFormProps = {
  accessToken: string
  onAnalysisComplete: (result: AnalysisResult) => void
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
}

const InputForm: React.FC<InputFormProps> = ({accessToken, onAnalysisComplete, isAnalyzing, setIsAnalyzing}) => {
  const today = new Date().toISOString().split('T')[0]
  const threeMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]

  // サービス選択
  const [enabledServices, setEnabledServices] = useState<ServiceType[]>(['gmail'])

  // Gmail設定
  const [gmailEmails, setGmailEmails] = useState<string>('')
  const [gmailDateFrom, setGmailDateFrom] = useState<string>(threeMonthAgo)
  const [gmailDateTo, setGmailDateTo] = useState<string>(today)
  const [gmailContactEmails, setGmailContactEmails] = useState<string[]>([])
  const [isLoadingGmailContacts, setIsLoadingGmailContacts] = useState(false)

  // Chat設定
  const [chatRoomId, setChatRoomId] = useState<string>('')
  const [chatDateFrom, setChatDateFrom] = useState<string>(threeMonthAgo)
  const [chatDateTo, setChatDateTo] = useState<string>(today)
  const [chatSpaces, setChatSpaces] = useState<Array<{name: string; displayName: string}>>([])
  const [isLoadingChatSpaces, setIsLoadingChatSpaces] = useState(false)

  // Drive設定
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('')

  // Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = useState<string>('')

  // Gmail連絡先を取得
  const loadGmailContacts = async () => {
    setIsLoadingGmailContacts(true)
    try {
      const emails = await fetchGmailContactEmails(accessToken)
      setGmailContactEmails(emails)
    } catch (error) {
      console.error('Gmail連絡先取得エラー:', error)
    } finally {
      setIsLoadingGmailContacts(false)
    }
  }

  // Chatルーム一覧を取得
  const loadChatSpaces = async () => {
    setIsLoadingChatSpaces(true)
    try {
      const spaces = await fetchChatSpaces(accessToken)
      setChatSpaces(spaces)
    } catch (error) {
      console.error('Chatルーム取得エラー:', error)
    } finally {
      setIsLoadingChatSpaces(false)
    }
  }

  // サービス選択の変更
  const toggleService = (service: ServiceType) => {
    if (enabledServices.includes(service)) {
      setEnabledServices(enabledServices.filter(s => s !== service))
    } else {
      setEnabledServices([...enabledServices, service])
    }
  }

  // メールアドレスの候補を選択
  const selectEmail = (email: string) => {
    const emails = gmailEmails.split(',').map(e => e.trim()).filter(e => e)
    if (!emails.includes(email)) {
      setGmailEmails([...emails, email].join(', '))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (enabledServices.length === 0) {
      alert('少なくとも1つのサービスを選択してください。')
      return
    }

    setIsAnalyzing(true)

    try {
      // 入力データの整形
      const formData: AnalysisFormData = {
        enabledServices,
        gmail: {
          targetEmails: gmailEmails
            .split(',')
            .map(e => e.trim())
            .filter(e => e),
          dateFrom: gmailDateFrom,
          dateTo: gmailDateTo,
        },
        chat: {
          roomId: chatRoomId,
          dateFrom: chatDateFrom,
          dateTo: chatDateTo,
        },
        drive: {
          folderUrl: driveFolderUrl,
        },
      }

      // Step 0: データ収集
      const collectedData = await collectData(accessToken, formData)

      if (collectedData.length === 0) {
        alert('取得できるデータがありませんでした。設定を確認してください。')
        setIsAnalyzing(false)
        return
      }

      // Step 1-3: AI分析
      if (!geminiApiKey.trim()) {
        alert('Gemini API Keyを入力してください。')
        setIsAnalyzing(false)
        return
      }

      const analysisResult = await analyzeWithAI(collectedData, geminiApiKey.trim())

      // ユーザー情報を取得（Google UserInfo API）
      let userEmail: string | undefined
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json()
          userEmail = userInfo.email
        }
      } catch (error) {
        console.warn('ユーザー情報の取得に失敗しました:', error)
      }

      // データベースに保存
      try {
        const saveResponse = await fetch('/api/teamSynapse/analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail,
            formData,
            analysisResult,
          }),
        })

        if (!saveResponse.ok) {
          console.error('分析結果の保存に失敗しました')
        } else {
          const saveResult = await saveResponse.json()
          console.log('分析結果を保存しました:', saveResult)
        }
      } catch (error) {
        console.error('分析結果の保存エラー:', error)
        // 保存に失敗しても分析結果は表示する
      }

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

      {/* サービス選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">連携サービス（複数選択可）</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabledServices.includes('gmail')}
              onChange={() => toggleService('gmail')}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Gmail</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabledServices.includes('chat')}
              onChange={() => toggleService('chat')}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">チャット</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabledServices.includes('drive')}
              onChange={() => toggleService('drive')}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Drive</span>
          </label>
        </div>
      </div>

      {/* 3カラム構成 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gmailカラム */}
        <div className={`border-2 rounded-lg p-4 ${enabledServices.includes('gmail') ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gmail</h3>
            <span className={`text-xs px-2 py-1 rounded ${enabledServices.includes('gmail') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
              {enabledServices.includes('gmail') ? '有効' : '無効'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="gmailEmails" className="block text-sm font-medium text-gray-700 mb-2">
                対象メールアドレス
              </label>
              <input
                type="text"
                id="gmailEmails"
                value={gmailEmails}
                onChange={e => setGmailEmails(e.target.value)}
                placeholder="example@example.com"
                disabled={!enabledServices.includes('gmail')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-2">
                <button
                  type="button"
                  onClick={loadGmailContacts}
                  disabled={!enabledServices.includes('gmail') || isLoadingGmailContacts}
                  className="text-xs text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoadingGmailContacts ? '読み込み中...' : '過去のやり取り相手を取得'}
                </button>
                {gmailContactEmails.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                    {gmailContactEmails.slice(0, 10).map(email => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => selectEmail(email)}
                        className="block text-xs text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 w-full text-left px-2 py-1 rounded"
                      >
                        {email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">複数の場合はカンマ区切り</p>
            </div>

            <div>
              <label htmlFor="gmailDateFrom" className="block text-sm font-medium text-gray-700 mb-2">
                期間（開始日）
              </label>
              <input
                type="date"
                id="gmailDateFrom"
                value={gmailDateFrom}
                onChange={e => setGmailDateFrom(e.target.value)}
                disabled={!enabledServices.includes('gmail')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="gmailDateTo" className="block text-sm font-medium text-gray-700 mb-2">
                期間（終了日）
              </label>
              <input
                type="date"
                id="gmailDateTo"
                value={gmailDateTo}
                onChange={e => setGmailDateTo(e.target.value)}
                disabled={!enabledServices.includes('gmail')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Chatカラム */}
        <div className={`border-2 rounded-lg p-4 ${enabledServices.includes('chat') ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">チャット</h3>
            <span className={`text-xs px-2 py-1 rounded ${enabledServices.includes('chat') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
              {enabledServices.includes('chat') ? '有効' : '無効'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="chatRoomId" className="block text-sm font-medium text-gray-700 mb-2">
                ルームID
              </label>
              <div className="mb-2">
                <button
                  type="button"
                  onClick={loadChatSpaces}
                  disabled={!enabledServices.includes('chat') || isLoadingChatSpaces}
                  className="text-xs text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed mb-2"
                >
                  {isLoadingChatSpaces ? '読み込み中...' : '所属ルーム一覧を取得'}
                </button>
                {chatSpaces.length > 0 && (
                  <select
                    id="chatRoomId"
                    value={chatRoomId}
                    onChange={e => setChatRoomId(e.target.value)}
                    disabled={!enabledServices.includes('chat')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">ルームを選択...</option>
                    {chatSpaces.map(space => (
                      <option key={space.name} value={space.name}>
                        {space.displayName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                id="chatRoomIdManual"
                value={chatRoomId}
                onChange={e => setChatRoomId(e.target.value)}
                placeholder="例: spaces/AAAAxxxxxxx"
                disabled={!enabledServices.includes('chat')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-amber-600 mt-1">※分析対象ルームに "Analyzer Bot" が招待されている必要があります。</p>
            </div>

            <div>
              <label htmlFor="chatDateFrom" className="block text-sm font-medium text-gray-700 mb-2">
                期間（開始日）
              </label>
              <input
                type="date"
                id="chatDateFrom"
                value={chatDateFrom}
                onChange={e => setChatDateFrom(e.target.value)}
                disabled={!enabledServices.includes('chat')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="chatDateTo" className="block text-sm font-medium text-gray-700 mb-2">
                期間（終了日）
              </label>
              <input
                type="date"
                id="chatDateTo"
                value={chatDateTo}
                onChange={e => setChatDateTo(e.target.value)}
                disabled={!enabledServices.includes('chat')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Driveカラム */}
        <div className={`border-2 rounded-lg p-4 ${enabledServices.includes('drive') ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Drive</h3>
            <span className={`text-xs px-2 py-1 rounded ${enabledServices.includes('drive') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
              {enabledServices.includes('drive') ? '有効' : '無効'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="driveFolderUrl" className="block text-sm font-medium text-gray-700 mb-2">
                親フォルダのURL
              </label>
              <input
                type="text"
                id="driveFolderUrl"
                value={driveFolderUrl}
                onChange={e => setDriveFolderUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                disabled={!enabledServices.includes('drive')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">※現在はUIのみ実装されています</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 mb-2">
          Gemini API Key（必須）
        </label>
        <input
          type="password"
          id="geminiApiKey"
          value={geminiApiKey}
          onChange={e => setGeminiApiKey(e.target.value)}
          placeholder="AIza..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
            Google AI Studio
          </a>
          でAPIキーを取得してください
        </p>
      </div>

      <button
        type="submit"
        disabled={isAnalyzing || enabledServices.length === 0}
        className="w-full mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? '分析中...' : '分析実行'}
      </button>
    </form>
  )
}

export default InputForm
