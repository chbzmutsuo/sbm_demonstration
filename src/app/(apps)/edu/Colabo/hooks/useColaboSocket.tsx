'use client'

import {useEffect, useRef, useState, useCallback} from 'react'
import {io, Socket} from 'socket.io-client'
import {
  SOCKET_CONFIG,
  SOCKET_EVENTS,
  type JoinGamePayload,
  type ChangeSlidePayload,
  type ChangeModePayload,
  type CloseAnswerPayload,
  type SubmitAnswerPayload,
  type ShareAnswerPayload,
  type RevealCorrectPayload,
  type AnswerUpdatedPayload,
  type SocketErrorPayload,
  type SocketRole,
  type SlideMode,
} from '../lib/socket-config'

// 接続状態の型
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// スライドごとの状態型
export interface SlideStates {
  [slideId: number]: SlideMode | null
}

// フックのプロパティ型
export interface UseColaboSocketProps {
  gameId: number
  role: SocketRole
  userId: number
  userName?: string
  onSlideChange?: (slideId: number, slideIndex: number) => void
  onSlideModeChange?: (slideId: number, mode: SlideMode | null) => void // スライドごとのモード変更
  onSlideStatesSync?: (slideStates: SlideStates) => void // 全スライドの状態同期
  onCurrentSlideSync?: (currentSlideId: number | null) => void // 現在のスライド同期
  onAnswerUpdate?: (data: AnswerUpdatedPayload) => void
  onAnswerSaved?: (data: any) => void
  onSharedAnswer?: (data: any) => void
  onRevealCorrect?: (data: any) => void
  onError?: (error: SocketErrorPayload) => void
  autoConnect?: boolean
}

/**
 * Colabo Socket.io カスタムフック
 * リアルタイム通信を管理
 */
