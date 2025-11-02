const {createServer} = require('http')
const {parse} = require('url')
const next = require('next')
const {Server} = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Next.jsアプリを初期化
const app = next({dev, hostname, port})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // HTTPサーバーを作成
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.ioサーバーを初期化
  const io = new Server(httpServer, {
    path: '/api/colabo-socket',
    addTrailingSlash: false,
    cors: {
      origin: dev ? 'http://localhost:3000' : true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  console.log('[Socket.io] サーバー初期化完了')

  // Socket.ioサーバーをグローバルに設定（Route Handlerで使用）
  global.httpServer = httpServer
  global.socketIOServer = io

  // Socket.ioイベントハンドラーはRoute Handlerで定義
  // Route Handlerから初期化されたSocket.ioインスタンスを使用

  httpServer
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
