/**
 * Socket.io設定ファイル
 * Colaboアプリのリアルタイム通信用の設定と型定義
 */

// Socket.ioの接続パス
export const SOCKET_PATH = '/socket.io'

// Socket.io接続URL（環境に応じて自動設定）
export const SOCKET_URL =
  typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:3000'

// Socket.io接続設定
export const SOCKET_CONFIG = {
  path: SOCKET_PATH,
  transports: ['websocket', 'polling'], // WebSocketを優先
  reconnection: true,
  reconnectionAttempts: 10, // 再接続試行回数を増やす
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 30000, // タイムアウトを長く
  autoConnect: false, // 手動で接続を管理
  forceNew: false, // 既存の接続を再利用
  upgrade: true, // polling → websocketへのアップグレードを許可
}

// イベント名の定数定義
export const SOCKET_EVENTS = {
  // 接続関連
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_GAME: 'join-game',
  LEAVE_GAME: 'leave-game',
  CONNECTION_ACK: 'connection-ack',
  ERROR: 'error',

  // スライド操作（教師のみ）
  TEACHER_CHANGE_SLIDE: 'teacher:change-slide',
  TEACHER_CHANGE_MODE: 'teacher:change-mode',
  TEACHER_CLOSE_ANSWER: 'teacher:close-answer',

  // 回答関連（生徒）
  STUDENT_SUBMIT_ANSWER: 'student:submit-answer',
  STUDENT_ANSWER_SAVED: 'student:answer-saved',

  // 結果共有（教師のみ）
  TEACHER_SHARE_ANSWER: 'teacher:share-answer',
  TEACHER_REVEAL_CORRECT: 'teacher:reveal-correct',

  // 全体同期
  GAME_STATE_SYNC: 'game:state-sync',
  GAME_ANSWER_UPDATED: 'game:answer-updated',
} as const

// 型定義

export type SocketRole = 'teacher' | 'student'
export type SlideMode = 'view' | 'answer' | 'result'

// 接続ペイロード
export interface JoinGamePayload {
  gameId: number
  role: SocketRole
  userId: number
  userName?: string
}

// スライド切り替えペイロード
export interface ChangeSlidePayload {
  gameId: number
  slideId: number
  slideIndex: number
}

// モード変更ペイロード（スライドごと）
export interface ChangeModePayload {
  gameId: number
  slideId: number
  mode: SlideMode
}

// 回答締切ペイロード
export interface CloseAnswerPayload {
  gameId: number
  slideId: number
}

// 生徒回答送信ペイロード
export interface SubmitAnswerPayload {
  gameId: number
  slideId: number
  studentId: number
  answerData: any
}

// 回答共有ペイロード
export interface ShareAnswerPayload {
  gameId: number
  slideId: number
  answerId: number
  isAnonymous: boolean
}

// 正答公開ペイロード
export interface RevealCorrectPayload {
  gameId: number
  slideId: number
}

// 状態同期ペイロード
export interface GameStateSyncPayload {
  gameId: number
  currentSlideId: number | null
  mode: SlideMode | null
  stats?: {
    totalStudents: number
    connectedStudents: number
  }
}

// 回答状況更新ペイロード
export interface AnswerUpdatedPayload {
  gameId: number
  slideId: number
  answerCount: number
  totalStudents: number
  answers?: any[]
}

// 接続確認応答ペイロード
export interface ConnectionAckPayload {
  success: boolean
  gameId: number
  role: SocketRole
  currentState?: GameStateSyncPayload
}

// エラーペイロード
export interface SocketErrorPayload {
  message: string
  code?: string
}
