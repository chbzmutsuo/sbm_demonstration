'use client'

import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {useColaboSocket} from '../hooks/useColaboSocket'

export default function TestSocketPage() {
  const [gameId] = useState(1) // テスト用のゲームID
  const [userId] = useState(1) // テスト用のユーザーID
  const [role, setRole] = useState<'teacher' | 'student'>('teacher')
  const [connectionLog, setConnectionLog] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConnectionLog(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const socket = useColaboSocket({
    gameId,
    role,
    userId,
    userName: role === 'teacher' ? 'テスト教師' : 'テスト生徒',
    onSlideChange: (slideId, slideIndex) => {
      addLog(`スライド変更: ${slideId} (index: ${slideIndex})`)
    },
    onSlideModeChange: (slideId, mode) => {
      addLog(`モード変更: スライド${slideId} -> ${mode}`)
    },
    onSlideStatesSync: states => {
      addLog(`状態同期: ${Object.keys(states).length}個のスライド`)
    },
    onCurrentSlideSync: currentSlideId => {
      addLog(`現在スライド同期: ${currentSlideId}`)
    },
    onAnswerUpdate: data => {
      addLog(`回答更新: ${JSON.stringify(data)}`)
    },
    onAnswerSaved: data => {
      addLog(`回答保存: ${JSON.stringify(data)}`)
    },
    onSharedAnswer: data => {
      addLog(`回答共有: ${JSON.stringify(data)}`)
    },
    onRevealCorrect: data => {
      addLog(`正答公開: ${JSON.stringify(data)}`)
    },
    onError: error => {
      addLog(`エラー: ${error.message}`)
    },
  })

  const handleConnect = () => {
    addLog('接続開始...')
    socket.connect()
  }

  const handleDisconnect = () => {
    addLog('切断開始...')
    socket.disconnect()
  }

  const handleTestSlideChange = () => {
    if (role === 'teacher') {
      addLog('テストスライド変更送信...')
      socket.changeSlide(1, 0) // slideId: 1, slideIndex: 0
    } else {
      addLog('教師のみがスライドを変更できます')
    }
  }

  const handleTestModeChange = () => {
    if (role === 'teacher') {
      addLog('テストモード変更送信...')
      socket.changeMode(1, 'answer') // slideId: 1, mode: 'answer'
    } else {
      addLog('教師のみがモードを変更できます')
    }
  }

  const handleTestAnswer = () => {
    if (role === 'student') {
      addLog('テスト回答送信...')
      socket.submitAnswer(1, {type: 'choice', choiceIndex: 0, timestamp: new Date().toISOString()})
    } else {
      addLog('生徒のみが回答を送信できます')
    }
  }

  const clearLog = () => {
    setConnectionLog([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Socket.io接続テスト</h1>

      {/* 接続状態 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">接続状態</h2>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                socket.connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : socket.connectionStatus === 'connecting'
                    ? 'bg-yellow-500'
                    : socket.connectionStatus === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
              }`}
            ></div>
            <span className="text-sm">
              {socket.connectionStatus === 'connected'
                ? '接続中'
                : socket.connectionStatus === 'connecting'
                  ? '接続中...'
                  : socket.connectionStatus === 'error'
                    ? 'エラー'
                    : '未接続'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            パス: <code className="bg-gray-100 px-1 rounded">/api/edu/colabo/socket</code>
          </div>
        </div>

        {/* ロール切り替え */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm font-medium">ロール:</span>
          <Button onClick={() => setRole('teacher')} className={`text-xs ${role === 'teacher' ? 'bg-blue-600' : 'bg-gray-400'}`}>
            教師
          </Button>
          <Button onClick={() => setRole('student')} className={`text-xs ${role === 'student' ? 'bg-green-600' : 'bg-gray-400'}`}>
            生徒
          </Button>
        </div>

        {/* 接続制御 */}
        <div className="flex space-x-2">
          <Button onClick={handleConnect} className="bg-green-600 hover:bg-green-700">
            接続
          </Button>
          <Button onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700">
            切断
          </Button>
        </div>
      </div>

      {/* テスト操作 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">テスト操作</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleTestSlideChange} className="bg-blue-600 hover:bg-blue-700">
            スライド変更テスト
          </Button>
          <Button onClick={handleTestModeChange} className="bg-purple-600 hover:bg-purple-700">
            モード変更テスト
          </Button>
          <Button onClick={handleTestAnswer} className="bg-orange-600 hover:bg-orange-700">
            回答送信テスト
          </Button>
        </div>
      </div>

      {/* ログ表示 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">接続ログ</h2>
          <Button onClick={clearLog} className="bg-gray-600 hover:bg-gray-700 text-xs">
            ログクリア
          </Button>
        </div>
        <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
          {connectionLog.length === 0 ? (
            <div className="text-gray-500 text-sm">ログがありません</div>
          ) : (
            <div className="space-y-1">
              {connectionLog.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-800">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


