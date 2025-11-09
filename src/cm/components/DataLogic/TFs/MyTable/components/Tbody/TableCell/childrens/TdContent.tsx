import ColOption from '@cm/components/DataLogic/TFs/MyTable/components/Thead/ColOption/ColOption'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {cl} from 'src/cm/lib/methods/common'
import React from 'react'
import dynamic from 'next/dynamic'
const EditableForm = dynamic(() => import(`@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/RawForm`))

import {Fields} from '@cm/class/Fields/Fields'
import {DH__switchColType} from '@cm/class/DataHandler/type-converter'
import {colType} from '@cm/types/col-types'
import {DisplayedState} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/DisplayedState'

const TdContent = React.memo((props: {dataModelName: string; col: colType; record: any; value: any; mutateRecords: any}) => {
  const {dataModelName, col, record, value, mutateRecords} = props

  const isEditableCell = col?.td?.editable && ![`file`].includes(DH__switchColType({type: col.type}))

  const showLabel = col?.isMain === undefined && Fields.doShowLabel(col)

  const Label = () => {
    return (
      <span className={`leading-[8px]`} style={{...col?.td?.style}}>
        <ColOption {...{col, dataModelName}}>{col.label}</ColOption>
      </span>
    )
  }

  const Main = (
    <div>
      {isEditableCell ? (
        <EditableForm {...{col, record, dataModelName, mutateRecords}} />
      ) : (
        <DisplayedState {...{col, record, value}} />
      )}
    </div>
  )
  const editableCellClass = isEditableCell ? ` w-fit cursor-pointer! rounded-xs  bg-gray-50 ring-gray-400` : ''
  const cStackClass = cl(` gap-y-0  bg-transparent  `, editableCellClass)

  return (
    <C_Stack>
      {showLabel && <Label />}
      <R_Stack id="tdContentRStack">{Main}</R_Stack>
    </C_Stack>
  )
})

export default TdContent
