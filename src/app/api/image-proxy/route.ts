import { NextRequest, NextResponse } from 'next/server'

/**
 * 外部画像をプロキシしてCORS問題を回避するAPI
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'URLが必要です',
          error: 'URL is required',
        },
        { status: 400 }
      )
    }

    // URLの検証
    let url: URL
    try {
      url = new URL(imageUrl)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: '無効なURLです',
          error: 'Invalid URL',
        },
        { status: 400 }
      )
    }

    // 許可されたプロトコルのみ（セキュリティ）
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        {
          success: false,
          message: 'HTTP/HTTPSプロトコルのみ許可されています',
          error: 'Only HTTP/HTTPS protocols are allowed',
        },
        { status: 400 }
      )
    }

    // 外部画像を取得
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // タイムアウト設定
      signal: AbortSignal.timeout(10000), // 10秒
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: '画像の取得に失敗しました',
          error: `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      )
    }

    // Content-Typeを確認
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          message: '画像ファイルではありません',
          error: 'Not an image file',
        },
        { status: 400 }
      )
    }

    // 画像データを取得
    const imageBuffer = await response.arrayBuffer()

    // 画像をプロキシ経由で返す
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
      },
    })
  } catch (error) {
    console.error('画像プロキシエラー:', error)

    // タイムアウトエラーの処理
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          message: '画像の取得がタイムアウトしました',
          error: 'Request timeout',
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: '画像の取得に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


