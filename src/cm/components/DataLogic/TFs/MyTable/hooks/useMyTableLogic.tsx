import {useRef, useMemo, useCallback} from 'react'
import {getMyTableDefault} from 'src/cm/constants/defaults'
import {useElementScrollPosition} from '@cm/hooks/scrollPosition/useElementScrollPosition'
import {useSearchHandler} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/useSearchHandler'
import {Z_INDEX} from '@cm/lib/constants/constants'

import {TableConfigPropsType} from '../components/TableConfig'

import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import useMyTableParams from '@cm/components/DataLogic/TFs/MyTable/hooks/useMyTableParams'
import {MyTableControls} from '@cm/components/DataLogic/TFs/MyTable/components/MyTableControls/MyTableControls'

import {colType} from '@cm/types/col-types'
import {DraggableTableRow} from '@cm/components/DataLogic/TFs/MyTable/components/MainTable/DraggableTableRow'
import {cl} from '@cm/lib/methods/common'
import {ArrowUpDownIcon, SquarePen, Trash2} from 'lucide-react'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {HREF} from '@cm/lib/methods/urls'

import {FileHandler} from '@cm/class/FileHandler'
import {toastByResult} from '@cm/lib/ui/notifications'
import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

interface MyTableLogicProps {
  ClientProps2: ClientPropsType2 & {
    UseRecordsReturn?: UseRecordsReturn
  }
}

