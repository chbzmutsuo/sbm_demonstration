import {colType} from '@cm/types/col-types'
import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import React, {useMemo} from 'react'
import SortHandler from '@cm/components/DataLogic/TFs/MyTable/components/SortHandler/SortHandler'

// 型定義を追加
interface SortBtnProps {
  TableConfigProps: TableConfigPropsType
}

const SortBtn = React.memo<SortBtnProps>(props => {
  const {columns, myTable, columnCount, useGlobalProps, dataModelName} = props.TableConfigProps

  const sortableCols = useMemo(() => columns.flat().filter((col: colType) => col.sort), [columns])

  const shouldShowSort = useMemo(
    () => myTable?.['sort'] !== false && sortableCols.length > 0,
    [myTable?.['sort'], sortableCols.length]
  )

  const sortHandlerProps = useMemo(
    () => ({
      sortableCols,
      columns,
      className: '',
      columnCount,
      useGlobalProps,
      dataModelName,
    }),
    [sortableCols, columns, columnCount, useGlobalProps, dataModelName]
  )

  if (!shouldShowSort) {
    return null
  }

  return <SortHandler {...sortHandlerProps} />
})

SortBtn.displayName = 'SortBtn'

export default SortBtn
