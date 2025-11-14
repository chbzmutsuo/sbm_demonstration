import React from 'react'

import {ControlProps} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control'
import BaseDisplay from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/BaseDisplay'
import OptionSelector from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/OptionSelector/OptionSelector'

import useInitMySelect from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/useInitMySelect'
import MyRadio from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/MyRadio'

import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

const MySelect = React.memo((props: ControlProps) => {
  const {contexts} = useInitMySelect(props)
  const {currentValueToReadableStr} = contexts.MySelectContextValue

  const col = contexts.controlContextValue.col
  const {isOptionsVisible, setIsOptionsVisible} = contexts.MySelectContextValue

  if (currentValueToReadableStr === undefined) {
    return <PlaceHolder />
  }
  if (col.forSelect?.radio) {
    return <MyRadio {...props}></MyRadio>
  } else {
    const diasbled = col?.form?.disabled
    return (
      <div className={`relative`}>
        <ShadModal
          {...{
            diasbled,
            mode: 'click',
            Trigger: <BaseDisplay {...{contexts}} />,
            open: isOptionsVisible,
            onOpenChange: setIsOptionsVisible,
          }}
        >
          <OptionSelector {...{contexts}} />
        </ShadModal>
      </div>
    )
  }
})

export default MySelect
