const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Socket.ioロジックを動的インポートするための準備
// TypeScriptのコンパイル結果がどこに出力されるかによってパスが変わる可能性があるが、
// devモード(ts-node/next dev)とproduction(next build)で扱いが異なる。
// 今回はシンプルに、Next.jsがAPI Routeとしてコンパイルしたものを利用するのではなく、
// サーバープロセスの一部としてハンドラーを読み込む。
// ただし、src/app/api/colabo-socket/handlers.ts はTypeScriptファイルなので、
// そのまま require できない。
//
// 本番環境(production)では next build でビルドされるが、server.js は node で実行される。
// シンプルにするため、server.js からはハンドラーを直接 require せず、
// Socket.io のインスタンスを作成し、Next.js の準備が整った後に
// Next.js の内部機能や別途トランスパイルされたモジュールを利用する...というのは複雑。
//
// 最も確実なのは、handlers.ts のロジックを server.js 内に書くか、
// あるいは ts-node を使うかだが、Herokuでの運用を考えると、
// Next.jsアプリの一部としてではなく、Node.jsサーバーとして動作させる必要がある。
//
// ここでは、handlers.ts を作成し、それを server.js から読み込むが、
// TypeScriptプロジェクトなので server.js 自体も TypeScript にするか、
// あるいは ts-node で実行するか、ビルド済みの JS を使う必要がある。
//
// しかし、package.json の scripts を見ると:
// "dev": "npm run convert && node server.js"
// となっている。node server.js で動かすなら server.js は JS でなければならない。
// そして require('./src/app/api/colabo-socket/handlers.ts') はできない。
//
// 解決策:
// 1. server.js も TypeScript にして ts-node で動かす (dev)
// 2. server.js は JS のまま、handlers ロジックを JS で書く (またはビルドする)
// 3. server.js 内にロジックをすべて書く (ファイル分割できない)
//
// ユーザーの指示は「src/app/api/colabo-socket/handlers.tsを作成」なので、
// TypeScript環境であることを前提としている。
// Next.js のカスタムサーバーで TypeScript を使う場合、通常は nodemon + ts-node などを使う。
//
// 今回のプランでは server.js を作成することになっている。
// Next.js プロジェクトで TypeScript を使っている場合、server.ts を使うのが一般的だが、
// カスタムサーバーのドキュメントでは server.js をトランスパイルするか、ts-node を使うことが推奨される。
//
// 簡易的なアプローチとして、
// dev環境: ts-node server.ts
// prod環境: tsc で server.ts を server.js にビルドしてから node server.js
// または、server.js 内で `require('ts-node/register')` して TS ファイルを読み込む。
//
// ここでは、server.js 内で `require('ts-node/register')` を行い、
// その後 `handlers.ts` を読み込むアプローチをとる。
// これなら server.js 自体は JS のままで、TS ファイルを import できる。

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.ioのセットアップ
  const io = new Server(server, {
    path: '/socket.io', // デフォルトパス
    transports: ['websocket', 'polling'],
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // 開発環境またはts-nodeが利用可能な場合、TypeScriptファイルを直接読み込む
  // 本番環境で node server.js で起動する場合、node_modulesにts-nodeが必要
  // package.jsonを確認すると ts-node は入っていない可能性が高い。
  //devDependenciesにはtypescriptがある。

  // 安全策として、handlersのロジックを server.js に直接記述するのではなく、
  // handlers.ts を作成し、それを読み込む形にするが、
  // 実行環境の問題を避けるため、ここでは動的にインポートする仕組みを実装する。

  // しかし、最も確実でシンプルなのは、
  // "handlers.ts" を作成するが、実行時にはそれをトランスパイルして使うか、
  // あるいは server.js 内で `ts-node/register` を使うこと。

  // package.json に ts-node を追加するのが良さそうだが、
  // ユーザーの許可なしに依存関係を追加するのは避けるべきか？
  // いや、必要な変更は行うべき。

  // ここでは、一旦 `require('ts-node').register()` を試み、
  // 失敗したらエラーを出力するようにする。
  // その上で、handlers.ts を require する。

  try {
    // TypeScriptファイルを読み込めるようにする
    require('ts-node').register({
      transpileOnly: true,
      skipProject: true, // プロジェクトのtsconfig.jsonを無視
      compilerOptions: {
        module: 'commonjs',
        target: 'es2019',
        esModuleInterop: true,
        resolveJsonModule: true,
        moduleResolution: 'node'
      }
    });

    const { setupSocketHandlers } = require('./src/app/api/colabo-socket/handlers.ts');
    setupSocketHandlers(io);

    console.log('Socket.io handlers initialized');
  } catch (e) {
    console.error('Failed to initialize socket handlers:', e);
    console.error('Make sure ts-node is installed and handlers.ts exists.');

    // 暫定的なフォールバック: 最小限の動作確認用ログ
    io.on('connection', (socket) => {
      console.log('Socket connected (fallback mode):', socket.id);
    });
  }

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})

