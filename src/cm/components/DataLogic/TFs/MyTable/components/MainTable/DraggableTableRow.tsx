import React, {CSSProperties, useMemo} from 'react'
import {useSortable} from '@dnd-kit/sortable'

import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {cn} from '@shadcn/lib/utils'
import {MyTableType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {createRowColor, createTrClassName} from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Tbody/Tbody-methods'

import {CSS} from '@dnd-kit/utilities'

import {getColorStyles} from '@cm/lib/methods/colors'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {getValue} from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/lib/getValue'
import TdContent from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/TdContent'

// ドラッグ可能な行コンポーネント
export const DraggableTableRow = React.memo(
  ({
    record,
    recIdx,
    rows,
    myTable,
    ClientProps2,
    getPaginationProps,
    Components,
  }: {
    record: any
    recIdx: number
    rows: colType[][]
    myTable: MyTableType
    ClientProps2: ClientPropsType2
    getPaginationProps: any

    useGlobalProps: any
    Components: {EditButton; DeleteButton; DragButton; RowActionButtonList}
  }) => {
    const {dataModelName, mutateRecords, formData, editType} = ClientProps2
    const {SP} = useWindowSize()
    const {from} = getPaginationProps({totalCount: ClientProps2.totalCount})

    const rowColor = useMemo(() => {
      return createRowColor({myTable, recIdx, record, rows})
    }, [myTable, recIdx, record, rows])

    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
      id: myTable?.['drag'] === false ? '' : record.id,
    })

    const dndStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
      background: isDragging ? 'rgba(59, 130, 246, 0.1)' : rowColor, // 薄い青色に変更
      boxShadow: isDragging ? '0 8px 25px -8px rgba(0, 0, 0, 0.3)' : undefined, // ドラッグ中に影を追加
      zIndex: isDragging ? 999 : 'auto', // ドラッグ中は最前面に
      opacity: isDragging ? 0.95 : 1, // 少し透明にして動いている感を演出
    }

    const allowDnd = myTable?.['drag']
    const dndProps = allowDnd ? {ref: setNodeRef, ...attributes, ...listeners, style: dndStyle} : undefined

    const recordIndex = record?.recordIndex || from + recIdx
    const recordId = record.id

    const trClassName = cn(createTrClassName({myTable, record, formData}))

    return (
      <>
        {rows?.map((ColumnsOnTheRow, rowIdx) => {
          const visibleColumns = useMemo(() => ColumnsOnTheRow?.filter(col => col?.td?.hidden !== true) || [], [ColumnsOnTheRow])

          return (
            <tr
              key={`${recordId}-${rowIdx}`}
              className={trClassName}
              {...(rowIdx === 0 ? dndProps : undefined)} // DnDは最初の行のみに適用
              style={rowIdx === 0 ? dndStyle : {background: rowColor}}
            >
              {/* 操作セル（最初の行のみ） */}
              {rowIdx === 0 && (
                <th
                  style={{
                    background: isDragging ? dndStyle.background : getColorStyles(rowColor).backgroundColor,
                    color: isDragging ? '#1f2937' : undefined,
                    fontWeight: isDragging ? '500' : undefined,
                    boxShadow: isDragging ? dndStyle.boxShadow : undefined,
                    zIndex: isDragging ? dndStyle.zIndex : undefined,
                  }}
                  rowSpan={rows.length}
                >
                  <R_Stack className={`gap-0 flex-nowrap  justify-center mx-auto f-fit`}>
                    <span>{myTable?.showRecordIndex !== false && <span className="text-gray-400">{recordIndex}.</span>}</span>

                    <AutoGridContainer className={`mx-auto gap-1 `} maxCols={{sm: 1, md: 3}}>
                      {/* その他アクション */}
                      <Components.RowActionButtonList {...{record}} />

                      {/* DnD */}
                      <Components.DragButton {...{dndProps, isDragging}} />

                      {/* 編集ボタン */}
                      <Components.EditButton {...{record}} />

                      {/* 削除ボタン */}
                      <Components.DeleteButton {...{record}} />
                    </AutoGridContainer>
                  </R_Stack>
                </th>
              )}

              {/* データセル */}
              {visibleColumns.map((col, columnIdx) => {
                const tdStyle: CSSProperties = {
                  wordBreak: 'break-word',
                  ...col?.td?.style,
                  ...(rowIdx === 0
                    ? {
                        color: isDragging ? '#1f2937' : undefined, // ダークグレーのテキスト色
                        fontWeight: isDragging ? '500' : undefined, // 少し太字に
                      }
                    : {background: rowColor}),
                }
                const value = getValue({col, record, dataModelName, mutateRecords, tdStyle})

                return (
                  <td
                    key={`${col.id}-${record.id}`}
                    id={`${col.id}-${record.id}`}
                    colSpan={col.td?.colSpan}
                    rowSpan={col.td?.rowSpan}
                    className={`align-top tableCell`}
                    style={tdStyle}
                  >
                    {/* <div className={`flex  ${_getR_StackClass(col)}`}> */}
                    <TdContent
                      {...{
                        showHeader: ClientProps2.myTable?.showHeader,
                        dataModelName,
                        col,
                        record,
                        value,
                        tdStyle,
                        mutateRecords,
                      }}
                    />
                    {/* </div> */}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </>
    )
  }
)

DraggableTableRow.displayName = 'DraggableTableRow'