export const TrActionIconClassName = `onHover`
export const useMyTableLogic = (props: MyTableLogicProps) => {
  const ClientProps2 = useMemo(
    () => ({
      ...props.ClientProps2,
      myTable: {...getMyTableDefault(), ...props.ClientProps2.myTable},
      useGlobalProps: props.ClientProps2?.useGlobalProps,
    }),
    [props.ClientProps2]
  )

  const {
    editType = {
      type: 'modal',
    },
    columns,
    dataModelName,
    setformData,
    myTable,
    formData,
    useGlobalProps,
    records,
    setrecords,
    deleteRecord,
  } = ClientProps2

  const {toggleLoad, query, pathname, rootPath, addQuery} = useGlobalProps
  // 🔧 無限スクロール関連のデータを分離
  const infiniteScrollData = useMemo(() => {
    const {fetchNextPage, hasMore, isInfiniteScrollMode, setInfiniteScrollMode} = ClientProps2.UseRecordsReturn || {}

    return {
      fetchNextPage: fetchNextPage || (() => Promise.resolve()),
      hasMore: hasMore || false,
      isInfiniteScrollMode: isInfiniteScrollMode || false,
      setInfiniteScrollMode,
    }
  }, [ClientProps2.UseRecordsReturn])

  // 🔧 テーブル関連のデータを分離
  const tableData = useMemo(() => {
    const recordCount = records?.length ?? 0
    const totalCount = ClientProps2.totalCount ?? 0
    const {configPosition = 'top', showHeader} = myTable ?? {}

    const emptyDataStyle = {
      width: myTable?.style?.width,
      minWidth: myTable?.style?.minWidth,
      margin: 'auto',
    }

    return {
      records,
      recordCount,
      totalCount,
      configPosition,
      showHeader,
      emptyDataStyle,
    }
  }, [records, ClientProps2.totalCount, myTable])

  // 🔧 MyTableParams関連
  const myTableParamsArgs = useMemo(
    () => ({
      columns,
      dataModelName,
      useGlobalProps,
      myTable,
      records,
      setrecords,
    }),
    [columns, dataModelName, useGlobalProps, myTable, records, setrecords]
  )

  const {
    columnCount,
    tableStyleRef,
    tableStyle,
    methods: {getPaginationProps, handleDragEndMemo},
    dndProps: {items, sensors},
  } = useMyTableParams(myTableParamsArgs)

  // 🔧 TrActions関連
  const trActionsArgs = useMemo(
    () => ({
      records,
      setrecords,
      deleteRecord,
      setformData,
      columns,
      editType,
      myTable,
      dataModelName,
      useGlobalProps,
    }),
    [records, setrecords, deleteRecord, setformData, columns, editType, myTable, dataModelName, useGlobalProps]
  )

  const handleTrashItem = useCallback(
    async ({record, columns}) => {
      let deleteConfirmed = false

      if (confirm(`削除しますか？`)) {
        if (prompt(`本当に削除する場合、「削除」と入力してください。`) === `削除`) {
          deleteConfirmed = true
        }
      }

      if (deleteConfirmed) {
        // toggleLoad(async () => {
        const deleteImageUrls = columns
          .flat()
          .filter(col => col?.type === 'file')
          .map(col => {
            const {id} = col
            const backetKey = col?.form?.file?.backetKey

            return {id, backetKey, deleteImageUrl: record[col.id]}
          })

        await Promise.all(
          deleteImageUrls.map(async obj => {
            const {id, deleteImageUrl, backetKey} = obj
            await FileHandler.sendFileToS3({
              file: null,
              formDataObj: {
                bucketKey: `${backetKey}/${id}`,
                deleteImageUrl,
              },
            })
          })
        )

        const res = await generalDoStandardPrisma(dataModelName, 'delete', {where: {id: record?.id}})
        toastByResult(res)
        if (res.success) {
          deleteRecord({record})
        }
        // })
      } else {
        alert('キャンセルしました')
      }
    },
    [setformData, useGlobalProps, editType, myTable, dataModelName, columns, setrecords, deleteRecord, myTable]
  )

  // 🔧 スクロール関連
  const tableId = useMemo(() => ['table', dataModelName, myTable?.tableId].join('_'), [dataModelName, myTable?.tableId])
  const elementRef = useRef<HTMLDivElement>(null)

  useElementScrollPosition({
    elementRef,
    scrollKey: tableId,
  })

  const {SearchingStatusMemo} = useSearchHandler({
    columns: ClientProps2.columns,
    dataModelName: ClientProps2.dataModelName,
    useGlobalProps: ClientProps2.useGlobalProps,
  })

  const TableConfigProps: TableConfigPropsType = {
    columns,
    myTable,
    dataModelName,
    useGlobalProps,
    records,
    setformData,
    configPosition: tableData.configPosition,
    getPaginationProps,
    columnCount,
  }

  const rows = ClientProps2.columns
    .filter(cols => {
      return cols.reduce((prev, col) => prev || !col?.td?.hidden, false)
    })
    .map(row => {
      return row.map(col => {
        const withLabel = tableData.showHeader ? false : true
        return {...col, td: {...col.td, withLabel}}
      })
    })

  const mainTableProps = {
    myTable,
    columns,
    elementRef,
    tableStyleRef,
    tableStyle,
    sensors,
    handleDragEndMemo,
    items,
    showHeader: tableData.showHeader,
    TableConfigProps,
    useGlobalProps,
    ClientProps2,
    rows,
    getPaginationProps,
  }

  const paginationProps = {
    totalCount: ClientProps2.totalCount,
    recordCount: tableData.recordCount,
    myTable,
    getPaginationProps,
    useGlobalProps,
    records,
  }

  const sectionStyle = {
    maxWidth: '90%',
    zIndex: Z_INDEX.thead,
  }

  const {isInfiniteScrollMode, setInfiniteScrollMode, hasMore} = infiniteScrollData

  const MyTableControlsCallback = useCallback(
    () => (
      <MyTableControls
        {...{
          SearchingStatusMemo,
          TableConfigProps,
          ClientProps2,
          isInfiniteScrollMode,
          setInfiniteScrollMode,
          recordCount: tableData.recordCount,
          totalCount: tableData.totalCount,
          hasMore,
          mainTableProps,
          paginationProps,
          sectionStyle,
          getPaginationProps: mainTableProps.getPaginationProps,
          myTable: ClientProps2.myTable,
        }}
      />
    ),
    [
      tableData,
      SearchingStatusMemo,
      TableConfigProps,
      ClientProps2,
      isInfiniteScrollMode,
      setInfiniteScrollMode,
      hasMore,
      mainTableProps,
      paginationProps,
      sectionStyle,
      mainTableProps.getPaginationProps,
      ClientProps2.myTable,
    ]
  )

  const handleEditItem = useCallback(
    async ({record}) => {
      if (editType?.type === 'page') {
        return
      } else if (editType?.type === 'pageOnSame') {
        return
      } else if (editType?.type === 'modal') {
        setformData(record)
        return ''
      }
    },
    [editType, setformData]
  )

  const EditButton = useCallback(
    ({record}) => {
      if (myTable?.update !== false) {
        const {pathnameBuilder} = editType ?? {}
        const redirectPath = pathnameBuilder?.({rootPath, record, pathname})
        const className = cl('text-primary-main', TrActionIconClassName, `w-5`)
        if (editType?.type === `modal`) {
          return (
            <div {...{className, onClick: () => handleEditItem({record})}}>
              <SquarePen className={`w-5`} />
            </div>
          )
        } else {
          const href = (editType?.type === 'page' ? redirectPath : HREF(`${pathname}/${record.id}`, {}, query)) ?? ''

          return (
            <T_LINK {...{className, href}}>
              <SquarePen className={`w-5`} />
            </T_LINK>
          )
        }
      }

      return null
    },
    [editType, pathname, rootPath, addQuery, myTable]
  )

  const DeleteButton = useCallback(
    ({record}) => {
      if (myTable?.delete !== false) {
        return (
          <div onClick={() => handleTrashItem({record, columns})}>
            <Trash2 className={cl('text-error-main  opacity-60', TrActionIconClassName, `w-5 `)} />
          </div>
        )
      }
      return null
    },
    [handleTrashItem, myTable, columns]
  )

  const DragButton = useCallback(({dndProps, isDragging}) => {
    if (dndProps) {
      return <ArrowUpDownIcon className={`w-4 onHover ${isDragging ? 'text-blue-600' : ''}`} />
    }

    return null
  }, [])

  const RowActionButtonList = useCallback(
    ({record}) => {
      const ActionButtonObject = myTable.AdditionalActionButtonObject ?? {}

      return (
        <>
          {Object?.keys(ActionButtonObject)?.map(key => {
            return <div key={key}>{ActionButtonObject[key]({record})}</div>
          })}
        </>
      )
    },
    [myTable.AdditionalActionButtonObject]
  )

  const DraggableTableRowCallBack = useCallback(
    (props: {record: any; recIdx: number; rows: colType[][]}) => {
      return (
        <DraggableTableRow
          key={props.record.id}
          {...{
            record: props.record,
            recIdx: props.recIdx,
            rows: props.rows,
            myTable,
            ClientProps2,
            getPaginationProps,
            useGlobalProps,
            Components: {
              EditButton,
              DeleteButton,
              DragButton,
              RowActionButtonList,
            },
          }}
        />
      )
    },
    [myTable, ClientProps2, getPaginationProps, RowActionButtonList, useGlobalProps]
  )

  const useMyTableLogicReturn = {
    ClientProps2,
    infiniteScrollData,
    tableData,
    searchData: {SearchingStatusMemo},
    elementRef,
    mainTableProps,
    Components: {
      MyTableControlsCallback,
      DraggableTableRowCallBack,
      EditButton,
      DeleteButton,
      RowActionButtonList,
    },
  }

  return useMyTableLogicReturn
}
