import {Fields} from '@cm/class/Fields/Fields'
import {MyTableType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {useMemo} from 'react'

// 型定義を追加
interface UseMyTableProps {
  displayStyle: any
  columns: colType[][]
  myTable: MyTableType
}

export const checkShowHeader = (props: {myTable: MyTableType; columns: colType[][]}): boolean => {
  const {myTable, columns} = props

  const noColHasLabel = columns?.flat()?.every(col => {
    const showLabel = Fields.doShowLabel(col)
    return !showLabel
  })

  return !!(myTable?.header ?? noColHasLabel)
}

export default function useMyTable({displayStyle, columns, myTable}: UseMyTableProps) {
  // ✅ 重い計算処理（配列操作）なのでメモ化有効
  const showHeader = useMemo(() => checkShowHeader({myTable, columns}), [myTable, columns])

  // ✅ オブジェクト作成なのでメモ化有効
  return useMemo(
    () => ({
      ...myTable,
      style: {...displayStyle, ...myTable?.style},
      showHeader,
    }),
    [myTable, displayStyle, showHeader]
  )
}
