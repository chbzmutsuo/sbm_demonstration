import Sorter, {SortIcon} from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/ColOption/Sorter'
import {Search} from 'lucide-react'
import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import MyPopover from 'src/cm/components/utils/popover/MyPopover'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

import React from 'react'
import Searcher from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/TdContent/ColOption/Searcher'

export default function ColOption({col, dataModelName, children}) {
  const useGlobalProps = useGlobal()
  const {query, addQuery, toggleLoad} = useGlobalProps

  const {orderBy, orderDirection} = query
  const isSet = orderBy === col.id

  const popOverContentClass = `rounded-lg bg-white p-2 px-4 leading-5 opacity-100 shadow-lg`

  return (
    <div className={` just  flex  flex-nowrap items-center   gap-0.5   gap-x-1  text-[12px]`}>
      <R_Stack className={`gap-0`}>
        {col.search && (
          <>
            <MyPopover {...{mode: `click`, button: <Search className={`onHover h-3 text-gray-500`} />}}>
              <div className={popOverContentClass}>
                <Searcher {...{dataModelName, col, useGlobalProps}} />
              </div>
            </MyPopover>
          </>
        )}

        {col.sort && (
          <>
            <MyPopover
              {...{
                mode: `click`,
                button: <SortIcon isSet={isSet} direction={orderDirection} />,
              }}
            >
              <div className={popOverContentClass}>
                <Sorter {...{col, addQuery, query}} />
              </div>
            </MyPopover>
          </>
        )}
      </R_Stack>
      <small className={` text-gray-500 `}>{children}</small>
    </div>
  )
}
