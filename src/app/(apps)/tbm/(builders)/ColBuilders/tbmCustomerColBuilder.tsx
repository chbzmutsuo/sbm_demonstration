'use client'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const tbmCustomerColBuilder = (props: columnGetterType) => {
  const {date, tbmVehicleId, lastOdometerStart = 0, lastOdometerEnd = 0} = props.ColBuilderExtraProps ?? {}
  return new Fields([
    {id: 'code', label: 'コード'},
    {id: 'name', label: '名称', form: {...defaultRegister}},
    {id: 'kana', label: '読み仮名', form: {}},
    {id: 'address', label: '住所'},
    {id: 'phoneNumber', label: 'TEL'},
    {id: 'faxNumber', label: 'FAX'},
    {id: 'bankInformation', label: '〠'},
  ])
    .customAttributes(({col}) => ({...col, form: {...col?.form}}))
    .transposeColumns()
}
