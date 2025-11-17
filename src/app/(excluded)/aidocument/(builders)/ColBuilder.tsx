'use client'

import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export class ColBuilder {
  static user = (props: columnGetterType) => {
    return new Fields([
      {id: 'name', label: '名称', form: {...defaultRegister}},
      {id: 'email', label: 'Email', form: {...defaultRegister}},
      {id: 'password', label: 'パスワード', type: `password`, form: {...defaultRegister}},
      {
        id: 'aidocumentCompanyId',
        label: '所属',
        forSelect: {
          config: {
            modelName: 'aidocumentCompany',
            where: {type: 'self'},
          },
        },
        form: {...defaultRegister},
      },
    ]).transposeColumns()
  }

  static aidocumentCompany = (props: columnGetterType) => {
    return new Fields([
      {id: 'name', label: '企業名', form: {...defaultRegister}},
      {
        id: 'type',
        label: '企業種別',
        forSelect: {
          optionsOrOptionFetcher: [
            {value: 'self', label: '自社'},
            {value: 'client', label: '取引先（発注者）'},
            {value: 'subcontractor', label: '下請け'},
          ],
        },
        form: {...defaultRegister},
      },
      {id: 'representativeName', label: '代表者名', form: {...defaultRegister}},
      {id: 'address', label: '住所', type: 'textarea', form: {...defaultRegister}},
      {id: 'phone', label: '電話番号', form: {...defaultRegister}},
    ]).transposeColumns()
  }
}
