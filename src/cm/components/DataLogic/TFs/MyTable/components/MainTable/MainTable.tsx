import React from 'react'
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {DndContext, closestCenter} from '@dnd-kit/core'

import {TableWrapper} from '@cm/components/styles/common-components/Table'
import {useMyTableLogic} from '../../hooks/useMyTableLogic'
import {TableSkelton} from '@cm/components/utils/loader/TableSkelton'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {MyTableProps} from '@cm/components/DataLogic/TFs/MyTable/MyTable'
import {cn} from '@cm/shadcn/lib/utils'

export const MainTable = React.memo<MyTableProps>(props => {
  // 🔧 ロジックを分離したカスタムフックを使用
  const useMyTableLogicReturn = useMyTableLogic(props)
  const {
    tableData,

    mainTableProps: {
      myTable,
      columns,
      elementRef,
      tableStyleRef,
      tableStyle,
      sensors,
      handleDragEndMemo,
      items,
      showHeader,
      ClientProps2,
      rows,
    },

    Components,
  } = useMyTableLogicReturn

  const {records, emptyDataStyle} = tableData

  if (records === null) {
    return (
      <div className="max-w-[90%] w-[300px] h-fit overflow-hidden">
        <TableSkelton />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div style={emptyDataStyle}>
        <PlaceHolder>データが見つかりません</PlaceHolder>
      </div>
    )
  }

  const TableWrapperCard = ({children}: {children: React.ReactNode}) => {
    if (myTable?.useWrapperCard === false) {
      return <div>{children}</div>
    } else {
      return (
        <div
          className={cn(
            //
            ` relative h-fit`,
            myTable?.showHeader ? 'p-0!' : 'p-2!'
          )}
        >
          {children}
        </div>
      )
    }
  }

  const combinedTableStyle = {
    ...tableStyle,
    ...{borderCollapse: 'separate' as const, borderSpacing: showHeader ? '0px' : '0px 6px'},
  }

  return (
    <>
      {typeof myTable?.header === 'function' && myTable?.header()}
      <section className=" bg-inherit">
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
                          <th className="text-center bg-gray-100 font-bold border border-gray-300 "></th>

                          {columns[0]
                            ?.filter(col => col?.td?.hidden !== true)
                            .map((col, idx) => (
                              <th
                                key={col.id || idx}
                                className="text-center bg-gray-100 font-bold border border-gray-300 "
                                style={col.th?.style}
                              >
                                {col.label}
                              </th>
                            ))}

                          {myTable?.delete !== false && (
                            <th className="text-center bg-gray-100 font-bold border border-gray-300 "></th>
                          )}
                        </tr>
                      </thead>
                    )}

                    <tbody>
                      {ClientProps2.records?.map((record, recIdx: number) => (
                        <Components.DraggableTableRowCallBack key={record.id} {...{record, recIdx, rows, Components}} />
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

MainTable.displayName = 'MainTable'
