// Google Identity Services (GIS) のグローバル型定義

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: {
              access_token?: string
              error?: string
            }) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

// グローバル変数として使用できるようにする
declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: {
          access_token?: string
          error?: string
        }) => void
      }) => {
        requestAccessToken: () => void
      }
    }
  }
}

export {}

