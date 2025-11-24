import { TableConfigPropsType } from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'

import React from 'react'

import { useJotaiByKey } from '@cm/hooks/useJotai'
import { Button } from '@cm/components/styles/common-components/Button'
import { colType } from '@cm/types/col-types'

export default function SearchBtn(props: { TableConfigProps: TableConfigPropsType }) {
  const { columns, myTable, columnCount, useGlobalProps, dataModelName } = props.TableConfigProps

  const [modalOpen, setmodalOpen] = useJotaiByKey<boolean>(`searchHandlerModalOpen`, false)

  const searchCols = columns.flat().filter((col: colType) => col.search)

  if (searchCols.length > 0) {

    return (
      <>
        {myTable?.['search'] !== false && (
          <Button
            {...{
              size: `sm`,
              type: `button`,
              onClick: e => setmodalOpen(true),
            }}
          >
            検索
          </Button>
        )}
      </>
    )
  }

}
