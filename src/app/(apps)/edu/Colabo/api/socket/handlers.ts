import {Server as SocketIOServer, Socket} from 'socket.io'
import prisma from '../../../../../../../lib/prisma'
import {
  SOCKET_EVENTS,
  type JoinGamePayload,
  type ChangeSlidePayload,
  type ChangeModePayload,
  type SubmitAnswerPayload,
  type SocketErrorPayload,
  type SocketRole,
} from '../../../lib/socket-config'

// ゲーム状態管理（メモリ内）
interface GameState {
  participants: Map<string, {socketId: string; role: SocketRole; userId: number; userName?: string}>
  slideStates: Map<number, 'view' | 'answer' | 'result' | null> // slideId -> mode
}

const gameStates = new Map<number, GameState>()
const socketInfo = new Map<string, {gameId: number; role: SocketRole; userId: number}>()

/**
 * ゲーム状態の取得または作成
 * DBからスライドのモード状態を読み込む
 */
async function getOrCreateGameState(gameId: number): Promise<GameState> {
  if (!gameStates.has(gameId)) {
    try {
      console.log(`[Socket.io] Game ${gameId} の状態を初期化中...`)

      const slides = await prisma.slide.findMany({
        where: {gameId, active: true},
        select: {id: true, mode: true},
      })

      const slideStates = new Map<number, 'view' | 'answer' | 'result' | null>()
      slides.forEach(slide => {
        slideStates.set(slide.id, (slide.mode as 'view' | 'answer' | 'result' | null) ?? null)
      })

      gameStates.set(gameId, {
        participants: new Map(),
        slideStates,
      })

      console.log(`[Socket.io] Game ${gameId} の状態を初期化完了:`, {
        slideCount: slides.length,
        slideStates: Object.fromEntries(slideStates),
      })
    } catch (error) {
      console.error(`[Socket.io] Game ${gameId} の状態初期化エラー:`, error)
      gameStates.set(gameId, {
        participants: new Map(),
        slideStates: new Map(),
      })
    }
  }

  return gameStates.get(gameId)!
}

/**
 * 参加者統計の取得
 */
function getGameStats(gameId: number) {
  const gameState = gameStates.get(gameId)
  if (!gameState) {
    return {totalStudents: 0, connectedStudents: 0}
  }

  const students = Array.from(gameState.participants.values()).filter(p => p.role === 'student')
  return {
    totalStudents: students.length,
    connectedStudents: students.length,
  }
}

/**
 * Socket.ioイベントハンドラーの設定
 */
