import React from 'react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {funcOrVar} from '@cm/lib/methods/common'
import Control from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control'
import {cn} from '@shadcn/lib/utils'

export default function LeftControlRight({col, controlContextValue}) {
  return (
    <div className={cn(' ', col?.form?.disabled ? 'pointer-events-none' : '')}>
      <R_Stack className={`w-full flex-nowrap gap-0.5 `}>
        {funcOrVar(col.surroundings?.form?.left)}
        {/* main */}
        <div>{col.form?.editFormat?.({...controlContextValue}) ?? <Control {...{controlContextValue}} />}</div>
        {/* right */}

        {funcOrVar(col.surroundings?.form?.right)}
      </R_Stack>
    </div>
  )
}
