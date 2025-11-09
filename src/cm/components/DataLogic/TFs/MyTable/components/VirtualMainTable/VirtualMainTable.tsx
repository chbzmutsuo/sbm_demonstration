import React, {CSSProperties, useCallback, useMemo} from 'react'
import {useSortable, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {DndContext, closestCenter} from '@dnd-kit/core'

import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {cn} from '@shadcn/lib/utils'
import {MyTableType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import {createRowColor, createTrClassName} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/Tbody-methods'

import {CSS} from '@dnd-kit/utilities'
import {getValue} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/lib/getValue'
import {getR_StackClass} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/DisplayedState'
import TdContent from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/TdContent'
import {getColorStyles} from '@cm/lib/methods/colors'
import {ArrowUpDownIcon} from 'lucide-react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'
import {TableWrapper} from '@cm/components/styles/common-components/Table'

interface MainTableProps {
  myTable: MyTableType
  columns: colType[][]
  elementRef: any
  tableStyleRef: any
  tableStyle: React.CSSProperties
  sensors: any
  handleDragEndMemo: any
  items: any
  showHeader: boolean | undefined
  TableConfigProps: TableConfigPropsType
  useGlobalProps: any
  ClientProps2: ClientPropsType2
  rows: colType[][]
  getPaginationProps: any
  RowActionButtonComponent: any
}

// ドラッグ可能な行コンポーネント
const DraggableTableRow = React.memo(
  ({
    record,
    recIdx,
    rows,
    myTable,
    ClientProps2,
    getPaginationProps,
    RowActionButtonComponent,
    useGlobalProps,
  }: {
    record: any
    recIdx: number
    rows: colType[][]
    myTable: MyTableType
    ClientProps2: ClientPropsType2
    getPaginationProps: any
    RowActionButtonComponent: any
    useGlobalProps: any
  }) => {
    const {dataModelName, mutateRecords, formData} = ClientProps2
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

          const rowActionButtonProps = useMemo(
            () => ({
              record,
              myTable,
              rowColor,
              SP,
            }),
            [record, myTable, rowColor, SP]
          )

          return (
            <tr
              key={`${recordId}-${rowIdx}`}
              className={trClassName}
              {...(rowIdx === 0 ? dndProps : undefined)} // DnDは最初の行のみに適用
              style={rowIdx === 0 ? dndStyle : {background: rowColor}}
            >
              {/* 操作セル（最初の行のみ） */}
              {rowIdx === 0 && (
                <td
                  className="px-0.5 align-top text-center"
                  style={{
                    background: isDragging ? dndStyle.background : getColorStyles(rowColor).backgroundColor,
                    color: isDragging ? '#1f2937' : undefined,
                    fontWeight: isDragging ? '500' : undefined,
                    boxShadow: isDragging ? dndStyle.boxShadow : undefined,
                    zIndex: isDragging ? dndStyle.zIndex : undefined,
                  }}
                  rowSpan={rows.length}
                >
                  <R_Stack className={`mx-auto px-1 flex-nowrap justify-around gap-0`}>
                    {myTable?.showRecordIndex !== false && <span className="text-gray-400">{recordIndex}.</span>}
                    <div className={cn(`p-0.5 items-center gap-0.5 gap-x-2 flex-nowrap`, !SP ? `row-stack` : `col-stack gap-2`)}>
                      {dndProps && <ArrowUpDownIcon className={`w-4 onHover ${isDragging ? 'text-blue-600' : ''}`} />}
                      <RowActionButtonComponent {...rowActionButtonProps} />
                    </div>
                  </R_Stack>
                </td>
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
                    <div className={`flex ${getR_StackClass(col)}`}>
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
                    </div>
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

export const VirtualMainTable = React.memo<MainTableProps>(props => {
  const {
    myTable,
    columns,
    elementRef,
    tableStyleRef,
    tableStyle,
    sensors,
    handleDragEndMemo,
    items,
    showHeader,
    TableConfigProps,
    useGlobalProps,
    ClientProps2,
    rows,
    getPaginationProps,
    RowActionButtonComponent,
  } = props

  const TableWrapperCard = useCallback(
    ({children}: {children: React.ReactNode}) => {
      if (myTable?.useWrapperCard === false) {
        return <div>{children}</div>
      } else {
        return <div className={`t-paper ${myTable?.showHeader ? 'p-0!' : 'p-2!'} relative`}>{children}</div>
      }
    },
    [myTable?.useWrapperCard, myTable?.showHeader]
  )

  const tableStyleMemo = {borderCollapse: 'separate' as const, borderSpacing: showHeader ? '0px' : '0px 6px'}

  const combinedTableStyle = useMemo(
    () => ({
      ...tableStyle,
      ...tableStyleMemo,
    }),
    [tableStyle, tableStyleMemo]
  )

  return (
    <>
      {typeof myTable?.header === 'function' && myTable?.header()}
      <section className="bg-error-man bg-inherit">
        <TableWrapperCard>
          <TableWrapper ref={elementRef} style={tableStyle}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMemo}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div>
                  <table style={combinedTableStyle} ref={tableStyleRef} className={myTable?.className}>
                    {/* ヘッダーは元のコンポーネントを使用 */}
                    {myTable?.showHeader && (
                      <thead>
                        <tr>
                          <th className="text-center bg-gray-100 font-bold border border-gray-300 px-2 py-1"></th>
                          {columns[0]
                            ?.filter(col => col?.td?.hidden !== true)
                            .map((col, idx) => (
                              <th
                                key={col.id || idx}
                                className="text-center bg-gray-100 font-bold border border-gray-300 px-2 py-1"
                                style={col.th?.style}
                              >
                                {col.label}
                              </th>
                            ))}
                        </tr>
                      </thead>
                    )}

                    <tbody>
                      {ClientProps2.records?.map((record, recIdx: number) => (
                        <DraggableTableRow
                          key={record.id}
                          record={record}
                          recIdx={recIdx}
                          rows={rows}
                          myTable={myTable}
                          ClientProps2={ClientProps2}
                          getPaginationProps={getPaginationProps}
                          RowActionButtonComponent={RowActionButtonComponent}
                          useGlobalProps={useGlobalProps}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
            </DndContext>
          </TableWrapper>
        </TableWrapperCard>
      </section>
    </>
  )
})

VirtualMainTable.displayName = 'VirtualMainTable'
