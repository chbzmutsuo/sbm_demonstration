// import React, {useCallback, useMemo} from 'react'
// import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
// import {DndContext, closestCenter} from '@dnd-kit/core'
// import {TableWrapper} from '@cm/components/styles/common-components/Table'
// import Tbody from './Tbody/Tbody'
// import Thead from './Thead/Thead'
// import {MyTableType} from '@cm/types/types'
// import {colType} from '@cm/types/col-types'
// import {TableConfigPropsType} from './TableConfig'
// import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// interface MainTableProps {
//   myTable: MyTableType
//   columns: colType[][]
//   elementRef: any
//   tableStyleRef: any
//   tableStyle: React.CSSProperties
//   sensors: any
//   handleDragEndMemo: any
//   items: any
//   showHeader: boolean | undefined
//   TableConfigProps: TableConfigPropsType
//   useGlobalProps: any
//   ClientProps2: ClientPropsType2
//   rows: colType[][]
//   getPaginationProps: any
//   RowActionButtonComponent: any
// }

// export const OldMainTable = React.memo<MainTableProps>(props => {
//   const {
//     myTable,
//     columns,
//     elementRef,
//     tableStyleRef,
//     tableStyle,
//     sensors,
//     handleDragEndMemo,
//     items,
//     showHeader,
//     TableConfigProps,
//     useGlobalProps,
//     ClientProps2,
//     rows,
//     getPaginationProps,
//     RowActionButtonComponent,
//   } = props

//   const TableWrapperCard = useCallback(
//     ({children}: {children: React.ReactNode}) => {
//       if (myTable?.useWrapperCard === false) {
//         return <div>{children}</div>
//       } else {
//         return <div className={`t-paper ${myTable?.showHeader ? 'p-0!' : 'p-2!'} relative`}>{children}</div>
//       }
//     },
//     [myTable?.useWrapperCard, myTable?.showHeader]
//   )

//   const tableStyleMemo = {borderCollapse: 'separate' as const, borderSpacing: showHeader ? '0px' : '0px 6px'}

//   const combinedTableStyle = useMemo(
//     () => ({
//       ...tableStyle,
//       ...tableStyleMemo,
//     }),
//     [tableStyle, tableStyleMemo]
//   )

//   const TheadProps = useMemo(() => ({myTable, columns, useGlobalProps}), [myTable, columns, useGlobalProps])
//   const tbodyRowParams = useMemo(
//     () => ({getPaginationProps, RowActionButtonComponent}),
//     [getPaginationProps, RowActionButtonComponent]
//   )

//   return (
//     <>
//       {typeof myTable?.header === 'function' && myTable?.header()}
//       <section className=" bg-inherit">
//         <TableWrapperCard>
//           <TableWrapper ref={elementRef} style={tableStyle}>
//             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMemo}>
//               <SortableContext items={items} strategy={verticalListSortingStrategy}>
//                 <div>
//                   <table {...{style: combinedTableStyle, ref: tableStyleRef, className: myTable?.className}}>
//                     {myTable?.showHeader && <Thead {...{TableConfigProps, TheadProps, ClientProps2}} />}

//                     <Tbody {...{ClientProps2, rows, tbodyRowParams}} />
//                   </table>
//                 </div>
//               </SortableContext>
//             </DndContext>
//           </TableWrapper>
//         </TableWrapperCard>
//       </section>
//     </>
//   )
// })

// MainTable.displayName = 'MainTable'
