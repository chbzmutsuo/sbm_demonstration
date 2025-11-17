'use client'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {sleep} from '@cm/lib/methods/common'
import {useState, useRef, useCallback, useEffect, useMemo} from 'react'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import {toast} from 'react-toastify'

interface CameraUploadProps {
  onImageCapture: (files: File[]) => void
  isAnalyzing: boolean
  analysisStatus: string
}

export default function CameraUpload({onImageCapture, isAnalyzing, analysisStatus}: CameraUploadProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImages, setCapturedImages] = useState<{file: File; preview: string}[]>([])
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [debugInfo, setDebugInfo] = useState('')

  // モバイル検出
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
  }, [])

  // 重要な状態をrefで保持（モバイル対策）
  const capturedImagesRef = useRef<File[]>([])
  const previewImagesRef = useRef<string[]>([])
  const isCameraOpenRef = useRef(false)

  // 状態の同期
  useEffect(() => {
    capturedImagesRef.current = capturedImages.map(img => img.file)
    previewImagesRef.current = capturedImages.map(img => img.preview)
    isCameraOpenRef.current = isCameraOpen
  }, [capturedImages, isCameraOpen])

  // モバイル専用：状態保護
  useEffect(() => {
    if (!isMobile) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ページが非表示になる時にカメラを停止
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }
    }

    const handleScroll = () => {
      // スクロール時に状態を保護
      if (capturedImagesRef.current.length > 0) {
        console.log('スクロール検出 - 画像状態を保護:', capturedImagesRef.current.length)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, {passive: true})

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  // ブラウザサポートチェック（メモ化）
  const checkBrowserSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('このブラウザはカメラ機能をサポートしていません')
    }

    // HTTPSチェック（localhostは除外）
    if (
      window.location.protocol === 'http:' &&
      !window.location.hostname.includes('localhost') &&
      window.location.hostname !== '127.0.0.1'
    ) {
      throw new Error('セキュリティ上の理由により、HTTPSでのアクセスが必要です。https://でアクセスしてください。')
    }
  }, [])

  // カメラを開始（useCallbackでメモ化）
  const startCamera = useCallback(async () => {
    try {
      setIsCameraOpen(true)
      setIsStartingCamera(true)
      setCameraError(null)
      setIsVideoReady(false)

      // ブラウザサポートチェック
      checkBrowserSupport()

      console.log('カメラ起動開始...')

      // ビデオ要素の存在確認
      // if (!videoRef.current) {
      //   throw new Error('ビデオ要素が見つかりません。ページを再読み込みしてください。')
      // }
      await sleep(500)

      // 段階的にカメラ制約を試行
      const constraints = [
        // 最初に高解像度で試行
        {
          video: {
            facingMode: 'environment',
            width: {ideal: 1920, max: 1920},
            height: {ideal: 1080, max: 1080},
          },
        },
        // 次に中解像度で試行
        {
          video: {
            facingMode: 'environment',
            width: {ideal: 1280, max: 1280},
            height: {ideal: 720, max: 720},
          },
        },
        // 最後に基本設定で試行
        {
          video: {
            facingMode: 'environment',
          },
        },
        // 最終的にフロントカメラでも試行
        {
          video: true,
        },
      ]

      let mediaStream: MediaStream | null = null
      let lastError: Error | null = null

      for (const constraint of constraints) {
        try {
          console.log('カメラ制約を試行:', constraint)
          mediaStream = await navigator.mediaDevices.getUserMedia(constraint)
          console.log('カメラアクセス成功:', mediaStream.getVideoTracks()[0].getSettings())
          break
        } catch (error) {
          console.warn('カメラ制約失敗:', constraint, error)
          lastError = error as Error
          continue
        }
      }

      if (!mediaStream) {
        throw lastError || new Error('すべてのカメラ制約で失敗しました')
      }

      setStream(mediaStream)

      // ビデオ要素の再確認
      if (!videoRef.current) {
        throw new Error('ビデオ要素が見つかりません（ストリーム取得後）')
      }

      // ストリームをビデオ要素に設定
      videoRef.current.srcObject = mediaStream

      // ビデオの準備完了を待つ
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('ビデオ要素が見つかりません'))
          return
        }

        let isResolved = false
        const resolveOnce = () => {
          if (!isResolved) {
            isResolved = true
            console.log('ビデオ準備完了')
            setIsVideoReady(true)
            resolve()
          }
        }

        // 複数のイベントで準備完了を検知
        videoRef.current.onloadedmetadata = () => {
          console.log('ビデオメタデータ読み込み完了')
          resolveOnce()
        }

        videoRef.current.oncanplay = () => {
          console.log('ビデオ再生準備完了')
          resolveOnce()
        }

        videoRef.current.onloadeddata = () => {
          console.log('ビデオデータ読み込み完了')
          resolveOnce()
        }

        // エラーハンドリング
        videoRef.current.onerror = e => {
          console.error('ビデオエラー:', e)
          if (!isResolved) {
            isResolved = true
            reject(new Error('ビデオの読み込みに失敗しました'))
          }
        }

        // 再生を開始
        videoRef.current
          .play()
          .then(() => {
            console.log('ビデオ再生開始成功')
            // 再生開始後、少し待ってから準備完了とする
            setTimeout(resolveOnce, 500)
          })
          .catch(playError => {
            console.warn('ビデオ自動再生失敗（通常は問題なし）:', playError)
            // 自動再生に失敗しても準備完了とする
            setTimeout(resolveOnce, 1000)
          })

        // タイムアウト処理（5秒後に強制的に準備完了）
        setTimeout(() => {
          if (!isResolved) {
            console.warn('ビデオ準備タイムアウト - 強制的に準備完了とします')
            resolveOnce()
          }
        }, 5000)
      })

      toast.success('カメラを起動しました')
    } catch (error) {
      console.error('カメラアクセスエラー:', error)
      let errorMessage = 'カメラにアクセスできませんでした'

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'カメラの使用が許可されていません。ブラウザの設定でカメラアクセスを許可してください。'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されているか確認してください。'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'カメラが他のアプリケーションで使用中です。他のアプリを閉じてから再試行してください。'
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'カメラの設定に問題があります。別の解像度で再試行してください。'
        } else if (error.name === 'SecurityError') {
          errorMessage = 'セキュリティ上の理由でカメラにアクセスできません。HTTPSでアクセスしているか確認してください。'
        } else {
          errorMessage = `カメラエラー: ${error.message}`
        }
      }

      setCameraError(errorMessage)
      toast.error(errorMessage)

      // エラー時はカメラ状態をリセット
      setIsCameraOpen(false)
      setIsVideoReady(false)
    } finally {
      setIsStartingCamera(false)
    }
  }, [checkBrowserSupport])

  // カメラを停止（useCallbackでメモ化）
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('カメラトラック停止:', track.label)
        track.stop()
      })
      setStream(null)
    }
    setIsCameraOpen(false)
    setIsVideoReady(false)
    setCameraError(null)
    setIsStartingCamera(false)
  }, [stream])

  // 画像をキャプチャ（useCallbackでメモ化）
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      console.error('キャプチャに必要な要素が不足')
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) {
        console.error('Canvas context取得失敗')
        return
      }

      // ビデオのサイズに合わせてcanvasを設定
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // ビデオフレームをcanvasに描画
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // canvasからBlobを生成
      canvas.toBlob(
        blob => {
          if (blob) {
            const timestamp = Date.now()
            const file = new File([blob], `receipt_${timestamp}.jpg`, {type: 'image/jpeg'})
            const preview = URL.createObjectURL(blob)

            // 新しい画像を追加
            const newImage = {file, preview}
            setCapturedImages(prev => {
              const updated = [...prev, newImage]
              console.log('画像をキャプチャ:', updated.length, '枚目')

              // モバイルの場合は即座にrefも更新
              if (isMobile) {
                capturedImagesRef.current = updated.map(img => img.file)
                previewImagesRef.current = updated.map(img => img.preview)
              }

              return updated
            })
          }
        },
        'image/jpeg',
        0.8
      )
    } catch (error) {
      console.error('画像キャプチャエラー:', error)
      setCameraError('画像のキャプチャに失敗しました')
    }
  }, [stream, isMobile])

  // 画像を削除（useCallbackでメモ化）
  const removeImage = useCallback(
    (index: number) => {
      setCapturedImages(prev => {
        const updated = prev.filter((_, i) => i !== index)

        // プレビューURLをクリーンアップ
        if (prev[index]) {
          URL.revokeObjectURL(prev[index].preview)
        }

        // モバイルの場合は即座にrefも更新
        if (isMobile) {
          capturedImagesRef.current = updated.map(img => img.file)
          previewImagesRef.current = updated.map(img => img.preview)
        }

        return updated
      })
    },
    [isMobile]
  )

  // 解析開始（useCallbackでメモ化）
  const handleAnalyze = useCallback(() => {
    if (capturedImages.length === 0) {
      setCameraError('解析する画像がありません')
      return
    }

    console.log('解析開始:', capturedImages.length, '枚の画像')

    // モバイルの場合はrefから最新の状態を取得
    const imagesToAnalyze = isMobile ? capturedImagesRef.current : capturedImages.map(img => img.file)

    onImageCapture(imagesToAnalyze)

    // 解析後は画像をクリア
    capturedImages.forEach(img => URL.revokeObjectURL(img.preview))
    // setCapturedImages([])

    if (isMobile) {
      capturedImagesRef.current = []
      previewImagesRef.current = []
    }
  }, [capturedImages, onImageCapture, isMobile])

  // ファイル選択処理（useCallbackでメモ化）
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file)
          const newImage = {file, preview}

          setCapturedImages(prev => {
            const updated = [...prev, newImage]

            // モバイルの場合は即座にrefも更新
            if (isMobile) {
              capturedImagesRef.current = updated.map(img => img.file)
              previewImagesRef.current = updated.map(img => img.preview)
            }

            return updated
          })
        }
      })

      // ファイル入力をリセット
      event.target.value = ''
    },
    [isMobile]
  )

  // デバッグ情報（useMemoでメモ化）
  const debugInfoMemo = useMemo(() => {
    if (!showDebugInfo) return null

    const info = [
      `ブラウザサポート: ${navigator.mediaDevices ? 'あり' : 'なし'}`,
      `カメラ開放: ${isCameraOpen ? 'はい' : 'いいえ'}`,
      `ビデオ準備: ${isVideoReady ? 'はい' : 'いいえ'}`,
      `ストリーム: ${stream ? 'あり' : 'なし'}`,
      `ビデオ要素: ${videoRef.current ? 'あり' : 'なし'}`,
      `プロトコル: ${typeof window !== 'undefined' ? window.location.protocol : 'unknown'}`,
      `撮影済み画像: ${capturedImages.length}枚`,
      `モバイル: ${isMobile ? 'はい' : 'いいえ'}`,
      `Ref画像数: ${capturedImagesRef.current.length}枚`,
      `エラー: ${cameraError || 'なし'}`,
    ]

    return (
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
        <div className="font-semibold mb-2">デバッグ情報:</div>
        {info.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
        {isMobile && <div className="mt-2 text-orange-600">⚠️ モバイル環境: 状態保護モード有効</div>}
      </div>
    )
  }, [showDebugInfo, navigator.mediaDevices, isCameraOpen, isVideoReady, stream, capturedImages.length, isMobile, cameraError])

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <div
      className={`p-3 sm:p-4 border-2 border-dashed rounded-lg transition-colors ${
        isAnalyzing ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {/* ヘッダー */}
      <div className="text-center mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">領収書画像の取り込み</h3>
          <button onClick={() => setShowDebugInfo(!showDebugInfo)} className="text-xs text-gray-500 hover:text-gray-700">
            {showDebugInfo ? 'デバッグ非表示' : 'デバッグ表示'}
          </button>
        </div>
        {/* <p className="text-sm text-gray-600">複数の画像を撮影・選択してから「解析」ボタンで一括解析できます</p> */}

        {/* デバッグ情報 */}
        {debugInfoMemo}
      </div>

      {/* AI解析中の表示 */}
      {isAnalyzing && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">{analysisStatus}</p>
          </div>
        </div>
      )}

      {/* カメラエラー表示 */}
      {cameraError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{cameraError}</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => setCameraError(null)} className="text-xs text-red-600 hover:text-red-800 underline">
              エラーを閉じる
            </button>
            <button onClick={startCamera} className="text-xs text-red-600 hover:text-red-800 underline">
              再試行
            </button>
          </div>
        </div>
      )}

      {/* HTTPプロトコル警告 */}
      {window.location.protocol === 'http:' &&
        !window.location.hostname.includes('localhost') &&
        window.location.hostname !== '127.0.0.1' && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div>
                <p className="text-yellow-800 font-medium text-sm">セキュリティ警告</p>
                <p className="text-yellow-700 text-sm mt-1">カメラ機能を使用するにはHTTPS接続が必要です。</p>
                <p className="text-yellow-700 text-sm mt-1">
                  URLを <code className="bg-yellow-200 px-1 rounded">https://</code> に変更してアクセスしてください。
                </p>
              </div>
            </div>
          </div>
        )}

      {/* カメラ起動中の表示 */}
      {isStartingCamera && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            <p className="text-yellow-800 font-medium">カメラを起動中...</p>
          </div>
        </div>
      )}

      {/* カメラビュー */}
      {isCameraOpen && (
        <div className="mb-4 relative bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />

          {/* カメラ準備中の表示 */}
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm mb-3">カメラを準備中...</p>
              </div>
            </div>
          )}

          {/* カメラコントロール */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={captureImage}
              disabled={isAnalyzing || !isVideoReady}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </button>
            <button onClick={stopCamera} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              カメラ終了
            </button>
          </div>

          {/* ガイドライン */}
          <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-50 pointer-events-none">
            <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              領収書をこの枠内に
            </div>
          </div>
        </div>
      )}

      {/* キャンバス（非表示） */}
      <canvas ref={canvasRef} style={{display: 'none'}} />

      {/* アクションボタン */}
      {!isCameraOpen && (
        <C_Stack className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={startCamera}
            disabled={isAnalyzing || isStartingCamera}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isStartingCamera && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isStartingCamera ? 'カメラ起動中...' : 'カメラで撮影'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            type="button"
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            ギャラリーから選択
          </button>
        </C_Stack>
      )}

      {/* ファイル入力（非表示） */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{display: 'none'}} />

      {/* 撮影済み画像のプレビューと解析ボタン */}
      {capturedImages.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900">撮影済み画像 ({capturedImages.length}枚)</h4>
            <div className="flex flex-col   sm:flex-row gap-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isAnalyzing ? '解析中...' : '解析開始'}
              </button>
              <button
                onClick={() => setCapturedImages([])}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
              >
                すべて削除
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {capturedImages.map((image, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => {
                    const modal = document.createElement('div')
                    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
                    modal.onclick = () => modal.remove()

                    const container = document.createElement('div')
                    container.className = 'max-w-[90vw] max-h-[90vh] w-[90vw]'
                    container.innerHTML = ''

                    // ContentPlayer は React コンポーネントのため、ここでは簡易的に img を使用
                    const img = document.createElement('img')
                    img.src = image.preview
                    img.className = 'max-w-[90vw] max-h-[90vh] object-contain'
                    container.appendChild(img)

                    modal.appendChild(container)
                    document.body.appendChild(modal)
                  }}
                  className="w-full h-20 relative"
                >
                  <div className="w-full h-full rounded border overflow-hidden">
                    <ContentPlayer src={image.preview} />
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </button>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
