'use client'

import React from 'react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import ColOptionModal from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/ColOption/ColOptionModal'
import Loader from '@cm/components/utils/loader/Loader'
import {useScrollPosition} from '@cm/hooks/scrollPosition/useScrollPosition'
import {usePageTracking} from '@cm/hooks/usePageTracking'
import {twMerge} from 'tailwind-merge'
import {useGlobalContext} from '@cm/hooks/useGlobalContext/hooks/useGlobalContext'

// 新しいContext方式のインポート

export default function GlobalTemplate({children}) {
  const {showLoader, rootPath, toggleLoad} = useGlobalContext()

  useScrollPosition()
  usePageTracking()

  return (
    <div>
      <ColOptionModal />
      {showLoader && <Loader />}
      <div id="poratal-root-top-fixed"></div>
      <div
        {...{
          id: 'main-wrapper',
          className: 'bg-background ',
          style: rootPath === `apex` ? {} : {overscrollBehavior: 'none'},
        }}
      >
        {children}
      </div>
      <R_Stack id="portal-root-bottom-fixed" className={twMerge(`fixed bottom-0 w-full`)} />
      <div className={`fixed bottom-6 right-6`}>{/*  */}</div>
    </div>
  )
}
