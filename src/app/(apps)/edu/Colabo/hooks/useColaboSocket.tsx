'use client'

import {useEffect, useRef, useState, useCallback} from 'react'
import io, {Socket} from 'socket.io-client'
import {
  SOCKET_EVENTS,
  SOCKET_CONFIG,
  type JoinGamePayload,
  type ChangeSlidePayload,
  type ChangeModePayload,
  type SubmitAnswerPayload,
  type AnswerUpdatedPayload,
  type SocketErrorPayload,
  type SocketRole,
  type SlideMode,
} from '../lib/socket-config'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface UseColaboSocketProps {
  gameId: number
  role: SocketRole
  userId: number
  userName?: string
  onSlideChange?: (slideId: number, slideIndex: number) => void
  onSlideModeChange?: (slideId: number, mode: SlideMode | null) => void
  onSlideStatesSync?: (slideStates: Record<number, SlideMode | null>) => void
  onCurrentSlideSync?: (currentSlideId: number | null) => void
  onAnswerUpdate?: (data: AnswerUpdatedPayload) => void
  onAnswerSaved?: (data: {success: boolean; slideId: number}) => void
  onError?: (error: SocketErrorPayload) => void
  autoConnect?: boolean
}

/**
 * Colabo Socket.io カスタムフック（完全リビルド版）
 * シンプルで確実に動作する実装
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
  onError,
  autoConnect = true,
}: UseColaboSocketProps) {
  const socketRef = useRef<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  /**
   * Socket.io接続を確立
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('[Socket] 既に接続済み')
      return
    }

    console.log('[Socket] 接続開始...', {gameId, role, userId})
    setConnectionStatus('connecting')

    const socket = io({
      path: SOCKET_CONFIG.path,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // 接続成功
    socket.on('connect', () => {
      console.log('[Socket] 接続成功:', socket.id)
      setConnectionStatus('connected')

      // ゲームに参加
      const joinPayload: JoinGamePayload = {
        gameId,
        role,
        userId,
        userName,
      }
      console.log('[Socket] JOIN_GAME 送信:', joinPayload)
      socket.emit(SOCKET_EVENTS.JOIN_GAME, joinPayload)
    })

    // 接続確認応答
    socket.on(SOCKET_EVENTS.CONNECTION_ACK, (data: any) => {
      console.log('[Socket] CONNECTION_ACK 受信:', data)

      // スライド状態を同期
      if (data.slideStates) {
        console.log('[Socket] スライド状態を同期:', data.slideStates)
        onSlideStatesSync?.(data.slideStates)
      }

      // 現在のスライドを同期
      if (data.currentSlideId !== undefined) {
        console.log('[Socket] 現在のスライド:', data.currentSlideId)
        onCurrentSlideSync?.(data.currentSlideId)
      }
    })

    // 状態同期
    socket.on(SOCKET_EVENTS.GAME_STATE_SYNC, (data: any) => {
      console.log('[Socket] GAME_STATE_SYNC 受信:', data)

      if (data.slideStates) {
        onSlideStatesSync?.(data.slideStates)
      }
    })

    // スライド変更通知
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, (data: ChangeSlidePayload) => {
      console.log('[Socket] TEACHER_CHANGE_SLIDE 受信:', data)
      onSlideChange?.(data.slideId, data.slideIndex)
    })

    // モード変更通知
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_MODE, (data: ChangeModePayload) => {
      console.log('[Socket] TEACHER_CHANGE_MODE 受信:', data)
      onSlideModeChange?.(data.slideId, data.mode)
    })

    // 回答更新通知（教師のみ）
    socket.on(SOCKET_EVENTS.ANSWER_UPDATED, (data: AnswerUpdatedPayload) => {
      console.log('[Socket] ANSWER_UPDATED 受信:', data)
      onAnswerUpdate?.(data)
    })

    // 回答保存確認（生徒のみ）
    socket.on(SOCKET_EVENTS.ANSWER_SAVED, (data: any) => {
      console.log('[Socket] ANSWER_SAVED 受信:', data)
      onAnswerSaved?.(data)
    })

    // エラー
    socket.on(SOCKET_EVENTS.ERROR, (error: SocketErrorPayload) => {
      console.error('[Socket] エラー:', error)
      onError?.(error)
    })

    // 切断
    socket.on('disconnect', reason => {
      console.log('[Socket] 切断:', reason)
      setConnectionStatus('disconnected')
    })

    // 接続エラー
    socket.on('connect_error', error => {
      console.error('[Socket] 接続エラー:', {error})
      setConnectionStatus('error')
    })
  }, [
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
    onError,
  ])

  /**
   * 切断
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] 切断中...')
      socketRef.current.disconnect()
      socketRef.current = null
      setConnectionStatus('disconnected')
    }
  }, [])

  /**
   * スライド変更を送信（教師のみ）
   */
  const changeSlide = useCallback(
    (slideId: number, slideIndex: number) => {
      if (!socketRef.current?.connected) {
        console.warn('[Socket] 未接続のためスライド変更できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[Socket] 教師のみがスライドを変更できます')
        return
      }

      const payload: ChangeSlidePayload = {
        gameId,
        slideId,
        slideIndex,
      }

      console.log('[Socket] TEACHER_CHANGE_SLIDE 送信:', payload)
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
        console.warn('[Socket] 未接続のためモード変更できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[Socket] 教師のみがモードを変更できます')
        return
      }

      const payload: ChangeModePayload = {
        gameId,
        slideId,
        mode,
      }

      console.log('[Socket] TEACHER_CHANGE_MODE 送信:', payload)
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CHANGE_MODE, payload)
    },
    [gameId, role]
  )

  /**
   * 回答を送信（生徒のみ）
   */
  const submitAnswer = useCallback(
    (slideId: number, answer: any) => {
      if (!socketRef.current?.connected) {
        console.warn('[Socket] 未接続のため回答できません')
        return
      }

      if (role !== 'student') {
        console.warn('[Socket] 生徒のみが回答できます')
        return
      }

      const payload: SubmitAnswerPayload = {
        gameId,
        slideId,
        answer,
      }

      console.log('[Socket] STUDENT_SUBMIT_ANSWER 送信:', payload)
      socketRef.current.emit(SOCKET_EVENTS.STUDENT_SUBMIT_ANSWER, payload)
    },
    [gameId, role]
  )

  /**
   * 自動接続
   */
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect])

  return {
    // 状態
    connectionStatus,
    isConnected: connectionStatus === 'connected',

    // メソッド
    connect,
    disconnect,
    changeSlide,
    changeMode,
    submitAnswer,
  }
}
