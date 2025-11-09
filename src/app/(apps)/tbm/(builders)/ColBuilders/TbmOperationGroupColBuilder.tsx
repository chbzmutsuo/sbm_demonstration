'use client'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {NumHandler} from '@cm/class/NumHandler'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'

const custom_showSummaryInTd = (cols, SP, props) => {
  return cols
    .customAttributes(({col}) => ({...col, td: {...col.td, hidden: SP}}))
    .showSummaryInTd({...props, wrapperWidthPx: 160}).plain
}

export const getTbmOperationGroupBaseCols = ({session}) => [
  {
    id: 'userId',
    label: 'ドライバー',
    form: {...defaultRegister, defaultValue: session?.id},
    forSelect: {},
  },
  {
    id: 'tbmBaseId',
    label: '営業所',
    form: {...defaultRegister},
    forSelect: {},
  },
  {id: 'tbmVehicleId', label: '車両', form: {...defaultRegister}, forSelect: {}},
]

export const TbmOperationGroupColBuilder = (props: columnGetterType) => {
  const {useGlobalProps} = props
  const {session} = useGlobalProps
  const {SP} = useWindowSize()
  return new Fields([
    ...new Fields([
      //basics
      ...custom_showSummaryInTd(new Fields(getTbmOperationGroupBaseCols({session})), SP, {
        convertColId: {userId: 'User.name', tbmBaseId: 'TbmBase.name', tbmVehicleId: 'TbmVehicle.name'},
      }),
    ]).buildFormGroup({groupName: `共通`}).plain,

    //go
    ...goBackAdoptor({type: 'go', labelAffix: '行き'}).buildFormGroup({groupName: `行き`}).plain,
    ...goBackAdoptor({type: 'back', labelAffix: '帰り'}).buildFormGroup({groupName: `帰り`}).plain,

    {
      id: `tbmOperation`,
      label: ``,
      form: {hidden: true},
      td: {
        getRowColor: (value, row) => {
          const confirmed = row[`confirmed`]
          return confirmed ? `` : `#fff5dc`
        },
      },
      format: (value, row, col) => {
        const go = row.TbmOperation.find(op => op.type === 'go')
        const back = row.TbmOperation.find(op => op.type === 'back')

        return (
          <R_Stack className={` flex-nowrap items-start  text-[12px]`}>
            <GoBackDetail {...{item: go, Type: '行き'}} />
            <GoBackDetail {...{item: back, Type: '帰り'}} />
          </R_Stack>
        )
      },
    },
  ]).transposeColumns()
}

const GoBackDetail = ({item, Type}) => {
  const {id, type, tbmRouteGroupId, tbmRouteId, TbmRouteGroup, tbmRoute} = item ?? {}
  // const Type = type === 'go' ? '行き' : type === 'back' ? '帰り' : ''
  return (
    <div className={`w-[160px]`}>
      <div className={` px-2`}>
        <div>
          <span>{Type}</span>
          <span>{formatDate(item?.date, `short`)}</span>
        </div>
        {TbmRouteGroup && <div>{TbmRouteGroup?.name}</div>}
        {item?.distanceKm && <div>{NumHandler.toPrice(item?.distanceKm) + '(km)'}</div>}
      </div>
    </div>
  )
}

export const goBackAdoptor = ({type, labelAffix}) => {
  return new Fields([
    {
      id: 'date',
      label: '日時',
      form: {},
      type: `date`,
    },
    {
      id: 'tbmRouteGroupId',
      label: 'コース',
      form: {},
      forSelect: {
        dependenceColIds: [`tbmBaseId`],
        config: {
          modelName: `tbmRouteGroup`,
          where: props => ({tbmBaseId: props.latestFormData.tbmBaseId ?? 0}),
        },
      },
    },
    {id: 'distanceKm', label: 'オドメーター', form: {}, type: `float`},
  ]).customAttributes(({col}) => ({
    ...col,
    form: {
      ...col.form,
      defaultValue: ({formData, col}) => {
        let data = formData?.TbmOperation?.find(op => op.type === type)?.[col.id.replace(`${type}_`, '')]

        if (!data) {
          data = formData?.[col.id.replace(`${type}_`, '')]
        }

        return data
      },
    },
    td: {hidden: true},
    label: `${col.label}[${labelAffix}]`,
    id: `${type}_${col.id}`,
  }))
}