export function useColaboSocket({
  gameId,
  role,
  userId,
  userName,
  onSlideChange,
  onSlideModeChange,
  onSlideStatesSync,
  onCurrentSlideSync,
  onAnswerUpdate,
  onAnswerSaved,
  onSharedAnswer,
  onRevealCorrect,
  onError,
  autoConnect = true,
}: UseColaboSocketProps) {
  const socketRef = useRef<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [slideStates, setSlideStates] = useState<SlideStates>({})

  /**
   * Socket.io接続を確立
   */
  const connect = () => {
    if (socketRef.current?.connected) {
      console.log('既に接続済み')
      return
    }

    console.log('接続開始...')
    console.log('URL:', SOCKET_CONFIG.path)
    console.log('設定:', SOCKET_CONFIG)
    setConnectionStatus('connecting')

    // 既存のSocketがあれば切断
    if (socketRef.current) {
      console.log('既存の接続をクリーンアップ')
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    // Socket.ioインスタンスを作成（完全なURLを指定）
    const socketUrl =
      typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:3000'

    console.log('接続先:', socketUrl)

    const socket = io(socketUrl, {
      path: SOCKET_CONFIG.path,
      transports: SOCKET_CONFIG.transports,
      reconnection: SOCKET_CONFIG.reconnection,
      reconnectionAttempts: SOCKET_CONFIG.reconnectionAttempts,
      reconnectionDelay: SOCKET_CONFIG.reconnectionDelay,
      reconnectionDelayMax: SOCKET_CONFIG.reconnectionDelayMax,
      timeout: SOCKET_CONFIG.timeout,
      autoConnect: false,
      forceNew: false,
      upgrade: true,
    })

    socketRef.current = socket

    // // 接続イベント
    socket.on('connect', () => {
      console.log('Socket.io接続成功')
      setConnectionStatus('connected')

      // Gameに参加
      const joinPayload: JoinGamePayload = {
        gameId,
        role,
        userId,
        userName,
      }
      console.log('JOIN_GAMEイベント送信:', joinPayload)
      socket.emit(SOCKET_EVENTS.JOIN_GAME, joinPayload)
    })

    // 接続確認応答
    socket.on(SOCKET_EVENTS.CONNECTION_ACK, (data: any) => {
      console.log({接続確認: data})
      if (data.slideStates) {
        setSlideStates(data.slideStates)
        onSlideStatesSync?.(data.slideStates)
      }
      if (data.currentSlideId !== undefined) {
        onCurrentSlideSync?.(data.currentSlideId)
      }
    })

    // 状態同期（参加者数更新など）
    socket.on(SOCKET_EVENTS.GAME_STATE_SYNC, (data: any) => {
      console.log({状態同期: data})
      if (data.slideStates) {
        setSlideStates(data.slideStates)
        onSlideStatesSync?.(data.slideStates)
      }
    })

    // スライド切り替え
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, (data: ChangeSlidePayload) => {
      console.log({スライド切り替え: data})
      onSlideChange?.(data.slideId, data.slideIndex)
    })

    // スライドモード変更
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_MODE, (data: ChangeModePayload) => {
      console.log({モード変更: data})
      setSlideStates(prev => ({...prev, [data.slideId]: data.mode}))
      onSlideModeChange?.(data.slideId, data.mode)
    })

    // 回答状況更新（教師のみ）
    socket.on(SOCKET_EVENTS.GAME_ANSWER_UPDATED, (data: AnswerUpdatedPayload) => {
      console.log({回答状況更新: data})
      onAnswerUpdate?.(data)
    })

    // 回答保存完了（生徒のみ）
    socket.on(SOCKET_EVENTS.STUDENT_ANSWER_SAVED, (data: any) => {
      console.log({回答保存完了: data})
      onAnswerSaved?.(data)
    })

    // 回答共有
    socket.on(SOCKET_EVENTS.TEACHER_SHARE_ANSWER, (data: any) => {
      console.log({回答共有: data})
      onSharedAnswer?.(data)
    })

    // 正答公開
    socket.on(SOCKET_EVENTS.TEACHER_REVEAL_CORRECT, (data: any) => {
      console.log({正答公開: data})
      onRevealCorrect?.(data)
    })

    // エラー
    socket.on(SOCKET_EVENTS.ERROR, (error: SocketErrorPayload) => {
      console.error({エラー: error})
      onError?.(error)
    })

    // 切断
    socket.on('disconnect', reason => {
      console.log({切断: reason})
      console.log('切断理由の詳細:', reason)
      setConnectionStatus('disconnected')
    })

    // 接続エラー
    socket.on('connect_error', (error: any) => {
      console.error({接続エラー: error})
      console.error('エラーメッセージ:', error.message || error.toString())
      setConnectionStatus('error')

      const errorPayload: SocketErrorPayload = {
        message: `接続エラー: ${error.message || error.toString()}`,
        code: 'CONNECTION_ERROR',
      }
      onError?.(errorPayload)
    })

    // 接続タイムアウト
    socket.on('connect_timeout', () => {
      console.error({接続タイムアウト: {message: '接続がタイムアウトしました'}})
      setConnectionStatus('error')

      const errorPayload: SocketErrorPayload = {
        message: '接続がタイムアウトしました',
        code: 'CONNECTION_TIMEOUT',
      }
      onError?.(errorPayload)
    })

    // 再接続試行
    socket.on('reconnect_attempt', attemptNumber => {
      console.log({再接続試行: attemptNumber})
    })

    // 再接続失敗
    socket.on('reconnect_failed', () => {
      console.error({再接続失敗: {message: '再接続に失敗しました'}})
      setConnectionStatus('error')

      const errorPayload: SocketErrorPayload = {
        message: '再接続に失敗しました',
        code: 'RECONNECT_FAILED',
      }
      onError?.(errorPayload)
    })

    // 再接続成功
    socket.on('reconnect', attemptNumber => {
      console.log({再接続成功: attemptNumber})
      setConnectionStatus('connected')

      // 再度Gameに参加
      const joinPayload: JoinGamePayload = {
        gameId,
        role,
        userId,
        userName,
      }
      console.log('再接続後のJOIN_GAMEイベント送信:', joinPayload)
      socket.emit(SOCKET_EVENTS.JOIN_GAME, joinPayload)
    })

    // 接続開始
    console.log({socketConnect: 'socket.connect() を呼び出します'})
    socket.connect()
  }

  /**
   * 接続を切断
   */
  const disconnect = useCallback(() => {
    if (!socketRef.current) return

    console.log({切断処理開始: {}})

    // Gameから退出
    socketRef.current.emit(SOCKET_EVENTS.LEAVE_GAME, {gameId})

    // Socket切断
    socketRef.current.disconnect()
    socketRef.current = null
    setConnectionStatus('disconnected')
  }, [gameId])

  /**
   * スライド変更を送信（教師のみ）
   */
  const changeSlide = useCallback(
    (slideId: number, slideIndex: number) => {
      if (!socketRef.current?.connected) {
        console.warn({未接続のためスライド変更できません: {}})
        return
      }

      if (role !== 'teacher') {
        console.warn({教師のみがスライドを変更できます: {}})
        return
      }

      const payload: ChangeSlidePayload = {
        gameId,
        slideId,
        slideIndex,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, payload)
    },
    [gameId, role]
  )

  /**
   * モード変更を送信（教師のみ）
   */
  const changeMode = useCallback(
    (slideId: number, mode: SlideMode) => {
      if (!socketRef.current?.connected) {
        console.warn({未接続のためモード変更できません: {}})
        return
      }

      if (role !== 'teacher') {
        console.warn({教師のみがモードを変更できます: {}})
        return
      }

      const payload: ChangeModePayload = {
        gameId,
        slideId,
        mode,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CHANGE_MODE, payload)
    },
    [gameId, role]
  )

  /**
   * 回答締切を送信（教師のみ）
   */
  const closeAnswer = useCallback(
    (slideId: number) => {
      if (!socketRef.current?.connected) {
        console.warn({未接続のため回答締切できません: {}})
        return
      }

      if (role !== 'teacher') {
        console.warn({教師のみが回答を締め切れます: {}})
        return
      }

      const payload: CloseAnswerPayload = {
        gameId,
        slideId,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CLOSE_ANSWER, payload)
    },
    [gameId, role]
  )

  /**
   * 回答を送信（生徒のみ）
   */
  const submitAnswer = useCallback(
    (slideId: number, answerData: any) => {
      if (!socketRef.current?.connected) {
        console.warn('未接続のため回答送信できません')
        return
      }

      if (role !== 'student') {
        console.warn('生徒のみが回答を送信できます')
        return
      }

      const payload: SubmitAnswerPayload = {
        gameId,
        slideId,
        studentId: userId,
        answerData,
      }
      socketRef.current.emit(SOCKET_EVENTS.STUDENT_SUBMIT_ANSWER, payload)
    },
    [gameId, role, userId]
  )

  /**
   * 特定回答を共有（教師のみ）
   */
  const shareAnswer = useCallback(
    (slideId: number, answerId: number, isAnonymous: boolean = false) => {
      if (!socketRef.current?.connected) {
        console.warn('未接続のため回答共有できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('教師のみが回答を共有できます')
        return
      }

      const payload: ShareAnswerPayload = {
        gameId,
        slideId,
        answerId,
        isAnonymous,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_SHARE_ANSWER, payload)
    },
    [gameId, role]
  )

  /**
   * 正答を公開（教師のみ）
   */
  const revealCorrect = useCallback(
    (slideId: number) => {
      if (!socketRef.current?.connected) {
        console.warn('未接続のため正答公開できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('教師のみが正答を公開できます')
        return
      }

      const payload: RevealCorrectPayload = {
        gameId,
        slideId,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_REVEAL_CORRECT, payload)
    },
    [gameId, role]
  )

  // 自動接続
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    // クリーンアップ
    return () => {
      disconnect()
    }
  }, [autoConnect])

  return {
    // 状態
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    slideStates, // スライドごとのモード状態

    // メソッド
    connect,
    disconnect,
    changeSlide,
    changeMode,
    closeAnswer,
    submitAnswer,
    shareAnswer,
    revealCorrect,
  }
}
