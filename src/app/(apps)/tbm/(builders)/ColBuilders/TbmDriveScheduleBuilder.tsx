'use client'
import {RouteGroupCl} from '@app/(apps)/tbm/(class)/RouteGroupCl'
import {VehicleCl} from '@app/(apps)/tbm/(class)/VehicleCl'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const TbmDriveScheduleBuilder = (props: columnGetterType) => {
  const tbmDriveSchedule = props.ColBuilderExtraProps?.tbmDriveSchedule
  const tbmBase = props.ColBuilderExtraProps?.tbmBase
  const {date, userId, TbmVehicle, tbmRouteGroupId} = tbmDriveSchedule ?? {}

  return new Fields([
    {
      id: 'date',
      label: '日付',
      form: {
        ...defaultRegister,
        defaultValue: date,
        disabled: date,
      },
      type: 'date',
    },
    {
      id: 'tbmBaseId',
      label: '営業所',
      form: {
        ...defaultRegister,
        defaultValue: tbmBase?.id,
        disabled: tbmBase?.id,
      },
      forSelect: {},
    },
    {
      id: 'userId',
      label: 'ドライバ',
      form: {
        ...defaultRegister,
        defaultValue: userId,
      },
      forSelect: {
        dependenceColIds: ['tbmBaseId'],
        config: {
          where: ({latestFormData}) => {
            return {tbmBaseId: latestFormData?.tbmBaseId}
          },
          orderBy: [{id: 'asc'}],
          nameChanger(op) {
            return {...op, name: op ? [`[${op.id}]`, op.name].join(` `) : ''}
          },
        },
      },
    },

    {
      id: 'tbmVehicleId',
      label: '車両',
      form: {
        ...defaultRegister,
        defaultValue: TbmVehicle?.id,
      },
      forSelect: {
        config: VehicleCl.getVehicleForSelectConfig({}),
      },
    },
    {
      id: 'tbmRouteGroupId',
      label: '便',
      forSelect: {
        config: RouteGroupCl.getRouteGroupForSelectConfig({tbmBaseId: tbmBase?.id}),
      },
      form: {
        ...defaultRegister,
        defaultValue: tbmRouteGroupId,

        // disabled: tbmRouteGroupId,
      },
    },
    {
      id: 'remark',
      label: '備考',
      type: 'textarea',
      form: {
        style: {minWidth: 300, minHeight: 60},
      },
    },
  ])
    .customAttributes(({col}) => {
      return {...col, form: {...col.form, style: {minWidth: 240}}, search: {}}
    })
    .transposeColumns()
}
