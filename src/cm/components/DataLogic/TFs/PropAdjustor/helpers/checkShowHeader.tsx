import {Fields} from '@cm/class/Fields/Fields'
import {MyTableType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {ClientPropsType} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// 型定義を追加
interface UpdateMyTableProps {
  ClientProps: ClientPropsType
  columns: colType[][]
}

export const checkShowHeader = (props: {myTable: MyTableType; columns: colType[][]}): boolean => {
  const {myTable, columns} = props

  const noColHasLabel = columns?.flat()?.every(col => {
    const showLabel = Fields.doShowLabel(col)
    return !showLabel
  })

  return !!(myTable?.header ?? noColHasLabel)
}

// export function updateMyTable({ClientProps, columns}: UpdateMyTableProps): MyTableType {
//   const {displayStyle} = ClientProps
//   const showHeader = checkShowHeader({myTable: ClientProps.myTable, columns})

//   const myTable: MyTableType = {
//     ...ClientProps.myTable,
//     style: {
//       ...displayStyle,
//       ...ClientProps.myTable?.style,
//     },
//     showHeader,
//   }

//   // 副作用を明示的に記述
//   ClientProps.myTable = myTable
//   return myTable
// }
