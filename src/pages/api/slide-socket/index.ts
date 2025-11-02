import {Server} from 'socket.io'

// セッション状態を保持するためのオブジェクト
const sessionState: Record<string, {slideIndex: number; slides: any[]}> = {}

// Socket.ioサーバーのインスタンスを保持するためのグローバル変数
let io: Server

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    // pathを'/CoLab/api/slide-socket'に修正
    const io = new Server(res.socket.server, {path: '/api/slide-socket'})
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('クライアント接続: ', socket.id)
      let joinedSession: string | null = null

      // セッション参加処理
      socket.on('join-session', sessionId => {
        console.log(`セッション参加: ${socket.id} → ${sessionId}`)
        joinedSession = sessionId
        socket.join(sessionId)

        // 参加者に現在の状態を送信
        if (sessionState[sessionId]) {
          socket.emit('slide-update', sessionState[sessionId])
        }
      })

      // スライド更新処理
      socket.on('slide-update', ({sessionId, slideIndex, slides}) => {
        console.log(`スライド更新: ${sessionId}, スライド番号: ${slideIndex}`)
        sessionState[sessionId] = {slideIndex, slides}
        io.to(sessionId).emit('slide-update', {slideIndex, slides})
      })

      // セッション退出処理
      socket.on('leave-session', sessionId => {
        console.log(`セッション退出: ${socket.id} ← ${sessionId}`)
        socket.leave(sessionId)
        joinedSession = null
      })

      // 切断処理
      socket.on('disconnect', () => {
        console.log(`クライアント切断: ${socket.id}`)
        if (joinedSession) {
          socket.leave(joinedSession)
        }
      })
    })
  }
  res.end()
}
