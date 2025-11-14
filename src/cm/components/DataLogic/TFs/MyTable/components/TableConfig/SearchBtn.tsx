import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'

import React from 'react'
import {useSearchHandler} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/useSearchHandler'

export default function SearchBtn(props: {TableConfigProps: TableConfigPropsType}) {
  const {columns, myTable, columnCount, useGlobalProps, dataModelName} = props.TableConfigProps

  const {SearchCols, SearchHandlerMemo} = useSearchHandler({
    columns,
    dataModelName,
    useGlobalProps,
  })
  return <>{myTable?.['search'] !== false && SearchHandlerMemo}</>
}
