import {useState, useEffect} from 'react'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/chat.messages.readonly',
].join(' ')

const ACCESS_TOKEN_KEY = 'google_access_token'

export const useGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // 初回マウント時に保存されたトークンをチェック
  useEffect(() => {
    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (savedToken) {
      setAccessToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    // Google Identity Services ライブラリのロード
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleSignIn = () => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token)
          setIsAuthenticated(true)
          // トークンをlocalStorageに保存
          localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token)
        }
      },
    })

    client.requestAccessToken()
  }

  const handleSignOut = () => {
    setAccessToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  return {
    isAuthenticated,
    accessToken,
    handleSignIn,
    handleSignOut,
  }
}

