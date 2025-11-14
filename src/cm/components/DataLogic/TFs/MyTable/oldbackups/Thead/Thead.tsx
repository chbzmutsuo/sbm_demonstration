import {Kado, ThDisplayJSX} from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Thead/thead-methods'
import {funcOrVar} from 'src/cm/lib/methods/common'
import React, {CSSProperties, useMemo} from 'react'
import {MyTableType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobalOrigin'
import {COLORS} from '@cm/lib/constants/constants'
import useWindowSize from '@cm/hooks/useWindowSize'

// 型定義を改善
interface TheadPropsType {
  myTable: MyTableType
  columns: colType[][]
  useGlobalProps: useGlobalPropType
}

interface TheadProps {
  ClientProps2: any
  TableConfigProps: TableConfigPropsType
  TheadProps: TheadPropsType
}

// thStyleを定数として分離
const TH_STYLE: CSSProperties = {
  background: COLORS.table.thead,
  height: 'fit-content',
  verticalAlign: 'top',
}

// テーブルカラムのフィルタリング処理を分離
const filterVisibleColumns = (columns: colType[][]): colType[][] => {
  return columns?.filter(cols => {
    return cols.reduce((prev, col) => prev || !col?.td?.hidden, false)
  })
}

// ヘッダーカラムのフィルタリング処理を分離
const filterHeaderColumns = (tableColumns: colType[][]): colType[] => {
  return tableColumns.flat().filter(col => !col?.td?.withLabel)
}

const Thead = React.memo<TheadProps>(props => {
  const {TableConfigProps, TheadProps, ClientProps2} = props
  const {myTable, columns, useGlobalProps} = TheadProps
  const {width} = useWindowSize()

  const tableColumns = useMemo(() => filterVisibleColumns(columns), [columns])

  const headerCols = useMemo(() => filterHeaderColumns(tableColumns), [tableColumns])

  const RowSpanForSingleData = columns?.length

  // 早期リターン
  if (headerCols.length === 0) {
    return null
  }

  return (
    <thead>
      {tableColumns.map((cols, rowIdx) => (
        <tr key={rowIdx}>
          {rowIdx === 0 && (
            <Kado style={TH_STYLE} rowSpan={RowSpanForSingleData} colSpan={1}>
              <></>
            </Kado>
          )}

          {cols
            ?.filter(col => !col?.td?.hidden)
            .map((col, columnIdx: number) => {
              const rowSpan = col?.td?.rowSpan
              const colSpan = col?.td?.colSpan

              const thStyle = useMemo(
                () => ({
                  ...TH_STYLE,
                  ...funcOrVar(col?.th?.style),
                }),
                [col?.th?.style]
              )

              return (
                <th key={`${col?.id}_${columnIdx}`} rowSpan={rowSpan} colSpan={colSpan} style={thStyle}>
                  <ThDisplayJSX width={width} col={col} />
                </th>
              )
            })}
        </tr>
      ))}
    </thead>
  )
})

Thead.displayName = 'Thead'

export default Thead
