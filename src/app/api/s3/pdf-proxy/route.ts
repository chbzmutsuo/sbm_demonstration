import {NextRequest, NextResponse} from 'next/server'
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3'

// S3クライアントの設定
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// URLからキーを抽出
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // CloudFrontの場合
    if (process.env.S3_CLOUDFRONT_DOMAIN && urlObj.hostname === process.env.S3_CLOUDFRONT_DOMAIN) {
      return urlObj.pathname.substring(1) // 先頭の'/'を削除
    }

    // S3直接URLの場合
    if (urlObj.hostname.includes('.s3.') || urlObj.hostname.includes('.s3-')) {
      return urlObj.pathname.substring(1) // 先頭の'/'を削除
    }

    return null
  } catch (error) {
    console.warn('URL解析エラー:', error)
    return null
  }
}

// GET: PDFファイルをプロキシ
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const {searchParams} = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: 'URLが必要です',
          error: 'URL is required',
        },
        {status: 400}
      )
    }

    const key = extractKeyFromUrl(url)
    if (!key) {
      return NextResponse.json(
        {
          success: false,
          message: '無効なURLです',
          error: 'Invalid URL',
        },
        {status: 400}
      )
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      return NextResponse.json(
        {
          success: false,
          message: 'ファイルが見つかりません',
          error: 'File not found',
        },
        {status: 404}
      )
    }

    // StreamをBufferに変換
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()

    while (true) {
      const {done, value} = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))

    // PDFファイルとして返す
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('PDFプロキシエラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'PDFの取得に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
