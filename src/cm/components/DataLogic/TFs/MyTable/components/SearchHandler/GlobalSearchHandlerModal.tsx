// import {Fields} from 'src/cm/class/Fields/Fields'
// import {SearchQuery, searchQueryKey, Sub} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'
// import {confirmSearch} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/SearchHandler'
// import {Button} from 'src/cm/components/styles/common-components/Button'
// import BasicModal from 'src/cm/components/utils/modal/BasicModal'
// import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
// import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

// import React, {useMemo} from 'react'
// import {atomTypes, useJotaiByKey} from '@cm/hooks/useJotai'
// import useWindowSize from '@cm/hooks/useWindowSize'
// import {colType} from '@cm/types/col-types'

// import {cn} from '@cm/shadcn/lib/utils'
// import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

// export type GlobalSearchHandlerModalAtom = {
//   dataModelName: string
//   columns: colType[][]
//   latestFormData: any
//   MainColObject: any
//   SearchColObject: any
// } | null
// export default function GlobalSearchHandlerModal() {
//   const [GlobalSearchHandlerModal, setGlobalSearchHandlerModal] = useJotaiByKey<GlobalSearchHandlerModalAtom>(
//     `GlobalSearchHandlerModal`,
//     null
//   )
//   const {columns, dataModelName, MainColObject, SearchColObject} = GlobalSearchHandlerModal ?? {}
//   const {query, addQuery, toggleLoad} = useGlobal()
//   const {SP} = useWindowSize()

//   const currentSearchedQuerys = SearchQuery.getSearchDefaultObject({dataModelName, query})

//   const {BasicForm, latestFormData, ReactHookForm, Cached_Option_Props} = useBasicFormProps({
//     columns: columns ?? [],
//     formData: currentSearchedQuerys,
//     autoApplyProps: {form: {}},
//   })

//   //confirm
//   const ResetBtnMemo = useMemo(() => {
//     return (
//       <IconBtn
//         {...{
//           rounded: false,
//           color: `red`,
//           onClick: () => {
//             addQuery({[searchQueryKey]: ``})
//             setGlobalSearchHandlerModal(null)
//           },
//         }}
//       >
//         解除
//       </IconBtn>
//     )
//   }, [query, latestFormData])

//   if (GlobalSearchHandlerModal) {
//     return (
//       <BasicModal
//         {...{
//           alertOnClose: false,
//           open: !!GlobalSearchHandlerModal,
//           setopen: setGlobalSearchHandlerModal,
//         }}
//       >
//         <div>
//           <BasicForm
//             {...{
//               latestFormData,
//               alignMode: `console`,
//               className: `max-h-[60vh]  overflow-auto relative p-2`,
//               onSubmit: data => {
//                 confirmSearch({
//                   toggleLoad,
//                   allData: data,
//                   MainColObject,
//                   SearchColObject,
//                   dataModelName,
//                   addQuery,
//                   searchQueryKey,
//                   SearchQuery,
//                 })
//                 setGlobalSearchHandlerModal(null)
//               },
//               wrapperClass: 'col-stack gap-3',
//               ControlOptions: {
//                 controlWrapperClassBuilder: ({col}) => {
//                   const searchTypeCol = SearchColObject[col.id]
//                   let className = ``
//                   if (SP && searchTypeCol) {
//                     className = cn(className, `mb-8`)
//                   }
//                   return className
//                 },
//               },
//             }}
//           >
//             <div className={`row-stack sticky bottom-0 z-50  my-0! w-full justify-end  gap-4    p-3  `}>
//               {ResetBtnMemo}
//               <Button color={`primary`}>確定</Button>
//             </div>
//           </BasicForm>
//         </div>
//       </BasicModal>
//     )
//   }
// }