export function setupSocketHandlers(io: SocketIOServer): void {
  console.log('[Socket.io] イベントハンドラーを設定中...')

  // Socket.ioイベントハンドラーの設定
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] クライアント接続: ${socket.id}`)

    /**
     * 1. ゲーム参加
     */
    socket.on(SOCKET_EVENTS.JOIN_GAME, async (payload: JoinGamePayload) => {
      try {
        const {gameId, role, userId, userName} = payload
        console.log(`[Socket.io] JOIN_GAME:`, {gameId, role, userId, userName})

        const roomName = `game-${gameId}`
        socket.join(roomName)

        // ゲーム状態を取得（DBから読み込み）
        const gameState = await getOrCreateGameState(gameId)

        // 参加者を登録
        const participantKey = `${role}-${userId}`
        gameState.participants.set(participantKey, {socketId: socket.id, role, userId, userName})
        socketInfo.set(socket.id, {gameId, role, userId})

        console.log(`[Socket.io] ${role} (userId: ${userId}) がルーム ${roomName} に参加`)

        // DBから現在のスライド情報を取得
        const currentGame = await prisma.game.findUnique({
          where: {id: gameId},
          select: {currentSlideId: true},
        })

        // 接続確認応答を送信（このクライアントのみ）
        const slideStatesObj = Object.fromEntries(gameState.slideStates)
        socket.emit(SOCKET_EVENTS.CONNECTION_ACK, {
          success: true,
          gameId,
          role,
          slideStates: slideStatesObj,
          currentSlideId: currentGame?.currentSlideId || null,
          stats: getGameStats(gameId),
        })

        console.log(`[Socket.io] CONNECTION_ACK 送信完了:`, {
          slideStates: slideStatesObj,
          currentSlideId: currentGame?.currentSlideId,
        })

        // 全員に参加者数の更新を通知
        io.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, {
          gameId,
          slideStates: slideStatesObj,
          stats: getGameStats(gameId),
        })
      } catch (error) {
        console.error('[Socket.io] JOIN_GAME エラー:', error)
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Gameへの参加に失敗しました',
          code: 'JOIN_GAME_ERROR',
        } as SocketErrorPayload)
      }
    })

    /**
     * 2. スライド変更（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, async (payload: ChangeSlidePayload) => {
      try {
        const {gameId, slideId, slideIndex} = payload
        console.log(`[Socket.io] TEACHER_CHANGE_SLIDE:`, {gameId, slideId, slideIndex})

        // 教師権限チェック
        const socketData = socketInfo.get(socket.id)
        if (!socketData || socketData.role !== 'teacher') {
          console.error(`[Socket.io] 権限エラー: ${socketData?.role || 'unknown'}`)
          socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'スライド変更の権限がありません',
            code: 'UNAUTHORIZED',
          } as SocketErrorPayload)
          return
        }

        // DBに現在のスライドを保存
        await prisma.game.update({
          where: {id: gameId},
          data: {currentSlideId: slideId},
        })

        console.log(`[Socket.io] DB更新完了: currentSlideId = ${slideId}`)

        // 全員に通知
        const roomName = `game-${gameId}`
        io.to(roomName).emit(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, {
          gameId,
          slideId,
          slideIndex,
        })

        console.log(`[Socket.io] TEACHER_CHANGE_SLIDE ブロードキャスト完了`)
      } catch (error) {
        console.error('[Socket.io] TEACHER_CHANGE_SLIDE エラー:', error)
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'スライドの変更に失敗しました',
          code: 'CHANGE_SLIDE_ERROR',
        } as SocketErrorPayload)
      }
    })

    /**
     * 3. モード変更（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_MODE, async (payload: ChangeModePayload) => {
      try {
        const {gameId, slideId, mode} = payload
        console.log(`[Socket.io] TEACHER_CHANGE_MODE:`, {gameId, slideId, mode})

        // 教師権限チェック
        const socketData = socketInfo.get(socket.id)
        if (!socketData || socketData.role !== 'teacher') {
          console.error(`[Socket.io] 権限エラー: ${socketData?.role || 'unknown'}`)
          socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'モード変更の権限がありません',
            code: 'UNAUTHORIZED',
          } as SocketErrorPayload)
          return
        }

        // メモリ内の状態を更新
        const gameState = await getOrCreateGameState(gameId)
        gameState.slideStates.set(slideId, mode)

        console.log(`[Socket.io] メモリ更新完了: Slide ${slideId} = ${mode}`)

        // DBに永続化
        await prisma.slide.update({
          where: {id: slideId},
          data: {mode},
        })

        console.log(`[Socket.io] DB更新完了: Slide ${slideId} mode = ${mode}`)

        // 全員に通知
        const roomName = `game-${gameId}`
        io.to(roomName).emit(SOCKET_EVENTS.TEACHER_CHANGE_MODE, {
          gameId,
          slideId,
          mode,
        })

        console.log(`[Socket.io] TEACHER_CHANGE_MODE ブロードキャスト完了`)
      } catch (error) {
        console.error('[Socket.io] TEACHER_CHANGE_MODE エラー:', error)
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'モードの変更に失敗しました',
          code: 'CHANGE_MODE_ERROR',
        } as SocketErrorPayload)
      }
    })

    /**
     * 4. 回答送信（生徒のみ）
     */
    socket.on(SOCKET_EVENTS.STUDENT_SUBMIT_ANSWER, async (payload: SubmitAnswerPayload) => {
      try {
        const {gameId, slideId, answer} = payload
        console.log(`[Socket.io] STUDENT_SUBMIT_ANSWER:`, {gameId, slideId, answerType: typeof answer})

        // 生徒権限チェック
        const socketData = socketInfo.get(socket.id)
        if (!socketData || socketData.role !== 'student') {
          console.error(`[Socket.io] 権限エラー: ${socketData?.role || 'unknown'}`)
          socket.emit(SOCKET_EVENTS.ERROR, {
            message: '回答送信の権限がありません',
            code: 'UNAUTHORIZED',
          } as SocketErrorPayload)
          return
        }

        // 教師に回答更新を通知
        const roomName = `game-${gameId}`
        io.to(roomName).emit(SOCKET_EVENTS.ANSWER_UPDATED, {
          gameId,
          slideId,
          userId: socketData.userId,
          timestamp: new Date().toISOString(),
        })

        console.log(`[Socket.io] ANSWER_UPDATED ブロードキャスト完了`)

        // 送信者に確認を返す
        socket.emit(SOCKET_EVENTS.ANSWER_SAVED, {
          success: true,
          slideId,
        })
      } catch (error) {
        console.error('[Socket.io] STUDENT_SUBMIT_ANSWER エラー:', error)
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: '回答の送信に失敗しました',
          code: 'SUBMIT_ANSWER_ERROR',
        } as SocketErrorPayload)
      }
    })

    /**
     * 5. 切断処理
     */
    socket.on('disconnect', () => {
      console.log(`[Socket.io] クライアント切断: ${socket.id}`)

      const socketData = socketInfo.get(socket.id)
      if (socketData) {
        const {gameId, role, userId} = socketData
        const gameState = gameStates.get(gameId)

        if (gameState) {
          const participantKey = `${role}-${userId}`
          gameState.participants.delete(participantKey)

          // 全員に参加者数の更新を通知
          const roomName = `game-${gameId}`
          const stats = getGameStats(gameId)
          io.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, {
            gameId,
            slideStates: Object.fromEntries(gameState.slideStates),
            stats,
          })

          console.log(`[Socket.io] ${role} (userId: ${userId}) がGame ${gameId}から退出`)
        }

        socketInfo.delete(socket.id)
      }
    })
  })

  console.log('[Socket.io] イベントハンドラー設定完了')
}


