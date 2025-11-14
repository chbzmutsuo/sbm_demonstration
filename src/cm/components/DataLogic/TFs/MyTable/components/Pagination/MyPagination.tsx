import {getPaginationPropsType} from '@cm/components/DataLogic/TFs/MyTable/hooks/useMyTableParams'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import React from 'react'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobalOrigin'

const cevronClass = `h-5 w-5 t-link onHover !t-link`
const partClasses = {
  inputGroupClass: 'row-stack gap-0   ',
  labelClass: ' text-responsive ',
  selectClass: ' onHover   w-[40px]   bg-gray-100  border rounded-sm  ',
}

import {ChevronsLeft, ChevronsRight} from 'lucide-react'
import {cn} from '@shadcn/lib/utils'

export type PaginationPropType = {
  useGlobalProps: useGlobalPropType
  getPaginationProps: getPaginationPropsType
  recordCount
  myTable
  records
  totalCount
}

const MyPagination = React.memo((props: PaginationPropType) => {
  const {useGlobalProps, getPaginationProps, totalCount} = props

  const {query, shallowAddQuery} = useGlobalProps
  const {page, take, pageCount, from, to, pageKey, skipKey, takeKey, changePage} = getPaginationProps({totalCount})

  const range = (start, end) => {
    const firstPage = end - start + 1
    if (isNaN(firstPage)) return []
    return [...Array(firstPage)]?.map((_, i) => start + i)
  }

  // paginationで典型的にみられる、最初と最後の3つのみの数値を残す仕組みを作って
  const array = range(1, pageCount)
  const activePage = array.find(number => String(number) === String(page))
  const noData = activePage === undefined && page > 1

  if (noData) return <></>

  const isInFirstPage = page === 1
  const isInLastPage = page === pageCount

  return (
    <div className={` items-end  gap-0.5  `}>
      <R_Stack className={` justify-center  gap-x-1 gap-y-0 rounded-sm  px-1  `}>
        {/* カウント
         */}
        <section className={` w-fit   p-0.5 font-normal`}>
          <R_Stack className={`text-responsive gap-0 text-sm flex-nowrap`}>
            <span className={`font-bold`}>
              {from} 〜 {to}
            </span>
            <span>/</span>
            <span>{totalCount}</span>
            <span>件</span>
          </R_Stack>
        </section>

        {/* 矢印 */}
        {totalCount > take && (
          <section className={`w-fit p-0.5  font-normal`}>
            <R_Stack className={`gap-0 flex-nowrap`}>
              <div className={partClasses.inputGroupClass}>
                <R_Stack className={`gap-0`}>
                  <ChevronsLeft
                    className={cn(cevronClass, isInFirstPage && ` pointer-events-none opacity-30`)}
                    onClick={() => changePage(page - 1)}
                  />

                  <select
                    id={`take`}
                    className={`${partClasses.selectClass} p-0`}
                    value={page}
                    onChange={e => {
                      changePage(Number(e.target.value))
                    }}
                  >
                    {array.map((number, index) => {
                      return <option key={index}>{number}</option>
                    })}
                  </select>
                  <ChevronsRight
                    className={cn(cevronClass, isInLastPage && ` pointer-events-none opacity-30`)}
                    onClick={() => changePage(page + 1)}
                  />
                </R_Stack>
              </div>
              <small>/</small>
              <small className={`ml-0.5`}>{pageCount}p</small>
            </R_Stack>
          </section>
        )}
      </R_Stack>
    </div>
  )
})
export default MyPagination
