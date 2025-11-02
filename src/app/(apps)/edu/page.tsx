'use client'
import {C_Stack, CenterScreen} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'
import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'

export default function Page() {
  const {session, query} = useGlobal()

  return (
    <CenterScreen>
      <C_Stack className={`items-center gap-8 text-2xl`}>
        <T_LINK href={HREF('/edu/Colabo', {}, query)}>Colabo</T_LINK>
        <T_LINK href={HREF('/edu/Grouping', {}, query)}>Grouping</T_LINK>
      </C_Stack>
    </CenterScreen>
  )
}
