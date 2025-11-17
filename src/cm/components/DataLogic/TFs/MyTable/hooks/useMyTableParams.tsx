import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {P_Query} from 'src/cm/class/PQuery'
import {MouseSensor, useSensor, useSensors} from '@dnd-kit/core'
import {arrayMove} from '@dnd-kit/sortable'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {useCallback, useEffect, useRef, useMemo} from 'react'
import {getMyTableId} from '@cm/components/DataLogic/TFs/MyTable/helpers/getMyTableId'
import {PrismaModelNames} from '@cm/types/prisma-types'

// 型定義を改善
export interface getPaginationPropsType {
  (props: {totalCount: number}): {
    tableId: string
    totalCount: number
    page: number
    skip: number
    take: number
    pageCount: number
    from: number
    to: number
    pageKey: string
    skipKey: string
    takeKey: string
    changePage: (pageNumber: number) => void
    changeDataPerPage: (e: any, page: number) => void
  }
}

interface UseMyTableParamsProps {
  columns: any[]
  dataModelName: PrismaModelNames
  useGlobalProps: {
    query: any
    addQuery: any
    shallowAddQuery: any
  }
  myTable: any
  records: any[]
  setrecords: (records: any[]) => void
}

interface UseMyTableParamsReturn {
  columnCount: number
  tableStyle: React.CSSProperties
  tableStyleRef: React.RefObject<any>
  methods: {
    getPaginationProps: getPaginationPropsType
    handleDragEndMemo: (event: any) => Promise<any>
  }
  dndProps: {
    items: any[]
    setitems: (records: any[]) => void
    sensors: any
  }
}

// ページネーション計算を分離
const calcPaginationInfo = (totalCount: number, page: number, take: number) => {
  const pageCount = Math.ceil(totalCount / take)
  const from = (page - 1) * take + 1
  const to = Math.min(from + take - 1, totalCount)
  return {pageCount, from, to}
}

// skip計算を分離
const calcSkip = (page: number, take: number): number => (page - 1) * take

// transactionQueryList作成を分離
const createTransactionQueryList = (
  switchedItemsInOrder: any[],
  dataModelName: PrismaModelNames
): transactionQuery<any, any>[] => {
  return switchedItemsInOrder.map((item, idx) => ({
    model: dataModelName,
    method: 'update',
    queryObject: {
      where: {id: item?.id},
      data: {sortOrder: Number(idx)},
    },
  }))
}

const useMyTableParams = ({
  columns,
  dataModelName,
  useGlobalProps,
  myTable,
  records,
  setrecords,
}: UseMyTableParamsProps): UseMyTableParamsReturn => {
  const {query, shallowAddQuery} = useGlobalProps

  const columnCount = columns ? Math.max(...columns.map((row: any) => Number(row.length))) : 0

  const tableId = getMyTableId({dataModelName, myTable})

  const tableStyleRef = useRef<any>(null)

  // myTable?.styleが変更された時のみ再計算
  const tableStyle = useMemo(() => {
    const newWidth = myTable?.style?.width ?? 'fit-content'
    const newHeight = myTable?.style?.height ?? 'fit-content'

    return {
      ...myTable?.style,
      width: newWidth,
      height: newHeight,
      margin: '0px auto',
      maxHeight: myTable?.style?.maxHeight,
      maxWidth: myTable?.style?.maxWidth ?? '90vw',
      overflow: 'auto',
    }
  }, [myTable?.style])

  const items = records
  const setitems = setrecords

  // recordsが変更されたときの同期処理
  useEffect(() => {
    setitems(records)
  }, [records, setitems])

  const handleDragEndMemo = useCallback(
    async (event: any) => {
      const {active, over} = event
      if (active.id !== over?.id) {
        const oldIndex = items.findIndex((item: any) => item.id === active?.id)
        const newIndex = items.findIndex((item: any) => item.id === over?.id)

        const switchedItemsInOrder = arrayMove(items, oldIndex, newIndex)
        setrecords(switchedItemsInOrder)

        const transactionQueryList = createTransactionQueryList(switchedItemsInOrder, dataModelName)

        const res = await doTransaction({transactionQueryList})
        setitems(switchedItemsInOrder)
        return res
      }
    },
    [items, dataModelName, setrecords, setitems]
  )

  // 設定が変わらない限り再作成不要
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  )

  const getPaginationProps: getPaginationPropsType = useCallback(
    props => {
      const {page, skip, take} = P_Query.getPaginationPropsByQuery({
        tableId: tableId,
        query,
        countPerPage: myTable?.pagination?.countPerPage,
      })
      const {totalCount} = props

      const {pageCount, from, to} = calcPaginationInfo(totalCount, page, take)

      const pageKey = `${tableId}_P`
      const skipKey = `${tableId}_S`
      const takeKey = `${tableId}_T`

      const changePage = (pageNumber: number) => {
        const newQuery = {
          ...query,
          [pageKey]: pageNumber,
          [skipKey]: calcSkip(pageNumber, take),
        }

        shallowAddQuery(newQuery)
      }

      const changeDataPerPage = (e: any, page: number) => {
        const newTake = e.target.value
        const countPerPage = myTable?.pagination?.countPerPage
        const newQuery = {
          ...query,
          [pageKey]: 1,
          [takeKey]: newTake,
          [skipKey]: calcSkip(1, countPerPage),
        }
        shallowAddQuery(newQuery)
      }

      return {
        tableId,
        totalCount,
        page,
        skip,
        take,
        pageCount,
        from,
        to,
        pageKey,
        skipKey,
        takeKey,
        changePage,
        changeDataPerPage,
      }
    },
    [tableId, query, myTable?.pagination?.countPerPage, shallowAddQuery]
  )

  return {
    columnCount,
    tableStyle,
    tableStyleRef,
    methods: {
      getPaginationProps,
      handleDragEndMemo,
    },
    dndProps: {items, setitems, sensors},
  }
}

export default useMyTableParams
