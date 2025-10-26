'use client'
import {C_Stack, CenterScreen} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'
import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'
import Link from 'next/link'

export default function Page() {
  const {session, query} = useGlobal()

  return (
    <CenterScreen className={`p-8`}>
      <div className="flex flex-col items-center gap-10 w-full">
        <div className="mb-10 text-center">
          <p className="text-gray-500 text-lg">以下から利用したいサービスを選択してください</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 w-full max-w-xl">
          <Link
            href={HREF('/edu/Colabo', {}, query)}
            className="group rounded-2xl p-8 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all flex flex-col items-center gap-2 border border-blue-200 hover:border-blue-500"
          >
            <span className="text-5xl mb-3 group-hover:scale-105 transition transform">🤝</span>
            <span className="text-2xl font-bold text-blue-900 mb-1">Colabo</span>
            <span className="text-base text-blue-700 opacity-80 text-center">
              スライドを通じた
              <br />
              インタラクティブな授業運営
            </span>
          </Link>
          <Link
            href={HREF('/edu/Grouping', {}, query)}
            className="group rounded-2xl p-8 shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 transition-all flex flex-col items-center gap-2 border border-yellow-200 hover:border-yellow-400"
          >
            <span className="text-5xl mb-3 group-hover:scale-105 transition transform">👥</span>
            <span className="text-2xl font-bold text-yellow-900 mb-1">Grouping</span>
            <span className="text-base text-yellow-700 opacity-80 text-center">
              心理アンケートに基づく
              <br />
              グループ分け支援
            </span>
          </Link>
        </div>
      </div>
    </CenterScreen>
  )
}
