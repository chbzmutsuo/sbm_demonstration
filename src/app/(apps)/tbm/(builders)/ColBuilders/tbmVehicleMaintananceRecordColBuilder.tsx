'use client'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const tbmVehicleMaintananceRecordColBuilder = (props: columnGetterType) => {
  const {useGlobalProps} = props
  const {tbmVehicleId} = props.ColBuilderExtraProps ?? {}
  return new Fields([
    {
      id: 'tbmVehicleId',
      label: '車両',
      form: {
        ...defaultRegister,
        defaultValue: tbmVehicleId,
        disabled: tbmVehicleId ? true : false,
      },
      forSelect: {
        config: getVehicleForSelectConfig({}),
      },
    },
    {id: 'date', label: '日付', form: {...defaultRegister}, type: 'date'},
    {id: 'title', label: '件名', form: {...defaultRegister}},
    {id: 'price', label: '料金', form: {...defaultRegister}, type: 'price'},
    {id: 'contractor', label: '依頼先業者', form: {...defaultRegister}, type: `textarea`},
    {id: 'remark', label: '備考', form: {}, type: `textarea`},
    {
      id: 'type',
      label: '区分',
      form: {...defaultRegister},
      type: 'select',
      forSelect: {
        codeMaster: TBM_CODE.VEHICLE_MAINTANANCE_RECORD_TYPE,
      },
    },
  ])
    .customAttributes(({col}) => {
      return {
        ...col,
        form: {
          ...col.form,
          style: {minWidth: 400},
        },
      }
    })
    .transposeColumns()
}
