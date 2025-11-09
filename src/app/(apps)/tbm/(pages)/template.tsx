'use client'

import useGasolineGMF from '@app/(apps)/tbm/(globalHooks)/useGasolineGMF'
import useOdometerInputGMF from '@app/(apps)/tbm/(globalHooks)/useOdometerInputGMF'
import useProductMidEditor from '@app/(apps)/tbm/(globalHooks)/useProductMidEditorGMF'
import useCarWashGMF from '@app/(apps)/tbm/(globalHooks)/useCarWashGMF'
import React from 'react'

import useUnchinChildCreator from '@app/(apps)/tbm/(globalHooks)/useUnchinChildCreator'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function Template({children}) {
  const HK_OdometerInputGMF = useOdometerInputGMF()
  const HK_GasolineGMF = useGasolineGMF()
  const HK_ProductMidEditor = useProductMidEditor()
  const HK_CarWashGMF = useCarWashGMF()
  const HK_UnchinChildCreator = useUnchinChildCreator()

  // const GMF_ROUTE_GROUP_CONFIG =

  const {
    session,
    query: {g_tbmBaseId},
  } = useGlobal()

  if (!session?.scopes.getTbmScopes()?.tbmBaseId) {
    // return <div>営業所が設定されていません。</div>
  }

  return (
    <div>
      <HK_ProductMidEditor.Modal />
      <HK_GasolineGMF.Modal />
      <HK_OdometerInputGMF.Modal />
      <HK_CarWashGMF.Modal />
      <HK_UnchinChildCreator.Modal />
      {children}
    </div>
  )
}
