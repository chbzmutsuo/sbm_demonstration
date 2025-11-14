import BasicModal from 'src/cm/components/utils/modal/BasicModal'
import React from 'react'
import {colType} from '@cm/types/col-types'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'

import {myFormDefault} from 'src/cm/constants/defaults'

import {cl} from 'src/cm/lib/methods/common'

import {C_Stack} from 'src/cm/components/styles/common-components/common-components'
import Sorter from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/ColOption/Sorter'
import {atomTypes, useJotaiByKey} from '@cm/hooks/useJotai'
import {Button} from '@cm/components/styles/common-components/Button'

type SortHandler = {
  columns: colType[][]
  dataModelName: string
  useGlobalProps: useGlobalPropType
  sortableCols: colType[]
}
const SortHandler = React.memo((props: SortHandler) => {
  const {dataModelName, useGlobalProps, sortableCols} = props
  const {toggleLoad, query, addQuery} = useGlobalProps
  const [tableSortModalOpen, settableSortModalOpen] = useJotaiByKey<atomTypes[`tableSortModalOpen`]>(`tableSortModalOpen`, false)

  /**modal Memo */
  const ModalMemo = () => {
    return (
      <BasicModal alertOnClose={false} open={tableSortModalOpen} setopen={settableSortModalOpen}>
        <main className={`relative  `} style={{...myFormDefault?.style, maxWidth: 900, padding: 0, maxHeight: '70vh'}}>
          <C_Stack>
            {sortableCols.map((col, i) => {
              return (
                <div key={i} className={cl(` p-1 text-xl font-bold `)}>
                  <Sorter {...{col, query, addQuery, dataModelName}} />
                </div>
              )
            })}
          </C_Stack>
        </main>
      </BasicModal>
    )
  }

  return (
    <>
      <Button {...{size: `sm`, onClick: () => settableSortModalOpen(true)}}>並替</Button>
      <ModalMemo />
    </>
  )
})
export default SortHandler

export const confirmSeach = ({allData, MainColObject, SearchColObject, dataModelName, addQuery, searchQueryKey, SearchQuery}) => {
  const searchQueryResult = SearchQuery.createQueryStr({allData, MainColObject, SearchColObject})

  const newQuery = {
    [searchQueryKey]: `${dataModelName.toUpperCase()}${searchQueryResult}`,
  }

  addQuery(newQuery)
}
