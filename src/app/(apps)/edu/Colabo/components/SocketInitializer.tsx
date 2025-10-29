'use client'

import {useEffect} from 'react'

/**
 * Socket.ioサーバーの初期化コンポーネント
 * アプリケーション起動時にSocket.ioサーバーを初期化する
 */
export default function SocketInitializer() {
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log('[SocketInitializer] Socket.ioサーバーを初期化中...')

        // Socket.ioエンドポイントにリクエストを送信してサーバーを初期化
        const response = await fetch('/edu/Colabo/api/socket', {
          method: 'POST',
        })

        if (response.ok) {
          console.log('[SocketInitializer] Socket.ioサーバー初期化完了')
        } else {
          console.warn('[SocketInitializer] Socket.ioサーバー初期化に失敗:', response.status)
        }
      } catch (error) {
        console.error('[SocketInitializer] Socket.ioサーバー初期化エラー:', error)
      }
    }

    // アプリケーション起動時に初期化
    initializeSocket()
  }, [])

  return null // UIは表示しない
}
