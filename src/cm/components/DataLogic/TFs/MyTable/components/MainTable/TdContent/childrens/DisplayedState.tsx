'use client'
import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import React, {useMemo} from 'react'
import {cn} from '@shadcn/lib/utils'

export const DisplayedState = React.memo((props: {col; record; value}) => {
  const {col, record, value} = props

  function _getR_StackClass(col) {
    if (col.type === 'number') {
      return 'justify-end'
    } else if (col.type === 'textarea') {
      return 'justify-start'
    } else if (col.type === 'text') {
      return 'justify-start'
    } else if (col.forSelect) {
      return 'justify-center'
    }
  }

  const rStackClass = useMemo(() => _getR_StackClass(col), [col?.type])

  return (
    <R_Stack id={`${col.id}-${record.id}`} className={cn(`  h-full items-start wrap-break-words  `, rStackClass)}>
      <div className={`text-start `}>{value}</div>
      {col.affix?.label && <div style={{marginLeft: 1, color: 'gray', fontSize: '0.6rem'}}>{col.affix.label}</div>}
    </R_Stack>
  )
})
