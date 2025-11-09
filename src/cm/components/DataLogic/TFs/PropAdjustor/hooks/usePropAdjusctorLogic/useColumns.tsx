import {colType} from '@cm/types/col-types'
import {dynamicMasterModel} from '@cm/class/builders/ColBuilderVariables'
import {PrismaModelNames} from '@cm/types/prisma-types'

// 型定義を追加
interface UseColumnsProps {
  useGlobalProps: any
  UseRecordsReturn: any
  dataModelName: PrismaModelNames
  ColBuilder?: any
  ColBuilderExtraProps?: any
}

// columnGetMethod取得を分離
const getColumnGetMethod = (ColBuilder: any, dataModelName: PrismaModelNames) => {
  return ColBuilder?.[dataModelName] ?? ColBuilder?.['dynamicMasterModel'] ?? dynamicMasterModel
}

export const useColumns = ({
  useGlobalProps,
  UseRecordsReturn,
  dataModelName,
  ColBuilder,
  ColBuilderExtraProps,
}: UseColumnsProps): colType[][] => {
  const columnGetMethod = getColumnGetMethod(ColBuilder, dataModelName)

  return columnGetMethod({
    useGlobalProps,
    ColBuilderExtraProps: {...ColBuilderExtraProps, UseRecordsReturn},
    transposeColumnsOptions: {},
    dataModelName,
  })
}

export default useColumns
