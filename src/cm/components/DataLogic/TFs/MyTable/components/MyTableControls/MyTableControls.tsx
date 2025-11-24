import React from 'react'
import {cl} from 'src/cm/lib/methods/common'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import TableConfig, {TableConfigPropsType} from '../TableConfig'
import MyPagination from '@cm/components/DataLogic/TFs/MyTable/components/Pagination/MyPagination'

import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {InfiniteScrollToggle} from '@cm/components/DataLogic/TFs/MyTable/components/MyTableControls/InfiniteScrollToggle'

interface MyTableControlsProps {
  SearchedItemListMemo: React.ReactNode
  TableConfigProps: TableConfigPropsType
  ClientProps2: ClientPropsType2
  isInfiniteScrollMode: boolean
  setInfiniteScrollMode?: (enabled: boolean) => void
  recordCount: number
  totalCount: number
  hasMore: boolean
  getPaginationProps: (args: {totalCount: number}) => any
  myTable: any
  paginationProps: any
  sectionStyle: React.CSSProperties
}

export const MyTableControls = React.memo<MyTableControlsProps>(
  ({
    SearchedItemListMemo,
    TableConfigProps,
    ClientProps2,
    isInfiniteScrollMode,
    setInfiniteScrollMode,
    recordCount,
    totalCount,
    hasMore,
    getPaginationProps,
    myTable,
    paginationProps,
    sectionStyle,
  }) => {
    return (
      <section style={sectionStyle}>
        <div className={cl('rounded-sm bg-white/70', 'mx-auto w-fit px-1.5 py-1')}>
          <C_Stack className="items-start">
            {SearchedItemListMemo && <div>{SearchedItemListMemo}</div>}
            <R_Stack className="w-fit justify-center gap-y-0">
              <TableConfig TableConfigProps={TableConfigProps} ClientProps2={ClientProps2} />

              {/* <RecordCountDisplay
                isInfiniteScrollMode={isInfiniteScrollMode}
                recordCount={recordCount}
                totalCount={totalCount}
                hasMore={hasMore}
                getPaginationProps={getPaginationProps}
              /> */}

              {setInfiniteScrollMode && (
                <InfiniteScrollToggle isInfiniteScrollMode={isInfiniteScrollMode} setInfiniteScrollMode={setInfiniteScrollMode} />
              )}

              {!isInfiniteScrollMode && myTable?.pagination && recordCount > 0 && <MyPagination {...paginationProps} />}
            </R_Stack>
          </C_Stack>
        </div>
      </section>
    )
  }
)

MyTableControls.displayName = 'MyTableControls'
