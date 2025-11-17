// import React, {useCallback, useMemo} from 'react'
// import {Fragment} from 'react'

// import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// import {DnDTableRowPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/DndTableRow'

// import dynamic from 'next/dynamic'
// import {obj__filterObject} from '@cm/class/ObjHandler/transformers'
// import {PlainObject} from '@cm/class/ObjHandler/types'
// import useWindowSize from '@cm/hooks/useWindowSize'

// const DnDTableRow = dynamic(() => import(`@cm/components/DataLogic/TFs/MyTable/components/Tbody/DndTableRow`), {
//   ssr: false,
// })

// export type tbodyParamsType = {
//   getPaginationProps: any
//   RowActionButtonComponent: any
// }

// const Tbody = React.memo((props: {rows: any[][]; ClientProps2: ClientPropsType2; tbodyRowParams: tbodyParamsType}) => {
//   const {ClientProps2, tbodyRowParams, rows} = props
//   const {getPaginationProps} = tbodyRowParams
//   const {from} = getPaginationProps({totalCount: ClientProps2.totalCount})
//   const {SP} = useWindowSize()

//   const stableDnDTableRowCallbackProps = useMemo(
//     () => ({
//       ...(obj__filterObject(ClientProps2 as unknown as PlainObject, [
//         `myTable`,
//         `useGlobalProps`,
//         `formData`,
//         `dataModelName`,
//         `mutateRecords`,
//       ]) as any),
//       SP,
//       tbodyRowParams,
//     }),
//     [ClientProps2.myTable, SP, ClientProps2.formData, ClientProps2.dataModelName, ClientProps2.mutateRecords, tbodyRowParams]
//   )

//   const DnDTableRowCb = useCallback(
//     ({DnDTableRowProps}) => {
//       return (
//         <DnDTableRow
//           {...{
//             from,
//             totalCount: ClientProps2.totalCount,
//             ...stableDnDTableRowCallbackProps,
//             rows,
//             DnDTableRowProps,
//           }}
//         />
//       )
//     },
//     [from, ClientProps2.totalCount, stableDnDTableRowCallbackProps, rows]
//   )

//   const memoizedRecords = useMemo(() => ClientProps2.records, [ClientProps2.records])

//   return (
//     <tbody>
//       {memoizedRecords?.map((record, recIdx: number) => {
//         return (
//           <Fragment key={record.id}>
//             {rows?.map((ColumnsOnTheRow, rowIdx) => {
//               const DnDTableRowProps: DnDTableRowPropsType = {
//                 record,
//                 ColumnsOnTheRow,
//                 rowIdx,
//                 recIdx,
//                 showHeader: ClientProps2.myTable?.showHeader,
//               }

//               return <DnDTableRowCb key={`${record.id}-${rowIdx}`} {...{DnDTableRowProps}} />
//             })}
//           </Fragment>
//         )
//       })}
//     </tbody>
//   )
// })

// export default Tbody
