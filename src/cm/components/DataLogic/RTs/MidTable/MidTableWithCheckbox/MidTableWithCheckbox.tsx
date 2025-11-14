import {NoData} from 'src/cm/components/styles/common-components/common-components'
import useMidTableProps, {MidTableProps} from 'src/cm/components/DataLogic/RTs/MidTable/useMidTableProps'
import { Button } from '@cm/components/styles/common-components/Button'

export default function MidTableWithCheckbox(props: MidTableProps) {
  const {
    originalProps: {table, keysToShow},
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

  return (
    <div className={` relative min-w-[320px] `}>
      {/* 矢印 */}

      <section className={`row-stack items-start justify-between gap-0`}>
        {/* 左側のテーブル */}

        <Table
          {...{
            setlinkedData,
            GROUPED_LIST_OBJECT,

            linkedData,
            table,
            handleToggle,
            keysToShow,
          }}
        />
      </section>

      <section className={` row-stack  mt-2 justify-end`}>
        <Button color="sub" type="button" onClick={handleConfirm}>
          確定
        </Button>
      </section>
    </div>
  )
}

const Table = ({
  setlinkedData,
  GROUPED_LIST_OBJECT,

  linkedData,
  table,
  handleToggle,
  keysToShow,
}) => {
  return <></>
}
