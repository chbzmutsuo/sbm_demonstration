import {NextRequest} from 'next/server'
import {Server as SocketIOServer} from 'socket.io'
import {setupSocketHandlers as setupHandlers} from './handlers'

// グローバルなSocket.ioサーバーインスタンス（server.jsで初期化）
let isInitialized = false

/**
 * Socket.ioイベントハンドラーの設定
 * server.jsで初期化されたSocket.ioインスタンスにイベントハンドラーを設定
 */
function setupSocketHandlers(): void {
  if (isInitialized) {
    return
  }

  // グローバルなSocket.ioインスタンスを取得（server.jsで初期化済み）
  const io = (global as any).socketIOServer as SocketIOServer

  if (!io) {
    console.warn('[Socket.io] Socket.ioサーバーがまだ初期化されていません')
    return
  }

  setupHandlers(io)
  isInitialized = true
}

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
        io!.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, {
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
        io!.to(roomName).emit(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, {
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
        io!.to(roomName).emit(SOCKET_EVENTS.TEACHER_CHANGE_MODE, {
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
        io!.to(roomName).emit(SOCKET_EVENTS.ANSWER_UPDATED, {
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
          io!.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, {
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

  isInitialized = true
  console.log('[Socket.io] イベントハンドラー設定完了')
}

/**
 * GET: Socket.ioサーバーの状態確認
 */
export async function GET(request: NextRequest) {
  try {
    // グローバルなSocket.ioインスタンスを確認
    const socketIOServer = (global as any).socketIOServer as SocketIOServer
    return Response.json({
      status: 'ok',
      socketIOServerAvailable: !!socketIOServer,
      handlersInitialized: isInitialized,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Socket.io] GET エラー:', error)
    return Response.json({status: 'error', message: String(error)}, {status: 500})
  }
}

/**
 * POST: Socket.ioイベントハンドラーの初期化
 * server.jsでSocket.ioサーバーは既に初期化されているため、
 * この関数ではイベントハンドラーを設定するだけ
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Socket.io] POST: イベントハンドラー初期化リクエスト')

    if (isInitialized) {
      console.log('[Socket.io] イベントハンドラーは既に初期化済み')
      return Response.json({
        status: 'ok',
        message: 'Socket.io handlers already initialized',
      })
    }

    setupSocketHandlers()

    return Response.json({
      status: 'ok',
      message: 'Socket.io handlers initialized',
    })
  } catch (error) {
    console.error('[Socket.io] POST エラー:', error)
    return Response.json({status: 'error', message: String(error)}, {status: 500})
  }
}
