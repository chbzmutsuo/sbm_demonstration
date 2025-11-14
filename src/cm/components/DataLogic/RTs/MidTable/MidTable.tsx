'use client'
import MidTableDataList, {TableProps} from './MidTableDataList'

import {NoData} from 'src/cm/components/styles/common-components/common-components'
import useMidTableProps, {MidTableProps} from 'src/cm/components/DataLogic/RTs/MidTable/useMidTableProps'
import {Button} from '@cm/components/styles/common-components/Button'

export default function MidTable(props: MidTableProps) {
  const {
    originalProps: {table, keysToShow, groupBy},
    extraProps: {
      GROUPED_LIST_OBJECT,
      parentId,
      linkedData,
      setlinkedData,
      setotherData,
      handler: {handleToggle, handleConfirm},
    },
  } = useMidTableProps(props)

  if (!parentId) {
    return <NoData>親となるデータ作成後に利用できます</NoData>
  }
  const tableProps: TableProps = {
    GROUPED_LIST_OBJECT,
    setlinkedData,
    linkedData,
    setotherData,
    table,
    handleToggle,
    keysToShow,
    groupBy,
  }

  return (
    <>
      <div className={` relative min-w-[320px] `}>
        {/* 矢印 */}

        {/* 左側のテーブル */}
        <section className={`row-stack items-start justify-between gap-0`}>
          <div className={`w-1/2 min-w-[150px] p-[4px]`}>
            <MidTableDataList {...{...tableProps, type: 'linked'}} />
          </div>

          <div className={`w-1/2 min-w-[150px] p-[4px]`}>
            <MidTableDataList {...{...tableProps, type: 'other'}} />
          </div>
        </section>

        <section className={` row-stack  mt-2 justify-end`}>
          <Button color="sub" type="button" onClick={handleConfirm}>
            確定
          </Button>
        </section>
      </div>
    </>
  )
}
