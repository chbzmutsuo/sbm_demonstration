// import {DnDTableRowPropsType} from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Tbody/DndTableRow'
// import {tbodyParamsType} from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Tbody/Tbody'

// import React, {useMemo} from 'react'
// import {colType} from '@cm/types/col-types'

// import {getValue} from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Tbody/TableCell/lib/getValue'

// import TdContent from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Tbody/TableCell/childrens/TdContent'
// import {getR_StackClass} from '@cm/components/DataLogic/TFs/MyTable/oldbackups/Tbody/TableCell/childrens/DisplayedState'

// export type TableCellPropsType = {
//   columnIdx: number
//   col: colType
// }

// const TableCell = React.memo(
//   (props: {
//     dndStyle: any
//     rowColor: any
//     tbodyRowParams: tbodyParamsType
//     DnDTableRowProps: DnDTableRowPropsType
//     TableCellProps: TableCellPropsType
//     dataModelName
//     mutateRecords
//     showHeader?: boolean
//   }) => {
//     const {
//       dndStyle,
//       rowColor,
//       dataModelName,
//       mutateRecords,
//       DnDTableRowProps: {record},
//       TableCellProps: {columnIdx, col},
//       showHeader,
//     } = props

//     const tdStyle = {wordBreak: 'break-word', ...dndStyle, ...col?.td?.style, background: rowColor, ...dndStyle}
//     const value = getValue({col, record, dataModelName, mutateRecords, tdStyle})

//     const tdProps = useMemo(() => {
//       return {
//         id: `${col.id}-${record.id}`,
//         colSpan: col.td?.colSpan,
//         rowSpan: col.td?.rowSpan,
//         className: `align-top tableCell     `,
//         style: {...tdStyle},
//       }
//     }, [col, record, tdStyle])

//     const TdContentMemo = useMemo(() => {
//       return <TdContent {...{showHeader, dataModelName, col, record, value, tdStyle, mutateRecords}} />
//     }, [showHeader, dataModelName, col, record, value, tdStyle, mutateRecords])

//     const rStackClass = getR_StackClass(col)

//     return (
//       <td key={`${col?.id}_dbId${record?.id}_index${columnIdx}`} {...tdProps}>
//         <div className={`flex    ${rStackClass}`}>{TdContentMemo}</div>
//       </td>
//     )
//   }
// )

// export default TableCell
