export const dynamic = 'force-dynamic'
import 'src/cm/styles/globals.css'

import {Suspense} from 'react'
import {Metadata} from 'next'
import GlobalToast from '@cm/components/utils/GlobalToast'

import React from 'react'

import {getServerSession, Session} from 'next-auth'
import {authOptions} from '@app/api/auth/[...nextauth]/constants/authOptions'

import AppRootProvider from '@cm/providers/AppRootProvider'

const title = process.env.NEXT_PUBLIC_TITLE
export const metadata: Metadata = {title: title}

export default async function AppRootLayout(props) {
  const session = (await getServerSession(authOptions)) as Session

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/app-icon.png" />
        <link rel="apple-touch-icon" href="/app-icon.png" />
      </head>
      <body suppressHydrationWarning>
        <Suspense>
          <AppRootProvider {...{session}}>
            <GlobalToast></GlobalToast>
            <div className={`w-screen overflow-hidden`}>{props.children}</div>
          </AppRootProvider>
        </Suspense>
      </body>
    </html>
  )
}
