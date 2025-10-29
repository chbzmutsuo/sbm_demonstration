'use client'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const UserColBuilder = (props: columnGetterType) => {
  const {tbmBaseId} = props.ColBuilderExtraProps ?? {}
  return new Fields([
    {id: 'tbmBaseId', label: '営業所', forSelect: {}, form: {...defaultRegister, defaultValue: tbmBaseId}},
    {id: 'code', label: '社員コード', form: {}},
    {id: 'name', label: '名称', form: {...defaultRegister}, search: {}},
    {id: 'email', label: 'Email', form: {}},
    {id: 'password', label: 'パスワード', type: `password`, form: {}},

    {
      id: 'type',
      label: '区分',
      forSelect: {codeMaster: TBM_CODE.USER_TYPE},
      form: {defaultValue: `01`, ...defaultRegister},
    },
    {id: 'phone', label: '携帯番号', form: {}},
    // {id: 'tbmVehicleId', label: '利用車両', forSelect: {}, form: {defaultValue: tbmBaseId}},

    // {
    //   id: 'tbmVehicleId',
    //   label: '利用車両',
    //   form: {},
    //   forSelect: {config: getVehicleForSelectConfig({tbmBaseId})},
    // },
  ]).transposeColumns()
}
// 社員コード	運転手	携帯番号	所属営業所
