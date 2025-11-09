import {columnGetterType} from '@cm/types/types'
import {Fields} from '@cm/class/Fields/Fields'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {colType} from '@cm/types/col-types'
export const TbmRefuelHistoryColBuilder = (props: columnGetterType) => {
  const {session} = props.useGlobalProps
  const userId = session?.id
  const {tbmVehicleId, lastOdometerEnd} = props.ColBuilderExtraProps ?? {}

  let colSource: colType[] = [
    // {id: 'tbmOperationGroupId', label: '運行', form: {}, forSelect: {}},
  ]

  if (!tbmVehicleId) {
    colSource = [
      ...colSource,
      {
        id: 'tbmVehicleId',
        label: '車両',
        form: {
          ...defaultRegister,
          defaultValue: tbmVehicleId,
          disabled: tbmVehicleId ? true : false,
        },
        forSelect: {config: getVehicleForSelectConfig({})},
      },
    ]
  }

  colSource = [
    ...colSource,
    {
      id: 'date',
      label: '日付',
      form: {
        ...defaultRegister,
        defaultValue: getMidnight(),
      },
      type: `date`,
    },

    {
      id: 'userId',
      label: 'ユーザー',
      forSelect: {},
      form: {
        defaultValue: userId,
        disabled: !!userId,
      },
    },
    {
      id: 'type',
      label: '区分',
      form: {...defaultRegister},
      forSelect: {optionsOrOptionFetcher: [`自社`, `他社`]},
    },
    {
      id: 'amount',
      label: '給油量',
      form: {
        ...defaultRegister,
      },
      type: `float`,
    },
    {
      id: 'odometer',
      label: 'オドメーター',
      form: {
        ...defaultRegister,
      },
      type: `float`,
    },
  ]

  return (
    new Fields(colSource)
      // .showSummaryInTd({convertColId: {tbmVehicleId: 'TbmVehicle.name'}})
      .customAttributes(({col}) => {
        return {...col, search: {}}
      })
      .transposeColumns()
  )
}
