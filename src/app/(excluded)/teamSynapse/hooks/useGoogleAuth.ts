import {useState, useEffect} from 'react'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/chat.messages.readonly',
].join(' ')

const TOKEN_STORAGE_KEY = 'team_synapse_access_token'
const TOKEN_EXPIRY_STORAGE_KEY = 'team_synapse_token_expiry'

// トークンが有効かチェック（有効期限の1時間前まで有効とする）
const isTokenValid = (expiryTime: number): boolean => {
  const now = Date.now()
  const oneHourInMs = 60 * 60 * 1000
  return expiryTime > now + oneHourInMs
}

export const useGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Google Identity Services ライブラリのロード
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    // ローカルストレージからトークンを復元
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY)

    if (savedToken && savedExpiry) {
      const expiryTime = parseInt(savedExpiry, 10)
      if (isTokenValid(expiryTime)) {
        setAccessToken(savedToken)
        setIsAuthenticated(true)
      } else {
        // トークンが期限切れの場合、ローカルストレージから削除
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY)
      }
    }

    setIsLoading(false)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleSignIn = () => {
    //@ts-expect-error - google is not typed
    const client = google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          const token = response.access_token
          // トークンの有効期限（通常は1時間、3600秒）
          const expiresIn = response.expires_in || 3600
          const expiryTime = Date.now() + expiresIn * 1000

          // ローカルストレージに保存
          localStorage.setItem(TOKEN_STORAGE_KEY, token)
          localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, expiryTime.toString())

          setAccessToken(token)
          setIsAuthenticated(true)
        }
      },
    })

    client.requestAccessToken()
  }

  const handleSignOut = () => {
    // ローカルストレージからトークンを削除
    const tokenToRevoke = accessToken
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY)
    setAccessToken(null)
    setIsAuthenticated(false)

    // Googleのトークンを無効化
    if (typeof window !== 'undefined' && (window as any).google && tokenToRevoke) {
      //@ts-expect-error - google is not typed
      google.accounts.oauth2.revoke(tokenToRevoke, () => {
        console.log('トークンを無効化しました')
      })
    }
  }

  return {
    isAuthenticated,
    accessToken,
    isLoading,
    handleSignIn,
    handleSignOut,
  }
}
