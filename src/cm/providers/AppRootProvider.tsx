'use client'
import 'src/cm/styles/globals.css'

import React from 'react'

import NavigationContextProvider from '@cm/providers/NavigationContextProvider'
import LoaderContextProvider from '@cm/providers/LoaderContextProvider'
import SessionContextProvider from '@cm/providers/SessionContextProvider'
// import {fetcher} from '@cm/lib/swr'
import {SWRConfig} from 'swr'
import {SessionProvider} from 'next-auth/react'
const config = {
  // fetcher,
  revalidateOnFocus: false, // フォーカス時の再検証を無効化（必要に応じて）
  revalidateOnReconnect: false, // 再接続時の再検証
  dedupingInterval: 2000, // 重複リクエストの防止間隔
  errorRetryCount: 3, // エラー時のリトライ回数
  errorRetryInterval: 5000, // リトライ間隔
}

export default function AppRootProvider({children}: {children: React.ReactNode}) {
  return (
    <SessionProvider>
      <SWRConfig value={config}>
        {/* <DeviceContextProvider> */}
        <SessionContextProvider>
          <NavigationContextProvider>
            <LoaderContextProvider>{children}</LoaderContextProvider>
          </NavigationContextProvider>
        </SessionContextProvider>
        {/* </DeviceContextProvider> */}
      </SWRConfig>
    </SessionProvider>
  )
}
