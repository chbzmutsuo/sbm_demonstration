// import React, {useMemo} from 'react'

// import {CSS} from '@dnd-kit/utilities'
// import {useSortable} from '@dnd-kit/sortable'
// import {tbodyParamsType} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/Tbody'
// import {createRowColor, createTrClassName} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/Tbody-methods'
// import {cl} from 'src/cm/lib/methods/common'
// import {BodyLeftTh} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/BodyLeftTh'

// import {MyTableType} from '@cm/types/types'
// import TableCell from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/TableCell'
// import {twMerge} from 'tailwind-merge'

// export type DnDTableRowPropsType = {
//   record: any
//   ColumnsOnTheRow: any
//   rowIdx: any
//   recIdx: any
//   showHeader?: boolean
// }

// const DnDTableRow = React.memo(
//   (props: {
//     from: number
//     myTable: MyTableType
//     useGlobalProps: any
//     formData: any
//     dataModelName: string
//     mutateRecords: any
//     rows: any
//     tbodyRowParams: tbodyParamsType
//     DnDTableRowProps: DnDTableRowPropsType
//     totalCount: number
//   }) => {
//     const {from, myTable, formData, DnDTableRowProps, tbodyRowParams, dataModelName, mutateRecords, rows, totalCount} = props

//     const {SP} = props.useGlobalProps

//     const {RowActionButtonComponent, getPaginationProps} = tbodyRowParams
//     const {ColumnsOnTheRow, rowIdx, recIdx, record, showHeader} = DnDTableRowProps

//     const rowColor = useMemo(() => {
//       return createRowColor({myTable, recIdx, record, rows})
//     }, [myTable, recIdx, record, rows])

//     const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
//       id: myTable?.['drag'] === false ? '' : record.id,
//     })

//     const dndStyle = useMemo(
//       () => ({
//         transform: CSS.Transform.toString(transform),
//         transition,
//         background: isDragging ? '#c2c2c2' : rowColor,
//       }),
//       [transform, transition, isDragging, rowColor]
//     )

//     const allowDnd = myTable?.['drag']
//     const dndProps = useMemo(
//       () => (allowDnd ? {ref: setNodeRef, ...attributes, ...listeners, style: dndStyle} : undefined),
//       [allowDnd, setNodeRef, attributes, listeners, dndStyle]
//     )

//     const recordIndex = useMemo(() => record?.recordIndex || from + recIdx, [record?.recordIndex, from, recIdx])
//     const recordId = record.id

//     const tableCellCallBackProps = useMemo(
//       () => ({
//         dataModelName,
//         mutateRecords,
//         tbodyRowParams,
//         DnDTableRowProps,
//         dndStyle,
//         rowColor,
//       }),
//       [dataModelName, mutateRecords, tbodyRowParams, DnDTableRowProps, dndStyle, rowColor]
//     )

//     const trClassName = useMemo(() => cl(createTrClassName({myTable, record, formData})), [myTable, record, formData])

//     const bodyLeftThProps = useMemo(() => {
//       return {
//         myTable,
//         showHeader,
//         rowColor,
//         rowIdx,
//         rowSpan: rowIdx === 0 ? rows.length : undefined,
//         colSpan: 1,
//         dndProps,
//         recordIndex,
//       }
//     }, [myTable, showHeader, rowColor, rowIdx, rows.length, dndProps, recordIndex])

//     const rowActionButtonProps = useMemo(
//       () => ({
//         record,
//         myTable,
//         rowColor,
//         SP,
//       }),
//       [record, myTable, rowColor, SP]
//     )

//     const visibleColumns = useMemo(() => ColumnsOnTheRow?.filter(col => col?.td?.hidden !== true) || [], [ColumnsOnTheRow])

//     return (
//       <tr id={`tr-${recordId}`} className={twMerge(trClassName)}>
//         {rowIdx === 0 && (
//           <BodyLeftTh {...bodyLeftThProps}>
//             <RowActionButtonComponent {...rowActionButtonProps} />
//           </BodyLeftTh>
//         )}

//         {visibleColumns.map((col, columnIdx) => {
//           return (
//             <TableCell
//               key={`${col.id}-${columnIdx}`}
//               {...tableCellCallBackProps}
//               {...{
//                 TableCellProps: {columnIdx, col},
//                 showHeader: myTable?.showHeader,
//               }}
//             />
//           )
//         })}
//       </tr>
//     )
//   },
//   (prevProps, nextProps) => {
//     const prevDnD = prevProps.DnDTableRowProps
//     const nextDnD = nextProps.DnDTableRowProps

//     return (
//       prevDnD.record.id === nextDnD.record.id &&
//       prevDnD.recIdx === nextDnD.recIdx &&
//       prevDnD.rowIdx === nextDnD.rowIdx &&
//       prevDnD.ColumnsOnTheRow === nextDnD.ColumnsOnTheRow &&
//       prevProps.myTable === nextProps.myTable &&
//       prevProps.formData === nextProps.formData &&
//       prevProps.dataModelName === nextProps.dataModelName &&
//       prevProps.from === nextProps.from &&
//       prevDnD.showHeader === nextDnD.showHeader
//     )
//   }
// )

// export default DnDTableRow
